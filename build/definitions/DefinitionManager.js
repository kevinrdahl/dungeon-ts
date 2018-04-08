"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Layout_1 = require("./Layout");
var Dungeon_1 = require("./Dungeon");
var DefinitionManager = (function () {
    function DefinitionManager() {
        this.allDefinitions = {}; //by type, then by ID
    }
    /**
     * I expect that any def data has an ID, but if not, you can set it here and see how that goes.
     * If no id is set or readable, this will do nothing.
     */
    DefinitionManager.prototype.setDefinition = function (type, data, overwriteExisting, id) {
        if (overwriteExisting === void 0) { overwriteExisting = false; }
        if (id === void 0) { id = -1; }
        if (id == -1 && data.id)
            id = data.id;
        if (id < 1)
            return;
        var defs = this.allDefinitions[type];
        if (!defs) {
            defs = {};
            this.allDefinitions[type] = defs;
        }
        var existing = defs[id];
        if (existing) {
            if (overwriteExisting)
                existing.readData(data);
        }
        else {
            var defClass = DefinitionManager.classesByType[type];
            if (defClass) {
                defs[id] = new defClass();
                defs[id].readData(data);
            }
            else {
                console.log("DefinitionManager: type " + type + " has no associated class");
            }
        }
    };
    DefinitionManager.prototype.getDefinition = function (type, id) {
        var defs = this.allDefinitions[type];
        if (!defs)
            return null;
        var def = defs[id];
        if (def)
            return def;
        return null;
    };
    DefinitionManager.prototype.getMultipleDefs = function (type, ids, includeNull) {
        if (includeNull === void 0) { includeNull = false; }
        var defs = [];
        var typeDefs = this.allDefinitions[type];
        if (!typeDefs)
            typeDefs = {};
        for (var _i = 0, ids_1 = ids; _i < ids_1.length; _i++) {
            var id = ids_1[_i];
            var def = typeDefs[id];
            if (!def) {
                console.warn("DefinitionManager: missing definition " + type + " " + id);
                if (includeNull)
                    defs.push(null);
            }
            else {
                defs.push(def);
            }
        }
        return defs;
    };
    DefinitionManager.classesByType = {
        "layout": Layout_1.default,
        "dungeon": Dungeon_1.default
    };
    return DefinitionManager;
}());
exports.default = DefinitionManager;
