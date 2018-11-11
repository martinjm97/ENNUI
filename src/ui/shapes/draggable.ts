import {Shape, Point} from "./shape";
import {window} from "../window";
import { Layer } from "./layer";
import * as d3 from "d3";

export abstract class Draggable extends Shape {
    static readonly snapRadius: number = 400;
    static readonly defaultLocation: Point = new Point(50,100);
    htmlComponent: any;
    svgComponent: any;


    public makeDraggable(){
        var dragHandler = d3.drag().on("drag", function(d) {
            d3.select(this).attr("transform", "translate(" + (d.x = d3.event.x) + ","
            + (d.y = d3.event.y) + ")");
        })
        dragHandler(this.svgComponent)
    }
}