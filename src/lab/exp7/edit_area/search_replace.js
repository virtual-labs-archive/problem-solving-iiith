	EditArea.prototype.showSearch = function(){
		if(("areaSearchReplace").style.visibility === "visible"){
			this.hiddenSearch();
		}else{
			this.openInlinePopup("areaSearchReplace");
			var text= this.areaGetSelection();
			var search= text.split("\n")[0];
			("areaSearch").value= search;
			("areaSearch").focus();
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
		("areaSearchMsg").innerHTML="";		
		var search=("areaSearch").value;		
		this.textarea.focus();		
		this.textarea.textareaFocused=true;
		var infos= this.getSelectionInfos();	
		var start= infos["selectionStart"];
		var pos=-1;
		var posBegin=-1;
		var length=search.length;
		var begin,reg,opt;
		if(("areaSearchReplace").style.visibility !== "visible"){
			this.showSearch();
			return;
		}
		if(search.length === 0){
			("areaSearchMsg").innerHTML=this.getTranslation("searchFieldEmpty");
			return;
		}
		// advance to the next occurence if no text selected
		if(mode !== "replace" ){
			if(("areaSearchRegExp").checked)
			{
				start++;
			}
			else{
				start+= search.length;
			}
		}
		
		//search
		if(("areaSearchRegExp").checked){
			// regexp search
			var opt="m";
			if(!("areaSearchMatchCase").checked)
			{
				opt+="i";
			}
			reg= new RegExp(search, opt);
			pos= infos["fullText"].substr(start).search(reg);
			posBegin= infos["fullText"].search(reg);
			if(pos !== -1){
				pos+=start;
				length=infos["fullText"].substr(start).match(reg)[0].length;
			}else if(posBegin !== -1){
				length=infos["fullText"].match(reg)[0].length;
			}
		}else{
			if(("areaSearchMatchCase").checked){
				pos= infos["fullText"].indexOf(search, start); 
				posBegin= infos["fullText"].indexOf(search); 
			}else{
				pos= infos["fullText"].toLowerCase().indexOf(search.toLowerCase(), start); 
				posBegin= infos["fullText"].toLowerCase().indexOf(search.toLowerCase()); 
			}		
		}
		
		// interpret result
		if(pos === -1 && posBegin === -1){
			("areaSearchMsg").innerHTML="<strong>"+search+"</strong> "+this.getTranslation("notFound");
			return;
		}else if(pos === -1 && posBegin !== -1){
			begin= posBegin;
			("areaSearchMsg").innerHTML=this.getTranslation("restartSearchAtBegin");
		}else{
			begin= pos;
		}
		//_$("area_search_msg").innerHTML+="<strong>"+search+"</strong> found at "+begin+" strat at "+start+" pos "+pos+" curs"+ infos["indexOfCursor"]+".";
		if(mode === "replace" && pos === infos["indexOfCursor"]){
			var replace= ("areaReplace").value;
			var newText="";			
			if(("areaSearchRegExp").checked){
				 opt="m";
				if(!("areaSearchMatchCase").checked){
					opt+="i";}
				reg= new RegExp(search, opt);
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
	function checkAreaSearch(nbChange,baseText)
	{
			if(("areaSearchMatchCase").checked){
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
		return newText;
	}
	function checkNewText(newText,baseText,nbChange)
	{
		if(newText === baseText){
			("areaSearchMsg").innerHTML="<strong>"+search+"</strong> "+this.getTranslation("notFound");
		}else{
			this.textarea.value= newText;
			("areaSearchMsg").innerHTML="<strong>"+nbChange+"</strong> "+this.getTranslation("occurrenceReplaced");
			// firefox and opera doesn't manage with the focus if it's done directly
			//editArea.textarea.focus();editArea.textarea.textareaFocused=true;
			setTimeout("editArea.textarea.focus();editArea.textarea.textareaFocused=true;", 100);
		}
	}
	function checkAll(baseText,newText,nbChange)
	{
		var newText="";
		var nbChange=0;
		if(("areaSearchRegExp").checked){
			// regExp
			var opt="mg";
			if(!("areaSearchMatchCase").checked){
				opt+="i";}
			var reg= new RegExp(search, opt);
			nbChange= infos["fullText"].match(reg).length;
			newText= infos["fullText"].replace(reg, replace);
			
		}else{
			newText=checkAreaSearch(nbChange,baseText);
			
		}			
		checkNewText(newText,baseText,nbChange);
	}
	EditArea.prototype.areaReplaceAll= function(){
	/*	this.area_select(0, 0);
		_$("area_search_msg").innerHTML="";
		while(_$("area_search_msg").innerHTML==""){
			this.area_replace();
		}*/
	
		var baseText= this.textarea.value;
		var search= ("areaSearch").value;		
		var replace= ("areaReplace").value;
		if(search.length === 0){
			("areaSearchMsg").innerHTML=this.getTranslation("searchFieldEmpty");
			return;
		}
		checkAll(baseText,newText,nbChange);
	};
