import { displayError } from "../error";
import { windowProperties } from "../window";
import { Activation } from "./activation";
import { Draggable } from "./draggable";
import { ILayerJson, Layer } from "./layer";
import { Point, Shape } from "./shape";

/**
 * Layers that can have an activation attached to them.
 */
export abstract class ActivationLayer extends Layer {
    public static defaultInitialLocation: Point = new Point(100, 100);
    public activation: Activation = null;

    // Note: The activation will snap to the 0,0 point of an ActivationLayer
    constructor(block: Shape[], defaultLocation: Point = new Point(100, 100)) {
        super(block, defaultLocation);

        // Keep track of activationLayers in global state for activation snapping
        windowProperties.activationLayers.add(this);
    }

    public moveAction(): void {
        super.moveAction();
        if (this.activation != null) {
            const p = this.getPosition();
            this.activation.setPosition(p);
            this.activation.draggedX = this.draggedX;
            this.activation.draggedY = this.draggedY;
        }
    }

    public raiseGroup(): void {
        super.raiseGroup();
        if (this.activation != null) { this.activation.raiseGroup(); }
    }

    public delete(): void {
        super.delete();
        // Remove this layer from global state
        windowProperties.activationLayers.delete(this);
        if (this.activation != null) {
            this.activation.delete();
            this.removeActivation();
        }
    }

    public outerBoundingBox(): {top: number, bottom: number, left: number, right: number} {
        const bbox = super.outerBoundingBox();
        if (this.activation != null) {
            const nodeBbox = Draggable.nodeBoundingBox(this.activation.svgComponent.node());

            bbox.top = Math.min(nodeBbox.top, bbox.top);
            bbox.bottom = Math.max(nodeBbox.bottom, bbox.bottom);
            bbox.left = Math.min(nodeBbox.left, bbox.left);
            bbox.right = Math.max(nodeBbox.right, bbox.right);

        }
        return bbox;
    }

    public addActivation(activation: Activation): void {
        if (this.activation != null && this.activation !== activation) {
            this.activation.delete();
        }
        this.activation = activation;
        this.activation.layer = this;
        this.activation.setPosition(this.getPosition());
        this.activation.draggedX = this.draggedX;
        this.activation.draggedY = this.draggedY;
    }

    public getActivationText(): string {
        return this.activation != null ? this.activation.activationType : null;
    }

    public removeActivation(): void {
        this.activation = null;
    }

    public toJson(): ILayerJson {
        const json = super.toJson();
        if (this.activation != null) {
            json.params.activation = this.activation.activationType;
        }
        return json;
    }

    public generateTfjsLayer(): void {
        const parameters = this.parameterDefaults;
        const config = this.getParams();
        for (const param of Object.keys(config)) {
            parameters[param] = config[param];
        }
        if (this.activation != null) {
            parameters.activation = this.activation.activationType;
        }

        let parent: Layer = null;

        if (this.parents.size > 1) {
            displayError(new Error("Must use a concatenate when a layer has multiple parents"));
        }

        for (const p of this.parents) { parent = p; break; }
        // Concatenate layers handle fan-in

        this.tfjsLayer = this.tfjsEmptyLayer(parameters).apply(parent.getTfjsLayer());
    }
}
