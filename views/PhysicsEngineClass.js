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


PhysicsEngineClass = Class.extend({
	world: null,

	PHYSICS_LOOP_HZ: 1.0 / 60.0,

	//-----------------------------
	create: function() {
		this.world = new World(
			new Vec2(0,0), // Gravity vector
			false					 // Boolean for allowing sleep (true) or not (false)
		);
	},

	//-----------------------------------------------------------------
	update: function() {
		var start = Date.now();

		this.world.Step(
			this.PHYSICS_LOOP_HZ, // A framerate at which to update physics
			10,										// The number of velocity iterations to calculate
			10										// The number of position iterations to calculate
		)

		this.world.ClearForces();// Remove any forces at every physics update

		return(Date.now() - start);
	},

	//------------------------------------------------------------
	registerBody: function(bodyDef) {
		var body = this.world.CreateBody(bodyDef);
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

    bodyDef.position.x = entityDef.x;
    bodyDef.position.y = entityDef.y;


    var body = this.registerBody(bodyDef);
    var fixtureDef = new FixtureDef();


    if(entityDef.useBouncyFixture) {
    fixtureDef.density = 1.0;
    fixtureDef.friction = 0;
    fixtureDef.restitution = 1.0;
		}


		// Now we define the shape of this object as a box
		fixtureDef.shape = new PolygonShape();
		fixtueDef.shape.SetAsBox(entityDef.halfWidth, entityDef.halfHeight);

		body.CreateFixture(fixtureDef);

		return body;
	},

	//----------------------------------------------------------------
	removeBody: function(obj) {
		this.world.DestroyBody(obj);
	}

};