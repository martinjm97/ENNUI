import * as tf from '@tensorflow/tfjs';
import { ActivationLayer } from "../layer";
import { Point, PathShape } from "../shape";

export class Dense extends ActivationLayer {
    layerType = "Dense"
    readonly tfjsEmptyLayer = tf.layers.dense

    constructor(defaultLocation=Point.randomPoint(100, 40, ActivationLayer.defaultInitialLocation), invisible=false) {
        super([new PathShape("M-8 -90 h26 v100 h-8 v-10 h-10 v10 h-8 v-100 Z", '#F7473B')], defaultLocation, invisible)
    }

    populateParamBox() {
        let line = document.createElement('div')
        line.className = 'paramline'
        let name = document.createElement('div')
        name.className = 'paramname'
        name.innerHTML = 'Units:'
        name.setAttribute('data-name','units')
        let value = document.createElement('input')
        value.className = 'paramvalue'
        value.value = '30'
        line.appendChild(name);
        line.appendChild(value);
        this.paramBox.append(line);
    }

    getHoverText(): string { return "Dense" }

    public lineOfPython(): string {
        let params = this.getParams();
        return `Dense(${params["units"]}, activation='${this.getActivationText()}')`
    }

    public clone() {
        let newLayer = new Dense(Point.randomPoint(100, 40, ActivationLayer.defaultInitialLocation),true)
        newLayer.paramBox = this.paramBox
        newLayer.activation = this.activation
        return newLayer
    }
}