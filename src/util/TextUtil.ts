/// <reference path="../declarations/pixi.js.d.ts"/>
import Game from '../Game';

//var mainFont: string = "VT323";
var mainFont: string = "Arial";

export var styles = {
	unitID: new PIXI.TextStyle({ fontSize: 14, fontFamily: mainFont, fill: 0xffffff, align: 'left' })
}

/** For scaling without interpolation */
export class TextSprite extends PIXI.Sprite {
	private _text:string;
	private _style: PIXI.TextStyle;
	private renderTex:PIXI.RenderTexture = null;

	constructor(text:string, style:PIXI.TextStyle) {
		super();
		this.setText(text, style);
	}

	public get text():string { return this._text; }
	public set text(text:string) {
		this.setText(text, this._style);
	}

	private setText(text:string, style:PIXI.TextStyle) {
		this._text = text;
		this._style = style;

		var oldTex = this.renderTex;
		var pixiText = new PIXI.Text(text, style);
		var bounds = pixiText.getBounds();
		this.renderTex = PIXI.RenderTexture.create(bounds.width, bounds.height);
		Game.instance.renderer.render(pixiText, this.renderTex);
		this.texture = this.renderTex;

		if (oldTex) {
			oldTex.destroy();
		}
	}
}