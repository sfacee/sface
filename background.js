// Copyright (c) 2017 Andrea Vogrig
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.

var manifest = chrome.runtime.getManifest();
var hostName = "com.typedef.sface";
var port = null;

chrome.browserAction.setBadgeText({text: 'sface'});
chrome.browserAction.setBadgeBackgroundColor({color: '#000'});

// listen for any changes to the URL of any tab.
chrome.tabs.onUpdated.addListener(function(id, info, tab) {
  if (tab.url.toLowerCase().indexOf("facebook.com") > -1) {
    // chrome.pageAction.show(tab.id);
  }
});

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {

	if(request.action != null){
		if(request.action == "fb"){
			var msg = {
				"id":request.action,
				"string":request.text,
			};
		}else if (request.action == "scroll") {
			var cursor = JSON.parse(request.cursor);
			var msg = {
				"id":request.action,
				"array":[cursor.scroll,cursor.delta],
				"string":(cursor.delta>0)?"scroll up":"scroll down",
			};

		} else if (request.action == "mouse") {
			var cursor = JSON.parse(request.cursor);
			var msg = {
				"id":request.action,
				"int":cursor.down,
				"float":cursor.scroll,
				"array":[cursor.x,cursor.y],
				"string":cursor.elm
			};
		}
		else if (request.action == "keyboard") {
			var keys = JSON.parse(request.keys);
			var msg = {
				"id":request.action,
				"int":keys.down,
				"strings":keys.keys,
				"string":keys.down?"key down":"key up"
			};
		}
		sendMessageHost(msg);
	}
	return true;

});

function sendMessageHost(msg){
	chrome.runtime.sendNativeMessage(hostName, msg, function(response) {
		if (chrome.runtime.lastError) {
			console.log("ERROR: " + chrome.runtime.lastError.message);
		} else {
			console.log("Messaging host sais: ", response);
		}
	});
}

function onWindowLoad() {
	//connect();
	var msg = {
		"id":"status",
		"string":" sface v"+manifest.version+ " started!"
	};
	sendMessageHost(msg);
}

window.onload = onWindowLoad;
