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
var NineSliceSprite = (function (_super) {
    __extends(NineSliceSprite, _super);
    /**
     * It's a nine-sliced sprite! If you set it too small, don't expect it to look good.
     * @param baseTexture Texture containing the image you want to scale.
     * @param innerRect Defines the interior rectangle which is scaled. For a 16x16 image with a 2px border, this would be rect(2,2,12,12)
     * @param outerRect Defines the region of the base texture to be used. If not provided, the whole texture will be used.
     */
    function NineSliceSprite(baseTexture, innerRect, outerRect) {
        if (outerRect === void 0) { outerRect = null; }
        var _this = _super.call(this) || this;
        if (!outerRect)
            outerRect = new PIXI.Rectangle(0, 0, baseTexture.width, baseTexture.height);
        var leftWidth = innerRect.left - outerRect.left;
        var rightWidth = outerRect.right - innerRect.right;
        var topHeight = innerRect.top - outerRect.top;
        var bottomHeight = outerRect.bottom - innerRect.bottom;
        //Corners
        _this.topLeft = new PIXI.Sprite(new PIXI.Texture(baseTexture, new PIXI.Rectangle(outerRect.left, outerRect.top, leftWidth, topHeight)));
        _this.topRight = new PIXI.Sprite(new PIXI.Texture(baseTexture, new PIXI.Rectangle(innerRect.right, outerRect.top, rightWidth, topHeight)));
        _this.bottomLeft = new PIXI.Sprite(new PIXI.Texture(baseTexture, new PIXI.Rectangle(outerRect.left, innerRect.bottom, leftWidth, bottomHeight)));
        _this.bottomRight = new PIXI.Sprite(new PIXI.Texture(baseTexture, new PIXI.Rectangle(innerRect.right, innerRect.bottom, rightWidth, bottomHeight)));
        //Edges
        _this.top = new PIXI.Sprite(new PIXI.Texture(baseTexture, new PIXI.Rectangle(innerRect.left, outerRect.top, innerRect.width, topHeight)));
        _this.bottom = new PIXI.Sprite(new PIXI.Texture(baseTexture, new PIXI.Rectangle(innerRect.left, innerRect.bottom, innerRect.width, bottomHeight)));
        _this.left = new PIXI.Sprite(new PIXI.Texture(baseTexture, new PIXI.Rectangle(outerRect.left, innerRect.top, leftWidth, innerRect.height)));
        _this.right = new PIXI.Sprite(new PIXI.Texture(baseTexture, new PIXI.Rectangle(innerRect.right, innerRect.top, rightWidth, innerRect.height)));
        //Center
        _this.center = new PIXI.Sprite(new PIXI.Texture(baseTexture, innerRect));
        _this.addChild(_this.topLeft, _this.topRight, _this.bottomLeft, _this.bottomRight, _this.top, _this.bottom, _this.left, _this.right, _this.center);
        //Set positions that don't need to change
        _this.top.x = innerRect.left - outerRect.left;
        _this.center.x = _this.top.x;
        _this.bottom.x = _this.top.x;
        _this.left.y = innerRect.top - outerRect.top;
        _this.center.y = _this.left.y;
        _this.right.y = _this.left.y;
        //By default, be the normal size
        _this.setSize(outerRect.width, outerRect.height);
        return _this;
    }
    NineSliceSprite.fromTexture = function (tex, innerRect) {
        var outerRect = tex.frame;
        innerRect = innerRect.clone();
        innerRect.x += outerRect.x;
        innerRect.y += outerRect.y;
        return new NineSliceSprite(tex.baseTexture, innerRect, outerRect);
    };
    NineSliceSprite.prototype.setWidth = function (width, round) {
        if (round === void 0) { round = true; }
        var innerWidth = width - this.topLeft.width - this.topRight.width;
        if (round)
            innerWidth = Math.round(innerWidth);
        //Scale inner portions
        this.top.width = innerWidth;
        this.bottom.width = innerWidth;
        this.center.width = innerWidth;
        //Move right portions
        var x = this.topLeft.width + innerWidth;
        this.topRight.x = x;
        this.right.x = x;
        this.bottomRight.x = x;
    };
    NineSliceSprite.prototype.setHeight = function (height, round) {
        if (round === void 0) { round = true; }
        var innerHeight = height - this.topLeft.height - this.bottomLeft.height;
        if (round)
            innerHeight = Math.round(innerHeight);
        //Scale inner portions
        this.left.height = innerHeight;
        this.right.height = innerHeight;
        this.center.height = innerHeight;
        //Move bottom portions
        var y = this.topLeft.height + innerHeight;
        this.bottomLeft.y = y;
        this.bottom.y = y;
        this.bottomRight.y = y;
    };
    NineSliceSprite.prototype.setSize = function (width, height, round) {
        if (round === void 0) { round = true; }
        this.setWidth(width, round);
        this.setHeight(height, round);
    };
    return NineSliceSprite;
}(PIXI.Container));
exports.default = NineSliceSprite;
