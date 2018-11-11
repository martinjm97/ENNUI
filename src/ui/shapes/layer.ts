import { Draggable } from "./draggable";
import { Rectangle, Point } from "./shape";
import { Activation } from "./activation";
import { Wire } from "./wire";
import * as d3 from "d3";

// TODO params for entering things in UI for layer properties
// TODO make holes transparent
// TODO make dragging bring item to front
// TODO make transparent holes not terrible

export abstract class Layer extends Draggable {
    block: Array<Rectangle>;
    hole = new Rectangle(new Point(0, 1), 10, 10, '#eee')
    inputLayers: Array<Layer>;
    outputLayers: Array<Layer>;
    wires: Array<Layer>;

    activation: Activation = null;
    uid: number;

    constructor(block: Array<Rectangle>) { 
        super()
        this.uid = Math.random()
        this.block = block
        this.svgComponent = d3.select("svg")
                              .append("g")
                              .data([{"x": Draggable.defaultLocation.x, "y": Draggable.defaultLocation.y}])
                              .attr('transform','translate('+Draggable.defaultLocation.x+','+Draggable.defaultLocation.y+')');

        
        var i = 0
        for (var rect of this.block) {
            i += 1
            let mask = this.svgComponent.append("mask").attr("id", "page"+i+"draggable"+this.uid)
            mask.append("rect")
                .attr("x", rect.location.x)
                .attr("y", rect.location.y)
                .attr("width", "100%")
                .attr("height", "100%")
                .style("fill", "white")
            mask.append("rect")
                .attr("x", this.hole.location.x)
                .attr("y", this.hole.location.y)
                .attr("width", this.hole.width)
                .attr("height", this.hole.height)

            this.svgComponent.append("rect")
                             .attr("x", rect.location.x)
                             .attr("y", rect.location.y)
                             .attr("width", rect.width)
                             .attr("height", rect.height)
                             .style("fill", rect.color)
                             .attr("mask", "url(#page"+i+"draggable"+this.uid+")");
        }

        
                              
        this.makeDraggable()
    }

}

export class Conv2D extends Layer {
    static readonly blockSize: number = 50;

    constructor() {
        super([new Rectangle(new Point(-54, -80), Conv2D.blockSize, Conv2D.blockSize, '#028002'),
               new Rectangle(new Point(-37, -60), Conv2D.blockSize, Conv2D.blockSize, '#029002'),
               new Rectangle(new Point(-20, -40), Conv2D.blockSize, Conv2D.blockSize, '#02a002')])
    }
}

export class Dense extends Layer {
    constructor() {
        super([new Rectangle(new Point(-8, -90), 26, 100, '#b00202')])
    }
} 

export class MaxPooling2D extends Layer {
    static readonly blockSize: number = 30;

    constructor() {
        super([new Rectangle(new Point(-44, -60), MaxPooling2D.blockSize, MaxPooling2D.blockSize, '#3260a2'),
               new Rectangle(new Point(-27, -40), MaxPooling2D.blockSize, MaxPooling2D.blockSize, '#3260c2'),
               new Rectangle(new Point(-10, -20), MaxPooling2D.blockSize, MaxPooling2D.blockSize, '#3260e2')])
    }

}