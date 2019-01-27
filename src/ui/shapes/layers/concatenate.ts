import * as tf from '@tensorflow/tfjs';
import { ActivationLayer, Layer } from "../layer";
import { Point } from "../shape";

export class Concatenate extends Layer {
    layerType = "Concatenate"
    readonly tfjsEmptyLayer = tf.layers.concatenate

    constructor(defaultLocation=Point.randomPoint(100, 40, ActivationLayer.defaultInitialLocation)) {
        super([], defaultLocation)
    }

    populateParamBox() {}

    getHoverText(): string { return "Concatenate" }

    public lineOfPython(): string {
        return `Concatenate()`
    }
}