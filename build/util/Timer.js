"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Game_1 = require("../Game");
var Timer = (function () {
    function Timer() {
        this._id = -1;
        this._active = true;
        this._addedToUpdater = false;
        this._id = Timer.nextId++;
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
    Object.defineProperty(Timer.prototype, "id", {
        get: function () { return this._id; },
        enumerable: true,
        configurable: true
    });
    Timer.prototype.init = function (time, onFinish) {
        this._duration = time;
        this._onFinish = onFinish;
        this._currentTime = 0;
        return this;
    };
    Timer.prototype.update = function (timeElapsed) {
        if (this._active) {
            this._currentTime += timeElapsed;
            if (this._currentTime >= this._duration) {
                this._active = false;
                this.setUpdating(false);
                Game_1.default.instance.updater.printAll();
                this._onFinish();
            }
        }
    };
    Timer.prototype.start = function () {
        this._active = true;
        this.setUpdating(true);
        return this;
    };
    Timer.prototype.stop = function () {
        this._active = false;
        this.setUpdating(false);
    };
    /*public pause() {
        this._active = false;
        this.setUpdating(false);
    }

    public resume() {
        this._active = true;
        this.setUpdating(true);
    }*/
    Timer.prototype.setUpdating = function (updating) {
        if (updating && !this._addedToUpdater) {
            Game_1.default.instance.updater.add(this);
            this._addedToUpdater = true;
        }
        else if (!updating && this._addedToUpdater) {
            Game_1.default.instance.updater.remove(this);
            this._addedToUpdater = false;
        }
    };
    Timer.prototype.toString = function () {
        return "Timer " + this.id + " (" + this._currentTime + " / " + this._duration + ")";
    };
    Timer.nextId = 1;
    return Timer;
}());
exports.default = Timer;
