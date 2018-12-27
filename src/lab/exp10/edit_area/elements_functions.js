/****
 * This page contains some general usefull functions for javascript
 *
 ****/  
	
	function getaValue(elm,taName,aName,aValue)
	{
		for( i = 0; i < elm.attributes.length; i ++ ) {
				taName = elm.attributes[i] .name.toLowerCase();
				if( taName === aName ) {
					aValue = elm.attributes[i] .value;
					return aValue;
				}
			}
	}
	// need to redefine this functiondue to IE problem
	function getAttribute( elm, aName ) {
		var aValue,taName,i;
		try{
			aValue = elm.getAttribute( aName );
		}catch(exept){}
		
		if( ! aValue ){
			aValue=getaValue(elm,taName,aName,aValue);
		}
		return aValue;
	};
	
	// need to redefine this function due to IE problem
	function setAttribute( elm, attr, val ) {
		if(attr === "class"){
			elm.setAttribute("className", val);
			elm.setAttribute("class", val);
		}else{
			elm.setAttribute(attr, val);
		}
	};
	
	/* return a child element
		elem: element we are searching in
		elem_type: type of the eleemnt we are searching (DIV, A, etc...)
		elem_attribute: attribute of the searched element that must match
		elem_attribute_match: value that elem_attribute must match
		option: "all" if must return an array of all children, otherwise return the first match element
		depth: depth of search (-1 or no set => unlimited)
	*/
	function getChildren(elem, elemType, elemAttribute, elemAttributeMatch, option, depth)
	{           
		if(!option)
		{
			option="single";
		}
		depth=-1;
		if(elem)
		{
			var children[] = elem.childNodes;
			var result=null;
			var results= [];
			for (var x=0;x<children.length;x++)
			{
				var strTagName = new String(children[x].tagName);
				var childrenClass="?";
				if(strTagName!== "undefined")
				{
					var childAttribute = getAttribute(children[x],elemAttribute);
					if((strTagName.toLowerCase() === elemType.toLowerCase() || elemType === "") && (elemAttribute === "" || childAttribute === elemAttributeMatch)){
						if(option === "all")
						{
							results.push(children[x]);
						}
						else
						{
							return children[x];
						}
					}
					if(depth !== 0)
					{
						result=getChildren(children[x], elemType, elemAttribute, elemAttributeMatch, option, depth-1);
						if(option === "all")
						{
							if(result.length>0)
							{
								results= results.concat(result);
							}
						}
						else if(result !== null)
						{                                                                          
							return result;
						}
					}
				}
			}
			if(option === "all")
			{
			   return results;
			}
		}
		return null;
	};       
	
	function isChildOf(elem, parent){
		if(elem){
			if(elem === parent)
			{
				return true;
			}
			while(elem.parentNode !== "undefined"){
				return isChildOf(elem.parentNode, parent);
			}
		}
		return false;
	};
	
	function getMouseX(e){

		if(e!=null && typeof(e.pageX) !== "undefined"){
			return e.pageX;
		}else{
			return (e!=null?e.x:event.x)+ document.documentElement.scrollLeft;
		}
	};
	
	function getMouseY(e){
		if(e!=null && typeof(e.pageY)!="undefined"){
			return e.pageY;
		}else{
			return (e!=null?e.y:event.y)+ document.documentElement.scrollTop;
		}
	};

	function calculeOffset(element,attr){
		var offset=0;
		while(element){
			offset+=element[attr];
			element=element.offsetParent;
		}
		return offset;
	};

	function calculeOffsetLeft(r){
		return calculeOffset(r,"offsetLeft");
	};
	
	function calculeOffsetTop(r){
		return calculeOffset(r,"offsetTop");
	};
	
	
	
	/** return the computed style
	 *	@param: elem: the reference to the element
	 *	@param: prop: the name of the css property	 
	 */
	function getCssProperty(elem, prop)
	{
		if(document.defaultView)
		{
			return document.defaultView.getComputedStyle(elem, null).getPropertyValue(prop);
		}
		else if(elem.currentStyle)
		{
			var prop = prop.replace(/-\D/gi, function(sMatch)
			{
				return sMatch.charAt(sMatch.length - 1).toUpperCase();
			});
			return elem.currentStyle[prop];
		}
		else 
		{return null;}
	};
	
