function Delanuay() {

}

Delanuay.prototype.triangulate = function (points) {
	// var points = _points.slice();
	console.log("triangulating " + points.length + " points");
	console.time("triangulation");

	if(points.length < 3)
		return [];

	// 1: sellect a seed point x_0 from x_i.
	var seed = points[0];

	// 2: sort according to |x_i - x_0|^2.
	for(var i=0; i<points.length; i++){
		points[i].distance = points[i].distanceToSq(seed);
	}
	points.sort(function (a, b) {
		return a.distance - b.distance;
	});

	// 3: find the point x_j closest to x_0.
	var seedClosest = points[1];

	// 4: find the point x_k that creates the smallest circum-circle
	//    with x_0 and x_j and record the center of the circum-circle C.
	var minCircumPoint, minRadius,
		circumCenter = new Vec2(0, 0);

	for (var i = 2; i < points.length; i++) {
		var p = points[i];

		// odstranění totožných bodů
		if(i < points.length-1){
			var p2 = points[i+1];
			var EPSILON = 1.0 / 1048576.0;
			var dx = Math.abs(p.x - p2.x);
			var dy = Math.abs(p.y - p2.y);
			if(dx < EPSILON && dy < EPSILON){
				points.splice(i+1, 1);
				i--;
				continue;
			}
		}


		var circle = this.circumcircle2(seed, seedClosest, p);
		if(circle.r < minRadius || i == 2){
			minRadius = circle.r;
			minCircumPoint = p;
			circumCenter.set(circle.x, circle.y);
		}
	}

	// 5: order point x_0, x_j, x_k to give
	// a right handed system thi is the initial seed convex hull.
	var dab = (new Vec2()).subVectors(seedClosest, seed);
	var dac = (new Vec2()).subVectors(minCircumPoint, seed);
	var seedTriangle;
	if(dab.cross(dac) > 0){ // a b c
		seedTriangle = new Triangle(seed, seedClosest, minCircumPoint);
	}
	else { // a c b
		seedTriangle = new Triangle(seed, minCircumPoint, seedClosest);
	}

	// 6: resort the remaining points according to x_i - C|^2 to give points s_i. 
	// orderedPoints = points.slice(2);
	for(var i=0; i<points.length; i++){
		points[i].distance = points[i].distanceToSq(circumCenter);
	}
	points.sort(function (a, b) {
		return a.distance - b.distance;
	});

	// 7: sequentially add the points s_i to the porpagating 
	// 2D convex hull that is seeded with the triangle formed from x_0, x_j, x_k .
	// as a new point is added the facets of the 2D-hull that are visible to it form new triangles.

	var triangles = [];
	triangles.push(seedTriangle);
	var hull = [];
	hull.push(seedTriangle.points[0], seedTriangle.points[1], seedTriangle.points[2]);

	for (var i = 0; i < 3; i++) {
		var p = seedTriangle.points[i];
		p.triangle = seedTriangle;
	}


	for (var i = 3; i < points.length; i++) {
		var p = points[i];
		var hullVisibility = [];
		for (var j = 0; j < hull.length; j++) {
			hullVisibility[j] = false;
			var k = (j+1)%hull.length;
			var h1 = hull[j];
			var h2 = hull[k];

			var h = new Vec2().subVectors(h2, h1);
			var hp = new Vec2().subVectors(p, h1);
			hullVisibility[j] = h.cross(hp) < 0;
		}

		var removeStart = 0;
		var removeLength = 0;
		if(hullVisibility[0]){
			for (var k = hull.length-1; k >= 0; k--) {
				if(hullVisibility[k]){
					removeStart = k;
				}
				else {
					break;
				}
			}
		}
		else {
			for (var k = 1; k < hull.length; k++) {
				if(hullVisibility[k]){
					removeStart = k;
					break;
				}
			}
		}

		var removePointer = removeStart;
		var prevTriangle = false;
		for (var j = 0; j < hull.length; j++) {
			if(hullVisibility[removePointer%hull.length]){
				// remove info
				removeLength++;

				// adding triangles
				var l = removePointer%hull.length;
				var k = (l+1)%hull.length;
				var h1 = hull[l];
				var h2 = hull[k];
				var triangle = new Triangle(h1, p, h2);
				if(prevTriangle !== false){
					triangle.addNeighbour(prevTriangle, 0);
					prevTriangle.addNeighbour(triangle, 1);
				}
				triangle.addNeighbour(h1.triangle, 2);
				h1.triangle.addNeighbour(triangle, h1.triangle.points.indexOf(h1));
				h1.triangle = triangle;
				p.triangle = triangle;
				triangles.push(triangle);

				prevTriangle = triangle;
			}
			removePointer++;
		}

		if(removeLength == 1){
			hull.splice(removeStart+1, 0, p);
		}
		else {
			if (removeStart + removeLength-1 < hull.length) {
				hull.splice(removeStart+1, removeLength-1, p);
			}
			else {
				var removeEndLength = hull.length-removeStart-1;
				hull.splice(removeStart+1, removeEndLength);
				hull.splice(0, removeLength-removeEndLength-1);
				hull.push(p);
			}
		}
	}

	// 8: a non-overlapping triangulation of the set of points is created. 

	// 9: adjacent pairs of triangles of this triangulation must be 'flipped' 
	// to create a Delaunay triangulation from the initial non-overlapping triangulation.

	console.time("delaunay");

	var flipped = true;
	var limit = 100;
	while(flipped && limit-- > 0){
		flipped = false;

		for(var i=0; i<triangles.length; i++){
			var t = triangles[i];

			if(t.flipNeighbours()){
				flipped = true;
			}
		}
	}

	console.timeEnd("delaunay");

	console.timeEnd("triangulation");
	return triangles;
}

