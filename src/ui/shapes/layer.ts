import { Draggable } from "./draggable";
import { Rectangle, Point, Shape, Circle } from "./shape";
import { Activation } from "./activation";
import { Wire } from "./wire";
import * as d3 from "d3";
import { windowProperties } from "../window";
import { parseString } from "../utils";

// TODO params for entering things in UI for layer properties
// TODO make holes transparent
// TODO make dragging bring item to front
// TODO make transparent holes not terrible

export abstract class Layer extends Draggable {
    abstract wireConnectionPoints: Array<Point>;
    abstract layerType: String;
    paramBox;
    
    block: Array<Shape>;
    children: Set<Layer> = new Set();
    parents: Set<Layer> = new Set();
    wires: Set<Wire> = new Set();
    wireCircle: d3.Selection<SVGGraphicsElement, {}, HTMLElement, any>;
    wireCircleSelected: boolean = false;
    static nextID: number = 0;
    uid: number;

    constructor(block: Array<Shape>, defaultLocation) { 
        super(defaultLocation)
        this.uid = Layer.nextID
        Layer.nextID += 1
        this.block = block
        for (let rect of this.block) {
            this.svgComponent.call(rect.svgAppender.bind(rect))
        }
        this.wireCircle = this.svgComponent.append<SVGGraphicsElement>("circle")
                                           .attr("cx", this.center().x)
                                           .attr("cy", this.center().y)
                                           .attr("r", 10)
                                           .style("fill", "black")
                                           .style("stroke-width", "4")
                                           .style("visibility", "hidden")
        
        this.wireCircle.on("click", () => {
            this.wireCircleSelected = true
            this.wireCircle.style("stroke", "red")
        })

        this.paramBox = document.createElement('div')
        this.paramBox.className = 'parambox'
        this.paramBox.style.visibility = 'hidden'
	    this.paramBox.style.position = 'absolute'	
        document.getElementById("paramtruck").appendChild(this.paramBox);
    }

    public dragAction(d) { 
        for (let wire of this.wires) {
            wire.updatePosition()
        }
    }

    public select() {
        let currSelected = windowProperties.selectedElement;
        if (currSelected != null && currSelected !== this && currSelected instanceof Layer && currSelected.wireCircleSelected) {
            currSelected.addChild(this)
        }
        super.select()
        this.wireCircle.style("visibility", "visible")
        this.paramBox.style.visibility = 'visible'
    }

    public unselect() {
        super.unselect()
        this.wireCircle.style("visibility", "hidden")
        this.wireCircleSelected = false
        this.wireCircle.style("stroke", null)
        this.paramBox.style.visibility = 'hidden'
    }

    /**
     * Add a child layer of this node (successor).
     * @param child the layer pointed to by the given wire
     */
    public addChild(child: Layer) {
        if (!this.children.has(child) && !child.children.has(this)) {
            this.children.add(child)
            child.parents.add(this)

            let newWire = new Wire(this, child)
            this.wires.add(newWire)
            child.wires.add(newWire)
        }
    }

    public delete() {
        super.delete()
        this.wires.forEach((w) => w.delete()) // deleting wires should delete layer connection sets
    }

    public toJson() {
        return {
            "layer_name": this.layerType,
            "children_ids": Array.from(this.children, child => child.uid),
            "parent_ids": Array.from(this.parents, parent => parent.uid),
            "params": this.getParams(),
            "id": this.uid
        }
    }

    public getParams() {
        let params = {}
        for(let line of this.paramBox.children){
			let name = line.children[0].getAttribute('data-name');
			let value = line.children[1].value;
			params[name] = parseString(value);
        }
        return params
    }
}

/**
 * Layers that can have an activation attached to them.
 */
export abstract class ActivationLayer extends Layer {
    hole = new Rectangle(new Point(0, 0), 10, 10, '#eee')
    activation: Activation = null;

    constructor(block: Array<Shape>, defaultLocation=new Point(100,100)) { 
        super(block, defaultLocation)

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
            .attr("width", this.hole.width * 1.5)
            .attr("height", this.hole.height * 1.5)

        d3.select(lastBlock).attr("mask", "url(#hole"+this.uid+")");
    }


    public dragAction(d) {
        super.dragAction(d)
        if (this.activation != null) {
            let p = this.getPosition()
            this.activation.svgComponent.attr("transform", "translate(" + (p.x) + ","
            + (p.y) + ")").data([{"x": p.x, "y": p.y}])
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
        activation.svgComponent.attr("transform", "translate(" + (p.x) + "," + (p.y) + ")")
    }

    public removeActivation() {
        this.activation = null
    }

    public toJson() {
        let json = super.toJson()
        if (this.activation != null) {
            json.params["activation"] = this.activation.activationType
        }
        return json
    }
}

export class Conv2D extends ActivationLayer {
    layerType = "Conv2D"
    static readonly blockSize: number = 50;
    wireConnectionPoints = [new Point(-20, -40), new Point(5, -40), new Point(5, -15), new Point(-20, -15)]

