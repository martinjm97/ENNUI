import * as tf from "@tensorflow/tfjs";
import { displayError } from "../../error";
import { getSvgOriginalBoundingBox } from "../../utils";
import { ActivationLayer } from "../activationlayer";
import { Layer } from "../layer";
import { Point, Rectangle } from "../shape";

export class Output extends ActivationLayer {
    public layerType: string = "Output";
    public parameterDefaults: { [key: string]: any } = {units: 10, activation: "softmax"};
    public readonly tfjsEmptyLayer: any = tf.layers.dense ;
    public readonly outputWiresAllowed: boolean = false;
    public readonly wireGuidePresent: boolean = false;

    public defaultLocation: Point = new Point(
        getSvgOriginalBoundingBox(document.getElementById("svg") as any as SVGSVGElement).width - 100,
        getSvgOriginalBoundingBox(document.getElementById("svg") as any as SVGSVGElement).height / 2);
    private juliaFinalLineId: number = null;
    constructor() {
        super([new Rectangle(new Point(-8, -90), 30, 200, "#806CB7")],
               new Point(getSvgOriginalBoundingBox(document.getElementById("svg") as any as SVGSVGElement).width - 100,
               getSvgOriginalBoundingBox(document.getElementById("svg") as any as SVGSVGElement).height / 2));

    }

    public getHoverText(): string { return "Output"; }

    public delete(): void { this.unselect(); }

    public populateParamBox(): void {return; }

    public lineOfPython(): string {
        return `Dense(10, activation='softmax')`;
    }

    public initLineOfJulia(): string {
        let init = `x${this.uid} = insert!(net, (shape) -> Dense(shape[1], 10))\n`;
        if (this.juliaFinalLineId == null) {
            this.juliaFinalLineId = Layer.getNextID();
        }
        init += `x${this.juliaFinalLineId} = insert!(net, (shape) -> (x) -> softmax(x))`;
        return init;
    }

    public lineOfJulia(): string {
        const connections = super.lineOfJulia();
        return connections + `connect!(net, x${this.uid}, x${this.juliaFinalLineId})`;
    }

    public clone(): Output {
        const newLayer = new Output();
        newLayer.paramBox = this.paramBox;
        return newLayer;
    }

    public addChild(_: Layer): void {
        displayError(new Error("Output cannot have children. "));
    }
}
