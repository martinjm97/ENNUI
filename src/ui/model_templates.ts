import { Input, Output, ActivationLayer, Conv2D, Dense } from "./shapes/layer";
import { Activation, Relu } from "./shapes/activation";
import { Point } from "./shapes/shape";
import { svg } from "d3";

function resetWorkspace(svgData) {
    // Set input and output locations
	svgData.input.setPosition(svgData.input.defaultLocation)
	svgData.input.wires.forEach((w) => w.delete())
    svgData.output.setPosition(svgData.output.defaultLocation)
    
    // Remove all other layers
    for (let layer of svgData.draggable) {
        layer.delete();
    }
}

export function defaultTemplate(svgData) {
    resetWorkspace(svgData)

    // Initialize each of the layers and activations
	let canvasWidth = document.getElementById("svg").clientWidth;
	let canvasHeight = document.getElementById("svg").clientHeight;
	let conv: ActivationLayer = new Conv2D(new Point(canvasWidth/3, canvasHeight/2))
	let convRelu: Activation = new Relu()
	let dense: ActivationLayer = new Dense(new Point(canvasWidth*2/3, canvasHeight/2))
	let denseRelu: Activation = new Relu()
    
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