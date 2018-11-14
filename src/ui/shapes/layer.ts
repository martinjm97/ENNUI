import { Draggable } from "./draggable";
import { Rectangle, Point, Shape, Circle } from "./shape";
import { Activation } from "./activation";
import { Wire } from "./wire";
import * as d3 from "d3";
import { windowProperties } from "../window";

// TODO params for entering things in UI for layer properties
// TODO make holes transparent
// TODO make dragging bring item to front
// TODO make transparent holes not terrible

export abstract class Layer extends Draggable {
    abstract wireConnectionPoints: Array<Point>;
    
    block: Array<Shape>;
    connections: Set<Layer> = new Set();
    wires: Set<Wire> = new Set();
    wireCircle: d3.Selection<SVGGraphicsElement, {}, HTMLElement, any>;
    wireCircleSelected: boolean = false;
    uid: number = Math.random();

    constructor(block: Array<Shape>) { 
        super()
        this.block = block
        for (var rect of this.block) {
            this.svgComponent.call(rect.svgAppender.bind(rect))
        }
        this.wireCircle = this.svgComponent.append<SVGGraphicsElement>("circle")
                                                .attr("cx", this.center().x)
                                                .attr("cy", this.center().y)
                                                .attr("r", 10)
                                                .style("fill", "black")
                                                .style("stroke-width", "2")
                                                .style("visibility", "hidden")
        
        this.wireCircle.on("click", () => {
            this.wireCircleSelected = true
            this.wireCircle.style("stroke", "red")
        })  
    }

    public dragAction() { 
        for (let wire of this.wires) {
            wire.updatePosition()
        }
    }

    public select() {
        let currSelected = windowProperties.selectedElement;
        if (currSelected != null && currSelected !== this && currSelected instanceof Layer && currSelected.wireCircleSelected) {
            Layer.createConnection(this, currSelected)
            console.log(this.connections)
        }
        super.select()
        this.wireCircle.style("visibility", "visible")
    }

    public unselect() {
        super.unselect()
        this.wireCircle.style("visibility", "hidden")
        this.wireCircleSelected = false
        this.wireCircle.style("stroke", null)
    }

    public static createConnection(layer1: Layer, layer2: Layer) {
        if (!layer1.connections.has(layer2) /* other way around works also */) {
            layer1.connections.add(layer2)
            layer2.connections.add(layer1)

            let newWire = new Wire(layer1, layer2)

            layer1.wires.add(newWire)
            layer2.wires.add(newWire)
        }
    }

    public delete() {
        super.delete()
        this.wires.forEach((w) => w.delete()) // deleting wires should delete layer connection sets
    }
}

export abstract class ActivationLayer extends Layer {
    hole = new Rectangle(new Point(0, 1), 10, 10, '#eee')
    activation: Activation = null;

    constructor(block: Array<Shape>) { 
        super(block)

        // Keep track of activationLayers in global state for activation snapping
        windowProperties.activationLayers.add(this)
        let blocks = this.svgComponent.selectAll<SVGGraphicsElement, {}>("rect").nodes()
        let lastBlock = blocks[blocks.length-1]

        let mask = this.svgComponent.append("mask").attr("id", "hole"+this.uid)
        mask.append("rect")
            .attr("x", block[block.length-1].location.x)
            .attr("y", block[block.length-1].location.y)
            .attr("width", "100%")
            .attr("height", "100%")
            .style("fill", "white")
        mask.append("rect")
            .attr("x", this.hole.location.x)
            .attr("y", this.hole.location.y)
            .attr("width", this.hole.width)
            .attr("height", this.hole.height)

        d3.select(lastBlock).attr("mask", "url(#hole"+this.uid+")");
    }


    public dragAction() {
        super.dragAction()
        if (this.activation != null) {
            let p = this.getPosition()
            this.activation.svgComponent.attr("transform", "translate(" + (p.x) + ","
            + (p.y) + ")")
        }
    }

    public delete() {
        super.delete()
        // Remove this layer from global state
        windowProperties.activationLayers.delete(this)
        if (this.activation != null) {
            this.activation.delete()
        } 
    }

    public addActivation(activation: Activation) {
        if (this.activation != null) {
            this.activation.layer = null
        } 
        this.activation = activation
        let p = this.getPosition()
        activation.svgComponent.attr("transform", "translate(" + (p.x) + ","
        + (p.y) + ")")
    }

    public removeActivation() {
        this.activation = null
    }
}

export class Conv2D extends ActivationLayer {
    // type = "conv2D"
    static readonly blockSize: number = 50;
    wireConnectionPoints = [new Point(-20, -40), new Point(5, -40), new Point(5, -15), new Point(-20, -15)]

    constructor() {
        super([new Rectangle(new Point(-54, -80), Conv2D.blockSize, Conv2D.blockSize, '#028002'),
               new Rectangle(new Point(-37, -60), Conv2D.blockSize, Conv2D.blockSize, '#029002'),
               new Rectangle(new Point(-20, -40), Conv2D.blockSize, Conv2D.blockSize, '#02a002')])
    }
}

export class Dense extends ActivationLayer {
    // type = "dense"
    wireConnectionPoints = [new Point(5, -70), new Point(5, -40), new Point(5, -10)]
    constructor() {
        super([new Rectangle(new Point(-8, -90), 26, 100, '#b00202')])
    }
} 

export class MaxPooling2D extends ActivationLayer {
    // type = "maxPooling2D"
    static readonly blockSize: number = 30;
    wireConnectionPoints = [new Point(-10, -20), new Point(-10, -5), new Point(5, -5), new Point(5, -20)]

    constructor() {
        super([new Rectangle(new Point(-44, -60), MaxPooling2D.blockSize, MaxPooling2D.blockSize, '#3260a2'),
               new Rectangle(new Point(-27, -40), MaxPooling2D.blockSize, MaxPooling2D.blockSize, '#3260c2'),
               new Rectangle(new Point(-10, -20), MaxPooling2D.blockSize, MaxPooling2D.blockSize, '#3260e2')])
    }

}

export class Input extends Layer {
    wireConnectionPoints = [new Point(20, 10), new Point(20, 30)]

	constructor(){
        super([new Rectangle(new Point(0,0), 40, 40, '#010180')])
	}
}

export class Output extends Layer {
    wireConnectionPoints = [new Point(0, -60), new Point(0, 0), new Point(0, 60)]
    constructor(){
        super([new Circle(new Point(0, -60), 10, '#010180'),
               new Circle(new Point(0, -20), 10, '#010180'),
               new Circle(new Point(0, 20), 10, '#010180'),
               new Circle(new Point(0, 60), 10, '#010180')])
	}
}