/**
 * Autocompletion class
 * 
 * An auto completion box appear while you're writing. It's possible to force it to appear with Ctrl+Space short cut
 * 
 * Loaded as a plugin inside editArea (everything made here could have been made in the plugin directory)
 * But is definitly linked to syntax selection (no need to do 2 different files for color and auto complete for each syntax language)
 * and add a too important feature that many people would miss if included as a plugin
 * 
 * - init param: autocompletion_start
 * - Button name: "autocompletion"
 */  

var EditAreaAutocompletion= {
	
	/**
	 * Get called once this file is loaded (editArea still not initialized)
	 *
	 * @return nothing	 
	 */	 	 	
	init(){	
		//	alert("test init: "+ this._someInternalFunction(2, 3));
		
		if(editArea.settings["autocompletion"])
		{this.enabled= true;}
		else
		{this.enabled= false;}
		this.currentWord		= false;
		this.shown				= false;
		this.selectIndex		= -1;
		this.forceDisplay		= false;
		this.isInMiddleWord		= false;
		this.autoSelectIfOneResult	= false;
		this.delayBeforeDisplay	= 100;
		this.checkDelayTimer	= false;
		this.currSyntaxStr	= "";
		
		this.fileSyntaxDatas	= {};
	}
	/**
	 * Returns the HTML code for a specific control string or false if this plugin doesn't have that control.
	 * A control can be a button, select list or any other HTML item to present in the EditArea user interface.
	 * Language variables such as {$lang_somekey} will also be replaced with contents from
	 * the language packs.
	 * 
	 * @param {string} ctrl_name: the name of the control to add	  
	 * @return HTML code for a specific control or false.
	 * @type string	or boolean
	 */	
	/*,get_control_html: function(ctrl_name){
		switch( ctrl_name ){
			case 'autocompletion':
				// Control id, button img, command
				return parent.editAreaLoader.get_button_html('autocompletion_but', 'autocompletion.gif', 'toggle_autocompletion', false, this.baseURL);
				break;
		}
		return false;
	}*/
	/**
	 * Get called once EditArea is fully loaded and initialised
	 *	 
	 * @return nothing
	 */	 	 	
	,onload(){ 
		if(this.enabled)
		{
			var icon= document.getElementById("autocompletion");
			if(icon)
			{editArea.switchClassSticky(icon, 'editAreaButtonSelected', true);}
		}
		
		this.container	= document.createElement("div");
		this.container.id	= "auto_completion_area";
		EditArea.container.insertBefore( this.container, EditArea.container.firstChild );
		
		// add event detection for hiding suggestion box
		parent.editAreaLoader.add_event( document, "click", function(){ EditArea.plugins["autocompletion"]._hide();} );
		parent.editAreaLoader.add_event( EditArea.textarea, "blur", function(){ EditArea.plugins["autocompletion"]._hide();} );
		
	}
	
	/**
	 * Is called each time the user touch a keyboard key.
	 *	 
	 * @param (event) e: the keydown event
	 * @return true - pass to next handler in chain, false - stop chain execution
	 * @type boolean	 
	 */
	,_checkLetterReturn(letter){
		if(letter==="Esc")
			{
				this._hide();
				return false;
			}
			// Enter
			else if( letter==="Entrer")
			{
				var as	= this.container.getElementsByTagName("A");
				// select a suggested entry
				if( this.selectIndex >= 0 && this.selectIndex < as.length )
				{
					as[ this.selectIndex ].onmousedown();
					return false;
				}
				// simply add an enter in the code
				else
				{
					this._hide();
					return true;
				}
			}
			else if( letter==="Tab" || letter==="Down")
			{
				this._selectNext();
				return false;
			}
			else if( letter=="Up")
			{
				this._selectBefore();
				return false;
			}
	}
	,onkeydown(e){
		var letter;
		var EAKeys={};
		if(!this.enabled)
		{return true;
		}	
		if (EAKeys[e.keyCode])
		{letter=EAKeys[e.keyCode];}
		else{
			letter=String.fromCharCode(e.keyCode);	
		}// shown
		if( this._isShown() )
		{	
			// if escape, hide the box
			_checkLetterReturn(letter);
		}
		// hidden
		// show current suggestion list and do autoSelect if possible (no matter it's shown or hidden)
		if( letter==="Space" && CtrlPressed(e) )
		{
			//parent.console.log('SHOW SUGGEST');
			this.forceDisplay 			= true;
			this.autoSelectIfOneResult	= true;
			this._checkLetter();
			return false;
		}
		
		// wait a short period for check that the cursor isn't moving
		setTimeout("EditArea.plugins["autocompletion"]._checkDelayAndCursorBeforeDisplay();", EditArea.check_line_selection_timer +5 );
		this.checkDelayTimer = false;
		return true;
	}	
	/**
	 * Executes a specific command, this function handles plugin commands.
	 *
	 * @param {string} cmd: the name of the command being executed
	 * @param {unknown} param: the parameter of the command	 
	 * @return true - pass to next handler in chain, false - stop chain execution
	 * @type boolean	
	 */
	,execCommand(cmd, param){
		switch( cmd ){
			case "toggle_autocompletion":
				var icon= document.getElementById("autocompletion");
				if(!this.enabled)
				{
					if(icon !== null){
						EditArea.restoreClass(icon);
						EditArea.switchClassSticky(icon, "editAreaButtonSelected", true);
					}
					this.enabled= true;
				}
				else
				{
					this.enabled= false;
					if(icon !== null){
						EditArea.switchClassSticky(icon, "editAreaButtonNormal", false);}
				}
				return true;
		}
		return true;
	}
	,_checkDelayAndCursorBeforeDisplay(){
		this.checkDelayTimer = setTimeout("if(EditArea.textarea.selectionStart == "+ EditArea.textarea.selectionStart +") EditArea_autocompletion._checkLetter();",  this.delayBeforeDisplay - EditArea.check_line_selection_timer - 5 );
	}
	// hide the suggested box
	,_hide(){
		this.selectIndex	= -1;
		this.shown	= false;
		this.forceDisplay	= false;
		this.autoSelectIfOneResult = false;
		this.container.style.display="none";
	}
	// display the suggested box
	,_show(){
		
		if( !this._isShown() )
		{
			this.container.style.display="block";
			this.selectIndex	= -1;
			this.shown	= true;
		}
	}
	// is the suggested box displayed?
	,_isShown(){
		return this.shown;
	}
	// setter and getter
	,_checkNewValue(newValue)
	{
		if( typeof( newValue ) == "undefined" ){
			return this.isInMiddleWord;}
		else{
			this.isInMiddleWord	= newValue;}
	}
	,_isInMiddleWord( newValue ){
		_checkNewValue(newValue);
	}
	// select the next element in the suggested box
	,_selectNext()
	{
		var as	= this.container.getElementsByTagName('A');
		
		// clean existing elements
		for( var i=0; i<as.length; i++ )
		{
			if( as[i].className )
				as[i].className	= as[i].className.replace(/ focus/g, '');
		}
		
		this.selectIndex++;	
		this.selectIndex	= ( this.selectIndex >= as.length || this.selectIndex < 0 ) ? 0 : this.selectIndex;
		as[ this.selectIndex ].className	+= " focus";
	}
	// select the previous element in the suggested box
	,_selectBefore()
	{
		var as	= this.container.getElementsByTagName("A");
		
		// clean existing elements
		for( var i=0; i<as.length; i++ )
		{
			if( as[i].className )
				as[i].className	= as[ i ].className.replace(/ focus/g, '');
		}
		
		this.selectIndex--;
		
		this.selectIndex	= ( this.selectIndex >= as.length || this.selectIndex < 0 ) ? as.length-1 : this.selectIndex;
		as[ this.selectIndex ].className	+= " focus";
	}
	,_select( content )
	{
		var cursorForcedPosition	= content.indexOf( '{@}' );
		content	= content.replace(/{@}/g, '' );
		editArea.getIESelection();
		
		// retrive the number of matching characters
		var startIndex	= Math.max( 0, editArea.textarea.selectionEnd - content.length );
		
		var lineString	= 	editArea.textarea.value.substring( startIndex, editArea.textarea.selectionEnd + 1);
		var limit	= lineString.length -1;
		var nbMatch	= 0;
		var newPos
		for( i =0; i<limit ; i++ )
		{
			if( lineString.substring( limit - i - 1, limit ) == content.substring( 0, i + 1 ) )
				nbMatch = i + 1;
		}
		// if characters match, we should include them in the selection that will be replaced
		if( nbMatch > 0 )
			parent.editAreaLoader.setSelectionRange(editArea.id, editArea.textarea.selectionStart - nbMatch , editArea.textarea.selectionEnd);
		
		parent.editAreaLoader.setSelectedText(editArea.id, content );
		var range= parent.editAreaLoader.getSelectionRange(editArea.id);
		
		if( cursorForcedPosition !== -1 ){
			newPos	= range["end"] - ( content.length-cursorForcedPosition );}
		else{
			newPos	= range["end"];	}
		parent.editAreaLoader.setSelectionRange(editArea.id, newPos, newPos);
		this._hide();
	}
	
	
	/**
	 * Parse the AUTO_COMPLETION part of syntax definition files
	 */
	,_parseSyntaxAutoCompletionDatas(){
		//foreach syntax loaded
		var tmp;
		for(var lang in parent.editAreaLoader.load_syntax)
		{
			if(!parent.editAreaLoader.syntax[lang]['autocompletion'])	// init the regexp if not already initialized
			{
				parent.editAreaLoader.syntax[lang]['autocompletion']= {};
				// the file has auto completion datas
				if(parent.editAreaLoader.load_syntax[lang]['AUTO_COMPLETION'])
				{
					// parse them
					for(var i in parent.editAreaLoader.load_syntax[lang]['AUTO_COMPLETION'])
					{
						var datas	= parent.editAreaLoader.load_syntax[lang]['AUTO_COMPLETION'][i];
						tmp	= {};
						if(datas["CASE_SENSITIVE"]!="undefined" && datas["CASE_SENSITIVE"]==false)
						{	tmp["modifiers"]="i";}
						else{
							tmp["modifiers"]="";}
						tmp["prefix_separator"]= datas["REGEXP"]["prefix_separator"];
						tmp["match_prefix_separator"]= new RegExp( datas["REGEXP"]["prefix_separator"] +"$", tmp["modifiers"]);
						tmp["match_word"]= new RegExp("(?:"+ datas["REGEXP"]["before_word"] +")("+ datas["REGEXP"]["possible_words_letters"] +")$", tmp["modifiers"]);
						tmp["match_next_letter"]= new RegExp("^("+ datas["REGEXP"]["letter_after_word_must_match"] +")$", tmp["modifiers"]);
						tmp["keywords"]= {};
						//console.log( datas["KEYWORDS"] );
						for( var prefix in datas["KEYWORDS"] )
						{
							tmp["keywords"][prefix]= {
								prefix: prefix,
								prefix_name: prefix,
								prefix_reg: new RegExp("(?:"+ parent.editAreaLoader.get_escaped_regexp( prefix ) +")(?:"+ tmp["prefix_separator"] +")$", tmp["modifiers"] ),
								datas: []
							};
							for( var j=0; j<datas["KEYWORDS"][prefix].length; j++ )
							{
								tmp["keywords"][prefix]['datas'][j]= {
									is_typing: datas["KEYWORDS"][prefix][j][0],
									// if replace with is empty, replace with the is_typing value
									replace_with: datas["KEYWORDS"][prefix][j][1] ? datas["KEYWORDS"][prefix][j][1].replace('§', datas["KEYWORDS"][prefix][j][0] ) : '',
									comment: datas["KEYWORDS"][prefix][j][2] ? datas["KEYWORDS"][prefix][j][2] : '' 
								};
								
								// the replace with shouldn't be empty
								if( tmp["keywords"][prefix]['datas'][j]['replace_with'].length == 0 )
									tmp["keywords"][prefix]['datas'][j]['replace_with'] = tmp["keywords"][prefix]['datas'][j]['is_typing'];
								
								// if the comment is empty, display the replace_with value
								if( tmp["keywords"][prefix]['datas'][j]['comment'].length == 0 )
									 tmp["keywords"][prefix]['datas'][j]['comment'] = tmp["keywords"][prefix]['datas'][j]['replace_with'].replace(/{@}/g, '' );
							}
								
						}
						tmp["max_text_length"]= datas["MAX_TEXT_LENGTH"];
						parent.editAreaLoader.syntax[lang]['autocompletion'][i]	= tmp;
					}
				}
			}
		}
	}
	,Sub1Semi(lastChars,begiWord,matchPrefixSeparator,hasMatch,results,prefix,currSyntax)
	{
		var before = lastChars.substr( 0, lastChars.length - beginWord.length );
									
									// no prefix to match => it's valid
									if( !matchPrefixSeparator && this.currSyntax[i]["keywords"][prefix]["prefix"].length === 0 )
									{
										if( ! before.match( this.currSyntax[i]["keywords"][prefix]["prefix_reg"] ) ){
											hasMatch = true;}
									}
									// we still need to check the prefix if there is one
									else if( this.currSyntax[i]["keywords"][prefix]["prefix"].length > 0 )
									{
										if( before.match( this.currSyntax[i]["keywords"][prefix]['prefix_reg'] ) )
										{hasMatch = true;}
									}
									
									if( hasMatch ){
										results[results.length]= [ this.currSyntax[i]["keywords"][prefix], this.currSyntax[i]["keywords"][prefix]["datas"][j] ];}
	}
	,Sub1(matchWord,hasMatch,matchPrefixSeparator,results,lastChars,currSyntax){
		if( matchWord )
					{
						var beginWord= matchWord[1];
						var matchCurrWord= new RegExp("^"+ parent.editAreaLoader.get_escaped_regexp( beginWord ), this.curr_syntax[i]["modifiers"]);
						//console.log( match_curr_word );
						for(var prefix in this.currSyntax[i]["keywords"])
						{
						//	parent.console.log( this.curr_syntax[i]["keywords"][prefix] );
							for(var j=0; j<this.currSyntax[i]["keywords"][prefix]['datas'].length; j++)
							{
						//		parent.console.log( this.curr_syntax[i]["keywords"][prefix]["datas"][j]["is_typing"] );
								// the key word match or force display 
								if( this.currSyntax[i]["keywords"][prefix]["datas"][j]["is_typing"].match(matchCurrWord) )
								{
							//		parent.console.log('match');
									hasMatch = false;
									,Sub1Semi(lastChars,begiWord,matchPrefixSeparator,hasMatch,results,prefix,currSyntax);
								}	
							}
						}
					}
	}
	,Sub2( matchPrefixSeparator ,hasMatch,results,lastChars,currSyntax)
	{
		else if( this.forceDisplay || matchPrefixSeparator )
					{
						for(var prefix in this.currSyntax[i]["keywords"])
						{
							for(var j=0; j<this.currSyntax[i]["keywords"][prefix]["datas"].length; j++)
							{
								hasMatch = false;
								// no prefix to match => it's valid
								if( !matchPrefixSeparator && this.currSyntax[i]["keywords"][prefix]["prefix"].length === 0 )
								{
									hasMatch	= true;
								}
								// we still need to check the prefix if there is one
								else if( matchPrefixSeparator && this.currSyntax[i]["keywords"][prefix]["prefix"].length > 0 )
								{
									var before = lastChars; //.substr( 0, last_chars.length );
									if( before.match( this.currSyntax[i]["keywords"][prefix]["prefix_reg"] ) )
										hasMatch = true;
								}	
									
								if( hasMatch )
									results[results.length]= [ this.currSyntax[i]["keywords"][prefix], this.currSyntax[i]["keywords"][prefix]["datas"][j] ];	
							}
						}
					}
	}
	,Sub3(results){
		// there is only one result, and we can select it automatically
			if( results.length === 1 && this.autoSelectIfOneResult )
			{
			//	console.log( results );
				this._select( results[0][1]["replace_with"] );
			}
			else if( results.length === 0 )
			{
				this._hide();
			}
			else
			{
				// build the suggestion box content
				var lines=[];
				for(var i=0; i<results.length; i++)
				{
					var line= "<li><a href=\"#\" class=\"entry\" onmousedown=\"EditArea_autocompletion._select('"+ results[i][1]['replace_with'].replace(new RegExp('"', "g"), "&quot;") +"');return false;\">"+ results[i][1]['comment'];
					if(results[i][0]['prefix_name'].length>0)
						line+='<span class="prefix">'+ results[i][0]["prefix_name"] +'</span>';
					line+='</a></li>';
					lines[lines.length]=line;
				}
				// sort results
				this.container.innerHTML		= '<ul>'+ lines.sort().join("") +'</ul>';
				
				var cursor	= _$("cursor_pos");
				this.container.style.top		= ( cursor.cursor_top + editArea.lineHeight ) +"px";
				this.container.style.left		= ( cursor.cursor_left + 8 ) +"px";
				this._show();
			}
	}
	,_checkLetter(){
		// check that syntax hasn't changed
		if( this.curr_syntax_str != editArea.settings['syntax'] )
		{
			if( !parent.editAreaLoader.syntax[editArea.settings["syntax"]]["autocompletion"] )
				this._parseSyntaxAutoCompletionDatas();
			this.currSyntax= parent.editAreaLoader.syntax[editArea.settings["syntax"]]["autocompletion"];
			this.currSyntaxStr = editArea.settings['syntax'];
			//console.log( this.curr_syntax );
		}
		
		if( editArea.isEditable )
		{
			var time=new Date;
			var t1= time.getTime();
			editArea.getIESelection();
			this.selectIndex	= -1;
			var start=editArea.textarea.selectionStart;
			var str	= editArea.textarea.value;
			var results= [];
			var hasMatch;
			
			for(var i in this.currSyntax)
			{
				var lastChars	= str.substring(Math.max(0, start-this.currSyntax[i]["max_text_length"]), start);
				var matchNextletter	= str.substring(start, start+1).match( this.currSyntax[i]["match_next_letter"]);
				// if not writting in the middle of a word or if forcing display
				if( matchNextletter || this.forceDisplay )
				{
					// check if the last chars match a separator
					var matchPrefixSeparator = lastChars.match(this.currSyntax[i]["match_prefix_separator"]);
			
					// check if it match a possible word
					var matchWord= lastChars.match(this.currSyntax[i]["match_word"]);
					
					//console.log( match_word );
					,Sub1(matchWord,hasMatch,matchPrefixSeparator,results,lastChars);
					// it doesn't match any possible word but we want to display something
					// we'll display to list of all available words
					,Sub2( matchPrefixSeparator ,hasMatch,results,lastChars);
				}
			}
			,Sub3(results);
			this.autoSelectIfOneResult = false;
			time=new Date;
			var t2= time.getTime();
		
			//parent.console.log( begin_word +"\n"+ (t2-t1) +"\n"+ html );
		}
	}
};

// Load as a plugin
editArea.settings["plugins"][ editArea.settings["plugins"].length ] = 'autocompletion';
editArea.add_plugin('autocompletion', EditAreaAutocompletion);
