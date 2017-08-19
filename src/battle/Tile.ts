
export default class Tile {
	public static readonly PATHING_NONE = 0;
	public static readonly PATHING_FLY = 1;
	public static readonly PATHING_WALK = 2;

	public pathingType = 0;
	public walkCost = 1;
	public flyCost = 1;
	public name = "Tile";
	public spriteName = "tile/wall";
	public x = 0;
	public y = 0;

	get isWalkable():boolean { return this.pathingType >= 2; }
	get isFlyable():boolean { return this.pathingType >= 1; }
	get isPathable():boolean { return this.isWalkable || this.isFlyable; }

	constructor() {

	}

	//these are all temp!
	public initWall() {
		this.pathingType = Tile.PATHING_NONE;
		this.name = "Wall";
		this.spriteName = "tile/wall";
	}

	public initFloor() {
		this.pathingType = Tile.PATHING_WALK;
		this.name = "Floor";
		this.spriteName = "tile/floor";
	}

	public initPit() {
		this.pathingType = Tile.PATHING_FLY;
		this.name = "Pit";
		this.spriteName = "tile/water";
	}
}