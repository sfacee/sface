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

var time;
var first_notify = false;
var second_notify = false;

function getCoords(elem) { // crossbrowser version
    var box = elem.getBoundingClientRect();
    var body = document.body;
    var docEl = document.documentElement;
    var scrollTop = window.pageYOffset || docEl.scrollTop || body.scrollTop;
    var scrollLeft = window.pageXOffset || docEl.scrollLeft || body.scrollLeft;
    var clientTop = docEl.clientTop || body.clientTop || 0;
    var clientLeft = docEl.clientLeft || body.clientLeft || 0;
    var top  = box.top +  scrollTop - clientTop;
    var left = box.left + scrollLeft - clientLeft;
    return { top: Math.round(top), left: Math.round(left) };
}


var mouse = { x:0, y:0, down:0 , elm:'', scroll:0, delta:0};
var keyboard = { keys:[], down:0};
var comment = { commentLength:0 };
var typeBox;
var target = document.body;
var rect = getCoords(target);
var rectLeft = 0;
var rectTop = 0;

function handleMouseEvent(e){
    mouse.x = (e.clientX - rectLeft);
    mouse.y = (e.clientY - rectTop);
}

if (document.addEventListener){
    // IE9, Chrome, Safari, Opera
    document.addEventListener("mousewheel", MouseWheelHandler, false);
    // Firefox
    document.addEventListener("DOMMouseScroll", MouseWheelHandler, false);
} else{
    // IE 6/7/8
    document.attachEvent("onmousewheel", MouseWheelHandler);
}

//mouse

function MouseWheelHandler(e){
    // cross-browser wheel delta
    var e = window.event || e; // old IE support
    var delta = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)));

    mouse.scroll = window.pageYOffset;
    mouse.delta = delta;
    chrome.runtime.sendMessage({action:"scroll",cursor:JSON.stringify(mouse)});

    return false;
}

function HandleKeyboardEvent(e){
    keyboard.keys = [e.key];
}

document.addEventListener('mousedown', function (e) {
    var e = e||window.event;
    var target = e.target||e.srcElement;
    mouse.down = 1;
    //fix to print class name
    if(target !== undefined){
        mouse.elm = clickDispatcher(target);
        if(mouse.elm != null){
            if(mouse.elm == "POST"){
                sendComment();
            }else{
                typeBox = (mouse.elm.indexOf("WRITING_") !== -1) ? target : null;
                handleMouseEvent(e);
                chrome.runtime.sendMessage({action:"click",cursor:JSON.stringify(mouse)});
            }
        }
    }
});

// document.addEventListener('mouseout', function (e) {
//     mouse.down = 0;
//     handleMouseEvent(e);
// });

// document.addEventListener('mousemove',  function (e){
//     var e = e||window.event;
//     var target = e.target||e.srcElement;
//     console.log(document.body);
//     handleMouseEvent(e);
// });

//keyboard

function sendComment(){
    if(typeBox != null) {
        comment.commentLength = typeBox.textContent.length;
        if(comment.commentLength > 0)
            chrome.runtime.sendMessage({action:"comment",comment:JSON.stringify(comment)});
    }
}

document.addEventListener('keydown', function(e) {
    HandleKeyboardEvent(e);
    if (keyboard.keys == "Enter")
        sendComment();
});

function sendNative(addr,msg){
    chrome.runtime.sendMessage({action:addr,text:msg});
}

MutationObserver = window.MutationObserver || window.WebKitMutationObserver;

function onInit() { 

   var observer_friend_request = new MutationObserver(function(mutations, observer_friend_request) {
      sendNative("notification","new friend");
    });

    var observer_message_request = new MutationObserver(function(mutations, observer_message_request) {
      sendNative("notification","new message");
    });

    var observer_notification_request = new MutationObserver(function(mutations, observer_notification_request) {
        if(!first_notify)
            first_notify = true;
        if(first_notify && !second_notify){
            second_notify = true;
            observerNotify();
        }

    });

    var config = {
        childList: true,
        subtree:true,
        characterData:true,
        attributes:true,
        attributeOldValue: true
    };
    
    var friend = $("#requestsCountValue");
    var message = $("#mercurymessagesCountValue");
    var notification = $("#notificationsCountValue");
    //var notification_popup = $("._50d1");//$("#u_0_4b"); // notification popup _50d1

    try{
        observer_friend_request.observe(friend[0],config);
        observer_message_request.observe(message[0],config);
        observer_notification_request.observe(notification[0],config);
    }catch(e){
    }
        
    sendNative("time","");//sync between backgroud and content
}

function observerNotify(){

    var config_pop = {
        childList: true,
        subtree:true,
        characterData:true,
        attributes:true
        //attributeOldValue: true
    }

    var observe_notification_popup = new MutationObserver(function(mutations,observe_notification_popup){
        //sendNative("notification","new pop up");
        mutations.forEach(function(mut) {
            if(mut.type == "childList")
                if(mut.addedNodes.length > 0){
                    var no = JSON.parse(mut.addedNodes[0].dataset.gt);
                    sendNative("notification",no.notif_type);
                }
        });
    });
    
    var notification_popup = $("._50d1");//$("#u_0_4b"); // notification popup _50d1

    try{
        observe_notification_popup.observe(notification_popup[0],config_pop);
    }catch(e){
    }
}

//listen from background messages
chrome.runtime.onMessage.addListener(function(request, sender) {
    //console.log(request.time);
    var end = new Date().getTime();
    time = end - request.time;
    console.log('Execution time: ' + time);
});


//show message when closing a tab 
// $(window).on('beforeunload', function() {
//     var x =logout();
//     return x;
// });
// function logout(){
//         jQuery.ajax({
//         });
//         return null;
// }

$( document ).ready(function() {
    //var int=self.setTimeout(function(){onInit()},6000);
    onInit();
});


