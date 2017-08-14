/**
 * It's a Binary Heap!
 *
 * Shamelessly copied from:
 * https://github.com/yckart/BinaryHeap/blob/master/index.js
 */
export default class BinaryHeap<T> {
	private scoreFunction: (a: T) => number;
	private content:Array<T>;

	get size():number { return this.content.length; }
	get empty():boolean { return typeof this.content[0] === "undefined"; }

	constructor(scoreFunc:(a:T)=>number = null, content:Array<T> = null) {
		if (scoreFunc == null) {
			scoreFunc = (a:T) => {
				return Number(a);
			}
		}
		this.scoreFunction = scoreFunc;
		this.content = (content) ? content.slice() : [];
		if (this.content.length > 0) this.build();
	}

	/**
	 * Adds an element to the heap.
	 * O(log n)
	 * Building the heap this way would be O(n log n), so avoid doing that.
	 * @param element
	 */
	public push(element:T):BinaryHeap<T> {
		// Add the new element to the end of the array.
		this.content.push(element);

		// Allow it to bubble up.
		return this.bubbleUp(this.content.length - 1);
	}

	/**
	 * Use this when adding LOTS of elements. If only a few, pushing is still best.
	 * O(n)
	 * @param elements
	 */
	public pushMany(elements:Array<T>):BinaryHeap<T> {
		this.content = this.content.concat(elements);
		return this.build();
	}

	/**
	 * Clears the current content and rebuilds the heap.
	 * O(n)
	 * @param elements
	 */
	public rebuild(elements:Array<T>):BinaryHeap<T> {
		this.content = elements.slice();
		return this.build();
	}

	/**
	 * Removes and returns the element with the lowest score (delete-min).
	 * O(log n)
	 */
	public pop():T {
		// Store the first element so we can return it later.
		var result = this.content[0];

		// Get the element at the end of the array.
		var end = this.content.pop();

		// If there are any elements left, put the end element at the
		// start, and let it sink down.
		if (this.content.length > 0) {
			this.content[0] = end;
			this.sinkDown(0);
		}

		return result;
	}

	/**
	 * Gets the element with lowest score.
	 * O(1)
	 */
	public peek():T {
		return this.content && this.content.length ? this.content[0] : null;
	}

	/**
	 * Checks if the element is in this heap.
	 * O(n)
	 * @param element
	 */
	public contains(element:T):boolean {
		return this.content.indexOf(element) !== -1;
	}

	/**
	 * Gets it outta here.
	 * O(log n)
	 * @param element
	 */
	public remove(element:T):BinaryHeap<T> {
		var len = this.content.length;

		// To remove a value, we must search
		// through the array to find it.
		for (var i = 0; i < len; i++) {
			if (this.content[i] === element) {

				// When it is found, the process seen in 'pop' is repeated
				// to fill up the hole.
				var end = this.content.pop();

				if (i !== len - 1) {
					this.content[i] = end;

					if (this.scoreFunction(end) < this.scoreFunction(element)) {
						this.bubbleUp(i);
					} else {
						this.sinkDown(i);
					}
				}
				return this;
			}
		}

		return this;
	}

	/**
	 * Removes all elements.
	 */
	public clear():BinaryHeap<T> {
		this.content = [];
		return this;
	}

	/**
	 * Re-sorts assuming the element's value has decreased.
	 * O(log n)
	 * @param element
	 */
	public decrease(element:T):BinaryHeap<T> {
		return this.sinkDown(this.content.indexOf(element));
	}

	/**
	 * Builds the heap with no assumptions about the current order of the content.
	 * This is O(n)
	 */
	private build():BinaryHeap<T> {
		var i = Math.floor(this.content.length / 2);
		while (i--) this.sinkDown(i);

		return this;
	}

	private bubbleUp(n:number):BinaryHeap<T> {
		// Fetch the element that has to be moved.
		var element = this.content[n];

		// When at 0, an element can not go up any further.
		while (n > 0) {
			// Compute the parent element's index, and fetch it.
			var parentN = Math.floor((n + 1) / 2) - 1;
			var parent = this.content[parentN];

			if (this.scoreFunction(element) < this.scoreFunction(parent)) {
				// Swap the elements if the parent is greater.
				this.content[parentN] = element;
				this.content[n] = parent;

				// Update `n` to continue at the new position.
				n = parentN;
			} else {
				// Found a parent that is less, no need to move it further.
				break;
			}
		}

		return this;
	}

	private sinkDown(n:number):BinaryHeap<T> {
		// Look up the target element and its score.
		var length = this.content.length;
		var element = this.content[n];
		var elemScore = this.scoreFunction(element);

		do {
			// Compute the indices of the child elements.
			var child2N = (n + 1) * 2;
			var child1N = child2N - 1;

			// This is used to store the new position of the element, if any.
			var swap = -1;

			// If the first child exists (is inside the array)...
			if (child1N < length) {
				// Look it up and compute its score.
				var child1 = this.content[child1N];
				var child1Score = this.scoreFunction(child1);

				// If the score is less than our element's, we need to swap.
				if (child1Score < elemScore) swap = child1N;
			}

			// Do the same checks for the other child.
			if (child2N < length) {
				var child2 = this.content[child2N];
				var child2Score = this.scoreFunction(child2);

				if (child2Score < (swap === -1 ? elemScore : child1Score)) swap = child2N;
			}

			// If the element needs to be moved, swap it, and continue.
			if (swap !== -1) {
				this.content[n] = this.content[swap];
				this.content[swap] = element;
				n = swap;
			}
		} while (swap !== -1);

		return this;
	}
}