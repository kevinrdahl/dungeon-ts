export default class User {
    public loaded = false;
    private loadedData = null;

    constructor() {

    }

    public load(data:object) {
        //probably take this out eventually
        this.loadedData = data;
        
        console.log("User: load");

        //...
        this.loaded = true;
    }

    public startGame() {
        console.log("User: start game");
    }
}