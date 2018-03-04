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
var InterfaceElement_1 = require("../../InterfaceElement");
var ElementList_1 = require("../../ElementList");
var TextButton_1 = require("../../TextButton");
var ScreenSelector = /** @class */ (function (_super) {
    __extends(ScreenSelector, _super);
    function ScreenSelector(mainMenu) {
        var _this = _super.call(this) || this;
        _this.mainMenu = mainMenu;
        return _this;
    }
    ScreenSelector.prototype.init = function () {
        this.buttonList = new ElementList_1.default(30, ElementList_1.default.HORIZONTAL, 10);
        var buttonInfo = [
            { name: "Units", screen: "units", color: TextButton_1.default.colorSchemes.blue },
            { name: "Dungeons", screen: "dungeons", color: TextButton_1.default.colorSchemes.red }
        ];
        this.buttonList.beginBatchChange();
        for (var _i = 0, buttonInfo_1 = buttonInfo; _i < buttonInfo_1.length; _i++) {
            var info = buttonInfo_1[_i];
            var button = new TextButton_1.default(info.name, info.color);
            button.onClick = this.getButtonCallback(info.screen);
            this.buttonList.addChild(button);
        }
        this.buttonList.endBatchChange();
        this.addChild(this.buttonList);
        this.resizeToFitChildren();
    };
    ScreenSelector.prototype.getButtonCallback = function (screenName) {
        var _this = this;
        return function () {
            console.log("ScreenSelector button: open \"" + screenName + "\"");
            _this.mainMenu.openScreen(screenName);
        };
    };
    return ScreenSelector;
}(InterfaceElement_1.default));
exports.default = ScreenSelector;
