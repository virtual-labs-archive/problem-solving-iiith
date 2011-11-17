	
#include<stdio.h>
int N;
int no_ways(int W,int index){
	
	if(!W)
		return 1;
	if(index==N)
		return 0;

	int ans = 0,i;
	for(i=0;i*(1<<index)<=W;i++)
		ans+=no_ways(W-i*(1<<index),index+1);

	return ans;
	
}
main(){
	int W;
	scanf("%d%d",&N,&W);

	printf("%d\n",no_ways(W,0));
	return 0;
}
		