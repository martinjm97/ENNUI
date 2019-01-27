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
defaults.set("Dense", {units: 30, activation: 'relu'})
defaults.set("MaxPooling2D", {poolSize: [2,2], activation: 'relu'})
defaults.set("Conv2D", {kernelSize: [5,5], filters: 10, stride: [2,2], activation: 'relu'})
defaults.set("Output", {units: 10, activation: 'softmax'})


export function buildNetworkDAG(input: Input) {
    try {
        return networkDAG(input);
    } catch(err) {
        displayError(err)
    }
}
export function buildNetworkDAG2(out: Layer) {
    try {
        return networkDAG2(out);
    } catch(err) {
        displayError(err)
    }
}

function networkDAG2(out: Layer) {
    let input = null
    let cache: Map<Layer, any> = new Map()
    function dfs(out: Layer) {
        console.log("Entering DAG... ")
        console.log(out)
        // Check the memo
        if (cache.has(out)) {
            return cache.get(out)
        }

        // When we reach the input
        if (out.layerType == "Input") {
            console.log("Should be input... ")
            console.log(out)
            input = tf.input({shape: [IMAGE_H, IMAGE_W, 1]})
            cache.set(out, input)
            return input
        }
    
        let parents = out.parents
        let preds: SymbolicTensor[] = []
        for (let parent of parents) {
            preds.push(<SymbolicTensor> dfs(parent))
        }
        let prevLayer: SymbolicTensor = null 
        if (preds.length > 1) {  // multiple layers coming in are concatentated
            console.log("Should be output... ")
            console.log(out)
            let l = []
            for (let pred of preds) {
                if (pred.shape.length > 2) {
                    pred = <SymbolicTensor> tf.layers.flatten().apply(pred)
                }
                l.push(pred)
            }
            prevLayer = <SymbolicTensor> tf.layers.concatenate().apply(l)
            if (prevLayer.shape.length > 2) {
                prevLayer = <SymbolicTensor> tf.layers.flatten().apply(prevLayer)
            }
        } else {  // a single layer
            prevLayer = preds[0]
            console.log("Single layer... ")
            console.log(prevLayer)
            if (prevLayer.shape.length > 2 && out.layerType == "Dense") {  // ensure input dimensions
                prevLayer = <SymbolicTensor> tf.layers.flatten().apply(prevLayer)
            }
        }

        // We want to add the node to the graph and memoize         
        if (out.layerType != "Output"){
            let parameters = defaults.get(out.layerType)
            let config = out.toJson().params
            for (let param in config) {
                parameters[param] = config[param]
            }
            console.log(parameters)
            let layer = typeToTensor.get(out.layerType)(parameters).apply(prevLayer)
            cache.set(out, layer)
            return layer
        }

        // When it's output we make an extra dense with a softmax to output something of the right dimensions
        if (prevLayer.shape.length > 2) {
            prevLayer = <SymbolicTensor> tf.layers.flatten().apply(prevLayer)
        }
        prevLayer = <SymbolicTensor> tf.layers.dense({units: 10, activation: 'softmax'}).apply(prevLayer)
        return tf.model({inputs: input, outputs: <SymbolicTensor> prevLayer})
    }
    return dfs(out)
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
    addInExtraLayers(input)
    let toposorted = topologicalSort(input)
    let model = generateTfjsModel(toposorted)
    console.log(model.summary())
    return model
}