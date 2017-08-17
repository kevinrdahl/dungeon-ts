/**
 * Convenience class for an Object of Objects
 * 
 * I understand that JavaScript Arrays are generally implemented as hash tables anyway,
 * but on the off chance some platform is different, use this class instead. Speed will
 * be more or less identical.
 */
export default class SparseGrid<T> {
	private rows:Object = {};
	private defaultValue;

	constructor(defaultValue:any = null) {
		this.defaultValue = defaultValue;
	}

	public set(x:number, y:number, value:T) {
		var row:Object = this.rows[y];
		if (!row) {
			row = {};
			this.rows[y] = row;
		}

		row[x] = value;
	}

	public get(x:number, y:number):T {
		var row:Object = this.rows[y];
		if (row && row.hasOwnProperty(x.toString())) {
			return row[x];
		}
		return this.defaultValue;
	}

	public unset(x:number, y:number) {
		var row: Object = this.rows[y];
		if (row && row.hasOwnProperty(x.toString())) {
			delete row[x];
		}
	}

	public contains(x:number, y:number):boolean {
		return this.get(x, y) != this.defaultValue;
	}

	public getAllCoordinates():Array<Array<number>> {
		var allCoords: Array<Array<number>> = [];

		for (var y in this.rows) {
			for (var x in this.rows[y]) {
				allCoords.push([Number(x), Number(y)]);
			}
		}

		return allCoords;
	}
}