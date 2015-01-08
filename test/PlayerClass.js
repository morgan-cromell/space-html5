

PlayerClass = EntityClass.extend({
    planet: 0,
	numFootContacts: 0,
    jumping: false,
    vel: 0,
    speed: 150,
    jumpTimeout: 0,
    jumpHeight: 15000,
    maxSpeed: 1,
    inAir: true,
    buttonPressed: false,
    movingDir: 0,



    animation: {
    "currentFrame": 1,
    "framesX": 0,
    "framesY": 0,
    "framesTot": 0,
    "currentFrameX": 0,
    "currentFrameY": 0,
    "frameDuration": 100, // in ms
    frameWidth: 0,
    frameHeight: 0,

    "tick": {
        "current_tick": (new Date()).getTime(), 
        "last_tick": (new Date()).getTime(),
        "sum_tick": 0
        }
        
    },


    init: function (x, y, settings, name) {
        this.parent(x, y, settings, name);

        if(settings.maxSpeed)this.maxSpeed = settings.maxSpeed;
        if(settings.speed)this.speed = settings.speed;
        if(settings.jumpHeight)this.jumpHeight = settings.jumpHeight;
        
        var entityDef = {
            debris: true,
            feet: true,
            fixedRotation: false,
            angle: settings.angle,
            useBouncyFixture: true,
        	id: name + this.guid,
        	x: this.pos.x,
            y: this.pos.y,
            type: "dynamic",
            friction: 0.1,
            density: 10,
            restitution:0,
        	Width: this.currSprite.width - settings.crop.w,
        	Height: this.currSprite.height - settings.crop.h,
        	userData: {
        		id: name + this.guid,
        		ent: this,
                player: true
        	},
            extra: settings.extra
 
        };
        this.animation.frameWidth = settings.frameWidth;
        this.animation.frameHeight = settings.frameHeight;
        this.animation.framesX =  this.currSprite.width / settings.frameWidth;
        this.animation.framesY =  this.currSprite.height / settings.frameHeight;
        this.animation.framesTot = this.animation.framesY * this.animation.framesX;
        
        this.physBody = gPhysicsEngine.addBody(entityDef);




    },

    //----------------------------------------------------------------
    onContactStart: function(thisFixture,otherFixture){
        console.log("oh shit");
        console.log(otherFixture.IsSensor());
        if(thisFixture.GetUserData() == "feet" && otherFixture.GetBody().GetUserData().id.indexOf('GravitySensor') == -1) {
            this.numFootContacts++;
            this.inAir = false;
        }
        var data = otherFixture.GetBody().GetUserData();
        if(data.id.indexOf("Planet") !== -1 && thisFixture.GetUserData() == "feet") this.physBody.SetLinearVelocity(new Vec2(0,0));



    },

    onTouch: function(thisFixture, otherFixture, point, impulse) {

        
    },

    onContactEnd: function(thisFixture, otherFixture){

        if(thisFixture.GetUserData() == "feet" && otherFixture.GetBody().GetUserData().id.indexOf('GravitySensor') == -1) {
            this.numFootContacts--;
        }

    },
    //----------------------------------------------------------------

    update: function(){
        if(this.numFootContacts <= 0)this.buttonPressed = true;
        else if (this.jumpTimeout <= 0)this.buttonPressed = false;
        this.moveDir = 0;


        gMap.centerAt(this.pos.x * SCALE, this.pos.y * SCALE);
        this.jumpTimeout--; //set this to prevent bunny hopping
        this.planet--;
        
    	


        if(this.physBody) {
            this.vel = this.physBody.GetLinearVelocity();
            this.pos = this.physBody.GetPosition();
            this.angle = this.physBody.GetAngle();
            PLAYER = this.pos;
            //console.log(this.vel.Normalize());
        }

        //Max x velocity

        if (gInputEngine.actions['move-up']) {
            this.buttonPressed = true;

            if(this.jumpTimeout <= 0 && this.numFootContacts > 0){

                var force = new Vec2(Math.cos(this.physBody.GetAngle() - 90 * Math.PI/180) * this.jumpHeight , Math.sin(this.physBody.GetAngle() - 90 * Math.PI / 180) * this.jumpHeight);
                this.physBody.ApplyForce(force, this.physBody.GetPosition());
                this.jumpTimeout = 15;


            }
        }
        if (gInputEngine.actions['move-down']) {
            // adjust the move_dir by 1 in the
            // y direction. Remember, in our
            // coordinate system, up is the
            // negative-y direction, and down

                ROTATION++;


                
            // is the positive-y direction!
            
        }

        if (gInputEngine.actions['move-left']) {
            this.buttonPressed = true;
            this.moveDir = 2;

            if(this.vel.x + this.vel.y < this.maxSpeed && this.vel.x + this.vel.y >-this.maxSpeed) {
                var force = new Vec2(-Math.cos(this.physBody.GetAngle()) * this.speed , -Math.sin(this.physBody.GetAngle()) * this.speed);

                this.physBody.ApplyForce(force, this.physBody.GetPosition());
            }
             
        }
        if (gInputEngine.actions['move-right']) {
            this.buttonPressed = true;
            this.moveDir = 1;


            if(this.vel.x + this.vel.y > -this.maxSpeed && this.vel.x + this.vel.y < this.maxSpeed) {
                console.log(this.vel.x + this.vel.y);
                var force = new Vec2(Math.cos(this.physBody.GetAngle()) * this.speed , Math.sin(this.physBody.GetAngle()) * this.speed);
                this.physBody.ApplyForce(force, this.physBody.GetPosition());
            }
        }


        if(this.buttonPressed == false)this.physBody.SetLinearVelocity(new Vec2(0,0));





        this.animation.tick.current_tick = (new Date()).getTime();

        this.animation.tick.sum_tick += (this.animation.tick.current_tick - this.animation.tick.last_tick);
        this.animation.tick.last_tick = this.animation.tick.current_tick;

        if(this.animation.tick.sum_tick > 100) {
            this.animation.currentFrame++;
            this.animation.tick.sum_tick = 0;
            
        }

        if(this.animation.currentFrame > this.animation.framesTot) this.animation.currentFrame = 1;
        
        this.animation.currentFrameX = (this.animation.currentFrame % this.animation.framesX);

        if (this.moveDir == 0) {
            this.animation.currentFrameX = 0;
        }else {
            this.animation.currentFrameY = this.moveDir - 1;
        }

        this.parent();
        
    },

    drawSprite: function(ctx, sprite, x, y) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(this.scale, this.scale);
    ctx.rotate(this.angle);
    ctx.translate(this.animation.frameWidth -x - (sprite.width/2), -y - (sprite.height/2));
    
    ctx.drawImage(sprite, 
            this.animation.currentFrameX * this.animation.frameWidth, this.animation.currentFrameY * this.animation.frameHeight,
            this.animation.frameWidth, this.animation.frameHeight,
            x - this.drawOffset.x, y - this.drawOffset.y,
            this.animation.frameWidth, this.animation.frameHeight);
    ctx.restore();
    }


});

gGameEngine.factory['Player'] = PlayerClass;

