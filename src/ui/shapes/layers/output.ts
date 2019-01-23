import { Layer } from "../layer";
import { Point, Rectangle } from "../shape";

export class Output extends Layer {
    layerType = "Output";
    defaultLocation = new Point(document.getElementById("svg").clientWidth - 100, document.getElementById("svg").clientHeight/2)

    constructor(){
        super([new Rectangle(new Point(-8, -90), 30, 200, '#806CB7')],
               new Point(document.getElementById("svg").clientWidth - 100, document.getElementById("svg").clientHeight/2))

        this.wireCircle.style("display", "none")

    }

    getHoverText(): string { return "Output" }
    
    delete() {}
}