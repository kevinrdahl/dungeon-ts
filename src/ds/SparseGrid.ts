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

	public set(x, y, value:T) {
		var row:Object = this.rows[y];
		if (!row) {
			row = {};
			this.rows[y] = row;
		}

		row[x] = value;
	}

	public get(x, y):T {
		var row:Object = this.rows[y];
		if (row && row.hasOwnProperty(x.toString())) {
			return row[x];
		}
		return this.defaultValue;
	}

	public unset(x, y) {
		var row: Object = this.rows[y];
		if (row && row.hasOwnProperty(x.toString())) {
			delete row[x];
		}
	}

	public contains(x, y):boolean {
		return this.get(x, y) != this.defaultValue;
	}

	public getAllCoordinates():number[][] {
		var allCoords: number[][] = [];

		for (var y in this.rows) {
			for (var x in this.rows[y]) {
				allCoords.push([Number(x), Number(y)]);
			}
		}

		return allCoords;
	}

	public foreach(func:(x, y, value:T)=>void) {
		for (var y in this.rows) {
			for (var x in this.rows[y]) {
				func(x, y, this.rows[y][x]);
			}
		}
	}

	public clone():SparseGrid<T> {
		return this.getUnion(this);
	}

	/**
	 * Copies all the other grid's value to this one, WITHOUT CLEARING THIS ONE
	 */
	public copyFrom(other:SparseGrid<T>) {
		for (var y in other.rows) {
			for (var x in other.rows[y]) {
				this.set(x, y, other.rows[y][x]);
			}
		}
	}

	/** Get a grid containing all the cells from this grid which aren't set in the other grid */
	public getComplement(other:SparseGrid<T>):SparseGrid<T> {
		return this.getValueSetInternal(other, SparseGrid.SET_COMPLEMENT);
	}

	/** NOTE: this only really makes sense for boolean grids */
	public getIntersection(other: SparseGrid<T>): SparseGrid<T> {
		return this.getValueSetInternal(other, SparseGrid.SET_INTERSECTION);
	}

	/** NOTE: this only really makes sense for boolean grids */
	public getUnion(other: SparseGrid<T>): SparseGrid<T> {
		return this.getValueSetInternal(other, SparseGrid.SET_UNION);
	}

	public filter(func:(x, y, val:T)=>boolean):SparseGrid<T> {
		var grid = new SparseGrid<T>(this.defaultValue);

		for (var y in this.rows) {
			var row = this.rows[y];
			for (var x in row) {
				if (func(x, y, row[x])) {
					grid.set(x, y, row[x]);
				}
			}
		}

		return grid;
	}

	private static readonly SET_UNION = 0;
	private static readonly SET_COMPLEMENT = 1;
	private static readonly SET_INTERSECTION = 2;

	private getValueSetInternal(other:SparseGrid<T>, setType:number):SparseGrid<T> {
		var ret: SparseGrid<T> = new SparseGrid<T>(this.defaultValue);

		for (var y in this.rows) {
			var row = this.rows[y];
			for (var x in row) {
				switch (setType) {
					case SparseGrid.SET_INTERSECTION:
						if (other.contains(x, y)) {
							ret.set(x, y, row[x])
						}
						break;

					case SparseGrid.SET_COMPLEMENT:
						if (!other.contains(x, y)) {
							ret.set(x, y, row[x])
						}
						break;

					case SparseGrid.SET_UNION:
					ret.set(x, y, row[x]);
				}

			}
		}

		if (setType == SparseGrid.SET_UNION && other !== this) {
			for (var y in other.rows) {
				var row = other.rows[y];
				for (var x in row) {
					//preserve values from this grid
					if (!ret.contains(x, y)) {
						ret.set(x, y, row[x]);
					}
				}
			}
		}

		return ret;
	}
}