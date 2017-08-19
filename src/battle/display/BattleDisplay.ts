/// <reference path="../../declarations/pixi.js.d.ts"/>

import Game from '../../Game';
import Vector2D from '../../util/Vector2D';
import InputManager from '../../interface/InputManager';
import Globals from '../../Globals';
import Battle from '../Battle';
import Unit from '../Unit';

import UnitDisplay from './UnitDisplay';
import LevelDisplay from './LevelDisplay';

export default class BattleDisplay extends PIXI.Container {
	private _unitContainer:PIXI.Container = new PIXI.Container();
	private _unitDisplays:Array<UnitDisplay> = [];
	private _levelDisplay:LevelDisplay = null;
	private mouseGridX:number = Number.NEGATIVE_INFINITY;
	private mouseGridY:number = Number.NEGATIVE_INFINITY;
	private hoveredUnitDisplay:UnitDisplay = null;
	private _battle:Battle;

	get battle():Battle { return this._battle;}
	get levelDisplay():LevelDisplay { return this._levelDisplay; }

	constructor() {
		super();
	}

	public init(battle:Battle) {
		this._battle = battle;
		this.addChild(this._unitContainer);
		Game.instance.updater.add(this);
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
	}

	public onRightClick(coords:Vector2D) {
		var gridCoords = this.viewToGrid(coords);
		this._battle.rightClickTile(gridCoords.x, gridCoords.y);
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

		this.levelDisplay.clearRoute();

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

		if (this.battle.ownUnitSelected()) {
			var unit:Unit = this.battle.selectedUnit;
			if (unit.actionsRemaining > 0 && (unit.x != x || unit.y != y) && unit.canReachTile(x, y)) {
				this.levelDisplay.showRoute(unit.getPathToPosition(x, y));
			}
		}
	}
}