import { DraggableData } from "../ui/app";
import { Layer, layerJson } from "../ui/shapes/layer";
import { saveAs } from 'file-saver';


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

function jsonToPython(){}


export function download(content: string, filename: string) {
	let blob = new Blob([content], {
	 type: "text/plain;charset=utf-8"
	});
	saveAs(blob, filename);
} 
