"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Convenience class for an Object of Objects
 *
 * I understand that JavaScript Arrays are generally implemented as hash tables anyway,
 * but on the off chance some platform is different, use this class instead. Speed will
 * be more or less identical.
 */
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
    SparseGrid.prototype.contains = function (x, y) {
        return this.get(x, y) != this.defaultValue;
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
    /** Get a grid containing all the cells from this grid which aren't set in the other grid */
    SparseGrid.prototype.getComplement = function (other) {
        return this.getValueSetInternal(other, SparseGrid.SET_COMPLEMENT);
    };
    /** NOTE: this only really makes sense for boolean grids */
    SparseGrid.prototype.getIntersection = function (other) {
        return this.getValueSetInternal(other, SparseGrid.SET_INTERSECTION);
    };
    /** NOTE: this only really makes sense for boolean grids */
    SparseGrid.prototype.getUnion = function (other) {
        return this.getValueSetInternal(other, SparseGrid.SET_UNION);
    };
    SparseGrid.prototype.getValueSetInternal = function (other, setType) {
        var ret = new SparseGrid(this.defaultValue);
        for (var y in this.rows) {
            for (var x in this.rows[y]) {
                switch (setType) {
                    case SparseGrid.SET_INTERSECTION:
                        if (other.contains(x, y)) {
                            ret.set(x, y, this.rows[y][x]);
                        }
                        break;
                    case SparseGrid.SET_COMPLEMENT:
                        if (!other.contains(x, y)) {
                            ret.set(x, y, this.rows[y][x]);
                        }
                        break;
                    case SparseGrid.SET_UNION:
                        ret.set(x, y, this.rows[y][x]);
                }
            }
        }
        if (setType == SparseGrid.SET_UNION) {
            for (var y in other.rows) {
                for (var x in other.rows[y]) {
                    //preserve values from this grid
                    if (!ret.contains(x, y)) {
                        ret.set(x, y, other.rows[y][x]);
                    }
                }
            }
        }
        return ret;
    };
    SparseGrid.SET_UNION = 0;
    SparseGrid.SET_COMPLEMENT = 1;
    SparseGrid.SET_INTERSECTION = 2;
    return SparseGrid;
}());
exports.default = SparseGrid;
