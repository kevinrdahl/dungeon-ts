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
var ScreenSelector_1 = require("./ScreenSelector");
var AttachInfo_1 = require("../../AttachInfo");
var UnitScreen_1 = require("./UnitScreen");
var DungeonScreen_1 = require("./DungeonScreen");
var MainMenu = (function (_super) {
    __extends(MainMenu, _super);
    function MainMenu() {
        var _this = _super.call(this) || this;
        _this.currentScreen = null;
        _this.currentScreenName = "";
        return _this;
    }
    MainMenu.prototype.init = function () {
        this.resizeToParent();
        this.screenSelector = new ScreenSelector_1.default(this);
        this.screenSelector.init();
        this.addChild(this.screenSelector);
        this.screenSelector.attachToParent(AttachInfo_1.default.BottomCenter);
        console.log("MainMenu: " + JSON.stringify(this.getBounds()));
        console.log("selector " + JSON.stringify(this.screenSelector.getBounds()));
    };
    MainMenu.prototype.openScreen = function (name, forceReopen) {
        if (forceReopen === void 0) { forceReopen = false; }
        console.log("MainMenu: openScreen \"" + name + "\"");
        if (!forceReopen && name == this.currentScreenName)
            return;
        this.closeScreen();
        switch (name) {
            case "units":
                this.currentScreen = new UnitScreen_1.default();
                this.currentScreen.init();
                break;
            case "dungeons":
                this.currentScreen = new DungeonScreen_1.default();
                this.currentScreen.init();
                break;
        }
        if (this.currentScreen) {
            this.addChild(this.currentScreen);
            this.currentScreen.attachToParent(AttachInfo_1.default.Center);
            this.currentScreenName = name;
        }
        else {
            this.currentScreenName = "";
        }
    };
    MainMenu.prototype.closeScreen = function () {
        if (this.currentScreen) {
            this.currentScreen.destroy();
            this.currentScreen = null;
        }
    };
    return MainMenu;
}(InterfaceElement_1.default));
exports.default = MainMenu;
