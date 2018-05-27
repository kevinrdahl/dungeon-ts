"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var GameEvent_1 = require("./GameEvent");
var Util = require("../util/Util");
var GameEventHandler = (function () {
    function GameEventHandler() {
        this._listenersByType = {};
        this.subscribers = [];
    }
    GameEventHandler.prototype.addEventListener = function (eventType, listener) {
        var listeners = this._listenersByType[eventType];
        if (!listeners) {
            listeners = [];
            this._listenersByType[eventType] = listeners;
        }
        else if (listeners.indexOf(listener) >= 0) {
            console.log("GameEventDispatcher: Not adding duplicate listener of type " + eventType);
            return;
        }
        listeners.push(listener);
    };
    GameEventHandler.prototype.removeEventListener = function (eventType, listener) {
        var listeners = this._listenersByType[eventType];
        if (!listeners) {
            return;
        }
        var index = listeners.indexOf(listener);
        if (index === -1) {
            console.log("GameEventDispatcher: Can't remove listener that doesn't exist, type " + eventType);
        }
        else {
            listeners.splice(index, 1);
        }
    };
    GameEventHandler.prototype.removeAllEventListeners = function () {
        for (var type in this._listenersByType) {
            this._listenersByType[type].splice(0); //clears list
            delete this._listenersByType[type];
        }
    };
    GameEventHandler.prototype.sendNewEvent = function (type, data) {
        if (data === void 0) { data = null; }
        this.sendEvent(GameEvent_1.default.getInstance(type, data, this));
    };
    /**
     * NOTE: the event will be released after this call.
     * Also, does not set the "from" property of the event. Good for propagating.
     */
    GameEventHandler.prototype.sendEvent = function (event) {
        var listeners = this._listenersByType[event.type];
        if (listeners) {
            for (var _i = 0, listeners_1 = listeners; _i < listeners_1.length; _i++) {
                var listener = listeners_1[_i];
                listener(event);
            }
        }
        for (var _a = 0, _b = this.subscribers; _a < _b.length; _a++) {
            var subscriber = _b[_a];
            subscriber.sendEvent(event);
        }
        GameEvent_1.default.releaseInstance(event);
    };
    /**
     * Causes all events sent by the other GameEventHandler to be propagated by this one.
     */
    GameEventHandler.prototype.subscribeTo = function (other) {
        Util.ArrayAdd(other.subscribers, this);
    };
    GameEventHandler.prototype.unsubscribeFrom = function (other) {
        Util.ArrayRemove(other.subscribers, this);
    };
    return GameEventHandler;
}());
exports.default = GameEventHandler;
