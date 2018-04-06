import User from "./User";
import Battle from "../battle/Battle";
import Game from "../Game";
import Hero from "./Hero";
import RequestManager from "../RequestManager";

export default class BattleManager {
    public user:User;
    public battleData = [];

    get currentBattle():Battle { return Game.instance.currentBattle; }

    //I'm not actually sure yet what all of these are supposed to mean
    private static readonly STATE_AVAILABLE = 0
    private static readonly STATE_ACTIVE = 1
    private static readonly STATE_WON = 2
    private static readonly STATE_LOST = 3
    private static readonly STATE_ABANDONED = 4

    constructor(user:User) {
        this.user = user;
    }

    public load(data) {
        console.log("BattleManager: load");

        for (var data of data.battles) {
            this.battleData.push(data);
        }
    }

    public checkAnyBattleActive():boolean {
        for (var data of this.battleData) {
            if (data.state == BattleManager.STATE_ACTIVE) return true;
        }
        return false;
    }

    /**
     * When loading the game, if there is already an active battle, use this to jump into it
     */
    public startActiveBattle() {
        for (var data of this.battleData) {
            if (data.state == BattleManager.STATE_ACTIVE) {
                var battle = new Battle(true);
                Game.instance.setCurrentBattle(battle);
                battle.init();
                return;
            }
        }
        console.warn("BattleManager: There was no active battle to start!");
    }

    /**
     *
     * @param dungeonId
     * @param floor
     * @param heroes The heroes to be sent
     */
    public startBattle(dungeonId:number, floor:number, heroes:Hero[]) {
        var heroIds:number[] = heroes.map((u:Hero) => u.id);
        RequestManager.instance.makeUserRequest("start_battle", {
            "dungeon_id": dungeonId,
            "floor": floor,
            "hero_ids": heroIds
        }, (data) => { this.onStartBattle(data) });
    }

    private onStartBattle(data) {
        var battle = new Battle(true);
        Game.instance.setCurrentBattle(battle);
        battle.init();
    }
}