var PlayerClass = Class.extend({
	move_dir: 0, // idle: 0, up: 1, down: 2, left: 3, right: 4 ----- this are the y values for the player animation.

	position: {
		"x": 0,
		"y": 0
	},

	imageData: null,

	size: {
		"width": 0,
		"height": 0
	},

	animation: {
		"currentFrame": 0,
		"framesX": 0,
		"framesY": 0,
		"framesTot": 0,
		"currentFrameX": 0,
		"currentFrameY": 0,
		"frameDuration": 100, // in ms

		"tick": {
			"current_tick": (new Date()).getTime(), 
			"last_tick": (new Date()).getTime(),
			"sum_tick": 0
			}
		
	},


	movement: {
		maxSteps: 8, // less = faster

		moving: false,
		steps: {
			x: 0,
			y: 0
		},
		speed: 0
	},
	//----------------------------------


	create: function(image, x, y) {
		this.imageData = new Image();
		this.imageData.src = image;
		this.position.x = x;
		this.position.y = y;
		
		this.size.width = 64;
		this.size.height = 64;

		this.animation.framesX = 576 / this.size.width;
		this.animation.framesY = 256 / this.size.height;
		this.animation.framesTot = this.animation.framesY * this.animation.framesX;
		gInputEngine = new InputEngineClass();
		gInputEngine.setup();

		this.movement.speed = 16 / this.movement.maxSteps;
	},



	//---------------------------------------------------------------


	update: function() {
		this.animation.tick.current_tick = (new Date()).getTime();
			this.animation.tick.sum_tick += (this.animation.tick.current_tick - this.animation.tick.last_tick);
			this.animation.tick.last_tick = this.animation.tick.current_tick;
			if(this.animation.tick.sum_tick > 10) {
				if (this.movement.moving == true) this.move();
			}
			if(this.animation.tick.sum_tick > 50) {
				this.animation.currentFrame++;
				this.animation.tick.sum_tick = 0;
				
			}

			if(this.animation.currentFrame > this.animation.framesTot) this.animation.currentFrame = 1;


		if(gInputEngine.actions['move-up'] && this.movement.steps.y == 0) {
			if(this.move_dir == 0 || this.move_dir == 3) this.move_dir = 1;
			if(gMap.collide(this.position.x, this.position.y - 16) == false)this.movement.steps.y = -this.movement.maxSteps;
			this.movement.moving = true;
			this.move();
		}else if(gInputEngine.actions['move-left'] && this.movement.steps.x == 0) {
			if(this.move_dir == 0 || this.move_dir == 4) this.move_dir = 2;
			if(gMap.collide(this.position.x - 16, this.position.y) == false)this.movement.steps.x = -this.movement.maxSteps;
			this.movement.moving = true;
			this.move();
		}else if(gInputEngine.actions['move-down'] && this.movement.steps.y == 0) {
			if(this.move_dir == 0 || this.move_dir == 1) this.move_dir = 3;
			if(gMap.collide(this.position.x, this.position.y + 16) == false)this.movement.steps.y = +this.movement.maxSteps;
			this.movement.moving = true;
			this.move();
		}else if(gInputEngine.actions['move-right'] && this.movement.steps.x == 0) {
			if(this.move_dir == 0 || this.move_dir == 2) this.move_dir = 4;
			if(gMap.collide(this.position.x + 16, this.position.y) == false)this.movement.steps.x = +this.movement.maxSteps;
			this.movement.moving = true;
			this.move();
		}

	},


	//----------------------------------


	draw: function(ctx) {
		this.animation.currentFrameX = (this.animation.currentFrame % this.animation.framesX);
		if (this.move_dir == 0) {
			this.animation.currentFrameX = 0;
		}else {
			this.animation.currentFrameY = this.move_dir - 1;
		}
		ctx.drawImage(this.imageData, 
			this.animation.currentFrameX * this.size.width, this.animation.currentFrameY * this.size.width,
			this.size.width, this.size.height,
			this.position.x + (this.size.width / 2), this.position.y + (this.size.height/2),
			this.size.width, this.size.height);

	},





	//-------------------

	// The "move" class makes sure that the player moves a specific amount of pixels/tiles each time we press the button, 
	// and continue to move until its reached its location.



	move: function() {
		if(this.movement.moving == false) return; //just to make sure we are moving

		this.movement.speed = 16 / this.movement.maxSteps;

		if(this.movement.steps.x != 0 && this.movement.steps.y != 0){
			this.movement.speed = this.movement.speed/ Math.sqrt(2);
		}

		if(this.movement.steps.x > 0){
			this.movement.steps.x--;
			this.position.x += this.movement.speed;
		}else if(this.movement.steps.x < 0){
			this.movement.steps.x++;
			this.position.x -= this.movement.speed;
		}


		if(this.movement.steps.y > 0){
			this.movement.steps.y--;
			this.position.y += this.movement.speed;
		}else if(this.movement.steps.y < 0){
			this.movement.steps.y++;
			this.position.y -= this.movement.speed;
		}
		
		if(this.movement.steps.x == 0 && this.movement.steps.y == 0) {
			this.movement.moving = false;
			this.position.x = Math.round(this.position.x / 16) * 16;
			this.position.y = Math.round(this.position.y / 16) * 16;
			this.move_dir = 0;
		}

	}
});