import { ActivationLayer } from "../layer";
import { Point } from "../shape";

export class Flatten extends ActivationLayer {
    layerType = "Flatten"

    constructor(defaultLocation=Point.randomPoint(100, 40, ActivationLayer.defaultInitialLocation)) {
        super([], defaultLocation)
    }

    populateParamBox() {}

    getHoverText(): string { return "Flatten" }
}