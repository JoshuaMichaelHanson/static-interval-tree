/*global describe: false, require: false, it: false */
'use strict';
var _ = require('underscore');
//var assert = require('assert');
var jsc = require('jsverify');
var {toTree, index, matches, matches01} = require('../js/index');

function flatten(tree) {
	return tree ? flatten(tree.left).concat([tree.el]).concat(flatten(tree.right)) :
		[];
}

function depth(d, node) {
	return node ? Math.max(depth(d + 1, node.right), depth(d + 1, node.left), d + 1) :
		0;
}

var tDepth = tree => depth(0, tree);

function lrDepthDiffs(acc, tree) {
	return tree ?
			acc.concat([tDepth(tree.left) - tDepth(tree.right)]) // depth diff of this node
			.concat(lrDepthDiffs([], tree.left))             // diffs of left
			.concat(lrDepthDiffs([], tree.right)) :          // diffs of right
		0;
}

var jscOpts = {
	size: 50,
	tests: 100
};

function property(name, prop, fn) {
	it(name, function () {
		jsc.assert(jsc.forall(prop, fn), jscOpts);
	});
}

var uniq = arb => jsc.suchthat(arb, arr => arr.length === _.uniq(arr).length);

describe('interval tree', function () {
	describe('#toTree', function () {
		// Walking tree in order should match the order of the input array.
		property('should match order', 'array number', function (arr) {
			return _.isEqual(arr, flatten(toTree(arr)));
		});
		// The tree should be balanced at every level. I.e. for every node,
		// the depth of the left branch should be within 1 of the depth of the
		// right branch.
		property('should be balanced', 'array number', function (arr) {
			return _.every(lrDepthDiffs([], toTree(arr)), x => Math.abs(x) < 2);
		});
	});

	function hasLength([a, b]) {
		return a !== b;
	}

	describe('#match', function () {
		// XXX I expect this will fail for zero-length intervals. In practice
		// jsverify never picks zero-length intervals in 100 tests, and there's
		// a recursion bug (blown stack) for larger numbers of tests. Should
		// revisit when jsverify can handle larger tests runs.
		property('should return overlapping segment, half-open', uniq(jsc.tuple([jsc.nat, jsc.nat, jsc.nat, jsc.nat])), function (twoIntv) {
			var cmp = (x, y) => x - y;
			var ordered = twoIntv.slice(0).sort(cmp);
			var [a, b, c, d] = ordered;
			var el = {start: a, end: c, id: 0};
			var t = index([el]);
			return _.isEqual(matches01(t, {start: b, end: d}), [el]);
		});
		// XXX see above about zero-length intervals.
		property('should not return non-overlapping segment, half-open', uniq(jsc.tuple([jsc.nat, jsc.nat, jsc.nat, jsc.nat])), function (twoIntv) {
			var cmp = (x, y) => x - y;
			var ordered = twoIntv.slice(0).sort(cmp);
			var [a, b, c, d] = ordered;
			var el = {start: a, end: b, id: 0};
			var t = index([el]);
			return _.isEqual(matches01(t, {start: c, end: d}), []);
		});
		property('should return all matches, half-open',
			jsc.suchthat(jsc.array(jsc.tuple([jsc.nat, jsc.nat])),
				a => a.length >= 2 && _.every(a, hasLength)), function (pairs) {
					var intvls = _.map(pairs.slice(1), ([a, b], i) =>
						({start: Math.min(a, b), end: Math.max(a, b), i: i}));
					var q = {start: Math.min.apply(null, pairs[0]), end: Math.max.apply(null, pairs[0])};
					var exp = _.filter(intvls, ({start, end}) => start < q.end && q.start < end);
					var itree = index(intvls);
					return _.isEqual(_.sortBy(matches01(itree, q), 'i'), _.sortBy(exp, 'i'));
				});
		property('should return all matches',
			jsc.suchthat(jsc.array(jsc.tuple([jsc.nat, jsc.nat])),
				a => a.length >= 2), function (pairs) {
					var intvls = _.map(pairs.slice(1), ([a, b], i) =>
						({start: Math.min(a, b), end: Math.max(a, b), i: i}));
					var q = {start: Math.min.apply(null, pairs[0]), end: Math.max.apply(null, pairs[0])};
					var exp = _.filter(intvls, ({start, end}) => start <= q.end && q.start <= end);
					var itree = index(intvls);
					return _.isEqual(_.sortBy(matches(itree, q), 'i'), _.sortBy(exp, 'i'));
				});
	});
});
