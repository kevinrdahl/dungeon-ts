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
var LogType = /** @class */ (function () {
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
