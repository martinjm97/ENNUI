function titleCase(s: string){
	if(s === ''){return ''}
	if(s.length === 1){return s.toUpperCase();}
	{return s.charAt(0).toUpperCase()+s.substring(1);}
}

function parseforpython(s: string){
	if(s.indexOf(',')===-1){
		return parseInt(s);
	}
	s = s.replace('(','').replace(')','').replace('[','').replace(']','');
	return s.split(',').map(x => parseInt(x));
}
