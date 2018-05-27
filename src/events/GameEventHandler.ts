import GameEvent from './GameEvent';
import * as Util from '../util/Util';

export default class GameEventHandler {
	private _listenersByType:Object = {};
	private subscribers: GameEventHandler[] = [];

	public addEventListener(eventType:string, listener:(e:GameEvent)=>void) {
		var listeners:Array<(e:GameEvent)=>void> = this._listenersByType[eventType];

		if (!listeners) {
			listeners = [];
			this._listenersByType[eventType] = listeners;
		} else if (listeners.indexOf(listener) >= 0) {
			console.log("GameEventDispatcher: Not adding duplicate listener of type " + eventType);
			return;
		}

		listeners.push(listener);
	}

	public removeEventListener(eventType:string, listener:(e:GameEvent)=>void) {
		var listeners:Array<(e:GameEvent)=>void> = this._listenersByType[eventType];

		if (!listeners) {
			return;
		}

		var index:number = listeners.indexOf(listener);
		if (index === -1) {
			console.log("GameEventDispatcher: Can't remove listener that doesn't exist, type " + eventType);
		} else {
			listeners.splice(index, 1);
		}
	}

	public removeAllEventListeners() {
		for (var type in this._listenersByType) {
			this._listenersByType[type].splice(0); //clears list
			delete this._listenersByType[type];
		}
	}

	public sendNewEvent(type:string, data:any = null) {
		this.sendEvent(GameEvent.getInstance(type, data, this));
	}

	/**
	 * NOTE: the event will be released after this call.
	 * Also, does not set the "from" property of the event. Good for propagating.
	 */
	public sendEvent(event:GameEvent) {
		var listeners:Array<(e:GameEvent)=>void> = this._listenersByType[event.type];

		if (listeners) {
			for (var listener of listeners) {
				listener(event);
			}
		}

		for (var subscriber of this.subscribers) {
			subscriber.sendEvent(event);
		}

		GameEvent.releaseInstance(event);
	}

	/**
	 * Causes all events sent by the other GameEventHandler to be propagated by this one.
	 */
	public subscribeTo(other:GameEventHandler) {
		Util.ArrayAdd(other.subscribers, this);
	}

	public unsubscribeFrom(other:GameEventHandler) {
		Util.ArrayRemove(other.subscribers, this);
	}
}