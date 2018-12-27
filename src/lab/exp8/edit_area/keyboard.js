var EAKeys = {8:"Retour arriere",9:"Tabulation",12:"Milieu (pave numerique)",13:"Entrer",16:"Shift",17:"Ctrl",18:"Alt",19:"Pause",20:"Verr Maj",27:"Esc",32:"Space",33:"Page up",34:"Page down",35:"End",36:"Begin",37:"Left",38:"Up",39:"Right",40:"Down",44:"Impr ecran",45:"Inser",46:"Suppr",91:"Menu Demarrer Windows / touche pomme Mac",92:"Menu Demarrer Windows",93:"Menu contextuel Windows",112:"F1",113:"F2",114:"F3",115:"F4",116:"F5",117:"F6",118:"F7",119:"F8",120:"F9",121:"F10",122:"F11",123:"F12",144:"Verr Num",145:"Arret defil"};
	
function ctrlPressed(e) {
	if (window.event) {
		return (window.event.ctrlKey);
	} else {
		return (e.ctrlKey || (e.modifiers===2) || (e.modifiers===3) || (e.modifiers>5));
	}
}

// return true if Shift key is pressed
function shiftPressed(e) {
	if (window.event) {
		return (window.event.shiftKey);
	} else {
		return (e.shiftKey || (e.modifiers>3));
	}
}

function altPressed(e) {
	if (window.event) {
		return (window.event.altKey);
	} else {
		if(e.modifiers)
		{return (e.altKey || (e.modifiers % 2));
		}else{
			return e.altKey;
		}
	}
}

function keyDown(e){
	if(!e){	// if IE
		e=event;
	}
	
	// send the event to the plugins
	for(var i in editarea.plugins){
		if(typeof(editarea.plugins.getElementById(i).onkeydown)==="function"){
			if(editarea.plugins.getElementById(i).onkeydown(e)===false){ // stop propaging
				if(editarea.isIE){
					e.keyCode=0;}
				return false;
			}
		}
	}

	var targetId=(e.target || e.srcElement).id;
	var use=false,letter;
	if (EAKeys[e.keyCode])
	{	letter=EAKeys[e.keyCode];
	}
	else{
		letter=String.fromCharCode(e.keyCode);
	}
	var lowLetter= letter.toLowerCase();
			
	if(letter==="Page up" && !altPressed(e) && !editarea.isOpera){
		editarea.execCommand("scroll_page", {"dir": "up", "shift": shiftPressed(e)});
		use=true;
	}else if(letter==="Page down" && !altPressed(e) && !editarea.isOpera){
		editarea.execCommand("scroll_page", {"dir": "down", "shift": shiftPressed(e)});
		use=true;
	}else if(editarea.is_editable===false){
		// do nothing but also do nothing else (allow to navigate with page up and page down)
		return true;
	}else if(letter==="Tabulation" && targetId==="textarea" && !ctrlPressed(e) && !altPressed(e)){	
		if(shiftPressed(e))
		{
			editarea.execCommand("invert_tab_selection");}
		else
		{	editarea.execCommand("tab_selection");
		}
		use=true;
		if(editarea.isOpera || (editarea.isFirefox && editarea.isMac) )	// opera && firefox mac can't cancel tabulation events...
		{	setTimeout("editArea.execCommand('focus');", 1);}
	}else if(letter==="Entrer" && targetId==="textarea"){
		if(editarea.press_enter())
		{	use=true;}
	}else if(letter==="Entrer" && targetId==="area_search"){
		editarea.execCommand("area_search");
		use=true;
	}else  if(letter==="Esc"){
		editarea.execCommand("close_all_inline_popup", e);
		use=true;
	}else if(ctrlPressed(e) && !altPressed(e) && !shiftPressed(e)){
		switch(lowLetter){
			case "f":				
				editarea.execCommand("area_search");
				use=true;
				break;
			case "r":
				editarea.execCommand("area_replace");
				use=true;
				break;
			case "q":
				editarea.execCommand("close_all_inline_popup", e);
				use=true;
				break;
			case "h":
				editarea.execCommand("change_highlight");			
				use=true;
				break;
			case "g":
				setTimeout("editArea.execCommand('go_to_line');", 5);	// the prompt stop the return false otherwise
				use=true;
				break;
			case "e":
				editarea.execCommand("show_help");
				use=true;
				break;
			case "z":
				use=true;
				editarea.execCommand("undo");
				break;
			case "y":
				use=true;
				editarea.execCommand("redo");
				break;
			default:
				break;			
		}		
	}		
	
	// check to disable the redo possibility if the textarea content change
	if(editarea.next.length > 0){
		setTimeout("editArea.check_redo();", 10);
	}
	
	setTimeout("editArea.check_file_changes();", 10);
	
	
	if(use){
		// in case of a control that sould'nt be used by IE but that is used => THROW a javascript error that will stop key action
		if(editarea.isIE)
		{e.keyCode=0;}
		return false;
	}
	//alert("Test: "+ letter + " ("+e.keyCode+") ALT: "+ AltPressed(e) + " CTRL "+ CtrlPressed(e) + " SHIFT "+ ShiftPressed(e));
	
	return true;
	
}


// return true if Alt key is pressed

// return true if Ctrl key is pressed

