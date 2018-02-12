import User from "./User";
import UserUnit from "./UserUnit";

export default class UserUnitManager {
    public user:User;
    public units:UserUnit[] = [];
    public unitsById:object = {};

    constructor(user:User) {
        this.user = user;
    }

    public load(data) {
        console.log("UnitManager: load");

        for (var unitData of data.units) {
            var unit:UserUnit = new UserUnit();
            unit.load(unitData);
            this.addUnit(unit);
        }
    }

    public addUnit(unit:UserUnit) {
        this.units.push(unit);
        this.unitsById[unit.id] = unit;
    }

    public removeUnit(unit:UserUnit) {
        var index = this.units.indexOf(unit);
        if (index == -1) return;

        this.units.splice(index, 1);
        delete this.unitsById[unit.id];
    }
}