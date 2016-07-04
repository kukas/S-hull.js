function App() {
	this.delanuay = new Delanuay();
	this.renderer = new Renderer();

	this.points = new Points();

	var canvas = this.renderer.canvas;
	document.body.appendChild(canvas);

	var _this = this;
	canvas.addEventListener("click", function (e) {
		var offset = $(canvas).offset();
		var x = e.clientX - offset.left;
		var y = e.clientY - offset.top;

		_this.points.addPoint(x, y);

		if(_this.points.points.length < 3){
			_this.renderer.renderPoints(_this.points.points);
		}
		else {
			var triangles = _this.delanuay.triangulate(_this.points.getPoints());
			_this.renderer.renderTriangles(triangles);
		}

		e.preventDefault();
	}, false);

	document.body.addEventListener("keyup", function (e) {
		if(e.keyCode == 32){
			var triangles = _this.delanuay.triangulate(_this.points.getPoints());
			_this.renderer.renderTriangles(triangles);
		}
	}, false);

	var menu = {
		src: "img/wave.jpg",
		"add random points" : function(){
			for(var i=0;i<100;i++){
				_this.points.addPoint(
					utils.random(0, _this.renderer.width), 
					utils.random(0, _this.renderer.height)
				);

			}
			var triangles = _this.delanuay.triangulate(_this.points.getPoints());
			_this.renderer.renderTriangles(triangles);
		},
		reset : function(){
			_this.points.reset();
			_this.renderer.renderImage(_this.renderer.image);

		}
	}

	gui.add(menu, 'src').onChange(function () {
		if(menu.src.substr(0, 7) == "http://" || menu.src.substr(0, 8) == "https://"){
			_this.renderer.image.src = "proxy.php?i="+menu.src;
		}
		else {
			_this.renderer.image.src = menu.src;
		}
	});
	gui.add(menu, 'add random points');
	gui.add(menu, 'reset');
}