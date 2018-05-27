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
var GameEvent_1 = require("../events/GameEvent");
var BaseButton_1 = require("./BaseButton");
var TextElement_1 = require("./TextElement");
var AttachInfo_1 = require("./AttachInfo");
var TextureGenerator = require("../textures/TextureGenerator");
var NineSliceSprite_1 = require("../textures/NineSliceSprite");
var TextButton = (function (_super) {
    __extends(TextButton, _super);
    function TextButton(text, colorScheme, width, height, textStyle) {
        if (colorScheme === void 0) { colorScheme = null; }
        if (width === void 0) { width = 100; }
        if (height === void 0) { height = 30; }
        if (textStyle === void 0) { textStyle = null; }
        var _this = this;
        if (!colorScheme)
            colorScheme = TextButton.colorSchemes.blue;
        if (!textStyle)
            textStyle = TextElement_1.default.basicText;
        var a;
        _this = _super.call(this, width, height, {
            normal: NineSliceSprite_1.default.fromTexture(TextButton.getScaleTexture(colorScheme.normal), new PIXI.Rectangle(3, 3, 2, 2)),
            highlight: NineSliceSprite_1.default.fromTexture(TextButton.getScaleTexture(colorScheme.highlight), new PIXI.Rectangle(3, 3, 2, 2)),
            disabled: NineSliceSprite_1.default.fromTexture(TextButton.getScaleTexture(colorScheme.disabled), new PIXI.Rectangle(3, 3, 2, 2))
        }) || this;
        _this._className = "TextButton";
        _this._textElement = new TextElement_1.default(text, textStyle);
        _this.addChild(_this._textElement);
        _this._textElement.attachToParent(AttachInfo_1.default.Center);
        return _this;
    }
    //Generates a key and checks the texture cache before creating. Inserts if created.
    TextButton.getScaleTexture = function (scheme) {
        var key = JSON.stringify(scheme); //silly
        var tex = this.scaleTextures[key];
        if (!tex) {
            tex = TextureGenerator.simpleRectangle(null, 8, 8, scheme.bg, 2, scheme.border);
            this.scaleTextures[key] = tex;
        }
        return tex;
    };
    Object.defineProperty(TextButton.prototype, "text", {
        get: function () { return this._textElement.text; },
        set: function (s) {
            this._textElement.text = s;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TextButton.prototype, "onClick", {
        set: function (func) {
            if (this._onClick) {
                this.removeEventListener(GameEvent_1.default.types.ui.LEFTMOUSECLICK, this._onClick);
            }
            if (func)
                this.addEventListener(GameEvent_1.default.types.ui.LEFTMOUSECLICK, func);
            this._onClick = func;
        },
        enumerable: true,
        configurable: true
    });
    //note: use the gems in oryx 16 bit items as colour reference
    TextButton.colorSchemes = {
        green: {
            normal: { bg: 0x00852c, border: 0x00ba3e },
            highlight: { bg: 0x00ba3e, border: 0x00ea4e },
            disabled: { bg: 0x2b2b2b, border: 0x616161 }
        },
        red: {
            normal: { bg: 0x910c0c, border: 0xca1010 },
            highlight: { bg: 0xca1010, border: 0xff1414 },
            disabled: { bg: 0x2b2b2b, border: 0x616161 }
        },
        blue: {
            normal: { bg: 0x0c5991, border: 0x107cca },
            highlight: { bg: 0x107cca, border: 0x149dff },
            disabled: { bg: 0x2b2b2b, border: 0x616161 }
        }
    };
    //Caches background textures. These can hang around for the whole program
    TextButton.scaleTextures = {};
    return TextButton;
}(BaseButton_1.default));
exports.default = TextButton;
