/// <reference path="../../declarations/pixi.js.d.ts"/>

import Game from '../../Game';
import Vector2D from '../../util/Vector2D';
import InputManager from '../../interface/InputManager';
import Globals from '../../Globals';
import Battle from '../Battle';
import Unit from '../Unit';
import GameEvent from '../../events/GameEvent';
import * as TextUtil from '../../util/TextUtil'
import Tween from '../../util/Tween';

import UnitDisplay from './UnitDisplay';
import LevelDisplay from './LevelDisplay';

import ElementList from '../../interface/ElementList';
import AttachInfo from '../../interface/AttachInfo';
import TextElement from '../../interface/TextElement';
import PathingDisplay from './PathingDisplay';
import SparseGrid from '../../ds/SparseGrid';

export default class BattleDisplay extends PIXI.Container {
	private _unitContainer:PIXI.Container = new PIXI.Container();
	private _unitDisplays:Array<UnitDisplay> = [];
	private _levelDisplay:LevelDisplay = null;
	private mouseGridX:number = Number.NEGATIVE_INFINITY;
	private mouseGridY:number = Number.NEGATIVE_INFINITY;
	private hoveredUnitDisplay:UnitDisplay = null;
	private _battle:Battle;
	private debugPanel:ElementList;

	public pathingDisplay = new PathingDisplay();

	get battle():Battle { return this._battle;}
	get levelDisplay():LevelDisplay { return this._levelDisplay; }
	get hoverCoords():Vector2D { return new Vector2D(this.mouseGridX, this.mouseGridY); }

	constructor() {
		super();
	}

	public init(battle:Battle) {
		this._battle = battle;
		this.addChild(this.pathingDisplay);
		this.addChild(this._unitContainer);
		Game.instance.updater.add(this);

		battle.addEventListener(GameEvent.types.battle.ANIMATIONSTART, this.onAnimation);
		battle.addEventListener(GameEvent.types.battle.ANIMATIONCOMPLETE, this.onAnimation);
		battle.addEventListener(GameEvent.types.battle.UNITSELECTIONCHANGED, this.onUnitSelectionChanged);

		Game.instance.updater.add(this.pathingDisplay);
	}

