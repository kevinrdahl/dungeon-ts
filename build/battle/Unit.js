"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var UnitDisplay_1 = require("./display/UnitDisplay");
var BinaryHeap_1 = require("../ds/BinaryHeap");
var SparseGrid_1 = require("../ds/SparseGrid");
var PathingNode = (function () {
    function PathingNode() {
        this.cost = Number.POSITIVE_INFINITY;
        this.hCost = 0;
        this.tile = null;
        this.visited = false;
        this.fromNode = null;
    }
    Object.defineProperty(PathingNode.prototype, "x", {
        get: function () { return this.tile.x; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PathingNode.prototype, "y", {
        get: function () { return this.tile.y; },
        enumerable: true,
        configurable: true
    });
    /** For BinaryHeap */
    PathingNode.scoreFunc = function (node) {
        return node.cost + node.hCost;
    };
    return PathingNode;
}());
var Unit = (function () {
    function Unit() {
        this.player = null;
        this.battle = null;
        this.display = null;
        this.x = 0;
        this.y = 0;
        this.moveSpeed = 3;
        this.actionsRemaining = 2;
        this.actionsPerTurn = 2;
        this.isFlying = false;
        this.attackRangeMin = 1;
        this.attackRangeMax = 2;
        this.attackDamage = 2;
        this.health = 5;
        this.maxHealth = 5;
        this.name = "?";
        this.hero = null;
        this.monster = null;
        this.pathableTiles = null; //x,y is the number of actions required to get to x,y
        this.attackableTiles = null; //0 or 1
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
    Object.defineProperty(Unit.prototype, "alive", {
        get: function () { return this.health > 0; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Unit.prototype, "injured", {
        get: function () { return this.health < this.maxHealth; },
        enumerable: true,
        configurable: true
    });
    Unit.prototype.initAsHero = function (hero) {
        this.monster = null;
        this.hero = hero;
        this.name = hero.name;
    };
    Unit.prototype.initAsMonster = function (monster) {
        this.hero = null;
        this.monster = monster;
        this.name = monster.name;
    };
    Unit.prototype.onAddToBattle = function () {
        if (this.battle.visible) {
            this.initDisplay();
        }
    };
    Unit.prototype.onSelect = function () {
        if (this.display)
            this.display.setSelected(true);
    };
    Unit.prototype.onDeselect = function () {
        if (this.display)
            this.display.setSelected(false);
    };
    /**The number of remaining actions has changed */
    Unit.prototype.onActionsChanged = function () {
        if (this.display)
            this.display.updateActions();
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
    Unit.prototype.updatePosition = function () {
        if (this.display) {
            this.display.updatePosition();
        }
    };
    Unit.prototype.takeDamage = function (amount, fromUnit) {
        console.log(this + " takes " + amount + " damage from " + fromUnit);
        this.health -= amount;
        if (this.health < 0)
            this.health = 0;
        if (this.health == 0) {
            //die!
            this.kill();
            console.log(this + " dies!");
        }
    };
    Unit.prototype.kill = function () {
        this.battle.onUnitDeath(this);
    };
    /**
     * Updates this Unit's public pathableTiles variable, which lists the minimum cost to get to
     * nearby tiles.
     */
    Unit.prototype.updatePathing = function () {
        //It's dijkstra with a priority queue and lazy node discovery.
        var level = this.battle.level;
        var width = level.width;
        var height = level.height;
        var maxDist = this.moveSpeed * this.actionsRemaining; //sprint!
        var source = this.getNewPathingNode(this.x, this.y);
        source.cost = 0;
        var queue = new BinaryHeap_1.default(PathingNode.scoreFunc, [source]);
        var nodes = new SparseGrid_1.default();
        this.pathableTiles = new SparseGrid_1.default(Number.POSITIVE_INFINITY);
        this.attackableTiles = new SparseGrid_1.default(0);
        nodes.set(source.x, source.y, source);
        while (!queue.empty) {
            var node = queue.pop();
            var actionsRequired = Math.ceil(node.cost / this.moveSpeed);
            this.pathableTiles.set(node.x, node.y, actionsRequired);
            if (actionsRequired == 1)
                this.getAttackableTiles(node.x, node.y, this.attackableTiles);
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
                if (cost > maxDist)
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
    /** For each tile that can be attacked from the given position, writes them to the provided grid, and returns it */
    Unit.prototype.getAttackableTiles = function (fromX, fromY, toGrid) {
        if (toGrid === void 0) { toGrid = null; }
        var minRange = this.attackRangeMin;
        var maxRange = this.attackRangeMax;
        var dist = 0;
        var x, y;
        var width = this.battle.level.width;
        var height = this.battle.level.height;
        var tile;
        if (toGrid == null) {
            toGrid = new SparseGrid_1.default();
        }
        for (var yOffset = -maxRange; yOffset <= maxRange; yOffset++) {
            for (var xOffset = -maxRange; xOffset <= maxRange; xOffset++) {
                x = fromX + xOffset;
                y = fromY + yOffset;
                if (x < 0 || y < 0 || x >= width || y >= height)
                    continue;
                tile = this.battle.level.getTile(x, y);
                if (!tile.isPathable)
                    continue;
                dist = Math.abs(xOffset) + Math.abs(yOffset);
                if (dist >= minRange && dist <= maxRange) {
                    toGrid.set(x, y, 1);
                }
            }
        }
        return toGrid;
    };
    /**
     * Gets the coordinates from which this unit should attack the other unit. Assumes it can get there.
     */
    Unit.prototype.getPositionToAttackUnit = function (unit) {
        var _this = this;
        var grid = this.pathableTiles.filter(function (x, y, val) {
            var dist = Math.abs(x - unit.x) + Math.abs(y - unit.y);
            if (dist >= _this.attackRangeMin && dist <= _this.attackRangeMax) {
                var cost = _this.actionsToReachTile(x, y);
                //need at least 1 action to attack
                if (_this.actionsRemaining - cost > 0) {
                    return !_this.battle.getUnitAtPosition(x, y);
                }
            }
            return false;
        });
        var allCoords = grid.getAllCoordinates();
        var closestCoords = null;
        var leastDist = Number.POSITIVE_INFINITY;
        for (var _i = 0, allCoords_1 = allCoords; _i < allCoords_1.length; _i++) {
            var coords = allCoords_1[_i];
            var dist = Math.sqrt(Math.pow(coords[0] - this.x, 2) + Math.pow(coords[1] - this.y, 2));
            if (dist < leastDist) {
                closestCoords = coords;
                leastDist = dist;
            }
        }
        return closestCoords;
    };
    Unit.prototype.actionsToReachTile = function (x, y) {
        if (!this.pathableTiles)
            this.updatePathing();
        return this.pathableTiles.get(x, y);
    };
    Unit.prototype.getPathToPosition = function (targetX, targetY, maxDist, fromX, fromY) {
        //A*
        //todo: add additional heuristic cost based on environment hazards
        if (maxDist === void 0) { maxDist = 100000; }
        if (fromX === void 0) { fromX = Number.NEGATIVE_INFINITY; }
        if (fromY === void 0) { fromY = Number.NEGATIVE_INFINITY; }
        //var startTime = performance.now();
        if (fromX == Number.NEGATIVE_INFINITY)
            fromX = this.x;
        if (fromY == Number.NEGATIVE_INFINITY)
            fromY = this.y;
        var level = this.battle.level;
        var width = level.width;
        var height = level.height;
        var xIsLongest = (Math.abs(targetX - fromX) > Math.abs(targetY - fromY));
        var source = this.getNewPathingNode(fromX, fromY);
        source.cost = 0;
        var queue = new BinaryHeap_1.default(PathingNode.scoreFunc, [source]);
        var nodes = new SparseGrid_1.default();
        nodes.set(source.x, source.y, source);
        while (!queue.empty) {
            var node = queue.pop();
            if (node.x === targetX && node.y === targetY) {
                var route = this.traceRoute(node);
                //var endTime = performance.now();
                //console.log("Computed path from " + fromX + "," + fromY + " to " + targetX + "," + targetY + " in " + (endTime - startTime) + "ms");
                return route;
            }
            //this.pathableTiles.set(node.x, node.y, true);
            node.visited = true;
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
                    //hCost is the line distance...
                    neighbour.hCost = Math.sqrt(Math.pow(x - targetX, 2) + Math.pow(y - targetY, 2));
                    //...but favour moving along the longest axis
                    if (!xIsLongest) {
                        neighbour.hCost += Math.abs(neighbour.x - targetX);
                    }
                    else {
                        neighbour.hCost += Math.abs(neighbour.y - targetY);
                    }
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
                //if (cost > this.moveSpeed) continue;
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
    };
    Unit.prototype.traceRoute = function (node) {
        var route = [];
        while (node != null) {
            route.unshift([node.x, node.y]);
            node = node.fromNode;
        }
        return route;
    };
    Unit.prototype.canAct = function () {
        return this.actionsRemaining > 0;
    };
    Unit.prototype.canTraverseTile = function (tile) {
        //can't enter enemy tiles!
        var currentUnit = this.battle.getUnitAtPosition(tile.x, tile.y);
        if (currentUnit && currentUnit.player != this.player) {
            return false;
        }
        if (this.isFlying) {
            return tile.isFlyable;
        }
        return tile.isWalkable;
    };
    Unit.prototype.canReachTile = function (x, y) {
        if (this.pathableTiles == null) {
            this.updatePathing();
        }
        return this.pathableTiles.get(x, y) <= this.actionsRemaining;
    };
    /** Irrespective of actions, range and such. Currently "belongs to a different player from" */
    Unit.prototype.isHostileToUnit = function (unit) {
        return this.player != unit.player;
    };
    Unit.prototype.inRangeToAttack = function (unit) {
        var range = Math.abs(unit.x - this.x) + Math.abs(unit.y - this.y);
        if (range >= this.attackRangeMin && range <= this.attackRangeMax) {
            return true;
        }
        return false;
    };
    Unit.prototype.getAttackableNonWalkableTiles = function () {
        if (this.pathableTiles == null) {
            this.updatePathing();
        }
        return this.attackableTiles.getComplement(this.pathableTiles);
    };
    /** Assumes it CAN traverse this tile! */
    Unit.prototype.getCostToTraverseTile = function (tile) {
        //TODO: based on unit type, etc etc
        //maybe make it cost more when adjacent to an enemy
        if (this.isFlying) {
            return tile.flyCost;
        }
        return tile.walkCost;
    };
    Unit.prototype.getNewPathingNode = function (x, y) {
        var node = new PathingNode();
        var tile = this.battle.level.getTile(x, y);
        node.tile = tile;
        return node;
    };
    Unit.prototype.initDisplay = function () {
        if (this.display) {
            this.display.cleanup();
        }
        this.display = new UnitDisplay_1.default();
        this.display.initUnit(this);
        if (this.battle.display) {
            this.battle.display.addUnitDisplay(this.display);
        }
    };
    Unit.prototype.toString = function () {
        return "Unit " + this.id + ' "' + this.name + '"';
    };
    Unit._nextID = 1;
    Unit.adjacentOffsets = [[-1, 0], [1, 0], [0, -1], [0, 1]];
    return Unit;
}());
exports.default = Unit;
