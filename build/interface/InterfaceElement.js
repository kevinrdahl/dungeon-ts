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
var Vector2D_1 = require("../util/Vector2D");
var ResizeInfo_1 = require("./ResizeInfo");
var InputManager_1 = require("./InputManager");
var Game_1 = require("../Game");
var GameEventHandler_1 = require("../events/GameEventHandler");
var InterfaceElement = (function (_super) {
    __extends(InterfaceElement, _super);
    /**
     * Base class for anything in the UI. Has a parent and can have children, like DOM elements.
     * Wraps a PIXI DisplayObjectContainer.
     *
     * @param fromContainer If provided, fromContainer is used instead of a new Container. Whatever it contains has no bearing on the InterfaceElement's concept of having children.
     */
    function InterfaceElement(fromContainer) {
        if (fromContainer === void 0) { fromContainer = null; }
        var _this = _super.call(this) || this;
        _this.id = "";
        _this.name = "";
        _this.clickable = false;
        _this.draggable = false;
        _this.useOwnBounds = true; //instead of the container's bounds, use the rect defined by own x,y,width,height
        _this.ignoreChildrenForClick = false; //don't click the kids, click me
        _this.dragElement = null;
        _this.useDebugRect = true;
        _this._parent = null;
        _this._children = [];
        _this._position = new Vector2D_1.default(0, 0);
        _this._width = 0;
        _this._height = 0;
        _this._attach = null;
        _this._resize = null;
        _this._className = "InterfaceElement";
        _this._debugColor = 0xffffff;
        if (fromContainer) {
            _this._displayObject = fromContainer;
            _this.resize(fromContainer.width, fromContainer.height);
        }
        else {
            _this._displayObject = new PIXI.Container();
        }
        return _this;
    }
    Object.defineProperty(InterfaceElement.prototype, "x", {
        // === GET ===
        get: function () { return this._position.x; },
        set: function (x) { this._position.x = x; this.updateDisplayObjectPosition(); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(InterfaceElement.prototype, "y", {
        get: function () { return this._position.y; },
        set: function (y) { this._position.y = y; this.updateDisplayObjectPosition(); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(InterfaceElement.prototype, "position", {
        get: function () { return this._position; },
        //=== SET ===
        set: function (pos) { this._position.set(pos); this.updateDisplayObjectPosition(); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(InterfaceElement.prototype, "width", {
        get: function () { return this._width; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(InterfaceElement.prototype, "height", {
        get: function () { return this._height; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(InterfaceElement.prototype, "displayObject", {
        get: function () { return this._displayObject; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(InterfaceElement.prototype, "children", {
        get: function () { return this._children.slice(); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(InterfaceElement.prototype, "numChildren", {
        get: function () { return this._children.length; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(InterfaceElement.prototype, "fullName", {
        get: function () {
            var s = this._className;
            if (this.id != "")
                s += " #" + this.id;
            if (this.name != "")
                s += " \"" + this.name + "\"";
            if (this.draggable)
                s += " (draggable)";
            if (!this.clickable)
                s += " (not clickable)";
            return s;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(InterfaceElement.prototype, "isRoot", {
        get: function () { return this._parent == null && this._displayObject.parent != null; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(InterfaceElement.prototype, "isFocused", {
        get: function () { return InputManager_1.default.instance.focusedElement == this; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(InterfaceElement.prototype, "visible", {
        get: function () { return this._displayObject.visible; },
        set: function (v) { this._displayObject.visible = v; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(InterfaceElement.prototype, "parent", {
        get: function () { return this._parent; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(InterfaceElement.prototype, "maskSprite", {
        set: function (m) { this._displayObject.mask = m; },
        enumerable: true,
        configurable: true
    });
    InterfaceElement.prototype.getBounds = function () {
        return new PIXI.Rectangle(this.x, this.y, this.width, this.height);
    };
    InterfaceElement.prototype.getElementAtPoint = function (point) {
        var element = null;
        var checkChildren = this.isRoot;
        if (!checkChildren) {
            var bounds;
            if (this.useOwnBounds) {
                //note: this assumes that children are all within the bounds of this object
                var pos = this.getGlobalPosition();
                bounds = new PIXI.Rectangle(pos.x, pos.y, this._width, this._height);
            }
            else {
                bounds = this._displayObject.getBounds();
            }
            checkChildren = bounds.contains(point.x, point.y);
            if (checkChildren && this.ignoreChildrenForClick) {
                return this;
            }
        }
        if (checkChildren) {
            //Work backwards. Most recently added children are on top.
            for (var i = this._children.length - 1; i >= 0; i--) {
                element = this._children[i].getElementAtPoint(point);
                if (element != null) {
                    break;
                }
            }
            if (element == null && this.clickable) {
                element = this;
            }
        }
        return element;
    };
    InterfaceElement.prototype.getElementById = function (id, maxChecks) {
        if (maxChecks === void 0) { maxChecks = 1000; }
        if (this.id == id)
            return this;
        return this.getElementByFunction(function (e) {
            return e.id == id;
        });
    };
    /** Returns the given element, if it's a descendent of this (or is this) */
    InterfaceElement.prototype.getElement = function (e) {
        if (this == e)
            return this; //derp
        return this.getElementByFunction(function (e2) {
            return e2 == e;
        });
    };
    InterfaceElement.prototype.getChildAt = function (index) {
        if (this.numChildren > index) {
            return this._children[index];
        }
        return null;
    };
    InterfaceElement.prototype.getLastChild = function () {
        return this.getChildAt(this.numChildren - 1);
    };
    //BFS, always call from the lowest known ancestor
    //Hey kid, don't make cyclical structures. I'm putting maxChecks here anyway, just in case.
    InterfaceElement.prototype.getElementByFunction = function (func, maxChecks) {
        if (maxChecks === void 0) { maxChecks = 500; }
        if (func(this))
            return this;
        var toCheck = [this];
        var element;
        var child;
        var len;
        var i;
        while (toCheck.length > 0 && maxChecks > 0) {
            element = toCheck.shift();
            len = element._children.length;
            for (i = 0; i < len; i++) {
                child = element._children[i];
                if (func(child))
                    return child;
                toCheck.push(child);
            }
            maxChecks -= 1;
        }
        if (maxChecks <= 400)
            console.warn("Wasting cycles on InterfaceElement.getElementById");
        else if (maxChecks == 0)
            console.warn("Wasting LOTS of cycles on InterfaceElement.getElementById");
        return null;
    };
    InterfaceElement.prototype.draw = function () {
        if (this.isRoot)
            InterfaceElement.drawTime = Date.now();
        if (!this.visible)
            return; //this could cause problems?
        var len = this._children.length;
        for (var i = 0; i < len; i++) {
            this._children[i].draw();
        }
        if (Game_1.default.useDebugGraphics && this.useDebugRect) {
            var global = this.getGlobalPosition();
            Game_1.default.instance.debugGraphics.lineStyle(1, this._debugColor, 1);
            Game_1.default.instance.debugGraphics.drawRect(global.x, global.y, this._width, this._height);
        }
    };
    InterfaceElement.prototype.resize = function (width, height) {
        this._width = width;
        this._height = height;
        this.onResize();
    };
    InterfaceElement.prototype.resizeToFitChildren = function () {
        var w = 0;
        var h = 0;
        for (var _i = 0, _a = this._children; _i < _a.length; _i++) {
            var child = _a[_i];
            if (child.width > w)
                w = child.width;
            if (child.height > h)
                h = child.height;
        }
        this.resize(w, h);
    };
    InterfaceElement.prototype.addChild = function (child) {
        this._children.push(child);
        this._displayObject.addChild(child._displayObject);
        child._parent = this;
        child.onAdd();
    };
    InterfaceElement.prototype.addChildAt = function (child, index) {
        if (index === void 0) { index = -1; }
        if (index < 0 || index > this._children.length) {
            this.addChild(child);
            return;
        }
        this._children.splice(index, 0, child);
        this._displayObject.addChildAt(child._displayObject, index);
        child.onAdd();
    };
    /**
     * Subclasses should use this to add listeners if needed
     */
    InterfaceElement.prototype.onAdd = function () {
    };
    /**
     * Subclasses should use this to remove their listeners.
     */
    InterfaceElement.prototype.onRemove = function (fromParent) {
    };
    /**
     * Necessary for cleaning up WebGL memory. If this element isn't going to be used anymore, call this.
     * Called recursively on chldren.
     */
    InterfaceElement.prototype.destroy = function () {
        for (var _i = 0, _a = this._children; _i < _a.length; _i++) {
            var child = _a[_i];
            child.destroy();
        }
        if (this._parent) {
            this.removeSelf(false); //no need to recurse from there, since this already does so
        }
        //base class has no PIXI stuff to destroy (right?)
        this.displayObject.destroy();
    };
    InterfaceElement.prototype.removeChild = function (child, recurse) {
        if (recurse === void 0) { recurse = false; }
        var index = this._children.indexOf(child);
        if (index === -1)
            return;
        this._children.splice(index, 1);
        this._displayObject.removeChild(child._displayObject);
        child._parent = null;
        child.detachFromParent();
        child.disableResizeToParent();
        if (recurse) {
            while (child._children.length > 0) {
                child.removeChild(child._children[child._children.length - 1], true);
            }
        }
        child.onRemove(this);
    };
    /**
     * Removes this element from its parent
     */
    InterfaceElement.prototype.removeSelf = function (recurse) {
        if (recurse === void 0) { recurse = true; }
        if (this._parent != null)
            this._parent.removeChild(this, recurse);
    };
    InterfaceElement.prototype.moveChildToTop = function (child) {
        this.removeChild(child);
        this.addChild(child);
    };
    InterfaceElement.prototype.attachToParent = function (info) {
        this._attach = info;
        this.positionRelativeTo(this._parent, info);
    };
    InterfaceElement.prototype.detachFromParent = function () {
        this._attach = null;
    };
    /**
     *
     * @param info If null, fills the parent completely
     */
    InterfaceElement.prototype.resizeToParent = function (info) {
        if (info === void 0) { info = null; }
        if (info == null)
            info = ResizeInfo_1.default.get(1, 1, 0, 0);
        this._resize = info;
        this.onParentResize();
    };
    InterfaceElement.prototype.disableResizeToParent = function () {
        this._resize = null;
    };
    InterfaceElement.prototype.positionRelativeTo = function (other, info) {
        this._position.x = (other._width * info.to.x) - (this.width * info.from.x) + info.offset.x + other.x;
        this._position.y = (other._height * info.to.y) - (this.height * info.from.y) + info.offset.y + other.y;
        if (other != this._parent && other._parent != this._parent) {
            //need to account for different contexts
            var thisGlobal = this.getGlobalPosition();
            var otherGlobal = other.getGlobalPosition();
            thisGlobal.sub(this._position);
            otherGlobal.sub(other._position);
            //add the difference in base global position
            var globalDiff = otherGlobal;
            globalDiff.sub(thisGlobal);
            this._position.add(globalDiff);
        }
        //console.log(this.fullName + " position with " + JSON.stringify(info) + ": " + JSON.stringify(this._position));
        this.position = this._position;
    };
    InterfaceElement.prototype.setAttachOffset = function (x, y) {
        if (!this._attach)
            return;
        this._attach.offset.x = x;
        this._attach.offset.y = y;
        this.onParentResize(); //cheaty? or just a naming problem
    };
    InterfaceElement.prototype.clearMask = function () {
        this._displayObject.mask = null;
    };
    InterfaceElement.prototype.getGlobalPosition = function () {
        var pos = this._position.clone();
        var parent = this._parent;
        while (parent != null) {
            pos.add(parent._position);
            parent = parent._parent;
        }
        return pos;
    };
    InterfaceElement.prototype.updateDisplayObjectPosition = function () {
        this._displayObject.position.set(Math.round(this._position.x), Math.round(this._position.y));
    };
    InterfaceElement.prototype.toNearestPixel = function () {
        this._position.round();
        this.updateDisplayObjectPosition();
    };
    InterfaceElement.prototype.onParentResize = function () {
        if (this._resize) {
            var width = this._width;
            var height = this._height;
            if (this._resize.fill.x > 0)
                width = this._parent._width * this._resize.fill.x - this._resize.padding.x * 2;
            if (this._resize.fill.y > 0)
                height = this._parent._height * this._resize.fill.y - this._resize.padding.y * 2;
            this.resize(width, height);
        }
        else if (this._attach) {
            this.positionRelativeTo(this._parent, this._attach);
        }
    };
    InterfaceElement.prototype.onResize = function (notifyChildren) {
        if (notifyChildren === void 0) { notifyChildren = true; }
        if (this._attach)
            this.positionRelativeTo(this._parent, this._attach);
        if (notifyChildren) {
            var len = this._children.length;
            for (var i = 0; i < len; i++) {
                this._children[i].onParentResize();
            }
        }
    };
    InterfaceElement.maskTexture = null; //8x8
    /**
     * Updated every frame by the root UI element.
     */
    InterfaceElement.drawTime = 0;
    return InterfaceElement;
}(GameEventHandler_1.default));
exports.default = InterfaceElement;
