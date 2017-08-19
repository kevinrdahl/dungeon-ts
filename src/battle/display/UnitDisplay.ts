/// <reference path="../../declarations/pixi.js.d.ts"/>

import Unit from '../Unit';
import Game from '../../Game';
import * as TextUtil from '../../util/TextUtil';
import Globals from '../../Globals';

export default class UnitDisplay extends PIXI.Container {
	private sprite:PIXI.Sprite = null;
	private shadowSprite:PIXI.Sprite = null;
	private idText:PIXI.Text = null;
	private hover:boolean = false;
	private selected:boolean = false;

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
			this.shadowSprite.y = 4;
		}

		var tex = Game.instance.textureLoader.get(texName);
		this.sprite = new PIXI.Sprite(tex);
		this.sprite.x = -1;
		this.addChild(this.sprite);

		this.idText = new PIXI.Text(unit.id.toString(), TextUtil.styles.unitID);
		this.addChild(this.idText);

		this.updatePosition();
		//Game.instance.updater.add(this, true);
	}

	public update(timeElapsed:number) {
		//yup the updater works
		//this.rotation += (Math.PI / 180) * 45 * timeElapsed;
	}

	public updatePosition() {
		this.x = this.unit.x * Globals.gridSize;
		this.y = this.unit.y * Globals.gridSize - 9;
	}

	public updateActions() {
		this.updateState();
	}

	public cleanUp() {
		if (this.parent) {
			this.parent.removeChild(this);
		}
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
			else if (this.hover) {
				this.sprite.tint = 0xaaffaa;
			} else {
				this.sprite.tint = 0xffffff;
			}
		}
	}
}