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
var InterfaceElement_1 = require("./InterfaceElement");
var MaskElement = /** @class */ (function (_super) {
    __extends(MaskElement, _super);
    function MaskElement(width, height) {
        var _this = _super.call(this) || this;
        _this._debugColor = 0x00ff00;
        //this.visible = false;
        _this._maskSprite = new PIXI.Sprite(InterfaceElement_1.default.maskTexture);
        _this._displayObject.scale.x = width / 8;
        _this._displayObject.scale.y = height / 8;
        _this._displayObject.addChild(_this._maskSprite);
        _this.resize(width, height);
        return _this;
    }
    MaskElement.prototype.destroy = function () {
        _super.prototype.destroy.call(this);
        this._maskSprite.destroy(false);
    };
    MaskElement.prototype.setAsMask = function (element) {
        element.maskSprite = this._maskSprite;
    };
    return MaskElement;
}(InterfaceElement_1.default));
exports.default = MaskElement;
