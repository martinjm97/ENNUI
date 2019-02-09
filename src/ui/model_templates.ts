import { ActivationLayer } from "./shapes/layer";
import { Activation, Relu } from "./shapes/activation";
import { Point } from "./shapes/shape";
import { Conv2D } from "./shapes/layers/convolutional";
import { Dense } from "./shapes/layers/dense";
import { MaxPooling2D } from "./shapes/layers/maxpooling";

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

export function complexTemplate(svgData) {
    resetWorkspace(svgData)

	// Initialize each of the layers and activations
	let canvasBoundingBox = document.getElementById("svg").getBoundingClientRect();
	let width = canvasBoundingBox.width;
	let height = canvasBoundingBox.height;
	let convStartingPosition = new Point(width/3, height/3);
	let denseStartingPosition = new Point(width*3/4, height/2);
	let conv2StartingPosition = new Point(width/2, height*2/3);
	let maxpoolingStartingPosition = new Point(width*2/3, height/3);
	let conv3StartingPosition = new Point(width/2, height/3);


	let conv: ActivationLayer = new Conv2D(convStartingPosition);
	let convRelu: Activation = new Relu(convStartingPosition);
	let dense: ActivationLayer = new Dense(denseStartingPosition);
	let denseRelu: Activation = new Relu(denseStartingPosition);
	let conv2: ActivationLayer = new Conv2D(conv2StartingPosition);
	let convRelu2: Activation = new Relu(conv2StartingPosition);
	let maxpooling: MaxPooling2D = new MaxPooling2D(maxpoolingStartingPosition);
	let conv3: ActivationLayer = new Conv2D(conv3StartingPosition)
	let convRelu3: Activation = new Relu(conv3StartingPosition);


	// Add relationships among layers and activations
	// in -> conv, in -> conv2
	svgData.input.addChild(conv);
	svgData.input.addChild(conv2);

	// conv -> conv3
	conv.addChild(conv3);
	conv.addActivation(convRelu)

	// conv3 -> maxpooling
	conv3.addChild(maxpooling);
	conv3.addActivation(convRelu3);

	// maxpooling -> dense
	maxpooling.addChild(dense);
	
	// conv2 -> dense
	conv2.addChild(dense)
	conv2.addActivation(convRelu2)

	// dense -> out
	dense.addActivation(denseRelu);
	dense.addChild(svgData.output);


	// Store the new network
	svgData.draggable.push(conv);
	svgData.draggable.push(conv2);
	svgData.draggable.push(conv3);
	svgData.draggable.push(dense);
	svgData.draggable.push(convRelu);
	svgData.draggable.push(convRelu2);
	svgData.draggable.push(convRelu3);
}