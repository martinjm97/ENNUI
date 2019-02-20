import * as tf from '@tensorflow/tfjs';
import { Draggable } from "./draggable";
import { Point, Shape } from "./shape";
import { Activation } from "./activation";
import { Wire } from "./wire";
import * as d3 from "d3";
import { windowProperties } from "../window";
import { parseString } from "../utils";
import { defaults} from '../../model/build_network';
import { displayError } from '../error';
import { stratify } from 'd3';

export interface LayerJson {
    layer_name: string
    id: number
    children_ids: Array<number>
    parent_ids: Array<number>
    params: Map<string, any>
    xPosition: number
    yPosition: number
}

// TODO params for entering things in UI for layer properties

export abstract class Layer extends Draggable {
    layerType: string = ""; // TODO change this
    protected tfjsLayer: tf.SymbolicTensor;
    protected readonly tfjsEmptyLayer;
    paramBox;

    block: Array<Shape>;
    children: Set<Layer> = new Set();
    parents: Set<Layer> = new Set();
    wires: Set<Wire> = new Set();
    wireCircle: d3.Selection<SVGGraphicsElement, {}, HTMLElement, any>;
    wireCircleSelected: boolean = false;
    static nextID: number = 0;
    uid: number;
    abstract lineOfPython(): string;
    abstract lineOfJulia(): string;
    abstract clone(): Layer;

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

        if(this.layerType == "Output"){
            this.wireCircle.style("display", "none")
        }

        this.wireCircle.on("click", () => {
            this.wireCircleSelected = true
            this.wireCircle.style("stroke", "red")
        })

        this.paramBox = document.createElement('div')
        this.paramBox.className = 'parambox'
        this.paramBox.style.visibility = 'hidden'
        this.paramBox.style.position = 'absolute'
        this.paramBox.style.position = 'absolute'
        this.paramBox.style.position = 'absolute'
        document.getElementById("paramtruck").appendChild(this.paramBox);

        this.populateParamBox()

        

    }

    populateParamBox() {}

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
        for (let wire of this.wires) {
            wire.raise()
        }
        super.select()
        this.wireCircle.style("visibility", "visible")
        document.getElementById("defaultparambox").style.display = "none"
        this.paramBox.style.visibility = 'visible'
        this.svgComponent.selectAll("path").style("stroke", "yellow").style("stroke-width", "2")
    }

    public unselect() {
        super.unselect()
        this.wireCircle.style("visibility", "hidden")
        this.wireCircleSelected = false
        this.wireCircle.style("stroke", null)
        document.getElementById("defaultparambox").style.display = null
        this.paramBox.style.visibility = 'hidden'
        this.svgComponent.selectAll("path").style("stroke", null).style("stroke-width", null)
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

    /**
     * Add a parent layer of this node (predecessor).
     * @param parent the layer pointed to by the given wire
     */
    public addParent(parent: Layer) {
        parent.addChild(this)
    }

    public delete() {
        super.delete()
        this.wires.forEach((w) => w.delete()) // deleting wires should delete layer connection sets
    }

    public toJson(): LayerJson {
        return {
            "layer_name": this.layerType,
            "children_ids": Array.from(this.children, child => child.uid),
            "parent_ids": Array.from(this.parents, parent => parent.uid),
            "params": this.getParams(),
            "id": this.uid,
            "xPosition": this.getPosition().x,
            "yPosition": this.getPosition().y,
        }
    }

    public getParams(): Map<string, any> {
        let params: Map<string, any> = new Map()
        let defaultParams  = defaults.get(this.layerType);
        for(let line of this.paramBox.children){
			let name  = line.children[0].getAttribute('data-name');
            let value = line.children[1].value;

            // Need to not parse as integer for float parameters            
            if ((defaultParams[name].toString()).indexOf('.') >= 0) {
                params[name] = parseFloat(value);
            }

            else {
                params[name] = parseString(value);
            }
            
        }
        return params
    }

    public setParams(params: Map<string, any>) {
        for(let line of this.paramBox.children){
            let name = line.children[0].getAttribute('data-name');
			line.children[1].value = params[name];
        }
    }

    public focusing() {
        for(let line of this.paramBox.children){
            line.children[1].onfocus = this.toggleFocus.bind(line.children[1]);
            line.children[1].onblur = this.toggleFocus.bind(line.children[1]);
        }
    }

    public toggleFocus(textField) {
        textField.target.classList.toggle("focusParam");
    }
    /**
     * Make parent -> this become parent -> layer -> this.
     * @param layer a layer that will become the new parent
     * @param parent a parent of this
     */
    public addParentLayerBetween(layer: Layer, parent: Layer) {
        parent.children.delete(this)
        parent.children.add(layer)

        layer.parents.add(parent)
        layer.children.add(this)

        this.parents.delete(parent)
        this.parents.add(layer)
    }


    /**
     * Make parents -> this become parents -> layer -> this.
     * @param parent a parent of this
     */
    public addParentLayer(layer: Layer) {
        for (let parent of this.parents) {
            parent.children.delete(this)
            parent.children.add(layer)
        }

        layer.parents = new Set([...layer.parents, ...this.parents])
        layer.children.add(this)

        this.parents.clear()
        this.parents.add(layer)
    }

    /**
     * Make new child -> this become this -> newChild -> old children.
     * @param newChild a new child of this
     */
    public addChildLayerBetween(newChild: Layer){
        for (let child of this.children){
            newChild.addChild(child)
            child.parents.delete(this)
        }
        this.children.clear()
        this.addChild(newChild)
        newChild.addParent(this)
    }

    public getTfjsLayer(){
        return this.tfjsLayer
    }

    public generateTfjsLayer(){
        // TODO change defaults to class level
        let parameters = defaults.get(this.layerType)
        let config = this.getParams()
        for (let param in config) {
            parameters[param] = config[param]
        }
        let parent:Layer = null
        for (let p of this.parents){ parent = p; break }
        // Concatenate layers handle fan-in

        if (this.parents.size > 1) {
            displayError(new Error("Must use a concatenate when a layer has multiple parents"));
        }
        
        this.tfjsLayer = this.tfjsEmptyLayer(parameters).apply(parent.getTfjsLayer())
    }

    public hasParentType(type){
        for (let p of this.parents){
            if (p instanceof type){
                return true
            }
        }

        return false;
    }

}

