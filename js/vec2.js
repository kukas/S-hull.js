function Vec2(x, y) {
	this.x = x || 0;
	this.y = y || 0;

	this.distance = 0;
}

Vec2.prototype.distanceToSq = function (v) {
	var dx = this.x - v.x;
	var dy = this.y - v.y;
	return dx*dx + dy*dy;
}

Vec2.prototype.set = function (x, y) {
	this.x = x;
	this.y = y;
}

Vec2.prototype.cross = function (v) {
	return this.x*v.y - this.y*v.x;
}

Vec2.prototype.subVectors = function (v, u) {
	this.x = v.x - u.x;
	this.y = v.y - u.y;

	return this;
}