"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var Game_1 = require("../Game");
var Player_1 = require("./Player");
var Unit_1 = require("./Unit");
var Level_1 = require("./Level");
var IDObjectGroup_1 = require("../util/IDObjectGroup");
var BattleDisplay_1 = require("./display/BattleDisplay");
var SparseGrid_1 = require("../ds/SparseGrid");
var Animation_1 = require("./display/animation/Animation");
var GameEvent_1 = require("../events/GameEvent");
var GameEventHandler_1 = require("../events/GameEventHandler");
var Battle = (function (_super) {
    __extends(Battle, _super);
    /**
     * It's a battle!
     * @param visible Determines whether this Battle should be displayed. False for peer authentication if I ever get around to it.
     */
    function Battle(visible) {
        if (visible === void 0) { visible = true; }
        var _this = _super.call(this) || this;
        _this.players = new IDObjectGroup_1.default();
        _this.units = new IDObjectGroup_1.default();
        _this.level = null;
        _this._display = null;
        _this._selectedUnit = null;
        _this._currentPlayer = null;
        _this.initialized = false;
        _this.unitPositions = new SparseGrid_1.default(null);
        _this._turnNumber = 0;
        _this._ended = false;
        _this._winner = null;
        //animation
        _this.animationSequence = null;
        _this._animating = false;
        _this._visible = visible;
        return _this;
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
    Object.defineProperty(Battle.prototype, "animating", {
        get: function () { return this._animating; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Battle.prototype, "turnNumber", {
        get: function () { return this._turnNumber; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Battle.prototype, "ended", {
        get: function () { return this._ended; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Battle.prototype, "winner", {
        get: function () { return this._winner; },
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
        this.display.updatePathingDisplay();
        this.display.updatePathingHover();
    };
    ////////////////////////////////////////////////////////////
    // Player actions
    ////////////////////////////////////////////////////////////
    Battle.prototype.selectUnit = function (unit) {
        if (unit == this._selectedUnit)
            return;
        this.deselectUnit(false);
        this._selectedUnit = unit;
        if (unit) {
            unit.onSelect();
        }
        this.sendNewEvent(GameEvent_1.default.types.battle.UNITSELECTIONCHANGED);
    };
    Battle.prototype.deselectUnit = function (sendEvent) {
        if (sendEvent === void 0) { sendEvent = true; }
        if (!this._selectedUnit)
            return;
        var unit = this._selectedUnit;
        this._selectedUnit = null;
        unit.onDeselect();
        if (sendEvent)
            this.sendNewEvent(GameEvent_1.default.types.battle.UNITSELECTIONCHANGED);
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
        target.takeDamage(attacker.attackDamage, attacker);
        var onHit = Animation_1.default.unitTakeDamage(target);
        if (!target.alive) {
            onHit.then(Animation_1.default.unitDie(target));
        }
        var animation = Animation_1.default.unitAttack(attacker, target, onHit);
        this.queueAnimation(animation);
        //there will be a LOT to change here
        this.onUnitAction(attacker);
    };
    Battle.prototype.beginTurn = function (player) {
        if (this._currentPlayer != null) {
            this.endTurn();
        }
        if (this.players.list.indexOf(player) === 0) {
            this._turnNumber += 1;
        }
        this._currentPlayer = player;
        if (this._display) {
            this._display.updateDebugPanel();
        }
    };
    Battle.prototype.endTurn = function () {
        var _this = this;
        this.deselectUnit();
        if (this._currentPlayer) {
            for (var _i = 0, _a = this._currentPlayer.units.list; _i < _a.length; _i++) {
                var unit = _a[_i];
                unit.actionsRemaining = unit.actionsPerTurn;
                unit.onActionsChanged();
            }
        }
        var action = function (callback) {
            if (_this.display) {
                _this.display.showTurnBegin(callback);
            }
            else {
                callback();
            }
        };
        var anim = new Animation_1.default(action);
        this.queueAnimation(anim);
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
        this.checkEndBattle();
        if (!this.ended) {
            if (this.shouldForceEndTurn()) {
                this.endTurn();
            }
        }
    };
    Battle.prototype.initAnimation = function () {
        this.animationSequence = null;
        this._animating = false;
    };
    Battle.prototype.beginAnimation = function () {
        var _this = this;
        if (this._animating || this.animationSequence == null)
            return;
        this._animating = true;
        this.sendNewEvent(GameEvent_1.default.types.battle.ANIMATIONSTART);
        this.animationSequence.start(function () {
            _this.onAnimationComplete();
        });
    };
    Battle.prototype.onAnimationComplete = function () {
        this._animating = false;
        this.sendNewEvent(GameEvent_1.default.types.battle.ANIMATIONCOMPLETE);
    };
    Battle.prototype.queueAnimation = function (animation) {
        if (this.animationSequence == null) {
            this.animationSequence = Animation_1.default.noop();
            this.animationSequence.mode = Animation_1.default.modes.sequential;
        }
        this.animationSequence.then(animation);
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
    /**
     * Sees if the battle should end, and if it should, ends it
     */
    Battle.prototype.checkEndBattle = function () {
        var _this = this;
        if (this._ended)
            return;
        var undefeated = this.players.list.filter(function (player) {
            return !player.checkDefeated();
        });
        if (undefeated.length == 1) {
            this._ended = true;
            this._winner = undefeated[0];
        }
        if (this._ended) {
            var action = function (callback) {
                if (_this.display) {
                    _this.display.showEndGame(callback);
                }
                else {
                    callback();
                }
            };
            var anim = new Animation_1.default(action);
            this.queueAnimation(anim);
        }
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
        if (this.animating)
            return;
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
                else if (unit.actionsRemaining > 1) {
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
}(GameEventHandler_1.default));
exports.default = Battle;
