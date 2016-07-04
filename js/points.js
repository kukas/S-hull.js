function Points() {
	this.points = [];
}

Points.prototype.addPoint = function (x, y) {
	this.points.push(new Vec2(x, y));
}

Points.prototype.getPoints = function () {
	return this.points;
}

Points.prototype.reset = function () {
	this.points = [];
}