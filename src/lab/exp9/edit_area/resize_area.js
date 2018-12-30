
function EditAreaLoader(){
	var t=this;
	t.version= "0.8.2";
	var date= new Date();
	t.startTime=date.getTime();
	t.win= "loading";	// window loading state
	t.error= false;	// to know if load is interrrupt
	t.baseURL="";
	//t.suffix="";
	t.template="";
	t.lang= {};	// array of loaded speech language
	t.load_syntax= {};	// array of loaded syntax language for highlight mode
	t.syntax= {};	// array of initilized syntax language for highlight mode
	t.loadedFiles= [];
	t.waiting_loading= {}; 	// files that must be loaded in order to allow the script to really start
	// scripts that must be loaded in the iframe
	t.scripts_to_load= ["elements_functions", "resize_area", "reg_syntax"];
	t.sub_scripts_to_load= ["edit_area", "manage_area" ,"edit_area_functions", "keyboard", "search_replace", "highlight", "regexp"];
	t.syntax_display_name= { /*syntax_display_name_AUTO-FILL-BY-COMPRESSOR*/ };
	
	t.resize= []; // contain resizing datas
	t.hidden= {};	// store datas of the hidden textareas
	
	t.default_settings= {
		//id: "src"	// id of the textarea to transform
		debug: false
		,smooth_selection: true
		,font_size: "10"		// not for IE
		,font_family: "monospace"	// can be "verdana,monospace". Allow non monospace font but Firefox get smaller tabulation with non monospace fonts. IE doesn't change the tabulation width and Opera doesn't take this option into account... 
		,start_highlight: false	// if start with highlight
		,toolbar: "search, go_to_line, fullscreen, |, undo, redo, |, select_font,|, change_smooth_selection, highlight, reset_highlight, word_wrap, |, help"
		,begin_toolbar: ""		//  "new_document, save, load, |"
		,end_toolbar: ""		// or end_toolbar
		,is_multi_files: false		// enable the multi file mode (the textarea content is ignored)
		,allow_resize: "both"	// possible values: "no", "both", "x", "y"
		,show_line_colors: false	// if the highlight is disabled for the line currently beeing edited (if enabled => heavy CPU use)
		,min_width: 400
		,min_height: 125
		,replace_tab_by_spaces: false
		,allow_toggle: true		// true or false
		,language: "en"
		,syntax: ""
		,syntax_selection_allow: "basic,brainfuck,c,coldfusion,cpp,css,html,java,js,pas,perl,php,python,ruby,robotstxt,sql,tsql,vb,xml"
		,display: "onload" 		// onload or later
		,max_undo: 30
		,browsers: "known"	// all or known
		,plugins: "" // comma separated plugin list
		,gecko_spellcheck: false	// enable/disable by default the gecko_spellcheck
		,fullscreen: false
		,is_editable: true
		,cursor_position: "begin"
		,word_wrap: false		// define if the text is wrapped of not in the textarea
		,autocompletion: false	// NOT IMPLEMENTED			
		,load_callback: ""		// click on load button (function name)
		,save_callback: ""		// click on save button (function name)
		,change_callback: ""	// textarea onchange trigger (function name)
		,submit_callback: ""	// form submited (function name)
		,EA_init_callback: ""	// EditArea initiliazed (function name)
		,EA_delete_callback: ""	// EditArea deleted (function name)
		,EA_load_callback: ""	// EditArea fully loaded and displayed (function name)
		,EA_unload_callback: ""	// EditArea delete while being displayed (function name)
		,EA_toggle_on_callback: ""	// EditArea toggled on (function name)
		,EA_toggle_off_callback: ""	// EditArea toggled off (function name)
		,EA_file_switch_on_callback: ""	// a new tab is selected (called for the newly selected file)
		,EA_file_switch_off_callback: ""	// a new tab is selected (called for the previously selected file)
		,EA_file_close_callback: ""		// close a tab
	};	

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
	function EditAreas(){
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
		t.settings= EditAreas[t.id]["settings"];
	}	
	EditAreaLoader.prototype.endResizeArea= function(e){
		var d=document,div,a,width,height;
		
		d.onmouseup="";
		d.onmousemove="";		
		
		div		= d.getElementById("edit_area_resize");		
		a= EditAreas[EditAreaLoader.resize["id"]]["textarea"];
		width	= Math.max(EditAreas[EditAreaLoader.resize["id"]]["settings"]["min_width"], div.offsetWidth-4);
		height	= Math.max(EditAreas[EditAreaLoader.resize["id"]]["settings"]["min_height"], div.offsetHeight-4);
		if(EditAreaLoader.isIE===6){
			width-=2;
			height-=2;	
		}
		a.style.width		= width+"px";
		a.style.height		= height+"px";
		div.style.display	= "none";
		a.style.display		= "inline";
		a.selectionStart	= EditAreaLoader.resize["selectionStart"];
		a.selectionEnd		= EditAreaLoader.resize["selectionEnd"];
		EditAreaLoader.toggle(EditAreaLoader.resize["id"]);
		
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
	EditAreaLoader.prototype.resizeArea= function(e){		
		var allow,newHeight,newWidth;
		allow	= EditAreas[EditAreaLoader.resize["id"]]["settings"]["allow_resize"];
		if(allow==="both" || allow==="y")
		{
			newHeight	= Math.max(20, getMouseY(e)- EditAreaLoader.resize["start_top"]);
			document.getElementById("edit_area_resize").style.height= newHeight+"px";
		}
		if(allow==="both" || allow==="x")
		{
			newWidth= Math.max(20, getMouseX(e)- EditAreaLoader.resize["start_left"]);
			document.getElementById("edit_area_resize").style.width= newWidth+"px";
		}
		
		return false;
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
	EditAreaLoader.prototype.startResizeArea= function(){
		var d=document,a,div,width,height,father;
		
		d.onmouseup= EditAreaLoader.endResizeArea;
		d.onmousemove= EditAreaLoader.resizeArea;
		EditAreaLoader.toggle(EditAreaLoader.resize["id"]);		
		
		a	= EditAreas[EditAreaLoader.resize["id"]]["textarea"];
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
				
		EditAreaLoader.resize["start_top"]= calculeOffsetTop(div);
		EditAreaLoader.resize["start_left"]= calculeOffsetLeft(div);		
	};
	
	
	EditAreaLoader.waitingLoading["resize_area.js"]= "loaded";
