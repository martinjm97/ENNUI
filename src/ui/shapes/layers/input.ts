import * as tf from '@tensorflow/tfjs';
import { Layer } from "../layer";
import { Point, Rectangle } from "../shape";
import { defaults } from '../../../model/build_network';
import { mnistData } from '../../../model/data';

export class Input extends Layer {
    layerType = "Input"
    readonly tfjsEmptyLayer = tf.input;

    defaultLocation = new Point(100, document.getElementById("svg").getBoundingClientRect().height/2)

	constructor(invisible=false){
        super([new Rectangle(new Point(0,0), 40, 40, '#806CB7')], new Point(100, document.getElementById("svg").getBoundingClientRect().height/2), invisible)
    }
    
    getHoverText(): string { return "Input"; }

    delete() { this.unselect(); }

    public generateTfjsLayer(){ 
        // TODO make this a member variable
        this.tfjsLayer = this.tfjsEmptyLayer({shape: [mnistData.IMAGE_HEIGHT, mnistData.IMAGE_WIDTH, mnistData.IMAGE_CHANNELS]})
    }

    public lineOfPython(): string {
        return `Input(shape=(${mnistData.IMAGE_HEIGHT},${mnistData.IMAGE_WIDTH}, ${mnistData.IMAGE_CHANNELS}))`
    }

    public clone() {
        let newLayer = new Input(true)

        return newLayer
    }
}