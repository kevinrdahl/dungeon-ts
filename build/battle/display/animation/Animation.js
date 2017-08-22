"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Timer_1 = require("../../../util/Timer");
var Tween_1 = require("../../../util/Tween");
var Globals_1 = require("../../../Globals");
/**
 * Wraps a function with a callback, to perform long actions in a logical sequence (or multiple sequences).
 * Meant to be chained together.
 */
var Animation = (function () {
    /**
     *
     * @param action A function which accepts a callback to be performed when it has finished. A unit of animation.
     * @param callback Will be called once this and all its descendents have finished.
     * @param maxTime If the action does not fire its callback within this many seconds, go on without it.
     */
    function Animation(action, callback, maxTime) {
        if (callback === void 0) { callback = null; }
        if (maxTime === void 0) { maxTime = 5; }
        this._id = -1;
        this.callback = null;
        this.parent = null;
        this.children = null;
        this.started = false;
        this.actionComplete = false;
        this.childrenFinished = false;
        this.timer = null;
        this._id = Animation.nextId++;
        this.action = action;
        this.callback = callback;
        this.maxTime = maxTime;
    }
    Object.defineProperty(Animation.prototype, "finished", {
        get: function () { return this.actionComplete && (this.children === null || this.childrenFinished); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Animation.prototype, "id", {
        get: function () { return this._id; },
        enumerable: true,
        configurable: true
    });
    /**
     * Go! As a convenience, if the parent has not started, starts that instead.
     */
    Animation.prototype.start = function (setCallback) {
        var _this = this;
        if (setCallback === void 0) { setCallback = null; }
        if (this.started)
            return;
        if (setCallback)
            this.callback = setCallback;
        if (this.parent && !this.parent.started) {
            this.parent.start();
            return;
        }
        this.started = true;
        var actionCallback = function () {
            _this.onActionComplete();
        };
        this.action(actionCallback);
        if (this.maxTime > 0) {
            this.timer = new Timer_1.default().init(this.maxTime, actionCallback).start();
        }
    };
    /**
     * Sets the animation to be performed after this one, and returns it (not this).
     *
     * NOTE: Doesn't work after calling start
     */
    Animation.prototype.then = function (animation) {
        if (this.started)
            return this;
        if (!this.children)
            this.children = [];
        this.children.push(animation);
        animation.parent = this;
        return animation;
    };
    Animation.prototype.onActionComplete = function () {
        if (this.actionComplete)
            return;
        this.actionComplete = true;
        if (this.timer && this.timer.active) {
            this.timer.stop();
        }
        if (this.children) {
            for (var _i = 0, _a = this.children; _i < _a.length; _i++) {
                var child = _a[_i];
                child.start();
            }
        }
        else {
            this.onFinished();
        }
    };
    Animation.prototype.onChildFinished = function () {
        if (this.childrenFinished)
            return;
        //sure this is O(n^2) but how often are you going to have more than one child? let alone more than a handful
        for (var _i = 0, _a = this.children; _i < _a.length; _i++) {
            var child = _a[_i];
            if (!child.finished)
                return;
        }
        this.childrenFinished = true;
        this.onFinished();
    };
    Animation.prototype.onFinished = function () {
        if (this.callback)
            this.callback();
        if (this.parent)
            this.parent.onChildFinished();
    };
    Animation.prototype.toString = function () {
        return "Anim " + this.id + " (" + (Math.round(performance.now()) / 1000) + ")";
    };
    //////////////////////////////////////////////////
    // Static convenience constructors
    //////////////////////////////////////////////////
    Animation.wait = function (duration, callback) {
        if (callback === void 0) { callback = null; }
        var action = function (cb) {
            if (duration > 0)
                var timer = new Timer_1.default().init(duration, cb).start();
            else
                cb();
        };
        return new Animation(action, callback, duration + 0.5);
    };
    Animation.moveUnit = function (unit, path, callback, duration) {
        if (callback === void 0) { callback = null; }
        if (duration === void 0) { duration = -1; }
        if (duration < 0) {
            duration = (path.length - 1) * Globals_1.default.timeToTraverseTile;
        }
        var action = function (cb) {
            if (unit.display) {
                unit.display.tracePath(path, duration, cb);
            }
            else {
                cb();
            }
        };
        return new Animation(action, callback, duration + 0.5);
    };
    Animation.attackUnit = function (attacker, target, callback) {
        if (callback === void 0) { callback = null; }
        var d1 = attacker.display;
        var d2 = target.display;
        d1.updatePosition(); //make sure it's at the unit's position
        var action = function (cb) {
            var x0 = d1.x;
            var y0 = d1.y;
            d1.tweenTo(d2.x, d2.y, 0.2, Tween_1.default.easingFunctions.quadEaseIn, function () {
                d1.tweenTo(x0, y0, 0.4, Tween_1.default.easingFunctions.cubeEaseOut, function () {
                    cb();
                });
            });
        };
        return new Animation(action, callback, 2);
    };
    Animation.nextId = 1;
    return Animation;
}());
exports.default = Animation;
