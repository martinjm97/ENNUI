import * as tf from '@tensorflow/tfjs';

import {IMAGE_H, IMAGE_W, MnistData} from './data';
import { SymbolicTensor } from '@tensorflow/tfjs';
import { Input, Layer } from '../ui/shapes/layer';

let typeToTensor: Map<String, any> = new Map()

typeToTensor.set("Input", tf.input)
typeToTensor.set("Dense", tf.layers.dense)
typeToTensor.set("MaxPooling2D", tf.layers.maxPooling2d)
typeToTensor.set("Conv2D", tf.layers.conv2d)
// typeToTensor.set("output", tf)

let defaults: Map<String, any> = new Map()
defaults.set("Input", {units: 10})
defaults.set("Dense", {units: 10, activation: 'relu'})
defaults.set("MaxPooling2D", {units: 10, activation: 'relu'})
defaults.set("Conv2D", {units: 10, activation: 'relu'})

export function buildNetwork(input: Input) {
    // Create a sequential neural network model. tf.sequential provides an API
  // for creating "stacked" models where the output from one layer is used as
  // the input to the next layer.
//   const model = tf.sequential();

//   // The first layer of the convolutional neural network plays a dual role:
//   // it is both the input layer of the neural network and a layer that performs
//   // the first convolution operation on the input. It receives the 28x28 pixels
//   // black and white images. This input layer uses 16 filters with a kernel size
//   // of 5 pixels each. It uses a simple RELU activation function which pretty
//   // much just looks like this: __/
//   model.add(tf.layers.conv2d({
//     inputShape: [IMAGE_H, IMAGE_W, 1],
//     kernelSize: 3,
//     filters: 16,
//     activation: 'relu'
//   }));

//   // After the first layer we include a MaxPooling layer. This acts as a sort of
//   // downsampling using max values in a region instead of averaging.
//   // https://www.quora.com/What-is-max-pooling-in-convolutional-neural-networks
//   model.add(tf.layers.maxPooling2d({poolSize: 2, strides: 2}));

//   // Our third layer is another convolution, this time with 32 filters.
//   model.add(tf.layers.conv2d({kernelSize: 3, filters: 32, activation: 'relu'}));

//   // Max pooling again.
//   model.add(tf.layers.maxPooling2d({poolSize: 2, strides: 2}));

//   // Add another conv2d layer.
//   model.add(tf.layers.conv2d({kernelSize: 3, filters: 32, activation: 'relu'}));

//   // Now we flatten the output from the 2D filters into a 1D vector to prepare
//   // it for input into our last layer. This is common practice when feeding
//   // higher dimensional data to a final classification output layer.
//   model.add(tf.layers.flatten({}));

//   model.add(tf.layers.dense({units: 64, activation: 'relu'}));

//   // Our last layer is a dense layer which has 10 output units, one for each
//   // output class (i.e. 0, 1, 2, 3, 4, 5, 6, 7, 8, 9). Here the classes actually
//   // represent numbers, but it's the same idea if you had classes that
//   // represented other entities like dogs and cats (two output classes: 0, 1).
//   // We use the softmax function as the activation for the output layer as it
//   // creates a probability distribution over our 10 classes so their output
//   // values sum to 1.
//   model.add(tf.layers.dense({units: 10, activation: 'softmax'}));

//   return model;
    // Initialize queues, dags, and parents (visited) 
    let queue: Layer[] = [input]
    const inputLayer = tf.input({shape: [IMAGE_H, IMAGE_W, 1]})
    let nextLayer = inputLayer
    // let children: Map<Layer, any> = new Map()
	let visited: Set<Layer> = new Set()
    // let json: {}[] = []
    console.log("test1")
	while (queue.length != 0) {
        let current = queue.shift()
        if (current.layerType != "Input" && current.layerType != "Output") {
            console.log("test1", current)
            if (nextLayer.shape.length > 2 && current.layerType == "Dense") {
                nextLayer = <SymbolicTensor>tf.layers.flatten().apply(nextLayer)
            }
            nextLayer = typeToTensor.get(current.layerType)(defaults.get(current.layerType)).apply(nextLayer)
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
    
    console.log("hi")
    let test = tf.model({inputs: inputLayer, outputs: <SymbolicTensor> nextLayer})
    console.log(test)
    console.log("hi")
    return test
// 	console.log(json)




//   // Creating a DAG neural network architecture
// //   const inputs = tf.input({shape: [10]});
//   const dense1 = tf.layers.dense({units: 8}).apply(inputs);
//   // const dense2 = tf.layers.dense({units: 8}).apply(inputs);
//   const concat = tf.layers.concatenate().apply(dense1);
//   const predictions = tf.layers.dense({units: 3, activation: 'softmax'}).apply(concat);
//   const model = tf.model({inputs: inputs, outputs: <SymbolicTensor> predictions});
//   return model;
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
        // TODO: ADD LOGGING!
        onBatchEnd: async (batch, logs) => {
            trainBatchCount++;
            console.log(batch, logs)
            let accBox = document.getElementById('ti_acc');
            let lossBox = document.getElementById('ti_loss');
            accBox.children[1].innerHTML = String(Number((100*logs.acc).toFixed(2)))
            lossBox.children[1].innerHTML = String(Number((logs.loss).toFixed(2)))
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
    // TODO: Add a termination message
    // ui.logStatus(
    //     `Final validation accuracy: ${finalValAccPercent.toFixed(1)}%; ` +
    //     `Final test accuracy: ${testAccPercent.toFixed(1)}%`);
}