# Static interval tree

A very simple library for finding overlapping intervals in one dimension.

The intervals are indexed using an augmented balanced binary search tree. The
search tree is bulk-loaded by sorting. There's no support for adding/removing
intervals.

Intervals are assumed to be over integers. Coordinates can be closed [start, end],
or half-open [start, end).

Query time with the index should be O(log n + k), (k being number of matches returned)
rather than the O(n) required for a brute-force search.

Work in progress. Might be useful for drawing genomic data.

## Methods

```javascript
var {index, matches} = require('static-interval-tree');

// index(intervals :: [{start, end, ...}, ...]) :: interval-tree

var idx = index([{start: 10, end: 12, id: 1}, {start: 21, end: 30: id: 2}]);

// matches(interval-tree, pos :: {start, end}) :: [{start, end, ...}, ...]

var overlapping = matches(idx, {start: 12, end: 22});
// => [{start: 10, end: 12, id: 1}, {start: 21, end: 30: id: 2}]

// matching half-open coords, [start, end)
// matches01(interval-tree, pos :: {start, end}) :: [{start, end, ...}, ...]

var overlapping = matches01(idx, {start: 12, end: 22});
// => [{start: 21, end: 30: id: 2}]

```

Note that building the tree is independent of the choice of closed or half-open
coordinates, however you should use match01 if your coordinates are half-open.
The intervals in the tree and the interval for query must use the same coordinate
system, either closed or half-open.

## Build
The build is based on npm and webpack.
 * Ensure that git and node are installed
   * On OSX, install brew http://brew.sh/
   * `brew install git`
   * `brew install node`
 * `git clone https://github.com/acthp/static-interval-tree.git`
 * `cd static-interval-tree`
 * `npm install`
 * `npm start`
 * browse to [http://localhost:8080/webpack-dev-server/](http://localhost:8080/webpack-dev-server/)

### Lint

Use `npm run lint` to run the lint rules. We lint with eslint and babel-eslint.

### References
 * http://blog.keithcirkel.co.uk/how-to-use-npm-as-a-build-tool/
 * http://webpack.github.io/
 * http://www.youtube.com/watch?v=VkTCL6Nqm6Y
