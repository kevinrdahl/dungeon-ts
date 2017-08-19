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
				this.addUnit(unit, false);
			}
		}

		this.beginTurn(this.players.list[0]);
		this.updateAllUnitPathing();
	}

	////////////////////////////////////////////////////////////
	// Player actions
	////////////////////////////////////////////////////////////

	public selectUnit(unit:Unit) {
		if (unit == this._selectedUnit) return;

		this.deselectUnit();
		this._selectedUnit = unit;
		if (unit) {
			unit.onSelect();

			this.updatePathingDisplay();
		}
	}

	public deselectUnit() {
		if (!this._selectedUnit) return;

		var unit = this._selectedUnit;
		this._selectedUnit = null;
		unit.onDeselect();

		if (this._display) {
			this.updatePathingDisplay();
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
		this.onUnitAction(unit);
		this.updateAllUnitPathing();
	}

	public attackUnit(attacker:Unit, target:Unit) {
		if (!attacker.selected || !this.ownUnitSelected()) {
			console.log("Battle: " + attacker + " isn't selected by the current player");
			return;
		}

		if (attacker.actionsRemaining <= 0) {
			console.log("Battle: " + attacker + " is out of actions");
		}

		if (!attacker.inRangeToAttack(target)) {
			console.log("Battle: " + attacker + " isn't in range to attack " + target);
			return;
		}

		//there will be a LOT to change here
		target.takeDamage(attacker.attackDamage, attacker);
		this.onUnitAction(attacker);
	}

	private beginTurn(player:Player) {
		if (this._currentPlayer != null) {
			this.endTurn();
		}

		this._currentPlayer = player;
	}

	public endTurn() {
		this.deselectUnit();

		if (this._currentPlayer) {
			for (var unit of this._currentPlayer.units.list) {
				unit.actionsRemaining = unit.actionsPerTurn;
				unit.onActionsChanged();
			}
		}

		//select next player and start their turn
		var index = (this._currentPlayer != null) ? (this.players.list.indexOf(this._currentPlayer) + 1) % this.players.count : 0;
		this._currentPlayer = null;
		this.beginTurn(this.players.list[index]);
	}

	////////////////////////////////////////////////////////////
	// Events
	////////////////////////////////////////////////////////////
	public onUnitDeath(unit:Unit) {
		this.removeUnit(unit);
	}

	/** The unit has just completed an action */
	public onUnitAction(unit:Unit) {
		unit.actionsRemaining -= 1;
		if (unit.actionsRemaining <= 0) {
			//update the unit display somehow
			if (unit.selected) this.deselectUnit();
		}
	}

	////////////////////////////////////////////////////////////
	// Book keeping
	////////////////////////////////////////////////////////////

	public updateAllUnitPathing() {
		var now = performance.now();
		for (var unit of this.units.list) {
			unit.updatePathing();
		}
		var timeTaken = performance.now() - now;
		console.log("Updating pathing for " + this.units.count + " units took " + timeTaken + "ms");

		this.updatePathingDisplay();
	}

	////////////////////////////////////////////////////////////
	// Convenience functions for checking state
	////////////////////////////////////////////////////////////

	public getUnitAtPosition(x:number, y:number):Unit {
		return this.unitPositions.get(x, y);
	}

	public ownUnitSelected():boolean {
		if (this._currentPlayer && this._selectedUnit && this._selectedUnit.player == this._currentPlayer) {
			return true;
		}
		return false;
	}

	////////////////////////////////////////////////////////////
	// Adding and removing things
	////////////////////////////////////////////////////////////

	public addPlayer(player: Player) {
		this.players.add(player);
		player.battle = this;
	}

	/** I'm pretty sure there will never be a reason to do this... */
	public removePlayer(player: Player) {
		this.players.remove(player);
		player.battle = null;
	}

	public addUnit(unit: Unit, updatePathing:boolean = true) {
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
		if (updatePathing) {
			this.updateAllUnitPathing();
		}
	}

	public removeUnit(unit: Unit) {
		if (unit.selected) {
			this.deselectUnit();
		}

		this.units.remove(unit);
		if (unit.battle == this) {
			unit.battle = null;
		}

		unit.onRemoveFromBattle();
		this.updateAllUnitPathing();
	}

	////////////////////////////////////////////////////////////
	// Input
	////////////////////////////////////////////////////////////

	/** Perform the default action for that tile */
	public rightClickTile(x: number, y: number) {
		var unit = this._selectedUnit;
		if (this.ownUnitSelected() && unit.actionsRemaining > 0) {
			var tileUnit:Unit = this.getUnitAtPosition(x, y);
			if (!tileUnit && unit.canReachTile(x, y)) {
				this.moveUnit(unit, x, y);
			}
			else if (tileUnit && unit.canAttackUnit(tileUnit) && unit.inRangeToAttack(tileUnit)) {
				this.attackUnit(unit, tileUnit);
			}
			else if (tileUnit) {
				console.log("uh");
				console.log(unit);
				console.log(tileUnit);
				console.log(unit.canAttackUnit(tileUnit));
				console.log(unit.inRangeToAttack(tileUnit));
			}
		}
	}

	public updatePathingDisplay() {
		if (!this.display) return;

		this.display.levelDisplay.clearPathing();
		this.display.levelDisplay.clearRoute();

		var unit = this._selectedUnit;
		if (unit && (unit.actionsRemaining > 0 || unit.player != this._currentPlayer)) {
			if (this.ownUnitSelected()) {
				this._display.levelDisplay.showPathing(unit.pathableTiles, 0x0000ff);
				this._display.levelDisplay.showPathing(unit.getAttackableNonWalkableTiles(), 0xff0000);
			} else {
				this._display.levelDisplay.showPathing(unit.attackableTiles, 0xff0000);
			}
		}
	}

	////////////////////////////////////////////////////////////
	// Init
	////////////////////////////////////////////////////////////

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