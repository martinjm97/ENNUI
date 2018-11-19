import { Point } from "./shape";
import * as d3 from "d3";
import { windowProperties } from "../window";

export abstract class Draggable {
    static readonly snapRadius: number = 400;
    static readonly defaultLocation: Point = new Point(50,100);
    htmlComponent: any;
    svgComponent: d3.Selection<SVGGraphicsElement, {}, HTMLElement, any>;

    constructor() {
        this.svgComponent = d3.select<SVGGraphicsElement, {}>("svg")
                              .append<SVGGraphicsElement>("g")
                              .data([{"x": Draggable.defaultLocation.x, "y": Draggable.defaultLocation.y}])
                              .attr('transform','translate('+Draggable.defaultLocation.x+','+Draggable.defaultLocation.y+')')
                              .on("click", () => {this.select()})
        this.makeDraggable()
    }

    public makeDraggable(){
        var firstDrag = true
        let dragHandler = d3.drag().clickDistance(4)
            .on("drag", (d: any) => {
                if (firstDrag) {
                    // Perform on drag start here instead of using on("start", ...) since d3 calls drag starts weirdly (on mousedown,
                    // instead of after actually dragging a little bit)
                    this.select()
                    firstDrag = false
                }
                let canvas = document.getElementById("svg")          
                // TODO: take into account the width of the object this.svgComponent      
                if (d3.event.x > 0 && d3.event.x < canvas.clientWidth 
                    && d3.event.y > 0 && d3.event.y < canvas.clientHeight) {
                    this.svgComponent.attr("transform", "translate(" + (d.x = d3.event.x) + "," + (d.y = d3.event.y) + ")")
                }
                console.log("drag", d3.event.x, d3.event.y)

                this.dragAction(d)
            })
            .on("end", () => {firstDrag = true})

        this.svgComponent.call(dragHandler)
    }

    // Special behavior when being dragged e.g. activations snap to Layers
    public dragAction(d) {}

    public select() {
        if (windowProperties.selectedElement != null) {
            if (windowProperties.selectedElement === this) {
                return
            }
            windowProperties.selectedElement.unselect()
        }
        windowProperties.selectedElement = this
        this.svgComponent.raise()
        this.svgComponent.selectAll("rect").style("stroke", "yellow").style("stroke-width", "2")
    }

    public unselect() {
        this.svgComponent.selectAll("rect").style("stroke", null).style("stroke-width", null)
    }

    public delete() {
        this.svgComponent.remove()
    }

    public center(): Point {
        let bbox = this.svgComponent.node().getBBox()
        console.log(bbox)
        return new Point(bbox.x+bbox.width/2, bbox.y+bbox.height/2)
    }
    

    getPosition(): Point {
		let transformation = this.svgComponent.attr('transform')
		let numArr = transformation.substring( transformation.indexOf('(') + 1 , transformation.indexOf(')') ).split(',').map(value => parseInt(value));
        return new Point(numArr[0], numArr[1])
    }
}