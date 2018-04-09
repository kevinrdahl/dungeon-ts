import Player from './Player';
import Battle from './Battle';
import Level from './Level';
import Tile from './Tile';
import UnitDisplay from './display/UnitDisplay';
import BinaryHeap from '../ds/BinaryHeap';
import SparseGrid from '../ds/SparseGrid';
import Hero from '../user/Hero';
import Monster from '../definitions/Monster';

class PathingNode {
	public cost = Number.POSITIVE_INFINITY;
	public hCost = 0;
	public tile:Tile = null;
	public visited:boolean = false;
	public fromNode:PathingNode = null;
	public get x():number { return this.tile.x; }
	public get y():number { return this.tile.y; }

	/** For BinaryHeap */
	public static scoreFunc(node:PathingNode):number {
		return node.cost + node.hCost;
	}
}

export default class Unit {
	private static _nextID:number = 1;
	private _id:number;
	private static readonly adjacentOffsets: number[][] = [[-1, 0], [1, 0], [0, -1], [0, 1]];

	public player:Player = null;
	public battle:Battle = null;
	public display: UnitDisplay = null;

	public x:number = 0;
	public y:number = 0;
	public moveSpeed:number = 5;
	public actionsRemaining:number = 2;
	public actionsPerTurn:number = 2;
	public isFlying:boolean = false;
	public attackRangeMin:number = 1;
	public attackRangeMax:number = 2;
	public attackDamage:number = 2;
	public health:number = 5;
	public maxHealth:number = 5;
	public name:String = "?";
	public hero:Hero = null;
	public monster:Monster = null;

	public pathableTiles: SparseGrid<boolean> = null;
	public attackableTiles:SparseGrid<boolean> = null;

	get id(): number { return this._id; }
	get selected():boolean {
		var battle = this.battle;
		if (battle) {
			return battle.selectedUnit == this;
		}
		return false;
	}
	get alive():boolean { return this.health > 0; }
	get injured():boolean { return this.health < this.maxHealth; }

	constructor() {
		this._id = Unit._nextID++;
	}

	public initAsHero(hero:Hero) {
		this.monster = null;
		this.hero = hero;
		this.name = hero.name;
	}

	public initAsMonster(monster:Monster) {
		this.hero = null;
		this.monster = monster;
		this.name = monster.name;
	}

	public onAddToBattle() {
		if (this.battle.visible) {
			this.initDisplay();
		}
	}

	public onSelect() {
		if (this.display) this.display.setSelected(true);
	}

	public onDeselect() {
		if (this.display) this.display.setSelected(false);
	}

	/**The number of remaining actions has changed */
	public onActionsChanged() {
		if (this.display) this.display.updateActions();
	}

	/** Tells the battle to select this. */
	public select() {
		var battle = this.battle;
		if (battle) {
			battle.selectUnit(this);
		}
	}

	/** Tells the battle to deselect this. */
	public deselect() {
		if (this.selected) {
			this.battle.deselectUnit();
		}
	}

	public updatePosition() {
		if (this.display) {
			this.display.updatePosition();
		}
	}

	public takeDamage(amount:number, fromUnit:Unit) {
		console.log(this + " takes " + amount + " damage from " + fromUnit);
		this.health -= amount;
		if (this.health < 0) this.health = 0;

		if (this.health == 0) {
			//die!
			this.kill();
			console.log(this + " dies!");
		}
	}

	public kill() {
		this.battle.onUnitDeath(this);
	}

