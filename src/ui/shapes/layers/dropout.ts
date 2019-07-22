import * as tf from '@tensorflow/tfjs';
import { Layer } from "../layer";
import { ActivationLayer } from "../activationlayer";
import { Point, PathShape } from "../shape";

export class Dropout extends Layer {
    layerType = "Dropout";
    parameterDefaults = {rate: 0.5};
    readonly tfjsEmptyLayer = tf.layers.dropout

    constructor(defaultLocation=Point.randomPoint(100, 40, ActivationLayer.defaultInitialLocation)) {
        super([new PathShape("M0 0 h60 v60 h-60 v-60 Z", '#99BCE0'),
               new PathShape("M18 0 h4 v60 h-4 v-60 Z", 'rgba(20, 20, 20, 0.2)'),
               new PathShape("M38 0 h4 v60 h-4 v-60 Z", 'rgba(20, 20, 20, 0.2)'),
               new PathShape("M0 18 v4 h60 v-4 h-60 Z", 'rgba(20, 20, 20, 0.2)'),
               new PathShape("M0 38 v4 h60 v-4 h-60 Z", 'rgba(20, 20, 20, 0.2)')], defaultLocation)
    }

    populateParamBox() {

        let line = document.createElement('div')
        line.className = 'paramline'
        let name = document.createElement('div')
        name.className = 'paramname'
        name.innerHTML = 'Rate:'
        name.setAttribute('data-name','rate')
        let value = document.createElement('input')
        value.className = 'paramvalue layerparamvalue'
        value.value = '0.5'
        line.appendChild(name);
        line.appendChild(value);
        this.paramBox.append(line);
        this.focusing()
    }

    getHoverText(): string { return "Dropout" }

    public lineOfPython(): string {
        let params = this.getParams();

        return `Dropout(rate=${params["rate"]})`;
    }

    public initLineOfJulia(): string {
        let params = this.getParams();
        return `x${this.uid} = insert!(net, (shape) -> Dropout(${params["rate"]}))\n`;
    }

    public clone() {
        let newLayer = new Dropout()
        newLayer.paramBox = this.paramBox

        return newLayer

    }
}