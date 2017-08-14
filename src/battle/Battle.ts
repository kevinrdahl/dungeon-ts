import Game from '../Game';
import Player from './Player';
import Unit from './Unit';
import Level from './Level';
import IDObjectGroup from '../util/IDObjectGroup';
import BattleDisplay from './display/BattleDisplay';

export default class Battle {
	public players:IDObjectGroup<Player> = new IDObjectGroup<Player>();
	public units: IDObjectGroup<Unit> = new IDObjectGroup<Unit>();
	public level:Level = null;

	get visible():boolean { return this._visible; }
	get display():BattleDisplay { return this._display; }
	get selectedUnit():Unit { return this.selectedUnit; }

	private _visible:boolean;
	private _display:BattleDisplay = null;
	private _selectedUnit:Unit = null;
	private initialized:boolean = false;

	/**
	 * It's a battle!
	 * @param visible Determines whether this Battle should be displayed. False for peer authentication if I ever get around to it.
	 */
	constructor(visible:boolean = true) {
		this._visible = visible;
	}

	public init() {
		if (this.initialized) return;
		this.initialized = true;

		console.log("Battle: init");

		this.initLevel();

		if (this._visible) {
			this.initDisplay();
			this.level.initDisplay();
			this.display.setLevelDisplay(this.level.display);
		}

		//temp! add a couple players with a few units
		for (var i = 0; i < 2; i++) {
			var player:Player = new Player();
			this.addPlayer(player);

			for (var j = 0; j < 3; j++) {
				var unit:Unit = new Unit();
				unit.x = 1 + j;
				unit.y = 1 + i*2;
				player.addUnit(unit);
				this.addUnit(unit);
			}
		}

		var now = performance.now();
		for (var unit of this.units.list) {
			unit.updatePathing();
		}
		var timeTaken = performance.now() - now;
		console.log("Computing " + this.units.count + " units pathing took " + timeTaken + "ms");
	}

	public selectUnit(unit:Unit) {
		if (unit == this._selectedUnit) return;

		this.deselectUnit();
		this._selectedUnit = unit;
		if (unit) unit.onSelect();
	}

	public deselectUnit() {
		if (!this._selectedUnit) return;

		var unit = this._selectedUnit;
		this._selectedUnit = null;
		unit.onDeselect();
	}

	public addPlayer(player:Player) {
		this.players.add(player);
		player.battle = this;
	}

	/**
	 * I'm pretty sure there will never be a reason to do this...
	 */
	public removePlayer(player:Player) {
		this.players.remove(player);
		player.battle = null;
	}

	public addUnit(unit:Unit) {
		var added = this.units.add(unit);
		unit.battle = this;

		if (added) {
			unit.onAddToBattle();
		}
	}

	public removeUnit(unit:Unit) {
		this.units.remove(unit);
		if (unit.battle == this) {
			unit.battle = null;
		}
	}

	private initLevel() {
		this.level = new Level();
		this.level.init();
	}

	private initDisplay() {
		console.log("Battle: init display");
		this._display = new BattleDisplay();
		this._display.init(this);
		Game.instance.stage.addChildAt(this._display, 0);

		this._display.scale.set(3, 3);
	}
}