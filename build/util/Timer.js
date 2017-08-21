"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Game_1 = require("../Game");
var Timer = (function () {
    function Timer() {
        this._active = true;
        this._addedToUpdater = false;
    }
    Object.defineProperty(Timer.prototype, "duration", {
        get: function () { return this._duration; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Timer.prototype, "timeRemaining", {
        get: function () { return this._duration - this._currentTime; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Timer.prototype, "active", {
        get: function () { return this._active; },
        enumerable: true,
        configurable: true
    });
    Timer.prototype.init = function (time, onFinish) {
        this._duration = time;
        this._onFinish = onFinish;
        return this;
    };
    Timer.prototype.update = function (timeElapsed) {
        if (this._active) {
            this._currentTime += timeElapsed;
            if (this._currentTime >= this._duration) {
                this._active = false;
                this.setUpdating(false);
                this._onFinish();
            }
        }
    };
    Timer.prototype.start = function () {
        this._currentTime = 0;
        this._active = true;
        this.setUpdating(true);
    };
    Timer.prototype.pause = function () {
        this._active = false;
        this.setUpdating(false);
    };
    Timer.prototype.resume = function () {
        this._active = true;
        this.setUpdating(true);
    };
    Timer.prototype.setUpdating = function (updating) {
        if (updating && !this._addedToUpdater) {
            Game_1.default.instance.updater.add(this);
        }
        else if (!updating && this._addedToUpdater) {
            Game_1.default.instance.updater.remove(this);
        }
    };
    return Timer;
}());
exports.default = Timer;
