// A simple static interval tree: static in the sense that
// we only do bulk loading, no add/remove after initial load.
//
// Because we don't support add/remove, we don't need a binary tree
// implementation that retains balance during add/remove (avl, red-black). Instead we
// can sort, then build a tree from the sort.

/*global module: false, require: false */
'use strict';

// Build a balanced binary tree from an ordered array.
function toTree(arr, low, high) {
	if (low >= high) {
		return undefined;
	}
	var mid = Math.floor((high + low) / 2);
	return {
		el: arr[mid],
		right: toTree(arr, mid + 1, high),
		left: toTree(arr, low, mid)
	};
}

var getHigh = ({high}={high: -Infinity}) => high;

// Find the highest end value of each node. Mutates its input.
function findEnd(node) {
	if (!node) {
		return undefined;
	}
	var {left, right, el} = node;
	findEnd(left);
	findEnd(right);
	node.high = Math.max(getHigh(left), getHigh(right), el.end);
	return node;
}

var cmp = (x, y) => x === y ? 0 : (x < y ? -1 : 1);

// Build index.
// intervals :: [{start, end, ...}, ...]
function index(intervals) {
	var sorted = intervals.slice(0).sort((a, b) => cmp(a.start, b.start));
	return findEnd(toTree(sorted, 0, sorted.length));
}

// Find intervals in node overlapping position.
// pos :: {start, end}
function matches(node, pos) {
	if (!node) {
		return [];
	}
	var {start, end} = pos;
	return (node.high <= start ? [] :    // no matches in this node
			(end <= node.el.start ? [] : // no match of this node or on right of this node
				matches(node.right, pos).concat(node.el.end <= start ? [] : [node.el]))
					.concat(matches(node.left, pos)));
}

module.exports = {
	matches: matches,
	index: index,
	toTree: arr => toTree(arr, 0, arr.length)
};
