(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define(factory);
	else if(typeof exports === 'object')
		exports["static-interval-tree"] = factory();
	else
		root["static-interval-tree"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "/";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	// A simple static interval tree: static in the sense that
	// we only do bulk loading, no add/remove after initial load.
	//
	// Because we don't support add/remove, we don't need a binary tree
	// implementation that retains balance during add/remove (avl, red-black). Instead we
	// can sort, then build a tree from the sort.

	/*global module: false */
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

	var getHigh = function getHigh() {
		var _ref = arguments[0] === undefined ? { high: -Infinity } : arguments[0];

		var high = _ref.high;
		return high;
	};

	// Find the highest end value of each node. Mutates its input.
	function findEnd(node) {
		if (!node) {
			return undefined;
		}
		var left = node.left;
		var right = node.right;
		var el = node.el;

		findEnd(left);
		findEnd(right);
		node.high = Math.max(getHigh(left), getHigh(right), el.end);
		return node;
	}

	var cmp = function cmp(x, y) {
		return x === y ? 0 : x < y ? -1 : 1;
	};

	// Build index.
	// intervals :: [{start, end, ...}, ...]
	function index(intervals) {
		var sorted = intervals.slice(0).sort(function (a, b) {
			return cmp(a.start, b.start);
		});
		return findEnd(toTree(sorted, 0, sorted.length));
	}

	function matchesAcc(node, pos, acc) {
		if (node) {
			var start = pos.start;
			var end = pos.end;

			if (node.high >= start) {
				if (end >= node.el.start) {
					if (node.el.end >= start) {
						acc.push(node.el);
					}
					matchesAcc(node.right, pos, acc);
				}
				matchesAcc(node.left, pos, acc);
			}
		}
		return acc;
	}

	// Find intervals in node overlapping position.
	// pos :: {start, end}
	var matches = function matches(node, pos) {
		return matchesAcc(node, pos, []);
	};

	function matches01Acc(node, pos, acc) {
		if (node) {
			var start = pos.start;
			var end = pos.end;

			if (node.high > start) {
				if (end > node.el.start) {
					if (node.el.end > start) {
						acc.push(node.el);
					}
					matches01Acc(node.right, pos, acc);
				}
				matches01Acc(node.left, pos, acc);
			}
		}
		return acc;
	}

	// Find intervals in node overlapping position, using half-open coords.
	// We could also support this by parameterizing the compare fn, though that adds
	// more function calls to what is expected to be a hot loop.
	// pos :: {start, end}
	var matches01 = function matches01(node, pos) {
		return matches01Acc(node, pos, []);
	};

	module.exports = {
		matches: matches,
		matches01: matches01,
		index: index,
		toTree: (function (_toTree) {
			function toTree(_x) {
				return _toTree.apply(this, arguments);
			}

			toTree.toString = function () {
				return _toTree.toString();
			};

			return toTree;
		})(function (arr) {
			return toTree(arr, 0, arr.length);
		})
	};

/***/ }
/******/ ])
});
;