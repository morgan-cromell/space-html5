// These are global shorthands we declare for Box2D primitives
// we'll be using very frequently.

Vec2 = Box2D.Common.Math.b2Vec2;
BodyDef = Box2D.Dynamics.b2BodyDef;
Body = Box2D.Dynamics.b2Body;
FixtureDef = Box2D.Dynamics.b2FixtureDef;
Fixture = Box2D.Dynamics.b2Fixture;
World = Box2D.Dynamics.b2World;
MassData = Box2D.Collision.Shapes.b2MassData;
PolygonShape = Box2D.Collision.Shapes.b2PolygonShape;
CircleShape = Box2D.Collision.Shapes.b2CircleShape;
DebugDraw = Box2D.Dynamics.b2DebugDraw;
RevoluteJointDef = Box2D.Dynamics.Joints.b2RevoluteJointDef;
DistanceJoint = Box2D.Dynamics.Joints.b2DistanceJoint;
DistanceJointDef = Box2D.Dynamics.Joints.b2DistanceJointDef;
b2Settings = Box2D.Common.b2Settings;
b2MouseJointDef = Box2D.Dynamics.Joints.b2MouseJointDef;


PhysicsEngineClass = Class.extend({
	world: null,
	planets: [],
	debris: [],
	planetRadius: 3,

	PHYSICS_LOOP_HZ: 1.0 / 60.0,

	//-----------------------------
	create: function() {
		
		this.world = new World(
			new Vec2(0,0), // Gravity vector
			false		   // Boolean for allowing sleep (true) or not (false)
		);

	},

	//-----------------------------------------------------------------
	update: function() {
		var start = Date.now();

		this.world.Step(
			this.PHYSICS_LOOP_HZ, // A framerate at which to update physics
			8,					  // The number of velocity iterations to calculate
			3					  // The number of position iterations to calculate
		)
		
		this.world.ClearForces();
		//make gravity "planets" that pulls "debris" towards it.
		for(var i = 0; i < this.debris.length; i++){
			var debrisRotations = [];
			var debrisPosition = this.debris[i].GetWorldCenter();
			for(var j = 0; j < this.planets.length; j++) {
				var planetShape = this.planets[j].GetFixtureList().GetShape(); // Since static bodies in Box2D does not have mass
				var planetRadius = planetShape.GetRadius(); 				   // the bigger the radius, the more intence the gravity attraction.
				var planetPosition = this.planets[j].GetWorldCenter();
				var planetDistance = new Vec2(0,0);
				planetDistance.Add(debrisPosition);
				planetDistance.Subtract(planetPosition);
				var finalDistance = planetDistance.Length();
				if(finalDistance <= planetRadius * this.planetRadius) {							// Checks if the debris should be affected by planet gravity. (3 times the planet radius.)
					planetDistance.NegativeSelf();
					var vecSum = Math.abs(planetDistance.x) + Math.abs(planetDistance.y);
					planetDistance.Multiply((10 * SCALE/vecSum)*planetRadius/finalDistance);
					this.debris[i].ApplyForce(planetDistance, debrisPosition);

						var deltaY = debrisPosition.y - planetPosition.y;
						var deltaX = debrisPosition.x - planetPosition.x;
						//this.debris[i].SetAngle(Math.atan2(deltaY, deltaX) + (90 * Math.PI / 180));
				
				}
			}

		}





		return(Date.now() - start);
	},
	//-------------------------------------------------------------
	addContactListener: function(callbacks) {
	    var listener = new Box2D.Dynamics.b2ContactListener;
	    if (callbacks.BeginContact) listener.BeginContact = function(contact) {
	        callbacks.BeginContact(contact.GetFixtureA(),
	                               contact.GetFixtureB());
	    }

	    if (callbacks.EndContact) listener.EndContact = function(contact) {
	        callbacks.EndContact(contact.GetFixtureA(),
	                             contact.GetFixtureB());
	    }



	    this.world.SetContactListener(listener);
	
	},

	//------------------------------------------------------------
	registerBody: function(bodyDef) {
		var body = this.world.CreateBody(bodyDef);
		return body;
	},



	//------------------------------------------------------------
	addPlanet: function(entityDef) {
		var bodyDef = new BodyDef();

		var id = entityDef.id;

		var BODY_STATES = {
			static: Body.b2_staticBody,
			dynamic: Body.b2_dynamicBody
		};

		bodyDef.type = BODY_STATES[entityDef.type];

		if(entityDef.userData) bodyDef.userData = entityDef.userData;
		var radius = (entityDef.Width/2 + entityDef.Height/2)/ 2;
		bodyDef.position.x = (entityDef.x + radius)/ SCALE;
		bodyDef.position.y = (entityDef.y + radius)/ SCALE;

		if(entityDef.radius)radius = entityDef.radius;
		if(entityDef.radius){
			bodyDef.position.x = entityDef.x / SCALE;
	    	bodyDef.position.y = entityDef.y / SCALE;
    	}
		

		var planet = this.registerBody(bodyDef);

		

		var fixtureDef = new FixtureDef();
		  
    	fixtureDef.density = 1.0;
		fixtureDef.restitution = 0;
		
		if(entityDef.density)fixtureDef.density = entityDef.density;
		if(entityDef.friction)fixtureDef.friction = entityDef.friction;
		if(entityDef.restitution || entityDef.restitution == 0)fixtureDef.restitution = entityDef.restitution;

		

		fixtureDef.shape = new CircleShape(radius/SCALE)



		

		planet.CreateFixture(fixtureDef);
		this.planets.push(planet);
		return planet;
		
	},



	addPlayer: function(entityDef) {

		var BODY_STATES = {
			static: Body.b2_staticBody,
			dynamic: Body.b2_dynamicBody
		};

		// Create a new BodyDef object
		var bodyDef = new BodyDef();

		var id = entityDef.id;

		bodyDef.type = BODY_STATES[entityDef.type];

		bodyDef.position.x = entityDef.x / SCALE;
		bodyDef.position.y = entityDef.y / SCALE;

		if(entityDef.userData) bodyDef.userData = entityDef.userData;


		var body = this.registerBody(bodyDef);
		var fixtureDef = new FixtureDef();

		if(entityDef.fixedRotation) body.SetFixedRotation(true);
		if(entityDef.angle)body.SetAngle(entityDef.angle * Math.PI / 180);

		if(entityDef.debris)this.debris.push(body);
		if(entityDef.planet)this.planets.push(body);

		if(entityDef.useBouncyFixture) {
			console.log("bounce!");
			fixtureDef.density = 1.0;
			fixtureDef.friction = 0.5;
			fixtureDef.restitution = 0.2;
			}

		if(entityDef.density)fixtureDef.density = entityDef.density;
		if(entityDef.friction)fixtureDef.friction = entityDef.friction;
		if(entityDef.restitution || entityDef.restitution == 0)fixtureDef.restitution = entityDef.restitution;


		// Now we define the shape of this object as a box
		fixtureDef.shape = new CircleShape((entityDef.width/2 + entityDef.Height/2) / 2 / SCALE);

		body.CreateFixture(fixtureDef);

		if(entityDef.feet){
			fixtureDef.shape.SetAsOrientedBox(0.1, 0.1, new Vec2(0,0), 0);
			fixtureDef.isSensor = true;
			var feet = body.CreateFixture(fixtureDef);
			feet.SetUserData("feet");

		}

		return body;
	},




	//-------------------------------------------------------------
	addBody: function(entityDef) {

		var BODY_STATES = {
			static: Body.b2_staticBody,
			dynamic: Body.b2_dynamicBody
		};

		// Create a new BodyDef object
    var bodyDef = new BodyDef();

    var id = entityDef.id;

    bodyDef.type = BODY_STATES[entityDef.type];

    bodyDef.position.x = entityDef.x / SCALE;
    bodyDef.position.y = entityDef.y / SCALE;

    if(entityDef.userData) bodyDef.userData = entityDef.userData;


    var body = this.registerBody(bodyDef);
    var fixtureDef = new FixtureDef();

    if(entityDef.fixedRotation) body.SetFixedRotation(true);
    if(entityDef.angle)body.SetAngle(entityDef.angle * Math.PI / 180);

    if(entityDef.debris)this.debris.push(body);
    if(entityDef.planet)this.planets.push(body);

    if(entityDef.useBouncyFixture) {
    	console.log("bounce!");
    	fixtureDef.density = 1.0;
		fixtureDef.friction = 0.5;
		fixtureDef.restitution = 0.2;
		}

	if(entityDef.density)fixtureDef.density = entityDef.density;
	if(entityDef.friction)fixtureDef.friction = entityDef.friction;
	if(entityDef.restitution || entityDef.restitution == 0)fixtureDef.restitution = entityDef.restitution;


		// Now we define the shape of this object as a box
		fixtureDef.shape = new PolygonShape();
		fixtureDef.shape.SetAsBox(entityDef.Width / SCALE / 2, entityDef.Height / SCALE / 2);

		body.CreateFixture(fixtureDef);

		if(entityDef.feet){
			fixtureDef.shape.SetAsOrientedBox(0.1, 0.1, new Vec2(0, entityDef.Height / SCALE / 2), 0);
			fixtureDef.isSensor = true;
			var feet = body.CreateFixture(fixtureDef);
			feet.SetUserData("feet");

		}

		return body;
	},



	//--------------------------------------------------------------
	addPolygonBody: function(entityDef){

		var BODY_STATES = {
			static: Body.b2_staticBody,
			dynamic: Body.b2_dynamicBody
		};

			// Create a new BodyDef object
	    var bodyDef = new BodyDef();

	    var id = entityDef.id;

	    bodyDef.type = BODY_STATES[entityDef.type];

	    bodyDef.position.x = entityDef.x / SCALE;
	    bodyDef.position.y = entityDef.y / SCALE;

	    if(entityDef.userData) bodyDef.userData = entityDef.userData;


	    var body = this.registerBody(bodyDef);

	    var fixtureDef = new FixtureDef();

	    if(entityDef.fixedRotation) body.SetFixedRotation(true);
	    if(entityDef.angle)body.SetAngle(entityDef.angle * Math.PI / 180);

		if(entityDef.density)fixtureDef.density = entityDef.density;
		if(entityDef.friction)fixtureDef.friction = entityDef.friction;
		if(entityDef.restitution)fixtureDef.restitution = entityDef.restitution;


		// Now we define the shape of this object as a box
		fixtureDef.shape = new PolygonShape();
		var points = [];

		for(var i = 0; i < entityDef.polygonPoints.length; i++) {
			var vec = new Vec2();
			vec.Set(entityDef.polygonPoints[i].x / SCALE, entityDef.polygonPoints[i].y / SCALE);
			points[i] = vec;
		}

		fixtureDef.shape.SetAsArray(points, points.length);


		body.CreateFixture(fixtureDef);


		return body;
	},


	addSensor: function(entityDef) {

		// Create a new BodyDef object
	    var bodyDef = new BodyDef();

	    var id = entityDef.id;

	    bodyDef.type = Body.b2_staticBody

	    	var extraAngleX = Math.cos(entityDef.angle * 180/Math.PI) * entityDef.Width/2;
	    	var extraAngleY = -Math.sin(entityDef.angle * 180/Math.PI) * entityDef.Height/2;

	    	if(entityDef.angle < 180){
	    		extraAngleY+= SCALE;
	    		extraAngleX+= SCALE;
	    	}else if(entityDef.angle > 180){
	    		extraAngleY-= entityDef.angle;
	    		extraAngleX-= SCALE;
	    	}


	    bodyDef.position.x = (entityDef.x + extraAngleX) / SCALE;
	    bodyDef.position.y = (entityDef.y + extraAngleY) / SCALE;
	    bodyDef.angle = entityDef.angle * Math.PI/180;

	    if(entityDef.userData) bodyDef.userData = entityDef.userData;


	    var body = this.registerBody(bodyDef);
	    var fixtureDef = new FixtureDef();

		// Now we define the shape of this object as a box
		fixtureDef.shape = new PolygonShape();
		fixtureDef.shape.SetAsBox(entityDef.Width / 2 / SCALE, entityDef.Height / 2 / SCALE);
		fixtureDef.isSensor = true;

		body.CreateFixture(fixtureDef);

		return body;
	},

	

	//----------------------------------------------------------------
	removeBody: function(obj) {
		this.world.DestroyBody(obj);
	},

	sigNum: function sign(x) { return x > 0 ? 1 : x < 0 ? -1 : 0; }

});

var gPhysicsEngine = new PhysicsEngineClass();