import User from "./User";
import Hero from "./Hero";

export default class HeroManager {
    public user:User;
    public heroes:Hero[] = [];
    public heroesById:object = {};

    constructor(user:User) {
        this.user = user;
    }

    public load(data) {
        console.log("heroManager: load");

        for (var heroData of data.heroes) {
            var hero:Hero = new Hero();
            hero.load(heroData);
            this.addhero(hero);
        }
    }

    public addhero(hero:Hero) {
        this.heroes.push(hero);
        this.heroesById[hero.id] = hero;
    }

    public removehero(hero:Hero) {
        var index = this.heroes.indexOf(hero);
        if (index == -1) return;

        this.heroes.splice(index, 1);
        delete this.heroesById[hero.id];
    }

    public getHero(id) {
        var hero:Hero = this.heroesById[id];
        if (hero) return hero;
        return null;
    }
}