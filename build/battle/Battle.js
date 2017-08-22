"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Game_1 = require("../Game");
var Player_1 = require("./Player");
var Unit_1 = require("./Unit");
var Level_1 = require("./Level");
var IDObjectGroup_1 = require("../util/IDObjectGroup");
var BattleDisplay_1 = require("./display/BattleDisplay");
var SparseGrid_1 = require("../ds/SparseGrid");
var Animation_1 = require("./display/animation/Animation");
var Battle = (function () {
    /**
     * It's a battle!
     * @param visible Determines whether this Battle should be displayed. False for peer authentication if I ever get around to it.
     */
    function Battle(visible) {
        if (visible === void 0) { visible = true; }
        this.players = new IDObjectGroup_1.default();
        this.units = new IDObjectGroup_1.default();
        this.level = null;
        this._display = null;
        this._selectedUnit = null;
        this._currentPlayer = null;
        this.initialized = false;
        this.unitPositions = new SparseGrid_1.default(null);
        this._animationTime = 0;
        this.firstAnimation = null;
        this.lastAnimation = null;
        this.animating = false;
        this._visible = visible;
    }
    Object.defineProperty(Battle.prototype, "visible", {
        get: function () { return this._visible; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Battle.prototype, "display", {
        get: function () { return this._display; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Battle.prototype, "selectedUnit", {
        get: function () { return this._selectedUnit; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Battle.prototype, "currentPlayer", {
        get: function () { return this._currentPlayer; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Battle.prototype, "animationTime", {
        get: function () { return this._animationTime; },
        enumerable: true,
        configurable: true
    });
    Battle.prototype.init = function () {
        if (this.initialized)
            return;
        this.initialized = true;
        console.log("Battle: init");
        this.initLevel();
        if (this._visible) {
            this.initDisplay();
            this.level.initDisplay();
            this.display.setLevelDisplay(this.level.display);
        }
        //temp! add a couple players with a few units
        for (var i = 0; i < 2; i++) {
            var player = new Player_1.default();
            this.addPlayer(player);
            for (var j = 0; j < 3; j++) {
                var unit = new Unit_1.default();
                unit.x = 1 + j;
                unit.y = 1 + i * 2;
                player.addUnit(unit);
                this.addUnit(unit, false);
            }
        }
        this.beginTurn(this.players.list[0]);
        this.updateAllUnitPathing();
    };
    ////////////////////////////////////////////////////////////
    // Player actions
    ////////////////////////////////////////////////////////////
    Battle.prototype.selectUnit = function (unit) {
        if (unit == this._selectedUnit)
            return;
        this.deselectUnit();
        this._selectedUnit = unit;
        if (unit) {
            unit.onSelect();
        }
    };
    Battle.prototype.deselectUnit = function () {
        if (!this._selectedUnit)
            return;
        var unit = this._selectedUnit;
        this._selectedUnit = null;
        unit.onDeselect();
    };
    Battle.prototype.moveUnit = function (unit, x, y, path) {
        if (path === void 0) { path = null; }
        //This is going to have to step through the whole path and see what triggers
        //(once that sort of thing is implemented, anyway)
        this.unitPositions.unset(unit.x, unit.y);
        this.unitPositions.set(x, y, unit);
        unit.x = x;
        unit.y = y;
        var display = unit.display;
        if (display) {
            /*var timeTaken = Globals.timeToTraverseTile * (path.length - 1); //-1 since path includes the start cell
            if (this._animationTime > 0) {
                var timer = new Timer().init(this._animationTime, ()=> {
                    display.tracePath(path, timeTaken);;
                }).start();
            } else {
                display.tracePath(path, timeTaken);
            }

            this._animationTime += timeTaken;*/
            var animation = Animation_1.default.moveUnit(unit, path);
            this.queueAnimation(animation);
        }
        this.onUnitAction(unit);
        this.updateAllUnitPathing();
    };
    Battle.prototype.attackUnit = function (attacker, target) {
        if (!attacker.selected || !this.ownUnitSelected()) {
            console.log("Battle: " + attacker + " isn't selected by the current player");
            return;
        }
        if (attacker.actionsRemaining <= 0) {
            console.log("Battle: " + attacker + " is out of actions");
        }
        if (!attacker.inRangeToAttack(target)) {
            console.log("Battle: " + attacker + " isn't in range to attack " + target);
            return;
        }
        var animation = Animation_1.default.attackUnit(attacker, target);
        this.queueAnimation(animation);
        //there will be a LOT to change here
        target.takeDamage(attacker.attackDamage, attacker);
        this.onUnitAction(attacker);
    };
    Battle.prototype.beginTurn = function (player) {
        if (this._currentPlayer != null) {
            this.endTurn();
        }
        this._currentPlayer = player;
        if (this._display) {
            this._display.updateDebugPanel();
        }
    };
    Battle.prototype.endTurn = function () {
        this.deselectUnit();
        if (this._currentPlayer) {
            for (var _i = 0, _a = this._currentPlayer.units.list; _i < _a.length; _i++) {
                var unit = _a[_i];
                unit.actionsRemaining = unit.actionsPerTurn;
                unit.onActionsChanged();
            }
        }
        //select next player and start their turn
        var index = (this._currentPlayer != null) ? (this.players.list.indexOf(this._currentPlayer) + 1) % this.players.count : 0;
        this._currentPlayer = null;
        this.beginTurn(this.players.list[index]);
    };
    ////////////////////////////////////////////////////////////
    // Events
    ////////////////////////////////////////////////////////////
    Battle.prototype.onUnitDeath = function (unit) {
        this.removeUnit(unit);
        if (unit.player) {
            unit.player.removeUnit(unit);
        }
    };
    /** The unit has just completed an action */
    Battle.prototype.onUnitAction = function (unit) {
        unit.actionsRemaining -= 1;
        if (unit.actionsRemaining <= 0) {
            //update the unit display somehow
            if (unit.selected) {
                this.deselectUnit();
            }
        }
        if (this.shouldForceEndTurn()) {
            this.endTurn();
        }
    };
    Battle.prototype.initAnimation = function () {
        this.firstAnimation = null;
        this.lastAnimation = null;
        this.animating = false;
    };
    Battle.prototype.beginAnimation = function () {
        var _this = this;
        if (this.animating || this.firstAnimation == null)
            return;
        this.animating = true;
        this.firstAnimation.start(function () {
            _this.animating = false;
        });
    };
    Battle.prototype.queueAnimation = function (animation) {
        if (this.firstAnimation == null) {
            this.firstAnimation = animation;
            this.lastAnimation = animation;
        }
        else {
            this.lastAnimation.then(animation);
            this.lastAnimation = animation;
        }
    };
    ////////////////////////////////////////////////////////////
    // Book keeping
    ////////////////////////////////////////////////////////////
    Battle.prototype.updateAllUnitPathing = function () {
        var now = performance.now();
        for (var _i = 0, _a = this.units.list; _i < _a.length; _i++) {
            var unit = _a[_i];
            unit.updatePathing();
        }
        var timeTaken = performance.now() - now;
        console.log("Updating pathing for " + this.units.count + " units took " + timeTaken + "ms");
    };
    ////////////////////////////////////////////////////////////
    // Convenience functions for checking state
    ////////////////////////////////////////////////////////////
    Battle.prototype.getUnitAtPosition = function (x, y) {
        return this.unitPositions.get(x, y);
    };
    Battle.prototype.ownUnitSelected = function () {
        if (this._currentPlayer && this._selectedUnit && this._selectedUnit.player == this._currentPlayer) {
            return true;
        }
        return false;
    };
    Battle.prototype.shouldForceEndTurn = function () {
        return this.getUnitsWithActions().length == 0;
    };
    ////////////////////////////////////////////////////////////
    // Adding and removing things
    ////////////////////////////////////////////////////////////
    Battle.prototype.addPlayer = function (player) {
        this.players.add(player);
        player.battle = this;
    };
    /** I'm pretty sure there will never be a reason to do this... */
    Battle.prototype.removePlayer = function (player) {
        this.players.remove(player);
        player.battle = null;
    };
    Battle.prototype.addUnit = function (unit, updatePathing) {
        if (updatePathing === void 0) { updatePathing = true; }
        if (this.units.contains(unit)) {
            return;
        }
        var currentUnit = this.unitPositions.get(unit.x, unit.y);
        if (currentUnit) {
            console.log("Battle: can't add unit " + unit.id + " (unit " + currentUnit.id + " already occupies " + unit.x + ", " + unit.y + ")");
            return;
        }
        this.units.add(unit);
        this.unitPositions.set(unit.x, unit.y, unit);
        unit.battle = this;
        unit.onAddToBattle();
        if (updatePathing) {
            this.updateAllUnitPathing();
        }
    };
    Battle.prototype.removeUnit = function (unit) {
        if (unit.selected) {
            this.deselectUnit();
        }
        this.units.remove(unit);
        this.unitPositions.unset(unit.x, unit.y);
        if (unit.battle == this) {
            unit.battle = null;
        }
        unit.onRemoveFromBattle();
        this.updateAllUnitPathing();
    };
    ////////////////////////////////////////////////////////////
    // Getting things
    ////////////////////////////////////////////////////////////
    Battle.prototype.getUnitsWithActions = function () {
        var ret = [];
        if (this._currentPlayer) {
            for (var _i = 0, _a = this.currentPlayer.units.list; _i < _a.length; _i++) {
                var unit = _a[_i];
                if (unit.canAct()) {
                    ret.push(unit);
                }
            }
        }
        return ret;
    };
    Battle.prototype.getDebugPanelStrings = function () {
        var ret = [
            "Current player: " + this._currentPlayer.id,
            "Selected: " + this._selectedUnit
        ];
        var coords = this.display.hoverCoords;
        var hoverStrings = [coords.toString()];
        var tile = this.level.getTile(coords.x, coords.y);
        if (tile) {
            hoverStrings.push(tile.name);
        }
        var unit = this.getUnitAtPosition(coords.x, coords.y);
        if (unit) {
            hoverStrings.push(unit.toString());
        }
        ret.push("Hover: " + JSON.stringify(hoverStrings));
        return ret;
    };
    ////////////////////////////////////////////////////////////
    // Input
    ////////////////////////////////////////////////////////////
    /** Perform the default action for that tile */
    Battle.prototype.rightClickTile = function (x, y) {
        var unit = this._selectedUnit;
        if (this.ownUnitSelected() && unit.canAct()) {
            this.initAnimation();
            var tileUnit = this.getUnitAtPosition(x, y);
            if (!tileUnit && unit.canReachTile(x, y)) {
                this.moveUnit(unit, x, y, unit.getPathToPosition(x, y));
            }
            else if (tileUnit && unit.isHostileToUnit(tileUnit)) {
                if (unit.inRangeToAttack(tileUnit)) {
                    this.attackUnit(unit, tileUnit);
                }
                else {
                    var pos = unit.getPositionToAttackUnit(tileUnit);
                    if (pos) {
                        this.moveUnit(unit, pos[0], pos[1], unit.getPathToPosition(pos[0], pos[1]));
                        this.attackUnit(unit, tileUnit);
                    }
                }
            }
            this.beginAnimation();
        }
    };
    ////////////////////////////////////////////////////////////
    // Init
    ////////////////////////////////////////////////////////////
    Battle.prototype.initLevel = function () {
        this.level = new Level_1.default();
        this.level.init();
    };
    Battle.prototype.initDisplay = function () {
        console.log("Battle: init display");
        this._display = new BattleDisplay_1.default();
        this._display.init(this);
        Game_1.default.instance.stage.addChildAt(this._display, 0);
        this._display.scale.set(3, 3);
    };
    return Battle;
}());
exports.default = Battle;
