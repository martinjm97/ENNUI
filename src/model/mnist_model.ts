// Adapted from https://github.com/tensorflow/tfjs-examples/tree/master/mnist

import * as tf from '@tensorflow/tfjs';
import {plotAccuracy, plotLoss, showPredictions, setupPlots, setupTestResults, showConfusionMatrix, resetPlotValues} from './graphs';

import {dataset} from './data';
import { model } from './paramsObject';
import { tabSelected } from '../ui/app';

/**
 * Compile and train the given model.
 *
 * @param {*} model The model to
 */
 
export async function train() {
    // TODO: start method
    // ui.logStatus('Training model...');
    // TODO: This is where we should do caching.
    resetPlotValues();
    setupPlots();
    setupTestResults();
    await dataset.load();
    
    let onIteration = () => showPredictions()
    let optimizer = model.params.getOptimizer()
  
    
    model.architecture.compile({
        optimizer,
        loss: model.params.loss,
        metrics: ['accuracy'],
    });
    const batchSize = model.params.batchSize;
    const validationSplit = 0.15;
  
    // const trainEpochs = getTrainEpochs();
    const trainEpochs = model.params.epochs;
  
    // We'll keep a buffer of loss and accuracy values over time.
    let trainBatchCount: number = 0;
    let prevTrainBatchCount: number = 0;
    let totalLoss: number = 0;
    let totalAccuracy: number = 0;
    let plotLossFrequency: number = 25;
  
    const trainData = dataset.getTrainData();
    const testData = dataset.getTestData();
    const totalNumBatches =
        Math.ceil(trainData.xs.shape[0] * (1 - validationSplit) / batchSize) *
        trainEpochs;
    let valAcc;
    await model.architecture.fit(trainData.xs, trainData.labels, {
        batchSize,
        validationSplit,
        epochs: trainEpochs,
        callbacks: {
            onBatchEnd: async (batch, logs) => {
                trainBatchCount++;
                let accBox = document.getElementById('ti_acc');
                let lossBox = document.getElementById('ti_loss');
                let trainBox = document.getElementById('ti_training');
                accBox.children[1].innerHTML = String(Number((100*logs.acc).toFixed(2)))
                lossBox.children[1].innerHTML = String(Number((logs.loss).toFixed(2)))
                trainBox.children[1].innerHTML = String((trainBatchCount / totalNumBatches * 100).toFixed(1)+'%')
                // For logging training in console.
                //   console.log(
                //       `Training... (` +
                //       `${(trainBatchCount / totalNumBatches * 100).toFixed(1)}%` +
                //       ` complete). To stop training, refresh or close page.`);
                totalLoss += logs.loss;
                totalAccuracy += logs.acc;
                if (batch % plotLossFrequency === 0) {
                  // Compute the average loss for the last plotLossFrequency iterations
                  plotLoss(trainBatchCount, totalLoss / (trainBatchCount - prevTrainBatchCount), 'train');
                  plotAccuracy(trainBatchCount, totalAccuracy / (trainBatchCount - prevTrainBatchCount), 'train');
                  prevTrainBatchCount = trainBatchCount
                  totalLoss = 0;
                  totalAccuracy = 0;
                }
                if (batch % 60 === 0) {
                  onIteration();
                }
                await tf.nextFrame();
            },
            onEpochEnd: async (epoch, logs) => {
                let valAcc = logs.val_acc;
                let valLoss = logs.val_loss;
                let vaccBox = document.getElementById('ti_vacc');
                let vlossBox = document.getElementById('ti_vloss');
                vaccBox.children[1].innerHTML = String(Number((100*valAcc).toFixed(2)))
                vlossBox.children[1].innerHTML = String(Number((valLoss).toFixed(2)))
                plotLoss(trainBatchCount, logs.val_loss, 'validation');
                plotAccuracy(trainBatchCount, logs.val_acc, 'validation');
                showConfusionMatrix();
                onIteration();                
                await tf.nextFrame();
            }
        }
    });

    const testResult = model.architecture.evaluate(testData.xs, testData.labels);

    let vaccBox = document.getElementById('ti_vacc');
    let vlossBox = document.getElementById('ti_vloss');
    vaccBox.children[1].innerHTML = String(Number((100*testResult[1].dataSync()[0] ).toFixed(2)))
    vlossBox.children[1].innerHTML = String(Number((testResult[0].dataSync()[0]).toFixed(2)))

    
    // elmt.style.background = '#007400'
    // let trainingBox = document.getElementById('ti_training');
    // trainingBox.children[1].innerHTML = 'No'
  
    // TODO: Add a termination message
    // ui.logStatus(
    //     `Final validation accuracy: ${finalValAccPercent.toFixed(1)}%; ` +
    //     `Final test accuracy: ${testAccPercent.toFixed(1)}%`);
}