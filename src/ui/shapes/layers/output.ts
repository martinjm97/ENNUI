import * as tf from '@tensorflow/tfjs';
import { Layer } from "../layer";
import { ActivationLayer } from "../activationlayer";
import { Point, Rectangle } from "../shape";
import { displayError } from '../../error';
import { getSvgOriginalBoundingBox } from '../../utils';

export class Output extends ActivationLayer {
    layerType = "Output";
    parameterDefaults = {units: 10, activation: 'softmax'};
    readonly tfjsEmptyLayer = tf.layers.dense ;
    private juliaFinalLineId: number = null;
    readonly outputWiresAllowed: boolean = false;
    readonly wireGuidePresent: boolean = false;

    defaultLocation = new Point(getSvgOriginalBoundingBox(document.getElementById("svg") as any as SVGSVGElement).width - 100, getSvgOriginalBoundingBox(document.getElementById("svg") as any as SVGSVGElement).height/2);
    constructor(){
        super([new Rectangle(new Point(-8, -90), 30, 200, '#806CB7')],
               new Point(getSvgOriginalBoundingBox(document.getElementById("svg") as any as SVGSVGElement).width - 100,
               getSvgOriginalBoundingBox(document.getElementById("svg") as any as SVGSVGElement).height/2));

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

    public addChild(_: Layer) {
        displayError(new Error("Output cannot have children. "))
    }
}