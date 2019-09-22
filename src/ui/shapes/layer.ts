import * as tf from "@tensorflow/tfjs";
import * as d3 from "d3";
import { generateTfjsModel, topologicalSort} from "../../model/build_network";
import { changeDataset } from "../../model/data";
import { svgData } from "../app";
import { displayError } from "../error";
import { parseString } from "../utils";
import { windowProperties } from "../window";
import { Draggable } from "./draggable";
import { Point, Shape } from "./shape";
import { Wire } from "./wire";

export interface ILayerJson {
    layer_name: string;
    id: number;
    children_ids: number[];
    parent_ids: number[];
    params: any;
    xPosition: number;
    yPosition: number;
}

// TODO params for entering things in UI for layer properties

export abstract class Layer extends Draggable {

    public static getNextID(): number {
        const id = Layer.nextID;
        Layer.nextID += 1;
        return id;
    }

    private static nextID: number = 0;
    public layerType: string = ""; // TODO change this
    public parameterDefaults: any;
    public children: Set<Layer> = new Set();
    public parents: Set<Layer> = new Set();
    public wires: Set<Wire> = new Set();
    public uid: number;
    public shape: number[];  // The shape/dimensions of the layer.

    public readonly outputWiresAllowed: boolean = true;
    public readonly wireGuidePresent: boolean = true;
    protected tfjsLayer: tf.SymbolicTensor;

    protected readonly tfjsEmptyLayer: (config: any) => any;
    protected paramBox: HTMLElement;
    private selectText: any = d3.select("body")
                        .append("div")
                        .style("position", "absolute")
                        .style("padding", "6px")
                        .style("background", "rgba(0, 0, 0, 0.8)")
                        .style("color", "#eee")
                        .style("border-radius", "2px")
                        .style("display", "none")
                        .style("font-family", "Helvetica")
                        .style("user-select", "none");

    private block: Shape[];

    constructor(block: Shape[], defaultLocation: Point) {
        super(defaultLocation);
        this.uid = Layer.nextID;
        Layer.nextID += 1;
        this.block = block;

        for (const rect of this.block) {
            this.svgComponent.call(rect.svgAppender.bind(rect));
        }

        this.paramBox = document.createElement("div");
        this.paramBox.className = "parambox";
        this.paramBox.style.visibility = "hidden";
        this.paramBox.style.position = "absolute";
        document.getElementById("paramtruck").appendChild(this.paramBox);

        this.svgComponent.on("click", () => {
                             this.select();
                             window.clearTimeout(this.moveTimeout);
                             this.hoverText.style("visibility", "hidden");
                        });
        this.populateParamBox();
    }
    public abstract lineOfPython(): string;
    public abstract getHoverText(): string;
    public abstract clone(): Layer;

    public moveAction(): void {
        for (const wire of this.wires) {
            wire.updatePosition();
        }

        if (windowProperties.selectedElement === this) {
            windowProperties.shapeTextBox.setPosition(this.getPosition());
        }
    }

    public raise(): void {
        this.wires.forEach((w) => w.raiseGroup());
        this.parents.forEach((p) => p.raiseGroup());
        this.children.forEach((c) => c.raiseGroup());
        this.raiseGroup();
    }

    public select(): void {
        const currSelected = windowProperties.selectedElement;
        if (currSelected != null && currSelected !== this &&
                currSelected instanceof Layer && currSelected.outputWiresAllowed) {
            currSelected.addChild(this);
        }
        super.select();
        document.getElementById("defaultparambox").style.display = "none";
        this.paramBox.style.visibility = "visible";
        this.svgComponent.selectAll("path").style("stroke", "yellow").style("stroke-width", "2");
        this.svgComponent.selectAll(".outerShape").style("stroke", "yellow").style("stroke-width", "2");

        const bbox = this.outerBoundingBox();
        windowProperties.shapeTextBox.setOffset(new Point((bbox.left + bbox.right) / 2, bbox.bottom + 25));
        windowProperties.shapeTextBox.setText("[" + this.layerShape().toString() + "]");
        windowProperties.shapeTextBox.setPosition(this.getPosition());
        windowProperties.shapeTextBox.show();
    }

    public unselect(): void {
        super.unselect();
        document.getElementById("defaultparambox").style.display = null;
        this.paramBox.style.visibility = "hidden";
        this.svgComponent.selectAll("path").style("stroke", null).style("stroke-width", null);
        this.svgComponent.selectAll(".outerShape").style("stroke", null).style("stroke-width", null);
        this.selectText.style("visibility", "hidden");
        windowProperties.shapeTextBox.hide();

    }

    /**
     * Add a child layer of this node (successor).
     * @param child the layer pointed to by the given wire
     */
    public addChild(child: Layer): void {
        if (!this.children.has(child) && !child.children.has(this)) {
            this.children.add(child);
            child.parents.add(this);

            const newWire = new Wire(this, child);
            this.wires.add(newWire);
            child.wires.add(newWire);

        }
    }

    /**
     * Add a parent layer of this node (predecessor).
     * @param parent the layer pointed to by the given wire
     */
    public addParent(parent: Layer): void {
        parent.addChild(this);
    }

    public delete(): void {
        super.delete();
        this.wires.forEach((w) => w.delete()); // deleting wires should delete layer connection sets
    }

