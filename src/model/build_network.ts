import * as tf from '@tensorflow/tfjs';

import {IMAGE_H, IMAGE_W, MnistData} from './data';
import { SymbolicTensor } from '@tensorflow/tfjs';
import { Input, Layer, Output } from '../ui/shapes/layer';
import { text } from 'd3';
import { assert } from '@tensorflow/tfjs-core/dist/util';

let typeToTensor: Map<String, any> = new Map()

typeToTensor.set("Input", tf.input)
typeToTensor.set("Dense", tf.layers.dense)
typeToTensor.set("MaxPooling2D", tf.layers.maxPooling2d)
typeToTensor.set("Conv2D", tf.layers.conv2d)
// typeToTensor.set("output", tf)

let defaults: Map<String, any> = new Map()
defaults.set("Input", {units: 10})
defaults.set("Dense", {units: 10, activation: 'relu'})
defaults.set("MaxPooling2D", {units: 10, activation: 'relu', poolSize: 2, strides: 2})
defaults.set("Conv2D", {units: 10, activation: 'relu', kernelSize: 3, filters: 20})

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
            nextLayer = typeToTensor.get(current.layerType)(defaults.get(current.layerType)).apply(nextLayer)
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
    let test = tf.model({inputs: inputLayer, outputs: <SymbolicTensor> nextLayer})
    return test
}

export function buildNetworkDAG(out: Layer) {
    let input = null
    let cache: Map<Layer, any> = new Map()
    function dfs(out: Layer) {
        console.log("Entering DAG... ")
        console.log(out)
        // Check the memo
        if (cache.has(out)) {
            return cache.get(out)
        }

        // When we reach the 
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
            prevLayer = <SymbolicTensor> tf.layers.concatenate().apply(preds)
            if (prevLayer.shape.length > 2) {
                prevLayer = <SymbolicTensor> tf.layers.flatten().apply(prevLayer)
            }
        } else {  // a single layer
            prevLayer = preds[0]
            console.log("About to try to combine... ")
            console.log(prevLayer)
            if (prevLayer.shape.length > 2 && out.layerType == "Dense") {  // ensure input dimensions
                prevLayer = <SymbolicTensor> tf.layers.flatten().apply(prevLayer)
            }
        }

        // We want to add the node to the graph and memoize         
        if (out.layerType != "Output"){
            let layer = typeToTensor.get(out.layerType)(defaults.get(out.layerType)).apply(prevLayer)
            cache.set(out, layer)
            return layer
        }

        // When it's output we make an extra dense with a softmax to output something of the right dimensions
        prevLayer = <SymbolicTensor> tf.layers.dense({units: 10, activation: 'softmax'}).apply(prevLayer)
        return tf.model({inputs: input, outputs: <SymbolicTensor> prevLayer})
    }
    return dfs(out)
}


/**
 * Compile and train the given model.
 *
 * @param {*} model The model to
 */
export async function train(model) {
    // TODO: start method
    // ui.logStatus('Training model...');

    let data = new MnistData();
    await data.load();

    const LEARNING_RATE = 0.01;
    const optimizer = 'rmsprop';

    model.compile({
        optimizer,
        loss: 'categoricalCrossentropy',
        metrics: ['accuracy'],
    });

    const batchSize = 64;
    const validationSplit = 0.15;

    // const trainEpochs = ui.getTrainEpochs();
    const trainEpochs = 6;

    // We'll keep a buffer of loss and accuracy values over time.
    let trainBatchCount = 0;

    const trainData = data.getTrainData();
    const testData = data.getTestData(100);

    const totalNumBatches =
        Math.ceil(trainData.xs.shape[0] * (1 - validationSplit) / batchSize) *
        trainEpochs;

    let valAcc;
    await model.fit(trainData.xs, trainData.labels, {
        batchSize,
        validationSplit,
        epochs: trainEpochs,
        callbacks: {
        onBatchEnd: async (batch, logs) => {
            trainBatchCount++;
            console.log(batch, logs)
            let accBox = document.getElementById('ti_acc');
            let lossBox = document.getElementById('ti_loss');
            let trainBox = document.getElementById('ti_training');
            accBox.children[1].innerHTML = String(Number((100*logs.acc).toFixed(2)))
            lossBox.children[1].innerHTML = String(Number((logs.loss).toFixed(2)))
            trainBox.children[1].innerHTML = String((trainBatchCount / totalNumBatches * 100).toFixed(1)+'%')

            console.log(
                `Training... (` +
                `${(trainBatchCount / totalNumBatches * 100).toFixed(1)}%` +
                ` complete). To stop training, refresh or close page.`);
        //   console.log.plotLoss(trainBatchCount, logs.loss, 'train');
        //   ui.plotAccuracy(trainBatchCount, logs.acc, 'train');
            await tf.nextFrame();
        },
        onEpochEnd: async (epoch, logs) => {
            let valAcc = logs.val_acc;
            let valLoss = logs.val_loss;
            let vaccBox = document.getElementById('ti_vacc');
            let vlossBox = document.getElementById('ti_vloss');
            vaccBox.children[1].innerHTML = String(Number((100*valAcc).toFixed(2)))
            vlossBox.children[1].innerHTML = String(Number((valLoss).toFixed(2)))
        //   ui.plotLoss(trainBatchCount, logs.val_loss, 'validation');
        //   ui.plotAccuracy(trainBatchCount, logs.val_acc, 'validation');
            await tf.nextFrame();
        }
        }
    });

    const testResult = model.evaluate(testData.xs, testData.labels);
    const testAccPercent = testResult[1].dataSync()[0] * 100;
    const finalValAccPercent = valAcc * 100;
    
    // elmt.style.background = '#007400'
    // let trainingBox = document.getElementById('ti_training');
    // trainingBox.children[1].innerHTML = 'No'

    // TODO: Add a termination message
    // ui.logStatus(
    //     `Final validation accuracy: ${finalValAccPercent.toFixed(1)}%; ` +
    //     `Final test accuracy: ${testAccPercent.toFixed(1)}%`);
}