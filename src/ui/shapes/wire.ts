import * as d3 from "d3";
import { windowProperties } from "../window";
import { Layer } from "./layer";

export class Wire {
    public readonly wireGuidePresent: boolean = false;

    private source: Layer;
    private dest: Layer;
    private line: d3.Selection<SVGGraphicsElement, {}, HTMLElement, any>;
    private triangle: d3.Selection<SVGGraphicsElement, {}, HTMLElement, any>;
    private group: d3.Selection<SVGGraphicsElement, {}, HTMLElement, any>;

    constructor(source: Layer, dest: Layer) {
        this.source = source;
        this.dest = dest;

        const sourceCenter = this.source.getPosition().add(this.source.center());
        const destCenter = this.dest.getPosition().add(this.dest.center());

        this.group = d3.select<SVGGraphicsElement, {}>("#svg")
                        .append<SVGGraphicsElement>("g");

        this.line = this.group.append<SVGGraphicsElement>("line")
                            .attr("x1", sourceCenter.x)
                            .attr("y1", sourceCenter.y)
                            .attr("x2", destCenter.x)
                            .attr("y2", destCenter.y)
                            .style("stroke", "black")
                            .style("stroke-width", 6)
                            .style("cursor", "pointer");

        this.triangle = this.group.append<SVGGraphicsElement>("polygon")
                                .attr("points", "0,16, 20,0, 0,-16")
                                .style("cursor", "pointer");

        this.updatePosition();
        this.source.raise();
        this.dest.raise();

        this.line.on("click", () => {this.select(); });
        this.triangle.on("click", () => {this.select(); });
    }

    public raise(): void {
        this.group.raise();
        this.source.raiseGroup();
        this.dest.raiseGroup();
    }

    public raiseGroup(): void {
        this.group.raise();
    }

    public select(): void {
        if (windowProperties.selectedElement != null) {
            if (windowProperties.selectedElement === this) {
                return;
            }
            windowProperties.selectedElement.unselect();
        }
        windowProperties.selectedElement = this;
        this.raise();
        this.line.style("stroke", "yellow");
        this.triangle.style("fill", "yellow");
    }

    public unselect(): void {
        this.line.style("stroke", "black");
        this.triangle.style("fill", "black");
    }

    public delete(): void {
        this.line.remove();
        this.triangle.remove();
        this.source.children.delete(this.dest);
        this.dest.parents.delete(this.source);
        this.source.wires.delete(this);
        this.dest.wires.delete(this);
    }

    public updatePosition(): void {
        const sourceCenter = this.source.getPosition().add(this.source.center());
        const destCenter = this.dest.getPosition().add(this.dest.center());
        const midPoint = sourceCenter.midpoint(destCenter);
        this.line.attr("x1", sourceCenter.x)
                 .attr("y1", sourceCenter.y)
                 .attr("x2", destCenter.x)
                 .attr("y2", destCenter.y);

        this.triangle.attr("transform", "translate(" + midPoint.x + ","
                + midPoint.y + ")rotate(" + sourceCenter.angleTo(destCenter) + ")");
    }

}