	/**
	 * Updates this Unit's public pathableTiles variable, which lists the minimum cost to get to
	 * nearby tiles.
	 */
	public updatePathing() {
		//It's dijkstra with a priority queue and lazy node discovery.

		var level = this.battle.level;
		var width = level.width;
		var height = level.height;

		var source:PathingNode = this.getNewPathingNode(this.x, this.y);
		source.cost = 0;

		var queue: BinaryHeap<PathingNode> = new BinaryHeap<PathingNode>(PathingNode.scoreFunc, [source]);
		var nodes: SparseGrid<PathingNode> = new SparseGrid<PathingNode>();
		this.pathableTiles = new SparseGrid<boolean>(false);
		this.attackableTiles = new SparseGrid<boolean>(false);

		nodes.set(source.x, source.y, source);

		while (!queue.empty) {
			var node = queue.pop();
			this.pathableTiles.set(node.x, node.y, true);
			this.getAttackableTiles(node.x, node.y, this.attackableTiles);
			node.visited = true;
			//console.log(node.x + "," + node.y);

			//check the 4 adjacent tiles
			for (var i = 0; i < 4; i++) {
				var x = node.x + Unit.adjacentOffsets[i][0];
				var y = node.y + Unit.adjacentOffsets[i][1];

				//gotta stay in the grid
				if (x < 0 || x >= width || y < 0 || y >= height) continue;

				//get (or create and set) the pathing node
				var neighbour = nodes.get(x, y);
				var justDiscoveredNeighbour = false;
				if (!neighbour) {
					neighbour = this.getNewPathingNode(x, y);
					nodes.set(x, y, neighbour);
					justDiscoveredNeighbour = true;
				} else if (neighbour.visited) {
					//this neighbour already has its shortest route (or has no route)
					continue;
				}

				//well duh (though this could be subject to change, if some tiles can only be entered from a certain direction)
				if (!this.canTraverseTile(neighbour.tile)) {
					neighbour.visited = true;
					continue;
				}

				var cost = node.cost + this.getCostToTraverseTile(neighbour.tile);
				if (cost > this.moveSpeed) continue;
				if (cost < neighbour.cost) {
					neighbour.cost = cost;
					if (!justDiscoveredNeighbour) {
						queue.decrease(neighbour);
					}
				}

				if (justDiscoveredNeighbour) {
					queue.push(neighbour);
				}
			}
		}
	}

	/** For each tile that can be attacked from the given position, writes them to the provided grid, and returns it */
	public getAttackableTiles(fromX, fromY, toGrid:SparseGrid<boolean>=null):SparseGrid<boolean> {
		var minRange = this.attackRangeMin;
		var maxRange = this.attackRangeMax;
		var dist = 0;
		var x,y;
		var width = this.battle.level.width;
		var height = this.battle.level.height;
		var tile:Tile;

		if (toGrid == null) {
			toGrid = new SparseGrid<boolean>();
		}

		for (var yOffset = -maxRange; yOffset <= maxRange; yOffset++) {
			for (var xOffset = -maxRange; xOffset <= maxRange; xOffset++) {
				x = fromX + xOffset;
				y = fromY + yOffset;
				if (x < 0 || y < 0 || x >= width || y >= height) continue;
				tile = this.battle.level.getTile(x, y);
				if (!tile.isPathable) continue;

				dist = Math.abs(xOffset) + Math.abs(yOffset);
				if (dist >= minRange && dist <= maxRange) {
					toGrid.set(x, y, true);
				}
			}
		}

		return toGrid;
	}

	/**
	 * Gets the coordinates from which this unit should attack the other unit. Assumes it can get there.
	 */
	public getPositionToAttackUnit(unit: Unit): Array<number> {
		var grid = this.pathableTiles.filter((x, y, val:boolean)=>{
			var dist = Math.abs(x - unit.x) + Math.abs(y - unit.y);
			if (dist >= this.attackRangeMin && dist <= this.attackRangeMax) {
				return !this.battle.getUnitAtPosition(x, y);
			}
			return false;
		});

		var allCoords = grid.getAllCoordinates();
		var closestCoords:Array<number> = null;
		var leastDist:number = Number.POSITIVE_INFINITY;

		for (var coords of allCoords) {
			var dist = Math.sqrt(Math.pow(coords[0] - this.x, 2) + Math.pow(coords[1] - this.y, 2));
			if (dist < leastDist) {
				closestCoords = coords;
				leastDist = dist;
			}
		}

		return closestCoords;
	}

