/// <reference path="./declarations/jquery.d.ts"/>

import * as Log from './util/Log';

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

    public makeRequest(type:string, params:object, callback:(data)=>void, instant=false)
    {
        if (instant || !this.requestActive)
        {
            this.makeRequestInternal(type, params, callback, instant);
        }
        else
        {
            this.requestQueue.push({
                type: type,
                params: params,
                callback:callback
            });
        }
    }

    private makeRequestInternal(type:string, params:object, callback:(data)=>void, instant:boolean)
    {
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