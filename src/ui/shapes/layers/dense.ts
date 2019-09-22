import * as tf from "@tensorflow/tfjs";
import { ActivationLayer } from "../activationlayer";
import { PathShape, Point } from "../shape";

export class Dense extends ActivationLayer {
    public layerType: string = "Dense";
    public parameterDefaults: { [key: string]: any } = {units: 32};
    public readonly tfjsEmptyLayer: any = tf.layers.dense;

    constructor(defaultLocation: Point = Point.randomPoint(100, 40, ActivationLayer.defaultInitialLocation)) {
        super([new PathShape("M-8 -90 h26 v100 h-8 v-10 h-10 v10 h-8 v-100 Z", "#F7473B")], defaultLocation);
    }

    public populateParamBox(): void {
        const line = document.createElement("div");
        line.className = "paramline";
        const name = document.createElement("div");
        name.className = "paramname";
        name.innerHTML = "Units:";
        name.setAttribute("data-name", "units");
        const value = document.createElement("input");
        value.className = "paramvalue layerparamvalue";
        value.value = "32";
        line.appendChild(name);
        line.appendChild(value);
        this.paramBox.append(line);
        this.focusing();
    }

    public getHoverText(): string { return "Dense"; }

    public lineOfPython(): string {
        const params = this.getParams();
        const activation = this.getActivationText();
        const activationText = activation == null ? "" : `, activation='${activation}'`;
        return `Dense(${params.units}${activationText})`;
    }

    public initLineOfJulia(): string {
        const params = this.getParams();
        const activation = this.getActivationText();
        const activationText = activation == null ? "" : `, ${activation}`;
        return `x${this.uid} = insert!(net, (shape) -> Dense(shape[1], ${params.units}${activationText}))\n`;
    }

    public clone(): Dense {
        const newLayer = new Dense(Point.randomPoint(100, 40, ActivationLayer.defaultInitialLocation));
        newLayer.paramBox = this.paramBox;
        newLayer.activation = this.activation;
        return newLayer;
    }
}
