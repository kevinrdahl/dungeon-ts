import BattleManager from './BattleManager';
import UserUnitManager from './UserUnitManager';
import * as Utils from '../util/Util';

export default class User {
    public loaded = false;
    private loadedData = null;

    public userId:number;
    public token:string;
    public name:string;
    public stats;

    //managers
    public unitManager:UserUnitManager = new UserUnitManager(this);
    public battleManager:BattleManager = new BattleManager(this);

    constructor() {

    }

    public load(data) {
        //probably take this out eventually
        this.loadedData = data;
        
        console.log("User: load");
        this.userId = data.user.id;
        this.name = data.user.name;
        this.stats = data.user.stats;
        this.token = data.token;

        this.unitManager.load(data);
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
            //choose up to 4 random units
            var units = Utils.pickRandomSet(this.unitManager.units, 4);
            this.battleManager.startBattle(1, 1, units);
        }
    }
}