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
// var rect = document.body.getBoundingClientRect();
var target = document.body;
var rect = getCoords(target);
var rectLeft = 0;//rect.left;
var rectTop = 0;//rect.top;
// var cssScaleX = rect.width / rect.offsetWidth;
// var cssScaleY = rect.height / rect.offsetHeight;

function handleMouseEvent(e){
    mouse.x = (e.clientX - rectLeft) ;//* cssScaleX;
    mouse.y = (e.clientY - rectTop) ;//* cssScaleY;
}

if (document.addEventListener){
    // IE9, Chrome, Safari, Opera
    document.addEventListener("mousewheel", MouseWheelHandler, false);
    // Firefox
    document.addEventListener("DOMMouseScroll", MouseWheelHandler, false);
}
// IE 6/7/8
else{
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
  if (e.code == 'KeyZ' && (e.ctrlKey || e.metaKey)) {
    console.log('Undo!')
    keyboard.keys = [e.key,(e.ctrlKey || e.metaKey)];
  }
  if (e.code == 'KeyX' && (e.ctrlKey || e.metaKey)) {
    console.log('Copy!')
    keyboard.keys = [e.key,(e.ctrlKey.key || e.metaKey.key)];
  }
  if (e.code == 'KeyV' && (e.ctrlKey || e.metaKey)) {
    console.log('Paste!')
    keyboard.keys = [e.key,(e.ctrlKey.key || e.metaKey.key)];
  }else{
    keyboard.keys = [e.key];
  }
  console.log(e.key);
}

document.addEventListener('mousedown', function (e) {
    var e=e||window.event;
    var target=e.target||e.srcElement;
    mouse.down = 1;
    //fix to print class name
    mouse.elm = target.nodeName + ' ' + target.id + ' ' + target.classList[0];
    handleMouseEvent(e);
    chrome.runtime.sendMessage({action:"mouse",cursor:JSON.stringify(mouse)});
});

document.addEventListener('mouseup', function (e) {
    mouse.down = 0;
    handleMouseEvent(e);
    chrome.runtime.sendMessage({action:"mouse",cursor:JSON.stringify(mouse)});
});

document.addEventListener('mouseout', function (e) {
    mouse.down = 0;
    handleMouseEvent(e);
});

document.addEventListener('mousemove',  handleMouseEvent );

//keyboard

document.addEventListener('keydown', function(e) {
    keyboard.down = 1;
    HandleKeyboardEvent(e);
    chrome.runtime.sendMessage({action:"keyboard",keys:JSON.stringify(keyboard)});
});

document.addEventListener('keyup', function(e) {
    keyboard.down = 0;
    HandleKeyboardEvent(e);
    chrome.runtime.sendMessage({action:"keyboard",keys:JSON.stringify(keyboard)});
});