// https://gist.github.com/mutoo/5617691
Delanuay.prototype.circumcircle2 = function (a, b, c) {
    var EPSILON = 1.0 / 1048576.0;
    var ax = a.x,
        ay = a.y,
        bx = b.x,
        by = b.y,
        cx = c.x,
        cy = c.y,
        fabsy1y2 = Math.abs(ay - by),
        fabsy2y3 = Math.abs(by - cy),
        xc, yc, m1, m2, mx1, mx2, my1, my2, dx, dy;

    /* Check for coincident points */
    if(fabsy1y2 < EPSILON && fabsy2y3 < EPSILON)
        throw new Error("Eek! Coincident points!");

    if(fabsy1y2 < EPSILON) {
        m2  = -((cx - bx) / (cy - by));
        mx2 = (bx + cx) / 2.0;
        my2 = (by + cy) / 2.0;
        xc  = (bx + ax) / 2.0;
        yc  = m2 * (xc - mx2) + my2;
    }

    else if(fabsy2y3 < EPSILON) {
        m1  = -((bx - ax) / (by - ay));
        mx1 = (ax + bx) / 2.0;
        my1 = (ay + by) / 2.0;
        xc  = (cx + bx) / 2.0;
        yc  = m1 * (xc - mx1) + my1;
    }

    else {
        m1  = -((bx - ax) / (by - ay));
        m2  = -((cx - bx) / (cy - by));
        mx1 = (ax + bx) / 2.0;
        mx2 = (bx + cx) / 2.0;
        my1 = (ay + by) / 2.0;
        my2 = (by + cy) / 2.0;
        xc  = (m1 * mx1 - m2 * mx2 + my2 - my1) / (m1 - m2);
        yc  = (fabsy1y2 > fabsy2y3) ?
        m1 * (xc - mx1) + my1 :
        m2 * (xc - mx2) + my2;
    }

    dx = bx - xc;
    dy = by - yc;

    return {
    	x: xc,
    	y: yc,
    	r: (dx * dx + dy * dy)
    };
}