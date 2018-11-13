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
        this.svgComponent = d3.select<SVGGraphicsElement, {}>("svg")
                              .append<SVGGraphicsElement>("g")
                              .data([{"x": Draggable.defaultLocation.x, "y": Draggable.defaultLocation.y}])
                              .attr('transform','translate('+Draggable.defaultLocation.x+','+Draggable.defaultLocation.y+')');

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
                                                

        this.svgComponent.on("click", () => {this.select()})

        this.wireCircle.on("click", () => {
            this.wireCircleSelected = true
            this.wireCircle.style("stroke", "red")
        })
                              
        this.makeDraggable()
    }

    public select() {
        if (windowProperties.selectedElement != null) {
            if (windowProperties.selectedElement === this) {
                return
            } else if (windowProperties.selectedElement instanceof Layer && windowProperties.selectedElement.wireCircleSelected) {
                Layer.createConnection(this, windowProperties.selectedElement)

                console.log(this.connections)
            }
            windowProperties.selectedElement.unselect()
        }
        windowProperties.selectedElement = this
        this.svgComponent.raise()
        this.wireCircle.style("visibility", "visible")
        this.svgComponent.selectAll("rect").style("stroke", "yellow").style("stroke-width", "2")
    }

    public unselect() {
        this.wireCircle.style("visibility", "hidden")
        this.svgComponent.selectAll("rect").style("stroke", null).style("stroke-width", null)
        this.wireCircleSelected = false
        this.wireCircle.style("stroke", null)
    }

    getPosition(): number[] {
		let transformation = this.svgComponent.attr('transform')
		return transformation.substring( transformation.indexOf('(') + 1 , transformation.indexOf(')') ).split(',').map(value => parseInt(value));
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
        this.svgComponent.remove()
        this.wires.forEach((w) => w.delete()) // deleting wires should delete layer connection sets
    }

    public center(): Point {
        let bbox = this.svgComponent.node().getBBox()
        console.log(bbox)
        return new Point(bbox.x+bbox.width/2, bbox.y+bbox.height/2)
    }
}

export abstract class ActivationLayer extends Layer {
    hole = new Rectangle(new Point(0, 1), 10, 10, '#eee')
    activation: Activation = null;

    constructor(block: Array<Shape>) { 
        super(block)
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
		// this.svgComponent = svg.append('g');
		// this.svgComponent.append('circle').attr('cx',0).attr('cy',-60).attr('r',10).style('fill','#010180');
		// this.svgComponent.append('circle').attr('cx',0).attr('cy',-20).attr('r',10).style('fill','#010180');
		// this.svgComponent.append('circle').attr('cx',0).attr('cy',+20).attr('r',10).style('fill','#010180');
		// this.svgComponent.append('circle').attr('cx',0).attr('cy',+60).attr('r',10).style('fill','#010180');
		// this.inputs = [];
		// this.connectors = [];
		// this.layerType = 'output';
		// this.id = 'OUT';

		// this.units = 4

		// this.htmlComponent = createParamBox(this.layerType);

		// this.htmlComponent.children[1]
	}
	// updateNumberOfUnits(n){
	// 	if(this.units == n){
	// 		return;
	// 	}
	// 	this.units = n;
	// 	this.svgComponent.remove();
	// 	this.svgComponent = svg.append('g');
	// 	if(this.units > 10){
	// 		this.svgComponent.append('ellipse')
	// 		    .attr('cx', 0)  
	// 		    .attr('cy', 0) 
	// 		    .attr('rx', 10)
	// 		    .attr('ry', 100)
	// 		    .style('fill', '#010180');
	// 	} else {
	// 		for(let pos of [...(new Array(this.units)).keys()].map(x => 120/(this.units-1)*x-60)){
	// 			this.svgComponent.append('circle').attr('cx',0).attr('cy',pos).attr('r',50/this.units).style('fill','#010180');			
	// 		}
	// 	}
	// 	unselect(this);
	// 	makeDraggable(this);
	// 	onresize();
	// }
	// setPosition(x,y){}

	// getPosition(){
	// 	let transformation = this.svgComponent.attr('transform')
	// 	return transformation.substring( transformation.indexOf('(') + 1 , transformation.indexOf(')') ).split(',').map(value => parseInt(value));
	// }
	// getJSON(){
	// 	return {
	//         "layer_name": "Output",
	//         "children_ids": [],
	//         "parent_ids": this.inputs.map(layer => layer.id),
	//         "params": {
	//             "units": 10,
	//             "activation": "softmax"
	//         },
	//         "id": this.id
	//     };
	// }

	// moveToFront(){}
	// snap(){}
}