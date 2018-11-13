import {Shape, Point} from "./shape";
import {windowProperties} from "../window";
import { Layer } from "./layer";
import * as d3 from "d3";
import { BaseType } from "d3";

export abstract class Draggable extends Shape {
    static readonly snapRadius: number = 400;
    static readonly defaultLocation: Point = new Point(50,100);
    htmlComponent: any;
    svgComponent: d3.Selection<SVGGraphicsElement, {}, HTMLElement, any>;

    public select(){}
    public unselect(){}


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
                this.svgComponent.attr("transform", "translate(" + (d.x = d3.event.x) + ","
                + (d.y = d3.event.y) + ")")
                if (this instanceof Layer) {
                    for (let wire of this.wires) {
                        wire.updatePosition()
                    }
                }                
            })
            .on("end", () => {firstDrag = true})

        this.svgComponent.call(dragHandler)
    }
}