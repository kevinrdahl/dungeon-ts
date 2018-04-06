import InterfaceElement from "../../InterfaceElement";
import TextElement from "../../TextElement";

export default class DungeonScreen extends InterfaceElement {
    constructor() {
        super();
    }

    public init() {
        this.addChild(new TextElement("Dungeons"));
        this.resizeToFitChildren();
    }
}