    public toJson(): ILayerJson {
        return {
            children_ids: Array.from(this.children, (child) => child.uid),
            id: this.uid,
            layer_name: this.layerType,
            params: this.getJSONParams(),
            parent_ids: Array.from(this.parents, (parent) => parent.uid),
            xPosition: this.getPosition().x,
            yPosition: this.getPosition().y,
        };
    }

    public getJSONParams(): { [key: string]: any } {
        const params: { [key: string]: any } = {};
        const defaultParams = this.parameterDefaults;
        for (const line of this.paramBox.children) {
            const name = line.children[0].getAttribute("data-name");
            if (line.children[1].className === "select") {
                const selectElement: HTMLSelectElement =  line.children[1].children[0] as HTMLSelectElement;
                params[name] = selectElement.options[selectElement.selectedIndex].value;
            } else {
                const value = ( line.children[1] as HTMLInputElement).value;
                // Need to not parse as integer for float parameters
                if ((defaultParams[name].toString()).indexOf(".") >= 0) {
                    params[name] = parseFloat(value);
                } else {
                    params[name] = parseString(value);
                }
            }
        }
        return params;
    }

    public getParams(): { [key: string]: any; } {
        const params: { [key: string]: any } = {};
        const defaultParams = this.parameterDefaults;
        for (const line of this.paramBox.children) {
            const name = line.children[0].getAttribute("data-name");
            if (line.children[1].className === "select") {
                const selectElement: HTMLSelectElement =  line.children[1].children[0] as HTMLSelectElement;
                params[name] = selectElement.options[selectElement.selectedIndex].value;
            } else {
                const value = ( line.children[1] as HTMLInputElement).value;
                // Need to not parse as integer for float parameters
                if ((defaultParams[name].toString()).indexOf(".") >= 0) {
                    params[name] = parseFloat(value);
                } else {
                    params[name] = parseString(value);
                }
            }
        }
        return params;
    }

    public setParams(params: Map<string, any>): void {
        for (const line of this.paramBox.children) {
            const name = line.children[0].getAttribute("data-name");
            if (line.children[1].className === "select") {
                const selectElement: HTMLSelectElement =  line.children[1].children[0] as HTMLSelectElement;
                // Get index with the correct value and select it
                for (let i = 0; i < selectElement.options.length; i++) {
                    if (selectElement.options.item(i).value === params.get(name)) {
                        selectElement.selectedIndex = i;
                        break;
                    }
                }
            } else {
                ( line.children[1] as HTMLInputElement).value = params.get(name);
            }
        }
    }

    /**
     * Make parent -> this become parent -> layer -> this.
     * @param layer a layer that will become the new parent
     * @param parent a parent of this
     */
    public addParentLayerBetween(layer: Layer, parent: Layer): void {
        parent.children.delete(this);
        parent.children.add(layer);

        layer.parents.add(parent);
        layer.children.add(this);

        this.parents.delete(parent);
        this.parents.add(layer);
    }

    /**
     * Make parents -> this become parents -> layer -> this.
     * @param parent a parent of this
     */
    public addParentLayer(layer: Layer): void {
        for (const parent of this.parents) {
            parent.children.delete(this);
            parent.children.add(layer);
        }

        layer.parents = new Set([...layer.parents, ...this.parents]);
        layer.children.add(this);

        this.parents.clear();
        this.parents.add(layer);
    }

    /**
     * Make new child -> this become this -> newChild -> old children.
     * @param newChild a new child of this
     */
    public addChildLayerBetween(newChild: Layer): void {
        for (const child of this.children) {
            newChild.addChild(child);
            child.parents.delete(this);
        }
        this.children.clear();
        this.addChild(newChild);
        newChild.addParent(this);
    }

    public getTfjsLayer(): tf.SymbolicTensor {
        return this.tfjsLayer;
    }

    public generateTfjsLayer(): void {
        // TODO change defaults to class level
        const parameters = this.getParams();

        let parent: Layer = null;
        for (const p of this.parents) { parent = p; break; }
        // Concatenate layers handle fan-in

        if (this.parents.size > 1) {
            displayError(new Error("Must use a concatenate when a layer has multiple parents"));
        }

        this.tfjsLayer = this.tfjsEmptyLayer(parameters).apply(parent.getTfjsLayer());
    }

    public layerShape(): number[] {
        // Computes all of the predecessors to determine shape
        if (this.layerType === "Input") {
            changeDataset(svgData.input.getParams().dataset);
        }
        try {
            generateTfjsModel(topologicalSort(svgData.input, false));
            return this.getTfjsLayer().shape;
        } catch (err) {  // Hide errors while building the network
            return null;
        }
    }

    public initLineOfJulia(): string {
        return "";
    }

    public lineOfJulia(): string {
        let connections = "";
        for (const child of this.children) {
            connections += `connect!(net, x${this.uid}, x${child.uid})\n`;
        }
        return connections;
    }

    public hasParentType(type: any ): boolean {
        for (const p of this.parents) {
            if (p instanceof type) {
                return true;
            }
        }

        return false;
    }

    protected abstract populateParamBox(): void;

    protected focusing(): void {
        for (const line of this.paramBox.children) {
            ( line.children[1] as HTMLInputElement).onfocus = this.toggleFocus.bind(line.children[1]);
            ( line.children[1] as HTMLInputElement).onblur = this.toggleFocus.bind(line.children[1]);
        }
    }

    private toggleFocus(textField: any): void {
        textField.target.classList.toggle("focusParam");
    }

}
