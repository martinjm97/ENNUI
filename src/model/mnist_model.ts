// Adapted from https://github.com/tensorflow/tfjs-examples/tree/master/mnist

import * as tf from "@tensorflow/tfjs";
import {plotAccuracy,
        plotLoss,
        resetPlotValues,
        setupPlots,
        setupTestResults,
        showConfusionMatrix,
        showPredictions} from "./graphs";

import {dataset} from "./data";
import { model } from "./paramsObject";

/**
 * Compile and train the given model.
 *
 * @param {*} model The model to
 */
export async function train(): Promise<void> {
    // Set up all of the plots
    resetPlotValues();
    setupPlots();
    setupTestResults();
    await dataset.load();

    const onIteration = () => showPredictions();
    const optimizer = model.params.getOptimizer();

    model.architecture.compile({
        loss: model.params.loss,
        metrics: ["accuracy"],
        optimizer,
    });
    const batchSize = model.params.batchSize;
    const validationSplit = 0.15;

    const trainEpochs = model.params.epochs;

    // We'll keep a buffer of loss and accuracy values over time.
    let trainBatchCount: number = 0;
    let prevTrainBatchCount: number = 0;
    let totalLoss: number = 0;
    let totalAccuracy: number = 0;
    const plotLossFrequency: number = 25;

    const trainData = dataset.getTrainData();
    const testData = dataset.getTestData();
    const totalNumBatches = Math.ceil(trainData.xs.shape[0] * (1 - validationSplit) / batchSize) * trainEpochs;

    await model.architecture.fit(trainData.xs, trainData.labels, {
        batchSize,
        callbacks: {
            onBatchEnd: async (batch: number, logs: tf.Logs) => {
                trainBatchCount++;
                const accBox = document.getElementById("ti_acc");
                const lossBox = document.getElementById("ti_loss");
                const trainBox = document.getElementById("ti_training");
                accBox.children[1].innerHTML = String(Number((100 * logs.acc).toFixed(2)));
                lossBox.children[1].innerHTML = String(Number((logs.loss).toFixed(2)));
                trainBox.children[1].innerHTML = String((trainBatchCount / totalNumBatches * 100).toFixed(1) + "%");
                // For logging training in console.
                // console.log(
                //     `Training... (` +
                //     `${(trainBatchCount / totalNumBatches * 100).toFixed(1)}%` +
                //     ` complete). To stop training, refresh or close page.`);
                totalLoss += logs.loss;
                totalAccuracy += logs.acc;
                if (batch % plotLossFrequency === 0) {
                  // Compute the average loss for the last plotLossFrequency iterations
                  plotLoss(trainBatchCount, totalLoss / (trainBatchCount - prevTrainBatchCount), "train");
                  plotAccuracy(trainBatchCount, totalAccuracy / (trainBatchCount - prevTrainBatchCount), "train");
                  prevTrainBatchCount = trainBatchCount;
                  totalLoss = 0;
                  totalAccuracy = 0;
                }
                if (batch % 60 === 0) {
                  onIteration();
                }
                await tf.nextFrame();
            },
            onEpochEnd: async (_: number, logs: tf.Logs) => {
                const valAcc = logs.val_acc;
                const valLoss = logs.val_loss;
                vaccBox.children[1].innerHTML = String(Number((100 * valAcc).toFixed(2)));
                vlossBox.children[1].innerHTML = String(Number((valLoss).toFixed(2)));
                plotLoss(trainBatchCount, logs.val_loss, "validation");
                plotAccuracy(trainBatchCount, logs.val_acc, "validation");
                showConfusionMatrix();
                onIteration();
                await tf.nextFrame();
            },
        },
        epochs: trainEpochs,
        validationSplit,
    });

    const testResult = model.architecture.evaluate(testData.xs, testData.labels) as Array<tf.Tensor<tf.Rank.R0>>;

    const vaccBox = document.getElementById("ti_vacc");
    const vlossBox = document.getElementById("ti_vloss");
    vaccBox.children[1].innerHTML = String(Number((100 * testResult[1].dataSync()[0] ).toFixed(2)));
    vlossBox.children[1].innerHTML = String(Number((testResult[0].dataSync()[0]).toFixed(2)));
}
