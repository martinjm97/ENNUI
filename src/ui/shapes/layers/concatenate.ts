import { ActivationLayer } from "../layer";
import { Point } from "../shape";

export class Concatenate extends ActivationLayer {
    layerType = "Concatenate"

    constructor(defaultLocation=Point.randomPoint(100, 40, ActivationLayer.defaultInitialLocation)) {
        super([], defaultLocation)
    }

    populateParamBox() {}

    getHoverText(): string { return "Concatenate" }
}