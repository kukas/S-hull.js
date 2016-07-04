function Renderer() {
	this.canvas = document.createElement("canvas");
	this.ctx = this.canvas.getContext("2d");

	this.xSorter = function(a, b){return a.x - b.x;};
	this.ySorter = function(a, b){return a.y - b.y;};

	var image = this.image = new Image();
	var _this = this;
	image.addEventListener("load", function (e) {
		_this.setSize(image.width, image.height);
		_this.renderImage(image);
	}, false);
	image.src = "img/wave.jpg";
}

Renderer.prototype.setSize = function (width, height) {
	this.canvas.width = this.width = width;
	this.canvas.height = this.height = height;
	this.canvas.style.position = "absolute";
	this.canvas.style.top = Math.floor((window.innerHeight - this.height)/2) + "px";
	this.canvas.style.left = Math.floor((window.innerWidth - this.width)/2) + "px";
}


Renderer.prototype.renderImage = function (image) {
	var ctx = this.ctx;
	ctx.drawImage(image, 0, 0);
	this.imageData = ctx.getImageData(0, 0, this.width, this.height);
}

Renderer.prototype.renderPoints = function (points) {
	var pointRadius = 2;

	var ctx = this.ctx;
	ctx.clearRect(0, 0, this.width, this.height);
	ctx.fillStyle = "black";
	for (var i = 0; i < points.length; i++) {
		var p = points[i];
		ctx.fillRect(p.x - pointRadius, p.y - pointRadius, pointRadius*2, pointRadius*2);
	}
}

Renderer.prototype.renderTriangles = function (triangles) {
	console.time("rendering");
	function rand(min, max) {
		return min + Math.random() * (max - min);
	}

	function get_random_color() {
		var h = rand(1, 360);
		var s = rand(60, 100);
		var l = rand(20, 70);
		return 'hsl(' + h + ',' + s + '%,' + l + '%)';
	}

	var ctx = this.ctx;

	ctx.clearRect(0, 0, this.width, this.height);

	for (var i = 0; i < triangles.length; i++) {
		var t = triangles[i];
		var ax = (t.points[0].x+t.points[1].x+t.points[2].x)/3;
		var ay = (t.points[0].y+t.points[1].y+t.points[2].y)/3;

		ctx.beginPath();
		ctx.strokeStyle = "black";
		var p = t.points[0];
		ctx.moveTo(p.x, p.y);
		// ctx.moveTo((p.x-ax)*0.98 + ax, (p.y-ay)*0.98 + ay);
		for (var j = 0; j < 3; j++) {
			p = t.points[(j+1)%3];
			ctx.lineTo(p.x, p.y);
			// ctx.lineTo((p.x-ax)*0.98 + ax, (p.y-ay)*0.98 + ay);
			ctx.fillStyle = "black";
		}
		// ctx.fillStyle = get_random_color();
		var aColor = this.getAverageColor(t.points.slice(), this.imageData.data, 6);
		ctx.fillStyle = "rgb("+aColor[0]+","+aColor[1]+","+aColor[2]+")";
		ctx.fill();
		ctx.closePath();
	}

	console.timeEnd("rendering");
}

Renderer.prototype.getAverageColor = function (t, data, interval) {
	var color = [0, 0, 0];
	t.sort(this.xSorter);
	var xmin = Math.floor(t[0].x);
	var xmax = Math.ceil(t[2].x);
	t.sort(this.ySorter);

	var ymin = Math.floor(t[0].y);
	var ymax = Math.ceil(t[2].y);

	var count = 0;

	var xinterval = interval;
	if(t[1].y - t[0].y < 20){
		interval = 1;
	}

	var d20y = (t[2].y - t[0].y);
	var d10y = (t[1].y - t[0].y);
	var d21y = (t[2].y - t[1].y);

	var slopeBig = interval * (t[2].x - t[0].x) / d20y;
	var slopeA   = interval * (t[1].x - t[0].x) / d10y;
	var slopeB   = interval * (t[2].x - t[1].x) / d21y;

	var cross = (t[2].x - t[0].x) * d10y - d20y * (t[1].x - t[0].x);

	var xmin = t[0].x;
	var xmax = t[0].x;
	if(ymin == t[1].y){
		if(cross > 0){
			xmin = t[1].x;
		}
		else {
			xmax = t[1].x;
		}
	}

	for(var y=ymin; y<ymax; y+=interval){

		if(y < t[1].y){
			// nalevo
			if(cross > 0){
				xmin += slopeA;
				xmax += slopeBig;
			}
			else {
				xmin += slopeBig;
				xmax += slopeA;
			}
		}
		else {
			if(cross > 0){
				xmin += slopeB;
				xmax += slopeBig;
			}
			else {
				xmin += slopeBig;
				xmax += slopeB;
			}
		}

		for(var x=Math.floor(xmin); x<xmax; x+=xinterval){
			var p = (this.width*y + x)*4;
			color[0] += data[p];
			color[1] += data[p+1];
			color[2] += data[p+2];
			count++;
		}
	}

	color[0] = Math.floor(color[0]/count);
	color[1] = Math.floor(color[1]/count);
	color[2] = Math.floor(color[2]/count);

	return color;
}