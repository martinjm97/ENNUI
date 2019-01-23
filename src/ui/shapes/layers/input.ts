import { Layer } from "../layer";
import { Point, Rectangle } from "../shape";

export class Input extends Layer {
    layerType = "Input"
    defaultLocation = new Point(100, document.getElementById("svg").clientHeight/2)

	constructor(){
        super([new Rectangle(new Point(0,0), 40, 40, '#806CB7')], new Point(100, document.getElementById("svg").clientHeight/2))
    }
    
    getHoverText(): string { return "Input" }

    delete() {}
}