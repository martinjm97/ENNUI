import * as tf from '@tensorflow/tfjs';

import { IMAGE_H, IMAGE_W } from './data';
import { SymbolicTensor } from '@tensorflow/tfjs';
import { Layer, ActivationLayer } from '../ui/shapes/layer';
import { Input } from '../ui/shapes/layers/input';
import { displayError } from '../ui/error';
import { Dense } from '../ui/shapes/layers/dense';
import { MaxPooling2D } from '../ui/shapes/layers/maxpooling';
import { Conv2D } from '../ui/shapes/layers/convolutional';
import { Flatten } from '../ui/shapes/layers/flatten';
import { Concatenate } from '../ui/shapes/layers/concatenate';
import { Output } from '../ui/shapes/layers/output';
import { pythonSkeleton } from './skeleton';

let typeToTensor: Map<string, any> = new Map()

typeToTensor.set("Input", tf.input)
typeToTensor.set("Dense", tf.layers.dense)
typeToTensor.set("MaxPooling2D", tf.layers.maxPooling2d)
typeToTensor.set("Conv2D", tf.layers.conv2d)

// TODO: change this to classes
export let defaults: Map<string, any> = new Map()
defaults.set("Input", {})
defaults.set("Dense", {units: 30})
defaults.set("MaxPooling2D", {poolSize: [2,2]})
defaults.set("Conv2D", {kernelSize: [5,5], filters: 10, stride: [2,2]})
defaults.set("Output", {units: 10, activation: 'softmax'})


export function buildNetworkDAG(input: Input) {
    try {
        return networkDAG(input);
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

export function addInExtraLayers(input: Input) {
    // Initialize queues, dags, and parents (visited) 

    let queue: Layer[] = [input]
    let visited: Set<Layer> = new Set()
    console.log("Building graph... ")
    let toAddFlatten = []
    let toAddConcatenate: Layer[] = []  

    while (queue.length != 0) {
        let current = queue.shift()

        // Dense takes in 1D input so flatten if necessary
        if (current instanceof Dense || current instanceof Output) {
            for (let parent of current.parents){
                
                if (parent instanceof MaxPooling2D || parent instanceof Conv2D || parent instanceof Input) {
                    toAddFlatten.push([current, parent])
                    // current.addParentLayerBetween(new Flatten(), parent)
                }
            }
        }
        
        // Concatentate parents if necessary
        if (current.parents.size > 1 && !(current instanceof Concatenate)) {
            toAddConcatenate.push(current)
            // current.addParentLayer(new Concatenate())
        }

        // Continue BFS
        for (let child of current.children) {
            
            if (!visited.has(child)) {
                queue.push(child)
                visited.add(child)
            }
        }
    }

    for (let [layer, parent] of toAddFlatten){
        layer.addParentLayerBetween(new Flatten(), parent)
    }

    for (let layer of toAddConcatenate){
        layer.addParentLayer(new Concatenate())
    }
}

export function topologicalSort(input: Input): Layer[] {
    // Kahn's algorithm
    let sorted: Layer[] = []
    let visited: Set<Layer> = new Set()
    let frontier: Layer[] = [input]
    while (frontier.length > 0) {
        let layer = frontier.pop()
        visited.add(layer)
        sorted.push(layer)
        for (let child of layer.children) {
            // Check if we've already visited all parents
            let canAdd = true
            for (let parent of child.parents){
                canAdd = visited.has(parent)
                if (!canAdd) {
                    break
                }
            }

            // All dependencies are added then add child
            if (canAdd) {
                frontier.push(child)
            }
        }
    }
    return sorted
}

/**
 * Creates corresponding python code.
 * @param sorted topologically sorted list of layers
 */
export function generatePython(sorted: Layer[]){
    let pythonScript: string = ""
    console.log(sorted)
    for (let layer of sorted) {
        let layerstring = layer.lineOfPython();
        let applystring = ""; // Nothing to apply if no parents (input)
        if(layer.parents.size == 1) {
            applystring = `(x${layer.parents.values().next().value.uid})`;
        } else if (layer.parents.size > 1) {
            applystring = `([${[...layer.parents].map(p => "x" + p.uid).join(", ")}])`;
        }
        pythonScript += `x${layer.uid} = ` + layerstring + applystring + "\n";
    }
    pythonScript += `model = Model(inputs= x${sorted[0].uid}, outputs=x${sorted[sorted.length-1].uid})\n`
    return pythonSkeleton(pythonScript)
}

/**
 * Creates corresponding python code.
 * @param sorted topologically sorted list of layers
 */
function generateTfjsModel(sorted: Layer[]){
    sorted.forEach(layer => layer.generateTfjsLayer())
    let input = sorted[0].getTfjsLayer()
    let output = sorted[sorted.length - 1].getTfjsLayer()
    return tf.model({inputs: input, outputs: output})    
}

function networkDAG(input: Input){
    let newInput = <Input> input.clone();
    cloneNetwork(input, newInput);
    addInExtraLayers(newInput);
    let toposorted = topologicalSort(newInput);
    let model = generateTfjsModel(toposorted);
    console.log(model.summary());
    return model;
}
