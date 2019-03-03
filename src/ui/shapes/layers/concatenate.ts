import * as tf from '@tensorflow/tfjs';
import { ActivationLayer, Layer } from "../layer";
import { Point, PathShape } from "../shape";

export class Concatenate extends Layer {
    layerType = "Concatenate"
    readonly tfjsEmptyLayer = tf.layers.concatenate

    constructor(defaultLocation=Point.randomPoint(100, 40, ActivationLayer.defaultInitialLocation)) {
        super([new PathShape("M-23 -120 h23 v120 h-23 v-120 Z", '#F27493'),
               new PathShape("M-23 -81 h23 v2 h-23 v-2  Z", 'rgba(20, 20, 20, 0.3)'),
               new PathShape("M-23 -41 h23 v2 h-23 v-2  Z", 'rgba(20, 20, 20, 0.3)')], defaultLocation)
    }

    populateParamBox() {}

    getHoverText(): string { return "Concatenate" }

    public lineOfPython(): string {
        return `Concatenate()`
    }

    public initLineOfJulia(): string {
        return `x${this.uid}  = insert!(net, (x) -> vcat(x...))\n`
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