import Game from '../Game';

export default class Timer {
	private static nextId = 1;
	private _id = -1;

	private _currentTime:number;
	private _duration:number;
	private _active:boolean = true;
	private _addedToUpdater:boolean = false;
	private _onFinish:()=>void;

	get duration():number { return this._duration; }
	get timeRemaining():number { return this._duration - this._currentTime; }
	get active():boolean { return this._active; }
	get id():number { return this._id; }

	constructor() {
		this._id = Timer.nextId++;
	}

	public init(time:number, onFinish:()=>void):Timer {
		this._duration = time;
		this._onFinish = onFinish;
		this._currentTime = 0;

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

	public start():Timer {
		this._active = true;
		this.setUpdating(true);

		return this;
	}

	public stop() {
		this._active = false;
		this.setUpdating(false);
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
		return "Timer " + this.id + " (" + this._currentTime + " / " + this._duration + ")";
	}
}