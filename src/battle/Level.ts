import Tile from './Tile';
import LevelDisplay from './display/LevelDisplay';

export default class Level {
	public tiles:Array<Tile> = [];
	public width = 0;
	public height = 0;
	public display:LevelDisplay = null;

	constructor() {

	}

	public init(layout) {
		this.width = layout.width;
		this.height = layout.height;

		var x = 0, y = 0;
		for (var tileType of layout.tiles) {
			var tile: Tile = new Tile();
			tile.x = x;
			tile.y = y;
			tile.initType(tileType);
			this.tiles.push(tile);

			x += 1;
			if (x == this.width) {
				x = 0;
				y += 1;
			}
		}
	}

	public getTile(x:number, y:number):Tile {
		if (x < 0 || x >= this.width || y < 0 || y >= this.height) return null;
		var index = this.width * y + x;
		return this.tiles[index];
	}

	public initDisplay() {
		this.display = new LevelDisplay();
		this.display.initLevel(this);
	}
}