    constructor() {
        super([new Rectangle(new Point(-54, -80), Conv2D.blockSize, Conv2D.blockSize, '#3B6B88'),
               new Rectangle(new Point(-37, -60), Conv2D.blockSize, Conv2D.blockSize, '#3B7B88'),
               new Rectangle(new Point(-20, -40), Conv2D.blockSize, Conv2D.blockSize, '#3B8B88')])

        
        // TODO: setting parameters logic should be pulled out into helper
        let line1 = document.createElement('div')
        line1.className = 'paramline'
    
        let name1 = document.createElement('div')
        name1.className = 'paramname'
        name1.innerHTML = 'Filters:'
        name1.setAttribute('data-name','filters')
    
        let value1 = document.createElement('input')
        value1.className = 'paramvalue'
        value1.value = '64'
    
        line1.appendChild(name1);
        line1.appendChild(value1);
    
        this.paramBox.append(line1);
    
        let line2 = document.createElement('div')
        line2.className = 'paramline'
        let name2 = document.createElement('div')
        name2.className = 'paramname'
        name2.innerHTML = 'Kernel size:'
        name2.setAttribute('data-name','kernel_size')
        let value2 = document.createElement('input')
        value2.className = 'paramvalue'
        value2.value = '(5, 5)'
        line2.appendChild(name2);
        line2.appendChild(value2);
        this.paramBox.append(line2);
    
        let line3 = document.createElement('div')
        line3.className = 'paramline'
        let name3 = document.createElement('div')
        name3.className = 'paramname'
        name3.innerHTML = 'Stride:'
        name3.setAttribute('data-name','strides')
        let value3 = document.createElement('input')
        value3.className = 'paramvalue'
        value3.value = '(2, 2)'
        line3.appendChild(name3);
        line3.appendChild(value3);
        this.paramBox.append(line3);
    }

    public getHoverText(): string { return "Conv" }

}

export class Dense extends ActivationLayer {
    layerType = "Dense"
    wireConnectionPoints = [new Point(5, -70), new Point(5, -40), new Point(5, -10)]
    constructor() {
        super([new Rectangle(new Point(-8, -90), 26, 100, '#F7473B')])

        let line = document.createElement('div')
        line.className = 'paramline'
        let name = document.createElement('div')
        name.className = 'paramname'
        name.innerHTML = 'Units:'
        name.setAttribute('data-name','units')
        let value = document.createElement('input')
        value.className = 'paramvalue'
        value.value = '64'
        line.appendChild(name);
        line.appendChild(value);
        this.paramBox.append(line);
    }

    getHoverText(): string { return "Dense" }

} 

export class MaxPooling2D extends ActivationLayer {
    layerType = "MaxPooling2D"
    static readonly blockSize: number = 30;
    wireConnectionPoints = [new Point(-10, -20), new Point(-10, -5), new Point(5, -5), new Point(5, -20)]

    constructor() {
        super([new Rectangle(new Point(-44, -60), MaxPooling2D.blockSize, MaxPooling2D.blockSize, '#F78114'),
               new Rectangle(new Point(-27, -40), MaxPooling2D.blockSize, MaxPooling2D.blockSize, '#F78134'),
               new Rectangle(new Point(-10, -20), MaxPooling2D.blockSize, MaxPooling2D.blockSize, '#F78154')])

        let line = document.createElement('div')
        line.className = 'paramline'
        let name = document.createElement('div')
        name.className = 'paramname'
        name.innerHTML = 'Pool size:'
        name.setAttribute('data-name','poolSize')
        let value = document.createElement('input')
        value.className = 'paramvalue'
        value.value = '(2,2)';
        line.appendChild(name);
        line.appendChild(value);
        this.paramBox.append(line);
    }

    getHoverText(): string { return "maxpool" }

}

export class Input extends Layer {
    layerType = "Input"
    wireConnectionPoints = [new Point(20, 10), new Point(20, 30)]

	constructor(){
        super([new Rectangle(new Point(0,0), 40, 40, '#806CB7')], new Point(100, 400))
    }
    
    getHoverText(): string { return "Input" }

    delete() {}
}

export class Output extends Layer {
    layerType = "Output";
    wireConnectionPoints = [new Point(0, -60), new Point(0, 0), new Point(0, 60)]

    constructor(){
        super([new Rectangle(new Point(-8, -90), 30, 200, '#806CB7')], new Point(document.getElementById("svg").clientWidth - 100, 400))

        this.wireCircle.style("display", "none")

    }

    getHoverText(): string { return "Output" }
    
    delete() {}
}