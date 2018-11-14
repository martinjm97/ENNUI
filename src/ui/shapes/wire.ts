import { Shape, Point } from "./shape";
import { Layer, Dense } from "./layer";
import * as d3 from "d3";
import { windowProperties } from "../window";

export class Wire {
    static readonly defaultLocation: Point = new Point(200, 200);

    source: Layer;
    dest: Layer;
    line: d3.Selection<SVGGraphicsElement, {}, HTMLElement, any>;
    triangle: d3.Selection<SVGGraphicsElement, {}, HTMLElement, any>;

    static nextID: number = 0;
    id: number;
    // lineData: Array<{input: Point, output: Point}> = [];

    // TODO allow selecting of the arrow

    constructor(source: Layer, dest: Layer) {
        this.source = source
        this.dest = dest
        this.id = Wire.nextID;
        Wire.nextID += 1;

        this.triangle = d3.select<SVGGraphicsElement, {}>("svg").append<SVGGraphicsElement>("svg:defs").append<SVGGraphicsElement>("svg:marker")
        .attr("id", "triangle"+this.id)
        .attr("refX", 14)
        .attr("refY", 3)
        .attr("markerWidth", 20)
        .attr("markerHeight", 20)
        .attr("orient", "auto")
        .on("click", () => {this.select()})
        .append<SVGGraphicsElement>("path")
        .attr("d", "M0,0 L6,3 L0,6 L1.5,3 L0,0")
        .style("fill", "black")
        .on("click", () => {this.select()})


        let sourcePosition = this.source.getPosition()
        let destPosition = this.dest.getPosition()
        let sourceCenter = this.source.center()
        let destCenter = this.dest.center()

        this.line = d3.select<SVGGraphicsElement, {}>("svg")
                    .append<SVGGraphicsElement>("g")
                    .append<SVGGraphicsElement>("line")
                    .attr('x1',sourcePosition[0]+sourceCenter.x)
                    .attr('y1',sourcePosition[1]+sourceCenter.y)
                    .attr('x2',destPosition[0]+destCenter.x)
                    .attr('y2',destPosition[1]+destCenter.y)
                    .style('stroke','black')
                    .style('stroke-width',6)
                    .attr("marker-end", "url(#triangle"+this.id+")");
        // }

        this.source.svgComponent.raise()
        this.dest.svgComponent.raise()

        this.line.on("click", () => {this.select()})
        this.triangle.on("click", () => {this.select()})
    }

    updatePosition() {
        let sourcePosition = this.source.getPosition()
        let destPosition = this.dest.getPosition()
        let sourceCenter = this.source.center()
        let destCenter = this.dest.center()
        this.line.attr('x1',sourcePosition[0]+sourceCenter.x)
                 .attr('y1',sourcePosition[1]+sourceCenter.y)
                 .attr('x2',destPosition[0]+destCenter.x)
                 .attr('y2',destPosition[1]+destCenter.y)
    }

    public select() {
        if (windowProperties.selectedElement != null) {
            if (windowProperties.selectedElement === this) {
                return
            }
            windowProperties.selectedElement.unselect()
        }
        windowProperties.selectedElement = this
        this.line.raise()
        this.source.svgComponent.raise()
        this.dest.svgComponent.raise()
        this.line.style("stroke", "yellow")
        this.triangle.style("fill", "yellow")
    }

    public unselect() {
        this.line.style("stroke", "black")
        this.triangle.style("fill", "black")
    }

    public delete() {
        this.line.remove()
        this.source.connections.delete(this.dest)
        this.source.wires.delete(this)
        this.dest.wires.delete(this)
    }

}