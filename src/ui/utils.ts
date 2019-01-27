export function parseString(s: string){
	if(s.indexOf(',')===-1){
		return parseInt(s);
	}
	s = s.replace('(','').replace(')','').replace('[','').replace(']','');
	return s.split(',').map(x => parseInt(x));
}
