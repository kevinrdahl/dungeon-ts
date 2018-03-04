"use strict";
/// <reference path="./declarations/jquery.d.ts"/>
Object.defineProperty(exports, "__esModule", { value: true });
var Log = require("./util/Log");
var Game_1 = require("./Game");
var RequestManager = /** @class */ (function () {
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
