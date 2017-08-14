/// <reference path="../declarations/pixi.js.d.ts"/>

export default class TextureLoader {
	private _sheet:PIXI.BaseTexture = null;
	private _map:Object = null;
	private _callback:any;
	private _texCache:Object = {}; //for when they don't need to be unique

	constructor(sheetName:string, mapName:string, callback) {
		this._callback = callback;

		var _this:TextureLoader = this;

		PIXI.loader.add("sheet", sheetName);
		PIXI.loader.load(function(loader, resources) {
			_this._sheet = resources.sheet.texture.baseTexture;
			_this.onSheetOrMap();
		});

		var req = new XMLHttpRequest();

		req.onreadystatechange = function () {
			if (req.readyState == 4 && req.status == 200) {
				_this._map = JSON.parse(req.responseText).frames;
				_this.onSheetOrMap();
			}
		}
		req.open("GET", mapName, true);
		req.send();
	}

	public get(texName:string, unique:boolean = false):PIXI.Texture {
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
	}

	public getData() {
		var canvas = document.createElement('canvas');
		var context:CanvasRenderingContext2D = canvas.getContext('2d');
		canvas.width = this._sheet.width;
		canvas.height = this._sheet.height;
		context.drawImage(this._sheet.source, 0, 0);

		var data = {};
		var frame:any;
		for (var texName in this._map) {
			frame = this._map[texName].frame;
			data[texName] = context.getImageData(frame.x, frame.y, frame.w, frame.h);
		}

		return data;
	}

	private onSheetOrMap() {
		var sheet:PIXI.BaseTexture = this._sheet;
		var map:Object = this._map;

		if (sheet === null || map === null) return;

		this._callback();
	}
}