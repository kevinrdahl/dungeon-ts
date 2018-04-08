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
