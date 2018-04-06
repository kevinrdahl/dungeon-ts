export default class Hero {
    public id:number = -1;
    public name:string = "?";
    public level:number = 1;
    public stats = {};

    constructor() {

    }

    public load(data) {
        this.id = data.id;
        this.name = data.name;
        this.level = data.level;
        this.stats = data.stats;
    }
}