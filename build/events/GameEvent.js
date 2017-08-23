"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var GameEvent = (function () {
    /**
     * Get instances via the static getInstance.
     */
    function GameEvent() {
    }
    GameEvent.getInstance = function (type, data, from) {
        if (data === void 0) { data = null; }
        if (from === void 0) { from = null; }
        var instance;
        if (GameEvent._pool.length > 0) {
            instance = GameEvent._pool.pop();
        }
        else {
            instance = new GameEvent();
        }
        instance.init(type, data, from);
        return instance;
    };
    GameEvent.releaseInstance = function (instance) {
        if (GameEvent._pool.length >= GameEvent._maxPooled)
            return;
        GameEvent._pool.push(instance);
    };
    GameEvent.prototype.init = function (type, data, from) {
        this.type = type;
        this.data = data;
        this.from = from;
    };
    GameEvent.types = {
        ui: {
            LEFTMOUSEDOWN: "left mouse down",
            LEFTMOUSEUP: "left mouse up",
            LEFTMOUSECLICK: "left mouse click",
            RIGHTMOUSEDOWN: "right mouse down",
            RIGHTMOUSEUP: "right mouse up",
            RIGHTMOUSECLICK: "right mouse click",
            MOUSEOVER: "mouse over",
            MOUSEOUT: "mouse out",
            FOCUS: "focus",
            UNFOCUS: "unfocus",
            CHANGE: "change",
            KEY: "key",
            TAB: "tab",
            SUBMIT: "submit"
        },
        battle: {
            ANIMATIONSTART: "animation start",
            ANIMATIONCOMPLETE: "animation complete",
            UNITSELECTIONCHANGED: "unit selection changed"
        }
    };
    GameEvent._pool = [];
    GameEvent._maxPooled = 10; //in theory there's only ever one event, unless its handlers spawn more
    return GameEvent;
}());
exports.default = GameEvent;
