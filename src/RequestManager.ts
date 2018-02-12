/// <reference path="./declarations/jquery.d.ts"/>

import * as Log from './util/Log';
import User from './user/User';
import Game from './Game';

export default class RequestManager {
    public baseUrl = "http://localhost:8000/dungeon";
    public static instance:RequestManager = new RequestManager();
    private requestQueue:Array<any> = [];
    private requestActive = false;

    constructor(baseUrl:string = null) {
        if (RequestManager.instance === null) {
			RequestManager.instance = this;
		} else {
			Log.log("error", "There's already a RequestManager!");
			return;
		}
        if (baseUrl !== null) this.baseUrl = baseUrl;
    }

    /**
     * Makes an HTTP request! Most game-related requests should use makeUserRequest
     * @param instant If false, the request will wait for others to complete (preferred)
     */
    public makeRequest(type:string, params:object, callback:(data)=>void, instant=false)
    {
        if (instant || !this.requestActive) {
            this.makeRequestInternal(type, params, callback, instant);
        }
        else {
            this.requestQueue.push({
                type: type,
                params: params,
                callback:callback
            });
        }
    }

    /**
     * Same as makeRequest, but inserts user_id and token into the params
     * @param instant If false, the request will wait for others to complete (preferred)
     */
    public makeUserRequest(type:string, params:object, callback:(data)=>void, instant=false) {
        var user:User = Game.instance.user;
        if (user) {
            params["user_id"] = user.userId;
            params["token"] = user.token;
            this.makeRequest(type, params, callback, instant);
        } else {
            console.error("Trying to make a user request with no user");
        }
    }

    private makeRequestInternal(type:string, params:object, callback:(data)=>void, instant:boolean) {
        if (!instant) this.requestActive = true;

        console.log("REQUEST '" + type + "'");
        console.log(params);

        $.post(this.baseUrl + '/' + type, {"params": JSON.stringify(params)})
            .done(function(data) {
                console.log("RESPONSE '" + type + "'");
                console.log(data);
                callback(data);
            })
            .fail(function(e) {
                console.log("Request '" + type + "' failed");
                console.log(e);
                callback(null);
            })
            .always(() => {
                if (!instant)
                {
                    var request = this.requestQueue.pop();
                    if (request) {
                        this.makeRequestInternal(request.type, request.params, request.callback, false);
                    } else {
                        this.requestActive = false;
                    }
                }
            });
    }
}