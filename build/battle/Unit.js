"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var UnitDisplay_1 = require("./display/UnitDisplay");
var BinaryHeap_1 = require("../ds/BinaryHeap");
var SparseGrid_1 = require("../ds/SparseGrid");
var PathingNode = (function () {
    function PathingNode() {
        this.cost = Number.POSITIVE_INFINITY;
        this.tile = null;
        this.x = -1;
        this.y = -1;
        this.visited = false;
    }
    /** For BinaryHeap */
    PathingNode.scoreFunc = function (node) {
        return node.cost;
    };
    return PathingNode;
}());
var Unit = (function () {
    function Unit() {
        this.player = null;
        this.battle = null;
        this.x = 0;
        this.y = 0;
        this.moveSpeed = 5;
        this.isFlying = false;
        this.display = null;
        this.pathableTiles = null;
        this._id = Unit._nextID++;
    }
    Object.defineProperty(Unit.prototype, "id", {
        get: function () { return this._id; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Unit.prototype, "selected", {
        get: function () {
            var battle = this.battle;
            if (battle) {
                return battle.selectedUnit == this;
            }
            return false;
        },
        enumerable: true,
        configurable: true
    });
    Unit.prototype.onAddToBattle = function () {
        if (this.battle.visible) {
            this.initDisplay();
        }
    };
    Unit.prototype.onSelect = function () {
        this.display.setSelected(true);
    };
    Unit.prototype.onDeselect = function () {
        this.display.setSelected(false);
    };
    /** Tells the battle to select this. */
    Unit.prototype.select = function () {
        var battle = this.battle;
        if (battle) {
            battle.selectUnit(this);
        }
    };
    /** Tells the battle to deselect this. */
    Unit.prototype.deselect = function () {
        if (this.selected) {
            this.battle.deselectUnit();
        }
    };
    Unit.prototype.updatePathing = function () {
        var level = this.battle.level;
        var width = level.width;
        var height = level.height;
        var source = this.getNewPathingNode(this.x, this.y);
        source.cost = 0;
        var queue = new BinaryHeap_1.default(PathingNode.scoreFunc, [source]);
        var nodes = new SparseGrid_1.default();
        this.pathableTiles = new SparseGrid_1.default(Number.MAX_VALUE);
        nodes.set(source.x, source.y, source);
        while (!queue.empty) {
            var node = queue.pop();
            this.pathableTiles.set(node.x, node.y, node.cost);
            node.visited = true;
            //console.log(node.x + "," + node.y);
            //check the 4 adjacent tiles
            for (var i = 0; i < 4; i++) {
                var x = node.x + Unit.adjacentOffsets[i][0];
                var y = node.y + Unit.adjacentOffsets[i][1];
                //gotta stay in the grid
                if (x < 0 || x >= width || y < 0 || y >= height)
                    continue;
                //get (or create and set) the pathing node
                var neighbour = nodes.get(x, y);
                var justDiscoveredNeighbour = false;
                if (!neighbour) {
                    neighbour = this.getNewPathingNode(x, y);
                    nodes.set(x, y, neighbour);
                    justDiscoveredNeighbour = true;
                }
                else if (neighbour.visited) {
                    //this neighbour already has its shortest route (or has no route)
                    continue;
                }
                //well duh (though this could be subject to change, if some tiles can only be entered from a certain direction)
                if (!this.canTraverseTile(neighbour.tile)) {
                    neighbour.visited = true;
                    continue;
                }
                var cost = node.cost + this.getCostToTraverseTile(neighbour.tile);
                if (cost > this.moveSpeed)
                    continue;
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
    };
    Unit.prototype.canTraverseTile = function (tile) {
        if (this.isFlying) {
            return tile.isFlyable;
        }
        return tile.isWalkable;
    };
    Unit.prototype.canReachTile = function (x, y) {
        if (this.pathableTiles == null) {
            this.updatePathing();
        }
        return this.pathableTiles.get(x, y) <= this.moveSpeed;
    };
    /** Assumes it CAN traverse this tile! */
    Unit.prototype.getCostToTraverseTile = function (tile) {
        //TODO: based on unit type, etc etc
        if (this.isFlying) {
            return tile.flyCost;
        }
        return tile.walkCost;
    };
    Unit.prototype.getNewPathingNode = function (x, y) {
        var node = new PathingNode();
        var tile = this.battle.level.getTile(x, y);
        node.tile = tile;
        node.x = x;
        node.y = y;
        return node;
    };
    Unit.prototype.initDisplay = function () {
        if (this.display) {
            this.display.cleanUp();
        }
        this.display = new UnitDisplay_1.default();
        this.display.initUnit(this);
        if (this.battle.display) {
            this.battle.display.addUnitDisplay(this.display);
        }
    };
    Unit._nextID = 1;
    Unit.adjacentOffsets = [[-1, 0], [0, -1], [1, 0], [0, 1]];
    return Unit;
}());
exports.default = Unit;
