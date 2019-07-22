import * as d3 from "d3";

export abstract class Shape {
    public color: string;
    public location: Point;
    public svgComponent: d3.Selection<SVGGraphicsElement, {}, HTMLElement, any>;

    constructor(location: Point, color: string) {
        this.color = color;
        this.location = location;
    }

    public abstract svgAppender(selection: d3.Selection<SVGGraphicsElement, {}, HTMLElement, any>): void;

}

export class PathShape extends Shape {
    public path: string;

    constructor(path: string, color: string) {
        super(new Point(0, 0), color);
        this.path = path;
    }

    public svgAppender(selection: d3.Selection<SVGGraphicsElement, {}, HTMLElement, any>): void {
        this.svgComponent = selection.append<SVGGraphicsElement>("path")
                                     .attr("d", this.path)
                                     .attr("x", this.location.x)
                                     .attr("y", this.location.y)
                                     .style("fill", this.color)
                                     .style("cursor", "pointer");
    }

}

export class Rectangle extends Shape {
    public width: number;
    public height: number;

    constructor(location: Point, width: number, height: number, color: string) {
        super(location, color);
        this.width = width;
        this.height = height;
    }

    public svgAppender(selection: d3.Selection<SVGGraphicsElement, {}, HTMLElement, any>): void {
        this.svgComponent = selection.append<SVGGraphicsElement>("rect")
                                     .attr("x", this.location.x)
                                     .attr("y", this.location.y)
                                     .attr("width", this.width)
                                     .attr("height", this.height)
                                     .style("fill", this.color)
                                     .style("cursor", "pointer");

    }
}

export class Circle extends Shape {
    public radius: number;
    private outerShape: boolean;

    constructor(location: Point, radius: number, color: string, outerShape: boolean = false) {
        super(location, color);
        this.radius = radius;
        this.outerShape = outerShape;
    }

    public svgAppender(selection: d3.Selection<SVGGraphicsElement, {}, HTMLElement, any>): void {
        this.svgComponent = selection.append<SVGGraphicsElement>("circle")
                                     .attr("cx", this.location.x)
                                     .attr("cy", this.location.y)
                                     .attr("r", this.radius)
                                     .style("fill", this.color)
                                     .style("cursor", "pointer");

        if (this.outerShape) {
            this.svgComponent.attr("class", "outerShape");
        }
    }
}

export class Line extends Shape {
    public endPoint: Point;
    public lineWidth: number;

    constructor(location: Point, endPoint: Point, lineWidth: number, color: string) {
        super(location, color);
        this.endPoint = endPoint;
        this.lineWidth = lineWidth;
    }

    public svgAppender(selection: d3.Selection<SVGGraphicsElement, {}, HTMLElement, any>): void {
        this.svgComponent = selection.append<SVGGraphicsElement>("line")
                                     .attr("x1", this.location.x)
                                     .attr("y1", this.location.y)
                                     .attr("x2", this.endPoint.x)
                                     .attr("y2", this.endPoint.y)
                                     .style("stroke-width", this.lineWidth)
                                     .style("stroke", this.color)
                                     .style("cursor", "pointer");
    }
}

export class Point {

    public static randomPoint(width: number, height: number, initial: Point): Point {
        return new Point(Math.random() * width + initial.x, Math.random() * height + initial.y);
    }
    public x: number;
    public y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    public distance(other: Point): number {
        return Math.sqrt((this.x - other.x) ** 2 + (this.y - other.y) ** 2);
    }

    public add(other: Point): Point {
        return new Point(this.x + other.x, this.y + other.y);
    }

    public minus(other: Point): Point {
        return new Point(this.x - other.x, this.y - other.y);
    }

    public angleTo(other: Point): number {
        return Math.atan2(other.y - this.y, other.x - this.x) * 180 / Math.PI; // angle for tangent
    }

    public midpoint(other: Point): Point {
        return new Point((this.x + other.x) / 2, (this.y + other.y) / 2);
    }
}
