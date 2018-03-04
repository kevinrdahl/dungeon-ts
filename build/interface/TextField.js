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
var Vector2D_1 = require("../util/Vector2D");
var InterfaceElement_1 = require("./InterfaceElement");
var Panel_1 = require("./Panel");
var TextElement_1 = require("./TextElement");
var MaskElement_1 = require("./MaskElement");
var AttachInfo_1 = require("./AttachInfo");
var GameEvent_1 = require("../events/GameEvent");
var TextField = /** @class */ (function (_super) {
    __extends(TextField, _super);
    /**
     * Allows the user to input text.
     * @param alphabet	Constrains input characters
     * @param validator	Checks validity of the whole string
     */
    function TextField(width, height, textStyle, alphabet, validator) {
        if (alphabet === void 0) { alphabet = null; }
        if (validator === void 0) { validator = null; }
        var _this = _super.call(this) || this;
        _this._text = "";
        _this._blinkTime = -1;
        _this._hidden = false;
        _this._borderPadding = 4;
        _this.onFocus = function (e) {
            _this._cursor.visible = true;
            _this._blinkTime = InterfaceElement_1.default.drawTime;
        };
        _this.onUnfocus = function (e) {
            _this._cursor.visible = false;
        };
        _this.onKey = function (e) {
            var key = e.data;
            if (key == "BACKSPACE") {
                _this.deleteCharacter();
            }
            else if (key == "TAB") {
                _this.sendNewEvent(GameEvent_1.default.types.ui.TAB);
            }
            else if (key == "ENTER") {
                _this.sendNewEvent(GameEvent_1.default.types.ui.SUBMIT);
            }
            else if ((_this._alphabet && !_this._alphabet.test(key)) || key.length > 1) {
                console.log("TextField: ignoring character '" + key + "'");
                return;
            }
            else {
                _this.addCharacter(key);
            }
        };
        _this._className = "TextField";
        _this.resize(width, height);
        _this._alphabet = alphabet;
        _this._validator = validator;
        _this.ignoreChildrenForClick = true;
        _this._bg = new Panel_1.default(width, height, Panel_1.default.FIELD);
        _this._textElement = new TextElement_1.default("", textStyle);
        _this.addChild(_this._bg);
        _this._bg.addChild(_this._textElement);
        //Offset the text slightly to allow for the border (Panel needs some improvement)
        var textAttach = AttachInfo_1.default.LeftCenter.clone();
        textAttach.offset.x = _this._borderPadding;
        _this._textElement.attachToParent(textAttach);
        //Attach the cursor to the right of the text
        _this._cursor = new TextElement_1.default("|", textStyle);
        _this._textElement.addChild(_this._cursor);
        textAttach = new AttachInfo_1.default(new Vector2D_1.default(0, 0.5), new Vector2D_1.default(1, 0.5), new Vector2D_1.default(-2, 0));
        _this._cursor.attachToParent(textAttach);
        _this._cursor.visible = false;
        //Make a mask, centred on the Panel
        _this._mask = new MaskElement_1.default(width - _this._borderPadding * 2, height - _this._borderPadding * 2);
        _this._bg.addChild(_this._mask);
        _this._mask.attachToParent(AttachInfo_1.default.Center);
        _this._mask.setAsMask(_this._textElement);
        _this._mask.setAsMask(_this._cursor);
        return _this;
    }
    Object.defineProperty(TextField.prototype, "hidden", {
        get: function () { return this._hidden; },
        set: function (val) { this._hidden = val; this.updateText(); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TextField.prototype, "text", {
        get: function () {
            return this._text;
        },
        set: function (text) {
            this._text = text;
            this.updateText();
        },
        enumerable: true,
        configurable: true
    });
    TextField.prototype.draw = function () {
        _super.prototype.draw.call(this);
        if (!this.visible)
            return;
        if (this.isFocused) {
            if (InterfaceElement_1.default.drawTime - this._blinkTime >= TextField.BLINK_INTERVAL) {
                if (this._cursor.visible) {
                    this._cursor.visible = false;
                }
                else {
                    this._cursor.visible = true;
                }
                this._blinkTime = InterfaceElement_1.default.drawTime;
            }
        }
    };
    TextField.prototype.onAdd = function () {
        this.addEventListener(GameEvent_1.default.types.ui.FOCUS, this.onFocus);
        this.addEventListener(GameEvent_1.default.types.ui.UNFOCUS, this.onUnfocus);
        this.addEventListener(GameEvent_1.default.types.ui.KEY, this.onKey);
    };
    TextField.prototype.onRemove = function (fromParent) {
        this.removeEventListener(GameEvent_1.default.types.ui.FOCUS, this.onFocus);
        this.removeEventListener(GameEvent_1.default.types.ui.UNFOCUS, this.onUnfocus);
        this.removeEventListener(GameEvent_1.default.types.ui.KEY, this.onKey);
    };
    TextField.prototype.addCharacter = function (char) {
        this._text += char;
        this.updateText();
        this.resetCursorBlink();
    };
    TextField.prototype.deleteCharacter = function () {
        if (this._text.length > 0) {
            this._text = this._text.substr(0, this._text.length - 1);
            this.updateText();
        }
        this.resetCursorBlink();
    };
    TextField.prototype.resetCursorBlink = function () {
        this._blinkTime = InterfaceElement_1.default.drawTime;
        this._cursor.visible = true;
    };
    TextField.prototype.updateText = function () {
        var text;
        if (this._hidden) {
            text = '';
            for (var i = 0; i < this._text.length; i++) {
                text += '*';
            }
        }
        else {
            text = this._text;
        }
        this._textElement.text = text;
        var offset = (this.width - this._borderPadding * 2) - (this._textElement.width + this._cursor.width - 4);
        offset = Math.min(offset, this._borderPadding);
        this._textElement.setAttachOffset(offset, 0);
    };
    TextField.alphabets = {
        abc: /^[a-zA-Z]$/,
        abc123: /^[a-zA-Z0-9]$/
    };
    TextField.BLINK_INTERVAL = 750;
    return TextField;
}(InterfaceElement_1.default));
exports.default = TextField;
