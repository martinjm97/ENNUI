import { ActivationLayer, Layer } from "./shapes/layer";
import { Activation, Relu } from "./shapes/activation";
import { Point } from "./shapes/shape";
import { Conv2D } from "./shapes/layers/convolutional";
import { Dense } from "./shapes/layers/dense";
import { MaxPooling2D } from "./shapes/layers/maxpooling";
import { Flatten } from "./shapes/layers/flatten";
import { Concatenate } from "./shapes/layers/concatenate";
import { BatchNorm } from "./shapes/layers/batchnorm";
import { windowProperties } from "./window";
import { getSvgOriginalBoundingBox } from "./utils";
import { Add } from "./shapes/layers/add";
import { Dropout } from "./shapes/layers/dropout";

export function resetWorkspace(svgData) {
	// Deselect current element
	if (windowProperties.selectedElement != null) {
		windowProperties.selectedElement.unselect()
	}
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

	// Clear the current list of draggables
	svgData.draggable = []
}

export function defaultTemplate(svgData) {
    resetWorkspace(svgData)

	// Initialize each of the layers and activations
	let canvasBoundingBox = getSvgOriginalBoundingBox(document.getElementById("svg"));
	let convStartingPosition = new Point(canvasBoundingBox.width/4, canvasBoundingBox.height/2.5)
	let flatStartingPosition = new Point(canvasBoundingBox.width/1.75, canvasBoundingBox.height/2.5)
	let denseStartingPosition = new Point(canvasBoundingBox.width*5/6.5, canvasBoundingBox.height/2.5)
	let conv: ActivationLayer = new Conv2D(convStartingPosition)
	let convRelu: Activation = new Relu(convStartingPosition)

	let flat: Layer = new Flatten(flatStartingPosition)
	let dense: ActivationLayer = new Dense(denseStartingPosition)
	let denseRelu: Activation = new Relu(denseStartingPosition)

    // Add relationships among layers and activations
	svgData.input.addChild(conv)
	conv.addChild(flat)
	conv.addActivation(convRelu)

	flat.addChild(dense)

	dense.addChild(svgData.output)
	dense.addActivation(denseRelu)

	// Store the new network
	svgData.draggable.push(conv);
	svgData.draggable.push(dense);
	svgData.draggable.push(flat)
	svgData.draggable.push(convRelu);
	svgData.draggable.push(denseRelu);
}

export function blankTemplate(svgData) {
    resetWorkspace(svgData)
}

export function resnetTemplate(svgData) {
	resetWorkspace(svgData)

	// Initialize each of the layers and activations
	let canvasBoundingBox = getSvgOriginalBoundingBox(document.getElementById("svg"));
	let width = canvasBoundingBox.width;
	let height = canvasBoundingBox.height;

	let conv0Pos = new Point(width*0.26, height*0.57);
	let conv1Pos = new Point(width*0.26, height*0.372);
	let conv2Pos = new Point(width*0.404, height*0.372);
	let conv3Pos = new Point(width*0.404, height*0.78);
	let conv4Pos = new Point(width*0.537, height*0.78);
	let add1Pos = new Point(width*0.387, height*0.547);
	let add2Pos = new Point(width*0.521, height*0.547);
	let flattenPos = new Point(width*0.708, height*0.606);
	let densePos = new Point(width*0.702, height*0.566);
	let dropoutPos = new Point(width*0.778, height*0.477);

	let conv0: ActivationLayer = new Conv2D(conv0Pos);
	let conv1: ActivationLayer = new Conv2D(conv1Pos);
	let conv2: ActivationLayer = new Conv2D(conv2Pos);
	let conv3: ActivationLayer = new Conv2D(conv3Pos);
	let conv4: ActivationLayer = new Conv2D(conv4Pos);
	let conv1Relu: Activation = new Relu(conv1Pos);
	let conv3Relu: Activation = new Relu(conv3Pos);
	let add1: ActivationLayer = new Add(add1Pos);
	let add2: ActivationLayer = new Add(add2Pos);
	let add1Relu: Activation = new Relu(add1Pos);
	let add2Relu: Activation = new Relu(add2Pos);
	let flatten: Flatten = new Flatten(flattenPos);
	let dense: ActivationLayer = new Dense(densePos);
	let denseRelu: Activation = new Relu(densePos);
	let dropout: Layer = new Dropout(dropoutPos);

	// Add activations to layers
	conv1.addActivation(conv1Relu);
	conv3.addActivation(conv3Relu);
	add1.addActivation(add1Relu);
	add2.addActivation(add2Relu);
	dense.addActivation(denseRelu);

	// Add relationships among layers and activations
	svgData.input.addChild(conv0);

	conv0.addChild(add1);
	conv0.addChild(conv1)

	conv1.addChild(conv2);
	conv2.addChild(add1);

	add1.addChild(conv3);
	add1.addChild(add2);

	conv3.addChild(conv4);
	conv4.addChild(add2);

	add2.addChild(flatten);
	flatten.addChild(dense);
	dense.addChild(dropout);
	dropout.addChild(svgData.output);

	// Store the new network
	svgData.draggable.push(conv0);
	svgData.draggable.push(conv1);
	svgData.draggable.push(conv2);
	svgData.draggable.push(conv3);
	svgData.draggable.push(conv4);
	svgData.draggable.push(add1);
	svgData.draggable.push(add2);
	svgData.draggable.push(flatten);
	svgData.draggable.push(dense);
	svgData.draggable.push(dropout);
	svgData.draggable.push(conv1Relu);
	svgData.draggable.push(conv3Relu);
	svgData.draggable.push(add1Relu);
	svgData.draggable.push(add2Relu);
	svgData.draggable.push(denseRelu);
}

