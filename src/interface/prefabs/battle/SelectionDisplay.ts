import InterfaceElement from "../../InterfaceElement";
import Panel from "../../Panel";
import TextElement from "../../TextElement";
import Game from "../../../Game";
import Vector2D from "../../../util/Vector2D";
import AttachInfo from "../../AttachInfo";
import Unit from "../../../battle/Unit";
import BattleUI from "./BattleUI";
import GameEvent from "../../../events/GameEvent";

/**
 * Shows basic information about the currently selected unit.
 * All pretty temporary.
 */
export default class SelectionDisplay extends InterfaceElement {
	private panel:Panel;
	private unitSprite:PIXI.Sprite;
	private unitSpriteWrapper:InterfaceElement;
	private nameText:TextElement;
	private healthText:TextElement;

	private currentUnit:Unit = null;

	constructor() {
		super();

		this.panel = new Panel(260, 24*3+8, Panel.BASIC);
		this.nameText = new TextElement("", TextElement.mediumText);
		this.healthText = new TextElement("", TextElement.mediumText);
		this.unitSprite = new PIXI.Sprite(Game.instance.textureLoader.get("tile/floor"));
		this.unitSprite.scale = new PIXI.Point(3,3);
		this.unitSpriteWrapper = new InterfaceElement(this.unitSprite);

		this.addChild(this.panel);
		this.addChild(this.nameText);
		this.addChild(this.healthText);
		this.addChild(this.unitSpriteWrapper);

		this.unitSpriteWrapper.x = 4;
		this.unitSpriteWrapper.y = 4;
		this.nameText.positionRelativeTo(this.unitSpriteWrapper, AttachInfo.TLtoTR.withOffset(10, 4));
		this.healthText.positionRelativeTo(this.nameText, AttachInfo.TLtoBL.withOffset(0, 6));

		this.resizeToFitChildren();
		this.clear();
	}

	public init(battleUI:BattleUI) {
		//selection
		battleUI.addEventListener(GameEvent.types.battle.UNITSELECTIONCHANGED, (e) => {
			this.initUnit(Game.instance.currentBattle.selectedUnit);
		});

		//hover
		battleUI.addEventListener(GameEvent.types.battle.HOVERCHANGED, (e) => {
			var hoveredUnit = Game.instance.currentBattle.getHoveredUnit();
			if (hoveredUnit) {
				this.initUnit(hoveredUnit);
			} else {
				var selectedUnit = Game.instance.currentBattle.selectedUnit;
				if (selectedUnit) this.initUnit(selectedUnit);
				else this.clear();
			}
		});
	}

	public initUnit(unit:Unit, force:boolean = false) {
		if (!unit) {
			this.clear();
			this.currentUnit = null;
			return;
		}
		if (unit === this.currentUnit && !force) return;

		this.nameText.text = unit.name;
		this.healthText.text = unit.health + "/" + unit.maxHealth;
		this.unitSprite.texture = unit.display.sprite.texture;
		this.visible = true;
		this.currentUnit = unit;
	}

	public clear() {
		this.visible = false;
		this.currentUnit = null;
	}
}