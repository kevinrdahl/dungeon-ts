import Game from '../Game';

export default class Tween {
	private static nextId = 1;
	private _id = -1;

	private _startValue:number;
	private _endValue:number;
	private _easingFunction:(t:number, b:number, c:number, d:number)=>number;
	private _duration:number;
	private _currentTime:number;
	private _property:string;
	private _target:any;
	private _active:boolean = false;
	private _initialized: boolean = false;
	private _addedToUpdater:boolean = false;

	public onUpdate:()=>void = null;
	public onFinish:()=>void = null;
	public roundValue:boolean = false;

	get timeRemaining():number { return this._duration - this._currentTime; }
	get active():boolean { return this._active; }
	get id():number { return this._id; }

	constructor() {
		this._id = Tween.nextId++;
	}

	public update(timeElapsed:number) {
		if (this._active) {
			this._currentTime = Math.min(this._currentTime + timeElapsed, this._duration);

			var value = this._easingFunction(this._currentTime, this._startValue, this._endValue - this._startValue, this._duration);
			if (this.roundValue) value = Math.round(value);
			this._target[this._property] = value;

			if (this.onUpdate) this.onUpdate();

			if (this.timeRemaining <= 0) {
				this._active = false;
				this.setUpdating(false);
				if (this.onFinish) this.onFinish();
			}
		}
	}

	public init(target, property:string, startValue:number, endValue:number, duration:number, easingFunction:(t:number, b:number, c:number, d:number)=>number):Tween {
		this._target = target;
		this._property = property;
		this._startValue = startValue;
		this._endValue = endValue;
		this._duration = Math.max(0.0001, duration); //no divide by 0 pls
		this._easingFunction = easingFunction;
		this._active = false;
		this._currentTime = 0;

		this._initialized = true;

		var value = this._easingFunction(this._currentTime, this._startValue, this._endValue - this._startValue, this._duration);
		console.log("AAAA " + value);

		return this;
	}

	public start() {
		if (!this._initialized) {
			console.error("Tween: can't start (not initialized)");
			return;
		}

		this._active = true;
		this._target[this._property] = this._startValue;
		this.setUpdating(true);
	}

	public stop() {
		this._active = true;
		this.setUpdating(true);
	}

	/*public pause() {
		this._active = false;
		this.setUpdating(false);
	}

	public resume() {
		this._active = true;
		this.setUpdating(true);
	}*/

	private setUpdating(updating) {
		if (updating && !this._addedToUpdater) {
			Game.instance.updater.add(this);
			this._addedToUpdater = true;
		} else if (!updating && this._addedToUpdater) {
			Game.instance.updater.remove(this);
			this._addedToUpdater = false;
		}
	}

	public toString():string {
		return "Tween " + this.id;
	}

	public static readonly easingFunctions = {
		//(current)time, base, change, duration
		//http://gizma.com/easing/
		linear: function(t:number, b:number, c:number, d:number) {
			return c * t / d + b;
		},

		quadEaseIn: function(t:number, b:number, c:number, d:number) {
			t /= d;
			return c * t * t + b;
		},

		quadEaseOut: function(t:number, b:number, c:number, d:number) {
			t /= d;
			return -c * t * (t - 2) + b;
		},

		quadEaseInOut: function(t:number, b:number, c:number, d:number) {
			t /= d / 2;
			if (t < 1) return c / 2 * t * t + b;
			t--;
			return -c / 2 * (t * (t - 2) - 1) + b;
		},

		cubeEaseIn: function(t:number, b:number, c:number, d:number) {
			t /= d;
			return c * t * t * t + b;
		},

		cubeEaseOut: function(t:number, b:number, c:number, d:number) {
			t /= d;
			t--;
			return c * (t * t * t + 1) + b;
		},

		cubeEaseInOut: function(t:number, b:number, c:number, d:number) {
			t /= d / 2;
			if (t < 1) return c / 2 * t * t * t + b;
			t -= 2;
			return c / 2 * (t * t * t + 2) + b;
		},

		quartEaseIn: function(t:number, b:number, c:number, d:number) {
			t /= d;
			return c * t * t * t * t + b;
		},

		quartEaseOut: function(t:number, b:number, c:number, d:number) {
			t /= d;
			t--;
			return -c * (t * t * t * t - 1) + b;
		},

		quartEaseInOut: function(t:number, b:number, c:number, d:number) {
			t /= d / 2;
			if (t < 1) return c / 2 * t * t * t * t + b;
			t -= 2;
			return -c / 2 * (t * t * t * t - 2) + b;
		},

		sineEaseIn: function (t: number, b: number, c: number, d: number) {
			return -c * Math.cos(t / d * (Math.PI / 2)) + c + b;
		},

		sineEaseOut: function (t: number, b: number, c: number, d: number) {
			return c * Math.sin(t / d * (Math.PI / 2)) + b;
		},

		sineEaseInOut: function (t: number, b: number, c: number, d: number) {
			return -c / 2 * (Math.cos(Math.PI * t / d) - 1) + b;
		}
	}
}