import * as tf from '@tensorflow/tfjs';
import { ActivationLayer, Layer } from "../layer";
import { Point, Rectangle } from "../shape";
import { Softmax } from '../activation';
import { displayError } from '../../error';

export class Output extends ActivationLayer {
    layerType = "Output";
    readonly tfjsEmptyLayer = tf.layers.dense ;

    defaultLocation = new Point(document.getElementById("svg").getBoundingClientRect().width - 100, document.getElementById("svg").getBoundingClientRect().height/2);
    constructor(){
        super([new Rectangle(new Point(-8, -90), 30, 200, '#806CB7')],
               new Point(document.getElementById("svg").getBoundingClientRect().width - 100,
               document.getElementById("svg").getBoundingClientRect().height/2));

    }

    getHoverText(): string { return "Output" }

    delete() { this.unselect(); }

    public lineOfPython(): string {
        return `Dense(10, activation='softmax')`;
    }

    public initLineOfJulia(): string {
        let init = `x${this.uid} = insert!(net, (shape) -> Dense(shape[1], 10))\n`
        init += `x${this.uid} = insert!(net, (shape) -> (x) -> softmax(x))`
        return init
    }

    public clone() {
        let newLayer = new Output();
        newLayer.paramBox = this.paramBox;
        return newLayer;
    }

    public addChild(child: Layer) {
        displayError(new Error("Output cannot have children. "))
    }
}