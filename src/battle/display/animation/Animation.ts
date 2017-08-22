import Timer from '../../../util/Timer';
import Tween from '../../../util/Tween';
import Unit from '../../Unit';
import UnitDisplay from '../UnitDisplay';
import Globals from '../../../Globals';

/**
 * Wraps a function with a callback, to perform long actions in a logical sequence (or multiple sequences).
 * Meant to be chained together.
 */
export default class Animation {
	private static nextId:number = 1;
	private _id:number = -1;

	private action: (callback: () => void) => void;
	private callback:()=>void = null;

	private parent:Animation = null;
	private children:Array<Animation> = null;
	private started:boolean = false;
	private actionComplete:boolean = false;
	private childrenFinished:boolean = false;
	private maxTime:number;
	private timer:Timer = null;

	private get finished():boolean { return this.actionComplete && (this.children === null || this.childrenFinished); }

	get id():number { return this._id; }

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
		if (setCallback) this.callback = setCallback;
		if (this.parent && !this.parent.started) {
			this.parent.start();
			return;
		}
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
			for (var child of this.children) {
				child.start();
			}
		} else {
			this.onFinished();
		}
	}

	private onChildFinished() {
		if (this.childrenFinished) return;

		//sure this is O(n^2) but how often are you going to have more than one child? let alone more than a handful
		for (var child of this.children) {
			if (!child.finished) return;
		}

		this.childrenFinished = true;
		this.onFinished();
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

	public static wait(duration:number, callback:()=>void = null):Animation {
		var action = (cb:()=>void) => {
			if (duration > 0) var timer = new Timer().init(duration, cb).start();
			else cb();
		}

		return new Animation(action, callback, duration + 0.5);
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

		return new Animation(action, callback, duration + 0.5);
	}

	public static attackUnit(attacker:Unit, target:Unit, callback:()=>void = null):Animation {
		var d1 = attacker.display;
		var d2 = target.display;
		d1.updatePosition(); //make sure it's at the unit's position

		var action = (cb:()=>void) => {
			var x0 = d1.x;
			var y0 = d1.y;
			d1.tweenTo(d2.x, d2.y, 0.2, Tween.easingFunctions.quadEaseIn, () => {
				d1.tweenTo(x0, y0, 0.4, Tween.easingFunctions.cubeEaseOut, () => {
					cb();
				});
			});
		}

		return new Animation(action, callback, 2);
	}
}