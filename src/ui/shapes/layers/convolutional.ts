import * as tf from '@tensorflow/tfjs';
import { ActivationLayer } from "../layer";
import { Point, PathShape, Rectangle } from "../shape";

export class Conv2D extends ActivationLayer {
    layerType = "Conv2D"
    protected tfjsEmptyLayer  = tf.layers.conv2d

    static readonly blockSize: number = 50;

    constructor(defaultLocation=Point.randomPoint(100, 40, ActivationLayer.defaultInitialLocation)) {
        super([new Rectangle(new Point(-54, -80), Conv2D.blockSize, Conv2D.blockSize, '#3B6B88'),
               new Rectangle(new Point(-37, -60), Conv2D.blockSize, Conv2D.blockSize, '#3B7B88'),
               new PathShape("M-20 -40 h50 v50 h-20 v-10 h-10 v10 h-20 v-50 Z", '#3B8B88')],
               defaultLocation)
    }

    populateParamBox() {
        let line1 = document.createElement('div')
        line1.className = 'paramline'

        let name1 = document.createElement('div')
        name1.className = 'paramname'
        name1.innerHTML = 'Filters:'
        name1.setAttribute('data-name','filters')

        let value1 = document.createElement('input')
        value1.className = 'paramvalue'
        value1.value = '10'

        line1.appendChild(name1);
        line1.appendChild(value1);

        this.paramBox.append(line1);

        let line2 = document.createElement('div')
        line2.className = 'paramline'
        let name2 = document.createElement('div')
        name2.className = 'paramname'
        name2.innerHTML = 'Kernel size:'
        name2.setAttribute('data-name','kernelSize')
        let value2 = document.createElement('input')
        value2.className = 'paramvalue'
        value2.value = '5, 5'
        line2.appendChild(name2);
        line2.appendChild(value2);
        this.paramBox.append(line2);

        let line3 = document.createElement('div')
        line3.className = 'paramline'
        let name3 = document.createElement('div')
        name3.className = 'paramname'
        name3.innerHTML = 'Stride:'
        name3.setAttribute('data-name','strides')
        let value3 = document.createElement('input')
        value3.className = 'paramvalue'
        value3.value = '2, 2'
        line3.appendChild(name3);
        line3.appendChild(value3);
        this.paramBox.append(line3);
        this.focusing()
    }

    public getHoverText(): string { return "Conv" }

    public lineOfPython(): string {
        let params = this.getParams();
        return `Conv2D(${params["filters"]}, (${params["kernelSize"]}), strides=(${params["strides"]}), activation='${this.getActivationText()}')`
    }

    public lineOfJulia(): string {
        let params = this.getParams();
        let prev_id = this.parents.values().next().value.uid;
        return `Conv((${params["kernelSize"]}), size(x${prev_id}, 3)=>${params["filters"]}, ${this.getActivationText()}, stride=(${params["strides"]}))(x${prev_id})`
    }

    public clone() {
        let newConv : Conv2D = new Conv2D(Point.randomPoint(100, 40, ActivationLayer.defaultInitialLocation))
        newConv.activation = this.activation
        newConv.paramBox = this.paramBox

        return newConv

    }

}