	public getPathToPosition(targetX:number, targetY:number, fromX = Number.NEGATIVE_INFINITY, fromY = Number.NEGATIVE_INFINITY):number[][] {
		//A*
		//todo: add additional heuristic cost based on environment hazards

		//var startTime = performance.now();

		if (fromX == Number.NEGATIVE_INFINITY) fromX = this.x;
		if (fromY == Number.NEGATIVE_INFINITY) fromY = this.y;

		var level = this.battle.level;
		var width = level.width;
		var height = level.height;
		var xIsLongest:boolean = (Math.abs(targetX - fromX) > Math.abs(targetY - fromY));

		var source:PathingNode = this.getNewPathingNode(fromX, fromY);
		source.cost = 0;

		var queue: BinaryHeap<PathingNode> = new BinaryHeap<PathingNode>(PathingNode.scoreFunc, [source]);
		var nodes: SparseGrid<PathingNode> = new SparseGrid<PathingNode>();

		nodes.set(source.x, source.y, source);

		while (!queue.empty) {
			var node = queue.pop();
			if (node.x === targetX && node.y === targetY) {
				var route = this.traceRoute(node);
				//var endTime = performance.now();
				//console.log("Computed path from " + fromX + "," + fromY + " to " + targetX + "," + targetY + " in " + (endTime - startTime) + "ms");
				return route;
			}

			this.pathableTiles.set(node.x, node.y, true);
			node.visited = true;

			//check the 4 adjacent tiles
			for (var i = 0; i < 4; i++) {
				var x = node.x + Unit.adjacentOffsets[i][0];
				var y = node.y + Unit.adjacentOffsets[i][1];

				//gotta stay in the grid
				if (x < 0 || x >= width || y < 0 || y >= height) continue;

				//get (or create and set) the pathing node
				var neighbour = nodes.get(x, y);
				var justDiscoveredNeighbour = false;
				if (!neighbour) {
					neighbour = this.getNewPathingNode(x, y);
					//hCost is the line distance...
					neighbour.hCost = Math.sqrt(Math.pow(x - targetX, 2) + Math.pow(y - targetY, 2));

					//...but favour moving along the longest axis
					if (xIsLongest) {
						neighbour.hCost += Math.abs(neighbour.x - targetX);
					} else {
						neighbour.hCost += Math.abs(neighbour.y - targetY);
					}

					nodes.set(x, y, neighbour);
					justDiscoveredNeighbour = true;
				} else if (neighbour.visited) {
					//this neighbour already has its shortest route (or has no route)
					continue;
				}

				//well duh (though this could be subject to change, if some tiles can only be entered from a certain direction)
				if (!this.canTraverseTile(neighbour.tile)) {
					neighbour.visited = true;
					continue;
				}

				var cost = node.cost + this.getCostToTraverseTile(neighbour.tile);
				if (cost > this.moveSpeed) continue;
				if (cost < neighbour.cost) {
					neighbour.cost = cost;
					neighbour.fromNode = node;
					if (!justDiscoveredNeighbour) {
						queue.decrease(neighbour);
					}
				}

				if (justDiscoveredNeighbour) {
					queue.push(neighbour);
				}
			}
		}

		return null;
	}

	private traceRoute(node:PathingNode):number[][] {
		var route:number[][] = [];

		while (node != null) {
			route.unshift([node.x, node.y]);
			node = node.fromNode;
		}

		return route;
	}

	public canAct():boolean {
		return this.actionsRemaining > 0;
	}

	public canTraverseTile(tile:Tile):boolean {
		//can't enter enemy tiles!
		var currentUnit = this.battle.getUnitAtPosition(tile.x, tile.y);
		if (currentUnit && currentUnit.player != this.player) {
			return false;
		}

		if (this.isFlying) {
			return tile.isFlyable;
		}
		return tile.isWalkable;
	}

	public canReachTile(x:number, y:number):boolean {
		if (this.pathableTiles == null) {
			this.updatePathing();
		}

		return this.pathableTiles.get(x, y) === true;
	}

	public canAttackTile(x:number, y:number):boolean {
		if (this.attackableTiles == null) {
			this.updatePathing();
		}

		return this.pathableTiles.get(x, y) === true;
	}

	/** Irrespective of actions, range and such. Currently "belongs to a different player from" */
	public isHostileToUnit(unit:Unit):boolean {
		return this.player != unit.player;
	}

	public inRangeToAttack(unit:Unit):boolean {
		var range = Math.abs(unit.x - this.x) + Math.abs(unit.y - this.y);
		if (range >= this.attackRangeMin && range <= this.attackRangeMax) {
			return true;
		}
		return false;
	}

	public getAttackableNonWalkableTiles():SparseGrid<boolean> {
		if (this.pathableTiles == null) {
			this.updatePathing();
		}

		return this.attackableTiles.getComplement(this.pathableTiles);
	}

	/** Assumes it CAN traverse this tile! */
	public getCostToTraverseTile(tile:Tile):number {
		//TODO: based on unit type, etc etc
		//maybe make it cost more when adjacent to an enemy
		if (this.isFlying) {
			return tile.flyCost;
		}
		return tile.walkCost;
	}

	private getNewPathingNode(x:number, y:number):PathingNode {
		var node:PathingNode = new PathingNode();
		var tile = this.battle.level.getTile(x, y);
		node.tile = tile;

		return node;
	}

	private initDisplay() {
		if (this.display) {
			this.display.cleanup();
		}

		this.display = new UnitDisplay();
		this.display.initUnit(this);

		if (this.battle.display) {
			this.battle.display.addUnitDisplay(this.display);
		}
	}

	public toString():string {
		return "Unit " + this.id + ' "' + this.name + '"';
	}
}