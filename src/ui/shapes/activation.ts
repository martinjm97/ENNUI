import { Draggable } from "./draggable";
import { Point, Rectangle } from "./shape";
import { ActivationLayer } from "./layer";
import * as d3 from "d3"
import { windowProperties } from "../window";

export abstract class Activation extends Draggable {

    layer: ActivationLayer = null;
    abstract activationType: String;
    defaultLocation: Point = new Point(50,150);

    constructor(color: string) { 
        super();
        let middleTooth: Rectangle = new Rectangle(new Point(0, 0), 10, 10, color);
        let lowerBlock: Rectangle = new Rectangle(new Point(-8, 10), 26, 10, color);

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

        this.makeDraggable() 
    }

    public dragAction(d) {
        // Find the closest layer and its distances
        let minDist = Infinity
        let closestLayer: ActivationLayer = null
        for (let activationLayer of windowProperties.activationLayers) {
            let dist = activationLayer.getPosition().distance(this.getPosition())
            if (dist < minDist) {
                minDist = dist
                closestLayer = activationLayer
            }
        }

        // Snap activations if they are close enough
        let snappingDistance = 20
        if (minDist < snappingDistance) {
            // if snap happens remove old connection
            if (this.layer != null) {
                this.layer.removeActivation()
                this.layer = null
            } 
            closestLayer.addActivation(this)
            this.layer = closestLayer
        } else if (this.layer != null) { // otherwise, if we unsnap update as appropriate
            this.layer.removeActivation()
            this.layer = null
        }
    }


}

export class Relu extends Activation {
    activationType = "relu"

    constructor() {
        super("#00CCCC")
    }

    getHoverText(): string { return "relu" }

}

export class Sigmoid extends Activation {
    activationType = "sigmoid"

    constructor() {
        super("#FF00FF")
    }

    getHoverText(): string { return "sigmoid" }

}

export class Softmax extends Activation {
    activationType = "softmax"
    
    constructor() {
        super("6000a0")
    }

    getHoverText(): string { return "softmax" }
}
