import * as tf from "@tensorflow/tfjs";
import { displayError } from "../../error";
import { ActivationLayer } from "../activationlayer";
import { Line, PathShape, Point } from "../shape";

export class Add extends ActivationLayer {
    public layerType: string = "Add";
    public parameterDefaults: { [key: string]: any }  = {};
    public readonly tfjsEmptyLayer: any = tf.layers.add;

    constructor(defaultLocation: Point = Point.randomPoint(100, 40, ActivationLayer.defaultInitialLocation)) {
        super([new PathShape("m10,10 v-10 h-10 v10 a30,30 0 1,1 10,0Z", "#73A665"),
               new Line(new Point(-10, -20), new Point(20, -20), 5, "#040"),
               new Line(new Point(5, -35), new Point(5, -5), 5, "#040")], defaultLocation);
        // Path for Layer plus: m15,10 h-5 v-10 h-10 v10 h-5 v-20 h-20 v-20 h20 v-20 h20 v20 h20 v20 h-20 v20Z

    }

    public populateParamBox(): void { return; }

    public getHoverText(): string { return "Add"; }

    public lineOfPython(): string {
        return `Add()`;
    }

    public initLineOfJulia(): string {
        displayError(Error("Export to Julia does not support Add Layers"));
        throw Error;
    }

    public generateTfjsLayer(): void {
        // Concatenate layers handle fan-in
        const parents = [];
        for (const parent of this.parents) {
            parents.push(parent.getTfjsLayer());
        }
        this.tfjsLayer = this.tfjsEmptyLayer().apply(parents) as tf.SymbolicTensor;
    }

    public clone(): Add {
        const newLayer = new Add();
        return newLayer;

    }
}
