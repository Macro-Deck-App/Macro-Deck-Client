var buttons;
var websocket;
var connected;
var recentConnections = [];
var clientId;
var apiVersion = 20;
var buttonSpacing = 5;
var buttonRadius = 40;
var buttonSize = 100;
var buttonBackground = false;
var brightness = 0.2;
var icons = [];
var deviceType = "";



function disconnect() {
	lastUrl = null;
	if (websocket != null) {
		websocket.close();
	}
}

$( window ).resize(function() {
	autoSize();
});

$(window).on("orientationchange", function (event) {
	autoSize();
});

$(document).ready(function () {
	var urlParams = new URLSearchParams(window.location.search);
	if (urlParams.get('client-id')) {
		clientId = urlParams.get('client-id');
		if (urlParams.get('connect')) {
			connect(urlParams.get('connect'));
		}
	}
	if (urlParams.get('device-type')) {
		deviceType = urlParams.get('device-type');
	}
});

function connect(url) {
	if (connected) return;
	
	if (websocket != null) {
		disconnect();
	}
	
	document.location.hash = 'connecting';
	document.getElementById("button-container").innerHTML = '<div class="d-flex align-items-center justify-content-center" style="height: 500px;"><h1>Connecting to ' + url + '... <span class="spinner-border spinner-border-lg" role="status" aria-hidden="true"></span></h1></div>';
	
	websocket = new WebSocket(url);

	websocket.onopen = function (e) {
		connected = true;
		document.location.hash = 'connected';
		document.getElementById("button-container").innerHTML = '<div class="d-flex align-items-center justify-content-center" style="height: 500px;"><h1>Waiting for the user to accept the connection on the host... <span class="spinner-border spinner-border-lg" role="status" aria-hidden="true"></span></h1></div>';
		var jsonObj = { "Method": JsonMethod.CONNECTED, "Client-Id": clientId, "API": apiVersion, "Device-Type": deviceType }
		doSend(JSON.stringify(jsonObj));
		
	};

	websocket.onclose = function (e) {
		connected = false;
		document.location.hash = 'closed';
	};

	websocket.onmessage = function (e) {
		try {
			var obj = JSON.parse(e.data);
			if (obj.Method == JsonMethod.GET_CONFIG) {
				buttonSpacing = obj.ButtonSpacing;
				buttonRadius = obj.ButtonRadius;
				buttonBackground = obj.ButtonBackground;
				brightness = obj.Brightness;
				var settingsObj = { "Brightness" : brightness }
				document.location.hash = 'connected;' + JSON.stringify(settingsObj);
				generateGrid(obj.Columns, obj.Rows);
				var jsonObj = { "Method" : JsonMethod.GET_BUTTONS }
				doSend(JSON.stringify(jsonObj));

				autoSize();
			} else if (obj.Method == JsonMethod.GET_BUTTONS) {
				var actionButtons = document.getElementsByClassName("action-button");
				var labels = document.getElementsByClassName("label");
				for (var i = 0; i < actionButtons.length; i++) {
					actionButtons[i].style.backgroundImage = '';
					labels[i].style.backgroundImage = '';
				}
				
				this.buttons = obj.Buttons;
				for (var i = 0; i < this.buttons.length; i++) {
					var button = document.getElementById(this.buttons[i].Position_Y + "_" + this.buttons[i].Position_X);
				
					if (this.buttons[i] && this.buttons[i].Icon) {
						var iconPack;
						var icon;

						if (Array.prototype.find != null) { // using faster find method for supported browser
							var _buttons = this.buttons;

							iconPack = icons.IconPacks.find(function (e) {
								return e.Name == _buttons[i].Icon.split(".")[0]
							});

							icon = iconPack.Icons.find(function (e) {
								return e.IconId == _buttons[i].Icon.split(".")[1]
							});
						} else { // using slower for loop to find the icon for older browsers
							for (var j = 0; j < icons.IconPacks.length; j++) {
								if (this.buttons[i].Icon.split(".").length > 0 && icons.IconPacks[j].Name == this.buttons[i].Icon.split(".")[0]) {
									iconPack = icons.IconPacks[j];
								}
							}

							for (var j = 0; j < iconPack.Icons.length; j++) {
								if (this.buttons[i].Icon.split(".").length > 0 && iconPack.Icons[j].IconId == this.buttons[i].Icon.split(".")[1]) {
									icon = iconPack.Icons[j];
								}
							}
                        }

						button.style.backgroundImage = 'url(data:image/gif;base64,' + icon.IconBase64 + ')';
					}
					
					var label = document.getElementById("label_" + this.buttons[i].Position_Y + "_" + this.buttons[i].Position_X);
					if (this.buttons[i].Label.LabelBase64) {
						label.style.backgroundImage = 'url(data:image/gif;base64,' + this.buttons[i].Label.LabelBase64 + ')';
					}
				}
				autoSize();
			} else if (obj.Method == JsonMethod.UPDATE_BUTTON) {
				var button = document.getElementById(obj.Buttons[0].Position_Y + "_" + obj.Buttons[0].Position_X);
				if (obj.Buttons[0].Icon) {
					var iconPack;
					var icon;

					if (Array.prototype.find != null) { // using faster find method to find the icon for supported browsers
						iconPack = icons.IconPacks.find(function (e) {
							return e.Name == obj.Buttons[0].Icon.split(".")[0]
						});

						icon = iconPack.Icons.find(function (e) {
							return e.IconId == obj.Buttons[0].Icon.split(".")[1]
						});
					} else { // using slower for loop to find the icon for older browsers
						for (var j = 0; j < icons.IconPacks.length; j++) {
							if (obj.Buttons[0].Icon.split(".").length > 0 && icons.IconPacks[j].Name == obj.Buttons[0].Icon.split(".")[0]) {
								iconPack = icons.IconPacks[j];
							}
						}

						for (var j = 0; j < iconPack.Icons.length; j++) {
							if (obj.Buttons[0].Icon.split(".").length > 0 && iconPack.Icons[j].IconId == obj.Buttons[0].Icon.split(".")[1]) {
								icon = iconPack.Icons[j];
							}
						}
					}

					
					button.style.backgroundImage = 'url(data:image/gif;base64,' + icon.IconBase64 + ')';
				} else {
					button.style.backgroundImage = '';
				}
				
				var label = document.getElementById("label_" + obj.Buttons[0].Position_Y + "_" + obj.Buttons[0].Position_X);
				if (obj.Buttons[0].Label.LabelBase64) {
					label.style.backgroundImage = 'url(data:image/gif;base64,' + obj.Buttons[0].Label.LabelBase64 + ')';
				}
				
			} else if (obj.Method == JsonMethod.UPDATE_LABEL) {
				var label = document.getElementById("label_" + obj.Buttons[0].Position_Y + "_" + obj.Buttons[0].Position_X);
				if (obj.Buttons[0].Label.LabelBase64) {
					label.style.backgroundImage = 'url(data:image/gif;base64,' + obj.Buttons[0].Label.LabelBase64 + ')';
				}
			} else if (obj.Method == JsonMethod.GET_ICONS) {
				icons = obj;
			}
		} catch(err) {
			console.log(err);
			if (document.getElementById("button-connect-spinner")) {
				document.getElementById("button-connect-spinner").classList.toggle("d-none", true);
			}
		}
	};
	
	websocket.onerror = function (e) {
		websocket.close();
		connected = false;
		document.location.hash = 'error';
	};
}