/****
 * Moving an element 
 ***/  
	
	var mCE;	// currently moving element
	
	/* allow to move an element in a window
		e: the event
		id: the id of the element
		frame: the frame of the element 
		ex of use:
			in html:	<img id='move_area_search_replace' onmousedown='return parent.start_move_element(event,"area_search_replace", parent.frames["this_frame_id"]);' .../>  
		or
			in javascript: document.getElementById("my_div").onmousedown= start_move_element
	*/
	
	function checkId(id)
	{
		if(id)
		{
			return id;
		}
	}
	function checkFrame(frame)
	{
		if(!frame)
		{
			frame=window;
		}
		return frame;
	}
	function startMoveElement(e, id, frame, moveElement, endMoveElement){
		var elemId=(e.target || e.srcElement).id;
		elemId=checkId(id);		
		frame=checkFrame(frame);
		if(frame.event)
		{
			e=frame.event;
		}	
		var mCE= frame.document.getElementById(elemId);
		mCE.frame=frame;
		frame.document.onmousemove= moveElement;
		frame.document.onmouseup= endMoveElement;
		/*_mCE.onmousemove= move_element;
		_mCE.onmouseup= end_move_element;*/
		
		//alert(_mCE.frame.document.body.offsetHeight);
		
		var mouseX= getMouseX(e);
		var mouseY= getMouseY(e);
		//window.status=frame+ " elem: "+elem_id+" elem: "+ _mCE + " mouse_x: "+mouse_x;
		mCE.startPosX = mouseX - (mCE.style.left.replace("px","") || calculeOffsetLeft(mCE));
		mCE.startPosY = mouseY - (mCE.style.top.replace("px","") || calculeOffsetTop(mCE));
		return false;
	};
	
	function endMoveElement(e){
		mCE.frame.document.onmousemove= "";
		mCE.frame.document.onmouseup= "";		
		mCE=null;
	};
	
	function moveElement(e){
		var newTop,newLeft,maxLeft,maxTop;

		if( mCE.frame && mCE.frame.event )
		{
			e=mCE.frame.event;
		}
		newTop	= getMouseY(e) - mCE.startPosY;
		newLeft	= getMouseX(e) - mCE.startPosX;
		
		maxLeft	= mCE.frame.document.body.offsetWidth- mCE.offsetWidth;
		maxTop	= mCE.frame.document.body.offsetHeight- mCE.offsetHeight;
		newTop	= Math.min(Math.max(0, newTop), maxTop);
		newLeft	= Math.min(Math.max(0, newLeft), maxLeft);
		
		mCE.style.top	= newTop+"px";
		mCE.style.left	= newLeft+"px";		
		return false;
	};
	
