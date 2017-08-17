import Game from '../Game';
import Player from './Player';
import Unit from './Unit';
import Level from './Level';
import IDObjectGroup from '../util/IDObjectGroup';
import BattleDisplay from './display/BattleDisplay';
import SparseGrid from '../ds/SparseGrid';

export default class Battle {
	public players:IDObjectGroup<Player> = new IDObjectGroup<Player>();
	public units: IDObjectGroup<Unit> = new IDObjectGroup<Unit>();
	public level:Level = null;

	get visible():boolean { return this._visible; }
	get display():BattleDisplay { return this._display; }
	get selectedUnit():Unit { return this._selectedUnit; }
	get currentPlayer():Player { return this._currentPlayer; }

	private _visible:boolean;
	private _display:BattleDisplay = null;
	private _selectedUnit:Unit = null;
	private _currentPlayer:Player = null;
	private initialized:boolean = false;
	private unitPositions:SparseGrid<Unit> = new SparseGrid<Unit>(null);

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

		this._currentPlayer = this.players.list[0];
		this.updateAllUnitPathing();
	}

	public updateAllUnitPathing() {
		var now = performance.now();
		for (var unit of this.units.list) {
			unit.updatePathing();
		}
		var timeTaken = performance.now() - now;
		console.log("Updating pathing for " + this.units.count + " units took " + timeTaken + "ms");
	}

	public selectUnit(unit:Unit) {
		if (unit == this._selectedUnit) return;

		this.deselectUnit();
		this._selectedUnit = unit;
		if (unit) {
			unit.onSelect();

			if (this._display) {
				var color:number = (this.ownUnitSelected()) ? 0x0000ff : 0xff0000;
				this._display.levelDisplay.clearPathing();
				this._display.levelDisplay.showPathing(unit.pathableTiles, color);
			}
		}
	}

	public deselectUnit() {
		if (!this._selectedUnit) return;

		var unit = this._selectedUnit;
		this._selectedUnit = null;
		unit.onDeselect();

		if (this._display) {
			this._display.levelDisplay.clearPathing();
			this._display.levelDisplay.clearRoute();
		}
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
		if (this.units.contains(unit)) {
			return;
		}

		var currentUnit = this.unitPositions.get(unit.x, unit.y);
		if (currentUnit) {
			console.log("Battle: can't add unit " + unit.id + " (unit " + currentUnit.id + " already occupies " + unit.x + ", " + unit.y + ")");
			return;
		}

		this.units.add(unit);
		this.unitPositions.set(unit.x, unit.y, unit);
		unit.battle = this;
		unit.onAddToBattle();
	}

	public removeUnit(unit:Unit) {
		this.units.remove(unit);
		if (unit.battle == this) {
			unit.battle = null;
		}
	}

	public moveUnit(unit:Unit, x:number, y:number) {
		//TODO: trace the path
		//for now, just plop it there
		this.unitPositions.unset(unit.x, unit.y);
		this.unitPositions.set(x, y, unit);
		unit.x = x;
		unit.y = y;
		unit.updatePosition();
		this.updateAllUnitPathing();
	}

	public hoverTile(x:number, y:number) {
		if (!this.display) return;
		this.display.levelDisplay.clearRoute();

		if (this.ownUnitSelected()) {
			if (this.selectedUnit.x != x || this.selectedUnit.y != y) {
				if (this.selectedUnit.pathableTiles.contains(x, y)) {
					var route = this.selectedUnit.getPathToPosition(x, y);
					this.display.levelDisplay.showRoute(route);
				}
			}
		}
	}

	public rightClickTile(x:number, y:number) {
		var unit = this._selectedUnit;
		if (unit && this.ownUnitSelected()) {
			if (unit.canReachTile(x, y) && !this.getUnitAtPosition(x, y)) {
				this.moveUnit(unit, x, y);
				this.deselectUnit();
				this.selectUnit(unit);
			}
		}
	}

	public getUnitAtPosition(x:number, y:number):Unit {
		return this.unitPositions.get(x, y);
	}

	public ownUnitSelected():boolean {
		if (this._currentPlayer && this._selectedUnit && this._selectedUnit.player == this._currentPlayer) {
			return true;
		}
		return false;
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