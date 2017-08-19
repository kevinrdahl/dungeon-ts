"use strict";
/// <reference path="./declarations/pixi.js.d.ts"/>
/// <reference path="./declarations/createjs/soundjs.d.ts"/>
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
//Sound
var SoundManager_1 = require("./sound/SoundManager");
var SoundAssets = require("./sound/SoundAssets");
//Textures
var TextureLoader_1 = require("./textures/TextureLoader");
var TextureWorker_1 = require("./textures/TextureWorker");
var TextureGenerator = require("./textures/TextureGenerator");
//Interface
var InputManager_1 = require("./interface/InputManager");
var InterfaceRoot_1 = require("./interface/prefabs/InterfaceRoot");
var InterfaceElement_1 = require("./interface/InterfaceElement");
var TextElement_1 = require("./interface/TextElement");
var AttachInfo_1 = require("./interface/AttachInfo");
var GameEventHandler_1 = require("./events/GameEventHandler");
//Battle
var Battle_1 = require("./battle/Battle");
//Misc
var Log = require("./util/Log");
var Updater_1 = require("./Updater");
var Game = (function (_super) {
    __extends(Game, _super);
    function Game(viewDiv) {
        var _this = _super.call(this) || this;
        /*=== PUBLIC ===*/
        _this.stage = null;
        _this.renderer = null;
        _this.viewDiv = null;
        _this.viewWidth = 500;
        _this.viewHeight = 500;
        _this.updater = new Updater_1.default();
        /*=== PRIVATE ===*/
        _this._volatileGraphics = new PIXI.Graphics(); //to be used when drawing to a RenderTexture
        _this._documentResized = true;
        _this._lastDrawTime = 0;
        _this._currentDrawTime = 0;
        _this._currentBattle = null;
        _this.onTextureWorkerGetTexture = function (requestKey, texture) {
            /*var sprite:PIXI.Sprite = new PIXI.Sprite(texture);
            sprite.scale.x = 5;
            sprite.scale.y = 5;
            sprite.position.x = 100;
            sprite.position.y = 100;
            this.stage.addChild(sprite);*/
        };
        _this.viewDiv = viewDiv;
        return _this;
    }
    Object.defineProperty(Game.prototype, "volatileGraphics", {
        get: function () { this._volatileGraphics.clear(); return this._volatileGraphics; },
        enumerable: true,
        configurable: true
    });
    Game.prototype.init = function () {
        var _this = this;
        Log.setLogType("debug", new Log.LogType("", "#999"));
        Log.setLogType("error", new Log.LogType("ERROR: ", "#f00"));
        Log.log("debug", "Initializing game...");
        if (Game.instance === null) {
            Game.instance = this;
        }
        else {
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
        this.textureWorker = new TextureWorker_1.default('js/worker.js');
        //Listen for resize
        window.addEventListener('resize', function () { return _this._documentResized = true; });
        //Add root UI element
        InterfaceElement_1.default.maskTexture = TextureGenerator.simpleRectangle(null, 8, 8, 0xffffff, 0);
        this.interfaceRoot = new InterfaceRoot_1.default(this.stage);
        //Set up InputManager
        InputManager_1.default.instance.init("#viewDiv");
        //Debug graphics
        this.debugGraphics = new PIXI.Graphics();
        this.stage.addChild(this.debugGraphics);
        this.loadTextures();
        this.render();
    };
    /**
     * Called by InputManager when there is a click that isn't on an InterfaceElement
     */
    Game.prototype.onLeftClick = function (coords) {
        if (this._currentBattle && this._currentBattle.display) {
            this._currentBattle.display.onLeftClick(coords);
        }
    };
    /**
     * Called by InputManager when there is a click that isn't on an InterfaceElement
     */
    Game.prototype.onRightClick = function (coords) {
        if (this._currentBattle && this._currentBattle.display) {
            this._currentBattle.display.onRightClick(coords);
        }
    };
    Game.prototype.render = function () {
        var _this = this;
        this._currentDrawTime = Date.now() / 1000;
        if (this._lastDrawTime <= 0)
            this._lastDrawTime = this._currentDrawTime;
        var timeDelta = this._currentDrawTime - this._lastDrawTime;
        if (this._documentResized) {
            this._documentResized = false;
            this.resize();
        }
        if (Game.useDebugGraphics)
            this.debugGraphics.clear();
        this.interfaceRoot.draw();
        this.updater.update(timeDelta);
        var renderer = this.renderer;
        renderer.render(this.stage);
        this._lastDrawTime = this._currentDrawTime;
        requestAnimationFrame(function () { return _this.render(); });
    };
    Game.prototype.resize = function () {
        this.viewWidth = this.viewDiv.clientWidth;
        this.viewHeight = this.viewDiv.clientHeight;
        this.renderer.resize(this.viewWidth, this.viewHeight);
        this.interfaceRoot.resize(this.viewWidth, this.viewHeight);
    };
    Game.prototype.loadTextures = function () {
        var _this = this;
        Log.log("debug", "=== LOAD TEXTURES ===");
        var loadingText = new TextElement_1.default("Loading Textures...", TextElement_1.default.veryBigText);
        loadingText.id = "loadingText";
        this.interfaceRoot.addChild(loadingText);
        loadingText.attachToParent(AttachInfo_1.default.Center);
        this.textureLoader = new TextureLoader_1.default("textureMap2.png", "textureMap2.json", function () { return _this.onTexturesLoaded(); });
    };
    Game.prototype.onTexturesLoaded = function () {
        this.sendGraphicsToWorker();
        this.loadSounds();
        //this.textureWorker.getTexture('parts/helmet', {from:[0x555555], to:[0xff0000]}, this.onTextureWorkerGetTexture);
    };
    Game.prototype.sendGraphicsToWorker = function () {
        var data = this.textureLoader.getData();
        this.textureWorker.putTextures(data);
    };
    Game.prototype.loadSounds = function () {
        var _this = this;
        var list = SoundAssets.interfaceSounds.concat(SoundAssets.mainMenuMusic);
        SoundManager_1.default.instance.load("initial", list, function (which) { return _this.onSoundsLoaded(which); }, function (which, progress) { return _this.onSoundsLoadedProgress(which, progress); });
        var loadingText = this.interfaceRoot.getElementById("loadingText");
        loadingText.text = "Loading sounds... (0%)";
    };
    Game.prototype.onSoundsLoaded = function (which) {
        if (which == "initial") {
            console.log("Sounds loaded!");
            //SoundManager.instance.playMusic("music/fortress");
            this.removeLoadingText();
            this.initTestBattle();
        }
    };
    Game.prototype.onSoundsLoadedProgress = function (which, progress) {
        if (which == "initial") {
            var loadingText = this.interfaceRoot.getElementById("loadingText");
            loadingText.text = "Loading sounds... (" + Math.round(progress * 100) + "%)";
        }
    };
    Game.prototype.removeLoadingText = function () {
        var loadingText = this.interfaceRoot.getElementById("loadingText");
        this.interfaceRoot.removeChild(loadingText);
    };
    Game.prototype.initTestBattle = function () {
        var battle = new Battle_1.default(true);
        this._currentBattle = battle;
        battle.init();
    };
    Game.instance = null;
    Game.useDebugGraphics = false;
    return Game;
}(GameEventHandler_1.default));
exports.default = Game;