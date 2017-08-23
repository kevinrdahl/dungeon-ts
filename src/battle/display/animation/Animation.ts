import Timer from '../../../util/Timer';
import Tween from '../../../util/Tween';
import Unit from '../../Unit';
import UnitDisplay from '../UnitDisplay';
import Globals from '../../../Globals';
import Vector2D from '../../../util/Vector2D';

/**
 * Wraps a function with a callback, to perform long actions in a logical sequence (or multiple sequences).
 * Meant to be chained together.
 */
export default class Animation {
	private static nextId:number = 1;
	private _id:number = -1;

	public static readonly modes = {
		simultaneous: 0,
		sequential: 1
	}

	private action: (callback: () => void) => void;
	private callback:()=>void = null;

	private parent:Animation = null;
	private children:Array<Animation> = null;
	private started:boolean = false;
	private actionComplete:boolean = false;
	private numChildrenFinished = 0;
	private maxTime:number;
	private timer:Timer = null;
	private _mode = 0; //simultaneous

	public name = "some animation";

	private get childrenFinished():boolean { return this.children === null || this.numChildrenFinished >= this.children.length; }
	private get finished():boolean { return this.actionComplete && this.childrenFinished; }

	get id():number { return this._id; }
	get mode():number { return this._mode; }
	set mode(mode) { if (!this.started) this._mode = mode; }

	/**
	 *
	 * @param action A function which accepts a callback to be performed when it has finished. A unit of animation.
	 * @param callback Will be called once this and all its descendents have finished.
	 * @param maxTime If the action does not fire its callback within this many seconds, go on without it.
	 */
	constructor(action:(finished:()=>void)=>void, callback:()=>void = null, maxTime:number = 5) {
		this._id = Animation.nextId++;
		this.action = action;
		this.callback = callback;
		this.maxTime = maxTime;
	}

	/**
	 * Go! As a convenience, if the parent has not started, starts that instead.
	 */
	public start(setCallback:()=>void = null) {
		if (this.started) return;
		if (this.parent && !this.parent.started) {
			this.parent.start(setCallback);
			return;
		}
		if (setCallback) this.callback = setCallback;
		this.started = true;

		var actionCallback = () => {
			this.onActionComplete();
		};

		this.action(actionCallback);
		if (this.maxTime > 0) {
			this.timer = new Timer().init(this.maxTime, actionCallback).start();
		}
	}

	/**
	 * Sets the animation to be performed after this one, and returns it (not this).
	 *
	 * NOTE: Doesn't work after calling start
	 */
	public then(animation: Animation): Animation {
		if (this.started) return this;

		if (!this.children) this.children = [];
		this.children.push(animation);
		animation.parent = this;
		return animation;
	}

	private onActionComplete() {
		if (this.actionComplete) return;
		this.actionComplete = true;

		if (this.timer && this.timer.active) {
			this.timer.stop();
		}

		if (this.children) {
			if (this.mode === Animation.modes.simultaneous) {
				for (var child of this.children) {
					child.start();
				}
			} else if (this.mode === Animation.modes.sequential) {
				this.children[0].start();
			} else {
				console.error("Animation has an invalid mode!");
				console.log(this);
			}
		} else {
			this.onFinished();
		}
	}

	private onChildFinished() {
		if (this.childrenFinished) return;
		this.numChildrenFinished += 1;

		if (this.childrenFinished) {
			this.onFinished();
		} else if (this.mode === Animation.modes.sequential) {
			this.children[this.numChildrenFinished].start();
		}

	}

	private onFinished() {
		if (this.callback) this.callback();
		if (this.parent) this.parent.onChildFinished();
	}

	public toString(): string {
		return "Anim " + this.id + " (" + (Math.round(performance.now()) / 1000) + ")";
	}

	//////////////////////////////////////////////////
	// Static convenience constructors
	//////////////////////////////////////////////////

	/** Use this to wrap other animations */
	public static noop(callback:()=>void = null):Animation {
		var action = (cb:()=>void) => {
			cb();
		}
		var anim = new Animation(action, callback, -1);
		anim.name = "noop";
		return anim;
	}

	public static wait(duration:number, callback:()=>void = null):Animation {
		var action = (cb:()=>void) => {
			if (duration > 0) var timer = new Timer().init(duration, cb).start();
			else cb();
		}

		var anim = new Animation(action, callback, duration + 0.5);
		anim.name = "wait " + duration;
		return anim;
	}

	public static moveUnit(unit:Unit, path:number[][], callback:()=>void = null, duration:number = -1):Animation {
		if (duration < 0) {
			duration = (path.length - 1) * Globals.timeToTraverseTile;
		}

		var action = (cb:()=>void) => {
			if (unit.display) {
				unit.display.tracePath(path, duration, cb);
			} else {
				cb();
			}
		}

		var anim = new Animation(action, callback, duration + 0.5);
		anim.name = "move " + unit;
		return anim;
	}

	/** Lunge, do onHit and come back, callback */
	public static unitAttack(attacker:Unit, target:Unit, onHit:Animation = null, callback:()=>void = null):Animation {
		var lunge = Animation.unitLunge(attacker, target, callback);
		var comeBack = Animation.unitReturnToPosition(attacker);
		lunge.then(comeBack);
		if (onHit) lunge.then(onHit);
		return lunge;
	}

	public static unitLunge(unit:Unit, target:Unit, callback:()=>void = null):Animation {
		var d1 = unit.display;
		var d2 = target.display;
		d1.updatePosition();
		d2.updatePosition();

		var action = (cb:()=>void) => {
			d1.tweenTo(d2.x, d2.y, 0.2, Tween.easingFunctions.quadEaseIn, () => {
				cb();
			});
		}

		var anim = new Animation(action, callback, 1);
		anim.name = "lunge " + unit + " at " + target;
		return anim;
	}

	public static unitReturnToPosition(unit:Unit, callback:()=>void = null):Animation {
		var d = unit.display;
		var pos = d.getGridPosition(unit.x, unit.y);

		var action = (cb:()=>void) => {
			d.tweenTo(pos[0], pos[1], 0.4, Tween.easingFunctions.cubeEaseOut, () => {
				cb();
			});
		}

		var anim = new Animation(action, callback, 1);
		anim.name = "return " + unit;
		return anim;
	}

	public static unitTakeDamage(unit:Unit, callback:()=>void = null):Animation {
		var d = unit.display;

		var action = (cb:()=>void) => {
			var tween = new Tween().init(d, "rotation", 0, Math.PI / 180 * 360, 0.5, Tween.easingFunctions.quadEaseInOut);
			tween.onFinish = () => {
				d.rotation = 0;
				cb();
			}
			tween.start();
		}

		var anim = new Animation(action, callback, 1);
		anim.name = "damage " + unit;
		return anim;
	}

	public static unitDie(unit:Unit, callback:()=>void = null):Animation {
		var d = unit.display;
		var battleDisplay = unit.battle.display;

		var action = (cb:()=>void) => {
			var tween = new Tween().init(d, "alpha", 1, 0, 0.5, Tween.easingFunctions.quadEaseOut);
			tween.onFinish = () => {
				battleDisplay.removeUnitDisplay(d);
				cb();
			}
			tween.start();
		}

		var anim = new Animation(action, callback, 1);
		anim.name = "kill " + unit;
		return anim;
	}
}