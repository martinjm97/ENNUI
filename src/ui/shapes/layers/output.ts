import * as tf from '@tensorflow/tfjs';
import { ActivationLayer, Layer } from "../layer";
import { Point, Rectangle } from "../shape";
import { displayError } from '../../error';
import { get_svg_original_bounding_box } from '../../utils';

export class Output extends ActivationLayer {
    layerType = "Output";
    readonly tfjsEmptyLayer = tf.layers.dense ;
    private juliaFinalLineId = null;
    readonly outputWiresAllowed: boolean = false;

    defaultLocation = new Point(get_svg_original_bounding_box(document.getElementById("svg")).width - 100, get_svg_original_bounding_box(document.getElementById("svg")).height/2);
    constructor(){
        super([new Rectangle(new Point(-8, -90), 30, 200, '#806CB7')],
               new Point(get_svg_original_bounding_box(document.getElementById("svg")).width - 100,
               get_svg_original_bounding_box(document.getElementById("svg")).height/2));

    }

    getHoverText(): string { return "Output"; }

    delete() { this.unselect(); }

    public lineOfPython(): string {
        return `Dense(10, activation='softmax')`;
    }

    public initLineOfJulia(): string {
        let init = `x${this.uid} = insert!(net, (shape) -> Dense(shape[1], 10))\n`;
        if (this.juliaFinalLineId == null) {
            this.juliaFinalLineId = Layer.getNextID()
        }
        init += `x${this.juliaFinalLineId} = insert!(net, (shape) -> (x) -> softmax(x))`;
        return init;
    }

    public lineOfJulia(): string {
        let connections = super.lineOfJulia();
        return connections + `connect!(net, x${this.uid}, x${this.juliaFinalLineId})`;
    }

    public clone() {
        let newLayer = new Output();
        newLayer.paramBox = this.paramBox;
        return newLayer;
    }

    public addChild(child: Layer) {
        displayError(new Error("Output cannot have children. "))
    }

    public select() {
        super.select()
        Layer.hideWireGuide()
    }
}