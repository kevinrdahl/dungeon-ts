export default class Layout {
	public id:number = -1;
	public width:number = 0;
	public height:number = 0;
	public tiles:number[] = [];

	public readData(data) {
		this.id = data.id;
		this.width = data.width;
		this.height = data.height;

		this.parseTiles(data.tiles);
	}

	public getTileType(x: number, y: number):number {
		if (x < 0 || x >= this.width || y < 0 || y >= this.height) return 0;
		var index = this.width * y + x;
		return this.tiles[index];
	}

	private parseTiles(runLength:number[]) {
		this.tiles = [];

		for (var i = 0; i < runLength.length; i += 2) {
			var type = runLength[i];
			var num = runLength[i+1];

			for (var j = 0; j < num; j++) {
				this.tiles.push(type);
			}
		}
	}
}