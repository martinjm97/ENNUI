import * as tfvis from '@tensorflow/tfjs-vis';
import * as tf from '@tensorflow/tfjs';
import { mnistData } from './data';
import { model } from './paramsObject';
import { tabSelected } from '../ui/app';

const GRAPH_FONT_SIZE = 14;

// const statusElement = document.getElementById('status');
// const messageElement = document.getElementById('message');

// export function logStatus(message) {
//   statusElement.innerText = message;
// }

// export function trainingLog(message) {
//   messageElement.innerText = `${message}\n`;
//   console.log(message);
// }

const testExamples:number = 50;
/**
 * Show predictions on a number of test examples.
 */
export async function showPredictions() {
  if (tabSelected() == "visualizationTab" && mnistData.dataLoaded) {
    const testExamples = 60;

    let label = null
    let options = document.getElementsByClassName('visualization-option')
    for (let option of options){
        if (option.classList.contains("selected")){
            label = option.getAttribute('data-classesType')
            break
        }
    }
    const examples = mnistData.getTestDataWithLabel(testExamples, label);

    // Code wrapped in a tf.tidy() function callback will have their tensors freed
    // from GPU memory after execution without having to call dispose().
    // The tf.tidy callback runs synchronously.
    tf.tidy(() => {
      const output = model.architecture.predict(examples.xs);

      // tf.argMax() returns the indices of the maximum values in the tensor along
      // a specific axis. Categorical classification tasks like this one often
      // represent classes as one-hot vectors. One-hot vectors are 1D vectors with
      // one element for each output class. All values in the vector are 0
      // except for one, which has a value of 1 (e.g. [0, 0, 0, 1, 0]). The
      // output from model.predict() will be a probability distribution, so we use
      // argMax to get the index of the vector element that has the highest
      // probability. This is our prediction.
      // (e.g. argmax([0.07, 0.1, 0.03, 0.75, 0.05]) == 3)
      // dataSync() synchronously downloads the tf.tensor values from the GPU so
      // that we can use them in our normal CPU JavaScript code
      // (for a non-blocking version of this function, use data()).
      const axis = 1;
      const labels = Array.from(examples.labels.argMax(axis).dataSync());
      const predictions = Array.from(output.argMax(axis).dataSync());

      showTestResults(examples, predictions, labels);
    });
  }
}

export function showConfusionMatrix() {
  if (tabSelected() == "progressTab" && mnistData.dataLoaded) {
    const {xs, labels} = mnistData.getTestData(1000);
    tf.tidy(() => {
      const output = model.architecture.predict(xs);

      const fixedLabels = <tf.Tensor<tf.Rank.R1>>labels.argMax(1);
      const predictions = output.argMax(1);

      tfvis.metrics.confusionMatrix(fixedLabels, predictions, mnistData.NUM_CLASSES).then(function(confusionValues) {
        const confusionMatrixElement = document.getElementById('confusion-matrix-canvas');
        tfvis.render.confusionMatrix({
          values: confusionValues ,
          labels: ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"]
        }, confusionMatrixElement, {
          fontSize: GRAPH_FONT_SIZE,
          shadeDiagonal: false,
        });
      });
      
    });
  }
  
}

export function setupTestResults() {
  const imagesElement = document.getElementById('images');
  imagesElement.innerHTML = '';
  for (let i = 0; i < testExamples; i++) {
    const div = document.createElement('div');
    div.className = 'pred-container';

    const canvas = document.createElement('canvas');
    canvas.width = mnistData.IMAGE_WIDTH;
    canvas.height = mnistData.IMAGE_HEIGHT;
    canvas.className = 'prediction-canvas';
    let ctx = canvas.getContext("2d");
    ctx.rect(0, 0, 1000, 5000);
    ctx.fillStyle = "#888";
    ctx.fill();
    // draw(, canvas);

    const pred = document.createElement('div');
    pred.className = `pred pred-none`;
    pred.innerText = `pred: -`;

    div.appendChild(pred);
    div.appendChild(canvas);

    imagesElement.appendChild(div);
  }
}

export function showTestResults(batch, predictions, labels) {
  const imagesElement = document.getElementById('images');
  // const testExamples = batch.xs.shape[0];
  imagesElement.innerHTML = '';
  for (let i = 0; i < testExamples; i++) {
    const image = batch.xs.slice([i, 0], [1, batch.xs.shape[1]]);

    const div = document.createElement('div');
    div.className = 'pred-container';

    const canvas = document.createElement('canvas');
    // canvas.width = 76;
    // canvas.height = 76;
    canvas.className = 'prediction-canvas';
    draw(image.flatten(), canvas);

    const pred = document.createElement('div');

    const prediction = predictions[i];
    const label = labels[i];
    const correct = prediction === label;

    pred.className = `pred ${(correct ? 'pred-correct' : 'pred-incorrect')}`;
    pred.innerText = `pred: ${prediction}`;

    div.appendChild(pred);
    div.appendChild(canvas);

    imagesElement.appendChild(div);
  }
}

