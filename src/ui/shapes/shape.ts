export class Shape {

}

export class Point {
    x: number;
    y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    dist2(p1,p2){
	    return (p1[0]-p2[0])*(p1[0]-p2[0]) + (p1[1]-p2[1])*(p1[1]-p2[1]);
    }

    add(p1,p2){
	    return [p1[0]+p2[0],p1[1]+p2[1]];
    }

    minus(p1,p2){
        return [p1[0]-p2[0],p1[1]-p2[1]];
    }
}