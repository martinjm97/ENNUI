import * as tf from "@tensorflow/tfjs";
import * as tfvis from "@tensorflow/tfjs-vis";
import { tabSelected } from "../ui/app";
import { dataset } from "./data";
import { model } from "./paramsObject";

const GRAPH_FONT_SIZE: number = 14;
const NUM_CLASSES: number = 10;

const testExamples: number = 50;

/**
 * Show predictions on a number of test examples.
 */
export async function showPredictions(): Promise<void> {
  if (tabSelected() === "visualizationTab" && dataset.dataLoaded) {
    let label: string | number = null;
    const options = document.getElementById("classes").getElementsByClassName("option");
    for (const option of options) {
        if (option.classList.contains("selected")) {
            label = option.getAttribute("data-classesType");
            break;
        }
    }
    const examples = dataset.getTestDataWithLabel(testExamples, label) as {xs: tf.Tensor<tf.Rank.R4>, labels: tf.Tensor<tf.Rank.R2>};

    // Code wrapped in a tf.tidy() function callback will have their tensors freed
    // from GPU memory after execution without having to call dispose().
    // The tf.tidy callback runs synchronously.
    tf.tidy(() => {
      const output = model.architecture.predict(examples.xs) as tf.Tensor<tf.Rank.R1>;

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

// TOOD: Remove this peice of problematic global state.
let confusionValues: any = [];
for (let i = 0; i < NUM_CLASSES; i++) {
  const arr = new Array(NUM_CLASSES);
  arr.fill(0, 0, NUM_CLASSES);
  confusionValues.push(arr);
}

export function showConfusionMatrix(): void {
  if (tabSelected() === "progressTab" && dataset.dataLoaded) {
    const {xs, labels} = dataset.getTestData(1000);
    tf.tidy(() => {
      const output = model.architecture.predict(xs) as tf.Tensor<tf.Rank.R1>;

      const fixedLabels = labels.argMax(1) as tf.Tensor<tf.Rank.R1>;
      const predictions = output.argMax(1) as tf.Tensor<tf.Rank.R1>;

      tfvis.metrics.confusionMatrix(fixedLabels, predictions, NUM_CLASSES).then((confusionVals) => {
        confusionValues = confusionVals;
        renderConfusionMatrix();
      });

    });
  }

}

export function setupTestResults(): void {
  const imagesElement = document.getElementById("images");
  imagesElement.innerHTML = "";
  for (let i = 0; i < testExamples; i++) {
    const div = document.createElement("div");
    div.className = "pred-container";

    const canvas = document.createElement("canvas");
    canvas.width = dataset.IMAGE_WIDTH;
    canvas.height = dataset.IMAGE_HEIGHT;
    canvas.className = "prediction-canvas";
    const ctx = canvas.getContext("2d");
    ctx.rect(0, 0, 1000, 5000);
    ctx.fillStyle = "#888";
    ctx.fill();

    const pred = document.createElement("div");
    pred.className = `pred pred-none`;
    pred.innerText = `pred: -`;

    div.appendChild(pred);
    div.appendChild(canvas);

    imagesElement.appendChild(div);
  }
}

export function showTestResults(batch: {xs: tf.Tensor<tf.Rank.R4>, labels: tf.Tensor<tf.Rank.R2>},
                                predictions: number[],
                                labels: number[]): void {
  const imagesElement = document.getElementById("images");
  imagesElement.innerHTML = "";
  for (let i = 0; i < testExamples; i++) {
    const image = batch.xs.slice([i, 0], [1, batch.xs.shape[1]]);

    const div = document.createElement("div");
    div.className = "pred-container";

    const canvas = document.createElement("canvas");
    canvas.className = "prediction-canvas";
    draw(image.flatten(), canvas);

    const pred = document.createElement("div");

    const prediction = predictions[i];
    const label = labels[i];
    const correct = prediction === label;

    pred.className = `pred ${(correct ? "pred-correct" : "pred-incorrect")}`;
    pred.innerText = `pred: ${prediction}`;

    div.appendChild(pred);
    div.appendChild(canvas);

    imagesElement.appendChild(div);
  }
}

// TOOD: Remove this peice of problematic global state.
let lossValues = [[], []];
export function plotLoss(batch_num: number, loss: number, set: string): void {
  const series = set === "train" ? 0 : 1;
  // Set the first validation loss as the first training loss
  if (series === 0 && lossValues[1].length === 0) {
    lossValues[1].push({x: batch_num, y: loss});
  }
  lossValues[series].push({x: batch_num, y: loss});
  if (tabSelected() === "progressTab") {
    renderLossPlot();
  }
}

export function renderLossPlot(): void {
  const lossContainer = document.getElementById("loss-canvas");
  tfvis.render.linechart(
      {values: lossValues, series: ["train", "validation"]}, lossContainer, {
        xLabel: "Batch #",
        yLabel: "Loss",  // tslint:disable-next-line: object-literal-sort-keys
        width: canvasWidth() / 2,
        height: canvasHeight() / 2,
        fontSize: GRAPH_FONT_SIZE,
      });
}

export function resetPlotValues(): void {
  // set initial accuracy values to 0,0 for validation
  accuracyValues = [[], [{x: 0, y: 0}]];
  lossValues = [[], []];
}

let accuracyValues = [[], [{x: 0, y: 0}]];
export function plotAccuracy(epochs: number, accuracy: number, set: string): void {
  const series = set === "train" ? 0 : 1;
  accuracyValues[series].push({x: epochs, y: accuracy});
  if (tabSelected() === "progressTab") {
    renderAccuracyPlot();
  }
}

export function renderAccuracyPlot(): void {
  const accuracyContainer = document.getElementById("accuracy-canvas");
  tfvis.render.linechart(
      {values: accuracyValues, series: ["train", "validation"]},
      accuracyContainer, {
        xLabel: "Batch #",
        yLabel: "Accuracy",  // tslint:disable-next-line: object-literal-sort-keys
        width: canvasWidth() / 2,
        height: canvasHeight() / 2,
        yAxisDomain: [0, 1],
        fontSize: GRAPH_FONT_SIZE,
      });
}

function renderConfusionMatrix(): void {
  const confusionMatrixElement = document.getElementById("confusion-matrix-canvas");
  tfvis.render.confusionMatrix({
    labels: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
    values: confusionValues ,
  }, confusionMatrixElement, {
    fontSize: GRAPH_FONT_SIZE,
    shadeDiagonal: false,
  });
}

function canvasWidth(): number {
  const columnGap = parseInt(getComputedStyle(document.getElementById("progressTab")).gridColumnGap, 10);
  return document.getElementById("middle").clientWidth - columnGap;
}

function canvasHeight(): number {
  const verticalPadding = parseInt(getComputedStyle(document.getElementById("progressTab")).padding, 10);
  const height = document.getElementById("middle").clientHeight - 2 * verticalPadding;
  return height;
}

export function setupPlots(): void {
  renderLossPlot();
  renderAccuracyPlot();
  renderConfusionMatrix();
}

export function draw(image: tf.Tensor, canvas: HTMLCanvasElement): void {
  const [width, height] = [dataset.IMAGE_HEIGHT, dataset.IMAGE_WIDTH];
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  const imageData = new ImageData(width, height);
  const data = image.dataSync();
  for (let i = 0; i < height * width; ++i) {
    const j = i * 4;
    if (dataset.IMAGE_CHANNELS === 3) {
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
