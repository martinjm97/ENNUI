import * as tf from '@tensorflow/tfjs';
import { ActivationLayer, Layer } from "../layer";
import { Point, PathShape, Rectangle } from "../shape";
import { SymbolicTensor } from '@tensorflow/tfjs';

export class BatchNorm extends ActivationLayer {
    layerType = "BatchNorm"
    protected tfjsEmptyLayer  = tf.layers.batchNormalization

    static readonly blockSize: number = 50;

    constructor(defaultLocation=Point.randomPoint(100, 40, ActivationLayer.defaultInitialLocation), invisible=false) {
        super([new Rectangle(new Point(-54, -80), BatchNorm.blockSize, BatchNorm.blockSize, '#B36B88'),
               new Rectangle(new Point(-37, -60), BatchNorm.blockSize, BatchNorm.blockSize, '#B37B88'),
               new PathShape("M-20 -40 h50 v50 h-20 v-10 h-10 v10 h-20 v-50 Z", '#B38B88')],
               defaultLocation, invisible)
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
        return `BatchNormalization(${params["momentum"]})`
    }

    public lineOfJulia(): string {
        let params = this.getParams();
        let prev_id = this.parents.values().next().value.uid;
        return ``
    }

    public clone() {
        let newBN : BatchNorm = new BatchNorm(Point.randomPoint(100, 40, ActivationLayer.defaultInitialLocation),true)
        newBN.activation = this.activation
        newBN.paramBox = this.paramBox

        return newBN

    }

    public generateTfjsLayer(){
        // TODO change defaults to class level
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