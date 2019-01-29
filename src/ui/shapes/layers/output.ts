import * as tf from '@tensorflow/tfjs';
import { ActivationLayer } from "../layer";
import { Point, Rectangle } from "../shape";
import { Softmax } from '../activation';

export class Output extends ActivationLayer {
    layerType = "Output"
    readonly tfjsEmptyLayer = tf.layers.dense 

    defaultLocation = new Point(document.getElementById("svg").clientWidth - 100, document.getElementById("svg").clientHeight/2)

    constructor(){
        super([new Rectangle(new Point(-8, -90), 30, 200, '#806CB7')],
               new Point(document.getElementById("svg").clientWidth - 100, document.getElementById("svg").clientHeight/2))
        
        this.wireCircle.style("display", "none")

    }

    getHoverText(): string { return "Output" }
    
    delete() {}

    public lineOfPython(): string {
        return `Dense(10, activation='softmax')`
    }
}