import InterfaceElement from "../../InterfaceElement";
import ElementList from "../../ElementList";
import MainMenu from "./MainMenu";
import TextButton from "../../TextButton"
import AttachInfo from '../../AttachInfo';

export default class ScreenSelector extends InterfaceElement {
    private buttonList:ElementList;
    private mainMenu:MainMenu;

    constructor(mainMenu:MainMenu) {
        super();
        this.mainMenu = mainMenu;
    }

    public init() {
        this.buttonList = new ElementList(30, ElementList.HORIZONTAL, 10);

        var buttonInfo = [
            {name:"Units", screen:"units", color:TextButton.colorSchemes.blue},
            {name:"Dungeons", screen:"dungeons", color:TextButton.colorSchemes.red}
        ];

        this.buttonList.beginBatchChange();
        for (var info of buttonInfo) {
            var button:TextButton = new TextButton(info.name, info.color);
            button.onClick = this.getButtonCallback(info.screen);
            this.buttonList.addChild(button);
        }
        this.buttonList.endBatchChange();
        this.addChild(this.buttonList);
        this.resizeToFitChildren();
    }

    private getButtonCallback(screenName:string) {
        return () => {
            this.mainMenu.openScreen(screenName);
        }
    }
}