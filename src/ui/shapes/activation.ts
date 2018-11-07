import { Draggable } from "./draggable";
import { Point, Rectangle } from "./shape";
import { Layer } from "./layer";

export abstract class Activation extends Draggable {
    static readonly middleTooth: Rectangle;
    static readonly main: Rectangle;

    freeFloatingLocation: Point = new Point(25, 25);
    layer: Layer = null;

    getLocation() {
        if (this.layer != null) {
            return this.freeFloatingLocation;
        } else {
            // TODO Return the location of an activation relative to the parent layer
        }
    }
}

export class Relu extends Activation {
    static readonly middleTooth: Rectangle = new Rectangle(new Point(0, 0), 10, 10, "#800080");
    static readonly main: Rectangle = new Rectangle(new Point(-8, 10), 26, 10, "#800080");
}

export class Sigmoid extends Activation {
    static readonly middleTooth: Rectangle = new Rectangle(new Point(0, 0), 10, 10, "#a00060");
    static readonly main: Rectangle = new Rectangle(new Point(-8, 10), 26, 10, "#a00060");
}

export class Softmax extends Activation {
    static readonly middleTooth: Rectangle = new Rectangle(new Point(0, 0), 10, 10, "#6000a0");
    static readonly main: Rectangle = new Rectangle(new Point(-8, 10), 26, 10, "#6000a0");
}
