

GameEngineClass = Class.extend({

	move_dir: new Vec2(0,0),
	dirVec: new Vec2(0,0),

	entities: [],
    factory: {},
    _defferedKill: [],

	gPlayer0: {
		pos: {
			x: 100,
			y: 100
		},

		walkSpeed: 1,

		// This is hooking into the Box2D Physics
		// library. We'll be going over this in
		// more detail later.
		mpPhysBody: new BodyDef()
	},

	//-----------------------------
	setup: function () {
		// Call our input setup method to bind
		// our keys to actions and set the
		// event listeners.
		gInputEngine.setup();

		// Notice that we don't setup the factory
		// here! We set it up in each individual
		// Entity's defining file.
	},

    spawnEntity: function (typename) {

    	//Create a new entity based on the "filename" object
    	//and then add it to the existing entities array.

		var ent =  new (factory[typename])();

		this.entities.push(ent);
        
    },
    //-------------------------------------------
     removeEntity: function(removeEnt) {
		// We don't do anything with this right now.
		// We'll fill it in later this unit.
    },

    //-------------------------------------------
	update: function () {
        // Update player position from previous unit.
        gGameEngine.updatePlayer();

        // TASK #1
        // Run through the 'entities' list and call each element's
        // update method.
        //
        // Notice that we've modified the 'spawnEntity' method
        // above to store each spawned entity in the 'entities'
        // list.
        //
        // YOUR CODE HERE
        this.entities.forEach(function(ent){
            if (!ent._killed) {
            	ent.update();
           	}else gGameEngine._defferedKill.push(ent); //if dead add the entity to the "_defferedKill" list so we can remove them later
        });

        this._defferedKill.forEach(function(ent){
        	gGameEngine.entities.erase(ent);
        })
        this._defferedKill = [];
        
    },

    //-------------------------------------------------
    

	updatePlayer: function () {

		// move_dir is a Vec2 object from the Box2d
		// physics library, which is of the form
		// {
		//     x: 0,
		//     y: 0
		// }
		// 
		// We'll be going more into Box2D later in
		// the course. The Vec2 constructor takes
		// an initial x and y value to set the
		// vector to.

		if (gInputEngine.actions['move-up']) {
			// adjust the move_dir by 1 in the
			// y direction. Remember, in our
			// coordinate system, up is the
			// negative-y direction, and down
			// is the positive-y direction!
			gGameEngine.move_dir.y -= 1;
		}
		if (gInputEngine.actions['move-down']) {
			// adjust the move_dir by 1 in the
			// y direction. Remember, in our
			// coordinate system, up is the
			// negative-y direction, and down
			// is the positive-y direction!
			gGameEngine.move_dir.y += 1;
		}
		if (gInputEngine.actions['move-left']) {
			// adjust the move_dir by 1 in the
			// x direction.
			gGameEngine.move_dir.x -= 1;
		}
		if (gInputEngine.actions['move-right']) {
			// adjust the move_dir by 1 in the
			// x direction.
			gGameEngine.move_dir.x += 1;
		}

		// After modifying the move_dir above, we check
		// if the vector is non-zero. If it is, we adjust
		// the vector length based on the player's walk
		// speed.
		if (gGameEngine.move_dir.LengthSquared()) {
			// First set 'move_dir' to a unit vector in
			// the same direction it's currently pointing.
			gGameEngine.move_dir.Normalize();

			// Next, multiply 'move_dir' by the player's
			// set 'walkSpeed'. We do this in case we might
			// want to change the player's walk speed due
			// to a power-up, etc.
			gGameEngine.move_dir.Multiply(gGameEngine.gPlayer0.walkSpeed);
		}

		gGameEngine.gPlayer0.mpPhysBody.setLinearVelocity(gGameEngine.move_dir.x, gGameEngine.move_dir.y);

		// Keyboard based facing & firing direction
		if (gInputEngine.actions['fire0'] || gInputEngine.actions['fire1']) {

			// Grab the player's screen position in space.
			var playerInScreenSpace = {
				x: gRenderEngine.getScreenPosition(gGameEngine.gPlayer0.pos).x,
				y: gRenderEngine.getScreenPosition(gGameEngine.gPlayer0.pos).y
			};

			// Set the dirVec property to the difference between the
			// current mouse position and the player's position in
			// screen space.
			gGameEngine.dirVec.x = gInputEngine.mouse.x - playerInScreenSpace.x;
			gGameEngine.dirVec.y = gInputEngine.mouse.y - playerInScreenSpace.y;

			gGameEngine.dirVec.normalize();
		}

		// Modify dirVec based on the current state of the 'fire-up',
		// 'fire-down', 'fire-left', 'fire-right'.
		if (gInputEngine.actions['fire-up']) {
			gGameEngine.dirVec.y--;
		} else if (gInputEngine.actions['fire-down']) {
			gGameEngine.dirVec.y++;
		}

		if (gInputEngine.actions['fire-left']) {
			gGameEngine.dirVec.x--;
		} else if (gInputEngine.actions['fire-right']) {
			gGameEngine.dirVec.x++;
		}
	}

});

gGameEngine = new GameEngineClass();

