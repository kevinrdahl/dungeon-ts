import BattleManager from './BattleManager';
import HeroManager from './HeroManager';
import * as Utils from '../util/Util';

export default class User {
    public loaded = false;
    private loadedData = null;

    public userId:number;
    public token:string;
    public name:string;
    public stats;

    //managers
    public heroManager:HeroManager = new HeroManager(this);
    public battleManager:BattleManager = new BattleManager(this);

    constructor() {

    }

    public load(data) {
        //probably take this out eventually
        this.loadedData = data;

        console.log("User: load");
        this.userId = data.id;
        this.name = data.name;
        this.stats = data.stats;
        this.token = data.token;

        this.heroManager.load(data);
        this.battleManager.load(data);

        //...
        this.loaded = true;
        console.log("User: load done");
    }

    public startGame() {
        console.log("User: start game");
        if (this.battleManager.checkAnyBattleActive()) {
            console.log("Start from active battle");
            this.battleManager.startActiveBattle();
        } else {
            console.log("Start a new battle")
            //choose up to 4 random heroes
            var heroes = Utils.pickRandomSet(this.heroManager.heroes, 4);
            this.battleManager.startBattle(1, 1, heroes);
        }
    }
}