export function complexTemplate(svgData) {
    resetWorkspace(svgData)

	// Initialize each of the layers and activations
	let canvasBoundingBox = getSvgOriginalBoundingBox(document.getElementById("svg"));
	let width = canvasBoundingBox.width;
	let height = canvasBoundingBox.height;
	let convStartingPosition = new Point(width/3.5, height/3);
	let denseStartingPosition = new Point(width*3/4, height/2);
	let conv2StartingPosition = new Point(width/3.5, height*2/3);
	let batchStartingPosition = new Point(width/2.5, height*2/3);
	let maxpoolingStartingPosition = new Point(width/2.5, height/3);
	let concatStartingPosition = new Point(width*2/3, height/1.9);
	let flat1StartingPosition = new Point(width/1.7, height/2.2);
	let flat2StartingPosition = new Point(width/1.7, height*2/3);

	let conv: ActivationLayer = new Conv2D(convStartingPosition);
	let convRelu: Activation = new Relu(convStartingPosition);
	let dense: ActivationLayer = new Dense(denseStartingPosition);
	let denseRelu: Activation = new Relu(denseStartingPosition);
	let conv2: ActivationLayer = new Conv2D(conv2StartingPosition);
	let maxpooling: MaxPooling2D = new MaxPooling2D(maxpoolingStartingPosition);
	let concat: Concatenate = new Concatenate(concatStartingPosition);
	let batch: ActivationLayer = new BatchNorm(batchStartingPosition);
	let batchRelu2: Activation = new Relu(batchStartingPosition);
	let flat1: Flatten = new Flatten(flat1StartingPosition);
	let flat2: Flatten = new Flatten(flat2StartingPosition);



	// Add relationships among layers and activations
	// in -> conv, in -> conv2
	svgData.input.addChild(conv);
	svgData.input.addChild(conv2);

	// conv -> maxpool
	conv.addChild(maxpooling);
	conv.addActivation(convRelu)

	// maxpooling -> flat1
	maxpooling.addChild(flat1);

	// conv2 -> batch
	conv2.addChild(batch);

	// batch -> flat2
	batch.addChild(flat2);
	batch.addActivation(batchRelu2);

	// concat -> dense
	concat.addChild(dense);

	// flat1 -> concat
	flat1.addChild(concat);

	// flat2 -> concat
	flat2.addChild(concat);

	// dense -> out
	dense.addActivation(denseRelu);
	dense.addChild(svgData.output);


	// Store the new network
	svgData.draggable.push(conv);
	svgData.draggable.push(conv2);
	svgData.draggable.push(dense);
	svgData.draggable.push(maxpooling);
	svgData.draggable.push(convRelu);
	svgData.draggable.push(batchRelu2);
	svgData.draggable.push(concat);
	svgData.draggable.push(flat1);
	svgData.draggable.push(flat2);
	svgData.draggable.push(batch);
}