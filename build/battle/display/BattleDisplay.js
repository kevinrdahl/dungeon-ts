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
