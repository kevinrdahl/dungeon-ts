/// <reference path="../declarations/pixi.js.d.ts"/>

export default class NineSliceSprite extends PIXI.Container {
	//Corners
	private topLeft: PIXI.Sprite;
	private topRight: PIXI.Sprite;
	private bottomLeft: PIXI.Sprite;
	private bottomRight: PIXI.Sprite;

	//Edges
	private top: PIXI.Sprite;
	private bottom: PIXI.Sprite;
	private left: PIXI.Sprite;
	private right: PIXI.Sprite;

	//Centre (center, ugh just code in American)
	private center: PIXI.Sprite;

	public static fromTexture(tex:PIXI.Texture, innerRect:PIXI.Rectangle):NineSliceSprite {
		var outerRect = tex.frame;
		innerRect = innerRect.clone();
		innerRect.x += outerRect.x;
		innerRect.y += outerRect.y;

		return new NineSliceSprite(tex.baseTexture, innerRect, outerRect);
	}

	/**
	 * It's a nine-sliced sprite! If you set it too small, don't expect it to look good.
	 * @param baseTexture Texture containing the image you want to scale.
	 * @param innerRect Defines the interior rectangle which is scaled. For a 16x16 image with a 2px border, this would be rect(2,2,12,12)
	 * @param outerRect Defines the region of the base texture to be used. If not provided, the whole texture will be used.
	 */
	constructor(baseTexture:PIXI.BaseTexture, innerRect:PIXI.Rectangle, outerRect:PIXI.Rectangle = null) {
		super();
		if (!outerRect) outerRect = new PIXI.Rectangle(0, 0, baseTexture.width, baseTexture.height);

		var leftWidth = innerRect.left - outerRect.left;
		var rightWidth = outerRect.right - innerRect.right;
		var topHeight = innerRect.top - outerRect.top;
		var bottomHeight = outerRect.bottom - innerRect.bottom;

		//Corners
		this.topLeft = new PIXI.Sprite(new PIXI.Texture(baseTexture, new PIXI.Rectangle(
			outerRect.left, outerRect.top, leftWidth, topHeight
		)));

		this.topRight = new PIXI.Sprite(new PIXI.Texture(baseTexture, new PIXI.Rectangle(
			innerRect.right, outerRect.top, rightWidth, topHeight
		)));

		this.bottomLeft = new PIXI.Sprite(new PIXI.Texture(baseTexture, new PIXI.Rectangle(
			outerRect.left, innerRect.bottom, leftWidth, bottomHeight
		)));

		this.bottomRight = new PIXI.Sprite(new PIXI.Texture(baseTexture, new PIXI.Rectangle(
			innerRect.right, innerRect.bottom, rightWidth, bottomHeight
		)));

		//Edges
		this.top = new PIXI.Sprite(new PIXI.Texture(baseTexture, new PIXI.Rectangle(
			innerRect.left, outerRect.top, innerRect.width, topHeight
		)));

		this.bottom = new PIXI.Sprite(new PIXI.Texture(baseTexture, new PIXI.Rectangle(
			innerRect.left, innerRect.bottom, innerRect.width, bottomHeight
		)));

		this.left = new PIXI.Sprite(new PIXI.Texture(baseTexture, new PIXI.Rectangle(
			outerRect.left, innerRect.top, leftWidth, innerRect.height
		)));

		this.right = new PIXI.Sprite(new PIXI.Texture(baseTexture, new PIXI.Rectangle(
			innerRect.right, innerRect.top, rightWidth, innerRect.height
		)));

		//Center
		this.center = new PIXI.Sprite(new PIXI.Texture(baseTexture, innerRect));

		this.addChild(
			this.topLeft,
			this.topRight,
			this.bottomLeft,
			this.bottomRight,
			this.top,
			this.bottom,
			this.left,
			this.right,
			this.center
		);

		//Set positions that don't need to change
		this.top.x = innerRect.left - outerRect.left;
		this.center.x = this.top.x;
		this.bottom.x = this.top.x;
		this.left.y = innerRect.top - outerRect.top;
		this.center.y = this.left.y;
		this.right.y = this.left.y;

		//By default, be the normal size
		this.setSize(outerRect.width, outerRect.height);
	}

	public setWidth(width:number, round=true) {
		var innerWidth = width - this.topLeft.width - this.topRight.width;
		if (round) innerWidth = Math.round(innerWidth);

		//Scale inner portions
		this.top.width = innerWidth;
		this.bottom.width = innerWidth;
		this.center.width = innerWidth;

		//Move right portions
		var x = this.topLeft.width + innerWidth;
		this.topRight.x = x;
		this.right.x = x;
		this.bottomRight.x = x;
	}

	public setHeight(height:number, round=true) {
		var innerHeight = height - this.topLeft.height - this.bottomLeft.height;
		if (round) innerHeight = Math.round(innerHeight);

		//Scale inner portions
		this.left.height = innerHeight;
		this.right.height = innerHeight;
		this.center.height = innerHeight;

		//Move bottom portions
		var y = this.topLeft.height + innerHeight;
		this.bottomLeft.y = y;
		this.bottom.y = y;
		this.bottomRight.y = y;
	}

	public setSize(width:number, height:number, round=true) {
		this.setWidth(width, round);
		this.setHeight(height, round);
	}
}