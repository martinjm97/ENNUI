import * as tf from '@tensorflow/tfjs';
import { ActivationLayer } from "../layer";
import { Point, PathShape } from "../shape";

export class Dense extends ActivationLayer {
    layerType = "Dense"
    readonly tfjsEmptyLayer = tf.layers.dense

    constructor(defaultLocation=Point.randomPoint(100, 40, ActivationLayer.defaultInitialLocation)) {
        super([new PathShape("M-8 -90 h26 v100 h-8 v-10 h-10 v10 h-8 v-100 Z", '#F7473B')], defaultLocation)
    }

    populateParamBox() {
        let line = document.createElement('div')
        line.className = 'paramline'
        let name = document.createElement('div')
        name.className = 'paramname'
        name.innerHTML = 'Units:'
        name.setAttribute('data-name','units')
        let value = document.createElement('input')
        value.className = 'paramvalue layerparamvalue'
        value.value = '30'
        line.appendChild(name);
        line.appendChild(value);
        this.paramBox.append(line);
        this.focusing()
    }

    getHoverText(): string { return "Dense" }

    public lineOfPython(): string {
        let params = this.getParams();
        let activation = this.getActivationText();
        let activationText = activation == null ? "" : `, activation='${activation}'`;
        return `Dense(${params["units"]}${activationText})`;
    }

    public initLineOfJulia(): string {
        let params = this.getParams();
        let activation = this.getActivationText();
        let activationText = activation == null ? '' : `, ${activation}`;
        return `x${this.uid} = insert!(net, (shape) -> Dense(shape[1], ${params["units"]}${activationText}))\n`;
    }

    public clone() {
        let newLayer = new Dense(Point.randomPoint(100, 40, ActivationLayer.defaultInitialLocation))
        newLayer.paramBox = this.paramBox
        newLayer.activation = this.activation
        return newLayer
    }
}