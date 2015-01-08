

PlayerClass = EntityClass.extend(
	physBody: null,

    init: function (x, y, settings) {
        this.parent(x, y, settings);

        var startPos = settings.pos;


        this.dir = {
        	x: settings.dir.x,
        	y: settings.dir.y
        };

        var entityDef = {
        	id: "player" + guid,
        	x: startPos.x,
        	y: startPos.y,
        	halfHeigh: 0,
        	halfWidth: 0,
        	damping: 1.0,
        	userData: {
        		id: "player" + guid,
        		ent: this
        	}
        };

        this.physBody = gPhysicsEngine.addBody(entityDef);


    },

    //----------------------------------------------------------------
    onTouch: function(otherBody, point, impulse) {
    	console.log("collision, fuck yeah!");
    },
    //----------------------------------------------------------------

    update: function(){



    	this.physBody.SetLinearVelocity(new Vec2(this.dir.x * this.speed,
    											 this.dir.y * this.speed));



    	if(this.physBody !== null) {
    		this.pos = this.physBody.GetPosition();
    	}
    	

        this.parent();
    }
});

gGameEngine.factory['Player'] == PlayerClass;