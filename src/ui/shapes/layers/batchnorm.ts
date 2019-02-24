import * as tf from '@tensorflow/tfjs';
import { ActivationLayer, Layer } from "../layer";
import { Point, PathShape, Rectangle } from "../shape";
import { SymbolicTensor } from '@tensorflow/tfjs';
import { displayError } from '../../error';

export class BatchNorm extends ActivationLayer {
    layerType = "BatchNorm"
    protected tfjsEmptyLayer  = tf.layers.batchNormalization

    static readonly blockSize: number = 50;

    constructor(defaultLocation=Point.randomPoint(100, 40, ActivationLayer.defaultInitialLocation)) {
        super([new PathShape("M-10 -90 L 20 -60 v70 h-10 v-10 h-10 v10 h-10 v-100 Z", '#CFB53B')],
               defaultLocation)
    }

    populateParamBox() {
        let line1 = document.createElement('div')
        line1.className = 'paramline'

        let name1 = document.createElement('div')
        name1.className = 'paramname'
        name1.innerHTML = 'Momentum:'
        name1.setAttribute('data-name','momentum')

        let value1 = document.createElement('input')
        value1.className = 'paramvalue'
        value1.value = '0.99'

        line1.appendChild(name1);
        line1.appendChild(value1);

        this.paramBox.append(line1);

        this.focusing()
    }

    public getHoverText(): string { return "BatchNorm" }

    public lineOfPython(): string {
        let params = this.getParams();
        return `BatchNormalization(momentum=${params["momentum"]})`
    }

    public initLineOfJulia(): string {
        displayError(new Error('Batch Normalization is not yet supported for Julia.'));
        return ``;
    }

    public clone() {
        let newBN : BatchNorm = new BatchNorm(Point.randomPoint(100, 40, ActivationLayer.defaultInitialLocation))
        newBN.activation = this.activation
        newBN.paramBox = this.paramBox

        return newBN

    }

    public generateTfjsLayer(){
        let parameters = {momentum: 0.99}
        let config = this.getParams()
        for (let param in config) {
            parameters[param] = config[param]
        }

        let parent:Layer = null
        for (let p of this.parents){ parent = p; break }
        // Concatenate layers handle fan-in
        this.tfjsLayer = <SymbolicTensor>this.tfjsEmptyLayer(parameters).apply(parent.getTfjsLayer())

        if (this.activation != null) {
            this.tfjsLayer = <SymbolicTensor>tf.layers.reLU().apply(this.tfjsLayer)
        }
    }

}