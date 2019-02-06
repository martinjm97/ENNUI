import * as tf from '@tensorflow/tfjs';
import { ActivationLayer } from "../layer";
import { Point, Rectangle } from "../shape";
import { Softmax } from '../activation';

export class Output extends ActivationLayer {
    layerType = "Output";
    readonly tfjsEmptyLayer = tf.layers.dense ;

    defaultLocation = new Point(document.getElementById("svg").getBoundingClientRect().width - 100, document.getElementById("svg").getBoundingClientRect().height/2);

    constructor(invisible=false){
        super([new Rectangle(new Point(-8, -90), 30, 200, '#806CB7')],
               new Point(document.getElementById("svg").getBoundingClientRect().width - 100, 
               document.getElementById("svg").getBoundingClientRect().height/2), invisible);
        
    }

    getHoverText(): string { return "Output" }
    
    delete() { this.unselect(); }

    public lineOfPython(): string {
        return `Dense(10, activation='softmax')`;
    }

    public clone() {
        let newLayer = new Output(true);
        newLayer.paramBox = this.paramBox;
        return newLayer;
    }
}