import * as tf from '@tensorflow/tfjs';
import { Layer } from "../layer";
import { Point, Rectangle } from "../shape";
import { IMAGE_H, IMAGE_W} from '../../../model/data';

export class Input extends Layer {
    layerType = "Input"
    readonly tfjsEmptyLayer = tf.input;

    defaultLocation = new Point(100, document.getElementById("svg").getBoundingClientRect().height/2)

	constructor(){
        super([new Rectangle(new Point(0,0), 40, 40, '#806CB7')], new Point(100, document.getElementById("svg").getBoundingClientRect().height/2))
    }

    getHoverText(): string { return "Input"; }

    delete() { this.unselect(); }

    public generateTfjsLayer(){
        // TODO make this a member variable
        this.tfjsLayer = this.tfjsEmptyLayer({shape: [IMAGE_H, IMAGE_W, 1]});
    }

    public lineOfPython(): string {
        return `Input(shape=(${IMAGE_H},${IMAGE_W}, 1))`;
    }

    public initLineOfJulia(): string {
        return `x${this.uid} = insert!(net, (shape) -> x -> x)\n`;
    }

    public clone() {
        let newLayer = new Input();

        return newLayer;
    }
}