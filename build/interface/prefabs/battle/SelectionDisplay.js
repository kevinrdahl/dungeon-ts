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
var InterfaceElement_1 = require("../../InterfaceElement");
var Panel_1 = require("../../Panel");
var TextElement_1 = require("../../TextElement");
var Game_1 = require("../../../Game");
var AttachInfo_1 = require("../../AttachInfo");
var GameEvent_1 = require("../../../events/GameEvent");
/**
 * Shows basic information about the currently selected unit.
 * All pretty temporary.
 */
var SelectionDisplay = (function (_super) {
    __extends(SelectionDisplay, _super);
    function SelectionDisplay() {
        var _this = _super.call(this) || this;
        _this.currentUnit = null;
        _this.panel = new Panel_1.default(260, 24 * 3 + 8, Panel_1.default.BASIC);
        _this.nameText = new TextElement_1.default("", TextElement_1.default.mediumText);
        _this.healthText = new TextElement_1.default("", TextElement_1.default.mediumText);
        _this.unitSprite = new PIXI.Sprite(Game_1.default.instance.textureLoader.get("tile/floor"));
        _this.unitSprite.scale = new PIXI.Point(3, 3);
        _this.unitSpriteWrapper = new InterfaceElement_1.default(_this.unitSprite);
        _this.addChild(_this.panel);
        _this.addChild(_this.nameText);
        _this.addChild(_this.healthText);
        _this.addChild(_this.unitSpriteWrapper);
        _this.unitSpriteWrapper.x = 4;
        _this.unitSpriteWrapper.y = 4;
        _this.nameText.positionRelativeTo(_this.unitSpriteWrapper, AttachInfo_1.default.TLtoTR.withOffset(10, 4));
        _this.healthText.positionRelativeTo(_this.nameText, AttachInfo_1.default.TLtoBL.withOffset(0, 6));
        _this.resizeToFitChildren();
        _this.clear();
        return _this;
    }
    SelectionDisplay.prototype.init = function (battleUI) {
        var _this = this;
        //selection
        battleUI.addEventListener(GameEvent_1.default.types.battle.UNITSELECTIONCHANGED, function (e) {
            _this.initUnit(Game_1.default.instance.currentBattle.selectedUnit);
        });
        //hover
        battleUI.addEventListener(GameEvent_1.default.types.battle.HOVERCHANGED, function (e) {
            var hoveredUnit = Game_1.default.instance.currentBattle.getHoveredUnit();
            if (hoveredUnit) {
                _this.initUnit(hoveredUnit);
            }
            else {
                var selectedUnit = Game_1.default.instance.currentBattle.selectedUnit;
                if (selectedUnit)
                    _this.initUnit(selectedUnit);
                else
                    _this.clear();
            }
        });
    };
    SelectionDisplay.prototype.initUnit = function (unit, force) {
        if (force === void 0) { force = false; }
        if (!unit) {
            this.clear();
            this.currentUnit = null;
            return;
        }
        if (unit === this.currentUnit && !force)
            return;
        this.nameText.text = unit.name;
        this.healthText.text = unit.health + "/" + unit.maxHealth;
        this.unitSprite.texture = unit.display.sprite.texture;
        this.visible = true;
        this.currentUnit = unit;
    };
    SelectionDisplay.prototype.clear = function () {
        this.visible = false;
        this.currentUnit = null;
    };
    return SelectionDisplay;
}(InterfaceElement_1.default));
exports.default = SelectionDisplay;
