import { Draggable } from "./draggable";
import { Point, Shape } from "./shape";
import { Activation } from "./activation";
import { windowProperties } from "../window";
import { displayError } from '../error';
import { Layer, ILayerJson } from './layer';


/**
 * Layers that can have an activation attached to them.
 */
export abstract class ActivationLayer extends Layer {
    activation: Activation = null;
    static defaultInitialLocation = new Point(100, 100);

    // Note: The activation will snap to the 0,0 point of an ActivationLayer
    constructor(block: Array<Shape>, defaultLocation=new Point(100,100)) {
        super(block, defaultLocation);

        // Keep track of activationLayers in global state for activation snapping
        windowProperties.activationLayers.add(this);
    }

    public moveAction() {
        super.moveAction();
        if (this.activation != null) {
            let p = this.getPosition();
            this.activation.setPosition(p)
            this.activation.draggedX = this.draggedX
            this.activation.draggedY = this.draggedY
        }
    }

    public raiseGroup() {
        super.raiseGroup()
        if (this.activation != null) { this.activation.raiseGroup()}
    }

    public delete() {
        super.delete();
        // Remove this layer from global state
        windowProperties.activationLayers.delete(this);
        if (this.activation != null) {
            this.activation.delete();
            this.removeActivation();
        }
    }

    public outerBoundingBox(): {top: number, bottom: number, left: number, right: number} {
        let bbox = super.outerBoundingBox();
        if (this.activation != null) {
            let nodeBbox = Draggable.nodeBoundingBox(this.activation.svgComponent.node())

            bbox.top = Math.min(nodeBbox.top, bbox.top)
            bbox.bottom = Math.max(nodeBbox.bottom, bbox.bottom)
            bbox.left = Math.min(nodeBbox.left, bbox.left)
            bbox.right = Math.max(nodeBbox.right, bbox.right)

        }
        return bbox
    }

    public addActivation(activation: Activation) {
        if (this.activation != null && this.activation != activation) {
            this.activation.delete();
        }
        this.activation = activation;
        this.activation.layer = this;
        this.activation.setPosition(this.getPosition());
        this.activation.draggedX = this.draggedX
        this.activation.draggedY = this.draggedY
    }

    public getActivationText(): string {
        return this.activation != null ? this.activation.activationType : null;
    }

    public removeActivation() {
        this.activation = null;
    }

    public toJson(): ILayerJson {
        let json = super.toJson();
        if (this.activation != null) {
            json.params["activation"] = this.activation.activationType;
        }
        return json;
    }

    public generateTfjsLayer(){
        let parameters = this.parameterDefaults;
        let config = this.getParams();
        for (let param in config) {
            parameters[param] = config[param];
        }
        if (this.activation != null) {
            parameters.activation = this.activation.activationType;
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
