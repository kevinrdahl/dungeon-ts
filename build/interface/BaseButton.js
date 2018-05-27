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
var NineSliceSprite_1 = require("../textures/NineSliceSprite");
var BaseButton = (function (_super) {
    __extends(BaseButton, _super);
    /**
     * It's a button! Click it!
     * Use the LEFTMOUSECLICK event to listen for clicks.
     */
    function BaseButton(width, height, appearance, scaleSprites) {
        if (scaleSprites === void 0) { scaleSprites = false; }
        var _this = _super.call(this) || this;
        _this._state = -1;
        _this.scaleSprites = false;
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
        _this.scaleSprites = scaleSprites;
        _this.sprites = [appearance.normal, appearance.highlight, appearance.disabled];
        _this.setNormal();
        _this.resize(width, height);
        _this.addEventListeners();
        return _this;
    }
    BaseButton.prototype.resize = function (width, height) {
        for (var _i = 0, _a = this.sprites; _i < _a.length; _i++) {
            var sprite = _a[_i];
            if (sprite instanceof NineSliceSprite_1.default) {
                sprite.setSize(width, height);
            }
            else if (this.scaleSprites) {
                sprite.width = width;
                sprite.height = height;
            }
        }
        _super.prototype.resize.call(this, width, height);
    };
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
        this.setState(BaseButton.STATE_NORMAL);
    };
    BaseButton.prototype.setHighlight = function () {
        this.setState(BaseButton.STATE_HIGHLIGHT);
    };
    BaseButton.prototype.setDisabled = function () {
        this.setState(BaseButton.STATE_DISABLED);
    };
    BaseButton.prototype.setState = function (state) {
        if (state === this._state)
            return;
        var currentSprite = this.sprites[this._state];
        if (currentSprite && currentSprite.parent)
            currentSprite.parent.removeChild(currentSprite);
        this._state = state;
        var newSprite = this.sprites[state];
        if (newSprite)
            this._displayObject.addChildAt(newSprite, 0);
    };
    BaseButton.STATE_NORMAL = 0;
    BaseButton.STATE_HIGHLIGHT = 1;
    BaseButton.STATE_DISABLED = 2;
    return BaseButton;
}(InterfaceElement_1.default));
exports.default = BaseButton;
