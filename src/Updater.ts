export interface IUpdateable {
	update:(timeElapsed:number)=>void
}

export default class Updater {
	private objects:Array<IUpdateable> = [];
	private objectsToAdd:Array<IUpdateable> = [];
	private updating:boolean = false;

	constructor() {

	}

	/**
	 * Only to be called by its owner!
	 */
	public update(timeElapsed:number) {
		this.updating = true;

		for (var obj of this.objects) {
			obj.update(timeElapsed);
		}

		this.updating = false;
		for (var obj of this.objectsToAdd) {
			this.objects.push(obj);
		}
	}

	public add(obj:IUpdateable) {
		if (this.updating) {
			this.objectsToAdd.push(obj);
		} else {
			this.objects.push(obj);
		}
	}

	public remove(obj:IUpdateable) {
		var index = this.objects.indexOf(obj);
		if (index > -1) {
			this.objects.splice(index, 1);
		}

		index = this.objectsToAdd.indexOf(obj);
		if (index > -1) {
			this.objectsToAdd.splice(index, 1);
		}
	}
}