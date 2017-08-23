import Game from '../Game';
import Player from './Player';
import Unit from './Unit';
import Level from './Level';
import IDObjectGroup from '../util/IDObjectGroup';
import BattleDisplay from './display/BattleDisplay';
import SparseGrid from '../ds/SparseGrid';
import Globals from '../Globals';
import Timer from '../util/Timer';
import Animation from './display/animation/Animation';
import GameEvent from '../events/GameEvent';
import GameEventHandler from '../events/GameEventHandler';

export default class Battle extends GameEventHandler {
	public players:IDObjectGroup<Player> = new IDObjectGroup<Player>();
	public units: IDObjectGroup<Unit> = new IDObjectGroup<Unit>();
	public level:Level = null;

	get visible():boolean { return this._visible; }
	get display():BattleDisplay { return this._display; }
	get selectedUnit():Unit { return this._selectedUnit; }
	get currentPlayer():Player { return this._currentPlayer; }
	get animationTime():number { return this._animationTime; }
	get animating():boolean { return this._animating; }

	private _visible:boolean;
	private _display:BattleDisplay = null;
	private _selectedUnit:Unit = null;
	private _currentPlayer:Player = null;
	private initialized:boolean = false;
	private unitPositions:SparseGrid<Unit> = new SparseGrid<Unit>(null);
	private _animationTime:number = 0;

	//animation
	private firstAnimation:Animation = null;
	private lastAnimation:Animation = null;
	private _animating:boolean = false;

	/**
	 * It's a battle!
	 * @param visible Determines whether this Battle should be displayed. False for peer authentication if I ever get around to it.
	 */
	constructor(visible:boolean = true) {
		super();
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

		this.deselectUnit(false);
		this._selectedUnit = unit;
		if (unit) {
			unit.onSelect();
		}

		this.sendNewEvent(GameEvent.types.battle.UNITSELECTIONCHANGED);
	}

	public deselectUnit(sendEvent = true) {
		if (!this._selectedUnit) return;

		var unit = this._selectedUnit;
		this._selectedUnit = null;
		unit.onDeselect();

		if (sendEvent) this.sendNewEvent(GameEvent.types.battle.UNITSELECTIONCHANGED);
	}

	public moveUnit(unit:Unit, x:number, y:number, path:number[][] = null) {
		//This is going to have to step through the whole path and see what triggers
		//(once that sort of thing is implemented, anyway)
		this.unitPositions.unset(unit.x, unit.y);
		this.unitPositions.set(x, y, unit);
		unit.x = x;
		unit.y = y;

		var display = unit.display;
		if (display) {
			/*var timeTaken = Globals.timeToTraverseTile * (path.length - 1); //-1 since path includes the start cell
			if (this._animationTime > 0) {
				var timer = new Timer().init(this._animationTime, ()=> {
					display.tracePath(path, timeTaken);;
				}).start();
			} else {
				display.tracePath(path, timeTaken);
			}

			this._animationTime += timeTaken;*/
			var animation = Animation.moveUnit(unit, path);
			this.queueAnimation(animation);
		}

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

		var animation = Animation.attackUnit(attacker, target);
		this.queueAnimation(animation);

		//there will be a LOT to change here
		target.takeDamage(attacker.attackDamage, attacker);
		this.onUnitAction(attacker);
	}

	private beginTurn(player:Player) {
		if (this._currentPlayer != null) {
			this.endTurn();
		}

		this._currentPlayer = player;
		if (this._display) {
			this._display.updateDebugPanel();
		}
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
		if (unit.player) {
			unit.player.removeUnit(unit);
		}
	}

	/** The unit has just completed an action */
	public onUnitAction(unit:Unit) {
		unit.actionsRemaining -= 1;
		if (unit.actionsRemaining <= 0) {
			//update the unit display somehow
			if (unit.selected) {
				this.deselectUnit();
			}
		}

		if (this.shouldForceEndTurn()) {
			this.endTurn();
		}
	}

	private initAnimation() {
		this.firstAnimation = null;
		this.lastAnimation = null;
		this._animating = false;
	}

	private beginAnimation() {
		if (this._animating || this.firstAnimation == null) return;

		this._animating = true;
		this.sendNewEvent(GameEvent.types.battle.ANIMATIONSTART)
		this.firstAnimation.start(() => {
			this.onAnimationComplete();
		});
	}

	private onAnimationComplete() {
		this._animating = false;
		this.sendNewEvent(GameEvent.types.battle.ANIMATIONCOMPLETE);
	}

	private queueAnimation(animation:Animation) {
		if (this.firstAnimation == null) {
			this.firstAnimation = animation;
			this.lastAnimation = animation;
		} else {
			this.lastAnimation.then(animation);
			this.lastAnimation = animation;
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

	public shouldForceEndTurn():boolean {
		return this.getUnitsWithActions().length == 0;
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
		this.unitPositions.unset(unit.x, unit.y);
		if (unit.battle == this) {
			unit.battle = null;
		}

		unit.onRemoveFromBattle();
		this.updateAllUnitPathing();
	}

	////////////////////////////////////////////////////////////
	// Getting things
	////////////////////////////////////////////////////////////

	public getUnitsWithActions():Array<Unit> {
		var ret:Array<Unit> = [];

		if (this._currentPlayer) {
			for (var unit of this.currentPlayer.units.list) {
				if (unit.canAct()) {
					ret.push(unit);
				}
			}
		}

		return ret;
	}

	public getDebugPanelStrings():Array<string> {
		var ret:Array<string> = [
			"Current player: " + this._currentPlayer.id,
			"Selected: " + this._selectedUnit
		];

		var coords = this.display.hoverCoords;
		var hoverStrings: Array<string> = [coords.toString()];
		var tile = this.level.getTile(coords.x, coords.y);
		if (tile) {
			hoverStrings.push(tile.name);
		}

		var unit = this.getUnitAtPosition(coords.x, coords.y);
		if (unit) {
			hoverStrings.push(unit.toString());
		}

		ret.push("Hover: " + JSON.stringify(hoverStrings));

		return ret;
	}

	////////////////////////////////////////////////////////////
	// Input
	////////////////////////////////////////////////////////////

	/** Perform the default action for that tile */
	public rightClickTile(x: number, y: number) {
		var unit = this._selectedUnit;
		if (this.ownUnitSelected() && unit.canAct()) {
			this.initAnimation();

			var tileUnit:Unit = this.getUnitAtPosition(x, y);
			if (!tileUnit && unit.canReachTile(x, y)) {
				this.moveUnit(unit, x, y, unit.getPathToPosition(x, y));
			}
			else if (tileUnit && unit.isHostileToUnit(tileUnit)) {
				if (unit.inRangeToAttack(tileUnit)) {
					this.attackUnit(unit, tileUnit);
				} else if (unit.actionsRemaining > 1) {
					var pos = unit.getPositionToAttackUnit(tileUnit);
					if (pos) {
						this.moveUnit(unit, pos[0], pos[1], unit.getPathToPosition(pos[0], pos[1]));
						this.attackUnit(unit, tileUnit);
					}
				}
			}

			this.beginAnimation();
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