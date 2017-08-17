import Tile from './Tile';
import LevelDisplay from './display/LevelDisplay';

export default class Level {
	public tiles:Array<Tile> = [];
	public width = 0;
	public height = 0;
	public display:LevelDisplay = null;

	constructor() {

	}

	public init() {
		this.width = 10;
		this.height = 8;

		for (var y = 0; y < this.height; y++) {
			for (var x = 0; x < this.width; x++) {
				var tile:Tile = new Tile();
				tile.x = x;
				tile.y = y;
				if (x == 0 || y == 0 || x == this.width - 1 || y == this.height - 1) {
					tile.initWall();
				} else if (this.width - x < 5 && this.height - y < 5) {
					tile.initPit();
				} else {
					tile.initFloor();
				}
				this.tiles.push(tile);
			}
		}
	}

	public getTile(x:number, y:number):Tile {
		var index = this.width * y + x;
		return this.tiles[index];
	}

	public initDisplay() {
		this.display = new LevelDisplay();
		this.display.initLevel(this);
	}
}