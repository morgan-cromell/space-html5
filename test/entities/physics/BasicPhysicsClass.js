

BasicPhysicsClass = EntityClass.extend({
    lifeTime: 1000,
    spawnTime: new Date().getTime(),
    vel: 0,


    init: function (x, y, settings, name) {
        this.parent(x, y, settings, name);

        if(!settings.crop) settings.crop = {w: 0, h: 0};

        
       
        




    },


    create: function(x, y, settings, name)  {
        var entityDef = {
            debris: settings.debris,
            fixedRotation: settings.rotate,
            angle: settings.rotation,
            useBouncyFixture: true,
            id: name + this.guid,
            x: this.pos.x,
            y: this.pos.y,
            type: settings.type,
            friction: settings.friction,
            density: settings.density,
            restitution: settings.restitution,
            Width: this.currSprite.width - settings.crop.w,
            Height: this.currSprite.height - settings.crop.h,
            userData: {
                id: name + this.guid,
                ent: this
            },
            radius: settings.radius,
            extra: settings.extra //Too easily add more settings from child class.
 
        };

        if(settings.planet && settings.width){
            var imageRadius = (entityDef.Width/2 + entityDef.Height/2)/2;
            var radius = (settings.width/2 + settings.height/2)/2;
            var scale = radius/imageRadius;
            this.scale = scale;
        }

        this.spawnTime = new Date().getTime();
        if(settings.planet){
            if(settings.width)entityDef.Width = settings.width;
            if(settings.height)entityDef.Height = settings.height;
            this.physBody = gPhysicsEngine.addPlanet(entityDef);
        }else {
            this.physBody = gPhysicsEngine.addBody(entityDef);
        }
    },

    //----------------------------------------------------------------
    onContactStart: function(thisFixture,otherFixture){


    },

    onTouch: function(thisFixture, otherFixture, point, impulse) {
        if(otherFixture.GetBody().GetUserData().gravitySensor){
            console.log("motherload");
        }

    	
    },

    onContactEnd: function(thisFixture, otherFixture){



    },
    //----------------------------------------------------------------

    update: function(){

       // if(new Date().getTime() - this.spawnTime > this.lifeTime)this._killed = true;
       

        if(this.physBody !== null) {
            this.vel = this.physBody.GetLinearVelocity();
            this.pos = this.physBody.GetPosition();
            this.angle = this.physBody.GetAngle();
        }

        this.parent();
        
    }
});


//Just in case we want to use this for something.
gGameEngine.factory['BasicPhysicsClass'] = BasicPhysicsClass;

