import * as tf from '@tensorflow/tfjs';

import { Layer, ActivationLayer } from '../ui/shapes/layer';
import { Input } from '../ui/shapes/layers/input';
import { displayError } from '../ui/error';
import { pythonSkeleton } from './python_skeleton';
import { juliaSkeleton } from './julia_skeleton';

export function buildNetworkDAG(input: Input) {
    let toposorted = topologicalSort(input);
    try {
        return networkDAG(toposorted);
    } catch(err) {
        displayError(err)
    }
}

export function cloneNetwork(input: Input, newInput: Input) {
    // Initialize queues, dags, and parents (visited)

    let oldId2Clone = {}
    oldId2Clone[input.uid] = newInput

    let queue: Layer[] = [input]
    let visited: Set<Layer> = new Set()

    let newLayer : Layer
    while (queue.length != 0) {
        let current = queue.shift()

        // Clone layer
        if (current != input) {
            if (!(current.uid in oldId2Clone)) {
                newLayer = current.clone()
                oldId2Clone[current.uid] = newLayer
            }
            else {
                newLayer = oldId2Clone[current.uid]
            }


            // Add in cloned parent/child relations

            for (let p of current.parents) {

                if(!(p.uid in oldId2Clone)) {
                    oldId2Clone[p.uid] = p.clone()

                }
                let newParent = oldId2Clone[p.uid]
                newParent.addChild(newLayer, false)
                newLayer.addParent(newParent)
            }
        }

        else {
            newLayer = newInput
        }

        // Continue BFS
        for (let child of current.children) {

            if (!visited.has(child)) {
                queue.push(child)
                visited.add(child)
            }
        }
    }
}

export function topologicalSort(input: Input, showErrors=true): Layer[] {
    // Kahn's algorithm
    let sorted: Layer[] = [];
    let visited: Set<Layer> = new Set();
    let frontier: Layer[] = [input];
    let potentialBranch: Set<Number> = new Set(); // This is to detect if we have a branch that doesn't start from input

    while (frontier.length > 0) {
        let layer = frontier.pop();
        visited.add(layer);
        sorted.push(layer);

        if (potentialBranch.has(layer.uid)) {
            potentialBranch.delete(layer.uid)
        }

        for (let child of layer.children) {

            // Check not a loop
            let childIndex = sorted.indexOf(child);

            if (childIndex >= 0 && childIndex < sorted.indexOf(layer)) {
                displayError(new Error("Cannot have backwards edges"));
            }

            // Check if we've already visited all parents
            let canAdd = true;
            for (let parent of child.parents){

                canAdd = visited.has(parent);
                if (!canAdd) {
                    potentialBranch.add(parent.uid)
                    break;
                }
            }

            // All dependencies are added then add child
            if (canAdd) {
                frontier.push(child);
            }
        }
    }

    // Either there are layers with no parents (other than input), there is a cycle, or output is never reached
    if (sorted[sorted.length - 1].layerType != "Output" && showErrors) {

        if (potentialBranch.size > 0) {
            displayError(new Error("All layers must have input as an ancestor."));
        }

        else{
            displayError(new Error("Something is wrong with your network architecture."));
        }
    }

    return sorted
}

/**
 * Creates corresponding Python code.
 * @param sorted topologically sorted list of layers
 */
export function generatePython(sorted: Layer[]){
    let pythonScript: string = ""
    for (let layer of sorted) {
        let layerstring = layer.lineOfPython();
        let applystring = ""; // Nothing to apply if no parents (input)
        if(layer.parents.size == 1) {
            applystring = `(x${layer.parents.values().next().value.uid})`;
        } else if (layer.parents.size > 1) {
            applystring = `([${[...layer.parents].map(p => "x" + p.uid).join(", ")}])`;
        }
        pythonScript += `x${layer.uid} = ` + layerstring + applystring + "\n";

        // TODO: Move this to BatchNorm and generalize layerstring to an array
        if(layer.layerType == "BatchNorm" && (<ActivationLayer> layer).activation != null) {
            if(this.activation != null && this.activation.activationType != "relu") {
                displayError(new Error("Batch Normalization does not support activations other than ReLu"));
            }
            pythonScript += `x${layer.uid} = ` + "ReLU()" + `(x${layer.uid})`  + "\n";
        }
    }
    pythonScript += `model = Model(inputs=x${sorted[0].uid}, outputs=x${sorted[sorted.length-1].uid})`
    return pythonSkeleton(pythonScript)
}

/**
 * Creates corresponding Julia code.
 * @param sorted topologically sorted list of layers
 */
export function generateJulia(sorted: Layer[]): string {
    let juliaInitialization:string = "";
    let juliaScript: string = "";
    for (let layer of sorted) {
        juliaInitialization += layer.initLineOfJulia();
        juliaScript += layer.lineOfJulia();
    }
    return juliaSkeleton(juliaInitialization, juliaScript);
}

/**
 * Creates corresponding python code.
 * @param sorted topologically sorted list of layers
 */
export function generateTfjsModel(sorted: Layer[]){
    sorted.forEach(layer => layer.generateTfjsLayer());
    let input = sorted[0].getTfjsLayer();
    let output = sorted[sorted.length - 1].getTfjsLayer();
    return tf.model({inputs: input, outputs: output});
}

function networkDAG(toposorted){
    let model = generateTfjsModel(toposorted);
    console.log(model.summary());
    return model;
}