// const lossLabelElement = document.getElementById('loss-label');
// const accuracyLabelElement = document.getElementById('accuracy-label');
let lossValues = [[], []];
export function plotLoss(batch, loss, set) {
  const series = set === 'train' ? 0 : 1;
  lossValues[series].push({x: batch, y: loss});
  if (tabSelected() == "progressTab") {
    renderLossPlot();
  }
  // lossLabelElement.innerText = `last loss: ${loss.toFixed(3)}`;
}

export function renderLossPlot() {
  const lossContainer = document.getElementById('loss-canvas');
  tfvis.render.linechart(
      {values: lossValues, series: ['train', 'validation']}, lossContainer, {
        xLabel: 'Batch #',
        yLabel: 'Loss',
        width: 400*1.15,
        height: 300*1.15,
        fontSize: GRAPH_FONT_SIZE,
      });
}

let accuracyValues = [[], []];
export function plotAccuracy(epochs, accuracy, set) {
  const series = set === 'train' ? 0 : 1;
  accuracyValues[series].push({x: epochs, y: accuracy});
  if (tabSelected() == "progressTab") {
    renderAccuracyPlot();
  }
}

export function renderAccuracyPlot() {
  const accuracyContainer = document.getElementById('accuracy-canvas');
  tfvis.render.linechart(
      {values: accuracyValues, series: ['train', 'validation']},
      accuracyContainer, {
        xLabel: 'Batch #',
        yLabel: 'Accuracy',
        width: 400*1.15,
        height: 300*1.15,
        yAxisDomain: [0,1],
        fontSize: GRAPH_FONT_SIZE,
      });
}

export function setupPlots() {
  accuracyValues = [[], []];
  lossValues = [[],[]];
  let confusionValues = [];
  for (let i = 0; i < mnistData.NUM_CLASSES; i++) {
    let arr = new Array(mnistData.NUM_CLASSES);
    arr.fill(0,0,mnistData.NUM_CLASSES);
    confusionValues.push(arr);
  }
  const lossContainer = document.getElementById('loss-canvas');
  const accuracyContainer = document.getElementById('accuracy-canvas');
  const confusionMatrixElement = document.getElementById('confusion-matrix-canvas');
  tfvis.render.linechart(
    {values: lossValues, series: ['train', 'validation']}, lossContainer, {
      xLabel: 'Batch #',
      yLabel: 'Loss',
      width: 400*1.15,
      height: 300*1.15,
      fontSize: GRAPH_FONT_SIZE,
    });
  tfvis.render.linechart(
    {values: accuracyValues, series: ['train', 'validation']},
    accuracyContainer, {
      xLabel: 'Batch #',
      yLabel: 'Accuracy',
      width: 400*1.15,
      height: 300*1.15,
      fontSize: GRAPH_FONT_SIZE,
    });
    tfvis.render.confusionMatrix({
      values: confusionValues ,
      labels: ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"]
    }, confusionMatrixElement, {
      fontSize: GRAPH_FONT_SIZE,
      shadeDiagonal: false,
    });
}

export function draw(image, canvas) {
  const [width, height] = [mnistData.IMAGE_HEIGHT, mnistData.IMAGE_WIDTH];
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  const imageData = new ImageData(width, height);
  const data = image.dataSync();
  for (let i = 0; i < height * width; ++i) {
    const j = i * 4;
    if (mnistData.IMAGE_CHANNELS == 3) {
      const k = i * 3;
      imageData.data[j + 0] = data[k + 0] * 255;
      imageData.data[j + 1] = data[k + 1] * 255;
      imageData.data[j + 2] = data[k + 2] * 255;
      imageData.data[j + 3] = 255;
    } else {
      imageData.data[j + 0] = data[i] * 255;
      imageData.data[j + 1] = data[i] * 255;
      imageData.data[j + 2] = data[i] * 255;
      imageData.data[j + 3] = 255;
    }
  }
  ctx.putImageData(imageData, 0, 0);
}

// export function getModelTypeId() {
//   return document.getElementById('model-type').value;
// }

// export function getTrainEpochs() {
//   return Number.parseInt(document.getElementById('train-epochs').value);
// }

// export function setTrainButtonCallback(callback) {
//   const trainButton = document.getElementById('train');
//   const modelType = document.getElementById('model-type');
//   trainButton.addEventListener('click', () => {
//     trainButton.setAttribute('disabled', true);
//     modelType.setAttribute('disabled', true);
//     callback();
//   });
// }