import * as tf from '@tensorflow/tfjs';
import { ActivationLayer, Layer } from "../layer";
import { Point, PathShape } from "../shape";

export class Flatten extends Layer {
    layerType = "Flatten";
    readonly tfjsEmptyLayer  = tf.layers.flatten;

    constructor(defaultLocation=Point.randomPoint(100, 40, ActivationLayer.defaultInitialLocation)) {
        super([new PathShape("M-90 -90 h15 v-30 h15 v100 h-15 v-30 h-15 v-40 Z", '#AA222F')], defaultLocation);
    }

    populateParamBox() {}

    getHoverText(): string { return "Flatten" }

    public lineOfPython(): string {
        return `Flatten()`;
    }

    public lineOfJulia(): string {
        let prev_id = this.parents.values().next().value.uid;
        return `reshape(x${prev_id}, :, size(x${prev_id}, 4))`;
    }

    public clone() {
        return new Flatten();
    }
}