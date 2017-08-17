"use strict";
/// <reference path="../../declarations/pixi.js.d.ts"/>
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
var Game_1 = require("../../Game");
var InputManager_1 = require("../../interface/InputManager");
var Globals_1 = require("../../Globals");
var BattleDisplay = (function (_super) {
    __extends(BattleDisplay, _super);
    function BattleDisplay() {
        var _this = _super.call(this) || this;
        _this._unitContainer = new PIXI.Container();
        _this._unitDisplays = [];
        _this._levelDisplay = null;
        _this.mouseGridX = Number.NEGATIVE_INFINITY;
        _this.mouseGridY = Number.NEGATIVE_INFINITY;
        _this.hoveredUnitDisplay = null;
        return _this;
    }
    Object.defineProperty(BattleDisplay.prototype, "battle", {
        get: function () { return this._battle; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(BattleDisplay.prototype, "levelDisplay", {
        get: function () { return this._levelDisplay; },
        enumerable: true,
        configurable: true
    });
    BattleDisplay.prototype.init = function (battle) {
        this._battle = battle;
        this.addChild(this._unitContainer);
        Game_1.default.instance.updater.add(this);
    };
    BattleDisplay.prototype.setLevelDisplay = function (display) {
        if (this._levelDisplay) {
            //dispose of it somehow
        }
        this._levelDisplay = display;
        this.addChildAt(display, 0); //want it below units, obviously
    };
    BattleDisplay.prototype.addUnitDisplay = function (display) {
        this._unitContainer.addChild(display);
        if (this._unitDisplays.indexOf(display) == -1) {
            this._unitDisplays.push(display);
        }
    };
    BattleDisplay.prototype.removeUnitDisplay = function (display) {
        if (display.parent == this._unitContainer) {
            this._unitContainer.removeChild(display);
        }
        var index = this._unitDisplays.indexOf(display);
        if (index > -1) {
            this._unitDisplays.splice(index, 1);
        }
    };
    BattleDisplay.prototype.update = function (timeElapsed) {
        //check mouse position, and highlight things
        var mouseCoords = InputManager_1.default.instance.mouseCoords;
        var local = this.toLocal(new PIXI.Point(mouseCoords.x, mouseCoords.y));
        var x = Math.floor(local.x / Globals_1.default.gridSize);
        var y = Math.floor(local.y / Globals_1.default.gridSize);
        if (x != this.mouseGridX || y != this.mouseGridY) {
            this.mouseGridX = x;
            this.mouseGridY = y;
            this.updateHover();
        }
    };
    BattleDisplay.prototype.onLeftClick = function (coords) {
        var unitClicked = false;
        for (var _i = 0, _a = this._unitDisplays; _i < _a.length; _i++) {
            var display = _a[_i];
            if (display.getBounds().contains(coords.x, coords.y)) {
                display.onClick();
                unitClicked = true;
            }
        }
        if (!unitClicked) {
            this._battle.deselectUnit();
        }
    };
    BattleDisplay.prototype.updateHover = function () {
        if (this.hoveredUnitDisplay) {
            this.hoveredUnitDisplay.onMouseOut();
        }
        for (var _i = 0, _a = this._unitDisplays; _i < _a.length; _i++) {
            var display = _a[_i];
            if (display.unit.x == this.mouseGridX && display.unit.y == this.mouseGridY) {
                this.hoveredUnitDisplay = display;
                display.onMouseOver();
                break;
            }
        }
        this.battle.hoverTile(this.mouseGridX, this.mouseGridY);
    };
    return BattleDisplay;
}(PIXI.Container));
exports.default = BattleDisplay;