function generateGrid(columns, rows) {
	var buttonContainer = document.getElementById("button-container");
	buttonContainer.innerHTML = "";
	
	for (var i = 0; i < rows; i++) {
		var row = document.createElement("div");
		row.setAttribute("class", "row");
		row.setAttribute("style", "margin: 0; padding: 0;");
		buttonContainer.appendChild(row);
		for (var j = 0; j < columns; j++) {
			var column = document.createElement("div");
			column.setAttribute("id", "col_" + i + "_" + j);
			column.classList.add("col");
			column.classList.add("blockBox");
			var button = document.createElement("button");
			button.classList.add("action-button");
			button.classList.add("btn");
			button.classList.toggle("btn-secondary", buttonBackground);
			button.setAttribute("id", i + "_" + j);
			$(button).bind('touchstart', function() {
				onMouseDown(this.id);
			});
			$(button).bind('touchend', function() {
				onMouseUp(this.id);
			});
			
			
			var label = document.createElement("div");
			label.setAttribute("id", "label_" + i + "_" + j);
			label.classList.add("label");
			button.appendChild(label);
			
			var loaderContainer = document.createElement("div");
			loaderContainer.classList.add("loader-container");
			loaderContainer.setAttribute("id", "loader_" + i + "_" + j);
			loaderContainer.classList.toggle("d-none", true);
			button.appendChild(loaderContainer);
						
			row.appendChild(column);
			column.appendChild(button);
		}
	}
	
}

function autoSize() {
	var divs = document.getElementsByClassName('blockBox');
	var rows = document.getElementsByClassName('row');
	var container = document.getElementsByClassName('button-container')[0];

	var buttonSize = 100;
    var rowsCount = rows.length;
	var columnsCount = (divs.length / rows.length);
	var width = window.screen.width, height = window.screen.height;
    var buttonSizeX, buttonSizeY;

    if (rowsCount > columnsCount)
    {	
		rowsCount = (divs.length / rows.length);
        columnsCount = rows.length;

    }
    buttonSizeX = width / columnsCount;
    buttonSizeY = height / rowsCount;
    buttonSize = Math.min(buttonSizeX, buttonSizeY);
	
	
	
	var containerWidth = buttonSize * (divs.length / rows.length);
	var containerHeight = buttonSize * (rows.length);
	container.setAttribute("style","width: " + containerWidth + "px; height: " + containerHeight + "px;");

	
	for (i = 0; i < divs.length; i++) {
		divs[i].style.padding = buttonSpacing + "px";
		divs[i].style.borderRadius = buttonRadius + "px";
		divs[i].style.width = buttonSize + "px";
		divs[i].style.height = buttonSize + "px";
	}
	
	var buttons = document.getElementsByClassName('action-button');
	for (i = 0; i < buttons.length; i++) {
		buttons[i].style.borderRadius = ((buttonRadius / 2) / 100) * buttonSize + "px";
	}
	
}

function onMouseDown(id) {
	if (document.getElementById("col_" + id)) {
		document.getElementById("col_" + id).classList.toggle('pressed', true);
	}
	var jsonObj = { "Message" : id, "Method" : JsonMethod.BUTTON_PRESS }
	doSend(JSON.stringify(jsonObj));
}

function onMouseUp(id) {
	if (document.getElementById("col_" + id)) {
		document.getElementById("col_" + id).classList.toggle('pressed', false);
	}
}

function doSend(message) {
    websocket.send(message);
}

var JsonMethod = {
	CONNECTED: "CONNECTED",
    GET_CONFIG: "GET_CONFIG",
    BUTTON_PRESS: "BUTTON_PRESS",
    GET_BUTTONS: "GET_BUTTONS",
	UPDATE_BUTTON: "UPDATE_BUTTON",
	UPDATE_LABEL: "UPDATE_LABEL",
	BUTTON_DONE: "BUTTON_DONE",
	REQUEST_PIN: "REQUEST_PIN",
	GET_ICONS: "GET_ICONS",
	
}