/***
 * Managing a textarea (this part need the navigator infos from editAreaLoader
 ***/ 
	
	var nav= editAreaLoader.nav;
	
	// allow to get infos on the selection: array(start, end)
	function getSelectionRange(textarea){
		return {"start": textarea.selectionStart, "end": textarea.selectionEnd};
	};
	
	// allow to set the selection
	function setIESelection( t )
	{
		var nbLineStart,nbLineEnd,range;
		if(!window.closed){ 
			nbLineStart=t.value.substr(0, t.selectionStart).split("\n").length - 1;
			nbLineEnd=t.value.substr(0, t.selectionEnd).split("\n").length - 1;
			try
			{
				range = document.selection.createRange();
				range.moveToElementText( t );
				range.setEndPoint( "EndToStart", range );
				range.moveStart("character", t.selectionStart - nbLineStart);
				range.moveEnd("character", t.selectionEnd - nbLineEnd - (t.selectionStart - nbLineStart)  );
				range.select();
			}
			catch(e){}
		}
	};
	function setSelectionRange(t, start, end){
		t.focus();
		
		start	= Math.max(0, Math.min(t.value.length, start));
		end	= Math.max(start, Math.min(t.value.length, end));
	
		if( nav.isOpera && nav.isOpera < 9.6 ){	// Opera bug when moving selection start and selection end
			t.selectionEnd = 1;	
			t.selectionStart = 0;			
			t.selectionEnd = 1;	
			t.selectionStart = 0;		
		}
		t.selectionStart	= start;
		t.selectionEnd		= end;		
		//textarea.setSelectionRange(start, end);
		
		if(nav.isIE)
		{
			setIESelection(t);
		}
	};

	
	// set IE position in Firefox mode (textarea.selectionStart and textarea.selectionEnd). should work as a repeated task
	function checkEachLineHeight(t,div,d)
	{
		if(!t.eaLineHeight)
		{
			div= d.createElement("div");
			div.style.fontFamily= getCssProperty(t, "font-family");
			div.style.fontSize= getCssProperty(t, "font-size");
			div.style.visibility= "hidden";			
			div.innerHTML="0";
			d.body.appendChild(div);
			t.eaLineHeight= div.offsetHeight;
			d.body.removeChild(div);
		}
	};
	function checkStoredRange(t,elem,scrollTop,relativeTop,lineStart,lineNb,rangeStart,tab,rangeEnd,storedRange)
	{
		storedRange = range.duplicate();
		storedRange.moveToElementText( t );
		storedRange.setEndPoint( "EndToEnd", range );
		if(storedRange.parentElement() === t)
		{
					// the range don't take care of empty lines in the end of the selection
					elem = t;
					scrollTop = 0;
					while(elem.parentNode){
						scrollTop+= elem.scrollTop;
						elem	= elem.parentNode;
					}
				
				//	var scrollTop= t.scrollTop + document.body.scrollTop;
					
				//	var relative_top= range.offsetTop - calculeOffsetTop(t) + scrollTop;
					relativeTop= range.offsetTop - calculeOffsetTop(t)+ scrollTop;
				//	alert("rangeoffset: "+ range.offsetTop +"\ncalcoffsetTop: "+ calculeOffsetTop(t) +"\nrelativeTop: "+ relative_top);
					lineStart	= Math.round((relativeTop / t.eaLineHeight) +1);
					
					lineNb		= Math.round(range.boundingHeight / t.eaLineHeight);
					
					rangeStart	= storedRange.text.length - range.text.length;
					tab	= t.value.substr(0, rangeStart).split("\n");			
					rangeStart	+= (lineStart - tab.length)*2;		// add missing empty lines to the selection
					t.selectionStart = rangeStart;
					
					rangeEnd	= t.selectionStart + range.text.length;
					tab	= t.value.substr(0, rangeStart + range.text.length).split("\n");			
					rangeEnd	+= (lineStart + lineNb - 1 - tab.length)*2;
					t.selectionEnd = rangeEnd;
		}
	};
	function checkTextFocused(t,d,div,range,storedRange,elem,scrollTop,relativeTop,lineStart,lineNb,rangeStart,rangeEnd,tab)
	{
		if(t && t.focused)
		{	
			checkEachLineHeight(t,div,d);
			range = d.selection.createRange();
			try
			{
				checkStoredRange(t,elem,scrollTop,relativeTop,lineStart,lineNb,rangeStart,tab,rangeEnd,storedRange);
			}
			catch(e){}
		}
	};
	function getIESelection(t){
		var d=document,div,range,storedRange,elem,scrollTop,relativeTop,lineStart,lineNb,rangeStart,rangeEnd,tab;
		checkTextFocused(t,d,div,range,storedRange,elem,scrollTop,relativeTop,lineStart,lineNb,rangeStart,rangeEnd,tab);
		if( t && t.id )
		{
			setTimeout("getIESelection(document.getElementById('"+ t.id +"'));", 50);
		}
	};
	
	function IETextareaFocus(){
		event.srcElement.focused= true;
	};
	
	function IETextareaBlur(){
		event.srcElement.focused= false;
	};
	
	// select the text for IE (take into account the \r difference)
	
	editAreaLoader.waiting_loading["elements_functions.js"]= "loaded";
