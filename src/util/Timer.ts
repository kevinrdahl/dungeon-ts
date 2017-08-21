import Game from '../Game';

export default class Timer {
	private _currentTime:number;
	private _duration:number;
	private _active:boolean = true;
	private _addedToUpdater:boolean = false;
	private _onFinish:()=>void;

	get duration():number { return this._duration; }
	get timeRemaining():number { return this._duration - this._currentTime; }
	get active():boolean { return this._active; }

	constructor() {

	}

	public init(time:number, onFinish:()=>void):Timer {
		this._duration = time;
		this._onFinish = onFinish;

		return this;
	}

	public update(timeElapsed:number) {
		if (this._active) {
			this._currentTime += timeElapsed;

			if (this._currentTime >= this._duration) {
				this._active = false;
				this.setUpdating(false);
				this._onFinish();
			}
		}
	}

	public start() {
		this._currentTime = 0;
		this._active = true;
		this.setUpdating(true);
	}

	public pause() {
		this._active = false;
		this.setUpdating(false);
	}

	public resume() {
		this._active = true;
		this.setUpdating(true);
	}

	private setUpdating(updating) {
		if (updating && !this._addedToUpdater) {
			Game.instance.updater.add(this);
		} else if (!updating && this._addedToUpdater) {
			Game.instance.updater.remove(this);
		}
	}
}