import * as tf from '@tensorflow/tfjs';
import { Layer } from "../layer";
import { Point, Rectangle } from "../shape";
import { IMAGE_H, IMAGE_W} from '../../../model/data';
import { get_svg_original_bounding_box } from '../../utils';

export class Input extends Layer {
    layerType = "Input"
    readonly tfjsEmptyLayer = tf.input;

    defaultLocation = new Point(100, get_svg_original_bounding_box(document.getElementById("svg")).height/2)

	constructor(){
        super([new Rectangle(new Point(0,0), 40, 40, '#806CB7')], new Point(100, get_svg_original_bounding_box(document.getElementById("svg")).height/2))
    }

    getHoverText(): string { return "Input"; }

    delete() { this.unselect(); }

    public generateTfjsLayer(){
        // TODO make this a member variable
        this.tfjsLayer = this.tfjsEmptyLayer({shape: [IMAGE_H, IMAGE_W, 1]})
    }

    public lineOfPython(): string {
        return `Input(shape=(${IMAGE_H},${IMAGE_W}, 1))`
    }

    public lineOfJulia(): string {
        return `input`
    }

    public clone() {
        let newLayer = new Input()

        return newLayer
    }
}