import * as tf from '@tensorflow/tfjs';
import { ActivationLayer, Layer } from "../layer";
import { Point, Rectangle, PathShape } from "../shape";

export class MaxPooling2D extends Layer {
    layerType = "MaxPooling2D"
    readonly tfjsEmptyLayer = tf.layers.maxPool2d;
    static readonly blockSize: number = 30;

    constructor(defaultLocation=Point.randomPoint(100, 40, ActivationLayer.defaultInitialLocation), invisible=false) {
        super([new Rectangle(new Point(-44, -60), MaxPooling2D.blockSize, MaxPooling2D.blockSize, '#F76034'),
               new Rectangle(new Point(-27, -40), MaxPooling2D.blockSize, MaxPooling2D.blockSize, '#F77134'),
               new Rectangle(new Point(-10, -20), MaxPooling2D.blockSize, MaxPooling2D.blockSize, '#F78234')], defaultLocation, invisible)
    }

    populateParamBox() {
        let line = document.createElement('div')
        line.className = 'paramline'
        let name = document.createElement('div')
        name.className = 'paramname'
        name.innerHTML = 'Pool size:'
        name.setAttribute('data-name','poolSize')
        let value = document.createElement('input')
        value.className = 'paramvalue'
        value.value = '2,2';
        line.appendChild(name);
        line.appendChild(value);
        this.paramBox.append(line);
    }

    getHoverText(): string { return "maxpool" }

    public lineOfPython(): string {
        let params = this.getParams();
        return `MaxPooling2D(pool_size=(${params["poolSize"]}))`
    }

    public clone() {
        let newLayer = new MaxPooling2D(Point.randomPoint(100, 40, ActivationLayer.defaultInitialLocation), true)

        newLayer.paramBox = this.paramBox
        return newLayer
    }

}