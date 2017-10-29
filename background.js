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

var start_time = new Date().getTime();
var manifest = chrome.runtime.getManifest();
var hostName = "com.typedef.sface";
var port = null;
var defaultUrl = "https://www.facebook.com";
var debugUrl = "chrome://extensions";
var debug = true;
var redirect = debug ? false : true;//redirect to facebook

chrome.browserAction.setBadgeText({text: 'sface'});
chrome.browserAction.setBadgeBackgroundColor({color: '#000'});

var activeTabId;

chrome.tabs.onActivated.addListener(function(activeInfo) {
  activeTabId = activeInfo.tabId;
  chrome.tabs.get(activeTabId, function (tab) {
        if (tab) {
        	var msg = {
				"id":"reload",
				"string":"tab_changed"
			};
			sendMessageHost(msg);
        	if(tab.url.toLowerCase().indexOf("facebook.com") != -1){
				//facebook
  			}else{
  				//uncomment to force selection of a facebook tab
  				//getFacebookTabs();
  			}
        }
    });
});

function getFacebookTabs(){
	chrome.tabs.getAllInWindow(null, function(tabs){
    	for (var i = 0; i < tabs.length; i++) {
    		if(tabs[i].url.toLowerCase().indexOf("facebook.com") != -1){
  				chrome.tabs.update(tabs[i].id, {active: true});
  				return;
  			}
    	}
    	//chrome.tabs.create({ url: defaultUrl });
    	//else select first tab
    	//chrome.tabs.update(tabs[0].id, {active: true});
	});
}

// listen for any changes to the URL of any tab.
chrome.tabs.onUpdated.addListener(function(id, info, tab) {
	if (info.status === 'complete') {
		// 	chrome.tabs.getSelected(null, function(tab) {
		// 	});
		var msg = {
				"id":"reload",
				"string":"tab_url_changed"
			};
			sendMessageHost(msg);
		if(redirect){
			if(tab.url.toLowerCase().indexOf("facebook.com") != -1){
			//facebook
		  	}else{
		  		//redirect to facebook
		  		chrome.tabs.update(tab.id, {url:defaultUrl, active: true});
		  	}
	  	}
	}
	
});


chrome.tabs.onRemoved.addListener(function(tabid, removed) {
	if(redirect){
		var tabCount = 0;
		chrome.tabs.getAllInWindow(null, function(tabs){
			tabCount = tabs.length;
		});
		if(tabCount)
		chrome.tabs.create({ url: defaultUrl });
	}
});

chrome.windows.onRemoved.addListener(function(windowid) {
	//open new window 
 	chrome.windows.create({url: defaultUrl, type: "normal"});
 	if(debug)
		chrome.tabs.create({ url: debugUrl });
});

chrome.windows.onCreated.addListener(function(windowid) {
 	//chrome.windows.remove(windowid);
});


chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {

	if(request.action != null){
		if(request.action == "time"){
			timestamp();
		} else if (request.action == "scroll") {
			var cursor = JSON.parse(request.cursor);
			var msg = {
				"id":request.action,
				"array":[cursor.scroll,cursor.delta],
				"string":(cursor.delta>0)?"scroll up":"scroll down",
			};
		} else if (request.action == "click") {
			var cursor = JSON.parse(request.cursor);
			var msg = {
				"id":request.action,
				"string":cursor.elm
			};
		} else if(request.action == "comment"){
			var comment = JSON.parse(request.comment);
			var msg = {
				"id":request.action,
				"int":comment.commentLength
			};
		} else if(request.action == "notification"){
			var msg = {
				"id":request.action,
				"string":request.text,
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
	var msg = {
		"id":"status",
		"string":" sface v"+manifest.version+ " started!"
	};
	sendMessageHost(msg);
}

//send start time to content.js
function timestamp(){
	chrome.tabs.getSelected(null, function(tab) {
  		chrome.tabs.sendMessage(tab.id, {time: start_time});
	});
}
//var int=self.setInterval(function(){timestamp()},6000);

window.onload = onWindowLoad;

