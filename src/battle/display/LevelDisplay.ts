/// <reference path="../../declarations/pixi.js.d.ts"/>

import Level from '../Level';
import Globals from '../../Globals';
import Game from '../../Game';

export default class LevelDisplay extends PIXI.Container {
	public level:Level = null;

	private tileSprites:Array<PIXI.Sprite> = []

	constructor() {
		super();
	}

	public initLevel(level:Level) {
		this.level = level;
		this.initTiles();
	}

	//TODO TODO TODO make this not garbage (make a tilemap)
	private initTiles() {
		for (var sprite of this.tileSprites) {
			this.removeChild(sprite);
			sprite.destroy();
		}
		this.tileSprites = [];

		var width = this.level.width;
		var height = this.level.height;

		for (var y = 0; y < height; y++) {
			for (var x = 0; x < width; x++) {
				var tile = this.level.getTile(x, y);
				var tex = Game.instance.textureLoader.get(tile.spriteName);
				var sprite = new PIXI.Sprite(tex);
				this.addChild(sprite);
				this.tileSprites.push(sprite);
				sprite.x = x * Globals.gridSize;
				sprite.y = y * Globals.gridSize;
			}
		}
	}
}