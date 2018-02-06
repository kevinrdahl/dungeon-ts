/// <reference path="./declarations/pixi.js.d.ts"/>
/// <reference path="./declarations/createjs/soundjs.d.ts"/>

//User
import User from './user/User';

//Sound
import SoundManager from './sound/SoundManager';
import * as SoundAssets from './sound/SoundAssets';

//Textures
import TextureLoader from './textures/TextureLoader';
import TextureWorker from './textures/TextureWorker';
import * as TextureGenerator from './textures/TextureGenerator';

//Interface
import InputManager from './interface/InputManager';
import InterfaceRoot from './interface/prefabs/InterfaceRoot';
import InterfaceElement from './interface/InterfaceElement';
import Panel from './interface/Panel';
import TextElement from './interface/TextElement';
import ElementList from './interface/ElementList';
import AttachInfo from './interface/AttachInfo';

//Events
import GameEvent from './events/GameEvent';
import GameEventHandler from './events/GameEventHandler';

//Battle
import Battle from './battle/Battle';

//Misc
import * as Log from './util/Log';
import Updater from './Updater';
import Vector2D from './util/Vector2D';
import RequestManager from './RequestManager';

export default class Game extends GameEventHandler {
	public static instance: Game = null;
	public static useDebugGraphics: boolean = false;

	/*=== PUBLIC ===*/
	public stage: PIXI.Container = null;
	public renderer: PIXI.WebGLRenderer | PIXI.CanvasRenderer = null;
	public viewDiv: HTMLElement = null;
	public viewWidth: number = 500;
	public viewHeight: number = 500;
	public interfaceRoot: InterfaceRoot;
	public textureLoader: TextureLoader;
	public debugGraphics: PIXI.Graphics;
	//public textureWorker: TextureWorker;
	public updater: Updater = new Updater();
	public user:User = new User();
	public staticUrl = "http://localhost:8000/static/dungeon/play";

	get volatileGraphics(): PIXI.Graphics { this._volatileGraphics.clear(); return this._volatileGraphics }

	/*=== PRIVATE ===*/
	private _volatileGraphics = new PIXI.Graphics(); //to be used when drawing to a RenderTexture
	private _documentResized: boolean = true;

	private _lastDrawTime: number = 0;
	private _currentDrawTime: number = 0;
	private _currentBattle:Battle = null;

	constructor(viewDiv: HTMLElement) {
		super();
		this.viewDiv = viewDiv;
	}

	public init() {
		Log.setLogType("debug", new Log.LogType("", "#999"));
		Log.setLogType("error", new Log.LogType("ERROR: ", "#f00"));
		Log.log("debug", "Initializing game...");

		if (Game.instance === null) {
			Game.instance = this;
		} else {
			Log.log("error", "There's already a game! Aborting Init");
			return;
		}

		//Add the renderer to the DOM
		this.stage = new PIXI.Container();
		this.renderer = PIXI.autoDetectRenderer(500, 500, { backgroundColor: 0x0066ff });
		this.renderer.autoResize = true; //TS PIXI doesn't like this as an option
		this.viewDiv.appendChild(this.renderer.view);
		PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;

		//Worker
		//this.textureWorker = new TextureWorker('js/worker.js');

		//Listen for resize
		window.addEventListener('resize', () => this._documentResized = true);

		//Add root UI element
		InterfaceElement.maskTexture = TextureGenerator.simpleRectangle(null, 8, 8, 0xffffff, 0, );
		this.interfaceRoot = new InterfaceRoot(this.stage);

		//Set up InputManager
		InputManager.instance.init("#viewDiv");

		//Debug graphics
		this.debugGraphics = new PIXI.Graphics();
		this.stage.addChild(this.debugGraphics);

		this.loadTextures();
		this.render();
	}

	/**
	 * Called by InputManager when there is a click that isn't on an InterfaceElement
	 */
	public onLeftClick(coords:Vector2D) {
		if (this._currentBattle && this._currentBattle.display) {
			this._currentBattle.display.onLeftClick(coords);
		}
	}

