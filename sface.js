var FBK_element = function(_class,_text,_result){
	this.class_ = _class;
	this.text_ = _text;
	this.result_ = _result;
}

FBK_element.prototype.find = function(e){
	if(this.class_)
		return checkBackward(e,this.class_);
	else if(this.text_)
		return checkBackwardText(e,this.text_);
}

FBK_element.prototype.get = function(e){
	if(this.class_)
		return getElm(e,this.class_);
	// else if(this.text_)
	// 	return checkBackwardText(e,this.text_); TODO
}

var FBK_writing_message = new FBK_element(null,"Type a message...","WRITING_MSG");
var FBK_writing_comment = new FBK_element(null,"Write a comment...","WRITING_COMMENT")

var FBK_elements = [
	FBK_writing_message,
	FBK_writing_comment
];

//["HOME","POST","APPROVE","DELETE","WRITING_MSG","WRITING_COMMENT","WRITING_POST","VIDEO","Like","Unlike"]

// recursive check for parent node class
// return true if the element is inside a specific parent node class.
function checkBackward(e,classe){
    var parent = e.parentNode;
    if(parent){
        if(parent.classList[0] == classe)
            return true;
        else
            return checkBackward(parent,classe);
    }else
        return false;
}


//ES: Type a message...
function checkBackwardText(e,textContent){
    var parent = e.parentNode;
    if(parent){
        if(parent.textContent === textContent)
            return true;
        else
            return checkBackwardText(parent,textContent);
    }else
        return false;
}


// relay on existing html structure


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
	var reaction = "like";
	if(target.textContent !== "Like"){
		reaction = target.textContent;
	}
	if( target.getAttribute("aria-pressed") == "true")
		return "Un"+reaction;
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
	else if(target.clientHeight == 18 || target.clientHeight == 19)
		return "WRITING_COMMENT";
	else if (target.clientHeight == 28)
		return "WRITING_POST";
}
function clb_COMMENT(target){
	var e = target.offsetParent.offsetParent;
	var testElements = e.getElementsByClassName("_1mf");
	var testDivs = Array.prototype.filter.call(testElements, function(testElement){
    	return testElement.nodeName === 'DIV';
	});
	typeBox = testDivs[0];
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
var COMMENT_CLICK = [new HTML_NODE("A","comment_link",clb_COMMENT)]
var APPROVE_REQUEST = [
	new HTML_NODE("A","_42ft",clb_APPROVE),
	new HTML_NODE("SPAN","_2vhc",clb_APPROVE)
];
var DELETE_REQUEST = [new HTML_NODE("SPAN","_2vhd",clb_DELETE)];

var VIDEO_CLICK = [
	// new HTML_NODE("DIV","_1mf",clb_VIDEO),//click on facebook video frame
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
	//HOME_CLICK,
	LIKE_CLICK,
	REACTION_CLICK,
	POST_CLICK,
	VIDEO_CLICK,
	YTP_CLICK,
	WRITING_CLICK, // comment to test new find function
	COMMENT_CLICK,
	APPROVE_REQUEST,
	DELETE_REQUEST
];

function clickDispatcher(target){
	// check for known html elements as before
	for (var i = ACTIVITIES.length - 1; i >= 0; i--) 
		for (var j = ACTIVITIES[i].length - 1; j >= 0; j--) 
			if(ACTIVITIES[i][j].is(target))
				return ACTIVITIES[i][j].callback_(target);

	var post = clb_POST(target);
	if(post)
		return post;
	else{
		// check slow recursive way.	
		for (var i = FBK_elements.length - 1; i >= 0; i--)
			if(FBK_elements[i].find(target))
				return FBK_elements[i].result_;
	}

	return null;
}


