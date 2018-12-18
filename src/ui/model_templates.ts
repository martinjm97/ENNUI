import { Input, Output, ActivationLayer, Conv2D, Dense } from "./shapes/layer";
import { Activation, Relu } from "./shapes/activation";
import { Point } from "./shapes/shape";

export function buildDefaultTemplate(svgData) {
    svgData.input = new Input();
	svgData.output = new Output();

	let canvasWidth = document.getElementById("svg").clientWidth;
	let canvasHeight = document.getElementById("svg").clientHeight;
	let conv: ActivationLayer = new Conv2D(new Point(canvasWidth/3, canvasHeight/2))
	let convRelu: Activation = new Relu()
	let dense: ActivationLayer = new Dense(new Point(canvasWidth*2/3, canvasHeight/2))
	let denseRelu: Activation = new Relu()
	
	svgData.input.addChild(conv)
	
	conv.addChild(dense)
	conv.addActivation(convRelu)
	
	dense.addChild(svgData.output)
	dense.addActivation(denseRelu)

	
	svgData.draggable.push(conv);
	svgData.draggable.push(dense);
	
	svgData.draggable.push(convRelu);
	svgData.draggable.push(denseRelu);
}