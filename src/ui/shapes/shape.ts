export abstract class Shape {
    color: string;

    constructor(color: string) {
        this.color = color;
    }
}

export class Rectangle extends Shape {
    location: Point;
    width: number;
    height: number;

    constructor(location: Point, width: number, height: number, color: string) {
        super(color);
        this.location = location;
        this.width = width;
        this.height = height;
    }
}

export class Point {
    x: number;
    y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    distance(p1: Point,p2: Point): number {
	    return (p1.x - p2.x)**2 + (p1.y - p2.y)**2;
    }

    add(p1: Point,p2: Point): Point {
	    return new Point(p1.x + p2.x, p1.y + p2.y);
    }

    minus(p1: Point,p2: Point): Point {
        return new Point(p1.x - p2.x, p1.y - p2.y);
    }
}