ParticleClass = Class.extend({
	
	particles: [],
	linkedTo: "",
	moving: false,
	pos: {
		x: 0,
		y: 0
	},
	trail: {
		x: 0,
		y: 0
	},

	init: function(settings) {
		//Lets create some particles now

		this.pos = settings.pos;
		this.trail = settings.trail;
		this.linkedTo = settings.linkedTo;
		this.moving = settings.moving;


		var particle_count = 30;
		for(var i = 0; i < particle_count; i++)
		{
			this.particles.push(this.particle());
		}
	},


	update: function(settings) {
		this.pos = settings.pos;
		this.trail = settings.trail;
		this.moving = settings.moving;
	},



	particle: function()
	{
		//speed, life, location, life, colors
		//speed.x range = -2.5 to 2.5 
		//speed.y range = -15 to -5 to make it move upwards
		//lets change the Y speed to make it look like a flame

		var p = {};
		p.speed = {x: this.trail.x*5, y: this.trail.y*5};


		p.location = {x: this.pos.x, y: this.pos.y};

		//radius range = 10-30
		p.radius = 1+Math.random()*5;
		//life range = 20-30
		p.life = 10+Math.random()*20;
		p.remaining_life = p.life;
		//colors
		p.r = Math.round(Math.random()*255);
		p.g = Math.round(Math.random()*50);
		p.b = Math.round(Math.random()*50);

		return p;
	},
	
	draw: function()
	{
		//Painting the canvas black
		//Time for lighting magic
		//particles are painted with "lighter"
		//In the next frame the background is painted normally without blending to the 
		//previous frame
		ctx.save();
		ctx.globalCompositeOperation = "source-over";
		ctx.globalCompositeOperation = "lighter";

		
		
		for(var i = 0; i < this.particles.length; i++)
		{
			var p = this.particles[i];
			ctx.beginPath();
			//changing opacity according to the life.
			//opacity goes to 0 at the end of life of a particle
			p.opacity = Math.round(p.remaining_life/p.life*100)/100
			//a gradient instead of white fill
			var gradient = ctx.createRadialGradient(p.location.x, p.location.y, 0, p.location.x, p.location.y, p.radius);
			gradient.addColorStop(0, "rgba("+p.r+", "+p.g+", "+p.b+", "+p.opacity+")");
			gradient.addColorStop(0.5, "rgba("+p.r+", "+p.g+", "+p.b+", "+p.opacity+")");
			gradient.addColorStop(1, "rgba("+p.r+", "+p.g+", "+p.b+", 0)");
			ctx.fillStyle = gradient;
			ctx.arc(p.location.x, p.location.y, p.radius, Math.PI*2, false);
			ctx.fill();
			
			//lets move the particles
			p.remaining_life--;
			p.radius--;
			p.location.x += p.speed.x;
			p.location.y += p.speed.y;
			
			//regenerate particles
			if(p.remaining_life < 0 || p.radius < 0)
			{
				//a brand new particle replacing the dead one
				this.particles[i] = this.particle();
			}
			
		}
		ctx.restore();
	}
});

