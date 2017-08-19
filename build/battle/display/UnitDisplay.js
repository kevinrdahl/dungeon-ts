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
var UnitDisplay = (function (_super) {
    __extends(UnitDisplay, _super);
    function UnitDisplay() {
        var _this = _super.call(this) || this;
        _this.sprite = null;
        _this.shadowSprite = null;
        _this.idText = null;
        _this.hover = false;
        _this.selected = false;
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
            this.shadowSprite.y = 4;
        }
        var tex = Game_1.default.instance.textureLoader.get(texName);
        this.sprite = new PIXI.Sprite(tex);
        this.sprite.x = -1;
        this.addChild(this.sprite);
        this.idText = new PIXI.Text(unit.id.toString(), TextUtil.styles.unitID);
        this.addChild(this.idText);
        this.updatePosition();
        //Game.instance.updater.add(this, true);
    };
    UnitDisplay.prototype.update = function (timeElapsed) {
        //yup the updater works
        //this.rotation += (Math.PI / 180) * 45 * timeElapsed;
    };
    UnitDisplay.prototype.updatePosition = function () {
        this.x = this.unit.x * Globals_1.default.gridSize;
        this.y = this.unit.y * Globals_1.default.gridSize - 9;
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
    return UnitDisplay;
}(PIXI.Container));
exports.default = UnitDisplay;