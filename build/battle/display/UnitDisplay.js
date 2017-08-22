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
var TextUtil = require("../../util/TextUtil");
var Globals_1 = require("../../Globals");
var TracePathInfo = (function () {
    function TracePathInfo() {
        this.timeElapsed = 0;
        this.duration = 0;
        this.callback = null;
    }
    return TracePathInfo;
}());
var UnitDisplay = (function (_super) {
    __extends(UnitDisplay, _super);
    function UnitDisplay() {
        var _this = _super.call(this) || this;
        _this.sprite = null;
        _this.shadowSprite = null;
        _this.idText = null;
        _this.hover = false;
        _this.selected = false;
        _this.tracePathInfo = null;
        _this.unit = null;
        return _this;
    }
    UnitDisplay.prototype.initUnit = function (unit) {
        this.unit = unit;
        if (this.sprite) {
            if (this.sprite.parent)
                this.sprite.parent.removeChild(this.sprite);
            this.sprite.destroy();
        }
        if (this.idText) {
            if (this.idText.parent)
                this.idText.parent.removeChild(this.sprite);
            this.idText.destroy();
        }
        var texName;
        switch (unit.player.id) {
            case 1:
                texName = "character/rogue";
                break;
            case 2:
                texName = "character/wizard";
                break;
            default: texName = "character/rogue";
        }
        if (!this.shadowSprite) {
            this.shadowSprite = new PIXI.Sprite(Game_1.default.instance.textureLoader.get("character/shadow"));
            this.addChildAt(this.shadowSprite, 0);
            this.shadowSprite.y = -5;
        }
        var tex = Game_1.default.instance.textureLoader.get(texName);
        this.sprite = new PIXI.Sprite(tex);
        this.sprite.x = -1;
        this.sprite.y = -9;
        this.addChild(this.sprite);
        this.idText = new PIXI.Text(unit.id.toString(), TextUtil.styles.unitID);
        this.addChild(this.idText);
        this.updatePosition();
        Game_1.default.instance.updater.add(this, true);
    };
    UnitDisplay.prototype.update = function (timeElapsed) {
        this.updateMovement(timeElapsed);
    };
    UnitDisplay.prototype.tracePath = function (path, duration, callback) {
        var info = new TracePathInfo();
        info.path = path;
        info.duration = duration;
        info.callback = callback;
        this.tracePathInfo = info;
        //then it's taken care of in update
    };
    UnitDisplay.prototype.updatePosition = function () {
        this.x = this.unit.x * Globals_1.default.gridSize;
        this.y = this.unit.y * Globals_1.default.gridSize;
    };
    UnitDisplay.prototype.updateActions = function () {
        this.updateState();
    };
    UnitDisplay.prototype.cleanUp = function () {
        if (this.parent) {
            this.parent.removeChild(this);
        }
    };
    UnitDisplay.prototype.onClick = function () {
        this.unit.select();
    };
    UnitDisplay.prototype.setSelected = function (selected) {
        this.selected = selected;
        this.updateState();
    };
    UnitDisplay.prototype.onMouseOver = function () {
        this.hover = true;
        this.updateState();
    };
    UnitDisplay.prototype.onMouseOut = function () {
        this.hover = false;
        this.updateState();
    };
    UnitDisplay.prototype.updateState = function () {
        var noActions = (this.unit.actionsRemaining == 0);
        if (this.selected && !noActions) {
            this.sprite.tint = 0x00ff00;
        }
        else {
            if (noActions) {
                this.sprite.tint = 0x666666;
            }
            else if (this.hover) {
                this.sprite.tint = 0xaaffaa;
            }
            else {
                this.sprite.tint = 0xffffff;
            }
        }
    };
    UnitDisplay.prototype.updateMovement = function (timeElapsed) {
        if (this.tracePathInfo) {
            var info = this.tracePathInfo;
            info.timeElapsed = Math.min(info.duration, info.timeElapsed + timeElapsed);
            if (info.timeElapsed >= info.duration) {
                var pos = info.path[info.path.length - 1];
                this.setGridPosition(pos[0], pos[1]);
                this.tracePathInfo = null; //done
                if (info.callback) {
                    info.callback();
                }
            }
            else {
                var numCells = info.path.length - 1; //don't include the start cell
                var timePerCell = info.duration / numCells;
                var cellsMoved = Math.floor(info.timeElapsed / timePerCell);
                var progress = (info.timeElapsed - (cellsMoved * timePerCell)) / timePerCell;
                var pos1 = info.path[cellsMoved];
                var pos2 = info.path[cellsMoved + 1];
                var x = pos1[0] + (pos2[0] - pos1[0]) * progress;
                var y = pos1[1] + (pos2[1] - pos1[1]) * progress;
                this.setGridPosition(x, y);
            }
        }
    };
    UnitDisplay.prototype.setGridPosition = function (x, y) {
        x *= Globals_1.default.gridSize;
        y *= Globals_1.default.gridSize;
        this.position.set(x, y);
    };
    return UnitDisplay;
}(PIXI.Container));
exports.default = UnitDisplay;
