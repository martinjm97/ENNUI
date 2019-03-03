import * as tf from '@tensorflow/tfjs';
import { Layer } from "../layer";
import { Point, Rectangle } from "../shape";
import { defaults } from '../../../model/build_network';
import { dataset } from '../../../model/data';

export class Input extends Layer {
    layerType = "Input"
    readonly tfjsEmptyLayer = tf.input;

    defaultLocation = new Point(100, document.getElementById("svg").getBoundingClientRect().height/2)

	constructor(invisible=false){
        super([new Rectangle(new Point(0,0), 40, 40, '#806CB7')], new Point(100, document.getElementById("svg").getBoundingClientRect().height/2), invisible)
    }
    
    getHoverText(): string { return "Input"; }

    delete() { this.unselect(); }

    populateParamBox() {
        let line = document.createElement('div')
        line.className = 'paramline'        

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
    }

    public generateTfjsLayer(){ 
        // TODO make this a member variable
        this.tfjsLayer = this.tfjsEmptyLayer({shape: [dataset.IMAGE_HEIGHT, dataset.IMAGE_WIDTH, dataset.IMAGE_CHANNELS]})
    }

    public lineOfPython(): string {
        return `Input(shape=(${dataset.IMAGE_HEIGHT},${dataset.IMAGE_WIDTH}, ${dataset.IMAGE_CHANNELS}))`
    }

    public clone() {
        let newLayer = new Input(true)

        return newLayer
    }
}