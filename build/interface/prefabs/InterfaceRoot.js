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
var InterfaceElement_1 = require("../InterfaceElement");
var GenericListDialog_1 = require("./GenericListDialog");
var TextButton_1 = require("../TextButton");
var InputManager_1 = require("../InputManager");
var AttachInfo_1 = require("../AttachInfo");
var InterfaceRoot = /** @class */ (function (_super) {
    __extends(InterfaceRoot, _super);
    function InterfaceRoot(container) {
        var _this = _super.call(this) || this;
        _this.layers = {};
        InterfaceRoot._instance = _this;
        container.addChild(_this._displayObject);
        _this.name = "root";
        _this.id = "root";
        _this.useDebugRect = false;
        for (var _i = 0, _a = InterfaceRoot.LayerOrder; _i < _a.length; _i++) {
            var layerName = _a[_i];
            var layer = new InterfaceElement_1.default();
            _this.addChild(layer);
            layer.resizeToParent();
            layer.name = layerName;
            layer.useDebugRect = false;
            _this.layers[layerName] = layer;
        }
        return _this;
    }
    Object.defineProperty(InterfaceRoot, "instance", {
        get: function () {
            return InterfaceRoot._instance;
        },
        enumerable: true,
        configurable: true
    });
    InterfaceRoot.prototype.getElementAtPoint = function (point) {
        var popups = this.getLayer(InterfaceRoot.LayerNames.popups);
        if (popups.numChildren > 0) {
            //if there are popups, only they can be clicked
            return popups.getElementAtPoint(point);
        }
        return _super.prototype.getElementAtPoint.call(this, point);
    };
    InterfaceRoot.prototype.getLayer = function (name) {
        var layer = this.layers[name];
        if (!layer)
            return null;
        return layer;
    };
    InterfaceRoot.prototype.addUI = function (element) {
        this.getLayer(InterfaceRoot.LayerNames.gameUI).addChild(element);
    };
    InterfaceRoot.prototype.addDialog = function (element) {
        this.getLayer(InterfaceRoot.LayerNames.dialogs).addChild(element);
    };
    InterfaceRoot.prototype.addAlert = function (element) {
        this.getLayer(InterfaceRoot.LayerNames.alerts).addChild(element);
    };
    InterfaceRoot.prototype.addPopup = function (element) {
        this.getLayer(InterfaceRoot.LayerNames.popups).addChild(element);
    };
    InterfaceRoot.prototype.showWarningPopup = function (message, title, onClose) {
        if (title === void 0) { title = null; }
        if (onClose === void 0) { onClose = null; }
        var dialog = new GenericListDialog_1.default(200, 10);
        if (title)
            dialog.addMediumTitle(title, 0);
        dialog.addMessage(message, 5);
        dialog.addButtons([
            { text: "Close", colorScheme: TextButton_1.default.colorSchemes.blue, onClick: function (e) {
                    dialog.removeSelf();
                    if (onClose) {
                        onClose();
                    }
                } }
        ]);
        dialog.finalize();
        this.addPopup(dialog);
        dialog.attachToParent(AttachInfo_1.default.Center);
        InputManager_1.default.instance.focus(null);
        return dialog;
    };
    InterfaceRoot.prototype.showStatusPopup = function (status) {
        var dialog = new GenericListDialog_1.default(200, 10);
        dialog.addMediumTitle(status);
        dialog.finalize();
        this.addPopup(dialog);
        dialog.attachToParent(AttachInfo_1.default.Center);
        InputManager_1.default.instance.focus(null);
        return dialog;
    };
    InterfaceRoot.LayerNames = {
        gameUI: "gameUI",
        dialogs: "dialogs",
        alerts: "alerts",
        popups: "popups" //warning boxes, error messages, confirmations
    };
    InterfaceRoot.LayerOrder = ["gameUI", "dialogs", "alerts", "popups"];
    InterfaceRoot._instance = null;
    return InterfaceRoot;
}(InterfaceElement_1.default));
exports.default = InterfaceRoot;
