export default class Dungeon {
	public id:number = -1;
	public name:string = "Some Dungeon";

	public readData(data) {
		this.id = data.id;
		this.name = data.name;
	}
}