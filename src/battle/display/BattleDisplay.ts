/// <reference path="../../declarations/pixi.js.d.ts"/>

import Game from '../../Game';
import Vector2D from '../../util/Vector2D';
import InputManager from '../../interface/InputManager';
import Globals from '../../Globals';
import Battle from '../Battle';
import Unit from '../Unit';
import GameEvent from '../../events/GameEvent';

import UnitDisplay from './UnitDisplay';
import LevelDisplay from './LevelDisplay';

import ElementList from '../../interface/ElementList';
import AttachInfo from '../../interface/AttachInfo';
import TextElement from '../../interface/TextElement';

export default class BattleDisplay extends PIXI.Container {
	private _unitContainer:PIXI.Container = new PIXI.Container();
	private _unitDisplays:Array<UnitDisplay> = [];
	private _levelDisplay:LevelDisplay = null;
	private mouseGridX:number = Number.NEGATIVE_INFINITY;
	private mouseGridY:number = Number.NEGATIVE_INFINITY;
	private hoveredUnitDisplay:UnitDisplay = null;
	private _battle:Battle;
	private debugPanel:ElementList;

	get battle():Battle { return this._battle;}
	get levelDisplay():LevelDisplay { return this._levelDisplay; }
	get hoverCoords():Vector2D { return new Vector2D(this.mouseGridX, this.mouseGridY); }

	constructor() {
		super();
	}

	public init(battle:Battle) {
		this._battle = battle;
		this.addChild(this._unitContainer);
		Game.instance.updater.add(this);
		battle.addEventListener(GameEvent.types.battle.ANIMATIONSTART, this.onAnimation);
		battle.addEventListener(GameEvent.types.battle.ANIMATIONCOMPLETE, this.onAnimation);
		battle.addEventListener(GameEvent.types.battle.UNITSELECTIONCHANGED, this.onUnitSelectionChanged);
	}

	public setLevelDisplay(display:LevelDisplay) {
		if (this._levelDisplay) {
			//dispose of it somehow
		}

		this._levelDisplay = display;
		this.addChildAt(display, 0); //want it below units, obviously
	}

	public addUnitDisplay(display:UnitDisplay) {
		this._unitContainer.addChild(display);
		if (this._unitDisplays.indexOf(display) == -1) {
			this._unitDisplays.push(display);
		}
	}

	public removeUnitDisplay(display:UnitDisplay) {
		if (display.parent == this._unitContainer) {
			this._unitContainer.removeChild(display);
		}

		var index = this._unitDisplays.indexOf(display);
		if (index > -1) {
			this._unitDisplays.splice(index, 1);
		}
	}

	public update(timeElapsed:number) {
		//check mouse position, and highlight things
		var mouseCoords = InputManager.instance.mouseCoords;
		var gridCoords = this.viewToGrid(mouseCoords);

		if (gridCoords.x != this.mouseGridX || gridCoords.y != this.mouseGridY) {
			this.mouseGridX = gridCoords.x;
			this.mouseGridY = gridCoords.y;
			this.updateHover();
		}
	}

	public onLeftClick(coords:Vector2D) {
		var unitClicked = false;

		for (var display of this._unitDisplays) {
			if (display.getBounds().contains(coords.x, coords.y)) {
				display.onClick();
				unitClicked = true;
			}
		}

		if (!unitClicked) {
			this._battle.deselectUnit();
		}

		this.updateDebugPanel();
	}

	public onRightClick(coords:Vector2D) {
		var gridCoords = this.viewToGrid(coords);
		this._battle.rightClickTile(gridCoords.x, gridCoords.y);

		this.updateDebugPanel();
	}

	/**
	 * Returns the grid coordinates corresponding to the provided viewspace coordinates
	 */
	public viewToGrid(coords:Vector2D):Vector2D {
		coords = coords.clone();
		coords.x = Math.floor(((coords.x - this.x) / this.scale.x) / Globals.gridSize);
		coords.y = Math.floor(((coords.y - this.y) / this.scale.y) / Globals.gridSize);
		return coords;
	}

