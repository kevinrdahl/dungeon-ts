"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/// <reference path="../declarations/jquery.d.ts"/>
var Vector2D_1 = require("../util/Vector2D");
var Game_1 = require("../Game");
var GameEvent_1 = require("../events/GameEvent");
/**
 * Wrangles all them silly events and suchlike.
 * Doing anything in the game proper should be relegated to a different class (probably?)
 *
 * Singleton!
 */
var InputManager = (function () {
    function InputManager() {
        var _this = this;
        this.dragThreshold = 8;
        this._initialized = false;
        this._mouseCoords = new Vector2D_1.default(0, 0);
        this._leftMouseDownCoords = null;
        this._leftMouseDownElement = null;
        this._rightMouseDownCoords = null;
        this._rightMouseDownElement = null;
        this._hoverElement = null;
        this._focusElement = null;
        this._trackedKeys = {
            "SHIFT": false,
            "CTRL": false,
            "ALT": false,
            "UP": false,
            "DOWN": false,
            "LEFT": false,
            "RIGHT": false
        };
        this._onMouseDown = function (e) {
            var coords = _this.getMouseCoords(e, true);
            var element = Game_1.default.instance.interfaceRoot.getElementAtPoint(coords);
            if (element)
                console.log("CLICK " + element.fullName);
            switch (e.which) {
                case 1:
                    //left
                    _this._leftMouseDownCoords = coords;
                    _this._leftMouseDownElement = element;
                    if (element) {
                        _this.focus(element);
                        element.sendNewEvent(GameEvent_1.default.types.ui.LEFTMOUSEDOWN);
                    }
                    else {
                        Game_1.default.instance.onLeftClick(coords.clone());
                    }
                    break;
                case 2:
                    //middle
                    break;
                case 3:
                    //right
                    _this._rightMouseDownCoords = coords;
                    _this._rightMouseDownElement = element;
                    if (element) {
                        _this.focus(element);
                        element.sendNewEvent(GameEvent_1.default.types.ui.RIGHTMOUSEDOWN);
                    }
                    else {
                        Game_1.default.instance.onRightClick(coords.clone());
                    }
                    break;
                default:
                    console.warn("InputManager: mouse input with which=" + e.which + "?");
            }
        };
        this._onMouseUp = function (e) {
            var coords = _this.getMouseCoords(e, true);
            var element = Game_1.default.instance.interfaceRoot.getElementAtPoint(coords);
            switch (e.which) {
                case 1:
                    //left
                    if (element) {
                        /*if (element.onMouseUp) element.onMouseUp(coords);
                        if (element.onClick && element == this._leftMouseDownElement) element.onClick(coords);*/
                        element.sendNewEvent(GameEvent_1.default.types.ui.LEFTMOUSEUP);
                        if (element == _this._leftMouseDownElement)
                            element.sendNewEvent(GameEvent_1.default.types.ui.LEFTMOUSECLICK);
                    }
                    _this._leftMouseDownCoords = null;
                    _this._leftMouseDownElement = null;
                    break;
                case 2:
                    //middle
                    break;
                case 3:
                    //right
                    break;
                default:
                    console.warn("InputManager: mouse input with which = " + e.which + "?");
            }
        };
        this._onMouseMove = function (e) {
            var coords = _this.getMouseCoords(e, true);
            var element = Game_1.default.instance.interfaceRoot.getElementAtPoint(coords);
            if (_this.leftMouseDown && coords.distanceTo(_this._leftMouseDownCoords) > _this.dragThreshold)
                _this.beginDrag();
            //TODO: check whether we're about to drag it?
            if (_this._hoverElement != element) {
                if (element) {
                    element.sendNewEvent(GameEvent_1.default.types.ui.MOUSEOVER);
                }
                if (_this._hoverElement) {
                    _this._hoverElement.sendNewEvent(GameEvent_1.default.types.ui.MOUSEOUT);
                }
            }
            //TODO: update dragged element
            _this._hoverElement = element;
        };
        this._onMouseScroll = function (e) {
        };
        this._onMouseLeave = function (e) {
            _this._leftMouseDownCoords = null;
            _this._leftMouseDownElement = null;
        };
        this._onKeyDown = function (e) {
            var key = _this.getKeyString(e);
            if (_this._focusElement) {
                //this._focusElement.sendNewEvent(GameEvent.types.ui.KEY, key);
                if (key.length > 1)
                    _this._focusElement.sendNewEvent(GameEvent_1.default.types.ui.KEY, key);
            }
            if (_this._trackedKeys.hasOwnProperty(key)) {
                _this._trackedKeys[key] = true;
            }
            if (preventedKeys.indexOf(e.which) != -1) {
                e.preventDefault();
            }
        };
        this._onKeyUp = function (e) {
            var key = _this.getKeyString(e);
            if (_this._trackedKeys.hasOwnProperty(key)) {
                _this._trackedKeys[key] = false;
            }
        };
        this._onKeyPress = function (e) {
            if (_this._focusElement) {
                _this._focusElement.sendNewEvent(GameEvent_1.default.types.ui.KEY, e.key);
            }
            Game_1.default.instance.sendNewEvent(GameEvent_1.default.types.ui.KEY, e.key);
            if (preventedKeys.indexOf(e.which) != -1) {
                e.preventDefault();
            }
        };
        if (InputManager._instance) {
            console.error("InputManager: hey, this is a singleton!");
        }
    }
    Object.defineProperty(InputManager, "instance", {
        get: function () {
            return InputManager._instance;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(InputManager.prototype, "leftMouseDown", {
        get: function () { return this._leftMouseDownCoords != null; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(InputManager.prototype, "focusedElement", {
        get: function () { return this._focusElement; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(InputManager.prototype, "mouseCoords", {
        get: function () { return this._mouseCoords; },
        enumerable: true,
        configurable: true
    });
    InputManager.prototype.init = function (selector) {
        if (this._initialized)
            return;
        this._initialized = true;
        this._div = $(selector);
        if (!this._div) {
            console.error("InputManager: no element found!");
        }
        this._div.mousedown(this._onMouseDown);
        this._div.mouseup(this._onMouseUp);
        this._div.mousemove(this._onMouseMove);
        this._div.scroll(this._onMouseScroll);
        this._div.mouseleave(this._onMouseLeave);
        $(window).keydown(this._onKeyDown);
        $(window).keyup(this._onKeyUp);
        $(window).keypress(this._onKeyPress);
        //disable right click context menu
        this._div.contextmenu(function (e) {
            e.stopPropagation();
            return false;
        });
    };
    InputManager.prototype.focus = function (element) {
        if (element != this._focusElement) {
            if (this._focusElement) {
                this._focusElement.sendNewEvent(GameEvent_1.default.types.ui.UNFOCUS);
            }
            this._focusElement = element;
            if (element) {
                console.log("InputManager: Focus " + element.fullName);
                element.sendNewEvent(GameEvent_1.default.types.ui.FOCUS);
            }
            else {
                console.log("InputManager: No element focused");
            }
        }
    };
    InputManager.prototype.isKeyDown = function (key) {
        if (this._trackedKeys.hasOwnProperty(key) && this._trackedKeys[key])
            return true;
        return false;
    };
    InputManager.prototype.beginDrag = function () {
    };
    InputManager.prototype.getKeyString = function (e) {
        var name = keyNames[e.which.toString()];
        if (name)
            return name;
        return String.fromCharCode(e.which);
    };
    InputManager.prototype.getMouseCoords = function (e, set) {
        if (set === void 0) { set = false; }
        var offset = this._div.offset();
        var coords = new Vector2D_1.default(e.pageX - offset.left, e.pageY - offset.top);
        if (set)
            this._mouseCoords = coords;
        return coords;
    };
    InputManager._instance = new InputManager();
    return InputManager;
}());
exports.default = InputManager;
var preventedKeys = [8, 9, 13, 16, 17, 18, 37, 38, 39, 40];
var keyNames = {
    "8": "BACKSPACE",
    "9": "TAB",
    "13": "ENTER",
    "16": "SHIFT",
    "17": "CTRL",
    "18": "ALT",
    "38": "UP",
    "40": "DOWN",
    "37": "LEFT",
    "39": "RIGHT"
};
