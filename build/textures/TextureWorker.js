"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/// <reference path="../declarations/pixi.js.d.ts"/>
var ColorUtil = require("../util/ColorUtil");
/**
 * IGNORE THIS I'M NOT USING IT, NOT WORTH THE HASSLE
 *
 * Wraps a Worker, and provides async functions for getting recolored sprites.
 * TODO: create sprite sheets, as per previous implementation
 *
 * NOTE: Most of the actual work is done in public/js/mmoo-worker.js, and due to
 * some funky TypeScript nonsense it must be written there.
 */
var TextureWorker = (function () {
    function TextureWorker(scriptURL) {
        var _this = this;
        this._requestNumber = 0;
        this._callbacks = {};
        this._worker = new Worker(scriptURL);
        this._worker.onmessage = function (e) {
            _this._onMessage(e.data);
        };
    }
    TextureWorker.prototype.putTextures = function (texData) {
        var imgData;
        var msg;
        for (var texName in texData) {
            imgData = texData[texName];
            msg = {
                action: "newTexture",
                params: {
                    name: texName,
                    width: imgData.width,
                    height: imgData.height
                },
                data: imgData.data.buffer
            };
            this._worker.postMessage(msg, [msg.data]);
        }
    };
    TextureWorker.prototype.getTexture = function (name, colorMap, callback) {
        var requestKey = this._requestNumber.toString();
        this._requestNumber += 1;
        this._callbacks[requestKey] = callback;
        this._worker.postMessage({
            action: "getTexture",
            params: {
                name: name,
                colorMap: colorMap,
                requestKey: requestKey
            }
        });
        return requestKey;
    };
    TextureWorker.prototype._onMessage = function (msg) {
        switch (msg.action) {
            case "getTexture":
                this.onGetTexture(msg.params, msg.data);
                break;
        }
    };
    TextureWorker.prototype.onGetTexture = function (params, data) {
        var width = params.width;
        var height = params.height;
        var dataArray = new Uint8ClampedArray(data);
        var requestKey = params.requestKey;
        var callback = this._callbacks[requestKey];
        if (callback) {
            callback(requestKey, this.textureFromArray(dataArray, width, height));
            delete this._callbacks[requestKey];
        }
    };
    TextureWorker.prototype.textureFromArray = function (dataArray, width, height) {
        try {
            var imageData = new ImageData(dataArray, width, height); //if on Edge, this will throw an error
        }
        catch (e) {
            return this.textureFromArrayEdge(dataArray, width, height);
        }
        var canvas = document.createElement('canvas');
        var context = canvas.getContext('2d');
        canvas.width = width;
        canvas.height = height;
        context.putImageData(imageData, 0, 0);
        return PIXI.Texture.fromCanvas(canvas, PIXI.SCALE_MODES.NEAREST);
    };
    //probably slower, fallback for Edge which can't do ImageData constructors (why?!)
    TextureWorker.prototype.textureFromArrayEdge = function (dataArray, width, height) {
        var canvas = document.createElement('canvas');
        var context = canvas.getContext('2d');
        canvas.width = width;
        canvas.height = height;
        //use drawRect based on dataArray
        var x = 0;
        var y = 0;
        var runStart = -1; //number of same RGBA
        var same;
        var drawX, drawW;
        for (var i = 0; i < dataArray.length; i += 4) {
            same = false;
            if (x < width - 1)
                same = this.compareRGBA(dataArray, i, i + 4);
            if (same && runStart == -1) {
                runStart = x;
            }
            else if (!same) {
                if (runStart >= 0) {
                    //print the run (which is this color)
                    drawX = runStart;
                    drawW = x - runStart + 1;
                    runStart = -1;
                }
                else {
                    //print just this
                    drawX = x;
                    drawW = 1;
                }
                //if not transparent
                if (dataArray[i + 3] > 0) {
                    context.fillStyle = ColorUtil.rgbString(dataArray[i], dataArray[i + 1], dataArray[i + 2]);
                    context.fillRect(drawX, y, drawW, 1);
                }
            }
            //(do nothing if on a run and next pixel is same rgba)
            x += 1;
            if (x == width) {
                x = 0;
                y += 1;
            }
        }
        return PIXI.Texture.fromCanvas(canvas, PIXI.SCALE_MODES.NEAREST);
    };
    TextureWorker.prototype.compareRGBA = function (a, i1, i2) {
        return (a[i1] == a[i2]
            && a[i1 + 1] == a[i2 + 1]
            && a[i1 + 2] == a[i2 + 2]
            && a[i1 + 3] == a[i2 + 3]);
    };
    TextureWorker._supportsImageDataConstructor = -1;
    return TextureWorker;
}());
exports.default = TextureWorker;
