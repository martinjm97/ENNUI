import * as tf from "@tensorflow/tfjs";
import { ActivationLayer } from "../activationlayer";
import { Layer } from "../layer";
import { PathShape, Point } from "../shape";

export class Concatenate extends Layer {
    public layerType: string = "Concatenate";
    public parameterDefaults: { [key: string]: any } = {};
    public readonly tfjsEmptyLayer: any = tf.layers.concatenate;

    constructor(defaultLocation: Point = Point.randomPoint(100, 40, ActivationLayer.defaultInitialLocation)) {
        super([new PathShape("M-23 -120 h23 v120 h-23 v-120 Z", "#F27493"),
               new PathShape("M-23 -81 h23 v2 h-23 v-2  Z", "rgba(20, 20, 20, 0.3)"),
               new PathShape("M-23 -41 h23 v2 h-23 v-2  Z", "rgba(20, 20, 20, 0.3)")], defaultLocation);
    }

    public populateParamBox(): void {return; }

    public getHoverText(): string { return "Concatenate"; }

    public lineOfPython(): string {
        return `Concatenate()`;
    }

    public initLineOfJulia(): string {
        return `x${this.uid}  = insert!(net, (x) -> vcat(x...))\n`;
    }

    public generateTfjsLayer(): void {
        // Concatenate layers handle fan-in
        const parents = [];
        for (const parent of this.parents) {
            parents.push(parent.getTfjsLayer());
        }
        this.tfjsLayer = this.tfjsEmptyLayer().apply(parents) as tf.SymbolicTensor;
    }

    public clone(): Concatenate {
        const newLayer = new Concatenate();
        // newLayer.paramBox = this.paramBox

        return newLayer;

    }
}
