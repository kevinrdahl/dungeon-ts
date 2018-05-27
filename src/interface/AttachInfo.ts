import Vector2D from '../util/Vector2D';

export default class AttachInfo {
	public static TLtoTL:AttachInfo = new AttachInfo(new Vector2D(0,0), new Vector2D(0,0), new Vector2D(0,0));
	public static TLtoTR:AttachInfo = new AttachInfo(new Vector2D(0,0), new Vector2D(1,0), new Vector2D(0,0));
	public static TLtoBL:AttachInfo = new AttachInfo(new Vector2D(0,0), new Vector2D(0,1), new Vector2D(0,0));
	public static TRtoTR:AttachInfo = new AttachInfo(new Vector2D(1,0), new Vector2D(1,0), new Vector2D(0,0));
	public static BLtoBL:AttachInfo = new AttachInfo(new Vector2D(0,1), new Vector2D(0,1), new Vector2D(0,0));
	public static BRtoBR:AttachInfo = new AttachInfo(new Vector2D(1,1), new Vector2D(1,1), new Vector2D(0,0));

	public static Center: AttachInfo = new AttachInfo(new Vector2D(0.5, 0.5), new Vector2D(0.5, 0.5), new Vector2D(0, 0));
	public static TopCenter: AttachInfo = new AttachInfo(new Vector2D(0.5, 0), new Vector2D(0.5, 0), new Vector2D(0, 0));
	public static BottomCenter: AttachInfo = new AttachInfo(new Vector2D(0.5, 1), new Vector2D(0.5, 1), new Vector2D(0, 0));
	public static RightCenter: AttachInfo = new AttachInfo(new Vector2D(1, 0.5), new Vector2D(1, 0.5), new Vector2D(0, 0));
	public static LeftCenter: AttachInfo = new AttachInfo(new Vector2D(0, 0.5), new Vector2D(0, 0.5), new Vector2D(0, 0));

	/**
	 *
	 * @param from Point on this object, defined as a factor of its dimensions
	 * @param to Point on the other object, defined as a factor of its dimensions
	 * @param offset Pixel offset for the object being attached
	 */
	constructor (
		public from:Vector2D,
		public to:Vector2D,
		public offset:Vector2D
	) {}

	public clone():AttachInfo {
		return new AttachInfo(this.from.clone(), this.to.clone(), this.offset.clone());
	}

	/**
	 * Gets a copy of this AttachInfo, with x and y added to its offset
	 * @param x
	 * @param y
	 */
	public withOffset(x:number, y:number) {
		var info = this.clone();
		info.offset.x += x;
		info.offset.y += y;
		return info;
	}
}