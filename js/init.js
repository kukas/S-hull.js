function datguiInit(){
	window.gui = new dat.GUI();

	return gui;
}

$(document).ready(function(){
	datguiInit();

	window.app = new App();
});
