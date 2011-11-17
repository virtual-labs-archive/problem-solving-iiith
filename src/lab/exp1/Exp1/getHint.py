from mod_python import util
PATH = "/home/cse04/public_html/final-build/Exp1/"
def index(req,qNo,hintNo,sid):
	if(qNo=="1"):
	  	dir = PATH + "Hints1/"
	elif(qNo=="2"):
	  	dir = PATH + "Hints2/"
	try:	
		x = dir+"Hint_"+hintNo+".html"
		F = open(dir+"Hint_"+hintNo+".html","r");
		s = F.read()
		F.close()
	except:
		s = " No more Hints";

#	s="""<html> <body>"""+s+"""</body></html>"""
	return s;
#	F = open(dir+"Hint_"+str(hintNo)+".html","r");
#	if(!F)
#		return "No more Hints"
#	str = F.read()
#	F.close()
#	return str;		
