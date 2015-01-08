var TiledMap = Class.extend({

	//full parsed mappdata from JSON file
	currMapData: null,


	//tilesets stores each invidual tileset from map.json "tilesets" array.
	tilesets: [],

	//all the animated tiles we have in our map
	animations: [],

	//width and height of the map in tiles.
	//"width" and "height" data from map.json.

	numXTiles: null,
	numYTiles: null,


	//the size of each tile.
	//these values are often the same but sometimes not.
	//extracted from "tilewidth" and "tileheight" from map.json

	offsetX: 0,
	offsetY: 0,

	tileSize: {
		"x": 64,
		"y": 64
	},

	//the size of the entire map in pixels.
	//Calculated based on the "numXTiles", "numYTiles"
	//and "tileSize" parameters.

	pixelSize: {
		"x": 64,
		"y": 64
	},

	//counter on how many images(tilesets) we have loaded.
	imgLoadCount: 0,

	//Boolean flag to set once our map atlas
	//has finished loading.

	fullyLoaded: false,

	topLayers: 0,

	//-------------------------------------------


	//load the json file at the url "map" into memory.
	//This is using the XMLHtppRequest.

	load: function(map) {
		//perform a XMLHttpRequest to grab the JSON file at url "map".
		xhrGet(map, function(data) {
			//once its loaded, we call the parseMapJson method.
			gMap.parseMapJSON(data.currentTarget.responseText);
		});
	},

	//--------------------------------------------------

	parseMapJSON: function(mapJSON) {
		gMap.currMapData = JSON.parse(mapJSON);
		var map = gMap.currMapData;

		//sets the above properties of our TILEDMap based
		//on the properties in "currMapData".

		gMap.numXTiles = map.width;
		gMap.numYTiles = map.height;
		gMap.tileSize.x = map.tilewidth;
		gMap.tileSize.y = map.tileheight;
		

		//going through "map.tilesets", an Array.
		//loading each provided tileset as an image.
		//and adds them to our array.

		for(var i = 0; i < map.tilesets.length; i++) {
			var tileset = map.tilesets[i];
			var img = new Image();
			img.onload = function() {
				//add one to the loadcount.
				gMap.imgLoadCount++;

				if(gMap.imgLoadCount == map.tilesets.length) {
					//once all the tilesets are loaded, 
					//set the "fullyloaded" flag to true.
					gMap.fullyloaded = true;

				}
			};

			//loading the "src" file of each image

			img.src = map.tilesets[i].image.replace(/^.*\/(.*)$/, "$1");

			//this is the javascript object we create for the "tilesets" array above.

			var ts = {
				"firstgid": tileset.firstgid,

				"image": img,
				"imageheight": tileset.imageheight,
				"imagewidth": tileset.imagewidth,
				"name": tileset.name,
				"spacing":tileset.spacing,
				"margin":tileset.margin,

				"numXTiles" : Math.floor((tileset.imagewidth + tileset.spacing) / (tileset.tilewidth + tileset.spacing)),
				"numYTiles" : Math.floor((tileset.imageheight  + tileset.spacing) / (tileset.tileheight + tileset.spacing))
			};

			//then we push the newly created object into the "tilesets" array above.
			this.tilesets.push(ts);
		}

		gMap.createAnimations(map);
	},

	//-------------------------------------

	createAnimations: function(map) {
		for(var layerIdx = 0; layerIdx < gMap.currMapData.layers.length; layerIdx++){
			if (gMap.currMapData.layers[layerIdx].name == "top") gMap.topLayers ++;
			if (gMap.currMapData.layers[layerIdx].type == "objectgroup") {
				gMap.topLayers ++;
				if (gMap.currMapData.layers[layerIdx].name == "animations") {
					var anim = gMap.currMapData.layers[layerIdx].objects;
					for(var animIDX = 0; animIDX < anim.length; animIDX++ ){
						var img = new Image();
						img.src = anim[animIDX].properties.src.replace("\/", "/");
						var animObj = {
							name: anim[animIDX].name,
							image: img,
							x:anim[animIDX].x,
							y: anim[animIDX].y,
							frameWidth: anim[animIDX].width,
							frameHeight: anim[animIDX].height,
							currentFrame: 1,
							currentFrameX: 0,
							currentFrameY: 0,
							framesX: null,
							framesY: null,
							framesTot: null,
							oneLine: null,

							frameDuration: anim[animIDX].properties.frameduration,


							current_tick: (new Date()).getTime(),
							last_tick: (new Date()).getTime(),
							sum_tick: 0,

							//------
							setup: function() {
								this.framesX = this.image.width / this.frameWidth;
								this.framesY = this.image.height / this.frameHeight;
								if(this.framesY == 1) this.onLine = true;
								this.framesTot = this.framesX * this.framesY;
							},
							//-------

							update: function() {


								this.current_tick = (new Date()).getTime();
								this.sum_tick += (this.current_tick - this.last_tick);
								this.last_tick = this.current_tick;

								if(this.sum_tick > this.frameDuration) {
									this.currentFrame++;
									this.sum_tick = 0;
								}

								if(this.currentFrame > this.framesTot) this.currentFrame = 1;
							},

							draw: function(ctx, offsetX, offsetY) {
								this.offsetY = offsetY;
								this.offsetX = offsetX;
								this.currentFrameX = (this.currentFrame % this.framesX);
								this.currentFrameY = Math.floor(this.currentFrame / (this.framesX));
								if (this.onLine) this.currentFrameY = Math.floor(this.currentFrame / (this.framesX + 1));
								

								ctx.drawImage(this.image, 
									this.currentFrameX * this.frameWidth, this.currentFrameY * this.frameHeight, 
									this.frameWidth, this.frameHeight, 
									this.x + offsetX, this.y + offsetY, 
									this.frameWidth, this.frameHeight);
								

							}
						}
						animObj.setup();
						gMap.animations.push(animObj);
					}
				}
			}
		}

	},


	getTilePacket: function(tileIndex) {


		var pkt = {
			"img": null,
			"px": 0,
			"py": 0,
			"margin":0
		};


		var tile = 0;
		for(tile = gMap.tilesets.length - 1; tile >= 0; tile--) {
			if(gMap.tilesets[tile].firstgid <= tileIndex) break;
		}
		var ts = gMap.tilesets[tile];
		pkt.img = ts.image;
		var localIdx = tileIndex - ts.firstgid;
		var lTileX = (localIdx % ts.numXTiles);
		var lTileY = Math.floor(localIdx / ts.numXTiles);
		pkt.px = lTileX * (gMap.tileSize.x + ts.spacing);
		pkt.py = Math.floor(lTileY * (gMap.tileSize.y + ts.spacing));
		pkt.margin = ts.margin;


		return pkt;
	},

	//----------------------------------



	update: function() {
		for(var animIDX = 0; animIDX < gMap.animations.length; animIDX++) {
			gMap.animations[animIDX].update();
		}
	},

	drawTop: function(ctx, offsetX, offsetY) {
		if (!gMap.fullyloaded) return;

		for(var layerIdx = gMap.currMapData.layers.length - gMap.topLayers; layerIdx < gMap.currMapData.layers.length; layerIdx++){
			if(gMap.currMapData.layers[layerIdx].type != "tilelayer") continue;

			var dat = gMap.currMapData.layers[layerIdx].data

				for(var tileIDX = 0; tileIDX < dat.length; tileIDX++) {
					var tID = dat[tileIDX];
					if(tID === 0) continue;

					var tPKT = gMap.getTilePacket(tID);

					var tileWidth = gMap.currMapData.tilewidth - tPKT.margin;
					var tileHeight = gMap.currMapData.tileheight - tPKT.margin;

					var x = (tileIDX % gMap.currMapData.layers[layerIdx].width);
					var y = Math.floor((tileIDX / gMap.currMapData.layers[layerIdx].height));
					x = (x * tileWidth);
					y = (y * tileHeight);
					if(x + offsetX > -32 && x + offsetX < canvas.width + 32 && y + offsetY > -32 && y + offsetY < canvas.height + 32) {
						ctx.drawImage(tPKT.img, tPKT.px + tPKT.margin, tPKT.py + tPKT.margin, tileWidth, tileHeight, x + offsetX, y + offsetY, tileWidth, tileHeight);
					}
					

				}
		}


		for(var animIDX = 0; animIDX < gMap.animations.length; animIDX++) {
		gMap.animations[animIDX].setup();
		gMap.animations[animIDX].draw(ctx, offsetX, offsetY);
		}
	},


	draw: function(ctx, offsetX, offsetY) {
		if (!gMap.fullyloaded) return;
		this.offsetY = offsetY;
		this.offsetX = offsetX;
		for(var layerIdx = 0; layerIdx < gMap.currMapData.layers.length; layerIdx++){
			if(gMap.currMapData.layers[layerIdx].type != "tilelayer") continue;

			var dat = gMap.currMapData.layers[layerIdx].data

				for(var tileIDX = 0; tileIDX < dat.length; tileIDX++) {
					var tID = dat[tileIDX];
					if(tID === 0) continue;

					var tPKT = gMap.getTilePacket(tID);

					var tileWidth = gMap.currMapData.tilewidth - tPKT.margin;
					var tileHeight = gMap.currMapData.tileheight - tPKT.margin;

					var x = (tileIDX % gMap.currMapData.layers[layerIdx].width);
					var y = Math.floor((tileIDX / gMap.currMapData.layers[layerIdx].height));
					x = (x * tileWidth);
					y = (y * tileHeight);
					if(x + offsetX > -32 && x + offsetX < canvas.width + 32 && y + offsetY > -32 && y + offsetY < canvas.height + 32) {
						ctx.drawImage(tPKT.img, tPKT.px + tPKT.margin, tPKT.py + tPKT.margin, tileWidth, tileHeight, x + offsetX, y + offsetY, tileWidth, tileHeight);
					}
					

				}
		}
	
	},



	collide: function(x, y){
		x+= 64;
		y+= 64;

		var box1 = {
			top: y + 32, 						   // The y-value of the top of the rectangle
			bottom: y + 16,	   // the y-value of the bottom of the rectangle
			right: x,	  				   // the x-value of the right side of the rectangle
			left: x,	       // the x-value of the left side of the rectangle
			};

		for(var layerIdx = 0; layerIdx < gMap.currMapData.layers.length; layerIdx++){
			if(gMap.currMapData.layers[layerIdx].name == "collision"){
				var objects = gMap.currMapData.layers[layerIdx].objects;
				for (var objectIDX = 0; objectIDX < objects.length; objectIDX++){
					object = objects[objectIDX];
					var box2 = {
						top: object.y + this.offsetY, 						   // The y-value of the top of the rectangle
						bottom: object.y + this.offsetY + object.height,	   // the y-value of the bottom of the rectangle
						right: object.x + this.offsetX + object.width,	  				   // the x-value of the right side of the rectangle
						left: object.x + this.offsetX ,	       // the x-value of the left side of the rectangle
					};

							if(!(box2.left > box1.right ||
							 box2.right < box1.left ||
							 box2.top > box1.bottom ||
							 box2.bottom < box1.top)) return true;


				}
			}
		}
		return false;
	}
});


gMap = new TiledMap();