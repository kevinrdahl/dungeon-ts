"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var SparseGrid = (function () {
    function SparseGrid(defaultValue) {
        if (defaultValue === void 0) { defaultValue = null; }
        this.rows = {};
        this.defaultValue = defaultValue;
    }
    SparseGrid.prototype.set = function (x, y, value) {
        var row = this.rows[y];
        if (!row) {
            row = {};
            this.rows[y] = row;
        }
        row[x] = value;
    };
    SparseGrid.prototype.get = function (x, y) {
        var row = this.rows[y];
        if (row && row.hasOwnProperty(x.toString())) {
            return row[x];
        }
        return this.defaultValue;
    };
    SparseGrid.prototype.unset = function (x, y) {
        var row = this.rows[y];
        if (row && row.hasOwnProperty(x.toString())) {
            delete row[x];
        }
    };
    SparseGrid.prototype.getAllCoordinates = function () {
        var allCoords = [];
        for (var y in this.rows) {
            for (var x in this.rows[y]) {
                allCoords.push([Number(x), Number(y)]);
            }
        }
        return allCoords;
    };
    return SparseGrid;
}());
exports.default = SparseGrid;
