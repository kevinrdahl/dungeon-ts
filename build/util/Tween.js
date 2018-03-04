"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Game_1 = require("../Game");
var Tween = /** @class */ (function () {
    function Tween() {
        this._id = -1;
        this._active = false;
        this._initialized = false;
        this._addedToUpdater = false;
        this.onUpdate = null;
        this.onFinish = null;
        this.roundValue = false;
        this._id = Tween.nextId++;
    }
    Object.defineProperty(Tween.prototype, "timeRemaining", {
        get: function () { return this._duration - this._currentTime; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Tween.prototype, "active", {
        get: function () { return this._active; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Tween.prototype, "id", {
        get: function () { return this._id; },
        enumerable: true,
        configurable: true
    });
    Tween.prototype.update = function (timeElapsed) {
        if (this._active) {
            this._currentTime = Math.min(this._currentTime + timeElapsed, this._duration);
            var value = this._easingFunction(this._currentTime, this._startValue, this._endValue - this._startValue, this._duration);
            if (this.roundValue)
                value = Math.round(value);
            this._target[this._property] = value;
            if (this.onUpdate)
                this.onUpdate();
            if (this.timeRemaining <= 0) {
                this._active = false;
                this.setUpdating(false);
                if (this.onFinish)
                    this.onFinish();
            }
        }
    };
    Tween.prototype.init = function (target, property, startValue, endValue, duration, easingFunction) {
        this._target = target;
        this._property = property;
        this._startValue = startValue;
        this._endValue = endValue;
        this._duration = duration;
        this._easingFunction = easingFunction;
        this._active = false;
        this._currentTime = 0;
        this._initialized = true;
        return this;
    };
    Tween.prototype.start = function () {
        if (!this._initialized) {
            console.error("Tween: can't start (not initialized)");
            return;
        }
        if (this._duration > 0) {
            this._active = true;
            this._target[this._property] = this._startValue;
            this.setUpdating(true);
        }
        else {
            this._active = false;
            this._target[this._property] = this._endValue;
            this.setUpdating(false);
            if (this.onFinish)
                this.onFinish();
        }
    };
    Tween.prototype.stop = function () {
        this._active = true;
        this.setUpdating(true);
    };
    /*public pause() {
        this._active = false;
        this.setUpdating(false);
    }

    public resume() {
        this._active = true;
        this.setUpdating(true);
    }*/
    Tween.prototype.setUpdating = function (updating) {
        if (updating && !this._addedToUpdater) {
            Game_1.default.instance.updater.add(this);
            this._addedToUpdater = true;
        }
        else if (!updating && this._addedToUpdater) {
            Game_1.default.instance.updater.remove(this);
            this._addedToUpdater = false;
        }
    };
    Tween.prototype.toString = function () {
        return "Tween " + this.id;
    };
    Tween.nextId = 1;
    Tween.easingFunctions = {
        //(current)time, base, change, duration
        //http://gizma.com/easing/
        linear: function (t, b, c, d) {
            return c * t / d + b;
        },
        quadEaseIn: function (t, b, c, d) {
            t /= d;
            return c * t * t + b;
        },
        quadEaseOut: function (t, b, c, d) {
            t /= d;
            return -c * t * (t - 2) + b;
        },
        quadEaseInOut: function (t, b, c, d) {
            t /= d / 2;
            if (t < 1)
                return c / 2 * t * t + b;
            t--;
            return -c / 2 * (t * (t - 2) - 1) + b;
        },
        cubeEaseIn: function (t, b, c, d) {
            t /= d;
            return c * t * t * t + b;
        },
        cubeEaseOut: function (t, b, c, d) {
            t /= d;
            t--;
            return c * (t * t * t + 1) + b;
        },
        cubeEaseInOut: function (t, b, c, d) {
            t /= d / 2;
            if (t < 1)
                return c / 2 * t * t * t + b;
            t -= 2;
            return c / 2 * (t * t * t + 2) + b;
        },
        quartEaseIn: function (t, b, c, d) {
            t /= d;
            return c * t * t * t * t + b;
        },
        quartEaseOut: function (t, b, c, d) {
            t /= d;
            t--;
            return -c * (t * t * t * t - 1) + b;
        },
        quartEaseInOut: function (t, b, c, d) {
            t /= d / 2;
            if (t < 1)
                return c / 2 * t * t * t * t + b;
            t -= 2;
            return -c / 2 * (t * t * t * t - 2) + b;
        },
        sineEaseIn: function (t, b, c, d) {
            return -c * Math.cos(t / d * (Math.PI / 2)) + c + b;
        },
        sineEaseOut: function (t, b, c, d) {
            return c * Math.sin(t / d * (Math.PI / 2)) + b;
        },
        sineEaseInOut: function (t, b, c, d) {
            return -c / 2 * (Math.cos(Math.PI * t / d) - 1) + b;
        }
    };
    return Tween;
}());
exports.default = Tween;
