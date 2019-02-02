import { DraggableData } from "../ui/app";
import { Layer, LayerJson, ActivationLayer } from "../ui/shapes/layer";
import { saveAs } from 'file-saver';
import { Point } from "../ui/shapes/shape";
import { Input } from "../ui/shapes/layers/input";
import { Output } from "../ui/shapes/layers/output";
import { MaxPooling2D } from "../ui/shapes/layers/maxpooling";
import { Dense } from "../ui/shapes/layers/dense";
import { Conv2D } from "../ui/shapes/layers/convolutional";
import { Concatenate } from "../ui/shapes/layers/concatenate";
import { Flatten } from "../ui/shapes/layers/flatten";
import { Activation, Relu, Sigmoid, Tanh } from "../ui/shapes/activation";
import { layer } from "@tensorflow/tfjs-vis/dist/show/model";
import { HyperparameterData, model } from "./paramsObject";
import { displayError } from "../ui/error";

export interface SerializedNetwork {
	graph: Array<LayerJson>
	hyperparameters: HyperparameterData
}

export function graphToJson(svgData: DraggableData): SerializedNetwork {
	// Initialize queues, dags, and parents (visited) 
	let queue: Layer[] = [svgData.input]
	let visited: Set<Layer> = new Set()
	let layersjson: Array<LayerJson> = new Array()
	while (queue.length != 0) {
		let current = queue.shift()
		layersjson.push(current.toJson())
		// check each connections of the node
		for (let child of current.children) {
			if (!visited.has(child)) {
				queue.push(child)
				visited.add(child)
			}
		}
	}

	let serializedNet: SerializedNetwork = { 
		"graph": layersjson, 
		"hyperparameters": setHyperparameterData(),
	}

    return serializedNet
}

/**
 * Takes the hyperparemeters from the html and assigns them to the global model
 */
function setHyperparameterData(): HyperparameterData {
	let learningRate: number;
	let batchSize: number;
	let optimizer_id: string;
	let epochs: number;
	let loss_id: string;
	let hyperparams = document.getElementsByClassName("hyperparamvalue")
	for (let hyperparam of hyperparams) {
		let value = (<HTMLInputElement>document.getElementById(hyperparam.id)).value;
		switch(hyperparam.id){
			case "learningRate":
				learningRate = Number(value);
				break;
			
			case "epochs":
				epochs = parseInt(value);
				break;
			
			case "batchSize":
				batchSize = parseInt(value);
				break;	
		};
	}
	for (let elmt of document.getElementsByClassName("selected")) {
		if (elmt.hasAttribute("data-trainType")) {
			optimizer_id = elmt.id
		} else if (elmt.hasAttribute("data-lossType")){
			loss_id = elmt.id
		} 
	}

	return {
		"learningRate": learningRate,
		"batchSize": batchSize,
		"optimizer_id": optimizer_id,
		"epochs": epochs,
		"loss_id": loss_id,
	}

}

export function stateFromJson(svgData: DraggableData, serializedNet: SerializedNetwork): DraggableData {
	let hyperparams: HyperparameterData = serializedNet.hyperparameters
	setHyperparams(hyperparams)

	let layersJson: Array<LayerJson> = serializedNet.graph;
	return graphFromJson(svgData, layersJson)
}

function setHyperparams(hyperparamData: HyperparameterData){
	let hyperparams = document.getElementsByClassName("hyperparamvalue")
	for (let hyperparam of hyperparams) {
		let paramName = <HTMLInputElement> document.getElementById(<string> hyperparam.id);
		paramName.value = hyperparamData[hyperparam.id].toString();
	}
	document.getElementById("defaultOptimizer").classList.remove("selected")
	document.getElementById(hyperparamData.optimizer_id).classList.add("selected");	
	document.getElementById("defaultLoss").classList.remove("selected")
	document.getElementById(hyperparamData.loss_id).classList.add("selected");	
}

function graphFromJson(svgData: DraggableData, layersJson: Array<LayerJson>): DraggableData {	

	// Make each of the objects without parents and children
	let uidToObject: Map<Number, Layer> = new Map();
	for (let l of layersJson){
		let layer = createLayerInstanceFromName(svgData, l);
		uidToObject[l.id] = layer;
	}

	// Add in all of the parents, children, and activations
	for (let l of layersJson){
		let layer: Layer = uidToObject[l.id];
		for (let child_id of l.children_ids) {
			layer.addChild(uidToObject[child_id]);
		}
		for (let parent_id of l.parent_ids) {
			layer.addParent(uidToObject[parent_id]);
		}
		layer.setParams(l.params)
		if (l.params['activation'] != null){
			createActivationInstanceFromName(svgData, <ActivationLayer>layer, l.params['activation'])
		}
	}

	return svgData
}

function createActivationInstanceFromName(svgData: DraggableData, layer: ActivationLayer,activation_name: string): Activation {
	let activation: Activation;
	switch (activation_name) {
		case "relu":
			activation = new Relu()
			break;
		case "sigmoid":
			activation = new Sigmoid()
			break;
		case "tanh":
			activation = new Tanh()
			break;
		default:
			throw Error(`The specified activation "${activation_name}" was not recognized. `)
	}
	layer.addActivation(activation)
	svgData.draggable.push(activation)
	return activation
}

function createLayerInstanceFromName(svgData: DraggableData, lj: LayerJson): Layer {

	// Create an instance from the instance name. 
	let layer: Layer;
	let location = new Point(lj.xPosition, lj.yPosition)
	switch (lj.layer_name){
		case "Input":
			layer = new Input(); 
			layer.setPosition(location)
			svgData.input = <Input> layer;
			break;
		case "Output": 
			layer = new Output(); 
			layer.setPosition(location)
			svgData.output = <Output> layer;
			break;
		default:
			switch (lj.layer_name) {
				case "MaxPooling2D":
					layer = new MaxPooling2D(location); break;
				case "Dense":
					layer = new Dense(location); break;
				case "Conv2D":
					layer = new Conv2D(location); break;
				case "Concatenate":
					layer = new Concatenate(); break;
				case "Flatten":
					layer = new Flatten(); break;
				default:
					throw Error(`The specified layer "${lj}" was not recognized. `)
			}
			svgData.draggable.push(layer);
			break;
	}

	return layer
}

export function download(content: string, filename: string) {
	let blob = new Blob([content], {
	 type: "text/plain;charset=utf-8"
	});
	saveAs(blob, filename);
} 
