import { Draggable } from "./draggable";
import { Point, Rectangle } from "./shape";
import { ActivationLayer } from "./layer";
import { windowProperties } from "../window";

export abstract class Activation extends Draggable {

    layer: ActivationLayer = null;
    abstract activationType: string;
    static defaultLocation: Point = new Point(50, 150);
    body: d3.Selection<SVGGraphicsElement, {}, HTMLElement, any>;
    
    constructor(color: string, defaultLocation) { 
        super(defaultLocation);

        this.body = this.svgComponent.append<SVGGraphicsElement>("path").attr("d", "M0 0 h10 v10 h8 v20 h-26 v-20 h8 v-10 Z")
                                                                        .style("fill", color)

        // let middleTooth: Rectangle = new Rectangle(new Point(0, 0), 10, 10, color);
        // let lowerBlock: Rectangle = new Rectangle(new Point(-8, 10), 26, 20, color);

        // this.svgComponent.call(lowerBlock.svgAppender.bind(lowerBlock))
        // this.svgComponent.call(middleTooth.svgAppender.bind(middleTooth))

        this.makeDraggable() 
    }

    public select() {
        super.select()
        this.body.style("stroke", "yellow").style("stroke-width", "2")

    }

    public unselect() {
        super.unselect()
        this.body.style("stroke", null).style("stroke-width", null)
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

    constructor(defaultLocation=Point.randomPoint(50, 50, Activation.defaultLocation)) {
        
        super("#B29F9C", defaultLocation)

        this.svgComponent.append("path").attr("d", "M-5 20 l10 0 l7 -7")
                                        .style("stroke", "black")
                                        .style("stroke-width", 3)
                                        .style("fill", "none")
        
    }

    getHoverText(): string { return "relu" }

}

export class Sigmoid extends Activation {
    activationType = "sigmoid"

    constructor(defaultLocation=Point.randomPoint(50, 50, Activation.defaultLocation)) {
        super("#F2A878", defaultLocation)

        this.svgComponent.append("path").attr("d", "M -3 20 Q 5 20 5 17 Q 5 14 13 14 ")
        .style("stroke", "black")
        .style("stroke-width", 3)
        .style("fill", "none")

    }

    getHoverText(): string { return "sigmoid" }

}

export class Tanh extends Activation {
    activationType = "tanh"
    
    constructor(defaultLocation=Point.randomPoint(50, 50, Activation.defaultLocation)) {
        super("#A3A66D", defaultLocation)

        this.svgComponent.append("path").attr("d", "M -4 26 Q 5 26 5 20 Q 5 14 14 14 ")
        .style("stroke", "black")
        .style("stroke-width", 3)
        .style("fill", "none")
        
    }

    getHoverText(): string { return "tanh" }
}

export class Softmax extends Activation {
    activationType = "softmax"
    
    constructor(defaultLocation=Point.randomPoint(50, 50, Activation.defaultLocation)) {
        super("#FFFFFF", defaultLocation)

        // TODO curvature is wrong
        this.svgComponent.append("path").attr("d", "M -4 26 Q 5 26 5 20 Q 5 14 14 14 ")
        .style("stroke", "black")
        .style("stroke-width", 3)
        .style("fill", "none")

        
    }

    getHoverText(): string { return "softmax" }
}