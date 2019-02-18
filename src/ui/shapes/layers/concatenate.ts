import * as tf from '@tensorflow/tfjs';
import { ActivationLayer, Layer } from "../layer";
import { Point, PathShape } from "../shape";

export class Concatenate extends Layer {
    layerType = "Concatenate"
    readonly tfjsEmptyLayer = tf.layers.concatenate

    constructor(defaultLocation=Point.randomPoint(100, 40, ActivationLayer.defaultInitialLocation)) {
        super([new PathShape("M0 0 h23 v120 h-23 v-120 Z", '#F27493'), 
               new PathShape("M0 38 h23 v4 h-23 v-4  Z", 'rgba(20, 20, 20, 0.35)'),
               new PathShape("M0 78 h23 v4 h-23 v-4  Z", 'rgba(20, 20, 20, 0.2)')], defaultLocation)
    }

    populateParamBox() {}

    getHoverText(): string { return "Concatenate" }

    public lineOfPython(): string {
        return `Concatenate()`
    }

    public lineOfJulia(): string {
        return `vcat(${[...this.parents].map(p => "x" + p.uid).join(", ")})`
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