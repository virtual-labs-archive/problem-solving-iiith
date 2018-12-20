	EditArea.prototype.showSearch = function(){
		if(_$("areaSearchReplace").style.visibility === "visible"){
			this.hiddenSearch();
		}else{
			this.openInlinePopup("areaSearchReplace");
			var text= this.areaGetSelection();
			var search= text.split("\n")[0];
			_$("areaSearch").value= search;
			_$("areaSearch").focus();
		}
	};
	
	EditArea.prototype.hiddenSearch= function(){
		/*_$("area_search_replace").style.visibility="hidden";
		this.textarea.focus();
		var icon= _$("search");
		setAttribute(icon, "class", getAttribute(icon, "class").replace(/ selected/g, "") );*/
		this.closeInlinePopup("areaSearchReplace");
	};
	
	EditArea.prototype.areaSearch= function(mode){
		
		if(!mode)
		{
			mode="search";
		}
		_$("areaSearchMsg").innerHTML="";		
		var search=_$("areaSearch").value;		
		this.textarea.focus();		
		this.textarea.textareaFocused=true;
		var infos= this.getSelectionInfos();	
		var start= infos["selectionStart"];
		var pos=-1;
		var posBegin=-1;
		var length=search.length;
		var begin;
		if(_$("areaSearchReplace").style.visibility !== "visible"){
			this.showSearch();
			return;
		}
		if(search.length === 0){
			_$("areaSearchMsg").innerHTML=this.getTranslation("searchFieldEmpty");
			return;
		}
		// advance to the next occurence if no text selected
		if(mode !== "replace" ){
			if(_$("areaSearchRegExp").checked)
			{
				start++;
			}
			else{
				start+= search.length;
			}
		}
		
		//search
		if(_$("areaSearchRegExp").checked){
			// regexp search
			var opt="m";
			if(!_$("areaSearchMatchCase").checked)
			{
				opt+="i";
			}
			var reg= new RegExp(search, opt);
			pos= infos["fullText"].substr(start).search(reg);
			posBegin= infos["fullText"].search(reg);
			if(pos !== -1){
				pos+=start;
				length=infos["fullText"].substr(start).match(reg)[0].length;
			}else if(posBegin !== -1){
				length=infos["fullText"].match(reg)[0].length;
			}
		}else{
			if(_$("areaSearchMatchCase").checked){
				pos= infos["fullText"].indexOf(search, start); 
				posBegin= infos["fullText"].indexOf(search); 
			}else{
				pos= infos["fullText"].toLowerCase().indexOf(search.toLowerCase(), start); 
				posBegin= infos["fullText"].toLowerCase().indexOf(search.toLowerCase()); 
			}		
		}
		
		// interpret result
		if(pos === -1 && posBegin === -1){
			_$("areaSearchMsg").innerHTML="<strong>"+search+"</strong> "+this.getTranslation("notFound");
			return;
		}else if(pos === -1 && posBegin !== -1){
			begin= posBegin;
			_$("areaSearchMsg").innerHTML=this.getTranslation("restartSearchAtBegin");
		}else{
			begin= pos;
		}
		//_$("area_search_msg").innerHTML+="<strong>"+search+"</strong> found at "+begin+" strat at "+start+" pos "+pos+" curs"+ infos["indexOfCursor"]+".";
		if(mode === "replace" && pos === infos["indexOfCursor"]){
			var replace= _$("areaReplace").value;
			var newText="";			
			if(_$("areaSearchRegExp").checked){
				var opt="m";
				if(!_$("areaSearchMatchCase").checked){
					opt+="i";}
				var reg= new RegExp(search, opt);
				newText= infos["fullText"].substr(0, begin) + infos["fullText"].substr(start).replace(reg, replace);
			}else{
				newText= infos["fullText"].substr(0, begin) + replace + infos["fullText"].substr(begin + length);
			}
			this.textarea.value=newText;
			this.areaSelect(begin, length);
			this.areaSearch();
		}else
			this.areaSelect(begin, length);
	};
	
	
	
	
	EditArea.prototype.areaReplace= function(){		
		this.areaSearch("replace");
	};
	
	EditArea.prototype.areaReplaceAll= function(){
	/*	this.area_select(0, 0);
		_$("area_search_msg").innerHTML="";
		while(_$("area_search_msg").innerHTML==""){
			this.area_replace();
		}*/
	
		var baseText= this.textarea.value;
		var search= _$("areaSearch").value;		
		var replace= _$("areaReplace").value;
		if(search.length === 0){
			_$("areaSearchMsg").innerHTML=this.getTranslation("searchFieldEmpty");
			return;
		}
		
		var newText="";
		var nbChange=0;
		if(_$("areaSearchRegExp").checked){
			// regExp
			var opt="mg";
			if(!_$("areaSearchMatchCase").checked){
				opt+="i";}
			var reg= new RegExp(search, opt);
			nbChange= infos["fullText"].match(reg).length;
			newText= infos["fullText"].replace(reg, replace);
			
		}else{
			
			if(_$("areaSearchMatchCase").checked){
				var tmpTab=baseText.split(search);
				nbChange= tmpTab.length -1 ;
				newText= tmpTab.join(replace);
			}else{
				// case insensitive
				var lowerValue=baseText.toLowerCase();
				var lowerSearch=search.toLowerCase();
				
				var start=0;
				var pos= lowerValue.indexOf(lowerSearch);				
				while(pos !== -1){
					nbChange++;
					newText+= this.textarea.value.substring(start , pos)+replace;
					start=pos+ search.length;
					pos= lowerValue.indexOf(lowerSearch, pos+1);
				}
				newText+= this.textarea.value.substring(start);				
			}
		}			
		if(newText === baseText){
			_$("areaSearchMsg").innerHTML="<strong>"+search+"</strong> "+this.getTranslation("notFound");
		}else{
			this.textarea.value= newText;
			_$("areaSearchMsg").innerHTML="<strong>"+nbChange+"</strong> "+this.getTranslation("occurrenceReplaced");
			// firefox and opera doesn't manage with the focus if it's done directly
			//editArea.textarea.focus();editArea.textarea.textareaFocused=true;
			setTimeout("editArea.textarea.focus();editArea.textarea.textareaFocused=true;", 100);
		}
		
		
	};
