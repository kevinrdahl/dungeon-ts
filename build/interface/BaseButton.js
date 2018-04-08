"use strict";
/// <reference path="../declarations/pixi.js.d.ts"/>
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
var InterfaceElement_1 = require("./InterfaceElement");
var GameEvent_1 = require("../events/GameEvent");
var BaseButton = (function (_super) {
    __extends(BaseButton, _super);
    /**
     * It's a button! Click it!
     * Use the LEFTMOUSECLICK event to listen for clicks.
     * Can't assume it owns its textures, so it doesn't destroy them. Don't use this class directly.
     */
    function BaseButton(normalTex, highlightTex, disabledTex) {
        var _this = _super.call(this) || this;
        _this.onMouseOver = function (e) {
            if (_this.enabled) {
                _this.setHighlight();
            }
        };
        _this.onMouseOut = function (e) {
            if (_this.enabled) {
                _this.setNormal();
            }
        };
        _this.onLeftMouseClick = function (e) {
            //TODO: sound?
        };
        _this._className = "BaseButton";
        _this._debugColor = 0xff66ff;
        _this.clickable = true;
        _this._state = BaseButton.STATE_NORMAL;
        _this._normalTex = normalTex;
        _this._highlightTex = highlightTex;
        _this._disabledTex = disabledTex;
        _this._sprite = new PIXI.Sprite(_this._normalTex);
        _this._displayObject.addChild(_this._sprite);
        _this.resize(_this._sprite.width, _this._sprite.height);
        _this.addEventListeners();
        return _this;
    }
    Object.defineProperty(BaseButton.prototype, "enabled", {
        get: function () {
            return this._state != BaseButton.STATE_DISABLED;
        },
        set: function (enabled) {
            if (enabled) {
                this.setNormal();
            }
            else {
                this.setDisabled();
            }
        },
        enumerable: true,
        configurable: true
    });
    BaseButton.prototype.addEventListeners = function () {
        this.addEventListener(GameEvent_1.default.types.ui.MOUSEOVER, this.onMouseOver);
        this.addEventListener(GameEvent_1.default.types.ui.MOUSEOUT, this.onMouseOut);
        this.addEventListener(GameEvent_1.default.types.ui.LEFTMOUSECLICK, this.onLeftMouseClick);
    };
    BaseButton.prototype.removeEventListeners = function () {
        this.removeEventListener(GameEvent_1.default.types.ui.MOUSEOVER, this.onMouseOver);
        this.removeEventListener(GameEvent_1.default.types.ui.MOUSEOUT, this.onMouseOut);
        this.removeEventListener(GameEvent_1.default.types.ui.LEFTMOUSECLICK, this.onLeftMouseClick);
    };
    BaseButton.prototype.setNormal = function () {
        this._state = BaseButton.STATE_NORMAL;
        this._sprite.texture = this._normalTex;
    };
    BaseButton.prototype.setHighlight = function () {
        this._state = BaseButton.STATE_HIGHLIGHT;
        this._sprite.texture = this._highlightTex;
    };
    BaseButton.prototype.setDisabled = function () {
        this._state = BaseButton.STATE_DISABLED;
        this._sprite.texture = this._disabledTex;
    };
    BaseButton.STATE_NORMAL = 1;
    BaseButton.STATE_HIGHLIGHT = 2;
    BaseButton.STATE_DISABLED = 3;
    return BaseButton;
}(InterfaceElement_1.default));
exports.default = BaseButton;
