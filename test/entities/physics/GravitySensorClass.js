

GravitySensorClass = EntityClass.extend({

objects: [],

    init: function (x, y, settings, name) {
        this.parent(x, y, settings, name);


        
        
        
        




    },


    create: function(x, y, settings, name) {
        var entityDef = {
            angle: settings.rotation,
            id: name + this.guid,
            x: this.pos.x,
            y: this.pos.y,
            Width: this.settings.width,
            Height: this.settings.height,
            userData: {
                gravitySensor: true,
                id: name + this.guid,
                ent: this
            },
            extra: settings.extra //Too easily add more settings from child class.
 
        };


        
        this.physBody = gPhysicsEngine.addSensor(entityDef);
    },

    //----------------------------------------------------------------
    onContactStart: function(thisFixture,otherFixture){
        console.log(otherFixture);
        if(otherFixture.GetBody().GetUserData().ent)this.objects.push(otherFixture.GetBody());
        
    },

    onTouch: function(thisFixture, otherFixture, point, impulse) {
        
        

    	
    },

    onContactEnd: function(thisFixture, otherFixture){
        if(otherFixture.GetBody().GetUserData().ent)this.objects.erase(otherFixture.GetBody());


    },
    //----------------------------------------------------------------

    update: function(){
        for(var i = 0; i < this.objects.length; i++) {
            this.objects[i].SetAngle(this.angle);
            var force = new Vec2(Math.cos(this.angle + 90 * Math.PI/180) * 100 , Math.sin(this.angle + 90 * Math.PI / 180) * 100);
            this.objects[i].ApplyForce(force, this.objects[i].GetPosition());
        }
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
gGameEngine.factory['GravitySensorClass'] = GravitySensorClass;

