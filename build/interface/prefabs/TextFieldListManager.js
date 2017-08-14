"use strict";
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
var GameEvent_1 = require("../../events/GameEvent");
var GameEventHandler_1 = require("../../events/GameEventHandler");
var InputManager_1 = require("../InputManager");
var TextFieldListManager = (function (_super) {
    __extends(TextFieldListManager, _super);
    /**
     * Not an InterfaceElement! Just sets up events (TAB/SUBMIT) for a list of text elements
     */
    function TextFieldListManager(fields) {
        if (fields === void 0) { fields = null; }
        var _this = _super.call(this) || this;
        _this.onTab = function (e) {
            var from = e.from;
            if (!from)
                return;
            var index = _this._fields.indexOf(from);
            if (index === -1)
                return;
            var increment = (InputManager_1.default.instance.isKeyDown("SHIFT")) ? -1 : 1;
            index = (index + increment) % _this._fields.length;
            if (index == -1)
                index = _this._fields.length - 1;
            InputManager_1.default.instance.focus(_this._fields[index]);
        };
        _this.onSubmit = function (e) {
            _this.sendEvent(e);
        };
        if (fields)
            _this.init(fields);
        return _this;
    }
    TextFieldListManager.prototype.init = function (fields) {
        if (this._fields)
            this.cleanup();
        this._fields = fields;
        for (var _i = 0, fields_1 = fields; _i < fields_1.length; _i++) {
            var field = fields_1[_i];
            field.addEventListener(GameEvent_1.default.types.ui.TAB, this.onTab);
            field.addEventListener(GameEvent_1.default.types.ui.SUBMIT, this.onSubmit);
        }
    };
    TextFieldListManager.prototype.cleanup = function () {
        for (var _i = 0, _a = this._fields; _i < _a.length; _i++) {
            var field = _a[_i];
            field.removeEventListener(GameEvent_1.default.types.ui.TAB, this.onTab);
            field.removeEventListener(GameEvent_1.default.types.ui.SUBMIT, this.onSubmit);
        }
    };
    return TextFieldListManager;
}(GameEventHandler_1.default));
exports.default = TextFieldListManager;
