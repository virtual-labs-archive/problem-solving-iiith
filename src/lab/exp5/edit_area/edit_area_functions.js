	//replace tabulation by the good number of white spaces
	
	// call by the replace_tab function
	EditArea.prototype.smartTab= function(){
		var val="";
		return EditArea.prototype.smartTab.arguments[2] + EditArea.prototype.smartTab.arguments[3] + val.substr(0, EditArea.tab_nb_char - (EditArea.prototype.smartTab.arguments[3].length)%editArea.tab_nb_char);
	};

	EditArea.prototype.replaceTab= function(text){
		return text.replace(/((\n?)([^\t\n]*)\t)/gi, EditArea.smartTab);		// slower than simple replace...	
	};
	
	EditArea.prototype.showWaitingScreen= function(){
		var width	= this.editor_area.offsetWidth;
		var height	= this.editor_area.offsetHeight;
		if( !(this.isIE && this.isIE<6) )
		{
			width	-= 2;
			height	-= 2;
		}
		this.processing_screen.style.display= "block";
		this.processing_screen.style.width	= width+"px";
		this.processing_screen.style.height	= height+"px";
		this.waiting_screen_displayed		= true;
	};
	
	EditArea.prototype.hideWaitingScreen= function(){
		this.processing_screen.style.display="none";
		this.waiting_screen_displayed= false;
	};
	
	EditArea.prototype.addStyle= function(styles){
		if(styles.length>0){
			var newcss = document.createElement("style");
			newcss.type="text/css";
			newcss.media="all";
			if(newcss.styleSheet){ // IE
				newcss.styleSheet.cssText = styles;
			} else { // W3C
				newcss.appendChild(document.createTextNode(styles));
			}
			document.getElementsByTagName("head")[0].appendChild(newcss);
		}
	};
	
	EditArea.prototype.setFont= function(family, size){
		var t=this, a=this.textarea, s=this.settings, elemFont, i, elem;
		// list all elements concerned by font changes
		var elems= ["textarea", "contentHighlight", "cursorPos", "endBracket", "selectionField", "selectionFieldText", "lineNumber"];
		
		if(family!=="")
			s["fontFamily"]= family;
		if(size>0)
			s["fontSize"]	= size;
		if(t.isOpera < 9.6 )	// opera<9.6 can't manage non monospace font
			s["fontFamily"]="monospace";
			
		// update the select tag
		if( elemFont = _$("area_font_size") )
		{	
			for( i = 0; i < elemFont.length; i++ )
			{
				if( elemFont.options[i].value && elemFont.options[i].value === s["fontSize"] )
					elemFont.options[i].selected=true;
			}
		}
		
		/*
		 * somethimes firefox has rendering mistake with non-monospace font for text width in textarea vs in div for changing font size (eg: verdana change between 11pt to 12pt)
		 * => looks like a browser internal random bug as text width can change while content_highlight is updated
		 * we'll check if the font-size produce the same text width inside textarea and div and if not, we'll increment the font-size
		 * 
		 * This is an ugly fix 
		 */ 
		if( t.isFirefox )
		{
			var nbTry = 3;
			do {
				var div1 = document.createElement( "div" ), text1 = document.createElement( "textarea" );
				var styles = {
					width:		"40px",
					overflow:	"scroll",
					zIndex: 	50,
					visibility:	"hidden",
					fontFamily:	s["fontFamily"],
					fontSize:	s["fontSize"]+"pt",
					lineHeight:	t.lineHeight+"px",
					padding:	"0",
					margin:		"0",
					border:		"none",
					whiteSpace:	"nowrap",
				};
				var diff, changed = false;
				for( i in styles )
				{
					div1.style[ i ]		= styles[i];
					text1.style[ i ]	= styles[i];
				}
				// no wrap for this text
				text1.wrap = "off";
				text1.setAttribute("wrap", "off");
				t.container.appendChild( div1 );
				t.container.appendChild( text1 );
				// try to make FF to bug
				div1.innerHTML 		= text1.value	= "azertyuiopqsdfghjklm";
				div1.innerHTML 		= text1.value	= text1.value+"wxcvbn^p*ù$!:;,,";
				diff	=  text1.scrollWidth - div1.scrollWidth;
				
				// firefox return here a diff of 1 px between equals scrollWidth (can't explain)
				if( Math.abs( diff ) >= 2 )
				{
					s["fontSize"]++;
					changed	= true;
				}
				t.container.removeChild( div1 );
				t.container.removeChild( text1 );
				nbTry--;
			}while( changed && nbTry > 0 );
		}
		
		
		// calc line height
		elem					= t.test_font_size;
		elem.style.fontFamily	= ""+s["fontFamily"];
		elem.style.fontSize		= s["fontSize"]+"pt";				
		elem.innerHTML			= "0";		
		t.lineHeight			= elem.offsetHeight;

		// update font for all concerned elements
		for( i=0; i<elems.length; i++)
		{
			elem	= _$(elems[i]);	
			elem.style.fontFamily	= s["fontFamily"];
			elem.style.fontSize		= s["fontSize"]+"pt";
			elem.style.lineHeight	= t.lineHeight+"px";
		}
		// define a css for <pre> tags
		t.add_style("pre{font-family:"+s["fontFamily"]+"}");
		
		// old opera and IE>=8 doesn't update font changes to the textarea
		if( ( t.isOpera && t.isOpera < 9.6 ) || t.isIE >= 8 )
		{
			var parNod = a.parentNode, nxtSib = a.nextSibling, start= a.selectionStart, end= a.selectionEnd;
			parNod.removeChild(a);
			parNod.insertBefore(a, nxtSib);
			t.area_select(start, end-start);
		}
		
		// force update of selection field
		this.focus();
		this.update_size();
		this.check_line_selection();
	};
	
	EditArea.prototype.changeFontSize= function(){
		var size=_$("areaFontSize").value;
		if(size>0)
			this.set_font("", size);			
	};
	
	
	EditArea.prototype.openInlinePopup= function(popupId){
		this.close_all_inline_popup();
		var popup= _$(popupId);		
		var editor= _$("editor");
		
		// search matching icon
		for(var i=0; i<this.inlinePopup.length; i++){
			if(this.inlinePopup[i]["popup_id"]===popupId){
				var icon= _$(this.inlinePopup[i]["icon_id"]);
				if(icon){
					this.switchClassSticky(icon, "editAreaButtonSelected", true);			
					break;
				}
			}
		}
		// check size
		popup.style.height="auto";
		popup.style.overflow= "visible";
			
		if(document.body.offsetHeight< popup.offsetHeight){
			popup.style.height= (document.body.offsetHeight-10)+"px";
			popup.style.overflow= "auto";
		}
		
		if(!popup.positionned){
			var newLeft= editor.offsetWidth /2 - popup.offsetWidth /2;
			var newTop= editor.offsetHeight /2 - popup.offsetHeight /2;
			//var new_top= area.offsetHeight /2 - popup.offsetHeight /2;
			//var new_left= area.offsetWidth /2 - popup.offsetWidth /2;
			//alert("new_top: ("+new_top+") = calculeOffsetTop(area) ("+calculeOffsetTop(area)+") + area.offsetHeight /2("+ area.offsetHeight /2+") - popup.offsetHeight /2("+popup.offsetHeight /2+") - scrollTop: "+document.body.scrollTop);
			popup.style.left= newLeft+"px";
			popup.style.top= newTop+"px";
			popup.positionned=true;
		}
		popup.style.visibility="visible";
		
		//popup.style.display="block";
	};

	EditArea.prototype.closeTnlinePopup= function(popupId){
		var popup= _$(popupId);		
		// search matching icon
		for(var i=0; i<this.inlinePopup.length; i++){
			if(this.inlinePopup[i]["popup_id"]==popupId){
				var icon= _$(this.inlinePopup[i]["icon_id"]);
				if(icon){
					this.switchClassSticky(icon, "editAreaButtonNormal", false);			
					break;
				}
			}
		}
		
		popup.style.visibility="hidden";	
	};
	
	EditArea.prototype.closeAllInlinePopup= function(e){
		for(var i=0; i<this.inlinePopup.length; i++){
			this.closeInlinePopup(this.inlinePopup[i]["popup_id"]);		
		}
		this.textarea.focus();
	};
	
	EditArea.prototype.showHelp= function(){
		
		this.openInlinePopup("edit_area_help");
		
	};
			
	EditArea.prototype.newDocument= function(){
		this.textarea.value="";
		this.area_select(0,0);
	};
	
	EditArea.prototype.getAllToolbarHeight= function(){
		var area= _$("editor");
		var results= parent.getChildren(area, "div", "class", "area_toolbar", "all", "0");	// search only direct children
		//results= results.concat(getChildren(area, "table", "class", "area_toolbar", "all", "0"));
		var height=0;
		for(var i=0; i<results.length; i++){			
			height+= results[i].offsetHeight;
		}
		//alert("toolbar height: "+height);
		return height;
	};
	
	EditArea.prototype.goToLine= function(line){	
		if(!line)
		{	
			var icon= _$("goToLine");
			if(icon !== null){
				this.restoreClass(icon);
				this.switchClassSticky(icon, "editAreaButtonSelected", true);
			}
			
			line= prompt(this.get_translation("go_to_line_prompt"));
			if(icon != null)
			{
				this.switchClassSticky(icon, "editAreaButtonNormal", false);
			}
		}
		if(line && line!=null && line.search(/^[0-9]+$/)!=-1){
			var start=0;
			var lines= this.textarea.value.split("\n");
			if(line > lines.length)
				start= this.textarea.value.length;
			else{
				for(var i=0; i<Math.min(line-1, lines.length); i++)
					start+= lines[i].length + 1;
			}
			this.area_select(start, 0);
		}
		
		
	};
	
	
	EditArea.prototype.changeSmoothSelectionMode= function(setTo){
		//alert("setTo: "+setTo);
		if(this.doHighlight)
			return;
			
		if(setTo !== null){
			if(setTo === false)
			{
				this.smoothSelection=true;
			}
			else{
				this.smoothSelection=false;
			}
		}
		var icon= _$("change_smooth_selection");
		this.textarea.focus();
		if(this.smoothSelection===true){
			//setAttribute(icon, "class", getAttribute(icon, "class").replace(/ selected/g, "") );
			/*setAttribute(icon, "oldClassName", "editAreaButtonNormal" );
			setAttribute(icon, "className", "editAreaButtonNormal" );*/
			//this.restoreClass(icon);
			//this.restoreAndSwitchClass(icon,'editAreaButtonNormal');
			this.switchClassSticky(icon, "editAreaButtonNormal", false);
			
			this.smooth_selection=false;
			this.selection_field.style.display= "none";
			_$("cursorPos").style.display= "none";
			_$("endBracket").style.display= "none";
		}else{
			//setAttribute(icon, "class", getAttribute(icon, "class") + " selected");
			//this.switchClass(icon,'editAreaButtonSelected');
			this.switchClassSticky(icon, "editAreaButtonSelected", false);
			this.smoothSelection=true;
			this.selectionField.style.display= "block";
			_$("cursorPos").style.display= "block";
			_$("endBracket").style.display= "block";
		}	
	};
	
	// the auto scroll of the textarea has some lacks when it have to show cursor in the visible area when the textarea size change
	// show specifiy whereas it is the "top" or "bottom" of the selection that is showned
	EditArea.prototype.scrollToView= function(show){
		var zone, lineElem;
		if(!this.smoothSelection)
		{
			return;
		}
		zone= _$("result");
		
		// manage height scroll
		var cursorPosTop= _$("cursorPos").cursor_top;
		if(show==="bottom")
		{
			//cursor_pos_top+=  (this.last_selection["line_nb"]-1)* this.lineHeight;
			cursorPosTop+= this.getLinePosTop( this.last_selection["lineStart"] + this.last_selection["line_Nb"] - 1 );
		}
			
		var maxHeightVisible= zone.clientHeight + zone.scrollTop;
		var missTop	= cursorPosTop + this.lineHeight - maxHeightVisible;
		if(missTop>0){
			//alert(miss_top);
			zone.scrollTop=  zone.scrollTop + missTop;
		}else if( zone.scrollTop > cursorPosTop){
			// when erase all the content -> does'nt scroll back to the top
			//alert("else: "+cursor_pos_top);
			zone.scrollTop= cursorPosTop;	 
		}
		
		// manage left scroll
		//var cursor_pos_left= parseInt(_$("cursor_pos").style.left.replace("px",""));
		var cursorPosLeft= _$("cursorPos").cursor_left;
		var maxWidthVisible= zone.clientWidth + zone.scrollLeft;
		var missLeft= cursorPosLeft + 10 - maxWidthVisible;
		if(missLeft>0){			
			zone.scrollLeft= zone.scrollLeft + missLeft + 50;
		}else if( zone.scrollLeft > cursorPosLeft){
			zone.scrollLeft= cursorPosLeft ;
		}else if( zone.scrollLeft === 45){
			// show the line numbers if textarea align to it's left
			zone.scrollLeft=0;
		}
	};
	
	EditArea.prototype.checkUndo= function(onlyOnce){
		if(!editAreas[this.id])
		{
			return false;
		}
		if(this.textareaFocused && editAreas[this.id]["displayed"]===true){
			var text=this.textarea.value;
			if(this.previous.length<=1)
			{
				this.switchClassSticky(_$("undo"), "editAreaButtonDisabled", true);
			}
			if(!this.previous[this.previous.length-1] || this.previous[this.previous.length-1]["text"] !== text){
				this.previous.push({"text": text, "selStart": this.textarea.selectionStart, "selEnd": this.textarea.selectionEnd});
				if(this.previous.length > this.settings["maxUndo"]+1)
					this.previous.shift();
				
			}
			if(this.previous.length >= 2)
			{
				this.switchClassSticky(_$("undo"), "editAreaButtonNormal", false);		
			}
		}

		if(!onlyOnce)
			setTimeout("editArea.checkUndo()", 3000);
	};
	
	EditArea.prototype.undo= function(){
		//alert("undo"+this.previous.length);
		if(this.previous.length > 0)
		{
			this.getIESelection();
		//	var pos_cursor=this.textarea.selectionStart;
			this.next.push( { "text": this.textarea.value, "selStart": this.textarea.selectionStart, "selEnd": this.textarea.selectionEnd } );
			var prev= this.previous.pop();
			if( prev["text"] == this.textarea.value && this.previous.length > 0 )
				prev	=this.previous.pop();						
			this.textarea.value	= prev["text"];
			this.lastUndo		= prev["text"];
			this.area_select(prev["selStart"], prev["selEnd"]-prev["selStart"]);
			this.switchClassSticky(_$("redo"), 'editAreaButtonNormal', false);
			this.resync_highlight(true);
			//alert("undo"+this.previous.length);
			this.check_file_changes();
		}
	};
	
	EditArea.prototype.redo= function(){
		if(this.next.length > 0)
		{
			/*this.getIESelection();*/
			//var pos_cursor=this.textarea.selectionStart;
			var next= this.next.pop();
			this.previous.push(next);
			this.textarea.value= next["text"];
			this.last_undo= next["text"];
			this.area_select(next["selStart"], next["selEnd"]-next["selStart"]);
			this.switchClassSticky(_$("undo"), "editAreaButtonNormal", false);
			this.resync_highlight(true);
			this.check_file_changes();
		}
		if(	this.next.length === 0)
			this.switchClassSticky(_$("redo"), 'editAreaButtonDisabled', true);
	};
	
	EditArea.prototype.check_redo= function(){
		if(editArea.next.length === 0 || editArea.textarea.value!=editArea.last_undo){
			editArea.next= [];	// undo the ability to use "redo" button
			editArea.switchClassSticky(_$("redo"), 'editAreaButtonDisabled', true);
		}
		else
		{
			this.switchClassSticky(_$("redo"),"editAreaButtonNormal", false);
		}
	};
	
	
	// functions that manage icons roll over, disabled, etc...
	EditArea.prototype.switchClass = function(element, className, lockState) {
		var lockChanged = false;
	
		if (typeof(lockState) !== "undefined" && element !== null) {
			element.classLock = lockState;
			lockChanged = true;
		}
	
		if (element !== null && (lockChanged || !element.classLock)) {
			element.oldClassName = element.className;
			element.className = className;
		}
	};
	
	EditArea.prototype.restoreAndSwitchClass = function(element, className) {
		if (element !== null && !element.classLock) {
			this.restoreClass(element);
			this.switchClass(element, class_name);
		}
	};
	
	EditArea.prototype.restoreClass = function(element) {
		if (element !== null && element.oldClassName && !element.classLock) {
			element.className = element.oldClassName;
			element.oldClassName = null;
		}
	};
	
	EditArea.prototype.setClassLock = function(element, lockState) {
		if (element !== null)
			element.classLock = lockState;
	};
	
	EditArea.prototype.switchClassSticky = function(element, className, lockState) {
		var lockChanged = false;
		if (typeof(lockState) !== "undefined" && element !== null) {
			element.classLock = lockState;
			lockChanged = true;
		}
	
		if (element !== null && (lockChanged || !element.classLock)) {
			element.className = className;
			element.oldClassName = className;
		}
	};
	
	//make the "page up" and "page down" buttons works correctly
	EditArea.prototype.scrollPage= function(params){
		var dir= params["dir"], shiftPressed= params["shift"];
		var lines= this.textarea.value.split("\n");		
		var newPos=0, length=0, charLeft=0, lineNb=0, curLine=0;
		var toScrollAmount	= _$("result").clientHeight -30;
		var nbLineToScroll	= 0, diff= 0;
		var view;
		if(dir==="up"){
			nbLineToScroll	= Math.ceil( toScrollAmount / this.lineHeight );
			
			// fix number of line to scroll
			for( i = this.last_selection["lineStart"]; i - diff > this.last_selection["lineStart"] - nbLineToScroll ; i-- )
			{
				if( elem = _$("line"+ i) )
				{
					diff +=  Math.floor( ( elem.offsetHeight - 1 ) / this.lineHeight );
				}
			}
			nbLineToScroll	-= diff;
			
			if(this.last_selection["selecDirection"]==="up"){
				for(lineNb=0; lineNb< Math.min(this.last_selection["lineStart"]-nbLineToScroll, lines.length); lineNb++){
					newPos+= lines[lineNb].length + 1;
				}
				charLeft=Math.min(lines[Math.min(lines.length-1, lineNb)].length, this.last_selection["currPos"]-1);
				if(shiftPressed)
				{
					length=this.last_selection["selectionEnd"]-newPos-charLeft;	
				}
				this.area_select(newPos+charLeft, length);
				view="top";
			}else{			
				view="bottom";
				for(lineNb=0; lineNb< Math.min(this.last_selection["lineStart"]+this.last_selection["lineNb"]-1-nbLineToScroll, lines.length); line_nb++){
					newPos+= lines[lineNb].length + 1;
				}
				charLeft=Math.min(lines[Math.min(lines.length-1, lineNb)].length, this.last_selection["currPos"]-1);
				if(shiftPressed){
					//length=this.last_selection["selectionEnd"]-new_pos-char_left;	
					start= Math.min(this.last_selection["selectionStart"], newPos+charLeft);
					length= Math.max(newPos+charLeft, this.last_selection["selectionStart"] )- start ;
					if(newPos+charLeft < this.last_selection["selectionStart"])
						view="top";
				}else
					start=newPos+charLeft;
				this.area_select(start, length);
				
			}
		}
		else
		{
			var nbLineToScroll= Math.floor( toScrollAmount / this.lineHeight );
			// fix number of line to scroll
			for( i = this.last_selection["linestart"]; i + diff < this.last_selection["linestart"] + nbLineToScroll ; i++ )
			{
				if( elem = _$("line"+ i) )
				{
					diff +=  Math.floor( ( elem.offsetHeight - 1 ) / this.lineHeight );
				}
			}
			nbLineToScroll	-= diff;
				
			if(this.last_selection["selec_direction"]==="down"){
				view="bottom";
				for(lineNb=0; lineNb< Math.min(this.last_selection["lineStart"]+this.last_selection["lineNb"]-2+nbLineToScroll, lines.length); line_nb++){
					if(lineNb===this.last_selection["lineStart"]-1)
					{
						charLeft= this.last_selection["selectionStart"] -newPos;
					}
					newPos+= lines[lineNb].length + 1;
									
				}
				if(shiftPressed){
					length=Math.abs(this.last_selection["selectionStart"]-new_pos);	
					length+=Math.min(lines[Math.min(lines.length-1, lineNb)].length, this.last_selection["currPos"]);
					//length+=Math.min(lines[Math.min(lines.length-1, line_nb)].length, char_left);
					this.area_select(Math.min(this.last_selection["selectionStart"], newPos), length);
				}else{
					this.area_select(newPos+charLeft, 0);
				}
				
			}else{
				view="top";
				for(lineNb=0; lineNb< Math.min(this.last_selection["lineStart"]+nbLineToScroll-1, lines.length, lines.length); line_nb++){
					if(lineNb===this.last_selection["lineStart"]-1)
					{
						charLeft= this.last_selection["selectionStart"] -newPos;
					}
					newPos+= lines[lineNb].length + 1;									
				}
				if(shiftPressed){
					length=Math.abs(this.last_selection["selectionEnd"]-newPos-charLeft);	
					length+=Math.min(lines[Math.min(lines.length-1, lineNb)].length, this.last_selection["currPos"])- char_left-1;
					//length+=Math.min(lines[Math.min(lines.length-1, line_nb)].length, char_left);
					this.area_select(Math.min(this.last_selection["selectionEnd"], newPos+charLeft), length);
					if(newPos+charLeft > this.last_selection["selectionEnd"])
					{	view="bottom";
					}
				}else{
					this.area_select(newPos+charLeft, 0);
				}
				
			}
		}
		//console.log( new_pos, char_left, length, nbLineToScroll, toScrollAmount, _$("result").clientHeigh );
		this.check_line_selection();
		this.scroll_to_view(view);
	};
	
	EditArea.prototype.startResize= function(e){
		parent.editAreaLoader.resize["id"]		= editArea.id;		
		parent.editAreaLoader.resize["startX"]	= (e)? e.pageX : event.x + document.body.scrollLeft;		
		parent.editAreaLoader.resize["startY"]	= (e)? e.pageY : event.y + document.body.scrollTop;
		if(editArea.isIE)
		{
			editArea.textarea.focus();
			editArea.getIESelection();
		}
		parent.editAreaLoader.resize["selectionStart"]	= editArea.textarea.selectionStart;
		parent.editAreaLoader.resize["selectionEnd"]	= editArea.textarea.selectionEnd;
		parent.editAreaLoader.start_resize_area();
	};
	
	EditArea.prototype.toggleFullScreen= function(to){
		var t=this, p=parent, a=t.textarea, html, frame, selStart, selEnd, old, icon;
		if(typeof(to)==="undefined"){
			to= !t.fullscreen["isFull"];
		}
		old= t.fullscreen["isFull"];
		t.fullscreen["isFull"]= to;
		icon		= _$("fullscreen");
		selStart	= t.textarea.selectionStart;
		selEnd		= t.textarea.selectionEnd;
		html		= p.document.getElementsByTagName("html")[0];
		frame		= p.document.getElementById("frame_"+t.id);
		
		if(to && to!==old)
		{	// toogle on fullscreen		
			
			t.fullscreen['old_overflow']	= p.get_css_property(html, "overflow");
			t.fullscreen['old_height']		= p.get_css_property(html, "height");
			t.fullscreen['old_width']		= p.get_css_property(html, "width");
			t.fullscreen['old_scrollTop']	= html.scrollTop;
			t.fullscreen['old_scrollLeft']	= html.scrollLeft;
			t.fullscreen['old_zIndex']		= p.get_css_property(frame, "z-index");
			if(t.isOpera){
				html.style.height	= "100%";
				html.style.width	= "100%";	
			}
			html.style.overflow	= "hidden";
			html.scrollTop		= 0;
			html.scrollLeft		= 0;
			
			frame.style.position	= "absolute";
			frame.style.width		= html.clientWidth+"px";
			frame.style.height		= html.clientHeight+"px";
			frame.style.display		= "block";
			frame.style.zIndex		= "999999";
			frame.style.top			= "0px";
			frame.style.left		= "0px";
			
			// if the iframe was in a div with position absolute, the top and left are the one of the div, 
			// so I fix it by seeing at witch position the iframe start and correcting it
			frame.style.top			= "-"+p.calculeOffsetTop(frame)+"px";
			frame.style.left		= "-"+p.calculeOffsetLeft(frame)+"px";
			
		//	parent.editAreaLoader.execCommand(t.id, "update_size();");
		//	var body=parent.document.getElementsByTagName("body")[0];
		//	body.appendChild(frame);
			
			t.switchClassSticky(icon, 'editAreaButtonSelected', false);
			t.fullscreen['allow_resize']= t.resize_allowed;
			t.allow_resize(false);
	
			//t.area_select(selStart, selEnd-selStart);
			
		
			// opera can't manage to do a direct size update
			if(t.isFirefox){
				p.editAreaLoader.execCommand(t.id, "update_size();");
				t.area_select(selStart, selEnd-selStart);
				t.scroll_to_view();
				t.focus();
			}else{
				setTimeout("parent.editAreaLoader.execCommand('"+ t.id +"', 'update_size();');editArea.focus();", 10);
			}	
			
	
		}
		else if(to!==old)
		{	// toogle off fullscreen
			frame.style.position="static";
			frame.style.zIndex= t.fullscreen['old_zIndex'];
		
			if(t.isOpera)
			{
				html.style.height	= "auto"; 
				html.style.width	= "auto";
				html.style.overflow	= "auto";
			}
			else if(t.isIE && p!=top)
			{	// IE doesn't manage html overflow in frames like in normal page... 
				html.style.overflow	= "auto";
			}
			else
			{
				html.style.overflow	= t.fullscreen['old_overflow'];
			}
			html.scrollTop	= t.fullscreen['old_scrollTop'];
			html.scrollLeft	= t.fullscreen['old_scrollLeft'];
		
			p.editAreaLoader.hide(t.id);
			p.editAreaLoader.show(t.id);
			
			t.switchClassSticky(icon, 'editAreaButtonNormal', false);
			if(t.fullscreen['allow_resize'])
				t.allow_resize(t.fullscreen['allow_resize']);
			if(t.isFirefox){
				t.area_select(selStart, selEnd-selStart);
				setTimeout("editArea.scroll_to_view();", 10);
			}			
			
			//p.editAreaLoader.remove_event(p.window, "resize", editArea.update_size);
		}
		
	};
	
	EditArea.prototype.allowResize= function(allow){
		var resize= _$("resize_area");
		if(allow){
			
			resize.style.visibility="visible";
			parent.editAreaLoader.add_event(resize, "mouseup", editArea.startResize);
		}else{
			resize.style.visibility="hidden";
			parent.editAreaLoader.remove_event(resize, "mouseup", editArea.startResize);
		}
		this.resize_allowed= allow;
	};
	
	
	EditArea.prototype.changeSyntax= function(newSyntax, isWaiting){
	//	alert("cahnge to "+new_syntax);
		// the syntax is the same
		if(newSyntax===this.settings["syntax"])
		{	return true;
		}
		// check that the syntax is one allowed
		var founded= false;
		for(var i=0; i<this.syntax_list.length; i++)
		{
			if(this.syntax_list[i]==newSyntax)
				founded= true;
		}
		
		if(founded===true)
		{
			// the reg syntax file is not loaded
			if(!parent.editAreaLoader.loadSyntax[newSyntax])
			{
				// load the syntax file and wait for file loading
				if(!isWaiting)
					parent.editAreaLoader.loadScript(parent.editAreaLoader.baseURL + "reg_syntax/" + newSyntax + ".js");
				setTimeout("editArea.change_syntax('"+ newSyntax +"', true);", 100);
				this.showWaitingScreen();
			}
			else
			{
				if(!this.allreadyUsedSyntax[newSyntax])
				{	// the syntax has still not been used
					// rebuild syntax definition for new languages
					parent.editAreaLoader.init_syntax_regexp();
					// add style to the new list
					this.add_style(parent.editAreaLoader.syntax[newSyntax]["styles"]);
					this.allreadyUsedSyntax[newSyntax]=true;
				}
				// be sure that the select option is correctly updated
				var sel= _$("syntaxSelection");
				if(sel && sel.value!=newSyntax)
				{
					for(var i=0; i<sel.length; i++){
						if(sel.options[i].value && sel.options[i].value === newSyntax)
							sel.options[i].selected=true;
					}
				}
				
			/*	if(this.settings['syntax'].length==0)
				{
					this.switchClassSticky(_$("highlight"), 'editAreaButtonNormal', false);
					this.switchClassSticky(_$("reset_highlight"), 'editAreaButtonNormal', false);
					this.change_highlight(true);
				}
				*/
				this.settings["syntax"]= newSyntax;
				this.resyncHighlight(true);
				this.hideWaitingScreen();
				return true;
			}
		}
		return false;
	};
	
	
	// check if the file has changed
	EditArea.prototype.setEditable= function(isEditable){
		if(isEditable)
		{
			document.body.className= "";
			this.textarea.readOnly= false;
			this.isEditable= true;
		}
		else
		{
			document.body.className= "nonEditable";
			this.textarea.readOnly= true;
			this.isEditable= false;
		}
		
		if(editAreas[this.id]["displayed"]===true)
			this.updateSize();
	};
	
	/***** Wrap mode *****/
	
	// toggling function for set_wrap_mode
	EditArea.prototype.toggleWordWrap= function(){
		this.setWordWrap( !this.settings["wordWrap"] );
	};
	
	
	// open a new tab for the given file
	EditArea.prototype.setWordWrap= function(to){
		var t=this, a= t.textarea;
		var wrapMode;
		if( t.isOpera && t.isOpera < 9.8 )
		{
			this.settings["wordWrap"]= false;
			t.switchClassSticky( _$("wordWrap"), "editAreaButtonDisabled", true );
			return false;
		}
		
		if( to )
		{
			wrapMode = "soft";
			this.container.className+= "wordWrap";
			this.container.style.width="";
			this.contentHighlight.style.width="";
			a.style.width="100%";
			if( t.isIE && t.isIE < 7 )	// IE 6 count 50 px too much
			{
				a.style.width	= ( a.offsetWidth-5 )+"px";
			}
			
			t.switchClassSticky( _$("wordWrap"), "editAreaButtonSelected", false );
		}
		else
		{
			wrapMode = "off";
			this.container.className	= this.container.className.replace(/word_wrap/g, '');
			t.switchClassSticky( _$("wordWrap"), "editAreaButtonNormal", true );
		}
		this.textarea.previous_scrollWidth = '';
		this.textarea.previous_scrollHeight = '';
		
		a.wrap= wrapMode;
		a.setAttribute("wrap", wrapMode);
		// only IE can change wrap mode on the fly without element reloading
		if(!this.isIE)
		{
			var start=a.selectionStart, end= a.selectionEnd;
			var parNod = a.parentNode, nxtSib = a.nextSibling;
			parNod.removeChild(a);
			parNod.insertBefore(a, nxtSib);
			this.area_select(start, end-start);
		}
		// reset some optimisation
		this.settings["wordWrap"]	= to;
		this.focus();
		this.update_size();
		this.check_line_selection();
	};	
	/***** tabbed files managing functions *****/
	
	// open a new tab for the given file
	EditArea.prototype.openFile= function(settings){
		
		if(settings["id"]!=="undefined")
		{
			var id= settings["id"];
			// create a new file object with defautl values
			var newFile= {};
			newFile["id"]			= id;
			newFile["title"]		= id;
			newFile["text"]		= "";
			newFile["lastSelection"]	= "";		
			newFile["lastTextToHighlight"]	= "";
			newFile["lastHightlightedText"]	= "";
			newFile["previous"]	= [];
			newFile["next"]		= [];
			newFile["lastUndo"]	= "";
			newFile["smoothSelection"]= this.settings['smoothSelection'];
			newFile["doHighlight"]= this.settings['startHighlight'];
			newFile["syntax"]= this.settings['syntax'];
			newFile["scrollTop"]= 0;
			newFile["scrollLeft"	= 0;
			newFile["selectionStart"]= 0;
			newFile["selectionEnd"]= 0;
			newFile["edited"]		= false;
			newFile["fontSize"]	= this.settings["fontSize"];
			newFile["fontFamily"]	= this.settings["fontFamily"];
			newFile["wordWrap"]	= this.settings["wordWrap"];
			newFile["toolbar"]		= {'links':{}, 'selects': {}};
			newFile["compareEditedText"]= newFile["text"];
			
			
			this.files[id]= newFile;
			this.update_file(id, settings);
			this.files[id]["compareEditedText"]= this.files[id]["text"];
			
			
			var htmlId= "tabFile"+encodeURIComponent(id);
			this.filesIdAssoc[htmlId]= id;
			this.files[id]["htmlId"]= htmlId;
		
			if(!_$(this.files[id]["htmlId"]) && id!=="")
			{
				// be sure the tab browsing area is displayed
				this.tab_browsing_area.style.display= "block";
				var elem= document.createElement('li');
				elem.id= this.files[id]['html_id'];
				var close= "<img src=\""+ parent.editAreaLoader.baseURL +"images/close.gif\" title=\""+ this.get_translation('close_tab', 'word') +"\" onclick=\"editArea.execCommand('close_file', editArea.filesIdAssoc['"+ html_id +"']);return false;\" class=\"hidden\" onmouseover=\"this.className=''\" onmouseout=\"this.className='hidden'\" />";
				elem.innerHTML= "<a onclick=\"javascript:editArea.execCommand('switch_to_file', editArea.filesIdAssoc['"+ html_id +"']);\" selec=\"none\"><b><span><strong class=\"edited\">*</strong>"+ this.files[id]['title'] + close +"</span></b></a>";
				_$('tab_browsing_list').appendChild(elem);
				var elem= document.createElement("text");
				this.update_size();
			}
			
			// open file callback (for plugin)
			if(id!=="")
			{
				this.execCommand("file_open", this.files[id]);
			}
			this.switchToFile(id, true);
			return true;
		}
		else{
			return false;
		}
	};
	
	// close the given file
	EditArea.prototype.closeFile= function(id){
		if(this.files[id])
		{
			this.saveFile(id);
			
			// close file callback
			if(this.execCommand("fileClose", this.files[id])!==false)
			{
				// remove the tab in the toolbar
				var li= _$(this.files[id]["htmlId"]);
				li.parentNode.removeChild(li);
				// select a new file
				if(id=== this.currFile)
				{
					var nextFile= "";
					var isNext= false;
					for(var i in this.files)
					{
						if( isNext )
						{
							nextFile= i;
							break;
						}
						else if( i === id ){
							isNext		= true;}
						else{
							nextFile	= i;
						}
					}
					// display the next file
					this.switchToFile(nextFile);
				}
				// clear datas
				delete (this.files[id]);
				this.updateSize();
			}	
		}
	};
	
	// backup current file datas
	EditArea.prototype.saveSile= function(id){
		var t= this, save, aSelects, saveButt, img, i;
		var aLinks={};
		if(t.files[id])
		{
			var save= t.files[id];
			save["lastSelection"]			= t.lastSelection;		
			save["lastTextToHighlight"]	= t.lastTextToHighlight;
			save["lastHightlightedText"]	= t.lastHightlightedText;
			save["previous"]				= t.previous;
			save["next"]					= t.next;
			save["lastUndo"]				= t.lastUndo;
			save["smoothSelection"]		= t.smoothSelection;
			save["do_highlight"]			= t.doHighlight;
			save["syntax"]					= t.settings["syntax"];
			save["text"]					= t.textarea.value;
			save["scroll_Top"]				= t.result.scrollTop;
			save["scrollLeft"]				= t.result.scrollLeft;
			save["selectionStart"]			= t.last_selection["selectionStart"];
			save["selectionEnd"]			= t.last_selection["selectionEnd"];
			save["fontSize"]				= t.settings["fontSize"];
			save["fontFamily"]				= t.settings["fontFamily"];
			save["wordWrap"]				= t.settings["wordWrap"];
			save["toolbar"]					= {'links':{}, 'selects': {}};
			
			// save toolbar buttons state for fileSpecific buttons
			aLinks= _$("toolbar_1").getElementsByTagName("a");
			for( i=0; i<aLinks.length; i++ )
			{
				if( aLinks[i].getAttribute("fileSpecific") === "yes" )
				{
					saveButt	= {};
					img			= aLinks[i].getElementsByTagName("img")[0];
					saveButt['classLock']		= img.classLock;
					saveButt['className']		= img.className;
					saveButt['oldClassName']	= img.oldClassName;
					
					save["toolbar"]["links"][aLinks[i].id]= saveButt;
				}
			}
			
			// save toolbar select state for fileSpecific buttons
			aSelects= _$("toolbar_1").getElementsByTagName("select");
			for( i=0; i<aSelects.length; i++)
			{
				if(aSelects[i].getAttribute("fileSpecific")==="yes")
				{
					save['toolbar']['selects'][aSelects[i].id]= aSelects[i].value;
				}
			}
				
			t.files[id]= save;
			
			return save;
		}
		
		return false;
	};
	
	// update file_datas
	EditArea.prototype.updateFile= function(id, newValues){
		for(var i in newValues)
		{
			this.files[id][i]= newValues[i];
		}
	};
	
	// display file datas
	EditArea.prototype.displayFile= function(id){
		var t = this, a= t.textarea, newFile,  i, j;
		var aLis={};
		var aOptions={};
		var aSelects={};
		var aLinks={};
		// we're showing the empty file
		if(id==='')
		{
			a.readOnly= true;
			t.tab_browsing_area.style.display= "none";
			_$("noFileSelected").style.display= "block";
			t.result.className= "empty";
			// clear current datas
			if(!t.files[""])
			{
				t.open_file({id: ""});
			}
		}
		// we try to show a non existent file, so we left
		else if( typeof( t.files[id] ) === "undefined" )
		{
			return false;
		}
		// display a normal file
		else
		{
			t.result.className= "";
			a.readOnly= !t.isEditable;
			_$("noFileSelected").style.display= "none";
			t.tab_browsing_area.style.display= "block";
		}
		
		// ensure to have last state for undo/redo actions
		t.check_redo(true);
		t.check_undo(true);
		t.currFile= id;
		
		// replace selected tab file
		aLis= t.tab_browsing_area.getElementsByTagName("li");
		for( i=0; i<aLis.length; i++)
		{
			if(aLis[i].id === t.files[id]["htmlId"])
				aLis[i].className="selected";
			else
				aLis[i].className="";
		}
		
		// replace next files datas
		newFile= t.files[id];
	
		// restore text content
		a.value= newFile["text"];
		
		// restore font-size
		t.set_font(newFile["fontFamily"], newFile["fontSize"]);
		
		// restore selection and scroll
		t.area_select(newFile["selectionStart"], newFile["selectionEnd"] - newFile["selectionStart"]);
		t.manage_size(true);
		t.result.scrollTop= newFile["scrollTop"];
		t.result.scrollLeft= newFile["scrollLeft"];
		
		// restore undo, redo
		t.previous=	newFile['previous'];
		t.next=	newFile['next'];
		t.last_undo=	newFile["lastUndo"];
		t.check_redo(true);
		t.check_undo(true);
		
		// restore highlight
		t.execCommand("changeHighlight", newFile["doHighlight"]);
		t.execCommand("changeSyntax", newFile["syntax"]);
		
		// smooth mode
		t.execCommand("changeSmoothSelectionMode", newFile["smoothSelection"]);
		
		// word_wrap
		t.execCommand("setWordWrap", newFile["wordWrap"]);
			
		// restore links state in toolbar
		aLinks= newFile["toolbar"]["links"];
		for( i in aLinks)
		{
			if( img =  _$(i).getElementsByTagName("img")[0] )
			{
				img.classLock	= aLinks[i]["classLock"];
				img.className	= aLinks[i]["className"];
				img.oldClassName= aLinks[i]["oldClassName"];
			}
		}
		
		// restore select state in toolbar
		aSelects = newFile["toolbar"]["selects"];
		for( i in aSelects)
		{
			aOptions	= _$(i).options;
			for( j=0; j<aOptions.length; j++)
			{
				if( aOptions[j].value === aSelects[i] )
					_$(i).options[j].selected=true;
			}
		}
	
	};

	// change tab for displaying a new one
	EditArea.prototype.switchToFile= function(fileToShow, forceRefresh){
		if(fileToShow!==this.curr_file || forceRefresh)
		{
			this.save_file(this.curr_file);
			if(this.currFile!=="")
				this.execCommand("file_switch_off", this.files[this.currFile]);
			this.display_file(fileToShow);
			if(fileToShow!=="")
				this.execCommand("file_switch_on", this.files[fileToShow]);
		}
	};

	// get all infos for the given file
	EditArea.prototype.getFile= function(id){
		if(id===this.currFile)
			this.saveFile(id);
		return this.files[id];
	};
	
	// get all available files infos
	EditArea.prototype.getAllFiles= function(){
		var tmpFiles= this.files;
		this.save_file(this.currFile);
		if(tmpFiles[""])
			delete(this.files[""]);
		return tmpFiles;
	};
	
	
	// check if the file has changed
	EditArea.prototype.checkFileChanges= function(){
	
		var id= this.currFile;
		if(this.files[id] && this.files[id]["compare_edited_text"]!== "undefined")
		{
			if(this.files[id]["compare_edited_text"].length===this.textarea.value.length && this.files[id]["compare_edited_text"]===this.textarea.value)
			{
				if(this.files[id]["edited"]!== false)
					this.setFileEditedMode(id, false);
			}
			else
			{
				if(this.files[id]["edited"]!== true)
					this.setFileEditedMode(id, true);
			}
		}
	};
	
	// set if the file is edited or not
	EditArea.prototype.setFileEditedMode= function(id, to){
		// change CSS for edited tab
		if(this.files[id] && _$(this.files[id]["htmlId"]))
		{
			var link= _$(this.files[id]["htmlId"]).getElementsByTagName("a")[0];
			if(to===true)
			{
				link.className= "edited";
			}
			else
			{
				link.className= "";
				if(id===this.currFile)
				{
					text= this.textarea.value;
				}
				else
				{
					text= this.files[id]["text"];
				}
				this.files[id]["compare_edited_text"]= text;
			}
				
			this.files[id]["edited"]= to;
		}
	};

	EditArea.prototype.setShowLineColors = function(newValue){
		this.showLineColors = newValue;
		
		if( newValue )
			this.selectionField.className	+= "showColors";
		else
			this.selectionField.className	= this.selectionField.className.replace( / showColors/g, "" );
	};
