/// <reference path="../../declarations/pixi.js.d.ts"/>

import Level from '../Level';
import Globals from '../../Globals';
import Game from '../../Game';
import SparseGrid from '../../ds/SparseGrid';

export default class LevelDisplay extends PIXI.Container {
	public level:Level = null;

	private tileSprites:Array<PIXI.Sprite> = []
	private pathingGraphics:PIXI.Graphics = new PIXI.Graphics();
	private routeGraphics:PIXI.Graphics = new PIXI.Graphics();

	constructor() {
		super();
	}

	public initLevel(level:Level) {
		this.level = level;
		this.initTiles();
		if (!this.pathingGraphics.parent) this.addChild(this.pathingGraphics);
		if (!this.routeGraphics.parent) this.addChild(this.routeGraphics);
	}

	public showPathing(tiles:SparseGrid<any>, color:number = 0x0000ff, alpha:number = 0.3) {
		this.pathingGraphics.beginFill(color, alpha);

		var size = Globals.gridSize;
		var allCoords = tiles.getAllCoordinates();
		for (var coords of allCoords) {
			this.pathingGraphics.drawRect(coords[0] * size, coords[1] * size, size, size);
		}

		this.pathingGraphics.endFill();
	}

	public clearPathing() {
		this.pathingGraphics.clear();
	}

	public showPath(path:number[][], color:number = 0x000000, alpha:number = 0.3) {
		this.routeGraphics.beginFill(color, alpha);

		var size = Globals.gridSize;
		for (var coords of path) {
			this.routeGraphics.drawRect(coords[0] * size, coords[1] * size, size, size);
		}

		this.routeGraphics.endFill();
	}

	public clearPath() {
		this.routeGraphics.clear();
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