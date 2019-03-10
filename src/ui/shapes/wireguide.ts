import * as d3 from "d3";
import { windowProperties } from "../window";
import { Draggable } from "./draggable";

export class WireGuide {
    private dashedLine: d3.Selection<SVGGraphicsElement, {}, HTMLElement, any>;
    private circle: d3.Selection<SVGGraphicsElement, {}, HTMLElement, any>;

    constructor() {
        this.dashedLine =  d3.select("#svg").append<SVGGraphicsElement>("line")
            .attr('x1',0)
            .attr('y1',0)
            .attr('x2',0)
            .attr('y2',0)
            .style('stroke','black')
            .style('stroke-width',6)
            .style("stroke-dasharray", ("8, 8"))
            .style("display", "none")
            .style("pointer-events", "none")
        
        this.circle = d3.select("#svg").append<SVGGraphicsElement>("circle")
            .attr("cx", 0)
            .attr("cy", 0)
            .attr("r", 10)
            .style("fill", "black")
            .style("stroke-width", "4")
            .style("display", "none")
            .style("pointer-events", "none")
    }

    public show(): void {
        this.dashedLine.style("display", null)
        this.circle.style("display", null)
        this.dashedLine.raise()
        this.circle.raise()
    }

    public hide(): void {
        this.dashedLine.style("display", "none")
        this.circle.style("display", "none")
    }

    public raise(): void {
        this.dashedLine.raise()
        this.circle.raise()
    }

    public moveToMouse(): void {
        this.raise()
        if (windowProperties.selectedElement != null && 
            windowProperties.selectedElement.wireGuidePresent && 
            windowProperties.selectedElement instanceof Draggable) {

            let sourceCenter = windowProperties.selectedElement.getPosition().add(windowProperties.selectedElement.center())
            // Catch the error when there the mouse does not yet have a relative position
            let endCoords;
            try {
                endCoords = d3.mouse(<any>d3.select("#svg").node())
            } catch (error) {
                endCoords = [0,0]
            }           

            this.dashedLine.attr('x1',sourceCenter.x)
                .attr('y1',sourceCenter.y)
                .attr('x2',endCoords[0])
                .attr('y2',endCoords[1])

            this.circle.attr("cx", sourceCenter.x)
                .attr("cy", sourceCenter.y)
        }
    }
}