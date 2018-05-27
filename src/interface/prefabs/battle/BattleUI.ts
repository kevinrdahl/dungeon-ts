import InterfaceElement from "../../InterfaceElement";
import SelectionDisplay from "./SelectionDisplay";
import AttachInfo from "../../AttachInfo";
import Battle from "../../../battle/Battle";

export default class BattleUI extends InterfaceElement {
	public selectionDisplay:SelectionDisplay;
	public battle:Battle = null;

	constructor() {
		super();

		this.clickable = false;
		this.name = "Battle UI";
		this.id = "Battle UI";

		this.selectionDisplay = new SelectionDisplay();
		this.addChild(this.selectionDisplay);
		this.selectionDisplay.attachToParent(AttachInfo.BLtoBL);
		this.selectionDisplay.init(this);
	}

	public initBattle(battle:Battle) {
		if (this.battle) this.unsubscribeFrom(this.battle);
		this.battle = battle;
		this.subscribeTo(battle); //lets UI elements listen to this instead of all of them needing to update their current battle
	}
}