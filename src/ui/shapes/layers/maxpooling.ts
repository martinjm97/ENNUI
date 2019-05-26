import * as tf from '@tensorflow/tfjs';
import { ActivationLayer, Layer } from "../layer";
import { Point, Rectangle, PathShape } from "../shape";

export class MaxPooling2D extends Layer {
    layerType = "MaxPooling2D";
    parameterDefaults = {poolSize: [2,2], strides: [2,2]};
    readonly tfjsEmptyLayer = tf.layers.maxPool2d;
    static readonly blockSize: number = 30;

    constructor(defaultLocation=Point.randomPoint(100, 40, ActivationLayer.defaultInitialLocation)) {
        super([new Rectangle(new Point(-44, -60), MaxPooling2D.blockSize, MaxPooling2D.blockSize, '#F76034'),
               new Rectangle(new Point(-27, -40), MaxPooling2D.blockSize, MaxPooling2D.blockSize, '#F77134'),
               new Rectangle(new Point(-10, -20), MaxPooling2D.blockSize, MaxPooling2D.blockSize, '#F78234')], defaultLocation)
    }

    populateParamBox() {
        let line = document.createElement('div')
        line.className = 'paramline'
        let name = document.createElement('div')
        name.className = 'paramname'
        name.innerHTML = 'Pool size:'
        name.setAttribute('data-name','poolSize')
        let value = document.createElement('input')
        value.className = 'paramvalue layerparamvalue'
        value.value = '2, 2';
        line.appendChild(name);
        line.appendChild(value);
        this.paramBox.append(line);

        let line2 = document.createElement('div')
        line2.className = 'paramline'
        let name2 = document.createElement('div')
        name2.className = 'paramname'
        name2.innerHTML = 'Strides:'
        name2.setAttribute('data-name','strides')
        let value2 = document.createElement('input')
        value2.className = 'paramvalue layerparamvalue'
        value2.value = '2, 2'
        line2.appendChild(name2);
        line2.appendChild(value2);
        this.paramBox.append(line2);

        this.focusing();
    }

    getHoverText(): string { return "Maxpool" }

    public lineOfPython(): string {
        let params = this.getParams();
        return `MaxPooling2D(pool_size=(${params["poolSize"]}), strides=(${params["strides"]}))`
    }

    public initLineOfJulia(): string {
        let params = this.getParams();
        return `x${this.uid} = insert!(net, (shape) -> (x) -> maxpool(x, (${params["poolSize"]})))\n`;
    }

    public clone() {
        let newLayer = new MaxPooling2D(Point.randomPoint(100, 40, ActivationLayer.defaultInitialLocation))

        newLayer.paramBox = this.paramBox
        return newLayer
    }

}