"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Vector2D_1 = require("../util/Vector2D");
var AttachInfo = (function () {
    /**
     *
     * @param from Point on this object, defined as a factor of its dimensions
     * @param to Point on the other object, defined as a factor of its dimensions
     * @param offset Pixel offset for the object being attached
     */
    function AttachInfo(from, to, offset) {
        this.from = from;
        this.to = to;
        this.offset = offset;
    }
    AttachInfo.prototype.clone = function () {
        return new AttachInfo(this.from.clone(), this.to.clone(), this.offset.clone());
    };
    /**
     * Gets a copy of this AttachInfo, with x and y added to its offset
     * @param x
     * @param y
     */
    AttachInfo.prototype.withOffset = function (x, y) {
        var info = this.clone();
        info.offset.x += x;
        info.offset.y += y;
        return info;
    };
    AttachInfo.TLtoTL = new AttachInfo(new Vector2D_1.default(0, 0), new Vector2D_1.default(0, 0), new Vector2D_1.default(0, 0));
    AttachInfo.TLtoTR = new AttachInfo(new Vector2D_1.default(0, 0), new Vector2D_1.default(1, 0), new Vector2D_1.default(0, 0));
    AttachInfo.TLtoBL = new AttachInfo(new Vector2D_1.default(0, 0), new Vector2D_1.default(0, 1), new Vector2D_1.default(0, 0));
    AttachInfo.TRtoTR = new AttachInfo(new Vector2D_1.default(1, 0), new Vector2D_1.default(1, 0), new Vector2D_1.default(0, 0));
    AttachInfo.BLtoBL = new AttachInfo(new Vector2D_1.default(0, 1), new Vector2D_1.default(0, 1), new Vector2D_1.default(0, 0));
    AttachInfo.BRtoBR = new AttachInfo(new Vector2D_1.default(1, 1), new Vector2D_1.default(1, 1), new Vector2D_1.default(0, 0));
    AttachInfo.Center = new AttachInfo(new Vector2D_1.default(0.5, 0.5), new Vector2D_1.default(0.5, 0.5), new Vector2D_1.default(0, 0));
    AttachInfo.TopCenter = new AttachInfo(new Vector2D_1.default(0.5, 0), new Vector2D_1.default(0.5, 0), new Vector2D_1.default(0, 0));
    AttachInfo.BottomCenter = new AttachInfo(new Vector2D_1.default(0.5, 1), new Vector2D_1.default(0.5, 1), new Vector2D_1.default(0, 0));
    AttachInfo.RightCenter = new AttachInfo(new Vector2D_1.default(1, 0.5), new Vector2D_1.default(1, 0.5), new Vector2D_1.default(0, 0));
    AttachInfo.LeftCenter = new AttachInfo(new Vector2D_1.default(0, 0.5), new Vector2D_1.default(0, 0.5), new Vector2D_1.default(0, 0));
    return AttachInfo;
}());
exports.default = AttachInfo;
