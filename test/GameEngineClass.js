var DEBUG = false;

var tickCount = 0;
var canvas = document.getElementById("my_canvas");
canvas.style.zoom = 1;
canvas.style.zIndex = -1;
canvas.width = window.innerWidth - 50;
canvas.height = window.innerHeight - 70;

var ctx = canvas.getContext("2d");

var SCALE = 30;
GameEngineClass = Class.extend({
	
	entities: [],
    factory: {},
    _defferedKill: [],

    loadTick: 0,


	//-----------------------------
	setup: function () {
		// Call our input setup method to bind
		// our keys to actions and set the
		// event listeners.
		gInputEngine.setup();

		//Call our physics create method

		gPhysicsEngine.create();
		gPhysicsEngine.update();
		
		
		gPhysicsEngine.addContactListener({

			BeginContact: function (fixtureA, fixtureB, impulse) {
                var uA = fixtureA.GetBody() ? fixtureA.GetBody().GetUserData() : null;
                var uB = fixtureB.GetBody() ? fixtureB.GetBody().GetUserData() : null;
                
                if (uA) {
                    if (uA.ent && uA.ent.onContactStart) {
                        uA.ent.onContactStart(fixtureA,fixtureB, null);
                    }
                }

                if (uB) {
                    if (uB.ent && uB.ent.onContactStart) {
                        uB.ent.onContactStart(fixtureB,fixtureA, null);
                    }
                }
            },


            EndContact: function (fixtureA, fixtureB, impulse) {
                var uA = fixtureA.GetBody() ? fixtureA.GetBody().GetUserData() : null;
                var uB = fixtureB.GetBody() ? fixtureB.GetBody().GetUserData() : null;
                
                if (uA) {
                    if (uA.ent && uA.ent.onContactEnd) {
                        uA.ent.onContactEnd(fixtureA,fixtureB, null);
                    }
                }

                if (uB) {
                    if (uB.ent && uB.ent.onContactEnd) {
                        uB.ent.onContactEnd(fixtureB,fixtureA, null);
                    }
                }
            },

		

            PreSolve: function (fixtureA, fixtureB, impulse) {
                var uA = fixtureA.GetBody() ? fixtureA.GetBody().GetUserData() : null;
                var uB = fixtureB.GetBody() ? fixtureB.GetBody().GetUserData() : null;
                if (uA) {
                    if (uA.ent && uA.ent.onTouch) {
                        uA.ent.onTouch(fixtureA,fixtureB, null, impulse);
                    }
                }

                if (uB) {
                    if (uB.ent && uB.ent.onTouch) {
                        uB.ent.onTouch(fixtureB,fixtureA, impulse);
                    }
                }
            }
        });



		var debugDraw = new DebugDraw();
		debugDraw.SetSprite(canvas.getContext("2d"));
		debugDraw.SetDrawScale(30);
		debugDraw.SetFillAlpha(0.3);
		debugDraw.SetLineThickness(1.0);
		debugDraw.SetFlags(DebugDraw.e_shapeBit | DebugDraw.e_joinBit);
		gPhysicsEngine.world.SetDebugDraw(debugDraw);


        gMap.load("2dtest.json");

        gSpaceShip.newSpaceShip();



	

	},
	//---------------------------------------------------------------------
	run: function() {
		requestAnimFrame(gGameEngine.run);

		if(canvas.width != (window.innerWidth - 50) / canvas.style.zoom || canvas.height != (window.innerHeight) - 70 / canvas.style.zoom) {
			canvas.width = (window.innerWidth - 50) / canvas.style.zoom;
			canvas.height = (window.innerHeight - 70) / canvas.style.zoom;
		}


        if(gMap.fullyLoaded) {
            stats.update();
            
            gGameEngine.update();
            gGameEngine.draw();
        }

		
	},
	//---------------------------------------------------------------------


    spawnEntity: function (typename, x, y, settings, name) {

    	//Create a new entity based on the "filename" object
    	//and then add it to the existing entities array.
    	console.log(typename)

		var ent = new (this.factory[typename])(x, y, settings, name);

		this.entities.push(ent);
        
    },
    //-------------------------------------------
     removeEntity: function(removeEnt) {
        gGameEngine.entities.erase(removeEnt);
        if(removeEnt.physBody)gPhysicsEngine.removeBody(removeEnt.physBody);
    },

    //-------------------------------------------
	update: function () {
        // Update player position from previous unit.
        

        

        this.entities.forEach(function(ent){
            if (!ent._killed) {
            	if(ent.fullyLoaded)ent.update();
           	}else gGameEngine._defferedKill.push(ent); //if dead add the entity to the "_defferedKill" list so we can remove them later
        });

        this._defferedKill.forEach(function(ent){
        	gGameEngine.removeEntity(ent);
        })
        this._defferedKill = [];

        gPhysicsEngine.update();
        gSpaceShip.update();
        
    },

    //-------------------------------------------------
    draw: function(){


    	ctx.save();

        ctx.translate(-gMap.viewRect.x, -gMap.viewRect.y);

        ctx.fillRect(- 500, -500, canvas.width + 1000, canvas.height + 1000);
    	gMap.draw(canvas.getContext("2d"));
    	
    	//Bucket entities by zIndex
    	var fudgeVariance = 1000;
    	var zIndex_array = [];
    	var entities_bucketed_by_zIndex = {};

          for(i = 0; i < gPhysicsEngine.planets.length; i++) {
            var circleRadius = gPhysicsEngine.planets[i].GetFixtureList().GetShape().GetRadius();


            ctx.beginPath();
            ctx.arc(gPhysicsEngine.planets[i].GetWorldCenter().x * SCALE,gPhysicsEngine.planets[i].GetWorldCenter().y * SCALE,circleRadius * SCALE * gPhysicsEngine.planetRadius,0,2*Math.PI);
            ctx.closePath();
            ctx.fillStyle = 'rgba(15, 60, 255, 0.3)';
            ctx.fill();
            ctx.lineWidth = 3;
            ctx.strokeStyle = '#0038a8';
            ctx.stroke();
        }

    	this.entities.forEach(function(entity) {

   
    		//Don't draw entities that are off screen
    		if(entity.pos.x * SCALE >= gMap.viewRect.x - fudgeVariance &&
    			entity.pos.y * SCALE < gMap.viewRect.x + gMap.viewRect.w + fudgeVariance &&
    			entity.pos.y * SCALE >= gMap.viewRect.y  - fudgeVariance &&
    			entity.pos.y * SCALE < gMap.viewRect.y + gMap.viewRect.h + fudgeVariance)
    		{
    			if (zIndex_array.indexOf(entity.zIndex) === -1)
    			{
    				//If we find that a zIndex for this entity does not exist, we add it to the index array
    				zIndex_array.push(entity.zIndex);
    				entities_bucketed_by_zIndex[entity.zIndex] = [];
    			}
    			entities_bucketed_by_zIndex[entity.zIndex].push(entity);
    		}
    	});

    	// Draw entities sorted by zIndex
    	zIndex_array.sort(function(a, b) {return a - b;});
    	zIndex_array.forEach(function(zindex){
    		entities_bucketed_by_zIndex[zindex].forEach(function(entity){
    			entity.draw(canvas.getContext("2d"));
    		});
    	});
        gSpaceShip.draw();
    	if(DEBUG)gPhysicsEngine.world.DrawDebugData();
        //ctx.clearRect(- 500, -500, canvas.width + 1000, canvas.height + 1000);
        
    	ctx.restore();
    }


});

gGameEngine = new GameEngineClass();


window.onload = function() 
{



var gui = new dat.GUI();

gui.add(gSpaceShip, 'forwardSpeed', 1, 500);
gui.add(gSpaceShip, 'turnSpeed', 1, 1080);
gui.add(gSpaceShip, 'density', 1, 50);
gui.add(gSpaceShip, 'shipSpawned');


gGameEngine.setup();
gGameEngine.run()




};


function pausecomp(ms) {
ms += new Date().getTime();
while (new Date() < ms){}
} 

window.requestAnimFrame = (function(){
          return  window.requestAnimationFrame       || 
                  window.webkitRequestAnimationFrame || 
                  window.mozRequestAnimationFrame    || 
                  window.oRequestAnimationFrame      || 
                  window.msRequestAnimationFrame     || 
                  function(/* function */ callback, /* DOMElement */ element){
                    window.setTimeout(callback, 1000 / 60);
                  };
    })();


var stats = new Stats();
stats.domElement.style.position = "absolute";
stats.domElement.style.top = 10;
    document.body.appendChild(stats.domElement);






