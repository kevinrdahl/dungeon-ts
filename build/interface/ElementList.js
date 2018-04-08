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
var ElementList = (function (_super) {
    __extends(ElementList, _super);
    function ElementList(width, orientation, padding, align) {
        if (orientation === void 0) { orientation = ElementList.VERTICAL; }
        if (padding === void 0) { padding = 5; }
        if (align === void 0) { align = ElementList.LEFT; }
        var _this = _super.call(this) || this;
        _this._childBounds = [];
        _this._childPadding = [];
        _this._inBatchChange = false;
        _this._debugColor = 0xffff00;
        _this._orientation = orientation;
        _this._padding = padding;
        _this._alignment = align;
        _this._className = "ElementList";
        if (orientation == ElementList.VERTICAL) {
            _this._width = width;
        }
        else {
            _this._height = width;
        }
        return _this;
    }
    /** When adding multiple elements at once, call this first to prevent wasteful rearranging */
    ElementList.prototype.beginBatchChange = function () {
        this._inBatchChange = true;
    };
    /** Call after adding elements following beginBatchChange() */
    ElementList.prototype.endBatchChange = function () {
        if (!this._inBatchChange) {
            return;
        }
        this._inBatchChange = false;
        this.redoLayout();
    };
    ElementList.prototype.addChild = function (child, extraPadding, redoLayout) {
        if (extraPadding === void 0) { extraPadding = 0; }
        if (redoLayout === void 0) { redoLayout = true; }
        _super.prototype.addChild.call(this, child);
        this._childBounds.push(0);
        this._childPadding.push(this._padding + extraPadding);
        if (redoLayout && !this._inBatchChange) {
            this.redoLayout(child);
        }
    };
    ElementList.prototype.addChildAt = function (child, index, extraPadding, redoLayout) {
        if (extraPadding === void 0) { extraPadding = 0; }
        if (redoLayout === void 0) { redoLayout = true; }
        _super.prototype.addChildAt.call(this, child, index);
        this._childBounds.push(0);
        this._childPadding.splice(index, 0, extraPadding);
        if (redoLayout && !this._inBatchChange) {
            this.redoLayout(child);
        }
    };
    ElementList.prototype.removeChild = function (child) {
        var index = this._children.indexOf(child);
        _super.prototype.removeChild.call(this, child);
        if (index != -1 && index < this._children.length) {
            this._childBounds.pop();
            if (!this._inBatchChange) {
                this.redoLayout(this._children[index]);
            }
        }
    };
    ElementList.prototype.redoLayout = function (fromChild) {
        if (fromChild === void 0) { fromChild = null; }
        var index = -1;
        if (fromChild == null && this._children.length > 0) {
            index = 0;
        }
        else if (fromChild != null) {
            index = this._children.indexOf(fromChild);
        }
        if (index == -1)
            return;
        var offset = 0;
        var child;
        if (index > 0)
            offset = this._childBounds[index - 1];
        for (; index < this._children.length; index++) {
            child = this._children[index];
            if (this._orientation == ElementList.VERTICAL) {
                child.y = offset;
                offset += child.height + this._childPadding[index];
                switch (this._alignment) {
                    case ElementList.LEFT:
                        child.x = 0;
                        break;
                    case ElementList.RIGHT:
                        child.x = this.width - child.width;
                        break;
                    case ElementList.CENTRE:
                        child.x = (this.width - child.width) / 2;
                        break;
                }
            }
            else {
                child.x = offset;
                offset += child.width + this._childPadding[index];
                switch (this._alignment) {
                    case ElementList.TOP:
                        child.y = 0;
                        break;
                    case ElementList.BOTTOM:
                        child.y = this.height - child.height;
                        break;
                    case ElementList.CENTRE:
                        child.y = (this.height - child.height) / 2;
                        break;
                }
            }
            this._childBounds[index] = offset;
        }
        var length = 0;
        if (this._children.length > 0) {
            var startElement = this._children[0];
            var endElement = this._children[this._children.length - 1];
            if (this._orientation == ElementList.VERTICAL) {
                length = (endElement.y + endElement.height) - startElement.y;
            }
            else {
                length = (endElement.x + endElement.width) - startElement.x;
            }
        }
        if (this._orientation == ElementList.VERTICAL) {
            this._height = length;
        }
        else {
            this._width = length;
        }
        this.onResize(false); //don't tell children that this has resized
    };
    ElementList.HORIZONTAL = 0;
    ElementList.VERTICAL = 1;
    ElementList.NONE = -1;
    ElementList.LEFT = 0;
    ElementList.TOP = ElementList.LEFT;
    ElementList.RIGHT = 1;
    ElementList.BOTTOM = ElementList.RIGHT;
    ElementList.CENTRE = 2;
    return ElementList;
}(InterfaceElement_1.default));
exports.default = ElementList;
