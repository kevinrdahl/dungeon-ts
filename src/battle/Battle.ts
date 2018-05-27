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
import Layout from '../definitions/Layout';
import Hero from '../user/Hero';
import Monster from '../definitions/Monster';
import Tile from './Tile';

export default class Battle extends GameEventHandler {
	public players:IDObjectGroup<Player> = new IDObjectGroup<Player>();
	public units: IDObjectGroup<Unit> = new IDObjectGroup<Unit>();
	public level:Level = null;

	get visible():boolean { return this._visible; }
	get display():BattleDisplay { return this._display; }
	get selectedUnit():Unit { return this._selectedUnit; }
	get currentPlayer():Player { return this._currentPlayer; }
	get animating():boolean { return this._animating; }
	get turnNumber():number { return this._turnNumber; }
	get ended():boolean { return this._ended; }
	get winner():Player { return this._winner; }

	private _visible:boolean;
	private _display:BattleDisplay = null;
	private _selectedUnit:Unit = null;
	private _currentPlayer:Player = null;
	private initialized:boolean = false;
	private unitPositions:SparseGrid<Unit> = new SparseGrid<Unit>(null);
	private _turnNumber = 0;

	private _ended = false;
	private _winner:Player = null;

	//data and accessors
	private data = null;
	public get layout():Layout { return Game.instance.definitions.getDefinition("layout", this.data.layout_id); }

	//animation
	private animationSequence:Animation = null;
	private _animating:boolean = false;

	/**
	 * It's a battle!
	 * @param visible Determines whether this Battle should be displayed. False for peer authentication if I ever get around to it. (lol)
	 */
	constructor(visible:boolean = true) {
		super();
		this._visible = visible;
	}

	public init(data) {
		if (this.initialized) return;
		this.initialized = true;

		console.log("Battle: init");
		console.log(data);
		this.data = data;

		this.initLevel();

		if (this._visible) {
			this.initDisplay();
			this.level.initDisplay();
			this.display.setLevelDisplay(this.level.display);
		}

		//temp! add a couple players (for now, only the user and monsters)
		for (var i = 0; i < 2; i++) {
			var player:Player = new Player();
			this.addPlayer(player);
		}

		//heroes
		for (var heroData of data.data.heroes) {
			var hero:Hero = Game.instance.user.heroManager.getHero(heroData.id);
			if (hero) {
				var unit:Unit = new Unit();
				unit.initAsHero(hero);
				unit.x = heroData.position[0];
				unit.y = heroData.position[1];
				this.players.list[0].addUnit(unit);
				this.addUnit(unit, false);
			}
		}

		//monsters
		for (var monsterData of data.data.monsters) {
			var monster:Monster = Game.instance.definitions.getDefinition("monster", monsterData.monster_id);
			if (monster) {
				var unit: Unit = new Unit();
				unit.initAsMonster(monster);
				unit.x = monsterData.position[0];
				unit.y = monsterData.position[1];
				this.players.list[1].addUnit(unit);
				this.addUnit(unit, false);
			}
		}

		this.beginTurn(this.players.list[0]);
		this.updateAllUnitPathing();
		this.display.updatePathingDisplay();
		this.display.updatePathingHover();

		Game.instance.addEventListener(GameEvent.types.ui.KEY, (e:GameEvent) => {
			if (e.data == '`') {
				var playerUnit = this.currentPlayer.units.list[0];
				var anim = Animation.noop();

				this.selectUnit(null);

				for (var player of this.players.list) {
					if (player == this.currentPlayer) continue;
					for (var unit of player.units.list.slice()) {
						if (!unit.alive) continue;
						unit.kill();
						anim.then(Animation.unitDie(unit));
					}
				}

				console.log("Oof!");
				this.initAnimation();
				this.queueAnimation(anim);
				this.onUnitAction(playerUnit);
				this.beginAnimation();
			}
		});
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

		target.takeDamage(attacker.attackDamage, attacker);
		var onHit = Animation.unitTakeDamage(target);
		if (!target.alive) {
			onHit.then(Animation.unitDie(target));
		}

		var animation = Animation.unitAttack(attacker, target, onHit);
		this.queueAnimation(animation);

		//there will be a LOT to change here

		this.onUnitAction(attacker);
	}

	private beginTurn(player:Player) {
		if (this._currentPlayer != null) {
			this.endTurn();
		}

		if (this.players.list.indexOf(player) === 0) {
			this._turnNumber += 1;
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

		var action = (callback:()=>void) => {
			if (this.display) {
				this.display.showTurnBegin(callback);
			} else {
				callback();
			}
		}
		var anim = new Animation(action);
		this.queueAnimation(anim);

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

		this.checkEndBattle();
		if (!this.ended) {
			if (this.shouldForceEndTurn()) {
				this.endTurn();
			}
		}
	}

	private initAnimation() {
		this.animationSequence = null;
		this._animating = false;
	}

	private beginAnimation() {
		if (this._animating || this.animationSequence == null) return;

		this._animating = true;
		this.sendNewEvent(GameEvent.types.battle.ANIMATIONSTART)
		console.log("Start animation");
		this.animationSequence.start(() => {
			console.log("Animation complete");
			this.onAnimationComplete();
		});
	}

	private onAnimationComplete() {
		this._animating = false;
		this.sendNewEvent(GameEvent.types.battle.ANIMATIONCOMPLETE);

		if (this.ended) {
			console.log("To the menu!");
			Game.instance.gotoMainMenu();
		}
	}

	private queueAnimation(animation:Animation) {
		if (this.animationSequence == null) {
			this.animationSequence = Animation.noop();
			this.animationSequence.mode = Animation.modes.sequential;
		}
		this.animationSequence.then(animation);
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

	/**
	 * Sees if the battle should end, and if it should, ends it
	 */
	public checkEndBattle() {
		if (this._ended) return;

		var undefeated = this.players.list.filter(function(player:Player) {
			return !player.checkDefeated();
		});

		if (undefeated.length == 1) {
			this._ended = true;
			this._winner = undefeated[0];
		}

		if (this._ended) {
			var action = (callback:()=>void) => {
				if (this.display) {
					this.display.showEndGame(callback);
				} else {
					callback();
				}
			}
			var anim = new Animation(action, null, -1);
			this.queueAnimation(anim);
		}
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

	public getHoveredUnit():Unit {
		var coords = this._display.hoverCoords;
		return this.getUnitAtPosition(coords.x, coords.y);
	}

	public getHoveredTile():Tile {
		var coords = this._display.hoverCoords;
		return this.level.getTile(coords.x, coords.y);
	}

	public getDebugPanelStrings():Array<string> {
		var ret:Array<string> = [
			"Current player: " + this._currentPlayer.id,
			"Selected: " + this._selectedUnit
		];

		var coords = this.display.hoverCoords;
		var hoverStrings: Array<string> = [coords.toString()];
		var tile = this.getHoveredTile();
		if (tile) {
			hoverStrings.push(tile.name);
		}

		var unit = this.getHoveredUnit();
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
		if (this.animating) return;

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
	// Init and Cleanup
	////////////////////////////////////////////////////////////

	private initLevel() {
		this.level = new Level();
		this.level.init(this.layout);
	}

	private initDisplay() {
		console.log("Battle: init display");
		this._display = new BattleDisplay();
		this._display.init(this);
		Game.instance.stage.addChildAt(this._display, 0);

		this._display.scale.set(3, 3);
	}
}