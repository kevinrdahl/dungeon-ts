import InterfaceElement from "../../InterfaceElement";
import TextElement from "../../TextElement";

export default class UnitScreen extends InterfaceElement {
    constructor() {
        super();
    }

    public init() {
        this.addChild(new TextElement("Units"));
        this.resizeToFitChildren();
    }
}