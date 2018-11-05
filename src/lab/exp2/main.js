function check(){
	var Q1=document.quiz.q1.value;
	var Q2=document.quiz.q2.value;
	var c=0;
	if(Q1==="1"){
		c++;
	}
	if (Q2==="1") {
		c++;
	};
	window.alert("You got "+c+" correct!");
}
