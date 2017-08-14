
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