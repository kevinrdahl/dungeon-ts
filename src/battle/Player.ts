import Battle from './Battle';
import Unit from './Unit';
import IDObjectGroup from '../util/IDObjectGroup';

export default class Player {
	private static _nextID: number = 1;
	private _id: number;

	public battle:Battle = null;
	public units:IDObjectGroup<Unit> = new IDObjectGroup<Unit>();

	get id(): number { return this._id; }

	constructor() {
		this._id = Player._nextID++;
	}

	public addUnit(unit:Unit) {
		if (unit.player) {
			unit.player.removeUnit(unit);
		}

		var added = this.units.add(unit);
		if (added) {
			unit.player = this;
		}
	}

	public removeUnit(unit:Unit) {
		var removed = this.units.remove(unit);
		if (unit.player == this) {
			unit.player = null;
		}
	}

	public checkDefeated():boolean {
		for (var unit of this.units.list) {
			if (unit.alive) return false;
		}
		return true;
	}
}