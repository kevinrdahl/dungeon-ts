"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Game_1 = require("../Game");
var Player_1 = require("./Player");
var Unit_1 = require("./Unit");
var Level_1 = require("./Level");
var IDObjectGroup_1 = require("../util/IDObjectGroup");
var BattleDisplay_1 = require("./display/BattleDisplay");
var SparseGrid_1 = require("../ds/SparseGrid");
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
        this.initialized = false;
        this.unitPositions = new SparseGrid_1.default(null);
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
        get: function () { return this.selectedUnit; },
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
                this.addUnit(unit);
            }
        }
        var now = performance.now();
        for (var _i = 0, _a = this.units.list; _i < _a.length; _i++) {
            var unit = _a[_i];
            unit.updatePathing();
        }
        var timeTaken = performance.now() - now;
        console.log("Computing " + this.units.count + " units pathing took " + timeTaken + "ms");
    };
    Battle.prototype.selectUnit = function (unit) {
        if (unit == this._selectedUnit)
            return;
        this.deselectUnit();
        this._selectedUnit = unit;
        if (unit) {
            unit.onSelect();
            if (this._display) {
                this._display.levelDisplay.clearPathing();
                this._display.levelDisplay.showPathing(unit.pathableTiles);
            }
        }
    };
    Battle.prototype.deselectUnit = function () {
        if (!this._selectedUnit)
            return;
        var unit = this._selectedUnit;
        this._selectedUnit = null;
        unit.onDeselect();
        if (this._display) {
            this._display.levelDisplay.clearPathing();
        }
    };
    Battle.prototype.addPlayer = function (player) {
        this.players.add(player);
        player.battle = this;
    };
    /**
     * I'm pretty sure there will never be a reason to do this...
     */
    Battle.prototype.removePlayer = function (player) {
        this.players.remove(player);
        player.battle = null;
    };
    Battle.prototype.addUnit = function (unit) {
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
    };
    Battle.prototype.removeUnit = function (unit) {
        this.units.remove(unit);
        if (unit.battle == this) {
            unit.battle = null;
        }
    };
    Battle.prototype.getUnitAtPosition = function (x, y) {
        return this.unitPositions.get(x, y);
    };
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
