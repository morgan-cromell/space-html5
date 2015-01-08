SpaceShipClass = Class.extend({
    moving: false,
	currData: null,
    creativeMode: true,
    lastPart: null,
    selectedPart: null,
    partsSheet: null,
    scale: 0.3,
    numOfParts: 25,



        forwardSpeed: 250,
        turnSpeed: 900,
        density: 20,

    particles: ["woop"],

	grid: {
		size: 64,
		x: canvas.width/2,
		y: canvas.height/2,
		width: 64 * 7,
		height: 64 * 7,
		objects: []
	},

    spaceShipSize: {
        width: 1,
        height: 1
    },


    shipData: null,


    shipSpawned: false,


    spaceShipBodies: [],
    partAngle: 0,
    partGui: 0,
    rotateTimer: 0, //to prevent from super rotating by holding middle mouse button.

	load: function () {

        var img = new Image();
        img.src = "parts2.svg";
        var that = this;

        img.onload = function() {
            that.partsSheet = img;
        }

        xhrGet("data/shipData.json", function (data) {

            gSpaceShip.parseJSON(data.currentTarget.responseText);
        });
    },

    parseJSON: function (partInfo) {

        gSpaceShip.currData = JSON.parse(partInfo);

    },


	createShip: function() {

		//psuedo code.
		// part = {
		// 	id: "bananas" // this id is individual for every part, (prob just the pos of the x,y from the center part.)
		// 	relPos.x // in parts
		// 	relPos.y // in parts
		// 	width // in case a part is a bigger part
		// 	height
		// 	type // weapons, hull ect, ?diffirent weight?
		// 	linkedTo: other part id
		// };

        if(this.shipData) {
            gPhysicsEngine.debris.erase(this.shipData);
            gPhysicsEngine.removeBody(this.shipData);
            this.shipData = null;
        }
        

        var bodyDef = new BodyDef()

        bodyDef.type = Body.b2_dynamicBody;
        

        bodyDef.position.x = (800) / SCALE;
        bodyDef.position.y = (300)/ SCALE;

        if(this.shipData){
            gPhysicsEngine.removeBody(this.shipData);
        }
        var shipBody = gPhysicsEngine.world.CreateBody(bodyDef);
        shipBody.SetFixedRotation(false);


		this.grid.objects.forEach(function(part) {


            var fixtureDef = new FixtureDef();

            fixtureDef.density = 1.0;
            fixtureDef.friction = 0.5;
            fixtureDef.restitution = 0.2;

            fixtureDef.userData = part;

            fixtureDef.shape = new PolygonShape();

            var placement = new Vec2((part.x) * 2.12 * gSpaceShip.scale,(part.y) * 2.12 * gSpaceShip.scale);

            fixtureDef.shape.SetAsOrientedBox(64/2/SCALE * gSpaceShip.scale, 64/2/SCALE * gSpaceShip.scale, placement, part.angle * Math.PI / 180);

            shipBody.CreateFixture(fixtureDef);
        });


        this.shipSpawned = true;
        $("#creatorMenu").hide();
        this.shipData = shipBody;
        shipBody.SetLinearDamping(1.0);
        shipBody.SetAngularDamping(1.0);
        gPhysicsEngine.debris.push(shipBody);




	},


    spaceShipEditorUpdate: function() {


        $("#creatorMenu").show();

        this.rotateTimer--;

        if(this.lastPart != this.selectedPart) {
            this.partAngle = 0;
            var partType = document.getElementById("partType");
            var partInfo = document.getElementById("partInfo");

            for(var i = 0; i < this.currData.parts.length; i++) {
                if(this.selectedPart == this.currData.parts[i].partID) {
                    partType.innerHTML = this.currData.parts[i].type;
                    partInfo.innerHTML = this.currData.parts[i].info;
                }
            }
        }
        this.lastPart = this.selectedPart;


        if(gInputEngine.mouse.middle && this.rotateTimer < 0){
            this.rotateTimer = 15;
            this.partAngle= (this.partAngle + 90) % 360;
        }



        if(this.partGui < 0)this.partGui = this.numOfParts - 5;
        if(this.creativeMode && this.selectedPart !== null){ //too make sure we are creating a new ship and not loading an old one.

        
        if(gInputEngine.mouse.x >= this.grid.x + 20  - this.grid.width/2 && gInputEngine.mouse.x <= this.grid.x - 20  + this.grid.width/2
        && gInputEngine.mouse.y >= this.grid.y + 20  - this.grid.height/2 && gInputEngine.mouse.y <= this.grid.y - 20 + this.grid.height/2)
            {
                if(gInputEngine.mouse.left || gInputEngine.mouse.right || gInputEngine.mouse.middle) {
                    var relativeX = Math.floor((gInputEngine.mouse.x - 10) / this.grid.size) - Math.floor(this.grid.x / this.grid.size);
                    var relativeY = Math.floor((gInputEngine.mouse.y - 20) / this.grid.size) - Math.floor(this.grid.y / this.grid.size);
                    if(relativeX == 0 && relativeY == 0) return; // If we are trying to place a part over the ship core.
                    var drawData = {
                        partId: this.selectedPart,
                        type: this.currData.parts[this.selectedPart].type,
                        x: relativeX,
                        y: relativeY,
                        angle: this.partAngle,
                        linkedTo: null
                    };


                    var putPart = false;

                    var maxX = 0;
                    var minX = 0;
                    var maxY = 0;
                    var minY = 0;

                    // overwrite the old part that is placed in the same grid space.
                    for(var i = 0; i < this.grid.objects.length; i++) {
                       var part = this.grid.objects[i];

                       if(drawData.x == part.x && drawData.y == part.y) {
                            if(gInputEngine.mouse.right) {
                                this.grid.objects.erase(part);
                                return
                        }
                            if(gInputEngine.mouse.left)this.grid.objects.erase(part);
                       }

                        if(drawData.x + 1 == part.x || drawData.x - 1 == part.x) {
                            if(drawData.y == part.y && gInputEngine.mouse.left){
                                putPart = true;
                                drawData.linkedTo = {x: part.x, y: part.y};
                                 
                            }
                        
                        
                        }else if(drawData.y + 1 == part.y || drawData.y - 1 == part.y) {
                            if(drawData.x == part.x && gInputEngine.mouse.left){
                                putPart = true;
                                drawData.linkedTo = {x: part.x, y: part.y};
                            }
                        }

                     
                        if(part.x < minX)minX = part.x;
                        if(part.x > maxX)maxX = part.x;
                        if(part.y < minY)minY = part.y;
                        if(part.y > maxY)maxY = part.y;


                    }


                    this.spaceShipSize.width = maxX + 1;
                    this.spaceShipSize.height = maxY + 1;


                    
                    
                    if(putPart)this.grid.objects.push(drawData);
                    
                    
                }
            }
        }
    },

	update: function() {
        if(!this.shipSpawned) this.spaceShipEditorUpdate();

        if(this.shipSpawned) {
            gMap.centerAt(this.shipData.GetPosition().x * SCALE, this.shipData.GetPosition().y * SCALE);


            this.particles.forEach(function(particle){
                particle.moving = false;
            });



            if(gInputEngine.actions['move-left']) {

                for(var part = this.shipData.GetFixtureList(); part; part = part.GetNext()) {
                    var numOfThrusters = 0;
                    if(part.GetUserData().type == "rightThruster") {
                        numOfThrusters++;
                    }
                    if(part.GetUserData().type == "rightThruster") {
                        this.shipData.ApplyTorque(numOfThrusters * -this.turnSpeed * Math.PI / 180);

                        var trailDir = { x: Math.cos(this.shipData.GetAngle() + 90 * Math.PI/180) , y: Math.sin(this.shipData.GetAngle() + 90 * Math.PI / 180)};

                       var thrusterPos = this.shipData.GetWorldPoint(new Vec2((part.GetUserData().x + 0.4) * 2.12 * gSpaceShip.scale,(part.GetUserData().y + 0.47) * 2.12 * gSpaceShip.scale));

                        var particleSettings = {
                            linkedTo: "x:" + part.GetUserData().x + "y:" + part.GetUserData().y,
                            pos : {
                                x: thrusterPos.x * SCALE,
                                y: thrusterPos.y * SCALE
                            },
                            trail: trailDir,
                            moving: true
                        };

                        var exist = false;
                        for(var i = 0; i < this.particles.length; i++) {

                            if(this.particles[i].linkedTo == particleSettings.linkedTo) {
                                this.particles[i].update(particleSettings);
                                exist = true;

                            }
                            console.log(i);
                            if(i == this.particles.length - 1 && exist == false) {
                                this.particles.push(new ParticleClass(particleSettings));
                            }
                        } 
                        

                        this.moving = true;


                    }
                }




            }

            if(gInputEngine.actions['move-right']) {

                for(var part = this.shipData.GetFixtureList(); part; part = part.GetNext()) {
                    var numOfThrusters = 0;
                    if(part.GetUserData().type == "leftThruster") {
                        numOfThrusters++;
                    }
                    if(part.GetUserData().type == "leftThruster") {
                        this.shipData.ApplyTorque(numOfThrusters * this.turnSpeed * Math.PI / 180);

                        var trailDir = { x: Math.cos(this.shipData.GetAngle() + 90 * Math.PI/180) , y: Math.sin(this.shipData.GetAngle() + 90 * Math.PI / 180)};

                       var thrusterPos = this.shipData.GetWorldPoint(new Vec2((part.GetUserData().x - 0.4) * 2.12 * gSpaceShip.scale,(part.GetUserData().y + 0.47) * 2.12 * gSpaceShip.scale));

                        var particleSettings = {
                            linkedTo: "x:" + part.GetUserData().x + "y:" + part.GetUserData().y,
                            pos : {
                                x: thrusterPos.x * SCALE,
                                y: thrusterPos.y * SCALE
                            },
                            trail: trailDir,
                            moving: true
                        };

                        var exist = false;
                        for(var i = 0; i < this.particles.length; i++) {

                            if(this.particles[i].linkedTo == particleSettings.linkedTo) {
                                this.particles[i].update(particleSettings);
                                exist = true;

                            }

                            if(i == this.particles.length - 1 && exist == false) {
                                this.particles.push(new ParticleClass(particleSettings));
                            }
                        } 

                        this.moving = true;



                    }
                }


            

            }

            if(gInputEngine.actions['move-up']) {
                var numOfThrusters = 0;
                for(var part = this.shipData.GetFixtureList(); part; part = part.GetNext()) {
                    if(part.GetUserData().type == "thruster") {
                        numOfThrusters++;
                    }

                    if(part.GetUserData().type == "thruster") {

                        var force = new Vec2(Math.cos(this.shipData.GetAngle() - 90 * Math.PI/180) * numOfThrusters * this.forwardSpeed , Math.sin(this.shipData.GetAngle() - 90 * Math.PI / 180) * numOfThrusters * this.forwardSpeed);
                            this.shipData.ApplyForce(force, this.shipData.GetPosition());

                        var trailDir = { x: Math.cos(this.shipData.GetAngle() + 90 * Math.PI/180) , y: Math.sin(this.shipData.GetAngle() + 90 * Math.PI / 180)};

                        var thrusterPos = this.shipData.GetWorldPoint(new Vec2((part.GetUserData().x) * 2.12 * gSpaceShip.scale,(part.GetUserData().y + 0.5) * 2.12 * gSpaceShip.scale));


                        var particleSettings = {
                            linkedTo: "x:" + part.GetUserData().x + "y:" + part.GetUserData().y,
                            pos : {
                                x: thrusterPos.x * SCALE,
                                y: thrusterPos.y * SCALE
                            },
                            trail: trailDir,
                            moving: true
                        };

                        var exist = false;
                        for(var i = 0; i < this.particles.length; i++) {

                            if(this.particles[i].linkedTo == particleSettings.linkedTo) {
                                this.particles[i].update(particleSettings);
                                exist = true;

                            }

                            if(i == this.particles.length - 1 && exist == false) {
                                this.particles.push(new ParticleClass(particleSettings));
                            }
                        }  

                        this.moving = true;

                    }
                }
            }


            for(var part = this.shipData.GetFixtureList(); part; part = part.GetNext()) {
                part.SetDensity(this.density);
            }
            this.shipData.ResetMassData();



        }


      
	},

	newSpaceShip: function() {
		//hmmmmmmm tricky one...


	   this.load();
		// we create buttons for every part.
		// maybe load part properties from json??

		for(var i = this.partGui + 1; i <= this.partGui + 5; i++){
        
            btn = document.createElement("button");

            btn.setAttribute("class", "sprite-" + i);
            btn.setAttribute("name", "parts");

            btn.setAttribute("onclick", "gSpaceShip.selectedPart = " + (i-1))
            btn.style.backgroundImage = "url(parts.svg)";
            btn.style.backgroundColor = "transparent";
            btn.style.border = 0;
            btn.style.zoom = "25%";
            btn.style.margin = "1px";
            btn.style.position = "relative";
            btn.style.top = "153px";
            btn.style.left = "-83px";

            var frm = document.getElementById("creatorMenu");
            frm.appendChild(btn);








        }

        var textArea = document.createElement("h20");
        textArea.id = "partType"
        textArea.className = "partType"
        frm.appendChild(textArea);

        var textArea = document.createElement("p");
        textArea.id = "partInfo"
        textArea.className = "partInfo"
        frm.appendChild(textArea);

        



         var corePart = {
                        partId: 13,
                        x: 0,
                        y: 0,
                        angle: 0
                    };
        this.grid.objects.push(corePart)


	},



    modifyGui: function(dir) {
        this.partAngle = 0;
        var parts = document.getElementsByName("parts");
        
            
        for(var i = 0; i < parts.length; i++) {
            var part = parts[i];
            var partID = part.className.replace("sprite-", "");
            partID = parseInt(partID);


            if(dir == "+") {
                if(partID < this.numOfParts) {
                    part.className  = "sprite-" + (partID + 1);
                }else {
                    part.className  = "sprite-" + (1);
                } 
            }


            if(dir == "-") {
                if(partID > 1)part.className  = "sprite-" + (partID - 1);
                else part.className = "sprite-" + (this.numOfParts);
            }

                partID = part.className.replace("sprite-", "");
                partID = parseInt(partID);
                part.setAttribute("onclick", "gSpaceShip.selectedPart = " + (partID - 1));
            
        }
    },


	renderGrid: function (gridPixelSize, startX, startY, width, height, color){
        ctx.save();
        ctx.translate(gMap.viewRect.x, gMap.viewRect.y);
        ctx.globalAlpha = 0.5;
        ctx.lineWidth = 0.5;
        ctx.strokeStyle = color;

        // horizontal grid lines
        for(var i = startY + gridPixelSize; i <= height - gridPixelSize; i = i + gridPixelSize)
        {
            ctx.beginPath();
            ctx.moveTo(startX, i);
            ctx.lineTo(width, i);
            ctx.closePath();
            ctx.stroke();
        }

        // vertical grid lines
        for(var j = startX + gridPixelSize; j <= width - gridPixelSize; j = j + gridPixelSize)
        {
            ctx.beginPath();
            ctx.moveTo(j, startY);
            ctx.lineTo(j, height);
            ctx.closePath();
            ctx.stroke();
        }

        ctx.restore();
    },

    drawObjectsOnGrid: function(centerX, centerY) {


    	ctx.save();
        ctx.translate(gMap.viewRect.x, gMap.viewRect.y);
    	ctx.translate(centerX, centerY);

    		for(i = 0; i < this.grid.objects.length; i++) {
    			var part = this.grid.objects[i];
                ctx.rotate(part.angle * Math.PI / 180);
                if(part.angle == 0) {
                    ctx.drawImage(this.partsSheet, 0, part.partId * 64, 64, 63, part.x * this.grid.size, part.y * this.grid.size, 64, 63);
                }else if(part.angle == 90) {
                    ctx.drawImage(this.partsSheet, 0, part.partId * 64, 64, 63, part.y * this.grid.size, (-1 -part.x) * this.grid.size, 64, 63);
                }else if(part.angle == 180){
                    ctx.drawImage(this.partsSheet, 0, part.partId * 64, 64, 63, (-1 -part.x) * this.grid.size, (-1 -part.y) * this.grid.size, 64, 63);
                }else if(part.angle == 270){
                    ctx.drawImage(this.partsSheet, 0, part.partId * 64, 64, 63, (-1 -part.y) * this.grid.size, part.x * this.grid.size, 64, 63);
                }
                ctx.rotate(-part.angle * Math.PI / 180);

    		}

    	if(this.selectedPart !== null && 
        gInputEngine.mouse.x >= this.grid.x + 20  - this.grid.width/2 && gInputEngine.mouse.x <= this.grid.x - 20 + this.grid.width/2
		&& gInputEngine.mouse.y >= this.grid.y + 20  - this.grid.height/2 && gInputEngine.mouse.y <= this.grid.y - 20 + this.grid.height/2)
		{
    		var relativeX = Math.floor((gInputEngine.mouse.x - 10) / this.grid.size) - Math.floor(this.grid.x / this.grid.size);
			var relativeY = Math.floor((gInputEngine.mouse.y - 20)/ this.grid.size) - Math.floor(this.grid.y / this.grid.size);
            ctx.globalAlpha = 0.5;

            ctx.rotate(this.partAngle * Math.PI / 180);

            if(this.partAngle == 0) {
                ctx.drawImage(this.partsSheet, 0, this.selectedPart * 64, 64, 63, relativeX * this.grid.size, relativeY * this.grid.size, 64, 63);
            }else if(this.partAngle == 90) {
                ctx.drawImage(this.partsSheet, 0, this.selectedPart * 64, 64, 63, relativeY * this.grid.size, (-1 - relativeX) * this.grid.size, 64, 63);
            }else if(this.partAngle == 180){
                ctx.drawImage(this.partsSheet, 0, this.selectedPart * 64, 64, 63, (-1 -relativeX) * this.grid.size, (-1 -relativeY) * this.grid.size, 64, 63);
            }else if(this.partAngle == 270){
                ctx.drawImage(this.partsSheet, 0, this.selectedPart * 64, 64, 63, (-1 -relativeY) * this.grid.size, relativeX * this.grid.size, 64, 63);
            }
			
           
    	}

    	ctx.restore();

    },


    drawShip: function() {
        ctx.save();
        
        ctx.translate(this.shipData.GetPosition ().x * SCALE, this.shipData.GetPosition().y * SCALE);
        ctx.scale(this.scale,  this.scale);
        ctx.rotate(this.shipData.GetAngle());

        ctx.translate(-32, -32);
        for(var part = this.shipData.GetFixtureList(); part; part = part.GetNext()) {
            currentPart = part.GetUserData();
            ctx.rotate(currentPart.angle * Math.PI / 180);

            if(currentPart.angle == 0) {
                ctx.drawImage(this.partsSheet, 0, currentPart.partId * 64, 64, 63, currentPart.x * this.grid.size, currentPart.y * this.grid.size, 64, 63);
            }else if(currentPart.angle == 90) {
                ctx.drawImage(this.partsSheet, 0, currentPart.partId * 64, 64, 63, currentPart.y * this.grid.size, (-1 -currentPart.x) * this.grid.size, 64, 63);
            }else if(currentPart.angle == 180){
                ctx.drawImage(this.partsSheet, 0, currentPart.partId * 64, 64, 63, (-1 -currentPart.x) * this.grid.size, (-1 -currentPart.y) * this.grid.size, 64, 63);
            }else if(currentPart.angle == 270){
                ctx.drawImage(this.partsSheet, 0, currentPart.partId * 64, 64, 63, (-1 -currentPart.y) * this.grid.size, currentPart.x * this.grid.size, 64, 63);
            }

            ctx.rotate(-currentPart.angle * Math.PI / 180);

        }
        ctx.restore();
    },



	draw: function() {

        if(!this.shipSpawned) {

            this.renderGrid(this.grid.size, this.grid.x - this.grid.width/2, this.grid.y - this.grid.height/2, this.grid.x + this.grid.width/2, this.grid.y + this.grid.height/2, "red");

            if(this.partsSheet)this.drawObjectsOnGrid(this.grid.x - this.grid.size/2 ,this.grid.y - this.grid.size/2);

        }

        if(this.shipSpawned) {
            this.drawShip();
            var that = this;

            this.particles.forEach(function(particle){
                if(particle.moving)particle.draw();
            });
        }
		
	}



});


var gSpaceShip = new SpaceShipClass

