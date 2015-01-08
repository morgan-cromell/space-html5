AssetManager = Class.extend({

	downloadQueue: [],
	successCount: 0,
	errorCount: 0,
	cache: {},


	queueDownload: function(path) {
		this.downloadQueue.push(path);
	},


	downloadAll: function(downloadCallback) {
		
		if (this.downloadQueue.length === 0) {
      		downloadCallback();
  		}


		for(var i = 0; i < this.downloadQueue.length; i++){
			var path = this.downloadQueue[i];

			//We only use json and image files in our game so it is enough to check if the file is a json else it is an image.
			if(path.indexOf(".json") == -1) { //if file not a json;
				var img = new Image();
				var that = this;
				img.addEventListener("load", function() {
					that.successCount++;
					if(that.isDone()) {
						downloadCallback();

					}
				}, false);

				//track failed transfers.

				img.addEventListener("error", function() {
					that.errorCount++;
					if(that.isDone()){
						downloadCallback();

					}
				}, false);

				img.src = path;
				this.cache[path] = img;
			}
			
		}
	},

	isDone: function() {
		return(this.downloadQueue.length == this.successCount + this.errorCount);
	},

	getAsset = function(path) {
		return this.cache[path];
	}



});