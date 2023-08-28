var buttons;
var websocket;
var connected;
var recentConnections = [];
var clientId;
var rows = 3;
var columns = 5;
var buttonSpacing = 5;
var buttonRadius = 40;
var buttonSize = 100;
var buttonBackground = false;
var brightness = 0.2;
var icons = [];
var deviceType = "";
var pressTimer;
var longPress = false;
var supportButtonReleaseLongPress = false;
var buttonsGenerated = false;

var apiVersion = 20;

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
	document.getElementById("button-container").innerHTML = '<div class="d-flex align-items-center justify-content-center" style="height: 500px;"><h1>Connecting... <span class="spinner-border spinner-border-lg" role="status" aria-hidden="true"></span></h1></div>';
	
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
			switch (obj.Method) {
				case JsonMethod.GET_CONFIG:
					if (obj.Columns !== columns || obj.Rows !== rows || obj.ButtonBackground != buttonBackground) {
						buttonsGenerated = false;
					}
					columns = obj.Columns;
					rows = obj.Rows;
					buttonSpacing = obj.ButtonSpacing;
					buttonRadius = obj.ButtonRadius;
					buttonBackground = obj.ButtonBackground;
					if (obj.SupportButtonReleaseLongPress && obj.SupportButtonReleaseLongPress == true) {
						supportButtonReleaseLongPress = true;
					}
					brightness = obj.Brightness;

					var autoConnect = false;
					if (obj.AutoConnect) {
						autoConnect = obj.AutoConnect;
					}

					var wakeLock = "Connected";
					if (obj.WakeLock) {
						wakeLock = obj.WakeLock;
                    }

					var settingsObj = { "Brightness": brightness, "AutoConnect": autoConnect, "WakeLock": wakeLock };
					document.location.hash = 'connected;' + JSON.stringify(settingsObj);


					var jsonObj = { "Method": JsonMethod.GET_BUTTONS };
					doSend(JSON.stringify(jsonObj));
					

					autoSize();
					break;
				case JsonMethod.GET_BUTTONS:
					if (!buttonsGenerated) {
						buttonsGenerated = true;
						generateGrid(columns, rows);
                    }
					var actionButtons = document.getElementsByClassName("action-button");
					var labels = document.getElementsByClassName("label");
					for (var i = 0; i < actionButtons.length; i++) {
						actionButtons[i].style.backgroundImage = '';
						actionButtons[i].classList.toggle("btn-secondary", true);
						labels[i].style.backgroundImage = '';
					}

					this.buttons = obj.Buttons;
					for (var i = 0; i < this.buttons.length; i++) {
						if (!this.buttons[i]) {
							continue;
                        }
						var button = document.getElementById(this.buttons[i].Position_Y + "_" + this.buttons[i].Position_X);
						var label = document.getElementById("label_" + this.buttons[i].Position_Y + "_" + this.buttons[i].Position_X);

						if (button) {
							if (this.buttons[i].Icon) {
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
							} else if (this.buttons[i].IconBase64) {
								button.style.backgroundImage = 'url(data:image/gif;base64,' + this.buttons[i].IconBase64 + ')';
							}


							if (this.buttons[i].BackgroundColorHex) {
								button.classList.toggle("btn-secondary", !this.buttons[i].BackgroundColorHex);
								button.style.backgroundColor = this.buttons[i].BackgroundColorHex;
							}
						}

						if (label) {
							if (this.buttons[i].Label && this.buttons[i].Label.LabelBase64) {
								label.style.backgroundImage = 'url(data:image/gif;base64,' + this.buttons[i].Label.LabelBase64 + ')';
							} else if (this.buttons[i].LabelBase64) {
								label.style.backgroundImage = 'url(data:image/gif;base64,' + this.buttons[i].LabelBase64 + ')';
							} else {
								label.style.backgroundImage = '';
							}
						}
					}
					autoSize();
					break;
				case JsonMethod.UPDATE_BUTTON:
					var button = document.getElementById(obj.Buttons[0].Position_Y + "_" + obj.Buttons[0].Position_X);

					if (button) {
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
						} else if (obj.Buttons[0].IconBase64) {
							button.style.backgroundImage = 'url(data:image/gif;base64,' + obj.Buttons[0].IconBase64 + ')';
                        } else {
							button.style.backgroundImage = '';
						}


						if (obj.Buttons[0].BackgroundColorHex) {
							button.classList.toggle("btn-secondary", !obj.Buttons[0].BackgroundColorHex);
							button.style.backgroundColor = obj.Buttons[0].BackgroundColorHex;
						}
					}

					var label = document.getElementById("label_" + obj.Buttons[0].Position_Y + "_" + obj.Buttons[0].Position_X);
					if (label) {
						if (obj.Buttons[0].Label && obj.Buttons[0].Label.LabelBase64) {
							label.style.backgroundImage = 'url(data:image/gif;base64,' + obj.Buttons[0].Label.LabelBase64 + ')';
						} else if (obj.Buttons[0].LabelBase64) {
							label.style.backgroundImage = 'url(data:image/gif;base64,' + obj.Buttons[0].LabelBase64 + ')';
						} else {
							label.style.backgroundImage = '';
						}
					}
					break;
				case JsonMethod.UPDATE_LABEL:
					var label = document.getElementById("label_" + obj.Buttons[0].Position_Y + "_" + obj.Buttons[0].Position_X);
					if (obj.Buttons[0].Label && obj.Buttons[0].Label.LabelBase64) {
						label.style.backgroundImage = 'url(data:image/gif;base64,' + obj.Buttons[0].Label.LabelBase64 + ')';
					} else if (obj.Buttons[0].LabelBase64) {
						label.style.backgroundImage = 'url(data:image/gif;base64,' + obj.Buttons[0].LabelBase64 + ')';
					} else {
						label.style.backgroundImage = '';
					}
					break;
				case JsonMethod.GET_ICONS:
					icons = obj;
					break;
            }
		} catch(err) {
			console.log(err);
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
			var button = document.createElement("div");
			button.classList.add("action-button");
			button.classList.toggle("btn-secondary", buttonBackground);
			button.setAttribute("id", i + "_" + j);
			$(button).bind('touchstart', function() {
				onTouchStart(this.id);
			});
			$(button).bind('touchend', function() {
				onTouchEnd(this.id);
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

function onTouchStart(id) {
	buttonPress(id);
}

function onTouchEnd(id) {
	buttonPressRelease(id);
}

function buttonPress(id) {
	longPress = false;
	pressTimer = window.setTimeout(function () {
		longPress = true;
		var jsonObj = { "Message": id, "Method": JsonMethod.BUTTON_LONG_PRESS }
		if (supportButtonReleaseLongPress) {
			doSend(JSON.stringify(jsonObj));
		}
	}, 1000);
	if (document.getElementById("col_" + id)) {
		document.getElementById("col_" + id).classList.toggle('pressed', true);
		document.getElementById("col_" + id).classList.toggle('release-transition', false);
	}
	var jsonObj = { "Message": id, "Method": JsonMethod.BUTTON_PRESS }
	doSend(JSON.stringify(jsonObj));
}

function buttonPressRelease(id) {
	clearTimeout(pressTimer);
	if (document.getElementById("col_" + id)) {
		document.getElementById("col_" + id).classList.toggle('pressed', false);
		document.getElementById("col_" + id).classList.toggle('release-transition', true);
	}

	var jsonObj = { "Message": id, "Method": JsonMethod.BUTTON_RELEASE }
	if (longPress) {
		jsonObj = { "Message": id, "Method": JsonMethod.BUTTON_LONG_PRESS_RELEASE }
	}
	if (supportButtonReleaseLongPress) {
		doSend(JSON.stringify(jsonObj));
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
	BUTTON_PRESS: "BUTTON_PRESS",
	BUTTON_LONG_PRESS: "BUTTON_LONG_PRESS",
	BUTTON_RELEASE: "BUTTON_RELEASE",
	BUTTON_LONG_PRESS_RELEASE: "BUTTON_LONG_PRESS_RELEASE"
}
