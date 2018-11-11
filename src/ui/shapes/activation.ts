import { Draggable } from "./draggable";
import { Point, Rectangle } from "./shape";
import { Layer } from "./layer";

export abstract class Activation extends Draggable {

    freeFloatingLocation: Point = new Point(25, 25);
    layer: Layer = null;

    constructor(color: string) { 
        super();
        let middleTooth: Rectangle = new Rectangle(new Point(0, 0), 10, 10, color);
        let lowerBlock: Rectangle = new Rectangle(new Point(-8, 10), 26, 10, color);
        // TODO: Finish making shapes!
        this.svgComponent = lowerBlock;
    }

    getLocation() {
        if (this.layer != null) {
            return this.freeFloatingLocation;
        } else {
            // TODO Return the location of an activation relative to the parent layer
        }
    }
}

export class Relu extends Activation {

    constructor() {
        super("#800080")
    }
}

export class Sigmoid extends Activation {

    constructor() {
        super("a00060")
    }
}

export class Softmax extends Activation {
    
    constructor() {
        super("6000a0")
    }
}
