import { Point } from "./shape";
import { Layer } from "./layer";
import * as d3 from "d3";
import { windowProperties } from "../window";

export class Wire {
    static readonly defaultLocation: Point = new Point(200, 200);

    source: Layer;
    dest: Layer;
    line: d3.Selection<SVGGraphicsElement, {}, HTMLElement, any>;
    triangle: d3.Selection<SVGGraphicsElement, {}, HTMLElement, any>;
    group: d3.Selection<SVGGraphicsElement, {}, HTMLElement, any>;

    static nextID: number = 0;
    id: number;
    readonly wireGuidePresent: boolean = false;

    constructor(source: Layer, dest: Layer) {
        this.source = source
        this.dest = dest
        this.id = Wire.nextID;
        Wire.nextID += 1;

        let sourceCenter = this.source.getPosition().add(this.source.center())
        let destCenter = this.dest.getPosition().add(this.dest.center())

        this.group = d3.select<SVGGraphicsElement, {}>("#svg")
                        .append<SVGGraphicsElement>("g")

        this.line = this.group.append<SVGGraphicsElement>("line")
                            .attr('x1',sourceCenter.x)
                            .attr('y1',sourceCenter.y)
                            .attr('x2',destCenter.x)
                            .attr('y2',destCenter.y)
                            .style('stroke','black')
                            .style('stroke-width',6)
                            .style('cursor', "pointer")

        this.triangle = this.group.append<SVGGraphicsElement>("polygon")
                                .attr("points", "0,16, 20,0, 0,-16")
                                .style('cursor', 'pointer')

        this.updatePosition()
        this.source.raise()
        this.dest.raise()

        this.line.on("click", () => {this.select()})
        this.triangle.on("click", () => {this.select()})
    }

    updatePosition() {
        let sourceCenter = this.source.getPosition().add(this.source.center())
        let destCenter = this.dest.getPosition().add(this.dest.center())
        let midPoint = sourceCenter.midpoint(destCenter)
        this.line.attr('x1',sourceCenter.x)
                 .attr('y1',sourceCenter.y)
                 .attr('x2',destCenter.x)
                 .attr('y2',destCenter.y)

        this.triangle.attr("transform", "translate(" + midPoint.x + ","
                + midPoint.y + ")rotate("+ sourceCenter.angleTo(destCenter) + ")")
    }

    public raise() {
        this.group.raise()
        this.source.raiseGroup()
        this.dest.raiseGroup()
    }

    public raiseGroup() {
        this.group.raise()
    }

    public select() {
        if (windowProperties.selectedElement != null) {
            if (windowProperties.selectedElement === this) {
                return
            }
            windowProperties.selectedElement.unselect()
        }
        windowProperties.selectedElement = this
        this.raise()
        this.line.style("stroke", "yellow")
        this.triangle.style("fill", "yellow")
    }

    public unselect() {
        this.line.style("stroke", "black")
        this.triangle.style("fill", "black")
    }

    public delete() {
        this.line.remove()
        this.triangle.remove()
        this.source.children.delete(this.dest)
        this.dest.parents.delete(this.source)
        this.source.wires.delete(this)
        this.dest.wires.delete(this)
    }

}