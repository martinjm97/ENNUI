// Adapted from https://github.com/tensorflow/tfjs-examples/tree/master/mnist
import * as tf from '@tensorflow/tfjs';

import {IMAGE_H, IMAGE_W, MnistData} from './data';
import { SymbolicTensor } from '@tensorflow/tfjs';

// Not using their ui now.
// import * as ui from './ui';

/**
 * Creates a convolutional neural network (Convnet) for the MNIST data.
 *
 * @returns {tf.Model} An instance of tf.Model.
 */
function createModel() {
  // Creating a DAG neural network architecture
  // TODO: eval("generated script")
  const inputs = tf.input({shape: [10]});
  const dense1 = tf.layers.dense({units: 8}).apply(inputs);
  // const dense2 = tf.layers.dense({units: 8}).apply(inputs);
  const concat = tf.layers.concatenate().apply(dense1);
  const predictions = tf.layers.dense({units: 3, activation: 'softmax'}).apply(concat);
  const model = tf.model({inputs: inputs, outputs: <SymbolicTensor> predictions});
  return model;
}

/**
 * Compile and train the given model.
 *
 * @param {*} model The model to
 */
async function train(model) {
  // TODO: start method
  // ui.logStatus('Training model...');

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
  const trainEpochs = 12;

  // We'll keep a buffer of loss and accuracy values over time.
  let trainBatchCount = 0;

  const trainData = data.getTrainData();
  const testData = data.getTestData();

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
      // onBatchEnd: async (batch, logs) => {
      //   trainBatchCount++;
      //   ui.logStatus(
      //       `Training... (` +
      //       `${(trainBatchCount / totalNumBatches * 100).toFixed(1)}%` +
      //       ` complete). To stop training, refresh or close page.`);
      //   ui.plotLoss(trainBatchCount, logs.loss, 'train');
      //   ui.plotAccuracy(trainBatchCount, logs.acc, 'train');
      //   await tf.nextFrame();
      // },
      // onEpochEnd: async (epoch, logs) => {
      //   valAcc = logs.val_acc;
      //   ui.plotLoss(trainBatchCount, logs.val_loss, 'validation');
      //   ui.plotAccuracy(trainBatchCount, logs.val_acc, 'validation');
      //   await tf.nextFrame();
      // }
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

/**
 * Show predictions on a number of test examples.
 *
 * @param {tf.Model} model The model to be used for making the predictions.
 */
async function showPredictions(model) {
  const testExamples = 100;
  const examples = data.getTestData(testExamples);

  // Code wrapped in a tf.tidy() function callback will have their tensors freed
  // from GPU memory after execution without having to call dispose().
  // The tf.tidy callback runs synchronously.
  tf.tidy(() => {
    const output = model.predict(examples.xs);
    const axis = 1;
    const labels = Array.from(examples.labels.argMax(axis).dataSync());
    const predictions = Array.from(output.argMax(axis).dataSync());
    // TODO: Display results
    // ui.showTestResults(examples, predictions, labels);
  });
}

let data;
async function load() {
  data = new MnistData();
  await data.load();
}

// This is our main function. It loads the MNIST data, trains the model, and
// then shows what the model predicted on unseen test data.
// ui.setTrainButtonCallback(async () => {
//   ui.logStatus('Loading MNIST data...');
//   await load();

//   ui.logStatus('Creating model...');
//   const model = createModel();
//   model.summary();

//   ui.logStatus('Starting model training...');
//   await train(model);

//   showPredictions(model);
// });