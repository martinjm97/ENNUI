import * as tf from '@tensorflow/tfjs';

import {IMAGE_H, IMAGE_W, MnistData} from './data';
import { SymbolicTensor } from '@tensorflow/tfjs';
import { Input, Layer, ActivationLayer } from '../ui/shapes/layer';
import { plotLoss, plotAccuracy } from './graphs';

let typeToTensor: Map<String, any> = new Map()

typeToTensor.set("Input", tf.input)
typeToTensor.set("Dense", tf.layers.dense)
typeToTensor.set("MaxPooling2D", tf.layers.maxPooling2d)
typeToTensor.set("Conv2D", tf.layers.conv2d)

let defaults: Map<String, any> = new Map()
defaults.set("Input", {units: 10})
defaults.set("Dense", {units: 10, activation: 'relu'})
defaults.set("MaxPooling2D", {poolSize: 2, activation: 'relu'})
defaults.set("Conv2D", {kernelSize: 3, filters: 32, activation: 'relu'})

export function buildNetwork(input: Input) {
    // Initialize queues, dags, and parents (visited) 
    let queue: Layer[] = [input]
    const inputLayer = tf.input({shape: [IMAGE_H, IMAGE_W, 1]})
    let nextLayer = inputLayer
    // let children: Map<Layer, any> = new Map()
	let visited: Set<Layer> = new Set()
    // let json: {}[] = []
    console.log("Building graph... ")
	while (queue.length != 0) {
        let current = queue.shift()
        if (current.layerType != "Input" && current.layerType != "Output") {
            if (nextLayer.shape.length > 2 && current.layerType == "Dense") {
                nextLayer = <SymbolicTensor> tf.layers.flatten().apply(nextLayer)
            }
            let params = defaults.get(current.layerType)
            if ((<ActivationLayer>current).activation != null) {
                params.activation = (<ActivationLayer>current).activation.activationType
            }
            nextLayer = typeToTensor.get(current.layerType)(params).apply(nextLayer)
            console.log("test2")
        }
        
		// check each connections of the node
		for (let child of current.children) {
			if (!visited.has(child)) {
				queue.push(child)
				visited.add(child)
			}
		}
    }
    
    console.log("Building model... ")
    nextLayer = <SymbolicTensor>tf.layers.dense({units: 10, activation: 'softmax'}).apply(nextLayer)
    let test = tf.model({inputs: inputLayer, outputs: <SymbolicTensor> nextLayer})
    return test
}

export function buildNetworkDAG(out: Layer) {
    try {
        return networkDAG(out);
    }
      catch(err) {
        // document.getElementById("x").style.display = null;
        document.getElementById("error").style.display = null;
        document.getElementById("errorMessage").innerHTML = err.message;
        document.getElementById("error").title = err.message;
        throw err;
    }
}

function networkDAG(out: Layer) {
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