	private updateHover() {
		var x = this.mouseGridX;
		var y = this.mouseGridY;

		this.levelDisplay.clearPath();

		if (this.hoveredUnitDisplay) {
			this.hoveredUnitDisplay.onMouseOut();
		}

		for (var display of this._unitDisplays) {
			if (display.unit.x == x && display.unit.y == y) {
				this.hoveredUnitDisplay = display;
				display.onMouseOver();
				break;
			}
		}

		this.updatePathingHover();
		this.updateDebugPanel();
	}

	public updateDebugPanel() {
		var items = this.battle.getDebugPanelStrings();

		if (!this.debugPanel) {
			this.debugPanel = new ElementList(200, ElementList.VERTICAL, 5, ElementList.RIGHT);
			Game.instance.interfaceRoot.addDialog(this.debugPanel);
			this.debugPanel.attachToParent(AttachInfo.TRtoTR);
		}

		this.debugPanel.beginBatchChange();

		//remove excess
		while (this.debugPanel.numChildren > items.length) {
			this.debugPanel.removeChild(this.debugPanel.getLastChild());
		}

		//add as needed
		while (this.debugPanel.numChildren < items.length) {
			var text:TextElement = new TextElement("aaa", TextElement.basicText);
			this.debugPanel.addChild(text);
		}

		//set them all
		for (var i = 0; i < items.length; i++) {
			(this.debugPanel.children[i] as TextElement).text = items[i];
		}

		this.debugPanel.endBatchChange();
	}

	public updatePathingDisplay() {
		this.levelDisplay.clearPathing();
		if (this._battle.animating) return;

		var unit = this.battle.selectedUnit;
		if (unit && (unit.canAct() || !this.battle.ownUnitSelected())) {
			if (this.battle.ownUnitSelected()) {
				if (unit.actionsRemaining == 1) {
					//show pathing in a different color, and only show red on tiles attackable from current position
					this.levelDisplay.showPathing(unit.pathableTiles, 0xffff00);
					var attackable = unit.getAttackableTiles(unit.x, unit.y).getComplement(unit.pathableTiles);
					this.levelDisplay.showPathing(attackable, 0xff0000);
				} else {
					//show everywhere the unit could move, and attackable tiles outside that range
					this.levelDisplay.showPathing(unit.pathableTiles, 0x0000ff);
					this.levelDisplay.showPathing(unit.getAttackableNonWalkableTiles(), 0xff0000);
				}
			} else {
				//show everywhere this unit could attack
				this.levelDisplay.showPathing(unit.attackableTiles, 0xff0000);
			}
		}
	}

	public updatePathingHover() {
		this.levelDisplay.clearPath();
		if (this._battle.animating) return;

		var x = this.mouseGridX;
		var y = this.mouseGridY;

		if (this.battle.ownUnitSelected()) {
			var unit: Unit = this.battle.selectedUnit;
			if (unit.canAct() && (unit.x != x || unit.y != y)) {
				if (unit.canReachTile(x, y)) {
					this.levelDisplay.showPath(unit.getPathToPosition(x, y));
				} else {
					var tileUnit = this.battle.getUnitAtPosition(x, y);
					if (tileUnit && unit.isHostileToUnit(tileUnit)) {
						if (!unit.inRangeToAttack(tileUnit) && unit.actionsRemaining > 1) {
							var pos = unit.getPositionToAttackUnit(tileUnit);
							if (pos) {
								this.levelDisplay.showPath(unit.getPathToPosition(pos[0], pos[1]));
							}
						}
					}
				}
			}
		}
	}

	private onAnimation = (e:GameEvent) => {
		console.log("Update it!");
		this.updatePathingDisplay();
		this.updatePathingHover();
	}

	private onUnitSelectionChanged = (e:GameEvent) {
		this.updatePathingDisplay();
		this.updatePathingHover();
	}
}