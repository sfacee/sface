var HTML_NODE = function(_elm,_class,_callback){
	this.elm_ = _elm;
	this.class_ = _class;
	this.callback_ = _callback;
}

HTML_NODE.prototype.is = function(target){
	if(this.elm_ == target.nodeName)
		if(this.class_ == target.classList[0])
			return true;
	return false;
}

function clb_LIKE(target){
	if( target.getAttribute("aria-pressed") == "true")
		return "Unlike";
	else
		return "Like";
}
function clb_REACTION(target){
	return target.textContent;
}
function clb_VIDEO(target){
	return "VIDEO";
}
function clb_STATUS(target){
	return "WRITING_POST";
}
function clb_WRITING(target){
	if (target.clientHeight == 16)
		return "WRITING_MSG";
	else if(target.clientHeight == 18)
		return "WRITING_COMMENT";
	else if (target.clientHeight == 28)
		return "WRITING_POST";
}
function clb_APPROVE(target){
	return "APPROVE";
}
function clb_DELETE(target){
	return "DELETE";
}
function clb_POST(target){
	if(target.textContent == "Post")
		return "POST";
	else
		return null;
}
function clb_HOME(target){
	return "HOME";
}

var HOME_CLICK = [
	new HTML_NODE("A","_2s25",clb_HOME),
	new HTML_NODE("SPAN","_2md",clb_HOME)
	];
var LIKE_CLICK = [new HTML_NODE("A","UFILikeLink",clb_LIKE)];
var REACTION_CLICK = [new HTML_NODE("DIV","_39n",clb_REACTION)];
var POST_CLICK = [
	new HTML_NODE("TEXTAREA","_4h98",clb_STATUS),
	new HTML_NODE("TEXTAREA","_3en1",clb_STATUS),
	];
var WRITING_CLICK = [new HTML_NODE("DIV","_1mf",clb_WRITING)];
var APPROVE_REQUEST = [
	new HTML_NODE("A","_42ft",clb_APPROVE),
	new HTML_NODE("SPAN","_2vhc",clb_APPROVE)
];
var DELETE_REQUEST = [new HTML_NODE("SPAN","_2vhd",clb_DELETE)];

var VIDEO_CLICK = [
	new HTML_NODE("DIV","_1mf",clb_VIDEO),//click on facebook video frame
	new HTML_NODE("VIDEO","_ox1",clb_VIDEO),//click on facebook video frame
	new HTML_NODE("I","_1jto",clb_VIDEO),
	new HTML_NODE("I","_2ipv",clb_VIDEO),//click on restart-play at the end of the video
	new HTML_NODE("I","_5i0o",clb_VIDEO)//click on play/pause facebook video player
];

var YTP_CLICK = [
	new HTML_NODE("a","_6kt",clb_VIDEO),//click on youtube video link
	new HTML_NODE("VIDEO","video-stream",clb_VIDEO),//click on youtube video frame
	new HTML_NODE("BUTTON","ytp-play-button",clb_VIDEO)//click on play pause youtube video player
];

var ACTIVITIES = [
	HOME_CLICK,
	LIKE_CLICK,
	REACTION_CLICK,
	POST_CLICK,
	VIDEO_CLICK,
	YTP_CLICK,
	WRITING_CLICK,
	APPROVE_REQUEST,
	DELETE_REQUEST
];

function clickDispatcher(target){
	for (var i = ACTIVITIES.length - 1; i >= 0; i--) 
		for (var j = ACTIVITIES[i].length - 1; j >= 0; j--) 
			if(ACTIVITIES[i][j].is(target))
				return ACTIVITIES[i][j].callback_(target);

	return clb_POST(target);
}

