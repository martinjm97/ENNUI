import * as tf from "@tensorflow/tfjs";
import { ActivationLayer } from "../activationlayer";
import { Layer } from "../layer";
import { Point, Rectangle } from "../shape";

export class MaxPooling2D extends Layer {
    public static readonly blockSize: number = 30;
    public layerType: string = "MaxPooling2D";
    public parameterDefaults: { [key: string]: any } = {poolSize: [2, 2], strides: [2, 2]};
    public readonly tfjsEmptyLayer: any = tf.layers.maxPool2d;

    constructor(defaultLocation: Point = Point.randomPoint(100, 40, ActivationLayer.defaultInitialLocation)) {
        super([new Rectangle(new Point(-44, -60), MaxPooling2D.blockSize, MaxPooling2D.blockSize, "#F76034"),
               new Rectangle(new Point(-27, -40), MaxPooling2D.blockSize, MaxPooling2D.blockSize, "#F77134"),
               new Rectangle(new Point(-10, -20), MaxPooling2D.blockSize, MaxPooling2D.blockSize, "#F78234")],
               defaultLocation);
    }

    public populateParamBox(): void {
        const line = document.createElement("div");
        line.className = "paramline";
        const name = document.createElement("div");
        name.className = "paramname";
        name.innerHTML = "Pool size:";
        name.setAttribute("data-name", "poolSize");
        const value = document.createElement("input");
        value.className = "paramvalue layerparamvalue";
        value.value = "2, 2";
        line.appendChild(name);
        line.appendChild(value);
        this.paramBox.append(line);

        const line2 = document.createElement("div");
        line2.className = "paramline";
        const name2 = document.createElement("div");
        name2.className = "paramname";
        name2.innerHTML = "Strides:";
        name2.setAttribute("data-name", "strides");
        const value2 = document.createElement("input");
        value2.className = "paramvalue layerparamvalue";
        value2.value = "2, 2";
        line2.appendChild(name2);
        line2.appendChild(value2);
        this.paramBox.append(line2);

        this.focusing();
    }

    public getHoverText(): string { return "Maxpool"; }

    public lineOfPython(): string {
        const params = this.getParams();
        return `MaxPooling2D(pool_size=(${params.poolSize}), strides=(${params.strides}))`;
    }

    public initLineOfJulia(): string {
        const params = this.getParams();
        return `x${this.uid} = insert!(net, (shape) -> (x) -> maxpool(x, (${params.poolSize})))\n`;
    }

    public clone(): MaxPooling2D {
        const newLayer = new MaxPooling2D(Point.randomPoint(100, 40, ActivationLayer.defaultInitialLocation));

        newLayer.paramBox = this.paramBox;
        return newLayer;
    }

}
