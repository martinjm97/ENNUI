import { DraggableData } from "../ui/app";
import { Layer } from "../ui/shapes/layer";
import { saveAs } from 'file-saver';


interface layerJson {
    layer_name: string
    id: number
    children_ids: Array<number>
    parent_ids: Array<number>
    params: Map<string, any> 
}

function graphToJson(svgData: DraggableData): layerJson[] {
	// Initialize queues, dags, and parents (visited) 
	let queue: Layer[] = [svgData.input]
	let visited: Set<Layer> = new Set()
	let json: jsonModel = []
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
	console.log(json)
}

function jsonToPython(){}


export function download(content: string, filename: string) {
	let blob = new Blob([content], {
	 type: "text/plain;charset=utf-8"
	});
	saveAs(blob, filename);
} 