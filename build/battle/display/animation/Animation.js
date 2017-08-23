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
        this.numChildrenFinished = 0;
        this.timer = null;
        this._mode = 0; //branching
        this.name = "some animation";
        this._id = Animation.nextId++;
        this.action = action;
        this.callback = callback;
        this.maxTime = maxTime;
    }
    Object.defineProperty(Animation.prototype, "childrenFinished", {
        get: function () { return this.children === null || this.numChildrenFinished >= this.children.length; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Animation.prototype, "finished", {
        get: function () { return this.actionComplete && this.childrenFinished; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Animation.prototype, "id", {
        get: function () { return this._id; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Animation.prototype, "mode", {
        get: function () { return this._mode; },
        set: function (mode) { if (!this.started)
            this._mode = mode; },
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
        if (this.parent && !this.parent.started) {
            this.parent.start(setCallback);
            return;
        }
        if (setCallback)
            this.callback = setCallback;
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
            if (this.mode === Animation.modes.branching) {
                for (var _i = 0, _a = this.children; _i < _a.length; _i++) {
                    var child = _a[_i];
                    child.start();
                }
            }
            else if (this.mode === Animation.modes.sequential) {
                this.children[0].start();
            }
            else {
                console.error("Animation has an invalid mode!");
                console.log(this);
            }
        }
        else {
            this.onFinished();
        }
    };
    Animation.prototype.onChildFinished = function () {
        if (this.childrenFinished)
            return;
        this.numChildrenFinished += 1;
        if (this.childrenFinished) {
            this.onFinished();
        }
        else if (this.mode === Animation.modes.sequential) {
            this.children[this.numChildrenFinished].start();
        }
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
    /** Use this to wrap other animations */
    Animation.noop = function (callback) {
        if (callback === void 0) { callback = null; }
        var action = function (cb) {
            cb();
        };
        var anim = new Animation(action, callback, -1);
        anim.name = "noop";
        return anim;
    };
    Animation.wait = function (duration, callback) {
        if (callback === void 0) { callback = null; }
        var action = function (cb) {
            if (duration > 0)
                var timer = new Timer_1.default().init(duration, cb).start();
            else
                cb();
        };
        var anim = new Animation(action, callback, duration + 0.5);
        anim.name = "wait " + duration;
        return anim;
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
        var anim = new Animation(action, callback, duration + 0.5);
        anim.name = "move " + unit;
        return anim;
    };
    /** Lunge, do onHit and come back, callback */
    Animation.unitAttack = function (attacker, target, onHit, callback) {
        if (onHit === void 0) { onHit = null; }
        if (callback === void 0) { callback = null; }
        var lunge = Animation.unitLunge(attacker, target, callback);
        var comeBack = Animation.unitReturnToPosition(attacker);
        lunge.then(comeBack);
        if (onHit)
            lunge.then(onHit);
        return lunge;
    };
    Animation.unitLunge = function (unit, target, callback) {
        if (callback === void 0) { callback = null; }
        var d1 = unit.display;
        var d2 = target.display;
        d1.updatePosition();
        d2.updatePosition();
        var action = function (cb) {
            d1.tweenTo(d2.x, d2.y, 0.2, Tween_1.default.easingFunctions.quadEaseIn, function () {
                cb();
            });
        };
        var anim = new Animation(action, callback, 1);
        anim.name = "lunge " + unit + " at " + target;
        return anim;
    };
    Animation.unitReturnToPosition = function (unit, callback) {
        if (callback === void 0) { callback = null; }
        var d = unit.display;
        var pos = d.getGridPosition(unit.x, unit.y);
        var action = function (cb) {
            d.tweenTo(pos[0], pos[1], 0.4, Tween_1.default.easingFunctions.cubeEaseOut, function () {
                cb();
            });
        };
        var anim = new Animation(action, callback, 1);
        anim.name = "return " + unit;
        return anim;
    };
    Animation.unitTakeDamage = function (unit, callback) {
        if (callback === void 0) { callback = null; }
        var d = unit.display;
        var action = function (cb) {
            var tween = new Tween_1.default().init(d, "rotation", 0, Math.PI / 180 * 360, 0.5, Tween_1.default.easingFunctions.quadEaseInOut);
            tween.onFinish = function () {
                d.rotation = 0;
                cb();
            };
            tween.start();
        };
        var anim = new Animation(action, callback, 1);
        anim.name = "damage " + unit;
        return anim;
    };
    Animation.unitDie = function (unit, callback) {
        if (callback === void 0) { callback = null; }
        var d = unit.display;
        var battleDisplay = unit.battle.display;
        var action = function (cb) {
            var tween = new Tween_1.default().init(d, "alpha", 1, 0, 0.5, Tween_1.default.easingFunctions.quadEaseOut);
            tween.onFinish = function () {
                battleDisplay.removeUnitDisplay(d);
                cb();
            };
            tween.start();
        };
        var anim = new Animation(action, callback, 1);
        anim.name = "kill " + unit;
        return anim;
    };
    Animation.nextId = 1;
    Animation.modes = {
        branching: 0,
        sequential: 1
    };
    return Animation;
}());
exports.default = Animation;
