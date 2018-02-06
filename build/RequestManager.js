"use strict";
/// <reference path="./declarations/jquery.d.ts"/>
Object.defineProperty(exports, "__esModule", { value: true });
var Log = require("./util/Log");
var RequestManager = (function () {
    function RequestManager(baseUrl) {
        if (baseUrl === void 0) { baseUrl = null; }
        this.baseUrl = "http://localhost:8000/dungeon";
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
    RequestManager.instance = new RequestManager();
    return RequestManager;
}());
exports.default = RequestManager;
