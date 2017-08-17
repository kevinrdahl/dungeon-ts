import Player from './Player';
import Battle from './Battle';
import Level from './Level';
import Tile from './Tile';
import UnitDisplay from './display/UnitDisplay';
import BinaryHeap from '../ds/BinaryHeap';
import SparseGrid from '../ds/SparseGrid';

class PathingNode {
	public cost = Number.POSITIVE_INFINITY;
	public hCost = 0;
	public tile:Tile = null;
	public visited:boolean = false;
	public fromNode:PathingNode = null;

	/** For BinaryHeap */
	public static scoreFunc(node:PathingNode):number {
		return node.cost + node.hCost;
	}
}

export default class Unit {
	private static _nextID:number = 1;
	private _id:number;

	public player:Player = null;
	public battle:Battle = null;
	public x:number = 0;
	public y:number = 0;
	public moveSpeed:number = 5;
	public isFlying:boolean = false;
	public display:UnitDisplay = null;
	public pathableTiles: SparseGrid<number> = null;

	get id(): number { return this._id; }
	get selected():boolean {
		var battle = this.battle;
		if (battle) {
			return battle.selectedUnit == this;
		}
		return false;
	}

	constructor() {
		this._id = Unit._nextID++;
	}

	public onAddToBattle() {
		if (this.battle.visible) {
			this.initDisplay();
		}
	}

	public onSelect() {
		this.display.setSelected(true);
	}

	public onDeselect() {
		this.display.setSelected(false);
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

	private static adjacentOffsets:Array<Array<number>> = [[-1,0], [1,0], [0,-1], [0,1]];

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
		this.pathableTiles = new SparseGrid<number>(Number.MAX_VALUE);

		nodes.set(source.tile.x, source.tile.y, source);

		while (!queue.empty) {
			var node = queue.pop();
			this.pathableTiles.set(node.tile.x, node.tile.y, node.cost);
			node.visited = true;
			//console.log(node.x + "," + node.y);

			//check the 4 adjacent tiles
			for (var i = 0; i < 4; i++) {
				var x = node.tile.x + Unit.adjacentOffsets[i][0];
				var y = node.tile.y + Unit.adjacentOffsets[i][1];

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

	public getPathToPosition(targetX:number, targetY:number, fromX = Number.NEGATIVE_INFINITY, fromY = Number.NEGATIVE_INFINITY):Array<Array<number>> {
		//A*
		//todo: add additional heuristic cost based on environment hazards

		//var startTime = performance.now();

		if (fromX == Number.NEGATIVE_INFINITY) fromX = this.x;
		if (fromY == Number.NEGATIVE_INFINITY) fromY = this.y;

		var level = this.battle.level;
		var width = level.width;
		var height = level.height;

		var source:PathingNode = this.getNewPathingNode(fromX, fromY);
		source.cost = 0;

		var queue: BinaryHeap<PathingNode> = new BinaryHeap<PathingNode>(PathingNode.scoreFunc, [source]);
		var nodes: SparseGrid<PathingNode> = new SparseGrid<PathingNode>();

		nodes.set(source.tile.x, source.tile.y, source);

		while (!queue.empty) {
			var node = queue.pop();
			if (node.tile.x === targetX && node.tile.y === targetY) {
				var route = this.traceRoute(node);
				//var endTime = performance.now();
				//console.log("Computed path from " + fromX + "," + fromY + " to " + targetX + "," + targetY + " in " + (endTime - startTime) + "ms");
				return route;
			}

			this.pathableTiles.set(node.tile.x, node.tile.y, node.cost);
			node.visited = true;

			//check the 4 adjacent tiles
			for (var i = 0; i < 4; i++) {
				var x = node.tile.x + Unit.adjacentOffsets[i][0];
				var y = node.tile.y + Unit.adjacentOffsets[i][1];

				//gotta stay in the grid
				if (x < 0 || x >= width || y < 0 || y >= height) continue;

				//get (or create and set) the pathing node
				var neighbour = nodes.get(x, y);
				var justDiscoveredNeighbour = false;
				if (!neighbour) {
					neighbour = this.getNewPathingNode(x, y);
					//hCost is the line distance
					neighbour.hCost = Math.sqrt(Math.pow(x - targetX, 2) + Math.pow(y - targetY, 2));
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

	private traceRoute(node:PathingNode):Array<Array<number>> {
		var route:Array<Array<number>> = [];

		while (node != null) {
			route.push([node.tile.x, node.tile.y]);
			node = node.fromNode;
		}

		return route;
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

	public canReachTile(x:number, y:number) {
		if (this.pathableTiles == null) {
			this.updatePathing();
		}

		return this.pathableTiles.get(x, y) <= this.moveSpeed;
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
			this.display.cleanUp();
		}

		this.display = new UnitDisplay();
		this.display.initUnit(this);

		if (this.battle.display) {
			this.battle.display.addUnitDisplay(this.display);
		}
	}
}