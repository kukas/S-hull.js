function Triangle(a, b, c) {
	this.points = [a, b, c];
	this.neighbours = [];
}

Triangle.prototype.addNeighbour = function (t, side) {
	this.neighbours[side] = t;
}

Triangle.prototype.getNeighbour = function (triangle) {
	for(var i=0; i<3; i++){
		if(this.neighbours[i] == triangle)
			return i;
	}
	return -1;
}

Triangle.prototype.flipNeighbours = function() {
	for(var i=0; i<3; i++){
		var neighbour = this.neighbours[i];
		if(neighbour === undefined)
			continue;

		var commonIndex = neighbour.points.indexOf(this.points[i]);
		var oppositePoint = neighbour.points[(commonIndex + 1) % 3];
		var circum = app.delanuay.circumcircle2(this.points[0], this.points[1], this.points[2]);

		if(oppositePoint.distanceToSq(circum) < circum.r){
			var t1 = this;
			var t2 = neighbour;

			var nA = neighbour.neighbours[commonIndex];
			var nB = neighbour.neighbours[(commonIndex+1)%3];
			var nC = this.neighbours[(i+1)%3];
			var nD = this.neighbours[(i+2)%3];

			var points = this.points;

			this.points = [points[(i+2)%3], oppositePoint, points[(i+1)%3]];
			neighbour.points = [oppositePoint, points[(i+2)%3], points[i]];

			t1.neighbours = [];
			t2.neighbours = [];
			t1.addNeighbour(t2, 0);
			t2.addNeighbour(t1, 0);

			if(nB !== undefined) {
				t1.addNeighbour(nB, 1);
				nB.addNeighbour(t1, nB.getNeighbour(neighbour));
			}
			if(nC !== undefined) {
				t1.addNeighbour(nC, 2);
				nC.addNeighbour(t1, nC.getNeighbour(this));
			}
			if(nD !== undefined) {
				t2.addNeighbour(nD, 1);
				nD.addNeighbour(t2, nD.getNeighbour(this));
			}
			if(nA !== undefined) {
				t2.addNeighbour(nA, 2);
				nA.addNeighbour(t2, nA.getNeighbour(neighbour));
			}

			return true;
		}
	}

	return false;
};