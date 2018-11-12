import { Draggable } from "./draggable";
import { Point, Rectangle } from "./shape";
import { Layer } from "./layer";
import * as d3 from "d3"

export abstract class Activation extends Draggable {

    freeFloatingLocation: Point = new Point(25, 25);
    layer: Layer = null;

    constructor(color: string) { 
        super();
        let middleTooth: Rectangle = new Rectangle(new Point(0, 0), 10, 10, color);
        let lowerBlock: Rectangle = new Rectangle(new Point(-8, 10), 26, 10, color);
        // TODO: Finish making shapes!
        this.svgComponent = d3.select("svg")
                              .append("g")
                              .data([{"x": Draggable.defaultLocation.x, "y": Draggable.defaultLocation.y}])
                              .attr('transform','translate('+Draggable.defaultLocation.x+','+Draggable.defaultLocation.y+')');

        this.svgComponent.append("rect")
                         .attr("x", lowerBlock.location.x)
                         .attr("y", lowerBlock.location.y)
                         .attr("width", lowerBlock.width)
                         .attr("height", lowerBlock.height)
                         .style("fill", lowerBlock.color);

        this.svgComponent.append("rect")
                         .attr("x", middleTooth.location.x)
                         .attr("y", middleTooth.location.y)
                         .attr("width", middleTooth.width)
                         .attr("height", middleTooth.height)
                         .style("fill", middleTooth.color);

        console.log("made a thing! ")

        this.makeDraggable() 
    }

    getLocation() {
        if (this.layer != null) {
            return this.freeFloatingLocation;
        } else {
            // TODO Return the location of an activation relative to the parent layer
        }
    }
}

export class Relu extends Activation {

    constructor() {
        super("#00CCCC")
        console.log("MADE A RELU!")
    }
}

export class Sigmoid extends Activation {

    constructor() {
        super("#FF00FF")
    }
}

export class Softmax extends Activation {
    
    constructor() {
        super("6000a0")
    }
}
