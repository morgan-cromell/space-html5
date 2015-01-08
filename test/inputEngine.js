
InputEngineClass = Class.extend({

	// A dictionary mapping ASCII key codes to string values
	// describing the action we want to take when that key is
	// pressed.
	bindings: {87: "move-up", 
               65: "move-left", 
               83: "move-down", 
               68:"move-right"},

	// A dictionary mapping actions that might be taken in our
	// game to a boolean value indicating whether that action
	// is currently being performed.
    actions: {"move-up": false,
              "move-left": false,
              "move-down": false,
              "move-right": false},

	mouse: {
		x: 0,
		y: 0,

		left: false,
		right: false,
		middle: false
	},

	//-----------------------------
	setup: function () {
		// Example usage of bind, where we're setting up
		// the W, A, S, and D keys in that order.
		gInputEngine.bind(87, 'move-up');
		gInputEngine.bind(65, 'move-left');
		gInputEngine.bind(83, 'move-down');
		gInputEngine.bind(68, 'move-right');

		gInputEngine.bind(38, 'gravity_up');
		gInputEngine.bind(40, 'gravity_down');
		gInputEngine.bind(37, 'gravity_left');
		gInputEngine.bind(39, 'gravity_right');

		// Adding the event listeners for the appropriate DOM events.
		canvas.addEventListener('mousemove', gInputEngine.onMouseMove);
	

		window.addEventListener('mousedown', gInputEngine.onMouseDown);
		window.addEventListener('mouseup',gInputEngine.onMouseUp);

		window.addEventListener('keydown', gInputEngine.onKeyDown);
		window.addEventListener('keyup', gInputEngine.onKeyUp);


		window.addEventListener('contextmenu', gInputEngine.preventContext, false);
	},
	//--------------------------------------------------------------------------
	preventContext: function(event) {
		event.preventDefault();
	},

	//-----------------------------
	onMouseMove: function (event) {

		var rect = canvas.getBoundingClientRect();
		gInputEngine.mouse.x = event.clientX - rect.left;
		gInputEngine.mouse.y = event.clientY - rect.top;
	},

	onTouchDown: function(event) {
		gInputEngine.mouse["left"] = true;
	},

	onTouchUp: function(event){
		gInputEngine.mouse["left"] = false;
	},

	//-----------------------------
	onMouseDown: function(event) {
		event.preventDefault();
		var buttons = {
			0: "left",
			1: "middle",
			2: "right"
		}
		if(!gInputEngine.mouse[buttons[event.button]]) {
			gInputEngine.mouse[buttons[event.button]] = true;
		}
	},
	//-----------------------------
		onMouseUp: function(event) {
		var buttons = {
			0: "left",
			1: "middle",
			2: "right"
		}
		gInputEngine.mouse[buttons[event.button]] = false;
	},
	//-----------------------------
	onKeyDown: function (event) {
		// Grab the keyID property of the event object parameter,
		// then set the equivalent element in the 'actions' object
		// to true.
		//
		if(event.keyCode == 88)DEBUG = !DEBUG;
		var action = gInputEngine.bindings[event.keyCode];
		if (action) {
			gInputEngine.actions[action] = true;
		}
	},

	//-----------------------------
	onKeyUp: function (event) {
		// Grab the keyID property of the event object parameter,
		// then set the equivalent element in the 'actions' object
		// to false.
		// 

		var action = gInputEngine.bindings[event.keyCode];
		if (action) {

			gInputEngine.actions[action] = false;
		}
	},

	// The bind function takes an ASCII keycode
	// and a string representing the action to
	// take when that key is pressed.
	// 

	bind: function (key, action) {
		gInputEngine.bindings[key] = action;
	}

});

gInputEngine = new InputEngineClass();


