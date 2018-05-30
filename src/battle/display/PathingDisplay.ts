import SparseGrid from "../../ds/SparseGrid";
import Globals from "../../Globals";

export default class PathingDisplay extends PIXI.Container {
	private _alpha = 1;
	private padding = 1;
	private graphics = new PIXI.Graphics();
	private colors = new SparseGrid<number>();

	private dirty = false;
	private isClear = true;

	constructor() {
		super();
		this.addChild(this.graphics);
	}

	public update(timeElapsed:number) {
		if (this.dirty) {
			this.drawTiles();
		}
	}

	public setCoordsToColor(coords:number[][], color:number, clear = true) {
		if (clear) this.clear();
		for (var c of coords) {
			this.colors.set(c[0], c[1], color);
		}
		this.dirty = true;
		this.isClear = false;
	}

	public setTiles(colors:SparseGrid<number>, clear = true) {
		if (clear) this.colors = colors;
		else this.colors.copyFrom(colors);
		this.dirty = true;
		this.isClear = false;
	}

	public setTile(x:number, y:number, color:number, clear = false) {
		if (clear) this.clear();
		this.colors.set(x, y, color);
		this.dirty = true;
		this.isClear = false;
	}

	public clear() {
		if (this.isClear) return;
		this.colors = new SparseGrid<number>();
		this.dirty = true;
		this.isClear = true;
	}

	private drawTiles() {
		this.graphics.clear();

		var allCoords = this.colors.getAllCoordinates();
		var prevColor = -1;
		var size = Globals.gridSize;

		for (var coords of allCoords) {
			var color = this.colors.get(coords[0], coords[1]);
			if (color != prevColor) {
				if (prevColor != -1) this.graphics.endFill();
				//this.graphics.beginFill(color, this._alpha);
				this.graphics.lineStyle(1, color, this._alpha);
				prevColor = color;
			}

			this.graphics.drawRect(coords[0] * size + this.padding, coords[1] * size + this.padding, size - this.padding * 2, size - this.padding * 2);
		}

		//If there are no colors at all, there won't be a fill to end.
		//if (prevColor != -1) this.graphics.endFill();

		this.dirty = false;
	}
}