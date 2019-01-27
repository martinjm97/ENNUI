import * as tf from '@tensorflow/tfjs';
import { ActivationLayer, Layer } from "../layer";
import { Point } from "../shape";

export class Flatten extends Layer {
    layerType = "Flatten"
    readonly tfjsEmptyLayer  = tf.layers.flatten

    constructor(defaultLocation=Point.randomPoint(100, 40, ActivationLayer.defaultInitialLocation)) {
        super([], defaultLocation)
    }

    populateParamBox() {}

    getHoverText(): string { return "Flatten" }

    public lineOfPython(): string {
        return `Flatten()`
    }
}