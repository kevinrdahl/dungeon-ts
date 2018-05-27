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
var SelectionDisplay_1 = require("./SelectionDisplay");
var AttachInfo_1 = require("../../AttachInfo");
var BattleUI = (function (_super) {
    __extends(BattleUI, _super);
    function BattleUI() {
        var _this = _super.call(this) || this;
        _this.battle = null;
        _this.clickable = false;
        _this.name = "Battle UI";
        _this.id = "Battle UI";
        _this.selectionDisplay = new SelectionDisplay_1.default();
        _this.addChild(_this.selectionDisplay);
        _this.selectionDisplay.attachToParent(AttachInfo_1.default.BLtoBL);
        _this.selectionDisplay.init(_this);
        return _this;
    }
    BattleUI.prototype.initBattle = function (battle) {
        if (this.battle)
            this.unsubscribeFrom(this.battle);
        this.battle = battle;
        this.subscribeTo(battle); //lets UI elements listen to this instead of all of them needing to update their current battle
    };
    return BattleUI;
}(InterfaceElement_1.default));
exports.default = BattleUI;
