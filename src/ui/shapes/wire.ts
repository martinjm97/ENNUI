import { Shape, Point } from "./shape";
import { Layer, Dense } from "./layer";
import * as d3 from "d3";
import { windowProperties } from "../window";

export class Wire {
    static readonly defaultLocation: Point = new Point(200, 200);

    layer1: Layer;
    layer2: Layer;
    lines: Array<d3.Selection<SVGGraphicsElement, {}, HTMLElement, any>> = [];
    lineData: Array<{input: Point, output: Point}> = [];

    constructor(layer1: Layer, layer2: Layer) {
        this.layer1 = layer1
        this.layer2 = layer2


        let inputPosition = layer1.getPosition()
        let outputPosition = layer2.getPosition()

        for (let point1 of layer1.wireConnectionPoints) {
            for (let point2 of layer2.wireConnectionPoints) {
                this.lineData.push({input: point1, output: point2})
            }
        }

        for (let points of this.lineData ) {
            this.lines.push(d3.select<SVGGraphicsElement, {}>("svg")
                    .append<SVGGraphicsElement>("g")
                    .append<SVGGraphicsElement>("line")
                    .attr('x1',inputPosition[0]+points.input.x)
                    .attr('y1',inputPosition[1]+points.input.y)
                    .attr('x2',outputPosition[0]+points.output.x)
                    .attr('y2',outputPosition[1]+points.output.y)
                    .style('stroke','black')
                    .style('stroke-width',2));
        }

        this.layer1.svgComponent.raise()
        this.layer2.svgComponent.raise()

        for (let line of this.lines) {
            line.on("click", () => {this.select()})
        }

        
    }

    updatePosition() {
        let inputPosition = this.layer1.getPosition()
        let outputPosition = this.layer2.getPosition()
        for (let i in this.lineData) {
            this.lines[i].attr('x1',inputPosition[0]+this.lineData[i].input.x)
                         .attr('y1',inputPosition[1]+this.lineData[i].input.y)
                         .attr('x2',outputPosition[0]+this.lineData[i].output.x)
                         .attr('y2',outputPosition[1]+this.lineData[i].output.y)
        }
    }

    public select() {
        if (windowProperties.selectedElement != null) {
            if (windowProperties.selectedElement === this) {
                return
            }
            windowProperties.selectedElement.unselect()
        }
        windowProperties.selectedElement = this
        this.lines.forEach( (l) => { l.raise()})
        this.layer1.svgComponent.raise()
        this.layer2.svgComponent.raise()
        this.lines.forEach( (l) => { l.style("stroke", "yellow")})
    }

    public unselect() {
        this.lines.forEach( (l) => { l.style("stroke", "black")})
    }

    public delete() {
        this.lines.forEach( (l) => {l.remove()})
        this.layer1.connections.delete(this.layer2)
        this.layer2.connections.delete(this.layer1)
        this.layer1.wires.delete(this)
        this.layer2.wires.delete(this)
    }

}