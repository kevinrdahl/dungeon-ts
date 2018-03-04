import InterfaceElement from "../../InterfaceElement";
import ScreenSelector from "./ScreenSelector";
import AttachInfo from "../../AttachInfo";
import UnitScreen from "./UnitScreen";
import DungeonScreen from "./DungeonScreen";

export default class MainMenu extends InterfaceElement {
    private screenSelector:ScreenSelector;
    private currentScreen:InterfaceElement = null;
    private currentScreenName:string = "";

    constructor() {
        super();
    }

    public init() {
        this.resizeToParent();

        this.screenSelector = new ScreenSelector(this);
        this.screenSelector.init();
        this.addChild(this.screenSelector);
        this.screenSelector.attachToParent(AttachInfo.BottomCenter);

        console.log("MainMenu: " + JSON.stringify(this.getBounds()));
        console.log("selector " + JSON.stringify(this.screenSelector.getBounds()));
    }

    public openScreen(name:string, forceReopen = false) {
        console.log("MainMenu: openScreen \"" + name + "\"");
        if (!forceReopen && name == this.currentScreenName) return;
        this.closeScreen();

        switch (name) {
            case "units":
                this.currentScreen = new UnitScreen();
                (this.currentScreen as UnitScreen).init();
                break;

            case "dungeons":
                this.currentScreen = new DungeonScreen();
                (this.currentScreen as DungeonScreen).init();
                break;
        }

        if (this.currentScreen) {
            this.addChild(this.currentScreen);
            this.currentScreen.attachToParent(AttachInfo.Center);
            this.currentScreenName = name;
        }
        else {
            this.currentScreenName = "";
        }
    }

    private closeScreen() {
        if (this.currentScreen) {
            this.currentScreen.destroy();
            this.currentScreen = null;
        }
    }
}