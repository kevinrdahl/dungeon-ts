(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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
//User
var User_1 = require("./user/User");
//Sound
var SoundManager_1 = require("./sound/SoundManager");
var SoundAssets = require("./sound/SoundAssets");
//Textures
var TextureLoader_1 = require("./textures/TextureLoader");
var TextureGenerator = require("./textures/TextureGenerator");
//Interface
var InputManager_1 = require("./interface/InputManager");
var InterfaceRoot_1 = require("./interface/prefabs/InterfaceRoot");
var InterfaceElement_1 = require("./interface/InterfaceElement");
var TextElement_1 = require("./interface/TextElement");
var AttachInfo_1 = require("./interface/AttachInfo");
var GameEventHandler_1 = require("./events/GameEventHandler");
//Misc
var Log = require("./util/Log");
var Updater_1 = require("./Updater");
var RequestManager_1 = require("./RequestManager");
var MainMenu_1 = require("./interface/prefabs/mainmenu/MainMenu");
var DefinitionManager_1 = require("./definitions/DefinitionManager");
var BattleUI_1 = require("./interface/prefabs/battle/BattleUI");
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
        //public textureWorker: TextureWorker;
        _this.updater = new Updater_1.default();
        _this.user = new User_1.default();
        _this.staticUrl = "";
        _this.definitions = new DefinitionManager_1.default();
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
        get: function () { return this._volatileGraphics.clear(); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Game.prototype, "currentBattle", {
        get: function () { return this._currentBattle; },
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
        //this.textureWorker = new TextureWorker('js/worker.js');
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
        var texUrl = this.staticUrl + "/textureMap2.png";
        var mapUrl = this.staticUrl + "/textureMap2.json";
        console.log("Load textures: " + texUrl + ", " + mapUrl);
        this.textureLoader = new TextureLoader_1.default(texUrl, mapUrl, function () { return _this.onTexturesLoaded(); });
    };
    Game.prototype.onTexturesLoaded = function () {
        this.sendGraphicsToWorker();
        this.loadSounds();
        //this.textureWorker.getTexture('parts/helmet', {from:[0x555555], to:[0xff0000]}, this.onTextureWorkerGetTexture);
    };
    Game.prototype.sendGraphicsToWorker = function () {
        var data = this.textureLoader.getData();
        //this.textureWorker.putTextures(data);
    };
    Game.prototype.loadSounds = function () {
        var _this = this;
        var list = SoundAssets.interfaceSounds.concat(SoundAssets.mainMenuMusic);
        for (var _i = 0, list_1 = list; _i < list_1.length; _i++) {
            var item = list_1[_i];
            item[1] = this.staticUrl + "/" + item[1];
        }
        SoundManager_1.default.instance.load("initial", list, function (which) { return _this.onSoundsLoaded(which); }, function (which, progress) { return _this.onSoundsLoadedProgress(which, progress); });
        var loadingText = this.interfaceRoot.getElementById("loadingText");
        loadingText.text = "Loading sounds... (0%)";
    };
    Game.prototype.onSoundsLoaded = function (which) {
        if (which == "initial") {
            console.log("Sounds loaded!");
            //SoundManager.instance.playMusic("music/fortress");
            this.removeLoadingText();
            this.loadUser("aaa", "aaa");
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
    Game.prototype.initMainMenu = function () {
        //this.interfaceRoot.showStatusPopup("This is the main menu!");
        var mainMenu = new MainMenu_1.default();
        this.interfaceRoot.addDialog(mainMenu);
        mainMenu.init();
    };
    Game.prototype.setCurrentBattle = function (battle) {
        this._currentBattle = battle;
        if (!this.battleUI) {
            this.battleUI = new BattleUI_1.default();
        }
        this.interfaceRoot.addUI(this.battleUI);
        this.battleUI.subscribeTo(this._currentBattle);
        this.battleUI.resizeToParent();
    };
    Game.prototype.gotoMainMenu = function () {
        var battle = this._currentBattle;
        if (battle) {
            if (battle.display)
                battle.display.cleanup();
            this._currentBattle = null;
        }
        if (this.battleUI) {
            this.battleUI.removeSelf();
        }
        this.initMainMenu();
    };
    Game.prototype.loadUser = function (name, password) {
        var _this = this;
        RequestManager_1.default.instance.makeRequest("login", { username: name, password: password }, function (data) {
            if (data) {
                _this.user.load(data.data);
                _this.user.startGame();
            }
            else {
                console.error("Unable to load user");
            }
        });
    };
    Game.instance = null;
    Game.useDebugGraphics = false;
    return Game;
}(GameEventHandler_1.default));
exports.default = Game;

},{"./RequestManager":4,"./Updater":5,"./definitions/DefinitionManager":15,"./events/GameEventHandler":22,"./interface/AttachInfo":23,"./interface/InputManager":26,"./interface/InterfaceElement":27,"./interface/TextElement":32,"./interface/prefabs/InterfaceRoot":35,"./interface/prefabs/battle/BattleUI":37,"./interface/prefabs/mainmenu/MainMenu":40,"./sound/SoundAssets":43,"./sound/SoundManager":44,"./textures/TextureGenerator":46,"./textures/TextureLoader":47,"./user/User":51,"./util/Log":54}],2:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Globals = (function () {
    function Globals() {
    }
    Globals.gridSize = 24;
    Globals.timeToTraverseTile = 0.075;
    return Globals;
}());
exports.default = Globals;

},{}],3:[function(require,module,exports){
"use strict";
/*
   Code entry point. Keep it clean.
*/
Object.defineProperty(exports, "__esModule", { value: true });
var Game_1 = require("./Game");
var startFunc = function () {
    var viewDiv = document.getElementById("viewDiv");
    var game = new Game_1.default(viewDiv);
    game.init();
};
$(document).ready(startFunc);

},{"./Game":1}],4:[function(require,module,exports){
"use strict";
/// <reference path="./declarations/jquery.d.ts"/>
Object.defineProperty(exports, "__esModule", { value: true });
var Log = require("./util/Log");
var Game_1 = require("./Game");
var RequestManager = (function () {
    function RequestManager(baseUrl) {
        if (baseUrl === void 0) { baseUrl = null; }
        this.baseUrl = "http://mightnot.work/dungeon/request";
        this.requestQueue = [];
        this.requestActive = false;
        if (RequestManager.instance === null) {
            RequestManager.instance = this;
        }
        else {
            Log.log("error", "There's already a RequestManager!");
            return;
        }
        if (baseUrl !== null)
            this.baseUrl = baseUrl;
    }
    /**
     * Makes an HTTP request! Most game-related requests should use makeUserRequest
     * @param instant If false, the request will wait for others to complete (preferred)
     */
    RequestManager.prototype.makeRequest = function (type, params, callback, instant) {
        if (instant === void 0) { instant = false; }
        if (instant || !this.requestActive) {
            this.makeRequestInternal(type, params, callback, instant);
        }
        else {
            this.requestQueue.push({
                type: type,
                params: params,
                callback: callback
            });
        }
    };
    /**
     * Same as makeRequest, but inserts user_id and token into the params
     * @param instant If false, the request will wait for others to complete (preferred)
     */
    RequestManager.prototype.makeUserRequest = function (type, params, callback, instant) {
        if (instant === void 0) { instant = false; }
        var user = Game_1.default.instance.user;
        if (user) {
            params["user_id"] = user.userId;
            params["token"] = user.token;
            this.makeRequest(type, params, callback, instant);
        }
        else {
            console.error("Trying to make a user request with no user");
        }
    };
    RequestManager.prototype.makeRequestInternal = function (type, params, callback, instant) {
        var _this = this;
        if (!instant)
            this.requestActive = true;
        console.log("REQUEST '" + type + "'");
        console.log(params);
        $.post(this.baseUrl + '/' + type, { "params": JSON.stringify(params) })
            .done(function (data) {
            console.log("RESPONSE '" + type + "'");
            console.log(data);
            _this.readDefinitions(data);
            callback(data);
        })
            .fail(function (e) {
            console.log("Request '" + type + "' failed");
            console.log(e);
            callback(null);
        })
            .always(function () {
            if (!instant) {
                var request = _this.requestQueue.pop();
                if (request) {
                    _this.makeRequestInternal(request.type, request.params, request.callback, false);
                }
                else {
                    _this.requestActive = false;
                }
            }
        });
    };
    /**
     * If a request response contains definitions, this will add them to Game.instance.definitions.
     */
    RequestManager.prototype.readDefinitions = function (data) {
        if (data.definitions) {
            for (var type in data.definitions) {
                for (var _i = 0, _a = data.definitions[type]; _i < _a.length; _i++) {
                    var defData = _a[_i];
                    Game_1.default.instance.definitions.setDefinition(type, defData);
                }
            }
        }
    };
    RequestManager.instance = new RequestManager();
    return RequestManager;
}());
exports.default = RequestManager;

},{"./Game":1,"./util/Log":54}],5:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Updater = (function () {
    function Updater() {
        this.objects = [];
        this.objectsToAdd = [];
        this.updating = false;
    }
    /**
     * Only to be called by its owner!
     */
    Updater.prototype.update = function (timeElapsed) {
        this.updating = true;
        for (var _i = 0, _a = this.objects; _i < _a.length; _i++) {
            var obj = _a[_i];
            obj.update(timeElapsed);
        }
        this.updating = false;
        for (var _b = 0, _c = this.objectsToAdd; _b < _c.length; _b++) {
            var obj = _c[_b];
            this.objects.push(obj);
        }
        this.objectsToAdd.length = 0;
    };
    Updater.prototype.add = function (obj, ifNotAdded) {
        if (ifNotAdded === void 0) { ifNotAdded = false; }
        if (ifNotAdded) {
            if (this.objects.indexOf(obj) !== -1 || this.objectsToAdd.indexOf(obj) !== -1) {
                return;
            }
        }
        if (this.updating) {
            this.objectsToAdd.push(obj);
        }
        else {
            this.objects.push(obj);
        }
    };
    Updater.prototype.remove = function (obj) {
        var index = this.objects.indexOf(obj);
        if (index > -1) {
            this.objects.splice(index, 1);
        }
        index = this.objectsToAdd.indexOf(obj);
        if (index > -1) {
            this.objectsToAdd.splice(index, 1);
        }
    };
    Updater.prototype.printAll = function () {
        console.log("All updateables:");
        for (var _i = 0, _a = this.objects.concat(this.objectsToAdd); _i < _a.length; _i++) {
            var obj = _a[_i];
            console.log("   " + obj);
        }
    };
    return Updater;
}());
exports.default = Updater;

},{}],6:[function(require,module,exports){
"use strict";
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
var Game_1 = require("../Game");
var Player_1 = require("./Player");
var Unit_1 = require("./Unit");
var Level_1 = require("./Level");
var IDObjectGroup_1 = require("../util/IDObjectGroup");
var BattleDisplay_1 = require("./display/BattleDisplay");
var SparseGrid_1 = require("../ds/SparseGrid");
var Animation_1 = require("./display/animation/Animation");
var GameEvent_1 = require("../events/GameEvent");
var GameEventHandler_1 = require("../events/GameEventHandler");
var Battle = (function (_super) {
    __extends(Battle, _super);
    /**
     * It's a battle!
     * @param visible Determines whether this Battle should be displayed. False for peer authentication if I ever get around to it. (lol)
     */
    function Battle(visible) {
        if (visible === void 0) { visible = true; }
        var _this = _super.call(this) || this;
        _this.players = new IDObjectGroup_1.default();
        _this.units = new IDObjectGroup_1.default();
        _this.level = null;
        _this._display = null;
        _this._selectedUnit = null;
        _this._currentPlayer = null;
        _this.initialized = false;
        _this.unitPositions = new SparseGrid_1.default(null);
        _this._turnNumber = 0;
        _this._ended = false;
        _this._winner = null;
        //data and accessors
        _this.data = null;
        //animation
        _this.animationSequence = null;
        _this._animating = false;
        _this._visible = visible;
        return _this;
    }
    Object.defineProperty(Battle.prototype, "visible", {
        get: function () { return this._visible; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Battle.prototype, "display", {
        get: function () { return this._display; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Battle.prototype, "selectedUnit", {
        get: function () { return this._selectedUnit; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Battle.prototype, "currentPlayer", {
        get: function () { return this._currentPlayer; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Battle.prototype, "animating", {
        get: function () { return this._animating; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Battle.prototype, "turnNumber", {
        get: function () { return this._turnNumber; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Battle.prototype, "ended", {
        get: function () { return this._ended; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Battle.prototype, "winner", {
        get: function () { return this._winner; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Battle.prototype, "layout", {
        get: function () { return Game_1.default.instance.definitions.getDefinition("layout", this.data.layout_id); },
        enumerable: true,
        configurable: true
    });
    Battle.prototype.init = function (data) {
        var _this = this;
        if (this.initialized)
            return;
        this.initialized = true;
        console.log("Battle: init");
        console.log(data);
        this.data = data;
        this.initLevel();
        if (this._visible) {
            this.initDisplay();
            this.level.initDisplay();
            this.display.setLevelDisplay(this.level.display);
        }
        //temp! add a couple players (for now, only the user and monsters)
        for (var i = 0; i < 2; i++) {
            var player = new Player_1.default();
            this.addPlayer(player);
        }
        //heroes
        for (var _i = 0, _a = data.data.heroes; _i < _a.length; _i++) {
            var heroData = _a[_i];
            var hero = Game_1.default.instance.user.heroManager.getHero(heroData.id);
            if (hero) {
                var unit = new Unit_1.default();
                unit.initAsHero(hero);
                unit.x = heroData.position[0];
                unit.y = heroData.position[1];
                this.players.list[0].addUnit(unit);
                this.addUnit(unit, false);
            }
        }
        //monsters
        for (var _b = 0, _c = data.data.monsters; _b < _c.length; _b++) {
            var monsterData = _c[_b];
            var monster = Game_1.default.instance.definitions.getDefinition("monster", monsterData.monster_id);
            if (monster) {
                var unit = new Unit_1.default();
                unit.initAsMonster(monster);
                unit.x = monsterData.position[0];
                unit.y = monsterData.position[1];
                this.players.list[1].addUnit(unit);
                this.addUnit(unit, false);
            }
        }
        this.beginTurn(this.players.list[0]);
        this.updateAllUnitPathing();
        this.display.updatePathingDisplay();
        this.display.updatePathingHover();
        Game_1.default.instance.addEventListener(GameEvent_1.default.types.ui.KEY, function (e) {
            if (e.data == '`') {
                var playerUnit = _this.currentPlayer.units.list[0];
                var anim = Animation_1.default.noop();
                _this.selectUnit(null);
                for (var _i = 0, _a = _this.players.list; _i < _a.length; _i++) {
                    var player = _a[_i];
                    if (player == _this.currentPlayer)
                        continue;
                    for (var _b = 0, _c = player.units.list.slice(); _b < _c.length; _b++) {
                        var unit = _c[_b];
                        if (!unit.alive)
                            continue;
                        unit.kill();
                        anim.then(Animation_1.default.unitDie(unit));
                    }
                }
                console.log("Oof!");
                _this.initAnimation();
                _this.queueAnimation(anim);
                _this.onUnitAction(playerUnit);
                _this.beginAnimation();
            }
        });
    };
    ////////////////////////////////////////////////////////////
    // Player actions
    ////////////////////////////////////////////////////////////
    Battle.prototype.selectUnit = function (unit) {
        if (unit == this._selectedUnit)
            return;
        this.deselectUnit(false);
        this._selectedUnit = unit;
        if (unit) {
            unit.onSelect();
        }
        this.sendNewEvent(GameEvent_1.default.types.battle.UNITSELECTIONCHANGED);
    };
    Battle.prototype.deselectUnit = function (sendEvent) {
        if (sendEvent === void 0) { sendEvent = true; }
        if (!this._selectedUnit)
            return;
        var unit = this._selectedUnit;
        this._selectedUnit = null;
        unit.onDeselect();
        if (sendEvent)
            this.sendNewEvent(GameEvent_1.default.types.battle.UNITSELECTIONCHANGED);
    };
    Battle.prototype.moveUnit = function (unit, x, y, path) {
        if (path === void 0) { path = null; }
        //This is going to have to step through the whole path and see what triggers
        //(once that sort of thing is implemented, anyway)
        this.unitPositions.unset(unit.x, unit.y);
        this.unitPositions.set(x, y, unit);
        unit.x = x;
        unit.y = y;
        var display = unit.display;
        if (display) {
            var animation = Animation_1.default.moveUnit(unit, path);
            this.queueAnimation(animation);
        }
        this.onUnitAction(unit);
        this.updateAllUnitPathing();
    };
    Battle.prototype.attackUnit = function (attacker, target) {
        if (!attacker.selected || !this.ownUnitSelected()) {
            console.log("Battle: " + attacker + " isn't selected by the current player");
            return;
        }
        if (attacker.actionsRemaining <= 0) {
            console.log("Battle: " + attacker + " is out of actions");
        }
        if (!attacker.inRangeToAttack(target)) {
            console.log("Battle: " + attacker + " isn't in range to attack " + target);
            return;
        }
        target.takeDamage(attacker.attackDamage, attacker);
        var onHit = Animation_1.default.unitTakeDamage(target);
        if (!target.alive) {
            onHit.then(Animation_1.default.unitDie(target));
        }
        var animation = Animation_1.default.unitAttack(attacker, target, onHit);
        this.queueAnimation(animation);
        //there will be a LOT to change here
        this.onUnitAction(attacker);
    };
    Battle.prototype.beginTurn = function (player) {
        if (this._currentPlayer != null) {
            this.endTurn();
        }
        if (this.players.list.indexOf(player) === 0) {
            this._turnNumber += 1;
        }
        this._currentPlayer = player;
        if (this._display) {
            this._display.updateDebugPanel();
        }
    };
    Battle.prototype.endTurn = function () {
        var _this = this;
        this.deselectUnit();
        if (this._currentPlayer) {
            for (var _i = 0, _a = this._currentPlayer.units.list; _i < _a.length; _i++) {
                var unit = _a[_i];
                unit.actionsRemaining = unit.actionsPerTurn;
                unit.onActionsChanged();
            }
        }
        var action = function (callback) {
            if (_this.display) {
                _this.display.showTurnBegin(callback);
            }
            else {
                callback();
            }
        };
        var anim = new Animation_1.default(action);
        this.queueAnimation(anim);
        //select next player and start their turn
        var index = (this._currentPlayer != null) ? (this.players.list.indexOf(this._currentPlayer) + 1) % this.players.count : 0;
        this._currentPlayer = null;
        this.beginTurn(this.players.list[index]);
    };
    ////////////////////////////////////////////////////////////
    // Events
    ////////////////////////////////////////////////////////////
    Battle.prototype.onUnitDeath = function (unit) {
        this.removeUnit(unit);
        if (unit.player) {
            unit.player.removeUnit(unit);
        }
    };
    /** The unit has just completed an action */
    Battle.prototype.onUnitAction = function (unit) {
        unit.actionsRemaining -= 1;
        if (unit.actionsRemaining <= 0) {
            //update the unit display somehow
            if (unit.selected) {
                this.deselectUnit();
            }
        }
        this.checkEndBattle();
        if (!this.ended) {
            if (this.shouldForceEndTurn()) {
                this.endTurn();
            }
        }
    };
    Battle.prototype.initAnimation = function () {
        this.animationSequence = null;
        this._animating = false;
    };
    Battle.prototype.beginAnimation = function () {
        var _this = this;
        if (this._animating || this.animationSequence == null)
            return;
        this._animating = true;
        this.sendNewEvent(GameEvent_1.default.types.battle.ANIMATIONSTART);
        console.log("Start animation");
        this.animationSequence.start(function () {
            console.log("Animation complete");
            _this.onAnimationComplete();
        });
    };
    Battle.prototype.onAnimationComplete = function () {
        this._animating = false;
        this.sendNewEvent(GameEvent_1.default.types.battle.ANIMATIONCOMPLETE);
        if (this.ended) {
            console.log("To the menu!");
            Game_1.default.instance.gotoMainMenu();
        }
    };
    Battle.prototype.queueAnimation = function (animation) {
        if (this.animationSequence == null) {
            this.animationSequence = Animation_1.default.noop();
            this.animationSequence.mode = Animation_1.default.modes.sequential;
        }
        this.animationSequence.then(animation);
    };
    ////////////////////////////////////////////////////////////
    // Book keeping
    ////////////////////////////////////////////////////////////
    Battle.prototype.updateAllUnitPathing = function () {
        var now = performance.now();
        for (var _i = 0, _a = this.units.list; _i < _a.length; _i++) {
            var unit = _a[_i];
            unit.updatePathing();
        }
        var timeTaken = performance.now() - now;
        console.log("Updating pathing for " + this.units.count + " units took " + timeTaken + "ms");
    };
    ////////////////////////////////////////////////////////////
    // Convenience functions for checking state
    ////////////////////////////////////////////////////////////
    Battle.prototype.getUnitAtPosition = function (x, y) {
        return this.unitPositions.get(x, y);
    };
    Battle.prototype.ownUnitSelected = function () {
        if (this._currentPlayer && this._selectedUnit && this._selectedUnit.player == this._currentPlayer) {
            return true;
        }
        return false;
    };
    Battle.prototype.shouldForceEndTurn = function () {
        return this.getUnitsWithActions().length == 0;
    };
    /**
     * Sees if the battle should end, and if it should, ends it
     */
    Battle.prototype.checkEndBattle = function () {
        var _this = this;
        if (this._ended)
            return;
        var undefeated = this.players.list.filter(function (player) {
            return !player.checkDefeated();
        });
        if (undefeated.length == 1) {
            this._ended = true;
            this._winner = undefeated[0];
        }
        if (this._ended) {
            var action = function (callback) {
                if (_this.display) {
                    _this.display.showEndGame(callback);
                }
                else {
                    callback();
                }
            };
            var anim = new Animation_1.default(action, null, -1);
            this.queueAnimation(anim);
        }
    };
    ////////////////////////////////////////////////////////////
    // Adding and removing things
    ////////////////////////////////////////////////////////////
    Battle.prototype.addPlayer = function (player) {
        this.players.add(player);
        player.battle = this;
    };
    /** I'm pretty sure there will never be a reason to do this... */
    Battle.prototype.removePlayer = function (player) {
        this.players.remove(player);
        player.battle = null;
    };
    Battle.prototype.addUnit = function (unit, updatePathing) {
        if (updatePathing === void 0) { updatePathing = true; }
        if (this.units.contains(unit)) {
            return;
        }
        var currentUnit = this.unitPositions.get(unit.x, unit.y);
        if (currentUnit) {
            console.log("Battle: can't add unit " + unit.id + " (unit " + currentUnit.id + " already occupies " + unit.x + ", " + unit.y + ")");
            return;
        }
        this.units.add(unit);
        this.unitPositions.set(unit.x, unit.y, unit);
        unit.battle = this;
        unit.onAddToBattle();
        if (updatePathing) {
            this.updateAllUnitPathing();
        }
    };
    Battle.prototype.removeUnit = function (unit) {
        if (unit.selected) {
            this.deselectUnit();
        }
        this.units.remove(unit);
        this.unitPositions.unset(unit.x, unit.y);
        this.updateAllUnitPathing();
    };
    ////////////////////////////////////////////////////////////
    // Getting things
    ////////////////////////////////////////////////////////////
    Battle.prototype.getUnitsWithActions = function () {
        var ret = [];
        if (this._currentPlayer) {
            for (var _i = 0, _a = this.currentPlayer.units.list; _i < _a.length; _i++) {
                var unit = _a[_i];
                if (unit.canAct()) {
                    ret.push(unit);
                }
            }
        }
        return ret;
    };
    Battle.prototype.getHoveredUnit = function () {
        var coords = this._display.hoverCoords;
        return this.getUnitAtPosition(coords.x, coords.y);
    };
    Battle.prototype.getHoveredTile = function () {
        var coords = this._display.hoverCoords;
        return this.level.getTile(coords.x, coords.y);
    };
    Battle.prototype.getDebugPanelStrings = function () {
        var ret = [
            "Current player: " + this._currentPlayer.id,
            "Selected: " + this._selectedUnit
        ];
        var coords = this.display.hoverCoords;
        var hoverStrings = [coords.toString()];
        var tile = this.getHoveredTile();
        if (tile) {
            hoverStrings.push(tile.name);
        }
        var unit = this.getHoveredUnit();
        if (unit) {
            hoverStrings.push(unit.toString());
        }
        ret.push("Hover: " + JSON.stringify(hoverStrings));
        return ret;
    };
    ////////////////////////////////////////////////////////////
    // Input
    ////////////////////////////////////////////////////////////
    /** Perform the default action for that tile */
    Battle.prototype.rightClickTile = function (x, y) {
        if (this.animating)
            return;
        var unit = this._selectedUnit;
        if (this.ownUnitSelected() && unit.canAct()) {
            this.initAnimation();
            var tileUnit = this.getUnitAtPosition(x, y);
            if (!tileUnit && unit.canReachTile(x, y)) {
                this.moveUnit(unit, x, y, unit.getPathToPosition(x, y));
            }
            else if (tileUnit && unit.isHostileToUnit(tileUnit)) {
                if (unit.inRangeToAttack(tileUnit)) {
                    this.attackUnit(unit, tileUnit);
                }
                else if (unit.actionsRemaining > 1) {
                    var pos = unit.getPositionToAttackUnit(tileUnit);
                    if (pos) {
                        this.moveUnit(unit, pos[0], pos[1], unit.getPathToPosition(pos[0], pos[1]));
                        this.attackUnit(unit, tileUnit);
                    }
                }
            }
            this.beginAnimation();
        }
    };
    ////////////////////////////////////////////////////////////
    // Init and Cleanup
    ////////////////////////////////////////////////////////////
    Battle.prototype.initLevel = function () {
        this.level = new Level_1.default();
        this.level.init(this.layout);
    };
    Battle.prototype.initDisplay = function () {
        console.log("Battle: init display");
        this._display = new BattleDisplay_1.default();
        this._display.init(this);
        Game_1.default.instance.stage.addChildAt(this._display, 0);
        this._display.scale.set(3, 3);
    };
    return Battle;
}(GameEventHandler_1.default));
exports.default = Battle;

},{"../Game":1,"../ds/SparseGrid":20,"../events/GameEvent":21,"../events/GameEventHandler":22,"../util/IDObjectGroup":53,"./Level":7,"./Player":8,"./Unit":10,"./display/BattleDisplay":11,"./display/animation/Animation":14}],7:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Tile_1 = require("./Tile");
var LevelDisplay_1 = require("./display/LevelDisplay");
var Level = (function () {
    function Level() {
        this.tiles = [];
        this.width = 0;
        this.height = 0;
        this.display = null;
    }
    Level.prototype.init = function (layout) {
        this.width = layout.width;
        this.height = layout.height;
        var x = 0, y = 0;
        for (var _i = 0, _a = layout.tiles; _i < _a.length; _i++) {
            var tileType = _a[_i];
            var tile = new Tile_1.default();
            tile.x = x;
            tile.y = y;
            tile.initType(tileType);
            this.tiles.push(tile);
            x += 1;
            if (x == this.width) {
                x = 0;
                y += 1;
            }
        }
    };
    Level.prototype.getTile = function (x, y) {
        if (x < 0 || x >= this.width || y < 0 || y >= this.height)
            return null;
        var index = this.width * y + x;
        return this.tiles[index];
    };
    Level.prototype.initDisplay = function () {
        this.display = new LevelDisplay_1.default();
        this.display.initLevel(this);
    };
    return Level;
}());
exports.default = Level;

},{"./Tile":9,"./display/LevelDisplay":12}],8:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var IDObjectGroup_1 = require("../util/IDObjectGroup");
var Player = (function () {
    function Player() {
        this.battle = null;
        this.units = new IDObjectGroup_1.default();
        this._id = Player._nextID++;
    }
    Object.defineProperty(Player.prototype, "id", {
        get: function () { return this._id; },
        enumerable: true,
        configurable: true
    });
    Player.prototype.addUnit = function (unit) {
        if (unit.player) {
            unit.player.removeUnit(unit);
        }
        var added = this.units.add(unit);
        if (added) {
            unit.player = this;
        }
    };
    Player.prototype.removeUnit = function (unit) {
        var removed = this.units.remove(unit);
        if (unit.player == this) {
            unit.player = null;
        }
    };
    Player.prototype.checkDefeated = function () {
        for (var _i = 0, _a = this.units.list; _i < _a.length; _i++) {
            var unit = _a[_i];
            if (unit.alive)
                return false;
        }
        return true;
    };
    Player._nextID = 1;
    return Player;
}());
exports.default = Player;

},{"../util/IDObjectGroup":53}],9:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Tile = (function () {
    function Tile() {
        this.pathingType = 0;
        this.walkCost = 1;
        this.flyCost = 1;
        this.name = "Tile";
        this.spriteName = "tile/wall";
        this.x = 0;
        this.y = 0;
    }
    Object.defineProperty(Tile.prototype, "isWalkable", {
        get: function () { return this.pathingType >= 2; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Tile.prototype, "isFlyable", {
        get: function () { return this.pathingType >= 1; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Tile.prototype, "isPathable", {
        get: function () { return this.isWalkable || this.isFlyable; },
        enumerable: true,
        configurable: true
    });
    //these are all temp!
    //figure out how tiles should actually work!!!
    Tile.prototype.initType = function (type) {
        switch (type) {
            case 1:
                this.initWall();
                break;
            case 2:
                this.initFloor();
                break;
            case 3:
                this.initPit();
                break;
        }
    };
    Tile.prototype.initWall = function () {
        this.pathingType = Tile.PATHING_NONE;
        this.name = "Wall";
        this.spriteName = "tile/wall";
    };
    Tile.prototype.initFloor = function () {
        this.pathingType = Tile.PATHING_WALK;
        this.name = "Floor";
        this.spriteName = "tile/floor";
    };
    Tile.prototype.initPit = function () {
        this.pathingType = Tile.PATHING_FLY;
        this.name = "Pit";
        this.spriteName = "tile/water";
    };
    Tile.PATHING_NONE = 0;
    Tile.PATHING_FLY = 1;
    Tile.PATHING_WALK = 2;
    return Tile;
}());
exports.default = Tile;

},{}],10:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var UnitDisplay_1 = require("./display/UnitDisplay");
var BinaryHeap_1 = require("../ds/BinaryHeap");
var SparseGrid_1 = require("../ds/SparseGrid");
var PathingNode = (function () {
    function PathingNode() {
        this.cost = Number.POSITIVE_INFINITY;
        this.hCost = 0;
        this.tile = null;
        this.visited = false;
        this.fromNode = null;
    }
    Object.defineProperty(PathingNode.prototype, "x", {
        get: function () { return this.tile.x; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PathingNode.prototype, "y", {
        get: function () { return this.tile.y; },
        enumerable: true,
        configurable: true
    });
    /** For BinaryHeap */
    PathingNode.scoreFunc = function (node) {
        return node.cost + node.hCost;
    };
    return PathingNode;
}());
var Unit = (function () {
    function Unit() {
        this.player = null;
        this.battle = null;
        this.display = null;
        this.x = 0;
        this.y = 0;
        this.moveSpeed = 5;
        this.actionsRemaining = 2;
        this.actionsPerTurn = 2;
        this.isFlying = false;
        this.attackRangeMin = 1;
        this.attackRangeMax = 2;
        this.attackDamage = 2;
        this.health = 5;
        this.maxHealth = 5;
        this.name = "?";
        this.hero = null;
        this.monster = null;
        this.pathableTiles = null;
        this.attackableTiles = null;
        this._id = Unit._nextID++;
    }
    Object.defineProperty(Unit.prototype, "id", {
        get: function () { return this._id; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Unit.prototype, "selected", {
        get: function () {
            var battle = this.battle;
            if (battle) {
                return battle.selectedUnit == this;
            }
            return false;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Unit.prototype, "alive", {
        get: function () { return this.health > 0; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Unit.prototype, "injured", {
        get: function () { return this.health < this.maxHealth; },
        enumerable: true,
        configurable: true
    });
    Unit.prototype.initAsHero = function (hero) {
        this.monster = null;
        this.hero = hero;
        this.name = hero.name;
    };
    Unit.prototype.initAsMonster = function (monster) {
        this.hero = null;
        this.monster = monster;
        this.name = monster.name;
    };
    Unit.prototype.onAddToBattle = function () {
        if (this.battle.visible) {
            this.initDisplay();
        }
    };
    Unit.prototype.onSelect = function () {
        if (this.display)
            this.display.setSelected(true);
    };
    Unit.prototype.onDeselect = function () {
        if (this.display)
            this.display.setSelected(false);
    };
    /**The number of remaining actions has changed */
    Unit.prototype.onActionsChanged = function () {
        if (this.display)
            this.display.updateActions();
    };
    /** Tells the battle to select this. */
    Unit.prototype.select = function () {
        var battle = this.battle;
        if (battle) {
            battle.selectUnit(this);
        }
    };
    /** Tells the battle to deselect this. */
    Unit.prototype.deselect = function () {
        if (this.selected) {
            this.battle.deselectUnit();
        }
    };
    Unit.prototype.updatePosition = function () {
        if (this.display) {
            this.display.updatePosition();
        }
    };
    Unit.prototype.takeDamage = function (amount, fromUnit) {
        console.log(this + " takes " + amount + " damage from " + fromUnit);
        this.health -= amount;
        if (this.health < 0)
            this.health = 0;
        if (this.health == 0) {
            //die!
            this.kill();
            console.log(this + " dies!");
        }
    };
    Unit.prototype.kill = function () {
        this.battle.onUnitDeath(this);
    };
    /**
     * Updates this Unit's public pathableTiles variable, which lists the minimum cost to get to
     * nearby tiles.
     */
    Unit.prototype.updatePathing = function () {
        //It's dijkstra with a priority queue and lazy node discovery.
        var level = this.battle.level;
        var width = level.width;
        var height = level.height;
        var source = this.getNewPathingNode(this.x, this.y);
        source.cost = 0;
        var queue = new BinaryHeap_1.default(PathingNode.scoreFunc, [source]);
        var nodes = new SparseGrid_1.default();
        this.pathableTiles = new SparseGrid_1.default(false);
        this.attackableTiles = new SparseGrid_1.default(false);
        nodes.set(source.x, source.y, source);
        while (!queue.empty) {
            var node = queue.pop();
            this.pathableTiles.set(node.x, node.y, true);
            this.getAttackableTiles(node.x, node.y, this.attackableTiles);
            node.visited = true;
            //console.log(node.x + "," + node.y);
            //check the 4 adjacent tiles
            for (var i = 0; i < 4; i++) {
                var x = node.x + Unit.adjacentOffsets[i][0];
                var y = node.y + Unit.adjacentOffsets[i][1];
                //gotta stay in the grid
                if (x < 0 || x >= width || y < 0 || y >= height)
                    continue;
                //get (or create and set) the pathing node
                var neighbour = nodes.get(x, y);
                var justDiscoveredNeighbour = false;
                if (!neighbour) {
                    neighbour = this.getNewPathingNode(x, y);
                    nodes.set(x, y, neighbour);
                    justDiscoveredNeighbour = true;
                }
                else if (neighbour.visited) {
                    //this neighbour already has its shortest route (or has no route)
                    continue;
                }
                //well duh (though this could be subject to change, if some tiles can only be entered from a certain direction)
                if (!this.canTraverseTile(neighbour.tile)) {
                    neighbour.visited = true;
                    continue;
                }
                var cost = node.cost + this.getCostToTraverseTile(neighbour.tile);
                if (cost > this.moveSpeed)
                    continue;
                if (cost < neighbour.cost) {
                    neighbour.cost = cost;
                    if (!justDiscoveredNeighbour) {
                        queue.decrease(neighbour);
                    }
                }
                if (justDiscoveredNeighbour) {
                    queue.push(neighbour);
                }
            }
        }
    };
    /** For each tile that can be attacked from the given position, writes them to the provided grid, and returns it */
    Unit.prototype.getAttackableTiles = function (fromX, fromY, toGrid) {
        if (toGrid === void 0) { toGrid = null; }
        var minRange = this.attackRangeMin;
        var maxRange = this.attackRangeMax;
        var dist = 0;
        var x, y;
        var width = this.battle.level.width;
        var height = this.battle.level.height;
        var tile;
        if (toGrid == null) {
            toGrid = new SparseGrid_1.default();
        }
        for (var yOffset = -maxRange; yOffset <= maxRange; yOffset++) {
            for (var xOffset = -maxRange; xOffset <= maxRange; xOffset++) {
                x = fromX + xOffset;
                y = fromY + yOffset;
                if (x < 0 || y < 0 || x >= width || y >= height)
                    continue;
                tile = this.battle.level.getTile(x, y);
                if (!tile.isPathable)
                    continue;
                dist = Math.abs(xOffset) + Math.abs(yOffset);
                if (dist >= minRange && dist <= maxRange) {
                    toGrid.set(x, y, true);
                }
            }
        }
        return toGrid;
    };
    /**
     * Gets the coordinates from which this unit should attack the other unit. Assumes it can get there.
     */
    Unit.prototype.getPositionToAttackUnit = function (unit) {
        var _this = this;
        var grid = this.pathableTiles.filter(function (x, y, val) {
            var dist = Math.abs(x - unit.x) + Math.abs(y - unit.y);
            if (dist >= _this.attackRangeMin && dist <= _this.attackRangeMax) {
                return !_this.battle.getUnitAtPosition(x, y);
            }
            return false;
        });
        var allCoords = grid.getAllCoordinates();
        var closestCoords = null;
        var leastDist = Number.POSITIVE_INFINITY;
        for (var _i = 0, allCoords_1 = allCoords; _i < allCoords_1.length; _i++) {
            var coords = allCoords_1[_i];
            var dist = Math.sqrt(Math.pow(coords[0] - this.x, 2) + Math.pow(coords[1] - this.y, 2));
            if (dist < leastDist) {
                closestCoords = coords;
                leastDist = dist;
            }
        }
        return closestCoords;
    };
    Unit.prototype.getPathToPosition = function (targetX, targetY, fromX, fromY) {
        //A*
        //todo: add additional heuristic cost based on environment hazards
        if (fromX === void 0) { fromX = Number.NEGATIVE_INFINITY; }
        if (fromY === void 0) { fromY = Number.NEGATIVE_INFINITY; }
        //var startTime = performance.now();
        if (fromX == Number.NEGATIVE_INFINITY)
            fromX = this.x;
        if (fromY == Number.NEGATIVE_INFINITY)
            fromY = this.y;
        var level = this.battle.level;
        var width = level.width;
        var height = level.height;
        var xIsLongest = (Math.abs(targetX - fromX) > Math.abs(targetY - fromY));
        var source = this.getNewPathingNode(fromX, fromY);
        source.cost = 0;
        var queue = new BinaryHeap_1.default(PathingNode.scoreFunc, [source]);
        var nodes = new SparseGrid_1.default();
        nodes.set(source.x, source.y, source);
        while (!queue.empty) {
            var node = queue.pop();
            if (node.x === targetX && node.y === targetY) {
                var route = this.traceRoute(node);
                //var endTime = performance.now();
                //console.log("Computed path from " + fromX + "," + fromY + " to " + targetX + "," + targetY + " in " + (endTime - startTime) + "ms");
                return route;
            }
            this.pathableTiles.set(node.x, node.y, true);
            node.visited = true;
            //check the 4 adjacent tiles
            for (var i = 0; i < 4; i++) {
                var x = node.x + Unit.adjacentOffsets[i][0];
                var y = node.y + Unit.adjacentOffsets[i][1];
                //gotta stay in the grid
                if (x < 0 || x >= width || y < 0 || y >= height)
                    continue;
                //get (or create and set) the pathing node
                var neighbour = nodes.get(x, y);
                var justDiscoveredNeighbour = false;
                if (!neighbour) {
                    neighbour = this.getNewPathingNode(x, y);
                    //hCost is the line distance...
                    neighbour.hCost = Math.sqrt(Math.pow(x - targetX, 2) + Math.pow(y - targetY, 2));
                    //...but favour moving along the longest axis
                    if (xIsLongest) {
                        neighbour.hCost += Math.abs(neighbour.x - targetX);
                    }
                    else {
                        neighbour.hCost += Math.abs(neighbour.y - targetY);
                    }
                    nodes.set(x, y, neighbour);
                    justDiscoveredNeighbour = true;
                }
                else if (neighbour.visited) {
                    //this neighbour already has its shortest route (or has no route)
                    continue;
                }
                //well duh (though this could be subject to change, if some tiles can only be entered from a certain direction)
                if (!this.canTraverseTile(neighbour.tile)) {
                    neighbour.visited = true;
                    continue;
                }
                var cost = node.cost + this.getCostToTraverseTile(neighbour.tile);
                if (cost > this.moveSpeed)
                    continue;
                if (cost < neighbour.cost) {
                    neighbour.cost = cost;
                    neighbour.fromNode = node;
                    if (!justDiscoveredNeighbour) {
                        queue.decrease(neighbour);
                    }
                }
                if (justDiscoveredNeighbour) {
                    queue.push(neighbour);
                }
            }
        }
        return null;
    };
    Unit.prototype.traceRoute = function (node) {
        var route = [];
        while (node != null) {
            route.unshift([node.x, node.y]);
            node = node.fromNode;
        }
        return route;
    };
    Unit.prototype.canAct = function () {
        return this.actionsRemaining > 0;
    };
    Unit.prototype.canTraverseTile = function (tile) {
        //can't enter enemy tiles!
        var currentUnit = this.battle.getUnitAtPosition(tile.x, tile.y);
        if (currentUnit && currentUnit.player != this.player) {
            return false;
        }
        if (this.isFlying) {
            return tile.isFlyable;
        }
        return tile.isWalkable;
    };
    Unit.prototype.canReachTile = function (x, y) {
        if (this.pathableTiles == null) {
            this.updatePathing();
        }
        return this.pathableTiles.get(x, y) === true;
    };
    Unit.prototype.canAttackTile = function (x, y) {
        if (this.attackableTiles == null) {
            this.updatePathing();
        }
        return this.pathableTiles.get(x, y) === true;
    };
    /** Irrespective of actions, range and such. Currently "belongs to a different player from" */
    Unit.prototype.isHostileToUnit = function (unit) {
        return this.player != unit.player;
    };
    Unit.prototype.inRangeToAttack = function (unit) {
        var range = Math.abs(unit.x - this.x) + Math.abs(unit.y - this.y);
        if (range >= this.attackRangeMin && range <= this.attackRangeMax) {
            return true;
        }
        return false;
    };
    Unit.prototype.getAttackableNonWalkableTiles = function () {
        if (this.pathableTiles == null) {
            this.updatePathing();
        }
        return this.attackableTiles.getComplement(this.pathableTiles);
    };
    /** Assumes it CAN traverse this tile! */
    Unit.prototype.getCostToTraverseTile = function (tile) {
        //TODO: based on unit type, etc etc
        //maybe make it cost more when adjacent to an enemy
        if (this.isFlying) {
            return tile.flyCost;
        }
        return tile.walkCost;
    };
    Unit.prototype.getNewPathingNode = function (x, y) {
        var node = new PathingNode();
        var tile = this.battle.level.getTile(x, y);
        node.tile = tile;
        return node;
    };
    Unit.prototype.initDisplay = function () {
        if (this.display) {
            this.display.cleanup();
        }
        this.display = new UnitDisplay_1.default();
        this.display.initUnit(this);
        if (this.battle.display) {
            this.battle.display.addUnitDisplay(this.display);
        }
    };
    Unit.prototype.toString = function () {
        return "Unit " + this.id + ' "' + this.name + '"';
    };
    Unit._nextID = 1;
    Unit.adjacentOffsets = [[-1, 0], [1, 0], [0, -1], [0, 1]];
    return Unit;
}());
exports.default = Unit;

},{"../ds/BinaryHeap":19,"../ds/SparseGrid":20,"./display/UnitDisplay":13}],11:[function(require,module,exports){
"use strict";
/// <reference path="../../declarations/pixi.js.d.ts"/>
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
var Game_1 = require("../../Game");
var Vector2D_1 = require("../../util/Vector2D");
var InputManager_1 = require("../../interface/InputManager");
var Globals_1 = require("../../Globals");
var GameEvent_1 = require("../../events/GameEvent");
var TextUtil = require("../../util/TextUtil");
var Tween_1 = require("../../util/Tween");
var ElementList_1 = require("../../interface/ElementList");
var AttachInfo_1 = require("../../interface/AttachInfo");
var TextElement_1 = require("../../interface/TextElement");
var BattleDisplay = (function (_super) {
    __extends(BattleDisplay, _super);
    function BattleDisplay() {
        var _this = _super.call(this) || this;
        _this._unitContainer = new PIXI.Container();
        _this._unitDisplays = [];
        _this._levelDisplay = null;
        _this.mouseGridX = Number.NEGATIVE_INFINITY;
        _this.mouseGridY = Number.NEGATIVE_INFINITY;
        _this.hoveredUnitDisplay = null;
        _this.onAnimation = function (e) {
            _this.updatePathingDisplay();
            _this.updatePathingHover();
        };
        _this.onUnitSelectionChanged = function (e) {
            _this.updatePathingDisplay();
            _this.updatePathingHover();
        };
        return _this;
    }
    Object.defineProperty(BattleDisplay.prototype, "battle", {
        get: function () { return this._battle; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(BattleDisplay.prototype, "levelDisplay", {
        get: function () { return this._levelDisplay; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(BattleDisplay.prototype, "hoverCoords", {
        get: function () { return new Vector2D_1.default(this.mouseGridX, this.mouseGridY); },
        enumerable: true,
        configurable: true
    });
    BattleDisplay.prototype.init = function (battle) {
        this._battle = battle;
        this.addChild(this._unitContainer);
        Game_1.default.instance.updater.add(this);
        battle.addEventListener(GameEvent_1.default.types.battle.ANIMATIONSTART, this.onAnimation);
        battle.addEventListener(GameEvent_1.default.types.battle.ANIMATIONCOMPLETE, this.onAnimation);
        battle.addEventListener(GameEvent_1.default.types.battle.UNITSELECTIONCHANGED, this.onUnitSelectionChanged);
    };
    BattleDisplay.prototype.cleanup = function () {
        for (var _i = 0, _a = this._unitDisplays; _i < _a.length; _i++) {
            var unitDisplay = _a[_i];
            unitDisplay.cleanup();
        }
        this._levelDisplay.cleanup();
        this._unitContainer.destroy({ children: true });
        if (this.parent)
            this.parent.removeChild(this);
        if (this.debugPanel) {
            this.debugPanel.removeSelf();
        }
        Game_1.default.instance.updater.remove(this);
        this._battle.removeEventListener(GameEvent_1.default.types.battle.ANIMATIONSTART, this.onAnimation);
        this._battle.removeEventListener(GameEvent_1.default.types.battle.ANIMATIONCOMPLETE, this.onAnimation);
        this._battle.removeEventListener(GameEvent_1.default.types.battle.UNITSELECTIONCHANGED, this.onUnitSelectionChanged);
    };
    BattleDisplay.prototype.setLevelDisplay = function (display) {
        if (this._levelDisplay) {
            //dispose of it somehow
        }
        this._levelDisplay = display;
        this.addChildAt(display, 0); //want it below units, obviously
    };
    BattleDisplay.prototype.addUnitDisplay = function (display) {
        this._unitContainer.addChild(display);
        if (this._unitDisplays.indexOf(display) == -1) {
            this._unitDisplays.push(display);
        }
    };
    BattleDisplay.prototype.removeUnitDisplay = function (display) {
        if (display.parent == this._unitContainer) {
            this._unitContainer.removeChild(display);
        }
        var index = this._unitDisplays.indexOf(display);
        if (index > -1) {
            this._unitDisplays.splice(index, 1);
        }
    };
    BattleDisplay.prototype.update = function (timeElapsed) {
        //check mouse position, and highlight things
        var mouseCoords = InputManager_1.default.instance.mouseCoords;
        var gridCoords = this.viewToGrid(mouseCoords);
        if (gridCoords.x != this.mouseGridX || gridCoords.y != this.mouseGridY) {
            this.mouseGridX = gridCoords.x;
            this.mouseGridY = gridCoords.y;
            this.updateHover();
        }
        //Move the camera with the arrow keys
        //Moving the camera one way is the same as moving this the other way
        var moveAmount = Math.round(500 * timeElapsed);
        if (InputManager_1.default.instance.isKeyDown("LEFT"))
            this.x += moveAmount;
        if (InputManager_1.default.instance.isKeyDown("RIGHT"))
            this.x -= moveAmount;
        if (InputManager_1.default.instance.isKeyDown("UP"))
            this.y += moveAmount;
        if (InputManager_1.default.instance.isKeyDown("DOWN"))
            this.y -= moveAmount;
    };
    BattleDisplay.prototype.onLeftClick = function (coords) {
        var unitClicked = false;
        for (var _i = 0, _a = this._unitDisplays; _i < _a.length; _i++) {
            var display = _a[_i];
            if (display.getBounds().contains(coords.x, coords.y)) {
                display.onClick();
                unitClicked = true;
            }
        }
        if (!unitClicked) {
            this._battle.deselectUnit();
        }
        this.updateDebugPanel();
    };
    BattleDisplay.prototype.onRightClick = function (coords) {
        var gridCoords = this.viewToGrid(coords);
        this._battle.rightClickTile(gridCoords.x, gridCoords.y);
        this.updateDebugPanel();
    };
    /**
     * Returns the grid coordinates corresponding to the provided viewspace coordinates
     */
    BattleDisplay.prototype.viewToGrid = function (coords) {
        coords = coords.clone();
        coords.x = Math.floor(((coords.x - this.x) / this.scale.x) / Globals_1.default.gridSize);
        coords.y = Math.floor(((coords.y - this.y) / this.scale.y) / Globals_1.default.gridSize);
        return coords;
    };
    BattleDisplay.prototype.updateHover = function () {
        var x = this.mouseGridX;
        var y = this.mouseGridY;
        this.levelDisplay.clearPath();
        if (this.hoveredUnitDisplay) {
            this.hoveredUnitDisplay.onMouseOut();
        }
        for (var _i = 0, _a = this._unitDisplays; _i < _a.length; _i++) {
            var display = _a[_i];
            if (display.unit.x == x && display.unit.y == y) {
                this.hoveredUnitDisplay = display;
                display.onMouseOver();
                break;
            }
        }
        this.updatePathingHover();
        this.updateDebugPanel();
        this.battle.sendNewEvent(GameEvent_1.default.types.battle.HOVERCHANGED);
    };
    BattleDisplay.prototype.updateDebugPanel = function () {
        var items = this.battle.getDebugPanelStrings();
        if (!this.debugPanel) {
            this.debugPanel = new ElementList_1.default(200, ElementList_1.default.VERTICAL, 5, ElementList_1.default.RIGHT);
            Game_1.default.instance.interfaceRoot.addDialog(this.debugPanel);
            this.debugPanel.attachToParent(AttachInfo_1.default.TRtoTR);
        }
        this.debugPanel.beginBatchChange();
        //remove excess
        while (this.debugPanel.numChildren > items.length) {
            this.debugPanel.removeChild(this.debugPanel.getLastChild());
        }
        //add as needed
        while (this.debugPanel.numChildren < items.length) {
            var text = new TextElement_1.default("aaa", TextElement_1.default.basicText);
            this.debugPanel.addChild(text);
        }
        //set them all
        for (var i = 0; i < items.length; i++) {
            this.debugPanel.children[i].text = items[i];
        }
        this.debugPanel.endBatchChange();
    };
    BattleDisplay.prototype.updatePathingDisplay = function () {
        this.levelDisplay.clearPathing();
        if (this._battle.animating)
            return;
        var unit = this.battle.selectedUnit;
        if (unit && (unit.canAct() || !this.battle.ownUnitSelected())) {
            if (this.battle.ownUnitSelected()) {
                if (unit.actionsRemaining == 1) {
                    //show pathing in a different color, and only show red on tiles attackable from current position
                    this.levelDisplay.showPathing(unit.pathableTiles, 0xffff00);
                    var attackable = unit.getAttackableTiles(unit.x, unit.y).getComplement(unit.pathableTiles);
                    this.levelDisplay.showPathing(attackable, 0xff0000);
                }
                else {
                    //show everywhere the unit could move, and attackable tiles outside that range
                    this.levelDisplay.showPathing(unit.pathableTiles, 0x0000ff);
                    this.levelDisplay.showPathing(unit.getAttackableNonWalkableTiles(), 0xff0000);
                }
            }
            else {
                //show everywhere this unit could attack
                this.levelDisplay.showPathing(unit.attackableTiles, 0xff0000);
            }
        }
    };
    BattleDisplay.prototype.updatePathingHover = function () {
        this.levelDisplay.clearPath();
        if (this._battle.animating)
            return;
        var x = this.mouseGridX;
        var y = this.mouseGridY;
        if (this.battle.ownUnitSelected()) {
            var unit = this.battle.selectedUnit;
            if (unit.canAct() && (unit.x != x || unit.y != y)) {
                if (unit.canReachTile(x, y)) {
                    this.levelDisplay.showPath(unit.getPathToPosition(x, y));
                }
                else {
                    var tileUnit = this.battle.getUnitAtPosition(x, y);
                    if (tileUnit && unit.isHostileToUnit(tileUnit)) {
                        if (!unit.inRangeToAttack(tileUnit) && unit.actionsRemaining > 1) {
                            var pos = unit.getPositionToAttackUnit(tileUnit);
                            if (pos) {
                                this.levelDisplay.showPath(unit.getPathToPosition(pos[0], pos[1]));
                            }
                        }
                    }
                }
            }
        }
    };
    BattleDisplay.prototype.showTurnBegin = function (callback) {
        var player = this.battle.currentPlayer;
        var str = "Player " + player.id + "\nTurn" + this._battle.turnNumber;
        var text = new PIXI.Text(str, TextUtil.styles.unitID);
        this.addChild(text);
        var width = Game_1.default.instance.stage.width / this.scale.x;
        var height = Game_1.default.instance.stage.height / this.scale.y;
        var targetX = width / 2 - text.width / 2;
        var targetY = height / 2 - text.height / 2;
        text.y = targetY;
        var tween1 = new Tween_1.default().init(text, "x", -text.height, targetX, 0.5, Tween_1.default.easingFunctions.quartEaseOut);
        tween1.onFinish = function () {
            var tween2 = new Tween_1.default().init(text, "x", targetX, width, 0.5, Tween_1.default.easingFunctions.quartEaseIn);
            tween2.onFinish = function () {
                if (text.parent)
                    text.parent.removeChild(text);
                callback();
            };
            tween2.start();
        };
        tween1.start();
    };
    BattleDisplay.prototype.showEndGame = function (callback) {
        var winner = this.battle.winner;
        var str = "Player " + winner.id + " wins!";
        Game_1.default.instance.interfaceRoot.showWarningPopup(str, "Battle Over", callback);
        /*var text = new PIXI.Text(str, TextUtil.styles.unitID);

        this.addChild(text);
        var width = Game.instance.stage.width / this.scale.x;
        var height = Game.instance.stage.height / this.scale.y;
        var targetX = width / 2 - text.width / 2;
        var targetY = height / 2 - text.height / 2;

        text.y = targetY;

        var tween1 = new Tween().init(text, "x", -text.height, targetX, 0.5, Tween.easingFunctions.quartEaseOut);
        tween1.onFinish = () => {
            if (text.parent) text.parent.removeChild(text);
            callback();
        }
        tween1.start();*/
    };
    return BattleDisplay;
}(PIXI.Container));
exports.default = BattleDisplay;

},{"../../Game":1,"../../Globals":2,"../../events/GameEvent":21,"../../interface/AttachInfo":23,"../../interface/ElementList":25,"../../interface/InputManager":26,"../../interface/TextElement":32,"../../util/TextUtil":55,"../../util/Tween":57,"../../util/Vector2D":59}],12:[function(require,module,exports){
"use strict";
/// <reference path="../../declarations/pixi.js.d.ts"/>
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
var Globals_1 = require("../../Globals");
var Game_1 = require("../../Game");
var LevelDisplay = (function (_super) {
    __extends(LevelDisplay, _super);
    function LevelDisplay() {
        var _this = _super.call(this) || this;
        _this.level = null;
        _this.tileSprites = [];
        _this.pathingGraphics = new PIXI.Graphics();
        _this.routeGraphics = new PIXI.Graphics();
        return _this;
    }
    LevelDisplay.prototype.initLevel = function (level) {
        this.level = level;
        this.initTiles();
        if (!this.pathingGraphics.parent)
            this.addChild(this.pathingGraphics);
        if (!this.routeGraphics.parent)
            this.addChild(this.routeGraphics);
    };
    LevelDisplay.prototype.cleanup = function () {
        this.destroy({ children: true });
    };
    LevelDisplay.prototype.showPathing = function (tiles, color, alpha) {
        if (color === void 0) { color = 0x0000ff; }
        if (alpha === void 0) { alpha = 0.3; }
        this.pathingGraphics.beginFill(color, alpha);
        var size = Globals_1.default.gridSize;
        var allCoords = tiles.getAllCoordinates();
        for (var _i = 0, allCoords_1 = allCoords; _i < allCoords_1.length; _i++) {
            var coords = allCoords_1[_i];
            this.pathingGraphics.drawRect(coords[0] * size, coords[1] * size, size, size);
        }
        this.pathingGraphics.endFill();
    };
    LevelDisplay.prototype.clearPathing = function () {
        this.pathingGraphics.clear();
    };
    LevelDisplay.prototype.showPath = function (path, color, alpha) {
        if (color === void 0) { color = 0x000000; }
        if (alpha === void 0) { alpha = 0.3; }
        this.routeGraphics.beginFill(color, alpha);
        var size = Globals_1.default.gridSize;
        for (var _i = 0, path_1 = path; _i < path_1.length; _i++) {
            var coords = path_1[_i];
            this.routeGraphics.drawRect(coords[0] * size, coords[1] * size, size, size);
        }
        this.routeGraphics.endFill();
    };
    LevelDisplay.prototype.clearPath = function () {
        this.routeGraphics.clear();
    };
    //TODO TODO TODO make this not garbage (make a tilemap)
    LevelDisplay.prototype.initTiles = function () {
        for (var _i = 0, _a = this.tileSprites; _i < _a.length; _i++) {
            var sprite = _a[_i];
            this.removeChild(sprite);
            sprite.destroy();
        }
        this.tileSprites = [];
        var width = this.level.width;
        var height = this.level.height;
        for (var y = 0; y < height; y++) {
            for (var x = 0; x < width; x++) {
                var tile = this.level.getTile(x, y);
                var tex = Game_1.default.instance.textureLoader.get(tile.spriteName);
                var sprite = new PIXI.Sprite(tex);
                this.addChild(sprite);
                this.tileSprites.push(sprite);
                sprite.x = x * Globals_1.default.gridSize;
                sprite.y = y * Globals_1.default.gridSize;
            }
        }
    };
    return LevelDisplay;
}(PIXI.Container));
exports.default = LevelDisplay;

},{"../../Game":1,"../../Globals":2}],13:[function(require,module,exports){
"use strict";
/// <reference path="../../declarations/pixi.js.d.ts"/>
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
var Game_1 = require("../../Game");
var Globals_1 = require("../../Globals");
var Tween_1 = require("../../util/Tween");
var GameEvent_1 = require("../../events/GameEvent");
var TracePathInfo = (function () {
    function TracePathInfo() {
        this.timeElapsed = 0;
        this.duration = 0;
        this.callback = null;
    }
    return TracePathInfo;
}());
var UnitDisplay = (function (_super) {
    __extends(UnitDisplay, _super);
    function UnitDisplay() {
        var _this = _super.call(this) || this;
        _this.sprite = null;
        _this.shadowSprite = null;
        _this.hover = false;
        _this.selected = false;
        _this.tracePathInfo = null;
        _this.listenersAdded = false;
        _this.xTween = null;
        _this.yTween = null;
        _this.tweening = false;
        _this.unit = null;
        _this.onAnimation = function (e) {
            if (e.type == GameEvent_1.default.types.battle.ANIMATIONCOMPLETE) {
                _this.updatePosition();
            }
            _this.updateState();
        };
        return _this;
    }
    Object.defineProperty(UnitDisplay.prototype, "battleIsAnimating", {
        get: function () {
            return this.unit && this.unit.battle && this.unit.battle.animating;
        },
        enumerable: true,
        configurable: true
    });
    UnitDisplay.prototype.initUnit = function (unit) {
        this.unit = unit;
        if (this.sprite) {
            if (this.sprite.parent)
                this.sprite.parent.removeChild(this.sprite);
            this.sprite.destroy();
        }
        var texName;
        switch (unit.player.id) {
            case 1:
                texName = "character/rogue";
                break;
            case 2:
                texName = "character/wizard";
                break;
            default: texName = "character/rogue";
        }
        if (!this.shadowSprite) {
            this.shadowSprite = new PIXI.Sprite(Game_1.default.instance.textureLoader.get("character/shadow"));
            this.addChildAt(this.shadowSprite, 0);
            this.shadowSprite.y = -3;
        }
        var tex = Game_1.default.instance.textureLoader.get(texName);
        this.sprite = new PIXI.Sprite(tex);
        this.sprite.x = 0;
        this.sprite.y = -7;
        this.addChild(this.sprite);
        this.updatePosition();
        Game_1.default.instance.updater.add(this, true);
        this.addListeners();
    };
    UnitDisplay.prototype.update = function (timeElapsed) {
        if (!this.tweening) {
            this.updateMovement(timeElapsed);
        }
    };
    UnitDisplay.prototype.tweenTo = function (x, y, duration, easingFunction, callback) {
        var _this = this;
        if (callback === void 0) { callback = null; }
        if (this.xTween)
            this.xTween.stop();
        else
            this.xTween = new Tween_1.default();
        if (this.yTween)
            this.yTween.stop();
        else
            this.yTween = new Tween_1.default();
        this.xTween.init(this.position, "x", this.position.x, x, duration, easingFunction);
        this.yTween.init(this.position, "y", this.position.y, y, duration, easingFunction);
        this.tweening = true;
        this.yTween.onFinish = function () {
            _this.tweening = false;
            callback();
        };
        this.xTween.start();
        this.yTween.start();
    };
    UnitDisplay.prototype.tracePath = function (path, duration, callback) {
        var info = new TracePathInfo();
        info.path = path;
        info.duration = duration;
        info.callback = callback;
        this.tracePathInfo = info;
        //then it's taken care of in update
    };
    UnitDisplay.prototype.updatePosition = function () {
        this.x = this.unit.x * Globals_1.default.gridSize;
        this.y = this.unit.y * Globals_1.default.gridSize;
    };
    /** Just multiplies by grid size but hey */
    UnitDisplay.prototype.getGridPosition = function (gridX, gridY) {
        return [gridX * Globals_1.default.gridSize, gridY * Globals_1.default.gridSize];
    };
    UnitDisplay.prototype.updateActions = function () {
        this.updateState();
    };
    UnitDisplay.prototype.cleanup = function () {
        if (this.parent) {
            this.parent.removeChild(this);
        }
        this.removeListeners();
        this.destroy({ children: true });
    };
    UnitDisplay.prototype.onClick = function () {
        this.unit.select();
    };
    UnitDisplay.prototype.setSelected = function (selected) {
        this.selected = selected;
        this.updateState();
    };
    UnitDisplay.prototype.onMouseOver = function () {
        this.hover = true;
        this.updateState();
    };
    UnitDisplay.prototype.onMouseOut = function () {
        this.hover = false;
        this.updateState();
    };
    UnitDisplay.prototype.updateState = function () {
        var noActions = (this.unit.actionsRemaining == 0);
        if (this.selected && !noActions) {
            this.sprite.tint = 0x00ff00;
        }
        else {
            if (noActions) {
                this.sprite.tint = 0x666666;
            }
            else if (this.hover && !this.battleIsAnimating) {
                this.sprite.tint = 0xaaffaa;
            }
            else {
                this.sprite.tint = 0xffffff;
            }
        }
    };
    UnitDisplay.prototype.updateMovement = function (timeElapsed) {
        if (this.tracePathInfo) {
            var info = this.tracePathInfo;
            info.timeElapsed = Math.min(info.duration, info.timeElapsed + timeElapsed);
            if (info.timeElapsed >= info.duration) {
                var pos = info.path[info.path.length - 1];
                this.setGridPosition(pos[0], pos[1]);
                this.tracePathInfo = null; //done
                if (info.callback) {
                    info.callback();
                }
            }
            else {
                var numCells = info.path.length - 1; //don't include the start cell
                var timePerCell = info.duration / numCells;
                var cellsMoved = Math.floor(info.timeElapsed / timePerCell);
                var progress = (info.timeElapsed - (cellsMoved * timePerCell)) / timePerCell;
                var pos1 = info.path[cellsMoved];
                var pos2 = info.path[cellsMoved + 1];
                var x = pos1[0] + (pos2[0] - pos1[0]) * progress;
                var y = pos1[1] + (pos2[1] - pos1[1]) * progress;
                this.setGridPosition(x, y);
            }
        }
    };
    UnitDisplay.prototype.setGridPosition = function (x, y) {
        x *= Globals_1.default.gridSize;
        y *= Globals_1.default.gridSize;
        this.position.set(x, y);
    };
    UnitDisplay.prototype.addListeners = function () {
        if (this.listenersAdded)
            return;
        this.listenersAdded = true;
        this.unit.battle.addEventListener(GameEvent_1.default.types.battle.ANIMATIONCOMPLETE, this.onAnimation);
        this.unit.battle.addEventListener(GameEvent_1.default.types.battle.ANIMATIONSTART, this.onAnimation);
    };
    UnitDisplay.prototype.removeListeners = function () {
        if (!this.listenersAdded)
            return;
        this.listenersAdded = false;
        this.unit.battle.removeEventListener(GameEvent_1.default.types.battle.ANIMATIONCOMPLETE, this.onAnimation);
        this.unit.battle.removeEventListener(GameEvent_1.default.types.battle.ANIMATIONSTART, this.onAnimation);
    };
    return UnitDisplay;
}(PIXI.Container));
exports.default = UnitDisplay;

},{"../../Game":1,"../../Globals":2,"../../events/GameEvent":21,"../../util/Tween":57}],14:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Timer_1 = require("../../../util/Timer");
var Tween_1 = require("../../../util/Tween");
var Globals_1 = require("../../../Globals");
/**
 * Wraps a function with a callback, to perform long actions in a logical sequence (or multiple sequences).
 * Meant to be chained together.
 */
var Animation = (function () {
    /**
     *
     * @param action A function which accepts a callback to be performed when it has finished. A unit of animation.
     * @param callback Will be called once this and all its descendents have finished.
     * @param maxTime If the action does not fire its callback within this many seconds, go on without it.
     */
    function Animation(action, callback, maxTime) {
        if (callback === void 0) { callback = null; }
        if (maxTime === void 0) { maxTime = 5; }
        this._id = -1;
        this.callback = null;
        this.parent = null;
        this.children = null;
        this.started = false;
        this.actionComplete = false;
        this.numChildrenFinished = 0;
        this.timer = null;
        this._mode = 0; //branching
        this.name = "some animation";
        this._id = Animation.nextId++;
        this.action = action;
        this.callback = callback;
        this.maxTime = maxTime;
    }
    Object.defineProperty(Animation.prototype, "childrenFinished", {
        get: function () { return this.children === null || this.numChildrenFinished >= this.children.length; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Animation.prototype, "finished", {
        get: function () { return this.actionComplete && this.childrenFinished; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Animation.prototype, "id", {
        get: function () { return this._id; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Animation.prototype, "mode", {
        get: function () { return this._mode; },
        set: function (mode) { if (!this.started)
            this._mode = mode; },
        enumerable: true,
        configurable: true
    });
    /**
     * Go! As a convenience, if the parent has not started, starts that instead.
     */
    Animation.prototype.start = function (setCallback) {
        var _this = this;
        if (setCallback === void 0) { setCallback = null; }
        if (this.started)
            return;
        if (this.parent && !this.parent.started) {
            this.parent.start(setCallback);
            return;
        }
        if (setCallback)
            this.callback = setCallback;
        this.started = true;
        var actionCallback = function () {
            _this.onActionComplete();
        };
        this.action(actionCallback);
        if (this.maxTime > 0) {
            this.timer = new Timer_1.default().init(this.maxTime, actionCallback).start();
        }
    };
    /**
     * Sets the animation to be performed after this one, and returns it (not this).
     *
     * NOTE: Doesn't work after calling start
     */
    Animation.prototype.then = function (animation) {
        if (this.started)
            return this;
        if (!this.children)
            this.children = [];
        this.children.push(animation);
        animation.parent = this;
        return animation;
    };
    Animation.prototype.onActionComplete = function () {
        if (this.actionComplete)
            return;
        this.actionComplete = true;
        if (this.timer && this.timer.active) {
            this.timer.stop();
        }
        if (this.children) {
            if (this.mode === Animation.modes.branching) {
                for (var _i = 0, _a = this.children; _i < _a.length; _i++) {
                    var child = _a[_i];
                    child.start();
                }
            }
            else if (this.mode === Animation.modes.sequential) {
                this.children[0].start();
            }
            else {
                console.error("Animation has an invalid mode!");
                console.log(this);
            }
        }
        else {
            this.onFinished();
        }
    };
    Animation.prototype.onChildFinished = function () {
        if (this.childrenFinished)
            return;
        this.numChildrenFinished += 1;
        if (this.childrenFinished) {
            this.onFinished();
        }
        else if (this.mode === Animation.modes.sequential) {
            this.children[this.numChildrenFinished].start();
        }
    };
    Animation.prototype.onFinished = function () {
        if (this.callback)
            this.callback();
        if (this.parent)
            this.parent.onChildFinished();
    };
    Animation.prototype.toString = function () {
        return "Anim " + this.id + " (" + (Math.round(performance.now()) / 1000) + ")";
    };
    //////////////////////////////////////////////////
    // Static convenience constructors
    //////////////////////////////////////////////////
    /** Use this to wrap other animations */
    Animation.noop = function (callback) {
        if (callback === void 0) { callback = null; }
        var action = function (cb) {
            cb();
        };
        var anim = new Animation(action, callback, -1);
        anim.name = "noop";
        return anim;
    };
    Animation.wait = function (duration, callback) {
        if (callback === void 0) { callback = null; }
        var action = function (cb) {
            if (duration > 0)
                var timer = new Timer_1.default().init(duration, cb).start();
            else
                cb();
        };
        var anim = new Animation(action, callback, duration + 0.5);
        anim.name = "wait " + duration;
        return anim;
    };
    Animation.moveUnit = function (unit, path, callback, duration) {
        if (callback === void 0) { callback = null; }
        if (duration === void 0) { duration = -1; }
        if (duration < 0) {
            duration = (path.length - 1) * Globals_1.default.timeToTraverseTile;
        }
        var action = function (cb) {
            if (unit.display) {
                unit.display.tracePath(path, duration, cb);
            }
            else {
                cb();
            }
        };
        var anim = new Animation(action, callback, duration + 0.5);
        anim.name = "move " + unit;
        return anim;
    };
    /** Lunge, do onHit and come back, callback */
    Animation.unitAttack = function (attacker, target, onHit, callback) {
        if (onHit === void 0) { onHit = null; }
        if (callback === void 0) { callback = null; }
        var lunge = Animation.unitLunge(attacker, target, callback);
        var comeBack = Animation.unitReturnToPosition(attacker);
        lunge.then(comeBack);
        if (onHit)
            lunge.then(onHit);
        return lunge;
    };
    Animation.unitLunge = function (unit, target, callback) {
        if (callback === void 0) { callback = null; }
        var d1 = unit.display;
        var d2 = target.display;
        d1.updatePosition();
        d2.updatePosition();
        var action = function (cb) {
            d1.tweenTo(d2.x, d2.y, 0.2, Tween_1.default.easingFunctions.quadEaseIn, function () {
                cb();
            });
        };
        var anim = new Animation(action, callback, 1);
        anim.name = "lunge " + unit + " at " + target;
        return anim;
    };
    Animation.unitReturnToPosition = function (unit, callback) {
        if (callback === void 0) { callback = null; }
        var d = unit.display;
        var pos = d.getGridPosition(unit.x, unit.y);
        var action = function (cb) {
            d.tweenTo(pos[0], pos[1], 0.4, Tween_1.default.easingFunctions.cubeEaseOut, function () {
                cb();
            });
        };
        var anim = new Animation(action, callback, 1);
        anim.name = "return " + unit;
        return anim;
    };
    Animation.unitTakeDamage = function (unit, callback) {
        if (callback === void 0) { callback = null; }
        var d = unit.display;
        var action = function (cb) {
            var tween = new Tween_1.default().init(d, "rotation", 0, Math.PI / 180 * 360, 0.5, Tween_1.default.easingFunctions.quadEaseInOut);
            tween.onFinish = function () {
                d.rotation = 0;
                cb();
            };
            tween.start();
        };
        var anim = new Animation(action, callback, 1);
        anim.name = "damage " + unit;
        return anim;
    };
    Animation.unitDie = function (unit, callback) {
        if (callback === void 0) { callback = null; }
        var d = unit.display;
        var battleDisplay = unit.battle.display;
        var action = function (cb) {
            var tween = new Tween_1.default().init(d, "alpha", 1, 0, 0.5, Tween_1.default.easingFunctions.quadEaseOut);
            tween.onFinish = function () {
                battleDisplay.removeUnitDisplay(d);
                cb();
            };
            tween.start();
        };
        var anim = new Animation(action, callback, 1);
        anim.name = "kill " + unit;
        return anim;
    };
    Animation.nextId = 1;
    Animation.modes = {
        branching: 0,
        sequential: 1
    };
    return Animation;
}());
exports.default = Animation;

},{"../../../Globals":2,"../../../util/Timer":56,"../../../util/Tween":57}],15:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Layout_1 = require("./Layout");
var Dungeon_1 = require("./Dungeon");
var Monster_1 = require("./Monster");
var DefinitionManager = (function () {
    function DefinitionManager() {
        this.allDefinitions = {}; //by type, then by ID
    }
    /**
     * I expect that any def data has an ID, but if not, you can set it here and see how that goes.
     * If no id is set or readable, this will do nothing.
     */
    DefinitionManager.prototype.setDefinition = function (type, data, overwriteExisting, id) {
        if (overwriteExisting === void 0) { overwriteExisting = false; }
        if (id === void 0) { id = -1; }
        if (id == -1 && data.id)
            id = data.id;
        if (id < 1)
            return;
        var defs = this.allDefinitions[type];
        if (!defs) {
            defs = {};
            this.allDefinitions[type] = defs;
        }
        var existing = defs[id];
        if (existing) {
            if (overwriteExisting)
                existing.readData(data);
        }
        else {
            var defClass = DefinitionManager.classesByType[type];
            if (defClass) {
                defs[id] = new defClass();
                defs[id].readData(data);
            }
            else {
                console.log("DefinitionManager: type " + type + " has no associated class");
            }
        }
    };
    DefinitionManager.prototype.getDefinition = function (type, id) {
        var defs = this.allDefinitions[type];
        if (!defs)
            return null;
        var def = defs[id];
        if (def)
            return def;
        return null;
    };
    DefinitionManager.prototype.getMultipleDefs = function (type, ids, includeNull) {
        if (includeNull === void 0) { includeNull = false; }
        var defs = [];
        var typeDefs = this.allDefinitions[type];
        if (!typeDefs)
            typeDefs = {};
        for (var _i = 0, ids_1 = ids; _i < ids_1.length; _i++) {
            var id = ids_1[_i];
            var def = typeDefs[id];
            if (!def) {
                console.warn("DefinitionManager: missing definition " + type + " " + id);
                if (includeNull)
                    defs.push(null);
            }
            else {
                defs.push(def);
            }
        }
        return defs;
    };
    DefinitionManager.classesByType = {
        "layout": Layout_1.default,
        "dungeon": Dungeon_1.default,
        "monster": Monster_1.default
    };
    return DefinitionManager;
}());
exports.default = DefinitionManager;

},{"./Dungeon":16,"./Layout":17,"./Monster":18}],16:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Dungeon = (function () {
    function Dungeon() {
        this.id = -1;
        this.name = "Some Dungeon";
    }
    Dungeon.prototype.readData = function (data) {
        this.id = data.id;
        this.name = data.name;
    };
    return Dungeon;
}());
exports.default = Dungeon;

},{}],17:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Layout = (function () {
    function Layout() {
        this.id = -1;
        this.width = 0;
        this.height = 0;
        this.tiles = [];
    }
    Layout.prototype.readData = function (data) {
        this.id = data.id;
        this.width = data.width;
        this.height = data.height;
        this.parseTiles(data.tiles);
    };
    Layout.prototype.getTileType = function (x, y) {
        if (x < 0 || x >= this.width || y < 0 || y >= this.height)
            return 0;
        var index = this.width * y + x;
        return this.tiles[index];
    };
    Layout.prototype.parseTiles = function (runLength) {
        this.tiles = [];
        for (var i = 0; i < runLength.length; i += 2) {
            var type = runLength[i];
            var num = runLength[i + 1];
            for (var j = 0; j < num; j++) {
                this.tiles.push(type);
            }
        }
    };
    return Layout;
}());
exports.default = Layout;

},{}],18:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Monster = (function () {
    function Monster() {
        this.id = -1;
        this.name = "Monster";
    }
    Monster.prototype.readData = function (data) {
        this.id = data.id;
        this.name = data.name;
    };
    return Monster;
}());
exports.default = Monster;

},{}],19:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * It's a Binary Heap!
 *
 * Shamelessly copied from:
 * https://github.com/yckart/BinaryHeap/blob/master/index.js
 */
var BinaryHeap = (function () {
    function BinaryHeap(scoreFunc, content) {
        if (scoreFunc === void 0) { scoreFunc = null; }
        if (content === void 0) { content = null; }
        if (scoreFunc == null) {
            scoreFunc = function (a) {
                return Number(a);
            };
        }
        this.scoreFunction = scoreFunc;
        this.content = (content) ? content.slice() : [];
        if (this.content.length > 0)
            this.build();
    }
    Object.defineProperty(BinaryHeap.prototype, "size", {
        get: function () { return this.content.length; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(BinaryHeap.prototype, "empty", {
        get: function () { return typeof this.content[0] === "undefined"; },
        enumerable: true,
        configurable: true
    });
    /**
     * Adds an element to the heap.
     * O(log n)
     * Building the heap this way would be O(n log n), so avoid doing that.
     * @param element
     */
    BinaryHeap.prototype.push = function (element) {
        // Add the new element to the end of the array.
        this.content.push(element);
        // Allow it to bubble up.
        return this.bubbleUp(this.content.length - 1);
    };
    /**
     * Use this when adding LOTS of elements. If only a few, pushing is still best.
     * O(n)
     * @param elements
     */
    BinaryHeap.prototype.pushMany = function (elements) {
        this.content = this.content.concat(elements);
        return this.build();
    };
    /**
     * Clears the current content and rebuilds the heap.
     * O(n)
     * @param elements
     */
    BinaryHeap.prototype.rebuild = function (elements) {
        this.content = elements.slice();
        return this.build();
    };
    /**
     * Removes and returns the element with the lowest score (delete-min).
     * O(log n)
     */
    BinaryHeap.prototype.pop = function () {
        // Store the first element so we can return it later.
        var result = this.content[0];
        // Get the element at the end of the array.
        var end = this.content.pop();
        // If there are any elements left, put the end element at the
        // start, and let it sink down.
        if (this.content.length > 0) {
            this.content[0] = end;
            this.sinkDown(0);
        }
        return result;
    };
    /**
     * Gets the element with lowest score.
     * O(1)
     */
    BinaryHeap.prototype.peek = function () {
        return this.content && this.content.length ? this.content[0] : null;
    };
    /**
     * Checks if the element is in this heap.
     * O(n)
     * @param element
     */
    BinaryHeap.prototype.contains = function (element) {
        return this.content.indexOf(element) !== -1;
    };
    /**
     * Gets it outta here.
     * O(log n)
     * @param element
     */
    BinaryHeap.prototype.remove = function (element) {
        var len = this.content.length;
        // To remove a value, we must search
        // through the array to find it.
        for (var i = 0; i < len; i++) {
            if (this.content[i] === element) {
                // When it is found, the process seen in 'pop' is repeated
                // to fill up the hole.
                var end = this.content.pop();
                if (i !== len - 1) {
                    this.content[i] = end;
                    if (this.scoreFunction(end) < this.scoreFunction(element)) {
                        this.bubbleUp(i);
                    }
                    else {
                        this.sinkDown(i);
                    }
                }
                return this;
            }
        }
        return this;
    };
    /**
     * Removes all elements.
     */
    BinaryHeap.prototype.clear = function () {
        this.content = [];
        return this;
    };
    /**
     * Re-sorts assuming the element's value has decreased.
     * O(log n)
     * @param element
     */
    BinaryHeap.prototype.decrease = function (element) {
        return this.sinkDown(this.content.indexOf(element));
    };
    /**
     * Builds the heap with no assumptions about the current order of the content.
     * This is O(n)
     */
    BinaryHeap.prototype.build = function () {
        var i = Math.floor(this.content.length / 2);
        while (i--)
            this.sinkDown(i);
        return this;
    };
    BinaryHeap.prototype.bubbleUp = function (n) {
        // Fetch the element that has to be moved.
        var element = this.content[n];
        // When at 0, an element can not go up any further.
        while (n > 0) {
            // Compute the parent element's index, and fetch it.
            var parentN = Math.floor((n + 1) / 2) - 1;
            var parent = this.content[parentN];
            if (this.scoreFunction(element) < this.scoreFunction(parent)) {
                // Swap the elements if the parent is greater.
                this.content[parentN] = element;
                this.content[n] = parent;
                // Update `n` to continue at the new position.
                n = parentN;
            }
            else {
                // Found a parent that is less, no need to move it further.
                break;
            }
        }
        return this;
    };
    BinaryHeap.prototype.sinkDown = function (n) {
        // Look up the target element and its score.
        var length = this.content.length;
        var element = this.content[n];
        var elemScore = this.scoreFunction(element);
        do {
            // Compute the indices of the child elements.
            var child2N = (n + 1) * 2;
            var child1N = child2N - 1;
            // This is used to store the new position of the element, if any.
            var swap = -1;
            // If the first child exists (is inside the array)...
            if (child1N < length) {
                // Look it up and compute its score.
                var child1 = this.content[child1N];
                var child1Score = this.scoreFunction(child1);
                // If the score is less than our element's, we need to swap.
                if (child1Score < elemScore)
                    swap = child1N;
            }
            // Do the same checks for the other child.
            if (child2N < length) {
                var child2 = this.content[child2N];
                var child2Score = this.scoreFunction(child2);
                if (child2Score < (swap === -1 ? elemScore : child1Score))
                    swap = child2N;
            }
            // If the element needs to be moved, swap it, and continue.
            if (swap !== -1) {
                this.content[n] = this.content[swap];
                this.content[swap] = element;
                n = swap;
            }
        } while (swap !== -1);
        return this;
    };
    return BinaryHeap;
}());
exports.default = BinaryHeap;

},{}],20:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Convenience class for an Object of Objects
 *
 * I understand that JavaScript Arrays are generally implemented as hash tables anyway,
 * but on the off chance some platform is different, use this class instead. Speed will
 * be more or less identical.
 */
var SparseGrid = (function () {
    function SparseGrid(defaultValue) {
        if (defaultValue === void 0) { defaultValue = null; }
        this.rows = {};
        this.defaultValue = defaultValue;
    }
    SparseGrid.prototype.set = function (x, y, value) {
        var row = this.rows[y];
        if (!row) {
            row = {};
            this.rows[y] = row;
        }
        row[x] = value;
    };
    SparseGrid.prototype.get = function (x, y) {
        var row = this.rows[y];
        if (row && row.hasOwnProperty(x.toString())) {
            return row[x];
        }
        return this.defaultValue;
    };
    SparseGrid.prototype.unset = function (x, y) {
        var row = this.rows[y];
        if (row && row.hasOwnProperty(x.toString())) {
            delete row[x];
        }
    };
    SparseGrid.prototype.contains = function (x, y) {
        return this.get(x, y) != this.defaultValue;
    };
    SparseGrid.prototype.getAllCoordinates = function () {
        var allCoords = [];
        for (var y in this.rows) {
            for (var x in this.rows[y]) {
                allCoords.push([Number(x), Number(y)]);
            }
        }
        return allCoords;
    };
    SparseGrid.prototype.clone = function () {
        return this.getUnion(this);
    };
    /** Get a grid containing all the cells from this grid which aren't set in the other grid */
    SparseGrid.prototype.getComplement = function (other) {
        return this.getValueSetInternal(other, SparseGrid.SET_COMPLEMENT);
    };
    /** NOTE: this only really makes sense for boolean grids */
    SparseGrid.prototype.getIntersection = function (other) {
        return this.getValueSetInternal(other, SparseGrid.SET_INTERSECTION);
    };
    /** NOTE: this only really makes sense for boolean grids */
    SparseGrid.prototype.getUnion = function (other) {
        return this.getValueSetInternal(other, SparseGrid.SET_UNION);
    };
    SparseGrid.prototype.filter = function (func) {
        var grid = new SparseGrid(this.defaultValue);
        for (var y in this.rows) {
            var row = this.rows[y];
            for (var x in row) {
                if (func(x, y, row[x])) {
                    grid.set(x, y, row[x]);
                }
            }
        }
        return grid;
    };
    SparseGrid.prototype.getValueSetInternal = function (other, setType) {
        var ret = new SparseGrid(this.defaultValue);
        for (var y in this.rows) {
            var row = this.rows[y];
            for (var x in row) {
                switch (setType) {
                    case SparseGrid.SET_INTERSECTION:
                        if (other.contains(x, y)) {
                            ret.set(x, y, row[x]);
                        }
                        break;
                    case SparseGrid.SET_COMPLEMENT:
                        if (!other.contains(x, y)) {
                            ret.set(x, y, row[x]);
                        }
                        break;
                    case SparseGrid.SET_UNION:
                        ret.set(x, y, row[x]);
                }
            }
        }
        if (setType == SparseGrid.SET_UNION && other !== this) {
            for (var y in other.rows) {
                var row = other.rows[y];
                for (var x in row) {
                    //preserve values from this grid
                    if (!ret.contains(x, y)) {
                        ret.set(x, y, row[x]);
                    }
                }
            }
        }
        return ret;
    };
    SparseGrid.SET_UNION = 0;
    SparseGrid.SET_COMPLEMENT = 1;
    SparseGrid.SET_INTERSECTION = 2;
    return SparseGrid;
}());
exports.default = SparseGrid;

},{}],21:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var GameEvent = (function () {
    /**
     * Get instances via the static getInstance.
     */
    function GameEvent() {
    }
    GameEvent.getInstance = function (type, data, from) {
        if (data === void 0) { data = null; }
        if (from === void 0) { from = null; }
        var instance;
        if (GameEvent._pool.length > 0) {
            instance = GameEvent._pool.pop();
        }
        else {
            instance = new GameEvent();
        }
        instance.init(type, data, from);
        return instance;
    };
    GameEvent.releaseInstance = function (instance) {
        if (GameEvent._pool.length >= GameEvent._maxPooled)
            return;
        GameEvent._pool.push(instance);
    };
    GameEvent.prototype.init = function (type, data, from) {
        this.type = type;
        this.data = data;
        this.from = from;
    };
    GameEvent.types = {
        ui: {
            LEFTMOUSEDOWN: "left mouse down",
            LEFTMOUSEUP: "left mouse up",
            LEFTMOUSECLICK: "left mouse click",
            RIGHTMOUSEDOWN: "right mouse down",
            RIGHTMOUSEUP: "right mouse up",
            RIGHTMOUSECLICK: "right mouse click",
            MOUSEOVER: "mouse over",
            MOUSEOUT: "mouse out",
            FOCUS: "focus",
            UNFOCUS: "unfocus",
            CHANGE: "change",
            KEY: "key",
            TAB: "tab",
            SUBMIT: "submit"
        },
        battle: {
            ANIMATIONSTART: "animation start",
            ANIMATIONCOMPLETE: "animation complete",
            UNITSELECTIONCHANGED: "unit selection changed",
            HOVERCHANGED: "tile hover changed"
        }
    };
    GameEvent._pool = [];
    GameEvent._maxPooled = 10; //in theory there's only ever one event, unless its handlers spawn more
    return GameEvent;
}());
exports.default = GameEvent;

},{}],22:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var GameEvent_1 = require("./GameEvent");
var Util = require("../util/Util");
var GameEventHandler = (function () {
    function GameEventHandler() {
        this._listenersByType = {};
        this.subscribers = [];
    }
    GameEventHandler.prototype.addEventListener = function (eventType, listener) {
        var listeners = this._listenersByType[eventType];
        if (!listeners) {
            listeners = [];
            this._listenersByType[eventType] = listeners;
        }
        else if (listeners.indexOf(listener) >= 0) {
            console.log("GameEventDispatcher: Not adding duplicate listener of type " + eventType);
            return;
        }
        listeners.push(listener);
    };
    GameEventHandler.prototype.removeEventListener = function (eventType, listener) {
        var listeners = this._listenersByType[eventType];
        if (!listeners) {
            return;
        }
        var index = listeners.indexOf(listener);
        if (index === -1) {
            console.log("GameEventDispatcher: Can't remove listener that doesn't exist, type " + eventType);
        }
        else {
            listeners.splice(index, 1);
        }
    };
    GameEventHandler.prototype.removeAllEventListeners = function () {
        for (var type in this._listenersByType) {
            this._listenersByType[type].splice(0); //clears list
            delete this._listenersByType[type];
        }
    };
    GameEventHandler.prototype.sendNewEvent = function (type, data) {
        if (data === void 0) { data = null; }
        this.sendEvent(GameEvent_1.default.getInstance(type, data, this));
    };
    /**
     * NOTE: the event will be released after this call.
     * Also, does not set the "from" property of the event. Good for propagating.
     */
    GameEventHandler.prototype.sendEvent = function (event) {
        var listeners = this._listenersByType[event.type];
        if (listeners) {
            for (var _i = 0, listeners_1 = listeners; _i < listeners_1.length; _i++) {
                var listener = listeners_1[_i];
                listener(event);
            }
        }
        for (var _a = 0, _b = this.subscribers; _a < _b.length; _a++) {
            var subscriber = _b[_a];
            subscriber.sendEvent(event);
        }
        GameEvent_1.default.releaseInstance(event);
    };
    /**
     * Causes all events sent by the other GameEventHandler to be propagated by this one.
     */
    GameEventHandler.prototype.subscribeTo = function (other) {
        Util.ArrayAdd(other.subscribers, this);
    };
    GameEventHandler.prototype.unsubscribeFrom = function (other) {
        Util.ArrayRemove(other.subscribers, this);
    };
    return GameEventHandler;
}());
exports.default = GameEventHandler;

},{"../util/Util":58,"./GameEvent":21}],23:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Vector2D_1 = require("../util/Vector2D");
var AttachInfo = (function () {
    /**
     *
     * @param from Point on this object, defined as a factor of its dimensions
     * @param to Point on the other object, defined as a factor of its dimensions
     * @param offset Pixel offset for the object being attached
     */
    function AttachInfo(from, to, offset) {
        this.from = from;
        this.to = to;
        this.offset = offset;
    }
    AttachInfo.prototype.clone = function () {
        return new AttachInfo(this.from.clone(), this.to.clone(), this.offset.clone());
    };
    /**
     * Gets a copy of this AttachInfo, with x and y added to its offset
     * @param x
     * @param y
     */
    AttachInfo.prototype.withOffset = function (x, y) {
        var info = this.clone();
        info.offset.x += x;
        info.offset.y += y;
        return info;
    };
    AttachInfo.TLtoTL = new AttachInfo(new Vector2D_1.default(0, 0), new Vector2D_1.default(0, 0), new Vector2D_1.default(0, 0));
    AttachInfo.TLtoTR = new AttachInfo(new Vector2D_1.default(0, 0), new Vector2D_1.default(1, 0), new Vector2D_1.default(0, 0));
    AttachInfo.TLtoBL = new AttachInfo(new Vector2D_1.default(0, 0), new Vector2D_1.default(0, 1), new Vector2D_1.default(0, 0));
    AttachInfo.TRtoTR = new AttachInfo(new Vector2D_1.default(1, 0), new Vector2D_1.default(1, 0), new Vector2D_1.default(0, 0));
    AttachInfo.BLtoBL = new AttachInfo(new Vector2D_1.default(0, 1), new Vector2D_1.default(0, 1), new Vector2D_1.default(0, 0));
    AttachInfo.BRtoBR = new AttachInfo(new Vector2D_1.default(1, 1), new Vector2D_1.default(1, 1), new Vector2D_1.default(0, 0));
    AttachInfo.Center = new AttachInfo(new Vector2D_1.default(0.5, 0.5), new Vector2D_1.default(0.5, 0.5), new Vector2D_1.default(0, 0));
    AttachInfo.TopCenter = new AttachInfo(new Vector2D_1.default(0.5, 0), new Vector2D_1.default(0.5, 0), new Vector2D_1.default(0, 0));
    AttachInfo.BottomCenter = new AttachInfo(new Vector2D_1.default(0.5, 1), new Vector2D_1.default(0.5, 1), new Vector2D_1.default(0, 0));
    AttachInfo.RightCenter = new AttachInfo(new Vector2D_1.default(1, 0.5), new Vector2D_1.default(1, 0.5), new Vector2D_1.default(0, 0));
    AttachInfo.LeftCenter = new AttachInfo(new Vector2D_1.default(0, 0.5), new Vector2D_1.default(0, 0.5), new Vector2D_1.default(0, 0));
    return AttachInfo;
}());
exports.default = AttachInfo;

},{"../util/Vector2D":59}],24:[function(require,module,exports){
"use strict";
/// <reference path="../declarations/pixi.js.d.ts"/>
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
var InterfaceElement_1 = require("./InterfaceElement");
var GameEvent_1 = require("../events/GameEvent");
var NineSliceSprite_1 = require("../textures/NineSliceSprite");
var BaseButton = (function (_super) {
    __extends(BaseButton, _super);
    /**
     * It's a button! Click it!
     * Use the LEFTMOUSECLICK event to listen for clicks.
     */
    function BaseButton(width, height, appearance, scaleSprites) {
        if (scaleSprites === void 0) { scaleSprites = false; }
        var _this = _super.call(this) || this;
        _this._state = -1;
        _this.scaleSprites = false;
        _this.onMouseOver = function (e) {
            if (_this.enabled) {
                _this.setHighlight();
            }
        };
        _this.onMouseOut = function (e) {
            if (_this.enabled) {
                _this.setNormal();
            }
        };
        _this.onLeftMouseClick = function (e) {
            //TODO: sound?
        };
        _this._className = "BaseButton";
        _this._debugColor = 0xff66ff;
        _this.clickable = true;
        _this.scaleSprites = scaleSprites;
        _this.sprites = [appearance.normal, appearance.highlight, appearance.disabled];
        _this.setNormal();
        _this.resize(width, height);
        _this.addEventListeners();
        return _this;
    }
    BaseButton.prototype.resize = function (width, height) {
        for (var _i = 0, _a = this.sprites; _i < _a.length; _i++) {
            var sprite = _a[_i];
            if (sprite instanceof NineSliceSprite_1.default) {
                sprite.setSize(width, height);
            }
            else if (this.scaleSprites) {
                sprite.width = width;
                sprite.height = height;
            }
        }
        _super.prototype.resize.call(this, width, height);
    };
    Object.defineProperty(BaseButton.prototype, "enabled", {
        get: function () {
            return this._state != BaseButton.STATE_DISABLED;
        },
        set: function (enabled) {
            if (enabled) {
                this.setNormal();
            }
            else {
                this.setDisabled();
            }
        },
        enumerable: true,
        configurable: true
    });
    BaseButton.prototype.addEventListeners = function () {
        this.addEventListener(GameEvent_1.default.types.ui.MOUSEOVER, this.onMouseOver);
        this.addEventListener(GameEvent_1.default.types.ui.MOUSEOUT, this.onMouseOut);
        this.addEventListener(GameEvent_1.default.types.ui.LEFTMOUSECLICK, this.onLeftMouseClick);
    };
    BaseButton.prototype.removeEventListeners = function () {
        this.removeEventListener(GameEvent_1.default.types.ui.MOUSEOVER, this.onMouseOver);
        this.removeEventListener(GameEvent_1.default.types.ui.MOUSEOUT, this.onMouseOut);
        this.removeEventListener(GameEvent_1.default.types.ui.LEFTMOUSECLICK, this.onLeftMouseClick);
    };
    BaseButton.prototype.setNormal = function () {
        this.setState(BaseButton.STATE_NORMAL);
    };
    BaseButton.prototype.setHighlight = function () {
        this.setState(BaseButton.STATE_HIGHLIGHT);
    };
    BaseButton.prototype.setDisabled = function () {
        this.setState(BaseButton.STATE_DISABLED);
    };
    BaseButton.prototype.setState = function (state) {
        if (state === this._state)
            return;
        var currentSprite = this.sprites[this._state];
        if (currentSprite && currentSprite.parent)
            currentSprite.parent.removeChild(currentSprite);
        this._state = state;
        var newSprite = this.sprites[state];
        if (newSprite)
            this._displayObject.addChildAt(newSprite, 0);
    };
    BaseButton.STATE_NORMAL = 0;
    BaseButton.STATE_HIGHLIGHT = 1;
    BaseButton.STATE_DISABLED = 2;
    return BaseButton;
}(InterfaceElement_1.default));
exports.default = BaseButton;

},{"../events/GameEvent":21,"../textures/NineSliceSprite":45,"./InterfaceElement":27}],25:[function(require,module,exports){
"use strict";
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
/// <reference path="../declarations/pixi.js.d.ts"/>
var InterfaceElement_1 = require("./InterfaceElement");
var ElementList = (function (_super) {
    __extends(ElementList, _super);
    function ElementList(width, orientation, padding, align) {
        if (orientation === void 0) { orientation = ElementList.VERTICAL; }
        if (padding === void 0) { padding = 5; }
        if (align === void 0) { align = ElementList.LEFT; }
        var _this = _super.call(this) || this;
        _this._childBounds = [];
        _this._childPadding = [];
        _this._inBatchChange = false;
        _this._debugColor = 0xffff00;
        _this._orientation = orientation;
        _this._padding = padding;
        _this._alignment = align;
        _this._className = "ElementList";
        if (orientation == ElementList.VERTICAL) {
            _this._width = width;
        }
        else {
            _this._height = width;
        }
        return _this;
    }
    /** When adding multiple elements at once, call this first to prevent wasteful rearranging */
    ElementList.prototype.beginBatchChange = function () {
        this._inBatchChange = true;
    };
    /** Call after adding elements following beginBatchChange() */
    ElementList.prototype.endBatchChange = function () {
        if (!this._inBatchChange) {
            return;
        }
        this._inBatchChange = false;
        this.redoLayout();
    };
    ElementList.prototype.addChild = function (child, extraPadding, redoLayout) {
        if (extraPadding === void 0) { extraPadding = 0; }
        if (redoLayout === void 0) { redoLayout = true; }
        _super.prototype.addChild.call(this, child);
        this._childBounds.push(0);
        this._childPadding.push(this._padding + extraPadding);
        if (redoLayout && !this._inBatchChange) {
            this.redoLayout(child);
        }
    };
    ElementList.prototype.addChildAt = function (child, index, extraPadding, redoLayout) {
        if (extraPadding === void 0) { extraPadding = 0; }
        if (redoLayout === void 0) { redoLayout = true; }
        _super.prototype.addChildAt.call(this, child, index);
        this._childBounds.push(0);
        this._childPadding.splice(index, 0, extraPadding);
        if (redoLayout && !this._inBatchChange) {
            this.redoLayout(child);
        }
    };
    ElementList.prototype.removeChild = function (child) {
        var index = this._children.indexOf(child);
        _super.prototype.removeChild.call(this, child);
        if (index != -1 && index < this._children.length) {
            this._childBounds.pop();
            if (!this._inBatchChange) {
                this.redoLayout(this._children[index]);
            }
        }
    };
    ElementList.prototype.redoLayout = function (fromChild) {
        if (fromChild === void 0) { fromChild = null; }
        var index = -1;
        if (fromChild == null && this._children.length > 0) {
            index = 0;
        }
        else if (fromChild != null) {
            index = this._children.indexOf(fromChild);
        }
        if (index == -1)
            return;
        var offset = 0;
        var child;
        if (index > 0)
            offset = this._childBounds[index - 1];
        for (; index < this._children.length; index++) {
            child = this._children[index];
            if (this._orientation == ElementList.VERTICAL) {
                child.y = offset;
                offset += child.height + this._childPadding[index];
                switch (this._alignment) {
                    case ElementList.LEFT:
                        child.x = 0;
                        break;
                    case ElementList.RIGHT:
                        child.x = this.width - child.width;
                        break;
                    case ElementList.CENTRE:
                        child.x = (this.width - child.width) / 2;
                        break;
                }
            }
            else {
                child.x = offset;
                offset += child.width + this._childPadding[index];
                switch (this._alignment) {
                    case ElementList.TOP:
                        child.y = 0;
                        break;
                    case ElementList.BOTTOM:
                        child.y = this.height - child.height;
                        break;
                    case ElementList.CENTRE:
                        child.y = (this.height - child.height) / 2;
                        break;
                }
            }
            this._childBounds[index] = offset;
        }
        var length = 0;
        if (this._children.length > 0) {
            var startElement = this._children[0];
            var endElement = this._children[this._children.length - 1];
            if (this._orientation == ElementList.VERTICAL) {
                length = (endElement.y + endElement.height) - startElement.y;
            }
            else {
                length = (endElement.x + endElement.width) - startElement.x;
            }
        }
        if (this._orientation == ElementList.VERTICAL) {
            this._height = length;
        }
        else {
            this._width = length;
        }
        this.onResize(false); //don't tell children that this has resized
    };
    ElementList.HORIZONTAL = 0;
    ElementList.VERTICAL = 1;
    ElementList.NONE = -1;
    ElementList.LEFT = 0;
    ElementList.TOP = ElementList.LEFT;
    ElementList.RIGHT = 1;
    ElementList.BOTTOM = ElementList.RIGHT;
    ElementList.CENTRE = 2;
    return ElementList;
}(InterfaceElement_1.default));
exports.default = ElementList;

},{"./InterfaceElement":27}],26:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/// <reference path="../declarations/jquery.d.ts"/>
var Vector2D_1 = require("../util/Vector2D");
var Game_1 = require("../Game");
var GameEvent_1 = require("../events/GameEvent");
/**
 * Wrangles all them silly events and suchlike.
 * Doing anything in the game proper should be relegated to a different class (probably?)
 *
 * Singleton!
 */
var InputManager = (function () {
    function InputManager() {
        var _this = this;
        this.dragThreshold = 8;
        this._initialized = false;
        this._mouseCoords = new Vector2D_1.default(0, 0);
        this._leftMouseDownCoords = null;
        this._leftMouseDownElement = null;
        this._rightMouseDownCoords = null;
        this._rightMouseDownElement = null;
        this._hoverElement = null;
        this._focusElement = null;
        this._trackedKeys = {
            "SHIFT": false,
            "CTRL": false,
            "ALT": false,
            "UP": false,
            "DOWN": false,
            "LEFT": false,
            "RIGHT": false
        };
        this._onMouseDown = function (e) {
            var coords = _this.getMouseCoords(e, true);
            var element = Game_1.default.instance.interfaceRoot.getElementAtPoint(coords);
            if (element)
                console.log("CLICK " + element.fullName);
            switch (e.which) {
                case 1:
                    //left
                    _this._leftMouseDownCoords = coords;
                    _this._leftMouseDownElement = element;
                    if (element) {
                        _this.focus(element);
                        element.sendNewEvent(GameEvent_1.default.types.ui.LEFTMOUSEDOWN);
                    }
                    else {
                        Game_1.default.instance.onLeftClick(coords.clone());
                    }
                    break;
                case 2:
                    //middle
                    break;
                case 3:
                    //right
                    _this._rightMouseDownCoords = coords;
                    _this._rightMouseDownElement = element;
                    if (element) {
                        _this.focus(element);
                        element.sendNewEvent(GameEvent_1.default.types.ui.RIGHTMOUSEDOWN);
                    }
                    else {
                        Game_1.default.instance.onRightClick(coords.clone());
                    }
                    break;
                default:
                    console.warn("InputManager: mouse input with which=" + e.which + "?");
            }
        };
        this._onMouseUp = function (e) {
            var coords = _this.getMouseCoords(e, true);
            var element = Game_1.default.instance.interfaceRoot.getElementAtPoint(coords);
            switch (e.which) {
                case 1:
                    //left
                    if (element) {
                        /*if (element.onMouseUp) element.onMouseUp(coords);
                        if (element.onClick && element == this._leftMouseDownElement) element.onClick(coords);*/
                        element.sendNewEvent(GameEvent_1.default.types.ui.LEFTMOUSEUP);
                        if (element == _this._leftMouseDownElement)
                            element.sendNewEvent(GameEvent_1.default.types.ui.LEFTMOUSECLICK);
                    }
                    _this._leftMouseDownCoords = null;
                    _this._leftMouseDownElement = null;
                    break;
                case 2:
                    //middle
                    break;
                case 3:
                    //right
                    break;
                default:
                    console.warn("InputManager: mouse input with which = " + e.which + "?");
            }
        };
        this._onMouseMove = function (e) {
            var coords = _this.getMouseCoords(e, true);
            var element = Game_1.default.instance.interfaceRoot.getElementAtPoint(coords);
            if (_this.leftMouseDown && coords.distanceTo(_this._leftMouseDownCoords) > _this.dragThreshold)
                _this.beginDrag();
            //TODO: check whether we're about to drag it?
            if (_this._hoverElement != element) {
                if (element) {
                    element.sendNewEvent(GameEvent_1.default.types.ui.MOUSEOVER);
                }
                if (_this._hoverElement) {
                    _this._hoverElement.sendNewEvent(GameEvent_1.default.types.ui.MOUSEOUT);
                }
            }
            //TODO: update dragged element
            _this._hoverElement = element;
        };
        this._onMouseScroll = function (e) {
        };
        this._onMouseLeave = function (e) {
            _this._leftMouseDownCoords = null;
            _this._leftMouseDownElement = null;
        };
        this._onKeyDown = function (e) {
            var key = _this.getKeyString(e);
            if (_this._focusElement) {
                //this._focusElement.sendNewEvent(GameEvent.types.ui.KEY, key);
                if (key.length > 1)
                    _this._focusElement.sendNewEvent(GameEvent_1.default.types.ui.KEY, key);
            }
            if (_this._trackedKeys.hasOwnProperty(key)) {
                _this._trackedKeys[key] = true;
            }
            if (preventedKeys.indexOf(e.which) != -1) {
                e.preventDefault();
            }
        };
        this._onKeyUp = function (e) {
            var key = _this.getKeyString(e);
            if (_this._trackedKeys.hasOwnProperty(key)) {
                _this._trackedKeys[key] = false;
            }
        };
        this._onKeyPress = function (e) {
            if (_this._focusElement) {
                _this._focusElement.sendNewEvent(GameEvent_1.default.types.ui.KEY, e.key);
            }
            Game_1.default.instance.sendNewEvent(GameEvent_1.default.types.ui.KEY, e.key);
            if (preventedKeys.indexOf(e.which) != -1) {
                e.preventDefault();
            }
        };
        if (InputManager._instance) {
            console.error("InputManager: hey, this is a singleton!");
        }
    }
    Object.defineProperty(InputManager, "instance", {
        get: function () {
            return InputManager._instance;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(InputManager.prototype, "leftMouseDown", {
        get: function () { return this._leftMouseDownCoords != null; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(InputManager.prototype, "focusedElement", {
        get: function () { return this._focusElement; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(InputManager.prototype, "mouseCoords", {
        get: function () { return this._mouseCoords; },
        enumerable: true,
        configurable: true
    });
    InputManager.prototype.init = function (selector) {
        if (this._initialized)
            return;
        this._initialized = true;
        this._div = $(selector);
        if (!this._div) {
            console.error("InputManager: no element found!");
        }
        this._div.mousedown(this._onMouseDown);
        this._div.mouseup(this._onMouseUp);
        this._div.mousemove(this._onMouseMove);
        this._div.scroll(this._onMouseScroll);
        this._div.mouseleave(this._onMouseLeave);
        $(window).keydown(this._onKeyDown);
        $(window).keyup(this._onKeyUp);
        $(window).keypress(this._onKeyPress);
        //disable right click context menu
        this._div.contextmenu(function (e) {
            e.stopPropagation();
            return false;
        });
    };
    InputManager.prototype.focus = function (element) {
        if (element != this._focusElement) {
            if (this._focusElement) {
                this._focusElement.sendNewEvent(GameEvent_1.default.types.ui.UNFOCUS);
            }
            this._focusElement = element;
            if (element) {
                console.log("InputManager: Focus " + element.fullName);
                element.sendNewEvent(GameEvent_1.default.types.ui.FOCUS);
            }
            else {
                console.log("InputManager: No element focused");
            }
        }
    };
    InputManager.prototype.isKeyDown = function (key) {
        key = key.toUpperCase();
        if (this._trackedKeys.hasOwnProperty(key) && this._trackedKeys[key])
            return true;
        return false;
    };
    InputManager.prototype.beginDrag = function () {
    };
    InputManager.prototype.getKeyString = function (e) {
        var name = keyNames[e.which.toString()];
        if (name)
            return name;
        return String.fromCharCode(e.which);
    };
    InputManager.prototype.getMouseCoords = function (e, set) {
        if (set === void 0) { set = false; }
        var offset = this._div.offset();
        var coords = new Vector2D_1.default(e.pageX - offset.left, e.pageY - offset.top);
        if (set)
            this._mouseCoords = coords;
        return coords;
    };
    InputManager._instance = new InputManager();
    return InputManager;
}());
exports.default = InputManager;
var preventedKeys = [8, 9, 13, 16, 17, 18, 37, 38, 39, 40];
var keyNames = {
    "8": "BACKSPACE",
    "9": "TAB",
    "13": "ENTER",
    "16": "SHIFT",
    "17": "CTRL",
    "18": "ALT",
    "38": "UP",
    "40": "DOWN",
    "37": "LEFT",
    "39": "RIGHT"
};

},{"../Game":1,"../events/GameEvent":21,"../util/Vector2D":59}],27:[function(require,module,exports){
"use strict";
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
/// <reference path="../declarations/pixi.js.d.ts"/>
var Vector2D_1 = require("../util/Vector2D");
var ResizeInfo_1 = require("./ResizeInfo");
var InputManager_1 = require("./InputManager");
var Game_1 = require("../Game");
var GameEventHandler_1 = require("../events/GameEventHandler");
var InterfaceElement = (function (_super) {
    __extends(InterfaceElement, _super);
    /**
     * Base class for anything in the UI. Has a parent and can have children, like DOM elements.
     * Wraps a PIXI DisplayObjectContainer.
     *
     * @param fromContainer If provided, fromContainer is used instead of a new Container. Whatever it contains has no bearing on the InterfaceElement's concept of having children.
     */
    function InterfaceElement(fromContainer) {
        if (fromContainer === void 0) { fromContainer = null; }
        var _this = _super.call(this) || this;
        _this.id = "";
        _this.name = "";
        _this.clickable = false;
        _this.draggable = false;
        _this.useOwnBounds = true; //instead of the container's bounds, use the rect defined by own x,y,width,height
        _this.ignoreChildrenForClick = false; //don't click the kids, click me
        _this.dragElement = null;
        _this.useDebugRect = true;
        _this._parent = null;
        _this._children = [];
        _this._position = new Vector2D_1.default(0, 0);
        _this._width = 0;
        _this._height = 0;
        _this._attach = null;
        _this._resize = null;
        _this._className = "InterfaceElement";
        _this._debugColor = 0xffffff;
        if (fromContainer) {
            _this._displayObject = fromContainer;
            _this.resize(fromContainer.width, fromContainer.height);
        }
        else {
            _this._displayObject = new PIXI.Container();
        }
        return _this;
    }
    Object.defineProperty(InterfaceElement.prototype, "x", {
        // === GET ===
        get: function () { return this._position.x; },
        set: function (x) { this._position.x = x; this.updateDisplayObjectPosition(); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(InterfaceElement.prototype, "y", {
        get: function () { return this._position.y; },
        set: function (y) { this._position.y = y; this.updateDisplayObjectPosition(); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(InterfaceElement.prototype, "position", {
        get: function () { return this._position; },
        //=== SET ===
        set: function (pos) { this._position.set(pos); this.updateDisplayObjectPosition(); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(InterfaceElement.prototype, "width", {
        get: function () { return this._width; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(InterfaceElement.prototype, "height", {
        get: function () { return this._height; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(InterfaceElement.prototype, "displayObject", {
        get: function () { return this._displayObject; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(InterfaceElement.prototype, "children", {
        get: function () { return this._children.slice(); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(InterfaceElement.prototype, "numChildren", {
        get: function () { return this._children.length; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(InterfaceElement.prototype, "fullName", {
        get: function () {
            var s = this._className;
            if (this.id != "")
                s += " #" + this.id;
            if (this.name != "")
                s += " \"" + this.name + "\"";
            if (this.draggable)
                s += " (draggable)";
            if (!this.clickable)
                s += " (not clickable)";
            return s;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(InterfaceElement.prototype, "isRoot", {
        get: function () { return this._parent == null && this._displayObject.parent != null; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(InterfaceElement.prototype, "isFocused", {
        get: function () { return InputManager_1.default.instance.focusedElement == this; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(InterfaceElement.prototype, "visible", {
        get: function () { return this._displayObject.visible; },
        set: function (v) { this._displayObject.visible = v; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(InterfaceElement.prototype, "parent", {
        get: function () { return this._parent; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(InterfaceElement.prototype, "maskSprite", {
        set: function (m) { this._displayObject.mask = m; },
        enumerable: true,
        configurable: true
    });
    InterfaceElement.prototype.getBounds = function () {
        return new PIXI.Rectangle(this.x, this.y, this.width, this.height);
    };
    InterfaceElement.prototype.getElementAtPoint = function (point) {
        var element = null;
        var checkChildren = this.isRoot;
        if (!checkChildren) {
            var bounds;
            if (this.useOwnBounds) {
                //note: this assumes that children are all within the bounds of this object
                var pos = this.getGlobalPosition();
                bounds = new PIXI.Rectangle(pos.x, pos.y, this._width, this._height);
            }
            else {
                bounds = this._displayObject.getBounds();
            }
            checkChildren = bounds.contains(point.x, point.y);
            if (checkChildren && this.ignoreChildrenForClick) {
                return this;
            }
        }
        if (checkChildren) {
            //Work backwards. Most recently added children are on top.
            for (var i = this._children.length - 1; i >= 0; i--) {
                element = this._children[i].getElementAtPoint(point);
                if (element != null) {
                    break;
                }
            }
            if (element == null && this.clickable) {
                element = this;
            }
        }
        return element;
    };
    InterfaceElement.prototype.getElementById = function (id, maxChecks) {
        if (maxChecks === void 0) { maxChecks = 1000; }
        if (this.id == id)
            return this;
        return this.getElementByFunction(function (e) {
            return e.id == id;
        });
    };
    /** Returns the given element, if it's a descendent of this (or is this) */
    InterfaceElement.prototype.getElement = function (e) {
        if (this == e)
            return this; //derp
        return this.getElementByFunction(function (e2) {
            return e2 == e;
        });
    };
    InterfaceElement.prototype.getChildAt = function (index) {
        if (this.numChildren > index) {
            return this._children[index];
        }
        return null;
    };
    InterfaceElement.prototype.getLastChild = function () {
        return this.getChildAt(this.numChildren - 1);
    };
    //BFS, always call from the lowest known ancestor
    //Hey kid, don't make cyclical structures. I'm putting maxChecks here anyway, just in case.
    InterfaceElement.prototype.getElementByFunction = function (func, maxChecks) {
        if (maxChecks === void 0) { maxChecks = 500; }
        if (func(this))
            return this;
        var toCheck = [this];
        var element;
        var child;
        var len;
        var i;
        while (toCheck.length > 0 && maxChecks > 0) {
            element = toCheck.shift();
            len = element._children.length;
            for (i = 0; i < len; i++) {
                child = element._children[i];
                if (func(child))
                    return child;
                toCheck.push(child);
            }
            maxChecks -= 1;
        }
        if (maxChecks <= 400)
            console.warn("Wasting cycles on InterfaceElement.getElementById");
        else if (maxChecks == 0)
            console.warn("Wasting LOTS of cycles on InterfaceElement.getElementById");
        return null;
    };
    InterfaceElement.prototype.draw = function () {
        if (this.isRoot)
            InterfaceElement.drawTime = Date.now();
        if (!this.visible)
            return; //this could cause problems?
        var len = this._children.length;
        for (var i = 0; i < len; i++) {
            this._children[i].draw();
        }
        if (Game_1.default.useDebugGraphics && this.useDebugRect) {
            var global = this.getGlobalPosition();
            Game_1.default.instance.debugGraphics.lineStyle(1, this._debugColor, 1);
            Game_1.default.instance.debugGraphics.drawRect(global.x, global.y, this._width, this._height);
        }
    };
    InterfaceElement.prototype.resize = function (width, height) {
        this._width = width;
        this._height = height;
        this.onResize();
    };
    InterfaceElement.prototype.resizeToFitChildren = function () {
        var w = 0;
        var h = 0;
        for (var _i = 0, _a = this._children; _i < _a.length; _i++) {
            var child = _a[_i];
            if (child.width > w)
                w = child.width;
            if (child.height > h)
                h = child.height;
        }
        this.resize(w, h);
    };
    InterfaceElement.prototype.addChild = function (child) {
        this._children.push(child);
        this._displayObject.addChild(child._displayObject);
        child._parent = this;
        child.onAdd();
    };
    InterfaceElement.prototype.addChildAt = function (child, index) {
        if (index === void 0) { index = -1; }
        if (index < 0 || index > this._children.length) {
            this.addChild(child);
            return;
        }
        this._children.splice(index, 0, child);
        this._displayObject.addChildAt(child._displayObject, index);
        child.onAdd();
    };
    /**
     * Subclasses should use this to add listeners if needed
     */
    InterfaceElement.prototype.onAdd = function () {
    };
    /**
     * Subclasses should use this to remove their listeners.
     */
    InterfaceElement.prototype.onRemove = function (fromParent) {
    };
    /**
     * Necessary for cleaning up WebGL memory. If this element isn't going to be used anymore, call this.
     * Called recursively on chldren.
     */
    InterfaceElement.prototype.destroy = function () {
        for (var _i = 0, _a = this._children; _i < _a.length; _i++) {
            var child = _a[_i];
            child.destroy();
        }
        if (this._parent) {
            this.removeSelf(false); //no need to recurse from there, since this already does so
        }
        //base class has no PIXI stuff to destroy (right?)
        this.displayObject.destroy();
    };
    InterfaceElement.prototype.removeChild = function (child, recurse) {
        if (recurse === void 0) { recurse = false; }
        var index = this._children.indexOf(child);
        if (index === -1)
            return;
        this._children.splice(index, 1);
        this._displayObject.removeChild(child._displayObject);
        child._parent = null;
        child.detachFromParent();
        child.disableResizeToParent();
        if (recurse) {
            while (child._children.length > 0) {
                child.removeChild(child._children[child._children.length - 1], true);
            }
        }
        child.onRemove(this);
    };
    /**
     * Removes this element from its parent
     */
    InterfaceElement.prototype.removeSelf = function (recurse) {
        if (recurse === void 0) { recurse = true; }
        if (this._parent != null)
            this._parent.removeChild(this, recurse);
    };
    InterfaceElement.prototype.moveChildToTop = function (child) {
        this.removeChild(child);
        this.addChild(child);
    };
    InterfaceElement.prototype.attachToParent = function (info) {
        this._attach = info;
        this.positionRelativeTo(this._parent, info);
    };
    InterfaceElement.prototype.detachFromParent = function () {
        this._attach = null;
    };
    /**
     *
     * @param info If null, fills the parent completely
     */
    InterfaceElement.prototype.resizeToParent = function (info) {
        if (info === void 0) { info = null; }
        if (info == null)
            info = ResizeInfo_1.default.get(1, 1, 0, 0);
        this._resize = info;
        this.onParentResize();
    };
    InterfaceElement.prototype.disableResizeToParent = function () {
        this._resize = null;
    };
    InterfaceElement.prototype.positionRelativeTo = function (other, info) {
        this._position.x = (other._width * info.to.x) - (this.width * info.from.x) + info.offset.x + other.x;
        this._position.y = (other._height * info.to.y) - (this.height * info.from.y) + info.offset.y + other.y;
        if (other != this._parent && other._parent != this._parent) {
            //need to account for different contexts
            var thisGlobal = this.getGlobalPosition();
            var otherGlobal = other.getGlobalPosition();
            thisGlobal.sub(this._position);
            otherGlobal.sub(other._position);
            //add the difference in base global position
            var globalDiff = otherGlobal;
            globalDiff.sub(thisGlobal);
            this._position.add(globalDiff);
        }
        //console.log(this.fullName + " position with " + JSON.stringify(info) + ": " + JSON.stringify(this._position));
        this.position = this._position;
    };
    InterfaceElement.prototype.setAttachOffset = function (x, y) {
        if (!this._attach)
            return;
        this._attach.offset.x = x;
        this._attach.offset.y = y;
        this.onParentResize(); //cheaty? or just a naming problem
    };
    InterfaceElement.prototype.clearMask = function () {
        this._displayObject.mask = null;
    };
    InterfaceElement.prototype.getGlobalPosition = function () {
        var pos = this._position.clone();
        var parent = this._parent;
        while (parent != null) {
            pos.add(parent._position);
            parent = parent._parent;
        }
        return pos;
    };
    InterfaceElement.prototype.updateDisplayObjectPosition = function () {
        this._displayObject.position.set(Math.round(this._position.x), Math.round(this._position.y));
    };
    InterfaceElement.prototype.toNearestPixel = function () {
        this._position.round();
        this.updateDisplayObjectPosition();
    };
    InterfaceElement.prototype.onParentResize = function () {
        if (this._resize) {
            var width = this._width;
            var height = this._height;
            if (this._resize.fill.x > 0)
                width = this._parent._width * this._resize.fill.x - this._resize.padding.x * 2;
            if (this._resize.fill.y > 0)
                height = this._parent._height * this._resize.fill.y - this._resize.padding.y * 2;
            this.resize(width, height);
        }
        else if (this._attach) {
            this.positionRelativeTo(this._parent, this._attach);
        }
    };
    InterfaceElement.prototype.onResize = function (notifyChildren) {
        if (notifyChildren === void 0) { notifyChildren = true; }
        if (this._attach)
            this.positionRelativeTo(this._parent, this._attach);
        if (notifyChildren) {
            var len = this._children.length;
            for (var i = 0; i < len; i++) {
                this._children[i].onParentResize();
            }
        }
    };
    InterfaceElement.maskTexture = null; //8x8
    /**
     * Updated every frame by the root UI element.
     */
    InterfaceElement.drawTime = 0;
    return InterfaceElement;
}(GameEventHandler_1.default));
exports.default = InterfaceElement;

},{"../Game":1,"../events/GameEventHandler":22,"../util/Vector2D":59,"./InputManager":26,"./ResizeInfo":30}],28:[function(require,module,exports){
"use strict";
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
var InterfaceElement_1 = require("./InterfaceElement");
var MaskElement = (function (_super) {
    __extends(MaskElement, _super);
    function MaskElement(width, height) {
        var _this = _super.call(this) || this;
        _this._debugColor = 0x00ff00;
        //this.visible = false;
        _this._maskSprite = new PIXI.Sprite(InterfaceElement_1.default.maskTexture);
        _this._displayObject.scale.x = width / 8;
        _this._displayObject.scale.y = height / 8;
        _this._displayObject.addChild(_this._maskSprite);
        _this.resize(width, height);
        return _this;
    }
    MaskElement.prototype.destroy = function () {
        _super.prototype.destroy.call(this);
        this._maskSprite.destroy(false);
    };
    MaskElement.prototype.setAsMask = function (element) {
        element.maskSprite = this._maskSprite;
    };
    return MaskElement;
}(InterfaceElement_1.default));
exports.default = MaskElement;

},{"./InterfaceElement":27}],29:[function(require,module,exports){
"use strict";
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
/// <reference path="../declarations/pixi.js.d.ts"/>
var InterfaceElement_1 = require("./InterfaceElement");
//import TextureGenerator = require('../textures/TextureGenerator');
var TextureGenerator = require("../textures/TextureGenerator");
var NineSliceSprite_1 = require("../textures/NineSliceSprite");
var Panel = (function (_super) {
    __extends(Panel, _super);
    function Panel(width, height, style) {
        var _this = _super.call(this) || this;
        _this._debugColor = 0x00ff00;
        _this._className = "Panel";
        _this._width = width;
        _this._height = height;
        _this._style = style;
        _this.clickable = true;
        var tex = Panel.scaleTextures[style];
        if (!tex) {
            switch (style) {
                case Panel.HEADER:
                    tex = TextureGenerator.simpleRectangle(null, 8, 8, 0x616161);
                    break;
                case Panel.FIELD:
                    tex = TextureGenerator.simpleRectangle(null, 8, 8, 0x121212, 2, 0x616161);
                    break;
                default://BASIC
                    tex = TextureGenerator.simpleRectangle(null, 8, 8, 0x2b2b2b, 2, 0x616161);
            }
            if (tex) {
                Panel.scaleTextures[style] = tex;
            }
        }
        if (tex) {
            _this._sprite = NineSliceSprite_1.default.fromTexture(tex, new PIXI.Rectangle(3, 3, 2, 2));
            _this._displayObject.addChild(_this._sprite);
            _this._sprite.setSize(width, height);
        }
        return _this;
    }
    Panel.prototype.resize = function (width, height) {
        this._sprite.setSize(width, height);
        _super.prototype.resize.call(this, width, height);
    };
    Panel.prototype.destroy = function () {
        _super.prototype.destroy.call(this);
        this._sprite.destroy(true);
    };
    Panel.BASIC = 0;
    Panel.HEADER = 1;
    Panel.FIELD = 2;
    Panel.scaleTextures = {};
    return Panel;
}(InterfaceElement_1.default));
exports.default = Panel;

},{"../textures/NineSliceSprite":45,"../textures/TextureGenerator":46,"./InterfaceElement":27}],30:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Vector2D_1 = require("../util/Vector2D");
var AssetCache_1 = require("../util/AssetCache");
var ResizeInfo = (function () {
    function ResizeInfo(fill, padding) {
        this.fill = fill;
        this.padding = padding;
    }
    ResizeInfo.get = function (fillX, fillY, paddingX, paddingY) {
        var key = JSON.stringify([fillX, fillY, paddingX, paddingY]);
        var info = ResizeInfo.cache.get(key);
        if (!info) {
            info = new ResizeInfo(new Vector2D_1.default(fillX, fillY), new Vector2D_1.default(paddingX, paddingY));
            ResizeInfo.cache.set(key, info);
        }
        return info;
    };
    ResizeInfo.prototype.clone = function () {
        return new ResizeInfo(this.fill.clone(), this.padding.clone());
    };
    //Lots of things will probably end up sharing ResizeInfo, but unlike AttachInfo there aren't natural constants
    ResizeInfo.cache = new AssetCache_1.default(100);
    return ResizeInfo;
}());
exports.default = ResizeInfo;

},{"../util/AssetCache":52,"../util/Vector2D":59}],31:[function(require,module,exports){
"use strict";
/// <reference path="../declarations/pixi.js.d.ts"/>
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
var GameEvent_1 = require("../events/GameEvent");
var BaseButton_1 = require("./BaseButton");
var TextElement_1 = require("./TextElement");
var AttachInfo_1 = require("./AttachInfo");
var TextureGenerator = require("../textures/TextureGenerator");
var NineSliceSprite_1 = require("../textures/NineSliceSprite");
var TextButton = (function (_super) {
    __extends(TextButton, _super);
    function TextButton(text, colorScheme, width, height, textStyle) {
        if (colorScheme === void 0) { colorScheme = null; }
        if (width === void 0) { width = 100; }
        if (height === void 0) { height = 30; }
        if (textStyle === void 0) { textStyle = null; }
        var _this = this;
        if (!colorScheme)
            colorScheme = TextButton.colorSchemes.blue;
        if (!textStyle)
            textStyle = TextElement_1.default.basicText;
        var a;
        _this = _super.call(this, width, height, {
            normal: NineSliceSprite_1.default.fromTexture(TextButton.getScaleTexture(colorScheme.normal), new PIXI.Rectangle(3, 3, 2, 2)),
            highlight: NineSliceSprite_1.default.fromTexture(TextButton.getScaleTexture(colorScheme.highlight), new PIXI.Rectangle(3, 3, 2, 2)),
            disabled: NineSliceSprite_1.default.fromTexture(TextButton.getScaleTexture(colorScheme.disabled), new PIXI.Rectangle(3, 3, 2, 2))
        }) || this;
        _this._className = "TextButton";
        _this._textElement = new TextElement_1.default(text, textStyle);
        _this.addChild(_this._textElement);
        _this._textElement.attachToParent(AttachInfo_1.default.Center);
        return _this;
    }
    //Generates a key and checks the texture cache before creating. Inserts if created.
    TextButton.getScaleTexture = function (scheme) {
        var key = JSON.stringify(scheme); //silly
        var tex = this.scaleTextures[key];
        if (!tex) {
            tex = TextureGenerator.simpleRectangle(null, 8, 8, scheme.bg, 2, scheme.border);
            this.scaleTextures[key] = tex;
        }
        return tex;
    };
    Object.defineProperty(TextButton.prototype, "text", {
        get: function () { return this._textElement.text; },
        set: function (s) {
            this._textElement.text = s;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TextButton.prototype, "onClick", {
        set: function (func) {
            if (this._onClick) {
                this.removeEventListener(GameEvent_1.default.types.ui.LEFTMOUSECLICK, this._onClick);
            }
            if (func)
                this.addEventListener(GameEvent_1.default.types.ui.LEFTMOUSECLICK, func);
            this._onClick = func;
        },
        enumerable: true,
        configurable: true
    });
    //note: use the gems in oryx 16 bit items as colour reference
    TextButton.colorSchemes = {
        green: {
            normal: { bg: 0x00852c, border: 0x00ba3e },
            highlight: { bg: 0x00ba3e, border: 0x00ea4e },
            disabled: { bg: 0x2b2b2b, border: 0x616161 }
        },
        red: {
            normal: { bg: 0x910c0c, border: 0xca1010 },
            highlight: { bg: 0xca1010, border: 0xff1414 },
            disabled: { bg: 0x2b2b2b, border: 0x616161 }
        },
        blue: {
            normal: { bg: 0x0c5991, border: 0x107cca },
            highlight: { bg: 0x107cca, border: 0x149dff },
            disabled: { bg: 0x2b2b2b, border: 0x616161 }
        }
    };
    //Caches background textures. These can hang around for the whole program
    TextButton.scaleTextures = {};
    return TextButton;
}(BaseButton_1.default));
exports.default = TextButton;

},{"../events/GameEvent":21,"../textures/NineSliceSprite":45,"../textures/TextureGenerator":46,"./AttachInfo":23,"./BaseButton":24,"./TextElement":32}],32:[function(require,module,exports){
"use strict";
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
/// <reference path="../declarations/pixi.js.d.ts"/>
var InterfaceElement_1 = require("./InterfaceElement");
var mainFont = "Arial";
var TextElement = (function (_super) {
    __extends(TextElement, _super);
    function TextElement(text, style) {
        if (text === void 0) { text = ""; }
        if (style === void 0) { style = TextElement.basicText; }
        var _this = _super.call(this) || this;
        _this._debugColor = 0xff0000;
        _this._className = "TextElement";
        _this._text = text;
        _this._pixiText = new PIXI.Text(text, style);
        _this._displayObject.addChild(_this._pixiText);
        _this.resizeToPixiText();
        return _this;
    }
    Object.defineProperty(TextElement.prototype, "text", {
        get: function () { return this._text; },
        set: function (text) {
            this._text = text;
            this.setPixiText();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TextElement.prototype, "style", {
        set: function (style) {
            this._pixiText.style = style;
            this.resizeToPixiText();
        },
        enumerable: true,
        configurable: true
    });
    TextElement.prototype.destroy = function () {
        _super.prototype.destroy.call(this);
        this._pixiText.destroy(true);
    };
    /**
     * Expensive! Sets the PIXI text twice. Assumes single line.
     * (does this work? does it need a draw frame? time will tell)
     */
    TextElement.prototype.getWidthAtCharacterIndex = function (i) {
        if (i >= this._text.length)
            return -1; //dummy
        this._pixiText.text = this._text.substr(0, i + 1);
        var w = this._pixiText.width;
        this._pixiText.text = this._text;
        return w;
    };
    TextElement.prototype.setPixiText = function () {
        this._pixiText.text = this._text;
        this.resizeToPixiText();
    };
    TextElement.prototype.resizeToPixiText = function () {
        var width = (this._text.length > 0) ? this._pixiText.width : 0;
        this.resize(width, this._pixiText.height);
    };
    //Open Sans
    TextElement.basicText = new PIXI.TextStyle({ fontSize: 14, fontFamily: mainFont, fill: 0xffffff, align: 'left' });
    TextElement.mediumText = new PIXI.TextStyle({ fontSize: 20, fontFamily: mainFont, fill: 0xffffff, align: 'left' });
    TextElement.bigText = new PIXI.TextStyle({ fontSize: 32, fontFamily: mainFont, fill: 0xffffff, align: 'left' });
    TextElement.veryBigText = new PIXI.TextStyle({ fontSize: 48, fontFamily: mainFont, fill: 0xffffff, align: 'left' });
    return TextElement;
}(InterfaceElement_1.default));
exports.default = TextElement;

},{"./InterfaceElement":27}],33:[function(require,module,exports){
"use strict";
/// <reference path="../declarations/pixi.js.d.ts"/>
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
var Vector2D_1 = require("../util/Vector2D");
var InterfaceElement_1 = require("./InterfaceElement");
var Panel_1 = require("./Panel");
var TextElement_1 = require("./TextElement");
var MaskElement_1 = require("./MaskElement");
var AttachInfo_1 = require("./AttachInfo");
var GameEvent_1 = require("../events/GameEvent");
var TextField = (function (_super) {
    __extends(TextField, _super);
    /**
     * Allows the user to input text.
     * @param alphabet	Constrains input characters
     * @param validator	Checks validity of the whole string
     */
    function TextField(width, height, textStyle, alphabet, validator) {
        if (alphabet === void 0) { alphabet = null; }
        if (validator === void 0) { validator = null; }
        var _this = _super.call(this) || this;
        _this._text = "";
        _this._blinkTime = -1;
        _this._hidden = false;
        _this._borderPadding = 4;
        _this.onFocus = function (e) {
            _this._cursor.visible = true;
            _this._blinkTime = InterfaceElement_1.default.drawTime;
        };
        _this.onUnfocus = function (e) {
            _this._cursor.visible = false;
        };
        _this.onKey = function (e) {
            var key = e.data;
            if (key == "BACKSPACE") {
                _this.deleteCharacter();
            }
            else if (key == "TAB") {
                _this.sendNewEvent(GameEvent_1.default.types.ui.TAB);
            }
            else if (key == "ENTER") {
                _this.sendNewEvent(GameEvent_1.default.types.ui.SUBMIT);
            }
            else if ((_this._alphabet && !_this._alphabet.test(key)) || key.length > 1) {
                console.log("TextField: ignoring character '" + key + "'");
                return;
            }
            else {
                _this.addCharacter(key);
            }
        };
        _this._className = "TextField";
        _this.resize(width, height);
        _this._alphabet = alphabet;
        _this._validator = validator;
        _this.ignoreChildrenForClick = true;
        _this._bg = new Panel_1.default(width, height, Panel_1.default.FIELD);
        _this._textElement = new TextElement_1.default("", textStyle);
        _this.addChild(_this._bg);
        _this._bg.addChild(_this._textElement);
        //Offset the text slightly to allow for the border (Panel needs some improvement)
        var textAttach = AttachInfo_1.default.LeftCenter.clone();
        textAttach.offset.x = _this._borderPadding;
        _this._textElement.attachToParent(textAttach);
        //Attach the cursor to the right of the text
        _this._cursor = new TextElement_1.default("|", textStyle);
        _this._textElement.addChild(_this._cursor);
        textAttach = new AttachInfo_1.default(new Vector2D_1.default(0, 0.5), new Vector2D_1.default(1, 0.5), new Vector2D_1.default(-2, 0));
        _this._cursor.attachToParent(textAttach);
        _this._cursor.visible = false;
        //Make a mask, centred on the Panel
        _this._mask = new MaskElement_1.default(width - _this._borderPadding * 2, height - _this._borderPadding * 2);
        _this._bg.addChild(_this._mask);
        _this._mask.attachToParent(AttachInfo_1.default.Center);
        _this._mask.setAsMask(_this._textElement);
        _this._mask.setAsMask(_this._cursor);
        return _this;
    }
    Object.defineProperty(TextField.prototype, "hidden", {
        get: function () { return this._hidden; },
        set: function (val) { this._hidden = val; this.updateText(); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TextField.prototype, "text", {
        get: function () {
            return this._text;
        },
        set: function (text) {
            this._text = text;
            this.updateText();
        },
        enumerable: true,
        configurable: true
    });
    TextField.prototype.draw = function () {
        _super.prototype.draw.call(this);
        if (!this.visible)
            return;
        if (this.isFocused) {
            if (InterfaceElement_1.default.drawTime - this._blinkTime >= TextField.BLINK_INTERVAL) {
                if (this._cursor.visible) {
                    this._cursor.visible = false;
                }
                else {
                    this._cursor.visible = true;
                }
                this._blinkTime = InterfaceElement_1.default.drawTime;
            }
        }
    };
    TextField.prototype.onAdd = function () {
        this.addEventListener(GameEvent_1.default.types.ui.FOCUS, this.onFocus);
        this.addEventListener(GameEvent_1.default.types.ui.UNFOCUS, this.onUnfocus);
        this.addEventListener(GameEvent_1.default.types.ui.KEY, this.onKey);
    };
    TextField.prototype.onRemove = function (fromParent) {
        this.removeEventListener(GameEvent_1.default.types.ui.FOCUS, this.onFocus);
        this.removeEventListener(GameEvent_1.default.types.ui.UNFOCUS, this.onUnfocus);
        this.removeEventListener(GameEvent_1.default.types.ui.KEY, this.onKey);
    };
    TextField.prototype.addCharacter = function (char) {
        this._text += char;
        this.updateText();
        this.resetCursorBlink();
    };
    TextField.prototype.deleteCharacter = function () {
        if (this._text.length > 0) {
            this._text = this._text.substr(0, this._text.length - 1);
            this.updateText();
        }
        this.resetCursorBlink();
    };
    TextField.prototype.resetCursorBlink = function () {
        this._blinkTime = InterfaceElement_1.default.drawTime;
        this._cursor.visible = true;
    };
    TextField.prototype.updateText = function () {
        var text;
        if (this._hidden) {
            text = '';
            for (var i = 0; i < this._text.length; i++) {
                text += '*';
            }
        }
        else {
            text = this._text;
        }
        this._textElement.text = text;
        var offset = (this.width - this._borderPadding * 2) - (this._textElement.width + this._cursor.width - 4);
        offset = Math.min(offset, this._borderPadding);
        this._textElement.setAttachOffset(offset, 0);
    };
    TextField.alphabets = {
        abc: /^[a-zA-Z]$/,
        abc123: /^[a-zA-Z0-9]$/
    };
    TextField.BLINK_INTERVAL = 750;
    return TextField;
}(InterfaceElement_1.default));
exports.default = TextField;

},{"../events/GameEvent":21,"../util/Vector2D":59,"./AttachInfo":23,"./InterfaceElement":27,"./MaskElement":28,"./Panel":29,"./TextElement":32}],34:[function(require,module,exports){
"use strict";
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
var InterfaceElement_1 = require("../InterfaceElement");
var TextElement_1 = require("../TextElement");
var AttachInfo_1 = require("../AttachInfo");
var Panel_1 = require("../Panel");
var ElementList_1 = require("../ElementList");
var TextField_1 = require("../TextField");
var GameEvent_1 = require("../../events/GameEvent");
var TextFieldListManager_1 = require("./TextFieldListManager");
var TextButton_1 = require("../TextButton");
var GenericListDialog = (function (_super) {
    __extends(GenericListDialog, _super);
    function GenericListDialog(width, borderPadding) {
        if (width === void 0) { width = 300; }
        if (borderPadding === void 0) { borderPadding = 20; }
        var _this = _super.call(this) || this;
        _this.bg = null;
        _this.list = null;
        _this.textFields = [];
        _this.textFieldManager = null;
        _this.finalized = false;
        _this.onSubmit = null;
        _this.validator = null;
        _this._className = "GenericListDialog";
        _this.dialogWidth = width;
        _this.borderPadding = borderPadding;
        _this.list = new ElementList_1.default(_this.dialogWidth, ElementList_1.default.VERTICAL, 6, ElementList_1.default.CENTRE);
        _this.addChild(_this.list);
        return _this;
    }
    GenericListDialog.prototype.draw = function () {
        if (!this.finalized) {
            console.log(this.fullName + ": auto-finalize (parent size might be wrong!)");
            this.finalize();
        }
        _super.prototype.draw.call(this);
    };
    /**
     * Set up text fields, resize self, make background. Call it last.
     */
    GenericListDialog.prototype.finalize = function () {
        var _this = this;
        if (this.finalized) {
            console.warn(this.fullName + ": already finalized!");
            return;
        }
        this.bg = new Panel_1.default(this.list.width + this.borderPadding * 2, this.list.height + this.borderPadding * 2, Panel_1.default.BASIC);
        this.resize(this.bg.width, this.bg.height);
        console.log(this.fullName + ": finalize " + this.width + ", " + this.height);
        this.addChild(this.bg);
        this.addChild(this.list);
        this.bg.attachToParent(AttachInfo_1.default.Center);
        this.list.attachToParent(AttachInfo_1.default.Center);
        if (this.textFields.length > 0) {
            this.textFieldManager = new TextFieldListManager_1.default(this.textFields);
            this.textFieldManager.addEventListener(GameEvent_1.default.types.ui.SUBMIT, function (e) { _this.submit(); });
        }
        this.finalized = true;
    };
    GenericListDialog.prototype.submit = function (additionalData) {
        if (additionalData === void 0) { additionalData = null; }
        if (this.onSubmit) {
            var data = this.getSubmitData(additionalData);
            var ok = true;
            if (this.validator)
                ok = this.validator(data);
            if (ok) {
                this.onSubmit(data);
            }
        }
        else {
            console.warn(this.fullName + ": no onSubmit function!");
        }
    };
    GenericListDialog.prototype.getSubmitData = function (additionalData) {
        var data = {};
        for (var _i = 0, _a = this.textFields; _i < _a.length; _i++) {
            var textField = _a[_i];
            data[textField.name] = textField.text;
        }
        if (additionalData) {
            for (var prop in additionalData) {
                data[prop] = additionalData[prop];
            }
        }
        return data;
    };
    GenericListDialog.prototype.setFields = function (data) {
        for (var _i = 0, _a = this.textFields; _i < _a.length; _i++) {
            var textField = _a[_i];
            if (data.hasOwnProperty(textField.name)) {
                textField.text = data[textField.name];
            }
        }
    };
    GenericListDialog.prototype.addBigTitle = function (text, padding) {
        if (padding === void 0) { padding = 10; }
        var title = new TextElement_1.default(text, TextElement_1.default.bigText);
        title.name = "title";
        this.list.addChild(title, padding); //add extra padding between form and title
    };
    GenericListDialog.prototype.addMediumTitle = function (text, padding) {
        if (padding === void 0) { padding = 5; }
        var title = new TextElement_1.default(text, TextElement_1.default.mediumText);
        title.name = "title";
        this.list.addChild(title, padding); //add extra padding between form and title
    };
    GenericListDialog.prototype.addMessage = function (text, padding) {
        if (padding === void 0) { padding = 0; }
        var message = new TextElement_1.default(text, TextElement_1.default.basicText);
        this.list.addChild(message, padding); //add extra padding between form and title
    };
    GenericListDialog.prototype.addTextField = function (name, alphabet, hidden, defaultStr, validator, padding) {
        if (hidden === void 0) { hidden = false; }
        if (defaultStr === void 0) { defaultStr = ""; }
        if (validator === void 0) { validator = null; }
        if (padding === void 0) { padding = 0; }
        var field = new TextField_1.default(250, 28, TextElement_1.default.basicText, alphabet, validator);
        if (defaultStr)
            field.text = defaultStr;
        field.hidden = hidden;
        field.name = name;
        this.list.addChild(field, padding);
        this.textFields.push(field);
    };
    GenericListDialog.prototype.addLabeledTextField = function (label, name, alphabet, hidden, defaultStr, validator, padding) {
        if (hidden === void 0) { hidden = false; }
        if (defaultStr === void 0) { defaultStr = ""; }
        if (validator === void 0) { validator = null; }
        if (padding === void 0) { padding = 0; }
        this.addMessage(label);
        this.addTextField(name, alphabet, hidden, defaultStr, validator, padding);
    };
    GenericListDialog.prototype.addButtons = function (infos, padding, vertical) {
        if (padding === void 0) { padding = 0; }
        if (vertical === void 0) { vertical = false; }
        var orientation = vertical ? ElementList_1.default.VERTICAL : ElementList_1.default.HORIZONTAL;
        var width = vertical ? 100 : 30;
        var buttonContainer = new ElementList_1.default(width, ElementList_1.default.HORIZONTAL, 10, ElementList_1.default.CENTRE);
        for (var _i = 0, infos_1 = infos; _i < infos_1.length; _i++) {
            var info = infos_1[_i];
            var colorScheme = info.colorScheme;
            if (!colorScheme)
                colorScheme = TextButton_1.default.colorSchemes.blue;
            var button = new TextButton_1.default(info.text, colorScheme);
            button.onClick = info.onClick;
            buttonContainer.addChild(button);
        }
        this.list.addChild(buttonContainer, padding);
    };
    GenericListDialog.prototype.addSubmitAndCloseButtons = function (submitText, closeText, padding) {
        var _this = this;
        if (submitText === void 0) { submitText = "Submit"; }
        if (closeText === void 0) { closeText = "Close"; }
        if (padding === void 0) { padding = 0; }
        this.addButtons([
            { text: submitText, colorScheme: TextButton_1.default.colorSchemes.green, onClick: function (e) { _this.submit(); } },
            { text: closeText, colorScheme: TextButton_1.default.colorSchemes.red, onClick: function (e) { _this.removeSelf(); } }
        ], padding);
    };
    GenericListDialog.prototype.addSpacer = function (height) {
        var spacer = new InterfaceElement_1.default();
        spacer.resize(10, height);
        this.list.addChild(spacer);
    };
    return GenericListDialog;
}(InterfaceElement_1.default));
exports.default = GenericListDialog;

},{"../../events/GameEvent":21,"../AttachInfo":23,"../ElementList":25,"../InterfaceElement":27,"../Panel":29,"../TextButton":31,"../TextElement":32,"../TextField":33,"./TextFieldListManager":36}],35:[function(require,module,exports){
"use strict";
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
var InterfaceElement_1 = require("../InterfaceElement");
var GenericListDialog_1 = require("./GenericListDialog");
var TextButton_1 = require("../TextButton");
var InputManager_1 = require("../InputManager");
var AttachInfo_1 = require("../AttachInfo");
var InterfaceRoot = (function (_super) {
    __extends(InterfaceRoot, _super);
    function InterfaceRoot(container) {
        var _this = _super.call(this) || this;
        _this.layers = {};
        InterfaceRoot._instance = _this;
        container.addChild(_this._displayObject);
        _this.name = "root";
        _this.id = "root";
        _this.useDebugRect = false;
        for (var _i = 0, _a = InterfaceRoot.LayerOrder; _i < _a.length; _i++) {
            var layerName = _a[_i];
            var layer = new InterfaceElement_1.default();
            _this.addChild(layer);
            layer.resizeToParent();
            layer.name = layerName;
            layer.useDebugRect = false;
            _this.layers[layerName] = layer;
        }
        return _this;
    }
    Object.defineProperty(InterfaceRoot, "instance", {
        get: function () {
            return InterfaceRoot._instance;
        },
        enumerable: true,
        configurable: true
    });
    InterfaceRoot.prototype.getElementAtPoint = function (point) {
        var popups = this.getLayer(InterfaceRoot.LayerNames.popups);
        if (popups.numChildren > 0) {
            //if there are popups, only they can be clicked
            return popups.getElementAtPoint(point);
        }
        return _super.prototype.getElementAtPoint.call(this, point);
    };
    InterfaceRoot.prototype.getLayer = function (name) {
        var layer = this.layers[name];
        if (!layer)
            return null;
        return layer;
    };
    //Note there isn't really a need for remove* functions.
    //Use removeSelf instead.
    InterfaceRoot.prototype.addUI = function (element) {
        this.getLayer(InterfaceRoot.LayerNames.gameUI).addChild(element);
    };
    InterfaceRoot.prototype.addDialog = function (element) {
        this.getLayer(InterfaceRoot.LayerNames.dialogs).addChild(element);
    };
    InterfaceRoot.prototype.addAlert = function (element) {
        this.getLayer(InterfaceRoot.LayerNames.alerts).addChild(element);
    };
    InterfaceRoot.prototype.addPopup = function (element) {
        this.getLayer(InterfaceRoot.LayerNames.popups).addChild(element);
    };
    InterfaceRoot.prototype.showWarningPopup = function (message, title, onClose) {
        if (title === void 0) { title = null; }
        if (onClose === void 0) { onClose = null; }
        var dialog = new GenericListDialog_1.default(200, 10);
        if (title)
            dialog.addMediumTitle(title, 0);
        dialog.addMessage(message, 5);
        dialog.addButtons([
            { text: "Close", colorScheme: TextButton_1.default.colorSchemes.blue, onClick: function (e) {
                    dialog.removeSelf();
                    if (onClose) {
                        onClose();
                    }
                } }
        ]);
        dialog.finalize();
        this.addPopup(dialog);
        dialog.attachToParent(AttachInfo_1.default.Center);
        InputManager_1.default.instance.focus(null);
        return dialog;
    };
    InterfaceRoot.prototype.showStatusPopup = function (status) {
        var dialog = new GenericListDialog_1.default(200, 10);
        dialog.addMediumTitle(status);
        dialog.finalize();
        this.addPopup(dialog);
        dialog.attachToParent(AttachInfo_1.default.Center);
        InputManager_1.default.instance.focus(null);
        return dialog;
    };
    InterfaceRoot.LayerNames = {
        gameUI: "gameUI",
        dialogs: "dialogs",
        alerts: "alerts",
        popups: "popups" //warning boxes, error messages, confirmations
    };
    InterfaceRoot.LayerOrder = ["gameUI", "dialogs", "alerts", "popups"];
    InterfaceRoot._instance = null;
    return InterfaceRoot;
}(InterfaceElement_1.default));
exports.default = InterfaceRoot;

},{"../AttachInfo":23,"../InputManager":26,"../InterfaceElement":27,"../TextButton":31,"./GenericListDialog":34}],36:[function(require,module,exports){
"use strict";
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
var GameEvent_1 = require("../../events/GameEvent");
var GameEventHandler_1 = require("../../events/GameEventHandler");
var InputManager_1 = require("../InputManager");
var TextFieldListManager = (function (_super) {
    __extends(TextFieldListManager, _super);
    /**
     * Not an InterfaceElement! Just sets up events (TAB/SUBMIT) for a list of text elements
     */
    function TextFieldListManager(fields) {
        if (fields === void 0) { fields = null; }
        var _this = _super.call(this) || this;
        _this.onTab = function (e) {
            var from = e.from;
            if (!from)
                return;
            var index = _this._fields.indexOf(from);
            if (index === -1)
                return;
            var increment = (InputManager_1.default.instance.isKeyDown("SHIFT")) ? -1 : 1;
            index = (index + increment) % _this._fields.length;
            if (index == -1)
                index = _this._fields.length - 1;
            InputManager_1.default.instance.focus(_this._fields[index]);
        };
        _this.onSubmit = function (e) {
            _this.sendEvent(e);
        };
        if (fields)
            _this.init(fields);
        return _this;
    }
    TextFieldListManager.prototype.init = function (fields) {
        if (this._fields)
            this.cleanup();
        this._fields = fields;
        for (var _i = 0, fields_1 = fields; _i < fields_1.length; _i++) {
            var field = fields_1[_i];
            field.addEventListener(GameEvent_1.default.types.ui.TAB, this.onTab);
            field.addEventListener(GameEvent_1.default.types.ui.SUBMIT, this.onSubmit);
        }
    };
    TextFieldListManager.prototype.cleanup = function () {
        for (var _i = 0, _a = this._fields; _i < _a.length; _i++) {
            var field = _a[_i];
            field.removeEventListener(GameEvent_1.default.types.ui.TAB, this.onTab);
            field.removeEventListener(GameEvent_1.default.types.ui.SUBMIT, this.onSubmit);
        }
    };
    return TextFieldListManager;
}(GameEventHandler_1.default));
exports.default = TextFieldListManager;

},{"../../events/GameEvent":21,"../../events/GameEventHandler":22,"../InputManager":26}],37:[function(require,module,exports){
"use strict";
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
var InterfaceElement_1 = require("../../InterfaceElement");
var SelectionDisplay_1 = require("./SelectionDisplay");
var AttachInfo_1 = require("../../AttachInfo");
var BattleUI = (function (_super) {
    __extends(BattleUI, _super);
    function BattleUI() {
        var _this = _super.call(this) || this;
        _this.battle = null;
        _this.clickable = false;
        _this.name = "Battle UI";
        _this.id = "Battle UI";
        _this.selectionDisplay = new SelectionDisplay_1.default();
        _this.addChild(_this.selectionDisplay);
        _this.selectionDisplay.attachToParent(AttachInfo_1.default.BLtoBL);
        _this.selectionDisplay.init(_this);
        return _this;
    }
    BattleUI.prototype.initBattle = function (battle) {
        if (this.battle)
            this.unsubscribeFrom(this.battle);
        this.battle = battle;
        this.subscribeTo(battle); //lets UI elements listen to this instead of all of them needing to update their current battle
    };
    return BattleUI;
}(InterfaceElement_1.default));
exports.default = BattleUI;

},{"../../AttachInfo":23,"../../InterfaceElement":27,"./SelectionDisplay":38}],38:[function(require,module,exports){
"use strict";
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
var InterfaceElement_1 = require("../../InterfaceElement");
var Panel_1 = require("../../Panel");
var TextElement_1 = require("../../TextElement");
var Game_1 = require("../../../Game");
var AttachInfo_1 = require("../../AttachInfo");
var GameEvent_1 = require("../../../events/GameEvent");
/**
 * Shows basic information about the currently selected unit.
 * All pretty temporary.
 */
var SelectionDisplay = (function (_super) {
    __extends(SelectionDisplay, _super);
    function SelectionDisplay() {
        var _this = _super.call(this) || this;
        _this.currentUnit = null;
        _this.panel = new Panel_1.default(260, 24 * 3 + 8, Panel_1.default.BASIC);
        _this.nameText = new TextElement_1.default("", TextElement_1.default.mediumText);
        _this.healthText = new TextElement_1.default("", TextElement_1.default.mediumText);
        _this.unitSprite = new PIXI.Sprite(Game_1.default.instance.textureLoader.get("tile/floor"));
        _this.unitSprite.scale = new PIXI.Point(3, 3);
        _this.unitSpriteWrapper = new InterfaceElement_1.default(_this.unitSprite);
        _this.addChild(_this.panel);
        _this.addChild(_this.nameText);
        _this.addChild(_this.healthText);
        _this.addChild(_this.unitSpriteWrapper);
        _this.unitSpriteWrapper.x = 4;
        _this.unitSpriteWrapper.y = 4;
        _this.nameText.positionRelativeTo(_this.unitSpriteWrapper, AttachInfo_1.default.TLtoTR.withOffset(10, 4));
        _this.healthText.positionRelativeTo(_this.nameText, AttachInfo_1.default.TLtoBL.withOffset(0, 6));
        _this.resizeToFitChildren();
        _this.clear();
        return _this;
    }
    SelectionDisplay.prototype.init = function (battleUI) {
        var _this = this;
        //selection
        battleUI.addEventListener(GameEvent_1.default.types.battle.UNITSELECTIONCHANGED, function (e) {
            _this.initUnit(Game_1.default.instance.currentBattle.selectedUnit);
        });
        //hover
        battleUI.addEventListener(GameEvent_1.default.types.battle.HOVERCHANGED, function (e) {
            var hoveredUnit = Game_1.default.instance.currentBattle.getHoveredUnit();
            if (hoveredUnit) {
                _this.initUnit(hoveredUnit);
            }
            else {
                var selectedUnit = Game_1.default.instance.currentBattle.selectedUnit;
                if (selectedUnit)
                    _this.initUnit(selectedUnit);
                else
                    _this.clear();
            }
        });
    };
    SelectionDisplay.prototype.initUnit = function (unit, force) {
        if (force === void 0) { force = false; }
        if (!unit) {
            this.clear();
            this.currentUnit = null;
            return;
        }
        if (unit === this.currentUnit && !force)
            return;
        this.nameText.text = unit.name;
        this.healthText.text = unit.health + "/" + unit.maxHealth;
        this.unitSprite.texture = unit.display.sprite.texture;
        this.visible = true;
        this.currentUnit = unit;
    };
    SelectionDisplay.prototype.clear = function () {
        this.visible = false;
        this.currentUnit = null;
    };
    return SelectionDisplay;
}(InterfaceElement_1.default));
exports.default = SelectionDisplay;

},{"../../../Game":1,"../../../events/GameEvent":21,"../../AttachInfo":23,"../../InterfaceElement":27,"../../Panel":29,"../../TextElement":32}],39:[function(require,module,exports){
"use strict";
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
var InterfaceElement_1 = require("../../InterfaceElement");
var TextElement_1 = require("../../TextElement");
var DungeonScreen = (function (_super) {
    __extends(DungeonScreen, _super);
    function DungeonScreen() {
        return _super.call(this) || this;
    }
    DungeonScreen.prototype.init = function () {
        this.addChild(new TextElement_1.default("Dungeons"));
        this.resizeToFitChildren();
    };
    return DungeonScreen;
}(InterfaceElement_1.default));
exports.default = DungeonScreen;

},{"../../InterfaceElement":27,"../../TextElement":32}],40:[function(require,module,exports){
"use strict";
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
var InterfaceElement_1 = require("../../InterfaceElement");
var ScreenSelector_1 = require("./ScreenSelector");
var AttachInfo_1 = require("../../AttachInfo");
var UnitScreen_1 = require("./UnitScreen");
var DungeonScreen_1 = require("./DungeonScreen");
var MainMenu = (function (_super) {
    __extends(MainMenu, _super);
    function MainMenu() {
        var _this = _super.call(this) || this;
        _this.currentScreen = null;
        _this.currentScreenName = "";
        return _this;
    }
    MainMenu.prototype.init = function () {
        this.resizeToParent();
        this.screenSelector = new ScreenSelector_1.default(this);
        this.screenSelector.init();
        this.addChild(this.screenSelector);
        this.screenSelector.attachToParent(AttachInfo_1.default.BottomCenter);
        console.log("MainMenu: " + JSON.stringify(this.getBounds()));
        console.log("selector " + JSON.stringify(this.screenSelector.getBounds()));
    };
    MainMenu.prototype.openScreen = function (name, forceReopen) {
        if (forceReopen === void 0) { forceReopen = false; }
        console.log("MainMenu: openScreen \"" + name + "\"");
        if (!forceReopen && name == this.currentScreenName)
            return;
        this.closeScreen();
        switch (name) {
            case "units":
                this.currentScreen = new UnitScreen_1.default();
                this.currentScreen.init();
                break;
            case "dungeons":
                this.currentScreen = new DungeonScreen_1.default();
                this.currentScreen.init();
                break;
        }
        if (this.currentScreen) {
            this.addChild(this.currentScreen);
            this.currentScreen.attachToParent(AttachInfo_1.default.Center);
            this.currentScreenName = name;
        }
        else {
            this.currentScreenName = "";
        }
    };
    MainMenu.prototype.closeScreen = function () {
        if (this.currentScreen) {
            this.currentScreen.destroy();
            this.currentScreen = null;
        }
    };
    return MainMenu;
}(InterfaceElement_1.default));
exports.default = MainMenu;

},{"../../AttachInfo":23,"../../InterfaceElement":27,"./DungeonScreen":39,"./ScreenSelector":41,"./UnitScreen":42}],41:[function(require,module,exports){
"use strict";
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
var InterfaceElement_1 = require("../../InterfaceElement");
var ElementList_1 = require("../../ElementList");
var TextButton_1 = require("../../TextButton");
var ScreenSelector = (function (_super) {
    __extends(ScreenSelector, _super);
    function ScreenSelector(mainMenu) {
        var _this = _super.call(this) || this;
        _this.mainMenu = mainMenu;
        return _this;
    }
    ScreenSelector.prototype.init = function () {
        this.buttonList = new ElementList_1.default(30, ElementList_1.default.HORIZONTAL, 10);
        var buttonInfo = [
            { name: "Units", screen: "units", color: TextButton_1.default.colorSchemes.blue },
            { name: "Dungeons", screen: "dungeons", color: TextButton_1.default.colorSchemes.red }
        ];
        this.buttonList.beginBatchChange();
        for (var _i = 0, buttonInfo_1 = buttonInfo; _i < buttonInfo_1.length; _i++) {
            var info = buttonInfo_1[_i];
            var button = new TextButton_1.default(info.name, info.color);
            button.onClick = this.getButtonCallback(info.screen);
            this.buttonList.addChild(button);
        }
        this.buttonList.endBatchChange();
        this.addChild(this.buttonList);
        this.resizeToFitChildren();
    };
    ScreenSelector.prototype.getButtonCallback = function (screenName) {
        var _this = this;
        return function () {
            _this.mainMenu.openScreen(screenName);
        };
    };
    return ScreenSelector;
}(InterfaceElement_1.default));
exports.default = ScreenSelector;

},{"../../ElementList":25,"../../InterfaceElement":27,"../../TextButton":31}],42:[function(require,module,exports){
"use strict";
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
var InterfaceElement_1 = require("../../InterfaceElement");
var TextElement_1 = require("../../TextElement");
var UnitScreen = (function (_super) {
    __extends(UnitScreen, _super);
    function UnitScreen() {
        return _super.call(this) || this;
    }
    UnitScreen.prototype.init = function () {
        this.addChild(new TextElement_1.default("Units"));
        this.resizeToFitChildren();
    };
    return UnitScreen;
}(InterfaceElement_1.default));
exports.default = UnitScreen;

},{"../../InterfaceElement":27,"../../TextElement":32}],43:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mainMenuMusic = [
    ["music/fortress", "sound/music/fortress.ogg"]
];
exports.interfaceSounds = [
    ["ui/click", "sound/ui/click.ogg"],
    ["ui/rollover", "sound/ui/rollover.ogg"],
    ["ui/nope", "sound/ui/nope.ogg"]
];

},{}],44:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var SoundLoadRequest = (function () {
    function SoundLoadRequest(name, list, onComplete, onProgress) {
        if (onProgress === void 0) { onProgress = null; }
        this.name = name;
        this.list = list;
        this.onComplete = onComplete;
        this.onProgress = onProgress;
    }
    return SoundLoadRequest;
}());
var SoundManager = (function () {
    function SoundManager() {
        var _this = this;
        this._requests = [];
        this._musicVolume = 1;
        this._volume = 1;
        this._music = null;
        createjs.Sound.addEventListener("fileload", function () { return _this.onSoundLoaded(); });
        createjs.Sound.alternateExtensions = ['mp3'];
    }
    Object.defineProperty(SoundManager, "instance", {
        get: function () {
            if (SoundManager._instance == null)
                SoundManager._instance = new SoundManager();
            return SoundManager._instance;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SoundManager.prototype, "volume", {
        get: function () { return this._volume; },
        set: function (volume) { this._volume = volume; this.onVolumeChange(); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SoundManager.prototype, "musicVolume", {
        get: function () { return this._musicVolume; },
        set: function (volume) { this._musicVolume = volume; this.onMusicVolumeChange(); },
        enumerable: true,
        configurable: true
    });
    SoundManager.prototype.load = function (requestName, assetList, onComplete, onProgress) {
        if (onProgress === void 0) { onProgress = null; }
        this._requests.push(new SoundLoadRequest(requestName, assetList, onComplete, onProgress));
        if (this._requests.length == 1)
            this._load();
    };
    SoundManager.prototype.playMusic = function (name) {
        this.stopMusic();
        this._music = createjs.Sound.play(name, { loop: -1 });
    };
    SoundManager.prototype.stopMusic = function () {
        if (this._music != null)
            this._music.stop();
        this._music = null;
    };
    SoundManager.prototype._load = function () {
        this._numLoaded = 0;
        var list = this._requests[0].list;
        for (var i = 0; i < list.length; i++) {
            console.log("Registering " + list[i][1] + " as " + list[i][0]);
            createjs.Sound.registerSound({ id: list[i][0], src: list[i][1] });
        }
    };
    SoundManager.prototype.onSoundLoaded = function () {
        this._numLoaded += 1;
        var req = this._requests[0];
        if (req.onProgress) {
            req.onProgress(req.name, this._numLoaded / req.list.length);
        }
        if (this._numLoaded >= req.list.length) {
            //done
            req.onComplete(req.name);
            this._requests.shift();
            if (this._requests.length > 0)
                this._load();
        }
    };
    SoundManager.prototype.onVolumeChange = function () {
        this.onMusicVolumeChange();
    };
    SoundManager.prototype.onMusicVolumeChange = function () {
        if (this._music)
            this._music.volume = this._musicVolume * this._volume;
    };
    SoundManager._instance = null;
    return SoundManager;
}());
exports.default = SoundManager;

},{}],45:[function(require,module,exports){
"use strict";
/// <reference path="../declarations/pixi.js.d.ts"/>
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
var NineSliceSprite = (function (_super) {
    __extends(NineSliceSprite, _super);
    /**
     * It's a nine-sliced sprite! If you set it too small, don't expect it to look good.
     * @param baseTexture Texture containing the image you want to scale.
     * @param innerRect Defines the interior rectangle which is scaled. For a 16x16 image with a 2px border, this would be rect(2,2,12,12)
     * @param outerRect Defines the region of the base texture to be used. If not provided, the whole texture will be used.
     */
    function NineSliceSprite(baseTexture, innerRect, outerRect) {
        if (outerRect === void 0) { outerRect = null; }
        var _this = _super.call(this) || this;
        if (!outerRect)
            outerRect = new PIXI.Rectangle(0, 0, baseTexture.width, baseTexture.height);
        var leftWidth = innerRect.left - outerRect.left;
        var rightWidth = outerRect.right - innerRect.right;
        var topHeight = innerRect.top - outerRect.top;
        var bottomHeight = outerRect.bottom - innerRect.bottom;
        //Corners
        _this.topLeft = new PIXI.Sprite(new PIXI.Texture(baseTexture, new PIXI.Rectangle(outerRect.left, outerRect.top, leftWidth, topHeight)));
        _this.topRight = new PIXI.Sprite(new PIXI.Texture(baseTexture, new PIXI.Rectangle(innerRect.right, outerRect.top, rightWidth, topHeight)));
        _this.bottomLeft = new PIXI.Sprite(new PIXI.Texture(baseTexture, new PIXI.Rectangle(outerRect.left, innerRect.bottom, leftWidth, bottomHeight)));
        _this.bottomRight = new PIXI.Sprite(new PIXI.Texture(baseTexture, new PIXI.Rectangle(innerRect.right, innerRect.bottom, rightWidth, bottomHeight)));
        //Edges
        _this.top = new PIXI.Sprite(new PIXI.Texture(baseTexture, new PIXI.Rectangle(innerRect.left, outerRect.top, innerRect.width, topHeight)));
        _this.bottom = new PIXI.Sprite(new PIXI.Texture(baseTexture, new PIXI.Rectangle(innerRect.left, innerRect.bottom, innerRect.width, bottomHeight)));
        _this.left = new PIXI.Sprite(new PIXI.Texture(baseTexture, new PIXI.Rectangle(outerRect.left, innerRect.top, leftWidth, innerRect.height)));
        _this.right = new PIXI.Sprite(new PIXI.Texture(baseTexture, new PIXI.Rectangle(innerRect.right, innerRect.top, rightWidth, innerRect.height)));
        //Center
        _this.center = new PIXI.Sprite(new PIXI.Texture(baseTexture, innerRect));
        _this.addChild(_this.topLeft, _this.topRight, _this.bottomLeft, _this.bottomRight, _this.top, _this.bottom, _this.left, _this.right, _this.center);
        //Set positions that don't need to change
        _this.top.x = innerRect.left - outerRect.left;
        _this.center.x = _this.top.x;
        _this.bottom.x = _this.top.x;
        _this.left.y = innerRect.top - outerRect.top;
        _this.center.y = _this.left.y;
        _this.right.y = _this.left.y;
        //By default, be the normal size
        _this.setSize(outerRect.width, outerRect.height);
        return _this;
    }
    NineSliceSprite.fromTexture = function (tex, innerRect) {
        var outerRect = tex.frame;
        innerRect = innerRect.clone();
        innerRect.x += outerRect.x;
        innerRect.y += outerRect.y;
        return new NineSliceSprite(tex.baseTexture, innerRect, outerRect);
    };
    NineSliceSprite.prototype.setWidth = function (width, round) {
        if (round === void 0) { round = true; }
        var innerWidth = width - this.topLeft.width - this.topRight.width;
        if (round)
            innerWidth = Math.round(innerWidth);
        //Scale inner portions
        this.top.width = innerWidth;
        this.bottom.width = innerWidth;
        this.center.width = innerWidth;
        //Move right portions
        var x = this.topLeft.width + innerWidth;
        this.topRight.x = x;
        this.right.x = x;
        this.bottomRight.x = x;
    };
    NineSliceSprite.prototype.setHeight = function (height, round) {
        if (round === void 0) { round = true; }
        var innerHeight = height - this.topLeft.height - this.bottomLeft.height;
        if (round)
            innerHeight = Math.round(innerHeight);
        //Scale inner portions
        this.left.height = innerHeight;
        this.right.height = innerHeight;
        this.center.height = innerHeight;
        //Move bottom portions
        var y = this.topLeft.height + innerHeight;
        this.bottomLeft.y = y;
        this.bottom.y = y;
        this.bottomRight.y = y;
    };
    NineSliceSprite.prototype.setSize = function (width, height, round) {
        if (round === void 0) { round = true; }
        this.setWidth(width, round);
        this.setHeight(height, round);
    };
    return NineSliceSprite;
}(PIXI.Container));
exports.default = NineSliceSprite;

},{}],46:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/// <reference path="../declarations/pixi.js.d.ts"/>
var Game_1 = require("../Game");
function simpleRectangle(target, width, height, color, borderWidth, borderColor) {
    if (borderWidth === void 0) { borderWidth = 0; }
    if (borderColor === void 0) { borderColor = 0; }
    //if (!target) target = new PIXI.RenderTexture(Game.instance.renderer, width, height);
    if (!target)
        target = PIXI.RenderTexture.create(width, height);
    var g = new PIXI.Graphics(); //Game.instance.volatileGraphics;
    g.lineStyle(borderWidth, borderColor, 1);
    g.beginFill(color, 1);
    g.drawRect(borderWidth / 2, borderWidth / 2, width - borderWidth, height - borderWidth);
    g.endFill();
    //target.render(g);
    Game_1.default.instance.renderer.render(g, target);
    return target;
}
exports.simpleRectangle = simpleRectangle;

},{"../Game":1}],47:[function(require,module,exports){
"use strict";
/// <reference path="../declarations/pixi.js.d.ts"/>
Object.defineProperty(exports, "__esModule", { value: true });
var TextureLoader = (function () {
    function TextureLoader(sheetName, mapName, callback) {
        this._sheet = null;
        this._map = null;
        this._texCache = {}; //for when they don't need to be unique
        this._callback = callback;
        var _this = this;
        PIXI.loader.add("sheet", sheetName);
        PIXI.loader.load(function (loader, resources) {
            _this._sheet = resources.sheet.texture.baseTexture;
            _this.onSheetOrMap();
        });
        var req = new XMLHttpRequest();
        req.onreadystatechange = function () {
            if (req.readyState == 4 && req.status == 200) {
                _this._map = JSON.parse(req.responseText).frames;
                _this.onSheetOrMap();
            }
        };
        req.open("GET", mapName, true);
        req.send();
    }
    TextureLoader.prototype.get = function (texName, unique) {
        if (unique === void 0) { unique = false; }
        if (!unique && this._texCache.hasOwnProperty(texName)) {
            return this._texCache[texName];
        }
        if (!this._map.hasOwnProperty(texName)) {
            return null; //TODO: (?) return some blank texture
        }
        var frame = this._map[texName].frame;
        var rect = new PIXI.Rectangle(frame.x, frame.y, frame.w, frame.h);
        var tex = new PIXI.Texture(this._sheet, rect);
        if (!unique) {
            this._texCache[texName] = tex;
        }
        return tex;
    };
    TextureLoader.prototype.getData = function () {
        var canvas = document.createElement('canvas');
        var context = canvas.getContext('2d');
        canvas.width = this._sheet.width;
        canvas.height = this._sheet.height;
        context.drawImage(this._sheet.source, 0, 0);
        var data = {};
        var frame;
        for (var texName in this._map) {
            frame = this._map[texName].frame;
            data[texName] = context.getImageData(frame.x, frame.y, frame.w, frame.h);
        }
        return data;
    };
    TextureLoader.prototype.onSheetOrMap = function () {
        var sheet = this._sheet;
        var map = this._map;
        if (sheet === null || map === null)
            return;
        this._callback();
    };
    return TextureLoader;
}());
exports.default = TextureLoader;

},{}],48:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Battle_1 = require("../battle/Battle");
var Game_1 = require("../Game");
var RequestManager_1 = require("../RequestManager");
var BattleManager = (function () {
    function BattleManager(user) {
        this.battleData = [];
        this.user = user;
    }
    Object.defineProperty(BattleManager.prototype, "currentBattle", {
        get: function () { return Game_1.default.instance.currentBattle; },
        enumerable: true,
        configurable: true
    });
    BattleManager.prototype.load = function (data) {
        console.log("BattleManager: load");
        for (var _i = 0, _a = data.battles; _i < _a.length; _i++) {
            var data = _a[_i];
            console.log(data);
            this.battleData.push(data);
        }
    };
    BattleManager.prototype.checkAnyBattleActive = function () {
        for (var _i = 0, _a = this.battleData; _i < _a.length; _i++) {
            var data = _a[_i];
            if (data.end_time == 0)
                return true;
        }
        return false;
    };
    /**
     * When loading the game, if there is already an active battle, use this to jump into it
     */
    BattleManager.prototype.startActiveBattle = function () {
        for (var _i = 0, _a = this.battleData; _i < _a.length; _i++) {
            var data = _a[_i];
            if (data.end_time == 0) {
                var battle = new Battle_1.default(true);
                Game_1.default.instance.setCurrentBattle(battle);
                battle.init(data);
                return;
            }
        }
        console.warn("BattleManager: There was no active battle to start!");
    };
    /**
     *
     * @param dungeonId
     * @param floor
     * @param heroes The heroes to be sent
     */
    BattleManager.prototype.startBattle = function (dungeonId, floor, heroes) {
        var _this = this;
        var heroIds = heroes.map(function (u) { return u.id; });
        RequestManager_1.default.instance.makeUserRequest("start_battle", {
            "dungeon_id": dungeonId,
            "floor": floor,
            "hero_ids": heroIds
        }, function (data) { _this.onStartBattle(data); });
    };
    BattleManager.prototype.onStartBattle = function (data) {
        var battle = new Battle_1.default(true);
        battle.init(data.battle);
        Game_1.default.instance.setCurrentBattle(battle);
    };
    //I'm not actually sure yet what all of these are supposed to mean
    BattleManager.STATE_AVAILABLE = 0;
    BattleManager.STATE_ACTIVE = 1;
    BattleManager.STATE_WON = 2;
    BattleManager.STATE_LOST = 3;
    BattleManager.STATE_ABANDONED = 4;
    return BattleManager;
}());
exports.default = BattleManager;

},{"../Game":1,"../RequestManager":4,"../battle/Battle":6}],49:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Hero = (function () {
    function Hero() {
        this.id = -1;
        this.name = "?";
        this.level = 1;
        this.stats = {};
    }
    Hero.prototype.load = function (data) {
        this.id = data.id;
        this.name = data.name;
        this.level = data.level;
        this.stats = data.stats;
    };
    return Hero;
}());
exports.default = Hero;

},{}],50:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Hero_1 = require("./Hero");
var HeroManager = (function () {
    function HeroManager(user) {
        this.heroes = [];
        this.heroesById = {};
        this.user = user;
    }
    HeroManager.prototype.load = function (data) {
        console.log("heroManager: load");
        for (var _i = 0, _a = data.heroes; _i < _a.length; _i++) {
            var heroData = _a[_i];
            var hero = new Hero_1.default();
            hero.load(heroData);
            this.addhero(hero);
        }
    };
    HeroManager.prototype.addhero = function (hero) {
        this.heroes.push(hero);
        this.heroesById[hero.id] = hero;
    };
    HeroManager.prototype.removehero = function (hero) {
        var index = this.heroes.indexOf(hero);
        if (index == -1)
            return;
        this.heroes.splice(index, 1);
        delete this.heroesById[hero.id];
    };
    HeroManager.prototype.getHero = function (id) {
        var hero = this.heroesById[id];
        if (hero)
            return hero;
        return null;
    };
    return HeroManager;
}());
exports.default = HeroManager;

},{"./Hero":49}],51:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var BattleManager_1 = require("./BattleManager");
var HeroManager_1 = require("./HeroManager");
var Utils = require("../util/Util");
var User = (function () {
    function User() {
        this.loaded = false;
        this.loadedData = null;
        //managers
        this.heroManager = new HeroManager_1.default(this);
        this.battleManager = new BattleManager_1.default(this);
    }
    User.prototype.load = function (data) {
        //probably take this out eventually
        this.loadedData = data;
        console.log("User: load");
        this.userId = data.id;
        this.name = data.name;
        this.stats = data.stats;
        this.token = data.token;
        this.heroManager.load(data);
        this.battleManager.load(data);
        //...
        this.loaded = true;
        console.log("User: load done");
    };
    User.prototype.startGame = function () {
        console.log("User: start game");
        if (this.battleManager.checkAnyBattleActive()) {
            console.log("Start from active battle");
            this.battleManager.startActiveBattle();
        }
        else {
            console.log("Start a new battle");
            //choose up to 4 random heroes
            var heroes = Utils.pickRandomSet(this.heroManager.heroes, 4);
            this.battleManager.startBattle(1, 1, heroes);
        }
    };
    return User;
}());
exports.default = User;

},{"../util/Util":58,"./BattleManager":48,"./HeroManager":50}],52:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var AssetCache = (function () {
    /**
     * Stores objects by key, and discards the oldest once capacity is reached.
     * TODO: Option to keep the most recently used (move to top when accessed, requires LinkedList)
     *
     * If you use this for PIXI.Texture, be sure to set the onDelete to call destroy.
     */
    function AssetCache(capacity, onDelete) {
        if (onDelete === void 0) { onDelete = null; }
        this._assets = {};
        this._keyQueue = [];
        this.onDelete = null;
        this._capacity = capacity;
        this.onDelete = onDelete;
    }
    Object.defineProperty(AssetCache.prototype, "capacity", {
        get: function () { return this._capacity; },
        set: function (value) { this._capacity = value; this.removeExcess(); },
        enumerable: true,
        configurable: true
    });
    AssetCache.prototype.get = function (key) {
        var asset = this._assets[key];
        if (!asset)
            asset = null;
        return asset;
    };
    AssetCache.prototype.set = function (key, asset) {
        if (this.get(key) === null)
            return;
        this._assets[key] = asset;
        this._keyQueue.push(key);
        this.removeExcess();
    };
    AssetCache.prototype.removeExcess = function () {
        if (this._capacity < 1)
            return;
        var key = this._keyQueue.shift();
        while (this._keyQueue.length > this._capacity) {
            if (this.onDelete)
                this.onDelete(this._assets[key]);
            delete this._assets[key];
        }
    };
    return AssetCache;
}());
exports.default = AssetCache;

},{}],53:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var IDObjectGroup = (function () {
    /**
     * Provides safe convenience methods for efficiently tracking a group of objects.
     * Uses an Object and an Array. The Array is public for iteration but should NOT be modified.
     */
    function IDObjectGroup() {
        this.list = [];
        this._map = {};
    }
    /**
     * Returns whether the object is actually added
     */
    IDObjectGroup.prototype.add = function (obj) {
        if (this._map.hasOwnProperty(obj.id.toString()))
            return false;
        this.list.push(obj);
        this._map[obj.id.toString()] = obj;
        return true;
    };
    /**
     * Returns whether the object is actually removed
     */
    IDObjectGroup.prototype.remove = function (obj) {
        if (!this._map.hasOwnProperty(obj.id.toString()))
            return false;
        var index = this.list.indexOf(obj);
        this.list.splice(index, 1);
        delete this._map[obj.id.toString()];
        return true;
    };
    IDObjectGroup.prototype.getById = function (id) {
        var obj = this._map[id.toString()];
        if (obj)
            return obj;
        return null;
    };
    IDObjectGroup.prototype.contains = function (obj) {
        return this.containsById(obj.id);
    };
    IDObjectGroup.prototype.containsById = function (id) {
        return this._map.hasOwnProperty(id.toString());
    };
    Object.defineProperty(IDObjectGroup.prototype, "count", {
        get: function () {
            return this.list.length;
        },
        enumerable: true,
        configurable: true
    });
    return IDObjectGroup;
}());
exports.default = IDObjectGroup;

},{}],54:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/*
   Provides pretty console.log messages, by key.
*/
var types = {};
var isEdge = (function () {
    if (!window.clientInformation)
        return false; //gee thanks firefox
    if (window.clientInformation.appVersion && window.clientInformation.appVersion.indexOf("Edge") != -1)
        return true;
    if (window.clientInformation.userAgent && window.clientInformation.userAgent.indexOf("Edge") != -1)
        return true;
    return false;
})();
var LogType = (function () {
    function LogType(prefix, textColor, bgColor, enabled) {
        if (prefix === void 0) { prefix = ""; }
        if (textColor === void 0) { textColor = "#000"; }
        if (bgColor === void 0) { bgColor = "#fff"; }
        if (enabled === void 0) { enabled = true; }
        this.prefix = prefix;
        this.textColor = textColor;
        this.bgColor = bgColor;
        this.enabled = enabled;
    }
    LogType.prototype.log = function (msg) {
        if (this.enabled) {
            if (isEdge) {
                //doesn't support css in logs
                console.log(this.prefix + msg);
            }
            else {
                console.log("%c" + this.prefix + msg, "background:" + this.bgColor + "; color:" + this.textColor + ";");
            }
        }
    };
    return LogType;
}());
exports.LogType = LogType;
function setLogType(name, type) {
    if (!types.hasOwnProperty(name))
        types[name] = type;
}
exports.setLogType = setLogType;
function log(typeName, msg) {
    if (types.hasOwnProperty(typeName))
        types[typeName].log(msg);
}
exports.log = log;

},{}],55:[function(require,module,exports){
"use strict";
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
/// <reference path="../declarations/pixi.js.d.ts"/>
var Game_1 = require("../Game");
//var mainFont: string = "VT323";
var mainFont = "Arial";
exports.styles = {
    unitID: new PIXI.TextStyle({ fontSize: 14, fontFamily: mainFont, fill: 0xffffff, align: 'left' })
};
/** For scaling without interpolation */
var TextSprite = (function (_super) {
    __extends(TextSprite, _super);
    function TextSprite(text, style) {
        var _this = _super.call(this) || this;
        _this.renderTex = null;
        _this.setText(text, style);
        return _this;
    }
    Object.defineProperty(TextSprite.prototype, "text", {
        get: function () { return this._text; },
        set: function (text) {
            this.setText(text, this._style);
        },
        enumerable: true,
        configurable: true
    });
    TextSprite.prototype.setText = function (text, style) {
        this._text = text;
        this._style = style;
        var oldTex = this.renderTex;
        var pixiText = new PIXI.Text(text, style);
        var bounds = pixiText.getBounds();
        this.renderTex = PIXI.RenderTexture.create(bounds.width, bounds.height);
        Game_1.default.instance.renderer.render(pixiText, this.renderTex);
        this.texture = this.renderTex;
        if (oldTex) {
            oldTex.destroy();
        }
    };
    return TextSprite;
}(PIXI.Sprite));
exports.TextSprite = TextSprite;

},{"../Game":1}],56:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Game_1 = require("../Game");
var Timer = (function () {
    function Timer() {
        this._id = -1;
        this._active = true;
        this._addedToUpdater = false;
        this._id = Timer.nextId++;
    }
    Object.defineProperty(Timer.prototype, "duration", {
        get: function () { return this._duration; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Timer.prototype, "timeRemaining", {
        get: function () { return this._duration - this._currentTime; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Timer.prototype, "active", {
        get: function () { return this._active; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Timer.prototype, "id", {
        get: function () { return this._id; },
        enumerable: true,
        configurable: true
    });
    Timer.prototype.init = function (time, onFinish) {
        this._duration = time;
        this._onFinish = onFinish;
        this._currentTime = 0;
        return this;
    };
    Timer.prototype.update = function (timeElapsed) {
        if (this._active) {
            this._currentTime += timeElapsed;
            if (this._currentTime >= this._duration) {
                this._active = false;
                this.setUpdating(false);
                this._onFinish();
            }
        }
    };
    Timer.prototype.start = function () {
        this._active = true;
        this.setUpdating(true);
        return this;
    };
    Timer.prototype.stop = function () {
        this._active = false;
        this.setUpdating(false);
    };
    /*public pause() {
        this._active = false;
        this.setUpdating(false);
    }

    public resume() {
        this._active = true;
        this.setUpdating(true);
    }*/
    Timer.prototype.setUpdating = function (updating) {
        if (updating && !this._addedToUpdater) {
            Game_1.default.instance.updater.add(this);
            this._addedToUpdater = true;
        }
        else if (!updating && this._addedToUpdater) {
            Game_1.default.instance.updater.remove(this);
            this._addedToUpdater = false;
        }
    };
    Timer.prototype.toString = function () {
        return "Timer " + this.id + " (" + this._currentTime + " / " + this._duration + ")";
    };
    Timer.nextId = 1;
    return Timer;
}());
exports.default = Timer;

},{"../Game":1}],57:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Game_1 = require("../Game");
var Tween = (function () {
    function Tween() {
        this._id = -1;
        this._active = false;
        this._initialized = false;
        this._addedToUpdater = false;
        this.onUpdate = null;
        this.onFinish = null;
        this.roundValue = false;
        this._id = Tween.nextId++;
    }
    Object.defineProperty(Tween.prototype, "timeRemaining", {
        get: function () { return this._duration - this._currentTime; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Tween.prototype, "active", {
        get: function () { return this._active; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Tween.prototype, "id", {
        get: function () { return this._id; },
        enumerable: true,
        configurable: true
    });
    Tween.prototype.update = function (timeElapsed) {
        if (this._active) {
            this._currentTime = Math.min(this._currentTime + timeElapsed, this._duration);
            var value = this._easingFunction(this._currentTime, this._startValue, this._endValue - this._startValue, this._duration);
            if (this.roundValue)
                value = Math.round(value);
            this._target[this._property] = value;
            if (this.onUpdate)
                this.onUpdate();
            if (this.timeRemaining <= 0) {
                this._active = false;
                this.setUpdating(false);
                if (this.onFinish)
                    this.onFinish();
            }
        }
    };
    Tween.prototype.init = function (target, property, startValue, endValue, duration, easingFunction) {
        this._target = target;
        this._property = property;
        this._startValue = startValue;
        this._endValue = endValue;
        this._duration = duration;
        this._easingFunction = easingFunction;
        this._active = false;
        this._currentTime = 0;
        this._initialized = true;
        return this;
    };
    Tween.prototype.start = function () {
        if (!this._initialized) {
            console.error("Tween: can't start (not initialized)");
            return;
        }
        if (this._duration > 0) {
            this._active = true;
            this._target[this._property] = this._startValue;
            this.setUpdating(true);
        }
        else {
            this._active = false;
            this._target[this._property] = this._endValue;
            this.setUpdating(false);
            if (this.onFinish)
                this.onFinish();
        }
    };
    Tween.prototype.stop = function () {
        this._active = true;
        this.setUpdating(true);
    };
    /*public pause() {
        this._active = false;
        this.setUpdating(false);
    }

    public resume() {
        this._active = true;
        this.setUpdating(true);
    }*/
    Tween.prototype.setUpdating = function (updating) {
        if (updating && !this._addedToUpdater) {
            Game_1.default.instance.updater.add(this);
            this._addedToUpdater = true;
        }
        else if (!updating && this._addedToUpdater) {
            Game_1.default.instance.updater.remove(this);
            this._addedToUpdater = false;
        }
    };
    Tween.prototype.toString = function () {
        return "Tween " + this.id;
    };
    Tween.nextId = 1;
    Tween.easingFunctions = {
        //(current)time, base, change, duration
        //http://gizma.com/easing/
        linear: function (t, b, c, d) {
            return c * t / d + b;
        },
        quadEaseIn: function (t, b, c, d) {
            t /= d;
            return c * t * t + b;
        },
        quadEaseOut: function (t, b, c, d) {
            t /= d;
            return -c * t * (t - 2) + b;
        },
        quadEaseInOut: function (t, b, c, d) {
            t /= d / 2;
            if (t < 1)
                return c / 2 * t * t + b;
            t--;
            return -c / 2 * (t * (t - 2) - 1) + b;
        },
        cubeEaseIn: function (t, b, c, d) {
            t /= d;
            return c * t * t * t + b;
        },
        cubeEaseOut: function (t, b, c, d) {
            t /= d;
            t--;
            return c * (t * t * t + 1) + b;
        },
        cubeEaseInOut: function (t, b, c, d) {
            t /= d / 2;
            if (t < 1)
                return c / 2 * t * t * t + b;
            t -= 2;
            return c / 2 * (t * t * t + 2) + b;
        },
        quartEaseIn: function (t, b, c, d) {
            t /= d;
            return c * t * t * t * t + b;
        },
        quartEaseOut: function (t, b, c, d) {
            t /= d;
            t--;
            return -c * (t * t * t * t - 1) + b;
        },
        quartEaseInOut: function (t, b, c, d) {
            t /= d / 2;
            if (t < 1)
                return c / 2 * t * t * t * t + b;
            t -= 2;
            return -c / 2 * (t * t * t * t - 2) + b;
        },
        sineEaseIn: function (t, b, c, d) {
            return -c * Math.cos(t / d * (Math.PI / 2)) + c + b;
        },
        sineEaseOut: function (t, b, c, d) {
            return c * Math.sin(t / d * (Math.PI / 2)) + b;
        },
        sineEaseInOut: function (t, b, c, d) {
            return -c / 2 * (Math.cos(Math.PI * t / d) - 1) + b;
        }
    };
    return Tween;
}());
exports.default = Tween;

},{"../Game":1}],58:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function noop() { }
exports.noop = noop;
////////////////////////////////////////
// Objects
////////////////////////////////////////
function shallowCopy(obj) {
    var ret = {};
    var keys = Object.keys(obj);
    var prop;
    for (var i = 0; i < keys.length; i++) {
        prop = keys[i];
        ret[prop] = obj[prop];
    }
    return ret;
}
exports.shallowCopy = shallowCopy;
////////////////////////////////////////
// Arrays
////////////////////////////////////////
function shuffleArray(array) {
    var counter = array.length;
    // While there are elements in the array
    while (counter > 0) {
        // Pick a random index
        var index = Math.floor(Math.random() * counter);
        // Decrease counter by 1
        counter--;
        // And swap the last element with it
        var temp = array[counter];
        array[counter] = array[index];
        array[index] = temp;
    }
    return array;
}
exports.shuffleArray = shuffleArray;
function pickRandom(array) {
    var len = array.length;
    if (len == 0)
        return null;
    return array[Math.floor(Math.random() * len)];
}
exports.pickRandom = pickRandom;
function pickRandomSet(array, amount) {
    array = array.slice();
    var len = array.length;
    if (len <= amount)
        return array;
    shuffleArray(array);
    return array.slice(0, amount);
}
exports.pickRandomSet = pickRandomSet;
/**
 * Adds value to the array, if it's not already in the array. Returns whether it did anything.
 */
function ArrayAdd(array, value) {
    if (array.indexOf(value) == -1) {
        array.push(value);
        return true;
    }
    return false;
}
exports.ArrayAdd = ArrayAdd;
/**
 * Removes value from array, if it exists. Returns whether it did anything.
 */
function ArrayRemove(array, value) {
    var index = array.indexOf(value);
    if (index != -1) {
        array.splice(index, 1);
        return true;
    }
    return false;
}
exports.ArrayRemove = ArrayRemove;
////////////////////////////////////////
// Strings
////////////////////////////////////////
/**
 * Slight misnomer. Removes the first and last characters from a string. Assumes it is long enough to do so.
 */
function stripBraces(s) {
    //might more accurately be called stripFirstAndLastCharacters but that's LONG
    return s.substr(1, s.length - 1);
}
exports.stripBraces = stripBraces;
////////////////////////////////////////
// Numbers
////////////////////////////////////////
function clamp(num, min, max) {
    if (num > max)
        return max;
    if (num < min)
        return min;
    return num;
}
exports.clamp = clamp;
////////////////////////////////////////
// Type Checking
////////////////////////////////////////
function isString(x) {
    return (typeof x === 'string' || x instanceof String);
}
exports.isString = isString;
function isInt(x) {
    return (isNumber(x) && Math.floor(x) == x);
}
exports.isInt = isInt;
function isNumber(x) {
    return (typeof x === 'number');
}
exports.isNumber = isNumber;
/**
 * Returns whether x is an array, and optionally, whether its length is len
 */
function isArray(x, len) {
    if (len === void 0) { len = -1; }
    if (Array.isArray(x)) {
        if (len < 0)
            return true;
        return x.length == len;
    }
    return false;
}
exports.isArray = isArray;
function isObject(x, allowNull) {
    if (allowNull === void 0) { allowNull = false; }
    return (typeof x === 'object' && !isArray(x) && (x != null || allowNull));
}
exports.isObject = isObject;
/**
 * Returns true if x is an array of two numbers.
 */
function isCoordinate(x) {
    return (isArray(x) && x.length == 2 && isNumber(x[0]) && isNumber(x[1]));
}
exports.isCoordinate = isCoordinate;

},{}],59:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Util = require("./Util");
var Vector2D = (function () {
    function Vector2D(x, y) {
        if (x === void 0) { x = 0; }
        if (y === void 0) { y = 0; }
        this.x = x;
        this.y = y;
    }
    Vector2D.prototype.set = function (v) {
        this.x = v.x;
        this.y = v.y;
        return this;
    };
    Vector2D.prototype.add = function (v) {
        this.x += v.x;
        this.y += v.y;
        return this;
    };
    Vector2D.prototype.addScaled = function (v, scale) {
        this.x += v.x * scale;
        this.y += v.y * scale;
        return this;
    };
    Vector2D.prototype.sub = function (v) {
        this.x -= v.x;
        this.y -= v.y;
        return this;
    };
    Vector2D.prototype.round = function () {
        this.x = Math.round(this.x);
        this.y = Math.round(this.y);
        return this;
    };
    Vector2D.prototype.scale = function (scale) {
        this.x *= scale;
        this.y *= scale;
        return this;
    };
    Vector2D.prototype.offset = function (angle, distance) {
        angle = Vector2D.degToRad(angle);
        this.x += distance * Math.cos(angle);
        this.y += distance * Math.sin(angle);
        return this;
    };
    Vector2D.prototype.normalize = function () {
        if (this.x == 0 && this.y == 0)
            this.x = 1;
        else
            this.scale(1 / this.length());
        return this;
    };
    ///////////////////////////////////////////////////////////////////
    // functions which return a result (not this)
    ///////////////////////////////////////////////////////////////////
    Vector2D.prototype.clone = function () {
        return new Vector2D(this.x, this.y);
    };
    Vector2D.prototype.length = function () {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    };
    Vector2D.prototype.midpoint = function () {
        return this.clone().scale(0.5);
    };
    Vector2D.prototype.midpointTo = function (other) {
        return other.clone().sub(this).midpoint();
    };
    Vector2D.prototype.equals = function (other) {
        return (this.x == other.x && this.y == other.y);
    };
    Vector2D.prototype.distanceTo = function (other) {
        //avoid creating and discarding
        var ret;
        other.sub(this);
        ret = other.length();
        other.add(this);
        return ret;
    };
    Vector2D.prototype.angleTo = function (other) {
        if (!other)
            return 0;
        return Vector2D.radToDeg(Math.atan2(other.y - this.y, other.x - this.x));
    };
    Vector2D.prototype.withinDistance = function (other, distance) {
        var xDiff = other.x - this.x;
        var yDiff = other.y - this.y;
        var squareDist = xDiff * xDiff + yDiff * yDiff;
        return (squareDist <= distance * distance);
    };
    Vector2D.prototype.toJSON = function () {
        return [this.x, this.y];
    };
    Vector2D.prototype.toString = function () {
        return "[" + this.x + "," + this.y + "]";
    };
    Vector2D.polar = function (angle, distance) {
        return new Vector2D(0, 0).offset(angle, distance);
    };
    Vector2D.fromArray = function (arr) {
        if (Util.isCoordinate(arr))
            return Vector2D.fromArrayUnchecked(arr);
        console.log("Vector2D: invalid array");
        console.log(arr);
        return new Vector2D();
    };
    Vector2D.fromArrayUnchecked = function (arr) {
        return new Vector2D(arr[0], arr[1]);
    };
    Vector2D.degToRad = function (angle) {
        return (angle * Math.PI) / 180.0;
    };
    Vector2D.radToDeg = function (angle) {
        return (angle * 180) / Math.PI;
    };
    return Vector2D;
}());
exports.default = Vector2D;

},{"./Util":58}]},{},[3]);
