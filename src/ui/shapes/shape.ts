import * as d3 from "d3";

export abstract class Shape {
    color: string;
    abstract location: Point;

    abstract svgAppender(selection: d3.Selection<SVGGraphicsElement, {}, HTMLElement, any>);

}

export class Rectangle extends Shape {
    location: Point;
    width: number;
    height: number;
    svgComponent: d3.Selection<SVGGraphicsElement, {}, HTMLElement, any>;

    constructor(location: Point, width: number, height: number, color: string) {
        super()
        this.color = color;
        this.location = location;
        this.width = width;
        this.height = height;
    }

    svgAppender(selection: d3.Selection<SVGGraphicsElement, {}, HTMLElement, any>) {
        this.svgComponent = selection.append<SVGGraphicsElement>("rect")
                                     .attr("x", this.location.x)
                                     .attr("y", this.location.y)
                                     .attr("width", this.width)
                                     .attr("height", this.height)
                                     .style("fill", this.color)
    }
}

export class Circle extends Shape {
    location: Point;
    radius: number;
    svgComponent: d3.Selection<SVGGraphicsElement, {}, HTMLElement, any>;

    constructor(location: Point, radius: number, color: string) {
        super()
        this.color = color;
        this.location = location;
        this.radius = radius;
    }

    svgAppender(selection: d3.Selection<SVGGraphicsElement, {}, HTMLElement, any>) {
        this.svgComponent = selection.append<SVGGraphicsElement>("circle")
                                     .attr("cx", this.location.x)
                                     .attr("cy", this.location.y)
                                     .attr("r", this.radius)
                                     .style("fill", this.color)
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