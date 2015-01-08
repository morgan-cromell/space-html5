
EntityClass = Class.extend({

	// can all be referenced by child classes
	guid: newGuid_short(), // Generation a unique id for this entity.
	pos : {x:0,y:0},
	angle: 0,
	drawOffset: {x:0, y:0},
	_killed: false,
	currSprite: null,
	zindex: 0,
	scale: 1,
	name: null,
	fullyLoaded: false,

	// can be overloaded by child classes

	init: function(x, y, settings, name){
		this.settings = settings;
		this.name = name;
		this.pos.x = x;
		this.pos.y = y;
		var that = this;
		if(settings.pos)this.pos = settings.pos;
		this.zindex = settings.zindex;
		if(settings.drawOffset)this.drawOffset = settings.drawOffset;

		if(settings.spriteName) {
			if(settings.spriteName == "planet")settings.spriteName += Math.floor((Math.random()*5)+1) + ".png";
			
			var img = new Image();
			img.onload = function() {
				that.currSprite = img;
				that.fullyLoaded = true;
			}
			img.src = "sprites/" + settings.spriteName;
		}



		 var tev = setInterval(function()
            {
                    if(that.fullyLoaded)
                    {	
                    	that.create(x, y, settings, name);
                    	console.log("loaded");
                            clearInterval(tev)
                    }
            }, 1000);


	},
	//-----------------------------------

	update : function(){
		
	},

	//--------------------------------
	draw: function(ctx){
		if(this.currSprite) {
			this.drawSprite(ctx, this.currSprite,
				Math.round(this.pos.x * SCALE) ,
				Math.round((this.pos.y) * SCALE) )
		}



	},

	//-------------------------------------
	drawSprite: function(ctx, sprite, x, y) {
		//Needed this to be able to rotate the sprites.
		ctx.save();
		ctx.translate(x, y);
		ctx.scale(this.scale, this.scale);
		
		ctx.rotate(this.angle);
		ctx.translate(-x - (sprite.width/2), -y - (sprite.height/2));
		ctx.fillStyle = "green";
		ctx.font = 'bold 30px sans-serif';
		if(DEBUG)ctx.fillText(this.name + " - " + this.guid, x - this.drawOffset.x + 50, y - this.drawOffset.y + 50);
		
		ctx.drawImage(sprite, x - this.drawOffset.x, y - this.drawOffset.y);
		ctx.restore();
	}

});