/**
 * Layers that can have an activation attached to them.
 */
export abstract class ActivationLayer extends Layer {
    activation: Activation = null;
    static defaultInitialLocation = new Point(100,100)

    // Note: The activation will snap to the 0,0 point of an ActivationLayer
    constructor(block: Array<Shape>, defaultLocation=new Point(100,100)) {
        super(block, defaultLocation)

        // Keep track of activationLayers in global state for activation snapping
        windowProperties.activationLayers.add(this)
    }


    public dragAction(d) {
        super.dragAction(d)
        if (this.activation != null) {
            let p = this.getPosition()
            this.activation.svgComponent.attr("transform", "translate(" + (p.x) + "," + (p.y) + ")")
        }
    }

    public select() {
        super.select()
        if (this.activation != null) {
            this.activation.svgComponent.raise()
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
        if (this.activation != null && this.activation != activation) {
            this.activation.delete();
            this.activation.layer = null
        }
        this.activation = activation
        this.activation.setPosition(this.getPosition())
    }

    public getActivationText(): string {
        return this.activation != null ? this.activation.activationType : "relu";
    }

    public removeActivation() {
        this.activation = null
    }

    public toJson(): LayerJson {
        let json = super.toJson()
        if (this.activation != null) {
            json.params["activation"] = this.activation.activationType
        }
        return json
    }

    public generateTfjsLayer(){
        // TODO change defaults to class level
        let parameters = defaults.get(this.layerType)
        let config = this.getParams()
        for (let param in config) {
            parameters[param] = config[param]
        }

        if (this.activation != null) {
            parameters.activation = this.activation.activationType
        }

        let parent:Layer = null

        if (this.parents.size > 1) {
            displayError(new Error("Must use a concatenate when a layer has multiple parents"));
        }

        for (let p of this.parents){ parent = p; break }
        // Concatenate layers handle fan-in

        
        this.tfjsLayer = this.tfjsEmptyLayer(parameters).apply(parent.getTfjsLayer());
    }
}
