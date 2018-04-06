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
var UnitScreen = /** @class */ (function (_super) {
    __extends(UnitScreen, _super);
    function UnitScreen() {
        return _super.call(this) || this;
    }
    UnitScreen.prototype.init = function () {
        this.addChild(new TextElement_1.default("Units"));
        this.resizeToFitChildren();
    };
    return UnitScreen;
}(InterfaceElement_1.default));
exports.default = UnitScreen;
