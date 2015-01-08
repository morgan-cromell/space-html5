

//The main gameClass

var GameClass = Class.extend({
	canvas: null,
	ctx: null,



	map: {
		"x": 0,
		"y": 0
	},


	setup: function () {
		this.ctx = canvas.getContext("2d"); //getting graphic engine thingy.
		gMap = new TiledMap; //creating a new map-object from "TiledMapClass.js"
		gMap.load("map.json"); //loading our test map jsons.
		window.addEventListener('keydown', this.onKeyDown); //add event listner from key down.
		canvas.width = window.innerWidth - 100;
		canvas.height = window.innerHeight - 100;
		player = new PlayerClass;
		player.create("animations/player.png", 3 * 32, 5 * 32);

	},

	//-----------------------------------

	 run: function () {	 //our main game loop.
      	game.update((new Date).getTime());
    	game.draw();		

	},
	//--------------------------------------

	 update: function(delta) {

	 	 	gMap.update();
	 	 	player.update();



	},
	//----------------------------------------

	onKeyDown: function(event) {
		switch(event.keyCode) {
			case 38: // up
				game.map.y += 16;
			break;
			case 37: //left
				game.map.x += 16;
			break;
			case 40: //down
				game.map.y -= 16;
			break;
			case 39: //right
				game.map.x -= 16;
			break;
			case 82:
			gMap = new TiledMap();
			gMap.load("map.json");

		}
	},
	//---------------------------------------

	draw: function() {
		this.ctx.clearRect(0,0 ,canvas.width, canvas.height); //clearing the canvas
		gMap.draw(this.ctx, this.map.x, this.map.y); //drawing the tiledMap
		player.draw(this.ctx);
		gMap.drawTop(this.ctx, this.map.x, this.map.y);


	},

});


game = new GameClass(); //creating a new Game object.
game.setup(); //initializing.
// game._intervalId = setInterval(game.run, 1000 / 0); //setting the game to run the game loop 60 times per second. creating 60 fps.



var stats = new Stats();
stats.setMode(1);

//stats.domElement.style.position = 'absolute';
stats.domElement.style.position = "absolute"
stats.domElement.style.left = '0px';
stats.domElement.style.top = '0px';

document.body.appendChild( stats.domElement );

setInterval( function () {

    stats.begin();

    game.run();

    stats.end();

}, 1000 / 0 );