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

var tabId;
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
var comment = { type:'',commentLength:0 };
var typeBox;
var oldPost;
var target = document.body;
var rect = getCoords(target);
var rectLeft = 0;
var rectTop = 0;

var newsFeed;
var distance_video = 0;
var video_queue = [];
var MOUSE_VISITED_CLASSNAME = 'crx_mouse_visited';

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


var busy;
function MouseWheelHandler(e){
    // cross-browser wheel delta
    var e = window.event || e; // old IE support
    var delta = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)));

    mouse.scroll = window.pageYOffset;
    mouse.delta = delta;
    chrome.runtime.sendMessage({action:"scroll",cursor:JSON.stringify(mouse)});



    // var test_elm = document.querySelector('[data-testid="mute_unmute_control"]');
    //     if(test_elm){
                
    //     }
  
    if(video_queue.length > 0){

        var above = checkVisible(video_queue[0], Math.round(window.innerHeight/1.5), 'above');
        if(above && !busy){
            try{

                var top_video = video_queue.shift();
                console.log("enqueue");
                console.log(video_queue);
                //top_video.classList.add(MOUSE_VISITED_CLASSNAME);   
                top_video.click();
                
            }catch(e){}
        }

        // //var below = checkVisible(video_queue[0]);
        // var above = checkVisible(video_queue[0], 800, 'above');
        // if(above){
        //     try{
        //         var top_video = video_queue.shift();
        //         //debug
        //         top_video.classList.add(MOUSE_VISITED_CLASSNAME);   
        //         top_video.classList.remove(MOUSE_VISITED_CLASSNAME);   
        //         top_video.click();
        //         //console.log("video click");
        //     }catch(e){}
        //     return false;
        // }
    }
    

//    return false;
}

function HandleKeyboardEvent(e){
    keyboard.keys = [e.key];
}

document.addEventListener('mousedown', function (e) {
    var e = e||window.event;
    var target = e.target||e.srcElement;
    var res = false;
    mouse.down = 1;
    
    if(target !== undefined){
        sendTobackground(target);
    }
});

function sendComment(){
    if(typeBox != null) {
        comment.commentLength = typeBox.textContent.length;
        if(comment.commentLength > 0){
            chrome.runtime.sendMessage({action:"post",comment:JSON.stringify(comment)});
            typeBox = null;
        }
    }else{  
            chrome.runtime.sendMessage({action:"post_opt",text:"Comment"});
    }
}

