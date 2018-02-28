/// <reference path="../../declarations/pixi.js.d.ts"/>

import Unit from '../Unit';
import Game from '../../Game';
import * as TextUtil from '../../util/TextUtil';
import Globals from '../../Globals';
import Tween from '../../util/Tween';
import GameEvent from '../../events/GameEvent';

class TracePathInfo {
	public timeElapsed = 0;
	public duration = 0;
	public path:number[][];
	public callback:()=>void = null;
}

export default class UnitDisplay extends PIXI.Container {
	private sprite:PIXI.Sprite = null;
	private shadowSprite:PIXI.Sprite = null;
	private idText:PIXI.Text = null;
	private hover:boolean = false;
	private selected:boolean = false;
	private tracePathInfo:TracePathInfo = null;
	private listenersAdded = false;

	private xTween:Tween = null;
	private yTween:Tween = null;
	private tweening:boolean = false;

	get battleIsAnimating():boolean {
		return this.unit && this.unit.battle && this.unit.battle.animating;
	}

	public unit:Unit = null;

	constructor() {
		super();
	}

	public initUnit(unit:Unit) {
		this.unit = unit;

		if (this.sprite) {
			if (this.sprite.parent) this.sprite.parent.removeChild(this.sprite);
			this.sprite.destroy();
		}

		if (this.idText) {
			if (this.idText.parent) this.idText.parent.removeChild(this.sprite);
			this.idText.destroy();
		}

		var texName;
		switch (unit.player.id) {
			case 1: texName = "character/rogue"; break;
			case 2: texName = "character/wizard"; break;
			default: texName = "character/rogue";
		}

		if (!this.shadowSprite) {
			this.shadowSprite = new PIXI.Sprite(Game.instance.textureLoader.get("character/shadow"));
			this.addChildAt(this.shadowSprite, 0);
			this.shadowSprite.y = -5;
		}

		var tex = Game.instance.textureLoader.get(texName);
		this.sprite = new PIXI.Sprite(tex);
		this.sprite.x = -1;
		this.sprite.y = -9;
		this.addChild(this.sprite);

		this.idText = new PIXI.Text(unit.id.toString(), TextUtil.styles.unitID);
		this.addChild(this.idText);

		this.updatePosition();
		Game.instance.updater.add(this, true);

		this.addListeners();
	}

	public update(timeElapsed:number) {
		if (!this.tweening) {
			this.updateMovement(timeElapsed);
		}
	}

	public tweenTo(x:number, y:number, duration:number, easingFunction:(t:number, b:number, c:number, d:number)=>number, callback:()=>void = null) {
		if (this.xTween) this.xTween.stop();
		else this.xTween = new Tween();

		if (this.yTween) this.yTween.stop();
		else this.yTween = new Tween();

		this.xTween.init(this.position, "x", this.position.x, x, duration, easingFunction);
		this.yTween.init(this.position, "y", this.position.y, y, duration, easingFunction);

		this.tweening = true;
		this.yTween.onFinish = () => {
			this.tweening = false;
			callback();
		};

		this.xTween.start();
		this.yTween.start();
	}

	public tracePath(path:number[][], duration:number, callback:()=>void) {
		var info = new TracePathInfo();
		info.path = path;
		info.duration = duration;
		info.callback = callback;
		this.tracePathInfo = info;

		//then it's taken care of in update
	}

	public updatePosition() {
		this.x = this.unit.x * Globals.gridSize;
		this.y = this.unit.y * Globals.gridSize;
	}

	/** Just multiplies by grid size but hey */
	public getGridPosition(gridX:number, gridY:number):number[] {
		return [gridX * Globals.gridSize, gridY * Globals.gridSize];
	}

	public updateActions() {
		this.updateState();
	}

	public cleanup() {
		if (this.parent) {
			this.parent.removeChild(this);
		}

		this.removeListeners();
		this.destroy({children:true});
	}

	public onClick() {
		this.unit.select();
	}

	public setSelected(selected:boolean) {
		this.selected = selected;
		this.updateState();
	}

	public onMouseOver() {
		this.hover = true;
		this.updateState();
	}

	public onMouseOut() {
		this.hover = false;
		this.updateState();
	}

	private updateState() {
		var noActions = (this.unit.actionsRemaining == 0);

		if (this.selected && !noActions) {
			this.sprite.tint = 0x00ff00;
		} else {
			if (noActions) {
				this.sprite.tint = 0x666666;
			}
			else if (this.hover && !this.battleIsAnimating) {
				this.sprite.tint = 0xaaffaa;
			} else {
				this.sprite.tint = 0xffffff;
			}
		}
	}

	private updateMovement(timeElapsed:number) {
		if (this.tracePathInfo) {
			var info = this.tracePathInfo;
			info.timeElapsed = Math.min(info.duration, info.timeElapsed + timeElapsed);

			if (info.timeElapsed >= info.duration) {
				var pos = info.path[info.path.length - 1];
				this.setGridPosition(pos[0], pos[1]);
				this.tracePathInfo = null; //done
				if (info.callback) {
					info.callback();
				}

			} else {
				var numCells = info.path.length - 1; //don't include the start cell
				var timePerCell = info.duration / numCells;
				var cellsMoved = Math.floor(info.timeElapsed / timePerCell);
				var progress = (info.timeElapsed - (cellsMoved * timePerCell)) / timePerCell;

				var pos1 = info.path[cellsMoved];
				var pos2 = info.path[cellsMoved + 1];
				var x = pos1[0] + (pos2[0] - pos1[0]) * progress;
				var y = pos1[1] + (pos2[1] - pos1[1]) * progress;

				this.setGridPosition(x, y);
			}
		}
	}

	private setGridPosition(x:number, y:number) {
		x *= Globals.gridSize;
		y *= Globals.gridSize;

		this.position.set(x, y);
	}

	private addListeners() {
		if (this.listenersAdded) return;

		this.listenersAdded = true;
		this.unit.battle.addEventListener(GameEvent.types.battle.ANIMATIONCOMPLETE, this.onAnimation);
		this.unit.battle.addEventListener(GameEvent.types.battle.ANIMATIONSTART, this.onAnimation);
	}

	private removeListeners() {
		if (!this.listenersAdded) return;

		this.listenersAdded = false;
		this.unit.battle.removeEventListener(GameEvent.types.battle.ANIMATIONCOMPLETE, this.onAnimation);
		this.unit.battle.removeEventListener(GameEvent.types.battle.ANIMATIONSTART, this.onAnimation);
	}

	private onAnimation = (e: GameEvent) => {
		if (e.type == GameEvent.types.battle.ANIMATIONCOMPLETE) {
			this.updatePosition();
		}
		this.updateState();
	}
}