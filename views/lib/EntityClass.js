
EntityClass = Class.extend({

	// can all be referenced by child classes

	pos : {x:0,y:0},
	size : {x:0,y:0},
	_killed: false,
	currSpriteName: null,
	zindex: 0,

	// can be overloaded by child classes
	init: function(x, y, settings){
		this.pos.x = settings.pos
	},
	//-----------------------------------

	update : function(){},

	//--------------------------------
	draw: function(){
		if(this.currSpriteName) {
			drawSprite(this.currSpriteName,
				this.pos.x.round() - this.hsize.x,
				this.pos.y.round() - this.hsize.y);
		}



	}

});