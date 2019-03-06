import * as tf from '@tensorflow/tfjs';
import { Layer } from "../layer";
import { Point, Rectangle } from "../shape";
import { dataset } from '../../../model/data';
import { getSvgOriginalBoundingBox } from '../../utils';

export class Input extends Layer {
    layerType = "Input"
    readonly tfjsEmptyLayer = tf.input;

    defaultLocation = new Point(100, getSvgOriginalBoundingBox(document.getElementById("svg")).height/2)

	constructor(){
        super([new Rectangle(new Point(0,0), 40, 40, '#806CB7')], new Point(100, getSvgOriginalBoundingBox(document.getElementById("svg")).height/2))
    }

    getHoverText(): string { return "Input"; }

    delete() { this.unselect(); }

    populateParamBox() {
        // Dataset input box
        // TODO: separate this logic out.
        let line = document.createElement('div')
        line.className = 'paramline selectline'

        let name = document.createElement('div')
        name.className = "paramname"
        name.innerHTML = 'Dataset:'
        name.setAttribute('data-name','dataset')

        let select_div = document.createElement('div')
        select_div.className = 'select'

        let arrow = document.createElement('div')
        arrow.className = "select__arrow"

        let select = document.createElement('select')
        select.className = "parameter-select"

        for (let value of [["mnist", "MNIST"], ["cifar", "Cifar-10"]]) {
            let option = document.createElement("option")
            option.value = value[0]
            option.innerHTML = value[1]
            select.appendChild(option)
        }

        line.appendChild(name);
        line.appendChild(select_div)
        select_div.appendChild(select);
        select_div.appendChild(arrow)
        this.paramBox.append(line);
        this.focusing()

        // // Subset the data
        // let line2 = document.createElement('div')
        // line2.className = 'paramline'
        // let subset = document.createElement('div')
        // subset.className = 'paramname'
        // subset.innerHTML = 'Subset:'
        // subset.setAttribute('data-name','subset')
        // let value2 = document.createElement('input')
        // value2.className = 'paramvalue layerparamvalue'
        // value2.value = '0.5'
        // line2.appendChild(subset);
        // line2.appendChild(value2);
        // this.paramBox.append(line2);
        // this.focusing()
    }

    public generateTfjsLayer(){
        // TODO make this a member variable
        this.tfjsLayer = this.tfjsEmptyLayer({shape: [dataset.IMAGE_HEIGHT, dataset.IMAGE_WIDTH, dataset.IMAGE_CHANNELS]})
    }

    public lineOfPython(): string {
        return `Input(shape=(${dataset.IMAGE_HEIGHT},${dataset.IMAGE_WIDTH}, ${dataset.IMAGE_CHANNELS}))`
    }

    public initLineOfJulia(): string {
        return `x${this.uid} = insert!(net, (shape) -> x -> x)\n`;
    }

    public clone() {
        let newLayer = new Input();

        return newLayer;
    }
}