document.addEventListener('keydown', function(e) {
    HandleKeyboardEvent(e);
    if (keyboard.keys == "Enter"){
        checkCommentInputAgain(oldPost);
        sendComment();
    }
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
    
    observerNewsFeed();

    //sendNative("time","");//sync between backgroud and content

}


//Synchronous
//warning Synchronous XMLHttpRequest on the main thread is deprecated because of its detrimental effects to the end user's experience. For more help, check http://xhr.spec.whatwg.org/.
function getReactionSize(url){
    var reaction = null;
    var fileSize = null;
    var http = new XMLHttpRequest();
    http.open('HEAD', url, false); // false = Synchronous
    http.send(null); 
    if (http.status === 200) {
        fileSize = http.getResponseHeader('content-length');
        //console.log('fileSize = ' + fileSize);
    }

    if(fileSize != null){
        switch(+fileSize){//convert to int
            case 264://16x16
                     //24x24
            case 375://32x32
                     //48x48
                reaction = "Like";
            break;
            case 274://16x16
            case 339://24x24
            case 401://32x32
            case 550://48x48
                reaction = "Love";
            break;
            case 299:
            case 431:
            case 514:
            case 698:
                reaction = "Haha";
            break;
            case 318:
            case 397:
            case 513:
            case 656:
                reaction = "Wow";
            break;
            case 335:
            case 438:
            case 542:
            case 724:
                reaction = "Sad";
            break;
            case 447:
            case 616:
            case 782:
            case 977:
                reaction = "Angry";
            break;
            default:
                reaction = "unknown_reaction";
            break;
        }
    }else{
        reaction = "unknown_reaction";
    }

    return reaction;
}



//16x16
//24x24
//32x32
//48x48
var reaction_type = ["Like","Love","Haha","Wow","Sad","Angry"];
var reactions_urls = [

["https://www.facebook.com/rsrc.php/v3/yB/r/lDwm6Y_i0v8.png",//like
"https://www.facebook.com/rsrc.php/v3/ym/r/-gtkr8sn4nQ.png"],

["https://www.facebook.com/rsrc.php/v3/yn/r/Q2ZsBFJIdXg.png",//love
"https://www.facebook.com/rsrc.php/v3/yD/r/UAmSM9NxtV_.png",
"https://www.facebook.com/rsrc.php/v3/ys/r/9lG0tO7RUGG.png",
"https://static.xx.fbcdn.net/rsrc.php/v3/yJ/r/QXtAA0WPYtT.png"],

["https://www.facebook.com/rsrc.php/v3/yX/r/85Fysyalo_E.png",//haha
"https://www.facebook.com/rsrc.php/v3/yc/r/rHJhwCFSJMW.png",
"https://www.facebook.com/rsrc.php/v3/y5/r/0dP3velHfPX.png",
"https://static.xx.fbcdn.net/rsrc.php/v3/yr/r/ozGmVmgLlVc.png"],

["https://www.facebook.com/rsrc.php/v3/yT/r/fhpn7HuBJXG.png",//wow
"https://www.facebook.com/rsrc.php/v3/yl/r/qnemZTBQQrZ.png",
"https://www.facebook.com/rsrc.php/v3/yb/r/dkurclWSh8y.png",
"https://static.xx.fbcdn.net/rsrc.php/v3/yv/r/KVSREcFC-ZN.png"],

["https://www.facebook.com/rsrc.php/v3/yk/r/x-r8xo-ZCcu.png",//sad
"https://www.facebook.com/rsrc.php/v3/y3/r/KOj_DjHT70P.png",
"https://www.facebook.com/rsrc.php/v3/yp/r/-B-OrH3Adm6.png",
"https://static.xx.fbcdn.net/rsrc.php/v3/yx/r/WtN7zfyusg2.png"],

["https://www.facebook.com/rsrc.php/v3/yz/r/XTeRB5Z20Am.png",//angry
"https://www.facebook.com/rsrc.php/v3/ys/r/OwssFEPLcUW.png",
"https://www.facebook.com/rsrc.php/v3/y3/r/lXBcZ_3ci9o.png",
"https://static.xx.fbcdn.net/rsrc.php/v3/yE/r/a_aZhiP7J8a.png"]

];


// function getSizess(){

//     for (var i = reactions_urls.length - 1; i >= 0; i--) {
//             for (var o = reactions_urls[i].length - 1; o >= 0; o--) {
//                 var reaction = null;
//                 var fileSize = null;
//                 var http = new XMLHttpRequest();
//                 http.open('HEAD', reactions_urls[i][o], false); // false = Synchronous
//                 http.send(null); 
//                 if (http.status === 200) {
//                     fileSize = http.getResponseHeader('content-length');
//                     console.log(i + ' fileSize = ' + fileSize);
//                 }
//             }
//         };
// }

// getSizess();

function getReaction(src){
    var reaction = null;
    console.log(src);
    if(src != null){
        for (var i = reactions_urls.length - 1; i >= 0; i--) {
            for (var o = reactions_urls[i].length - 1; o >= 0; o--) {
                if(src == reactions_urls[i][o]){
                    return reaction_type[i];
                }else{
                    //check image size
                    reaction = getReactionSize(src);
                }
            }
        };
       
    }else
        reaction = "unknown_reaction";
    return reaction;
}


function observerNewsFeed(){
     var config_feed = {
        childList: true,
        subtree:true,
        characterData:true,
        attributes:true
        //attributeOldValue: true
    }
    
     var observe_newsFeed = new MutationObserver(function(mutations,observe_newsFeed){
        //sendNative("notification","new pop up");

        mutations.forEach(function(mut) {
            if(mut.type == "childList")
                if(mut.addedNodes.length > 0){
                    try{
 
                        var unmute = mut.addedNodes[0].querySelector('[data-testid="mute_unmute_control"]');
                        if (unmute) {
                            video_queue.push(unmute);
                            //console.log("queue");
                            //console.log(video_queue);
                        }
                    }catch(e){}
                }
        });
        
    });

    newsFeed = document.querySelector('[aria-label="News Feed"]');

    try{
        observe_newsFeed.observe(newsFeed,config_feed);
    }catch(e){
    }
}


function checkVisible(elm, threshold, mode) {
      if(typeof elm !== "undefined"){
          threshold = threshold || 0;
          mode = mode || 'visible';

          var rect = elm.getBoundingClientRect();
          var viewHeight = Math.max(document.documentElement.clientHeight, window.innerHeight);
          var above = rect.bottom - threshold < 0;
          var below = rect.top - viewHeight + threshold >= 0;

          return mode === 'above' ? above : (mode === 'below' ? below : !above && !below);
        }else{
            return false;
        }
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
                    if(no.notif_type == "feedback_reaction_generic"){
                        //check the reaction type by looking at the image
                        var img = mut.addedNodes[0].getElementsByTagName('img')[1];
                        var reaction = getReaction(img.src);
                        console.log(reaction);
                        sendNative("notification",reaction);
                    }else{// default notification
                        sendNative("notification",no.notif_type);
                    }
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
    if(request.time != null){
        var end = new Date().getTime();
        time = end - request.time;
        console.log('Execution time: ' + time);
    }else if(request.init != null){
        //from background
        //if(window.loaded == false){
            onInit();
            //console.log("init");
          //  window.loaded = true;
        //}

    }else{
        tabId = request.tabId;
        console.log('tab id: ' + tabId);
    }
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

function setNotificationCallback(callback) {

    const OldNotify = window.Notification;
    const newNotify = (title, opt) => {
        callback(title, opt);
        return new OldNotify(title, opt);
    };
    newNotify.requestPermission = OldNotify.requestPermission.bind(OldNotify);
    Object.defineProperty(newNotify, 'permission', {
        get: () => {
            return OldNotify.permission;
        }
    });

    window.Notification = newNotify;
}

setNotificationCallback((title, opt) => {
    console.log(title);
  //ipcRenderer.send('notification', title, opt);
});


function getElementByAttribute(attr, value, root) {
    root = root || document.body;
    if(root.hasAttribute(attr) && root.getAttribute(attr) == value) {
        return root;
    }
    var children = root.children, 
        element;
    for(var i = children.length; i--; ) {
        element = getElementByAttribute(attr, value, children[i]);
        if(element) {
            return element;
        }
    }
    return null;
}

$( document ).ready(function() {
    
});



