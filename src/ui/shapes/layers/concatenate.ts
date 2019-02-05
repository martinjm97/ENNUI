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
    public generateTfjsLayer(){
        // Concatenate layers handle fan-in
        let parents = []
        for (let parent of this.parents) {
            parents.push(parent.getTfjsLayer())
        }
        this.tfjsLayer = <tf.SymbolicTensor> this.tfjsEmptyLayer().apply(parents)
    }

    public clone() {
        let newLayer = new Concatenate()
        // newLayer.paramBox = this.paramBox
        
        return newLayer

    }
}