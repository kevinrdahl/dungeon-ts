export default class Monster {
	public id:number = -1;
	public name:string = "Monster";

	public readData(data) {
		this.id = data.id;
		this.name = data.name;
	}
}