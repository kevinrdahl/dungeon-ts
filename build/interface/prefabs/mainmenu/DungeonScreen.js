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
var TextElement_1 = require("../../TextElement");
var DungeonScreen = /** @class */ (function (_super) {
    __extends(DungeonScreen, _super);
    function DungeonScreen() {
        return _super.call(this) || this;
    }
    DungeonScreen.prototype.init = function () {
        this.addChild(new TextElement_1.default("Dungeons"));
        this.resizeToFitChildren();
    };
    return DungeonScreen;
}(InterfaceElement_1.default));
exports.default = DungeonScreen;