	/**
	 * Called by InputManager when there is a click that isn't on an InterfaceElement
	 */
	public onRightClick(coords: Vector2D) {
		if (this._currentBattle && this._currentBattle.display) {
			this._currentBattle.display.onRightClick(coords);
		}
	}

	private render() {
		this._currentDrawTime = Date.now() / 1000;
		if (this._lastDrawTime <= 0) this._lastDrawTime = this._currentDrawTime;
		var timeDelta: number = this._currentDrawTime - this._lastDrawTime;


		if (this._documentResized) {
			this._documentResized = false;
			this.resize();
		}

		if (Game.useDebugGraphics) this.debugGraphics.clear();

		this.interfaceRoot.draw();
		this.updater.update(timeDelta);

		var renderer = this.renderer as PIXI.SystemRenderer;
		renderer.render(this.stage);

		this._lastDrawTime = this._currentDrawTime;
		requestAnimationFrame(() => this.render());
	}

	private resize() {
		this.viewWidth = this.viewDiv.clientWidth;
		this.viewHeight = this.viewDiv.clientHeight;
		this.renderer.resize(this.viewWidth, this.viewHeight);
		this.interfaceRoot.resize(this.viewWidth, this.viewHeight);
	}

	private onTextureWorkerGetTexture = (requestKey: string, texture: PIXI.Texture) => {
		/*var sprite:PIXI.Sprite = new PIXI.Sprite(texture);
		sprite.scale.x = 5;
		sprite.scale.y = 5;
		sprite.position.x = 100;
		sprite.position.y = 100;
		this.stage.addChild(sprite);*/
	};

	private loadTextures() {
		Log.log("debug", "=== LOAD TEXTURES ===");

		var loadingText = new TextElement("Loading Textures...", TextElement.veryBigText);
		loadingText.id = "loadingText";
		this.interfaceRoot.addChild(loadingText);
		loadingText.attachToParent(AttachInfo.Center);

		var texUrl = this.staticUrl + "/textureMap2.png";
		var mapUrl = this.staticUrl + "/textureMap2.json";
		this.textureLoader = new TextureLoader(texUrl, mapUrl, () => this.onTexturesLoaded());
	}

	private onTexturesLoaded() {
		this.sendGraphicsToWorker();
		this.loadSounds();

		//this.textureWorker.getTexture('parts/helmet', {from:[0x555555], to:[0xff0000]}, this.onTextureWorkerGetTexture);
	}

	private sendGraphicsToWorker() {
		var data = this.textureLoader.getData();
		//this.textureWorker.putTextures(data);
	}

	private loadSounds() {
		var list = SoundAssets.interfaceSounds.concat(SoundAssets.mainMenuMusic);
		for (var item of list) {
			item[1] = this.staticUrl + "/" + item[1];
		}
		SoundManager.instance.load("initial", list, (which: string) => this.onSoundsLoaded(which), (which: string, progress: number) => this.onSoundsLoadedProgress(which, progress));

		var loadingText: TextElement = this.interfaceRoot.getElementById("loadingText") as TextElement;
		loadingText.text = "Loading sounds... (0%)";
	}

	private onSoundsLoaded(which: string) {
		if (which == "initial") {
			console.log("Sounds loaded!");
			//SoundManager.instance.playMusic("music/fortress");
			this.removeLoadingText();
			this.loadUser("abc", "abcdefgh");
		}
	}

	private onSoundsLoadedProgress(which: string, progress: number) {
		if (which == "initial") {
			var loadingText: TextElement = this.interfaceRoot.getElementById("loadingText") as TextElement;
			loadingText.text = "Loading sounds... (" + Math.round(progress * 100) + "%)";
		}
	}

	private removeLoadingText() {
		var loadingText: TextElement = this.interfaceRoot.getElementById("loadingText") as TextElement;
		this.interfaceRoot.removeChild(loadingText);
	}

	private initTestBattle() {
		var battle = new Battle(true);
		this._currentBattle = battle;

		battle.init();
	}

	private loadUser(name:string, password:string) {
		RequestManager.instance.makeRequest("login", {name:name, password:password},(data) => {
			if (data) {
				this.user.load(data);
				this.user.startGame();
				this.initTestBattle();
			} else {
				console.error("Unable to load user");
			}
		});
	}
}
