/// <reference path="../declarations/pixi.js.d.ts"/>

import InterfaceElement from './InterfaceElement';
import GameEvent from '../events/GameEvent';
import BaseButton from './BaseButton';
import AssetCache from '../util/AssetCache';
import TextElement from './TextElement';
import AttachInfo from './AttachInfo';
import * as TextureGenerator from '../textures/TextureGenerator';
import NineSliceSprite from '../textures/NineSliceSprite';

export default class TextButton extends BaseButton {
	//note: use the gems in oryx 16 bit items as colour reference
	public static colorSchemes = {
		green: {
			normal: {bg:0x00852c, border:0x00ba3e},
			highlight: {bg:0x00ba3e, border:0x00ea4e},
			disabled: {bg:0x2b2b2b, border:0x616161}
		},

		red: {
			normal: {bg:0x910c0c, border:0xca1010},
			highlight: {bg:0xca1010, border:0xff1414},
			disabled: {bg:0x2b2b2b, border:0x616161}
		},

		blue: {
			normal: {bg:0x0c5991, border:0x107cca},
			highlight: {bg:0x107cca, border:0x149dff},
			disabled: {bg:0x2b2b2b, border:0x616161}
		}
	}

	//Caches background textures. These can hang around for the whole program
	private static scaleTextures = {};

	//Generates a key and checks the texture cache before creating. Inserts if created.
	private static getScaleTexture(scheme:any):PIXI.Texture {
		var key = JSON.stringify(scheme); //silly
		var tex:PIXI.Texture = this.scaleTextures[key];
		if (!tex) {
			tex = TextureGenerator.simpleRectangle(null, 8, 8, scheme.bg, 2, scheme.border);
			this.scaleTextures[key] = tex;
		}
		return tex;
	}

	private _textElement:TextElement;
	private _onClick:(e:GameEvent) => void;

	public set text(s:string) {
		this._textElement.text = s;
	}
	public get text():string { return this._textElement.text; }

	public set onClick(func:(e: GameEvent) => void) {
		if (this._onClick) {
			this.removeEventListener(GameEvent.types.ui.LEFTMOUSECLICK, this._onClick);
		}

		if (func) this.addEventListener(GameEvent.types.ui.LEFTMOUSECLICK, func);
		this._onClick = func;
	}

	constructor(text:string, colorScheme=null, width:number = 100, height:number = 30, textStyle:PIXI.TextStyle=null) {
		if (!colorScheme) colorScheme = TextButton.colorSchemes.blue;
		if (!textStyle) textStyle = TextElement.basicText;
		var a:NineSliceSprite

		super(width, height, {
			normal: NineSliceSprite.fromTexture(TextButton.getScaleTexture(colorScheme.normal), new PIXI.Rectangle(3, 3, 2, 2)),
			highlight:NineSliceSprite.fromTexture(TextButton.getScaleTexture(colorScheme.highlight), new PIXI.Rectangle(3, 3, 2, 2)),
			disabled: NineSliceSprite.fromTexture(TextButton.getScaleTexture(colorScheme.disabled), new PIXI.Rectangle(3, 3, 2, 2))
		});
		this._className = "TextButton";

		this._textElement = new TextElement(text, textStyle);
		this.addChild(this._textElement);
		this._textElement.attachToParent(AttachInfo.Center);
	}
}