	public cleanup() {
		for (var unitDisplay of this._unitDisplays) {
			unitDisplay.cleanup();
		}
		this._levelDisplay.cleanup();
		this._unitContainer.destroy({children:true});

		if (this.parent) this.parent.removeChild(this);

		if (this.debugPanel) {
			this.debugPanel.removeSelf();
		}

		Game.instance.updater.remove(this);
		this._battle.removeEventListener(GameEvent.types.battle.ANIMATIONSTART, this.onAnimation);
		this._battle.removeEventListener(GameEvent.types.battle.ANIMATIONCOMPLETE, this.onAnimation);
		this._battle.removeEventListener(GameEvent.types.battle.UNITSELECTIONCHANGED, this.onUnitSelectionChanged);

		Game.instance.updater.remove(this.pathingDisplay);
		this.pathingDisplay.destroy();
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

		//Move the camera with the arrow keys
		//Moving the camera one way is the same as moving this the other way
		var moveAmount = Math.round(500 * timeElapsed);
		if (InputManager.instance.isKeyDown("LEFT")) this.x += moveAmount;
		if (InputManager.instance.isKeyDown("RIGHT")) this.x -= moveAmount;
		if (InputManager.instance.isKeyDown("UP")) this.y += moveAmount;
		if (InputManager.instance.isKeyDown("DOWN")) this.y -= moveAmount;
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

		this.updatePathingDisplay();
		this.updateDebugPanel();
		this.battle.sendNewEvent(GameEvent.types.battle.HOVERCHANGED);
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
		if (this._battle.animating) {
			this.pathingDisplay.clear();
			return;
		}

		var unit = this.battle.selectedUnit;
		if (!unit) unit = this.battle.getHoveredUnit();

		if (!unit) {
			this.pathingDisplay.clear();
			return;
		}

		var isOwnUnit = this.battle.currentPlayer == unit.player;

		var pathable1 = 0x107cca; //blue
		var highlight1 = 0xd4edff; //light blue
		var pathable2 = 0xcaa710; //yellow
		var highlight2 = 0xfff7d4; //light yellow
		var hostile = 0xca1010; //red

		if (isOwnUnit && unit.canAct()) {
			//Show everywhere they could reach, coloured based on how many actions it takes them to get there
			this.pathingDisplay.clear();
			unit.pathableTiles.foreach((x, y, cost:number) => {
				var diff = unit.actionsRemaining - cost;

				if (diff == 0 || unit.actionsRemaining == 1) {
					this.pathingDisplay.setTile(x, y, pathable2);
				} else if (diff >= 1) {
					this.pathingDisplay.setTile(x, y, pathable1);
				}
			});

			//Highlight attackable enemies in red
			var attackable:SparseGrid<number>;
			if (unit.actionsRemaining == 1) {
				//Show tiles they can attack without moving
				attackable = unit.getAttackableTiles(unit.x, unit.y);
			} else {
				attackable = unit.getAttackableNonWalkableTiles();
			}
			attackable.foreach((x, y, v) => {
				var otherUnit = this.battle.getUnitAtPosition(x, y);
				if (otherUnit && unit.isHostileToUnit(otherUnit)) {
					this.pathingDisplay.setTile(x, y, hostile);
				}
			});

		} else if (!isOwnUnit) {
			//show everywhere this unit could attack
			this.pathingDisplay.setCoordsToColor(unit.attackableTiles.getAllCoordinates(), hostile, true);
		} else {
			//Nothing to see here
			this.pathingDisplay.clear();
		}

		//Show the route the unit would take to this tile
		if (isOwnUnit && unit.selected && unit.canAct()) {
			var x = this.mouseGridX;
			var y = this.mouseGridY;
			if (x != unit.x || y != unit.y) {
				var path:number[][];
				if (unit.canReachTile(x, y)) {
					path = unit.getPathToPosition(x, y);
				} else {
					//If there's an enemy unit there, show the path to where this unit would attack that one
					var hoveredUnit = this.battle.getHoveredUnit();
					if (hoveredUnit && hoveredUnit.isHostileToUnit(unit)) {
						if (!unit.inRangeToAttack(hoveredUnit) && unit.actionsRemaining > 1) {
							var pos = unit.getPositionToAttackUnit(hoveredUnit);
							if (pos) {
								path = unit.getPathToPosition(pos[0], pos[1]);
							}
						}
					}
				}

				if (path) {
					for (var coords of path) {
						var cost = unit.actionsToReachTile(coords[0], coords[1]); //note this is cheap
						var diff = unit.actionsRemaining - cost;
						if (diff == 0 || unit.actionsRemaining == 1) {
							this.pathingDisplay.setTile(coords[0], coords[1], highlight2);
						} else if (diff >= 1) {
							this.pathingDisplay.setTile(coords[0], coords[1], highlight1);
						}
					}
				}
			}
		}
	}

	public showTurnBegin(callback:()=>void) {
		var player = this.battle.currentPlayer;
		var str = "Player " + player.id + "\nTurn" + this._battle.turnNumber;
		var text = new PIXI.Text(str, TextUtil.styles.unitID);

		this.addChild(text);
		var width = Game.instance.stage.width / this.scale.x;
		var height = Game.instance.stage.height / this.scale.y;
		var targetX = width / 2 - text.width / 2;
		var targetY = height / 2 - text.height / 2;

		text.y = targetY;

		var tween1 = new Tween().init(text, "x", -text.height, targetX, 0.5, Tween.easingFunctions.quartEaseOut);
		tween1.onFinish = () => {
			var tween2 = new Tween().init(text, "x", targetX, width, 0.5, Tween.easingFunctions.quartEaseIn);
			tween2.onFinish = () => {
				if (text.parent) text.parent.removeChild(text);
				callback();
			}
			tween2.start();
		}
		tween1.start();
	}

	public showEndGame(callback:()=>void) {
		var winner = this.battle.winner;
		var str = "Player " + winner.id + " wins!";

		Game.instance.interfaceRoot.showWarningPopup(str, "Battle Over", callback);
	}

	private onAnimation = (e:GameEvent) => {
		this.updatePathingDisplay();
	}

	private onUnitSelectionChanged = (e:GameEvent) => {
		this.updatePathingDisplay();
	}
}