import { DraggableData } from "../ui/app";
import { Layer, layerJson, ActivationLayer } from "../ui/shapes/layer";
import { saveAs } from 'file-saver';
import { Point } from "../ui/shapes/shape";
import { Input } from "../ui/shapes/layers/input";
import { Output } from "../ui/shapes/layers/output";


export function graphToJson(svgData: DraggableData): layerJson[] {
	// Initialize queues, dags, and parents (visited) 
	let queue: Layer[] = [svgData.input]
	let visited: Set<Layer> = new Set()
	let json: layerJson[] = []
	while (queue.length != 0) {
		let current = queue.shift()
		json.push(current.toJson())
		// check each connections of the node
		for (let child of current.children) {
			if (!visited.has(child)) {
				queue.push(child)
				visited.add(child)
			}
		}
    }
    return json
}

export function jsonToLayers(layersJson: layerJson[]): DraggableData {
	
	let svgData: DraggableData = {
		draggable : [],
		input: null,
		output: null
	}	

	// Make each of the objects without parents and children
	let uidToObject: Map<Number, Layer> = new Map() 
	for (let l of layersJson){
		// let layerProto = Object.create(window[l.layer_name].prototype);
		// let layer: Layer = layerProto.constructor.apply(Point.randomPoint(100, 40, ActivationLayer.defaultInitialLocation))
		let layer: Layer = eval(`new ${l.layer_name}(Point.randomPoint(100, 40, ActivationLayer.defaultInitialLocation))`)
		if (l.layer_name = new Input().layerType) {
			svgData.input = <Input> layer
		} else if (l.layer_name = new Output().layerType) {
			svgData.output = <Output> layer
		} else {
			svgData.draggable.push(layer)
		}
		uidToObject[l.id] = layer
	}

	// Add in all of the children
	for (let l of layersJson){
		let layer: Layer = uidToObject[l.id]
		for (let child_id of l.children_ids) {
			layer.addChild(uidToObject[child_id])
		}
		for (let parent_id of l.parent_ids) {
			layer.addChild(uidToObject[parent_id])
		}
		// TODO: params
		// l.params
	}


	return svgData
	
}

export function download(content: string, filename: string) {
	let blob = new Blob([content], {
	 type: "text/plain;charset=utf-8"
	});
	saveAs(blob, filename);
} 
