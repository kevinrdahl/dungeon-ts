"use strict";
/// <reference path="../declarations/pixi.js.d.ts"/>
Object.defineProperty(exports, "__esModule", { value: true });
var TextureLoader = (function () {
    function TextureLoader(sheetName, mapName, callback) {
        this._sheet = null;
        this._map = null;
        this._texCache = {}; //for when they don't need to be unique
        this._callback = callback;
        var _this = this;
        PIXI.loader.add("sheet", sheetName);
        PIXI.loader.load(function (loader, resources) {
            _this._sheet = resources.sheet.texture.baseTexture;
            _this.onSheetOrMap();
        });
        var req = new XMLHttpRequest();
        req.onreadystatechange = function () {
            if (req.readyState == 4 && req.status == 200) {
                _this._map = JSON.parse(req.responseText).frames;
                _this.onSheetOrMap();
            }
        };
        req.open("GET", mapName, true);
        req.send();
    }
    TextureLoader.prototype.get = function (texName, unique) {
        if (unique === void 0) { unique = false; }
        if (!unique && this._texCache.hasOwnProperty(texName)) {
            return this._texCache[texName];
        }
        if (!this._map.hasOwnProperty(texName)) {
            return null; //TODO: (?) return some blank texture
        }
        var frame = this._map[texName].frame;
        var rect = new PIXI.Rectangle(frame.x, frame.y, frame.w, frame.h);
        var tex = new PIXI.Texture(this._sheet, rect);
        if (!unique) {
            this._texCache[texName] = tex;
        }
        return tex;
    };
    TextureLoader.prototype.getData = function () {
        var canvas = document.createElement('canvas');
        var context = canvas.getContext('2d');
        canvas.width = this._sheet.width;
        canvas.height = this._sheet.height;
        context.drawImage(this._sheet.source, 0, 0);
        var data = {};
        var frame;
        for (var texName in this._map) {
            frame = this._map[texName].frame;
            data[texName] = context.getImageData(frame.x, frame.y, frame.w, frame.h);
        }
        return data;
    };
    TextureLoader.prototype.onSheetOrMap = function () {
        var sheet = this._sheet;
        var map = this._map;
        if (sheet === null || map === null)
            return;
        this._callback();
    };
    return TextureLoader;
}());
exports.default = TextureLoader;
