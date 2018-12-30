	function checkEditArea(t)
	{
		if(t.settings["syntax_selection_allow"] && t.settings["syntax_selection_allow"].length>0){
			t.syntaxList= t.settings["syntax_selection_allow"].replace(/ /g,"").split(",");
		}
		if(t.settings["syntax"]){
			t.allreadyUsedSyntax[t.settings["syntax"]]=true;
		}
	}
	function checkEditArea2(t)
	{
		if((""+t.settings["replace_tab_by_spaces"]).match(/^[0-9]+$/))
		{
			t.tabNbChar= t.settings["replace_tab_by_spaces"];
			t.tabulation="";
			for(var i=0; i<t.tab_nb_char; i++)
			{	t.tabulation+=" ";}
		}else{
			t.tabulation="\t";
		}
		return t.tabulation;
	}
	function checkEditArea4(t)
	{
		t.textareaFocused= false;
		t.highlightSelectionLine= null;
		t.previous= [];
		t.next= [];
		t.lastUndo="";
		t.files= {};
		t.filesIdAssoc= {};
		t.currFile="";
		//t.loaded= false;
		t.assocBracket={};
		t.revertAssocBracket= {};		
		// bracket selection init 
		t.assocBracket["("]=")";
		t.assocBracket["{"]="}";
		t.assocBracket["["]="]";		
		for(var index in t.assocBracket){
			if(t.revertAssocBracket[t.assocBracket.getElementById(index)]){
			t.revertAssocBracket[t.assocBracket.getElementById(index)]=index;}
		}
	}
	function checkEditArea3(t,areaId)
	{
	
		t.lineHeight= 16;
		t.tabNbChar= 8;
		if(t.isOpera){
			t.tabNbChar= 6;
		}
		t.isTabbing= false;

		t.fullscreen= {"isFull": false};

		t.isResizing=false;
		t.id= areaId;
	}
	function EditArea(){
		var t=this,areaId;
		t.error= false;	// to know if load is interrrupt

		t.inlinePopup= [{popupId: "area_search_replace", iconId: "search"},
									{popupId: "edit_area_help", iconId: "help"}];
		t.plugins= {};

		t.lineNumber=0;

		parent.editAreaLoader.set_browser_infos(t); 	// navigator identification
		// fix IE8 detection as we run in IE7 emulate mode through X-UA <meta> tag
		if( t.isIE >= 8 ){
			t.isIE	= 7;
		}
		t.lastSelection={};		
		t.lastTextToHighlight="";
		t.lastHightlightedText= "";
		t.syntaxList= [];
		t.allreadyUsedSyntax= {};
		t.checkLineSelectionTimer= 50;
		checkEditArea4(t);
		t.isEditable= true;
		checkEditArea3(t,areaId);
		t.tabilation=checkEditArea2(t);
		checkEditArea(t);
		// retrieve the init parameter for syntax
		t.settings= EditArea[t.id]["settings"];
	}	
	editAreaLoader.prototype.endResizeArea= function(e){
		var d=document,div,a,width,height;
		
		d.onmouseup="";
		d.onmousemove="";		
		
		div		= d.getElementById("edit_area_resize");		
		a= editAreas[editAreaLoader.resize["id"]]["textarea"];
		width	= Math.max(editAreas[editAreaLoader.resize["id"]]["settings"]["min_width"], div.offsetWidth-4);
		height	= Math.max(editAreas[editAreaLoader.resize["id"]]["settings"]["min_height"], div.offsetHeight-4);
		if(editAreaLoader.isIE===6){
			width-=2;
			height-=2;	
		}
		a.style.width		= width+"px";
		a.style.height		= height+"px";
		div.style.display	= "none";
		a.style.display		= "inline";
		a.selectionStart	= editAreaLoader.resize["selectionStart"];
		a.selectionEnd		= editAreaLoader.resize["selectionEnd"];
		editAreaLoader.toggle(editAreaLoader.resize["id"]);
		
		return false;
	};
	
	editAreaLoader.prototype.resizeArea= function(e){		
		var allow,newHeight,newWidth;
		allow	= editAreas[editAreaLoader.resize["id"]]["settings"]["allow_resize"];
		if(allow==="both" || allow=="y")
		{
			newHeight	= Math.max(20, getMouseY(e)- editAreaLoader.resize["start_top"]);
			document.getElementById("edit_area_resize").style.height= newHeight+"px";
		}
		if(allow==="both" || allow=="x")
		{
			newWidth= Math.max(20, getMouseX(e)- editAreaLoader.resize["start_left"]);
			document.getElementById("edit_area_resize").style.width= newWidth+"px";
		}
		
		return false;
	};
	
	EditAreaLoader.prototype.startResizeArea= function(){
		var d=document,a,div,width,height,father;
		
		d.onmouseup= editAreaLoader.endResizeArea;
		d.onmousemove= editAreaLoader.resizeArea;
		editAreaLoader.toggle(editAreaLoader.resize["id"]);		
		
		a	= editAreas[editAreaLoader.resize["id"]]["textarea"];
		div	= d.getElementById("edit_area_resize");
		if(!div){
			div= d.createElement("div");
			div.id="edit_area_resize";
			div.style.border="dashed #888888 1px";
		}
		width	= a.offsetWidth -2;
		height	= a.offsetHeight -2;
		
		div.style.display	= "block";
		div.style.width		= width+"px";
		div.style.height	= height+"px";
		father= a.parentNode;
		father.insertBefore(div, a);
		
		a.style.display="none";
				
		editAreaLoader.resize["start_top"]= calculeOffsetTop(div);
		editAreaLoader.resize["start_left"]= calculeOffsetLeft(div);		
	};
	
	
	editAreaLoader.waitingLoading["resize_area.js"]= "loaded";
