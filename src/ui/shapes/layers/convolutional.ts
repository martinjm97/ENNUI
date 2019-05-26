import * as tf from '@tensorflow/tfjs';
import { ActivationLayer, Layer } from "../layer";
import { Point, PathShape, Rectangle } from "../shape";
import { displayError } from "../../error";

export class Conv2D extends ActivationLayer {
    layerType = "Conv2D";
    protected tfjsEmptyLayer  = tf.layers.conv2d;
    parameterDefaults = {kernelSize: [3,3], filters: 16, strides: [1,1], kernelRegularizer: 'none', regScale: 0.1, padding: 'same'};
    static readonly blockSize: number = 50;

    constructor(defaultLocation=Point.randomPoint(100, 40, ActivationLayer.defaultInitialLocation)) {
        super([new Rectangle(new Point(-54, -80), Conv2D.blockSize, Conv2D.blockSize, '#3B6B88'),
               new Rectangle(new Point(-37, -60), Conv2D.blockSize, Conv2D.blockSize, '#3B7B88'),
               new PathShape("M-20 -40 h50 v50 h-20 v-10 h-10 v10 h-20 v-50 Z", '#3B8B88')],
               defaultLocation);
    }

    populateParamBox() {
        let line1 = document.createElement('div');
        line1.className = 'paramline';

        let name1 = document.createElement('div');
        name1.className = 'paramname';
        name1.innerHTML = 'Filters:';
        name1.setAttribute('data-name','filters');

        let value1 = document.createElement('input');
        value1.className = 'paramvalue layerparamvalue';
        value1.value = '16';

        line1.appendChild(name1);
        line1.appendChild(value1);

        this.paramBox.append(line1);

        let line2 = document.createElement('div');
        line2.className = 'paramline';
        let name2 = document.createElement('div');
        name2.className = 'paramname';
        name2.innerHTML = 'Kernel size:';
        name2.setAttribute('data-name','kernelSize');
        let value2 = document.createElement('input');
        value2.className = 'paramvalue layerparamvalue';
        value2.value = '3, 3';
        line2.appendChild(name2);
        line2.appendChild(value2);
        this.paramBox.append(line2);

        let line3 = document.createElement('div');
        line3.className = 'paramline';
        let name3 = document.createElement('div');
        name3.className = 'paramname';
        name3.innerHTML = 'Stride:';
        name3.setAttribute('data-name','strides');
        let value3 = document.createElement('input');
        value3.className = 'paramvalue layerparamvalue';
        value3.value = '1, 1';
        line3.appendChild(name3);
        line3.appendChild(value3);
        this.paramBox.append(line3);

        // Dataset input box
        // TODO: separate this logic out.
        let line4 = document.createElement('div');
        line4.className = 'paramline selectline';

        let name4 = document.createElement('div');
        name4.className = "paramname";
        name4.innerHTML = 'Norm:';
        name4.setAttribute('data-name','kernelRegularizer');

        let select_div = document.createElement('div');
        select_div.className = 'select';

        let arrow = document.createElement('div');
        arrow.className = "select__arrow";

        let select = document.createElement('select');
        select.className = "parameter-select";

        for (let value of [["none", "None"], ["l1", "L1"], ["l2", "L2"]]) {
            let option = document.createElement("option");
            option.value = value[0];
            option.innerHTML = value[1];
            select.appendChild(option);
        }

        line4.appendChild(name4);
        line4.appendChild(select_div);
        select_div.appendChild(select);
        select_div.appendChild(arrow);
        this.paramBox.append(line4);

        let line5 = document.createElement('div');
        line5.className = 'paramline';
        let name5 = document.createElement('div');
        name5.className = 'paramname';
        name5.innerHTML = 'Scale:';
        name5.setAttribute('data-name','regScale');
        let value5 = document.createElement('input');
        value5.className = 'paramvalue layerparamvalue';
        value5.value = '0.1';
        line5.appendChild(name5);
        line5.appendChild(value5);
        this.paramBox.append(line5);
        line5.classList.add('hidden_div');
        select.addEventListener('change', function() {
            if (select.value != "none" && line5.classList.contains('hidden_div')) {
                line5.classList.toggle('hidden_div');
            }

            if (select.value == "none" && !line5.classList.contains('hidden_div')) {
                line5.classList.add('hidden_div');
            }
        })
        this.focusing();

        
    }

    public getHoverText(): string { return "Conv" }

    public lineOfPython(): string {
        let params = this.getParams();
        let activation = this.getActivationText();
        let activationText = activation == null ? "" : `, activation='${activation}'`;
        return `Conv2D(${params["filters"]}, (${params["kernelSize"]}), strides=(${params["strides"]})${activationText}, padding='same')`
    }

    public initLineOfJulia(): string {
        let params = this.getParams();
        let activation = this.getActivationText();
        let activationText = activation == null ? '' : `, ${activation}`;
        return `x${this.uid} = insert!(net, (shape) -> Conv((${params["kernelSize"]}), shape[3] =>${params["filters"]}${activationText}, stride=(${params["strides"]})))\n`
    }

    public clone() {
        let newConv : Conv2D = new Conv2D(Point.randomPoint(100, 40, ActivationLayer.defaultInitialLocation))
        newConv.activation = this.activation
        newConv.paramBox = this.paramBox

        return newConv

    }

    getParams() {
        let parameters = super.getParams();
        let scale = parameters['regScale'];
        delete parameters['regScale'];
        switch(parameters['kernelRegularizer']){
            case 'none':
                delete parameters['kernelRegularizer'];
            case 'l1':
                parameters['kernelRegularizer'] = tf.regularizers.l1({'l1': scale});
            case 'l2':
                parameters['kernelRegularizer'] = tf.regularizers.l2({'l2': scale});
        }
        return parameters;
    }
}