import * as tf from '@tensorflow/tfjs';
import { ActivationLayer, Layer } from "../layer";
import { Point, PathShape, Circle, Line } from "../shape";
import { displayError } from '../../error';

export class Add extends ActivationLayer {
    layerType = "Add"
    readonly tfjsEmptyLayer = tf.layers.add

    constructor(defaultLocation=Point.randomPoint(100, 40, ActivationLayer.defaultInitialLocation)) {
        super([new PathShape("m10,10 v-10 h-10 v10 a30,30 0 1,1 10,0Z", '#4a4'),
               new Line(new Point(-10, -20), new Point(20, -20), 4, '#000'),
               new Line(new Point(5, -35), new Point(5, -5), 4, '#000')], defaultLocation)
        // Path for Layer plus: m15,10 h-5 v-10 h-10 v10 h-5 v-20 h-20 v-20 h20 v-20 h20 v20 h20 v20 h-20 v20Z
            
    }

    populateParamBox() {}

    getHoverText(): string { return "Add" }

    public lineOfPython(): string {
        return `Add()`
    }

    public initLineOfJulia(): string {
        displayError(Error("Export to Julia does not support Add Layers"))
        throw Error;
    }

    public generateTfjsLayer(){
        // Concatenate layers handle fan-in
        let parents = []
        for (let parent of this.parents) {
            parents.push(parent.getTfjsLayer())
        }
        this.tfjsLayer = <tf.SymbolicTensor> this.tfjsEmptyLayer().apply(parents);
    }

    public clone() {
        let newLayer = new Add()
        return newLayer

    }
}