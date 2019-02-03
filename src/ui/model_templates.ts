import { ActivationLayer } from "./shapes/layer";
import { Activation, Relu } from "./shapes/activation";
import { Point } from "./shapes/shape";
import { Conv2D } from "./shapes/layers/convolutional";
import { Dense } from "./shapes/layers/dense";

export function resetWorkspace(svgData) {
	// Set input and output locations
	if (svgData.input != null){
		svgData.input.setPosition(svgData.input.defaultLocation)
		svgData.input.wires.forEach((w) => w.delete())
	}
	if (svgData.output != null){
		svgData.output.setPosition(svgData.output.defaultLocation)
	}
    
    // Remove all other layers
    for (let layer of svgData.draggable) {
        layer.delete();
    }
}

export function defaultTemplate(svgData) {
    resetWorkspace(svgData)

	// Initialize each of the layers and activations
	let canvasBoundingBox = document.getElementById("svg").getBoundingClientRect();
	let convStartingPosition = new Point(canvasBoundingBox.width/3, canvasBoundingBox.height/2)
	let denseStartingPosition = new Point(canvasBoundingBox.width*2/3, canvasBoundingBox.height/2)
	let conv: ActivationLayer = new Conv2D(convStartingPosition)
	let convRelu: Activation = new Relu(convStartingPosition)
	let dense: ActivationLayer = new Dense(denseStartingPosition)
	let denseRelu: Activation = new Relu(denseStartingPosition)
    
    // Add relationships among layers and activations
	svgData.input.addChild(conv)
	conv.addChild(dense)
	conv.addActivation(convRelu)
	dense.addChild(svgData.output)
	dense.addActivation(denseRelu)

	// Store the new network
	svgData.draggable.push(conv);
	svgData.draggable.push(dense);
	svgData.draggable.push(convRelu);
	svgData.draggable.push(denseRelu);
}

export function blankTemplate(svgData) {
    resetWorkspace(svgData)
}