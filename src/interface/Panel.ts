/// <reference path="../declarations/pixi.js.d.ts"/>
import InterfaceElement from './InterfaceElement';
//import TextureGenerator = require('../textures/TextureGenerator');
import * as TextureGenerator from '../textures/TextureGenerator';
import NineSliceSprite from '../textures/NineSliceSprite';

export default class Panel extends InterfaceElement {
	public static BASIC:number = 0;
	public static HEADER:number = 1;
	public static FIELD:number = 2;

	private static scaleTextures = {};

	protected _debugColor = 0x00ff00;

	private _style:number;
	private _sprite:NineSliceSprite;

	constructor(width:number, height:number, style:number) {
		super();

		this._className = "Panel";
		this._width = width;
		this._height = height;
		this._style = style;
		this.clickable = true;

		var tex:PIXI.Texture = Panel.scaleTextures[style];
		if (!tex) {
			switch (style) {
				case Panel.HEADER:
					tex = TextureGenerator.simpleRectangle(null, 8, 8, 0x616161);
					break;
				case Panel.FIELD:
					tex = TextureGenerator.simpleRectangle(null, 8, 8, 0x121212, 2, 0x616161);
					break;
				default: //BASIC
					tex = TextureGenerator.simpleRectangle(null, 8, 8, 0x2b2b2b, 2, 0x616161);
			}

			if (tex) {
				Panel.scaleTextures[style] = tex;
			}
		}

		if (tex) {
			this._sprite = NineSliceSprite.fromTexture(tex, new PIXI.Rectangle(3,3,2,2));
			this._displayObject.addChild(this._sprite);
			this._sprite.setSize(width, height);
		}
	}

	public resize(width:number, height:number) {
		this._sprite.setSize(width, height);
		super.resize(width, height);
	}

	public destroy() {
		super.destroy();
		this._sprite.destroy(true);
	}
}
