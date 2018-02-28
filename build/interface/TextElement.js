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
/// <reference path="../declarations/pixi.js.d.ts"/>
var InterfaceElement_1 = require("./InterfaceElement");
var mainFont = "Arial";
var TextElement = /** @class */ (function (_super) {
    __extends(TextElement, _super);
    function TextElement(text, style) {
        if (text === void 0) { text = ""; }
        if (style === void 0) { style = TextElement.basicText; }
        var _this = _super.call(this) || this;
        _this._debugColor = 0xff0000;
        _this._className = "TextElement";
        _this._text = text;
        _this._pixiText = new PIXI.Text(text, style);
        _this._displayObject.addChild(_this._pixiText);
        _this.resizeToPixiText();
        return _this;
    }
    Object.defineProperty(TextElement.prototype, "text", {
        get: function () { return this._text; },
        set: function (text) {
            this._text = text;
            this.setPixiText();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TextElement.prototype, "style", {
        set: function (style) {
            this._pixiText.style = style;
            this.resizeToPixiText();
        },
        enumerable: true,
        configurable: true
    });
    TextElement.prototype.destroy = function () {
        _super.prototype.destroy.call(this);
        this._pixiText.destroy(true);
    };
    /**
     * Expensive! Sets the PIXI text twice. Assumes single line.
     * (does this work? does it need a draw frame? time will tell)
     */
    TextElement.prototype.getWidthAtCharacterIndex = function (i) {
        if (i >= this._text.length)
            return -1; //dummy
        this._pixiText.text = this._text.substr(0, i + 1);
        var w = this._pixiText.width;
        this._pixiText.text = this._text;
        return w;
    };
    TextElement.prototype.setPixiText = function () {
        this._pixiText.text = this._text;
        this.resizeToPixiText();
    };
    TextElement.prototype.resizeToPixiText = function () {
        var width = (this._text.length > 0) ? this._pixiText.width : 0;
        this.resize(width, this._pixiText.height);
    };
    //Open Sans
    TextElement.basicText = new PIXI.TextStyle({ fontSize: 14, fontFamily: mainFont, fill: 0xffffff, align: 'left' });
    TextElement.mediumText = new PIXI.TextStyle({ fontSize: 20, fontFamily: mainFont, fill: 0xffffff, align: 'left' });
    TextElement.bigText = new PIXI.TextStyle({ fontSize: 32, fontFamily: mainFont, fill: 0xffffff, align: 'left' });
    TextElement.veryBigText = new PIXI.TextStyle({ fontSize: 48, fontFamily: mainFont, fill: 0xffffff, align: 'left' });
    return TextElement;
}(InterfaceElement_1.default));
exports.default = TextElement;
