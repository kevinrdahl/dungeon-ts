/// <reference path="../declarations/pixi.js.d.ts"/>

import InterfaceElement from './InterfaceElement';
import GameEvent from '../events/GameEvent';
import Game from '../Game';
import NineSliceSprite from '../textures/NineSliceSprite';

export interface ButtonAppearance {
	normal: PIXI.Container,
	highlight: PIXI.Container,
	disabled: PIXI.Container
}

export default class BaseButton extends InterfaceElement {
	private sprites:PIXI.Container[];
	private _state = -1;
	private scaleSprites = false;

	private static STATE_NORMAL = 0;
	private static STATE_HIGHLIGHT = 1;
	private static STATE_DISABLED = 2;

	/**
	 * It's a button! Click it!
	 * Use the LEFTMOUSECLICK event to listen for clicks.
	 */
	constructor(width:number, height:number, appearance:ButtonAppearance, scaleSprites = false) {
		super();
		this._className = "BaseButton";
		this._debugColor = 0xff66ff;
		this.clickable = true;

		this.scaleSprites = scaleSprites;
		this.sprites = [appearance.normal, appearance.highlight, appearance.disabled];

		this.setNormal();
		this.resize(width, height);
		this.addEventListeners();
	}

	public resize(width:number, height:number) {
		for (var sprite of this.sprites) {
			if (sprite instanceof NineSliceSprite) {
				sprite.setSize(width, height);
			} else if (this.scaleSprites) {
				sprite.width = width;
				sprite.height = height;
			}
		}
		super.resize(width, height);
	}

	public set enabled(enabled:boolean) {
		if (enabled) {
			this.setNormal();
		} else {
			this.setDisabled();
		}
	}

	public get enabled():boolean {
		return this._state != BaseButton.STATE_DISABLED;
	}

	protected addEventListeners() {
		this.addEventListener(GameEvent.types.ui.MOUSEOVER, this.onMouseOver);
		this.addEventListener(GameEvent.types.ui.MOUSEOUT, this.onMouseOut);
		this.addEventListener(GameEvent.types.ui.LEFTMOUSECLICK, this.onLeftMouseClick);
	}

	protected removeEventListeners() {
		this.removeEventListener(GameEvent.types.ui.MOUSEOVER, this.onMouseOver);
		this.removeEventListener(GameEvent.types.ui.MOUSEOUT, this.onMouseOut);
		this.removeEventListener(GameEvent.types.ui.LEFTMOUSECLICK, this.onLeftMouseClick);
	}

	protected setNormal() {
		this.setState(BaseButton.STATE_NORMAL);
	}

	protected setHighlight() {
		this.setState(BaseButton.STATE_HIGHLIGHT);
	}

	protected setDisabled() {
		this.setState(BaseButton.STATE_DISABLED);
	}

	protected setState(state) {
		if (state === this._state) return;

		var currentSprite = this.sprites[this._state];
		if (currentSprite && currentSprite.parent) currentSprite.parent.removeChild(currentSprite);
		this._state = state;
		var newSprite = this.sprites[state];
		if (newSprite) this._displayObject.addChildAt(newSprite, 0);
	}

	private onMouseOver = (e:GameEvent) => {
		if (this.enabled) {
			this.setHighlight();
		}
	}

	private onMouseOut = (e:GameEvent) => {
		if (this.enabled) {
			this.setNormal();
		}
	}

	private onLeftMouseClick = (e:GameEvent) => {
		//TODO: sound?
	}
}