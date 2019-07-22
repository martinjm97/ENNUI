import * as d3 from "d3";
import { Point } from "./shape";

export class TextBox {
    private group: d3.Selection<SVGGraphicsElement, {}, HTMLElement, any>;
    private textElement: d3.Selection<SVGGraphicsElement, {}, HTMLElement, any>;
    private offset: Point;

    constructor() {
        this.group = d3.select("#svg").append("g")
        .attr("transform", "translate(5, 50)")
        .style("display", "none");

        this.group.append("rect")
            .attr("x", -50)
            .attr("y", -15)
            .attr("width", 100)
            .attr("height", 30)
            .attr("rx", 3)
            .attr("fill", "rgb(0,0,0,0.8)");

        this.textElement = this.group.append("text")
            .attr("font-family", "Helvetica")
            .attr("alignment-baseline", "middle")
            .attr("text-anchor", "middle")
            .attr("font-size", 16)
            .attr("fill", "#eeeeee");
    }

    public show(): void {
        this.group.style("display", null);
        this.group.raise();
    }

    public hide(): void {
        this.group.style("display", "none");
    }

    public raise(): void {
        this.group.raise();
    }

    public setText(text: string): void {
        this.textElement.text(text);
        // TODO get text width and set rectangle to be large enough
    }

    public setOffset(offset: Point): void {
        this.offset = offset;
    }

    public setPosition(position: Point): void {
        this.raise();
        this.group.attr("transform", `translate(${position.x + this.offset.x}, ${position.y + this.offset.y})`);
    }
}
