import Layout from "./Layout";
import Dungeon from "./Dungeon";
import Monster from "./Monster";

export default class DefinitionManager {
	private allDefinitions:object = {}; //by type, then by ID

	private static classesByType = {
		"layout": Layout,
		"dungeon": Dungeon,
		"monster": Monster
	}

	constructor() {

	}

	/**
	 * I expect that any def data has an ID, but if not, you can set it here and see how that goes.
	 * If no id is set or readable, this will do nothing.
	 */
	public setDefinition(type:string, data:any, overwriteExisting = false, id:number = -1) {
		if (id == -1 && data.id) id = data.id;
		if (id < 1) return;

		var defs:object = this.allDefinitions[type];
		if (!defs) {
			defs = {};
			this.allDefinitions[type] = defs;
		}

		var existing = defs[id];
		if (existing) {
			if (overwriteExisting) existing.readData(data);
		} else {
			var defClass = DefinitionManager.classesByType[type];
			if (defClass) {
				defs[id] = new defClass();
				defs[id].readData(data);
			} else {
				console.log("DefinitionManager: type " + type + " has no associated class");
			}
		}
	}

	public getDefinition(type:string, id:number) {
		var defs:object = this.allDefinitions[type];
		if (!defs) return null;

		var def = defs[id];
		if (def) return def;

		return null;
	}

	public getMultipleDefs(type:string, ids:number[], includeNull=false):any[] {
		var defs = [];
		var typeDefs:object = this.allDefinitions[type];
		if (!typeDefs) typeDefs = {};

		for (var id of ids) {
			var def = typeDefs[id];
			if (!def) {
				console.warn("DefinitionManager: missing definition " + type + " " + id);
				if (includeNull) defs.push(null);
			} else {
				defs.push(def);
			}
		}

		return defs;
	}
}