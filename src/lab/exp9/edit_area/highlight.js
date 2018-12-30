	// change_to: "on" or "off"
	EditArea.prototype.change_highlight= function(changeTo){
		if(this.settings["syntax"].length===0 && changeTo===false){
			this.switchClassSticky(_$("highlight"), "editAreaButtonDisabled", true);
			this.switchClassSticky(_$("reset_highlight"), "editAreaButtonDisabled", true);
			return false;
		}
		
		if(this.do_highlight==changeTo){
			return false;}
	
			
		this.getIESelection();
		var posStart= this.textarea.selectionStart;
		var posEnd= this.textarea.selectionEnd;
		
		if(this.doHighlight===true || changeTo===false)
		{this.disableHighlight();}
		else{
			this.enable_highlight();}
		this.textarea.focus();
		this.textarea.selectionStart = posStart;
		this.textarea.selectionEnd = posEnd;
		this.setIESelection();
				
	};
	
	EditArea.prototype.disable_highlight= function(displayOnly){
		var t= this, a=t.textarea, newObj, oldClass, newClass;
			
		t.selection_field.innerHTML="";
		t.selection_field_text.innerHTML="";
		t.content_highlight.style.visibility="hidden";
		// replacing the node is far more faster than deleting it's content in firefox
		newObj= t.content_highlight.cloneNode(false);
		newObj.innerHTML= "";			
		t.content_highlight.parentNode.insertBefore(newObj, t.content_highlight);
		t.content_highlight.parentNode.removeChild(t.content_highlight);	
		t.content_highlight= newObj;
		oldClass= parent.getAttribute( a,"class" );
		if(oldClass){
			newClass= oldClass.replace( "hidden","" );
			parent.setAttribute( a, "class", newClass );
		}
	
		a.style.backgroundColor="transparent";	// needed in order to see the bracket finders
		
		//var icon= document.getElementById("highlight");
		//setAttribute(icon, "class", getAttribute(icon, "class").replace(/ selected/g, "") );
		//t.restoreClass(icon);
		//t.switchClass(icon,'editAreaButtonNormal');
		t.switchClassSticky(_$("highlight"), 'editAreaButtonNormal', true);
		t.switchClassSticky(_$("reset_highlight"), 'editAreaButtonDisabled', true);
	
		t.do_highlight=false;
	
		t.switchClassSticky(_$("change_smooth_selection"), 'editAreaButtonSelected', true);
		if(typeof(t.smooth_selection_before_highlight)!="undefined" && t.smooth_selection_before_highlight===false){
			t.change_smooth_selection_mode(false);
		}
		
	//	this.textarea.style.backgroundColor="#FFFFFF";
	};

	EditArea.prototype.enable_highlight= function(){
		var t=this, a=t.textarea, newClass;
		t.show_waiting_screen();
			
		t.content_highlight.style.visibility="visible";
		newClass	=parent.getAttribute(a,"class")+" hidden";
		parent.setAttribute( a, "class", newClass );
		
		// IE can't manage mouse click outside text range without this
		if( t.isIE ){
			a.style.backgroundColor="#FFFFFF";	
		}
		t.switchClassSticky(_$("highlight"), 'editAreaButtonSelected', false);
		t.switchClassSticky(_$("reset_highlight"), 'editAreaButtonNormal', false);
		
		t.smooth_selection_before_highlight=t.smooth_selection;
		if(!t.smooth_selection)
		{	t.change_smooth_selection_mode(true);}
		t.switchClassSticky(_$("change_smooth_selection"), 'editAreaButtonDisabled', true);
		
		
		t.do_highlight=true;
		t.resync_highlight();
					
		t.hide_waiting_screen();	
	};
	
	/**
	 * Ask to update highlighted text
	 * @param Array infos - Array of datas returned by EditArea.get_selection_infos()
	 */
	EditArea.prototype.maj_highlight= function(infos){
		// for speed mesure
		var debugOpti="",tpsStart= new Date().getTime(), tpsMiddleOpti=new Date().getTime();
		var t=this, hightlightedText, updatedHighlight;	
		var textToHighlight=infos["full_text"], doSyntaxOpti = false, doHtmlOpti = false, stayBegin="", stayEnd="", traceNew , traceLast;
		var changes
		if(t.last_text_to_highlight==infos["full_text"] && t.resync_highlight!==true)
		{	return;
		}			
		//  OPTIMISATION: will search to update only changed lines
		if(t.reload_highlight===true){
			t.reload_highlight=false;
		}else if(textToHighlight.length==0){
			textToHighlight="\n ";
		}else{
			// get text change datas
			changes = t.checkTextEvolution(t.last_text_to_highlight,textToHighlight);
			
			// check if it can only reparse the changed text
			traceNew		= t.get_syntax_trace(changes.newTextLine).replace(/\r/g, '');
			traceLast		= t.get_syntax_trace(changes.lastTextLine).replace(/\r/g, '');
			doSyntaxOpti	= ( traceNew == traceLast );
			
			// check if the difference comes only from a new line created 
			// => we have to remember that the editor can automaticaly add tabulation or space after the new line) 
			if( !doSyntaxOpti && traceNew == "\n"+traceLast && /^[ \t\s]*\n[ \t\s]*$/.test( changes.newText.replace(/\r/g, '') ) && changes.lastText =="" )
			{
				doSyntaxOpti	= true;
			}
			
			// we do the syntax optimisation
			if( doSyntaxOpti ){
						
				tpsMiddleOpti=new Date().getTime();	
			
				stayBegin= t.last_hightlighted_text.split("\n").slice(0, changes.lineStart).join("\n");
				if(changes.lineStart>0)
				{	stayBegin+= "\n";}
				stayEnd= t.last_hightlighted_text.split("\n").slice(changes.lineLastEnd+1).join("\n");
				if(stayEnd.length>0)
				{	stayEnd= "\n"+stayEnd;}
					
				// Final check to see that we're not in the middle of span tags
				if( stayBegin.split('<span').length != stayBegin.split('</span').length 
					|| stayEnd.split('<span').length != stayEnd.split('</span').length )
				{
					doSyntaxOpti	= false;
					stayEnd		= '';
					stayBegin		= '';
				}
				else
				{
					if(stayBegin.length==0 && changes.posLastEnd==-1)
					{changes.newTextLine+="\n";}
					textToHighlight=changes.newTextLine;
				}
			}
			if(t.settings["debug"]){
				var ch =changes;
				debugOpti= ( doSyntaxOpti?"Optimisation": "No optimisation" )
					+" start: "+ch.posStart +"("+ch.lineStart+")"
					+" end_new: "+ ch.posNewEnd+"("+ch.lineNewEnd+")"
					+" end_last: "+ ch.posLastEnd+"("+ch.lineLastEnd+")"
					+"\nchanged_text: "+ch.newText+" => trace: "+traceNew
					+"\nchanged_last_text: "+ch.lastText+" => trace: "+traceLast
					//debug_opti+= "\nchanged: "+ infos["full_text"].substring(ch.posStart, ch.posNewEnd);
					+ "\nchanged_line: "+ch.newTextLine
					+ "\nlast_changed_line: "+ch.lastTextLine
					+"\nstay_begin: "+ stayBegin.slice(-100)
					+"\nstay_end: "+ stayEnd.substr( 0, 100 );
					//debug_opti="start: "+stay_begin_len+ "("+nb_line_start_unchanged+") end: "+ (stay_end_len)+ "("+(splited.length-nb_line_end_unchanged)+") ";
					//debug_opti+="changed: "+ textToHighlight.substring(stay_begin_len, textToHighlight.length-stay_end_len)+" \n";
					
					//debug_opti+="changed: "+ stay_begin.substr(stay_begin.length-200)+ "----------"+ textToHighlight+"------------------"+ stay_end.substr(0,200) +"\n";
					+"\n";
			}
	
			
			// END OPTIMISATION
		}

		var tpsEndOpti	= new Date().getTime();	
				
		// apply highlight
		var updatedHighlight	= t.colorize_text(textToHighlight);
		var tpsAfterReg			= new Date().getTime();
		
		/***
		 * see if we can optimize for updating only the required part of the HTML code
		 * 
		 * The goal here will be to find the text node concerned by the modification and to update it
		 */
		//-------------------------------------------
		
		// disable latest optimization tricks (introduced in 0.8.1 and removed in 0.8.2), TODO: check for another try later
		doSyntaxOpti	= doHtmlOpti = false;
		if( doSyntaxOpti )
		{
			try
			{
				var replacedBloc, i, nbStart = '', nbEnd = '', newHtml, lengthOld, lengthNew;
				replacedBloc		= t.last_hightlighted_text.substring( stayBegin.length, t.last_hightlighted_text.length - stayEnd.length );
				
				lengthOld	= replacedBloc.length;
				lengthNew	= updatedHighlight.length;
				
				// find the identical caracters at the beginning
				for( i=0; i < lengthOld && i < lengthNew && replacedBloc.charAt(i) == updatedHighlight.charAt(i) ; i++ )
				{
				}
				nbStart = i;
				// find the identical caracters at the end
				for( i=0; i + nbStart < lengthOld && i + nbStart < lengthNew && replacedBloc.charAt(lengthOld-i-1) == updatedHighlight.charAt(lengthNew-i-1) ; i++ )
				{
				}
				nbEnd	= i;
				//console.log( nbStart, nbEnd, replacedBloc, updated_highlight );
				// get the changes
				var lastHtml	= replacedBloc.substring( nbStart, lengthOld - nbEnd );
				newHtml		= updatedHighlight.substring( nbStart, lengthNew - nbEnd );
				
				// We can do the optimisation only if we havn't touch to span elements
				if( newHtml.indexOf('<span') == -1 && newHtml.indexOf('</span') == -1 
					&& lastHtml.indexOf('<span') == -1 && lastHtml.indexOf('</span') == -1 )
				{
					var beginStr, nbOpendedSpan, nbClosedSpan, nbUnchangedChars, span, textNode;
					doHtmlOpti		= true;
					beginStr		= t.last_hightlighted_text.substr( 0, stayBegin.length + nbStart );
					// fix special chars
					newHtml			= newHtml.replace( /&lt;/g, '<').replace( /&gt;/g, '>').replace( /&amp;/g, '&');
		
					nbOpendedSpan	= beginStr.split('<span').length - 1;
					nbClosedSpan	= beginStr.split('</span').length - 1;
					// retrieve the previously opened span (Add 1 for the first level span?)
					span 			= t.content_highlight.getElementsByTagName('span')[ nbOpendedSpan ];
					
					//--------[
					// get the textNode to update
					
					// if we're inside a span, we'll take the one that is opened (can be a parent of the current span)
					var parentSpan		= span;
					var maxStartOffset	=0, maxEndOffset = 0;
					var nbClosed,tmpMaxStartOffset,tmpMaxEndOffset,lastIndex ,nbSubSpanBefore,lastEndPos;
					// it will be in the child of the root node 
					if( nbOpendedSpan == nbClosedSpan )
					{
						while( parentSpan.parentNode != t.content_highlight && parentSpan.parentNode.tagName != 'PRE' )
						{
							parentSpan	= parentSpan.parentNode;
						}
					}
					// get the last opened span
					else
					{
						maxStartOffset	= maxEndOffset = beginStr.length + 1;
						// move to parent node for each closed span found after the lastest open span
						nbClosed = beginStr.substr( Math.max( 0, beginStr.lastIndexOf( '<span', maxStartOffset - 1 ) ) ).split('</span').length - 1;
						while( nbClosed > 0 )
						{
							nbClosed--;
							parentSpan = parentSpan.parentNode;
						}
						
						// find the position of the last opended tag
						while( parentSpan.parentNode != t.content_highlight && parentSpan.parentNode.tagName != 'PRE' && ( tmpMaxStartOffset = Math.max( 0, beginStr.lastIndexOf( '<span', maxStartOffset - 1 ) ) ) < ( tmpMaxEndOffset = Math.max( 0, beginStr.lastIndexOf( '</span', maxEndOffset - 1 ) ) ) )
						{
							maxStartOffset	= tmpMaxStartOffset;
							maxEndOffset	= tmpMaxEndOffset;
						}
					}
					// Note: maxEndOffset is no more used but maxStartOffset will be used
					
					if( parentSpan.parentNode == t.content_highlight || parentSpan.parentNode.tagName == 'PRE' )
					{
						maxStartOffset	= Math.max( 0, beginStr.indexOf( '<span' ) );
					}
					
					// find the matching text node (this will be one that will be at the end of the beginStr
					if( maxStartOffset == beginStr.length )
					{
						nbSubSpanBefore	= 0;
					}
					else
					{
						lastEndPos = Math.max( 0, beginStr.lastIndexOf( '>', maxStartOffset ) );
		
						// count the number of sub spans
						nbSubSpanBefore			= beginStr.substr( lastEndPos ).split('<span').length-1;
					}
					
					// there is no sub-span before
					if( nbSubSpanBefore == 0 )
					{
						textNode	= parentSpan.firstChild;
					}
					// we need to find where is the text node modified
					else
					{
						// take the last direct child (no sub-child)
						var lastSubSpan	= parentSpan.getElementsByTagName('span')[ nbSubSpanBefore - 1 ];
						while( lastSubSpan.parentNode != parentSpan )
						{
							lastSubSpan	= lastSubSpan.parentNode;
						}

						// associate to next text node following the last sub span
						if( lastSubSpan.nextSibling == null || lastSubSpan.nextSibling.nodeType != 3 )
						{
							textNode	= document.createTextNode('');
							lastSubSpan.parentNode.insertBefore( textNode, lastSubSpan.nextSibling );
						}
						else
						{
							textNode	= lastSubSpan.nextSibling;
						}
					}
					//--------]
					
					
					//--------[
					// update the textNode content
					
					// number of caracters after the last opened of closed span
					//nbUnchangedChars = ( lastIndex = beginStr.lastIndexOf( '>' ) ) == -1 ? beginStr.length : beginStr.length - ( lastIndex + 1 );
					//nbUnchangedChars =  ? beginStr.length : beginStr.substr( lastIndex + 1 ).replace( /&lt;/g, '<').replace( /&gt;/g, '>').replace( /&amp;/g, '&').length;
					
					if( ( lastIndex = beginStr.lastIndexOf( '>' ) ) == -1 )
					{
						nbUnchangedChars	= beginStr.length;
					}
					else
					{
						nbUnchangedChars	= beginStr.substr( lastIndex + 1 ).replace( /&lt;/g, '<').replace( /&gt;/g, '>').replace( /&amp;/g, '&').length; 	
						//nbUnchangedChars	+= beginStr.substr( ).replace( /&/g, '&amp;').replace( /</g, '&lt;').replace( />/g, '&gt;').length - beginStr.length;
					}
					//alert( nbUnchangedChars );
					//	console.log( span, textNode, nbOpendedSpan,nbClosedSpan,  span.nextSibling, textNode.length, nbUnchangedChars, lastHtml, lastHtml.length, newHtml, newHtml.length );
					//	alert( textNode.parentNode.className +'-'+ textNode.parentNode.tagName+"\n"+ textNode.data +"\n"+ nbUnchangedChars +"\n"+ lastHtml.length +"\n"+ newHtml +"\n"+ newHtml.length  );
				//	console.log( nbUnchangedChars, lastIndex, beginStr.length, beginStr.replace(/&/g, '&amp;'), lastHtml.length, '|', newHtml.replace( /\t/g, 't').replace( /\n/g, 'n').replace( /\r/g, 'r'), lastHtml.replace( /\t/g, 't').replace( /\n/g, 'n').replace( /\r/, 'r') );
				//	console.log( textNode.data.replace(/&/g, '&amp;') );
					// IE only manage \r for cariage return in textNode and not \n or \r\n
					if( t.isIE )
					{
						nbUnchangedChars	-= ( beginStr.substr( beginStr.length - nbUnchangedChars ).split("\n").length - 1 );
						//alert( textNode.data.replace(/\r/g, '_r').replace(/\n/g, '_n')); 
						textNode.replaceData( nbUnchangedChars, lastHtml.replace(/\n/g, '').length, newHtml.replace(/\n/g, '') );
					}
					else
					{
						textNode.replaceData( nbUnchangedChars, lastHtml.length, newHtml );
					}
					//--------]
				}
			}
			// an exception shouldn't occured but if replaceData failed at least it won't break everything
			catch( e )
			{
		//		throw e;
			//	console.log( e );
				doHtmlOpti	= false;
			}
			
		}
	
		/*** END HTML update's optimisation ***/
		// end test
		
	//			console.log(  (TPS6-TPS5), (TPS5-TPS4), (TPS4-TPS3), (TPS3-TPS2), (TPS2-TPS1), _CPT );
		// get the new highlight content
		var tpsAfterOpti2		= new Date().getTime();
		hightlightedText	= stayBegin + updatedHighlight + stayEnd;
		if( !doHtmlOpti )
		{
			// update the content of the highlight div by first updating a clone node (as there is no display in the same time for t node it's quite faster (5*))
			var new_Obj= t.contentHighlight.cloneNode(false);
			if( ( t.isIE && t.isIE < 8 ) || ( t.isOpera && t.isOpera < 9.6 ) )
				newObj.innerHTML= "<pre><span class='"+ t.settings["syntax"] +"'>" + hightlightedText + "</span></pre>";	
			else
				newObj.innerHTML= "<span class='"+ t.settings["syntax"] +"'>"+ hightlightedText +"</span>";
	
			t.contentHighlight.parentNode.replaceChild(newObj, t.content_highlight);
		
			t.contentHighlight= newObj;
		}
		
		t.last_text_to_highlight= infos["full_text"];
		t.last_hightlighted_text= hightlightedText;
		
		var tps3=new Date().getTime();
	
		if(t.settings["debug"]){
			//lineNumber=tab_text.length;
			//t.debug.value+=" \nNB char: "+_$("src").value.length+" Nb line: "+ lineNumber;
		
			t.debug.value= "Tps optimisation "+(tpsEndOpti-tpsStart)
				+" | tps reg exp: "+ (tpsAfterReg-tpsEndOpti)
				+" | tps opti HTML : "+ (tpsAfterOpti2-tpsAfterReg) + ' '+ ( doHtmlOpti ? 'yes' : 'no' )
				+" | tps update highlight content: "+ (tps3-tpsAfterOpti2)
				+" | tpsTotal: "+ (tps3-tpsStart)
				+ "("+tps3+")\n"+ debugOpti;
		//	t.debug.value+= "highlight\n"+hightlighted_text;*/
		}
		
	};
	
	EditArea.prototype.resync_highlight= function(reloadNow){
		this.reload_highlight=true;
		this.last_text_to_highlight="";
		this.focus();		
		if(reloadNow)
			this.check_line_selection(false); 
	};	
