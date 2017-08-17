/// <reference path="../../declarations/pixi.js.d.ts"/>

import Game from '../../Game';
import Vector2D from '../../util/Vector2D';
import InputManager from '../../interface/InputManager';
import Globals from '../../Globals';
import Battle from '../Battle';

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
		var local = this.toLocal(new PIXI.Point(mouseCoords.x, mouseCoords.y));

		var x = Math.floor(local.x / Globals.gridSize);
		var y = Math.floor(local.y / Globals.gridSize);

		if (x != this.mouseGridX || y != this.mouseGridY) {
			this.mouseGridX = x;
			this.mouseGridY = y;
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

	private updateHover() {
		if (this.hoveredUnitDisplay) {
			this.hoveredUnitDisplay.onMouseOut();
		}

		for (var display of this._unitDisplays) {
			if (display.unit.x == this.mouseGridX && display.unit.y == this.mouseGridY) {
				this.hoveredUnitDisplay = display;
				display.onMouseOver();
				break;
			}
		}
	}
}