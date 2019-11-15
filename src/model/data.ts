// Adapted from https://github.com/tensorflow/tfjs-examples/blob/master/mnist/data.js

import * as tf from "@tensorflow/tfjs";
import { Rank, Tensor } from "@tensorflow/tfjs";
import { Cifar10 } from "tfjs-cifar10-web";

const NUM_DATASET_ELEMENTS = 65000;

export const NUM_TRAIN_ELEMENTS = 55000;
// const NUM_TEST_ELEMENTS = NUM_DATASET_ELEMENTS - NUM_TRAIN_ELEMENTS;

const MNIST_IMAGES_SPRITE_PATH =
    "https://storage.googleapis.com/learnjs-data/model-builder/mnist_images.png";
const MNIST_LABELS_PATH =
    "https://storage.googleapis.com/learnjs-data/model-builder/mnist_labels_uint8";

/**
 * A class that serves as a schema for loading image data.
 */
export abstract class ImageData {
    public readonly IMAGE_HEIGHT: number;
    public readonly IMAGE_WIDTH: number;
    public readonly IMAGE_CHANNELS: number;
    public readonly IMAGE_SIZE: number = this.IMAGE_HEIGHT * this.IMAGE_WIDTH * this.IMAGE_CHANNELS;
    public readonly NUM_CLASSES: number;
    public pythonName: string;

    public dataLoaded: boolean = false;

    public readonly classStrings: string[] = null;

    protected trainImages: Tensor<Rank.R4>;
    protected testImages: Tensor<Rank>;
    protected trainLabels: Tensor<Rank>;
    protected testLabels: Tensor<Rank>;
    protected datasetName: string;

    public abstract async load(): Promise<void>;

    /**
     * Get all training data as a data tensor and a labels tensor.
     *
     * @returns
     *   xs: The data tensor, of shape `[numTrainExamples, IMAGE_HEIGHT, IMAGE_WIDTH, IMAGE_CHANNELS]`.
     *   labels: The one-hot encoded labels tensor, of shape `[numTrainExamples, NUM_CLASSES]`.
     */
    public getTrainData(numExamples: number = 15000): {xs: Tensor<tf.Rank.R4>, labels: Tensor<tf.Rank.R2>} {
        let xs = tf.reshape<tf.Rank.R4>(this.trainImages, [this.trainImages.size / this.IMAGE_SIZE,
                                                           this.IMAGE_HEIGHT,
                                                           this.IMAGE_WIDTH,
                                                           this.IMAGE_CHANNELS]);
        let labels = tf.reshape<tf.Rank.R2>(this.trainLabels,
                                            [this.trainLabels.size / this.NUM_CLASSES, this.NUM_CLASSES]);
        if (numExamples != null) {
            xs = xs.slice([0, 0, 0, 0], [numExamples, this.IMAGE_HEIGHT, this.IMAGE_WIDTH, this.IMAGE_CHANNELS]);
            labels = labels.slice([0, 0], [numExamples, this.NUM_CLASSES]);
        }
        return {xs, labels};
    }

    /**
     * Get all test data as a data tensor a a labels tensor.
     *
     * @param {number} numExamples Optional number of examples to get. If not provided,
     *   all test examples will be returned.
     * @returns
     *   xs: The data tensor, of shape `[numTrainExamples, IMAGE_HEIGHT, IMAGE_WIDTH, IMAGE_CHANNELS]`.
     *   labels: The one-hot encoded labels tensor, of shape `[numTestExamples, NUM_CLASSES]`.
     */
    public getTestData(numExamples: number = 1500): {xs: Tensor<tf.Rank.R4>, labels: Tensor<tf.Rank.R2>} {
        let xs = tf.reshape<tf.Rank.R4>(this.testImages, [this.testImages.size / this.IMAGE_SIZE,
                                                          this.IMAGE_HEIGHT,
                                                          this.IMAGE_WIDTH,
                                                          this.IMAGE_CHANNELS]);
        let labels = tf.reshape<tf.Rank.R2>(this.testLabels,
                                            [this.testLabels.size / this.NUM_CLASSES, this.NUM_CLASSES]);

        if (numExamples != null) {
            xs = xs.slice([0, 0, 0, 0], [numExamples, this.IMAGE_HEIGHT, this.IMAGE_WIDTH, this.IMAGE_CHANNELS]);
            labels = labels.slice([0, 0], [numExamples, this.NUM_CLASSES]);
        }
        return {xs, labels};
    }

    /**
     * Returns test examples with the desired label.
     *
     * @param {number} numExamples number of examples to get.
     * @returns xs: The data tensor, of shape `[numTrainExamples, IMAGE_HEIGHT, IMAGE_WIDTH, IMAGE_CHANNELS]`.
     *          labels: The one-hot encoded labels tensor, of shape `[numTestExamples, NUM_CLASSES]`.
     */
    public async getTestDataWithLabel(numExamples: number,
                                      label: string): Promise<{xs: Tensor<tf.Rank.R4>, labels: Tensor<tf.Rank.R2>}> {
        if (label === "all") {
            return this.getTestData(numExamples);
        }

        let {xs, labels} = this.getTestData();

        // select only the numbers with the given label
        const classLabels = labels.argMax(1).arraySync() as number[];
        const mask = tf.equal(classLabels, parseInt(label, 10)).slice([0], [numExamples]);
        xs = await tf.booleanMaskAsync(xs, mask) as Tensor<tf.Rank.R4>;
        labels = await tf.booleanMaskAsync(labels, mask) as Tensor<tf.Rank.R2>;

        // for (let i = 0; i < this.testLabels.shape[0]; i++) {
        //     if (classLabels[i].toString() === label) {
        //         newXs.push(xs.slice([i, 0, 0, 0], [1, this.IMAGE_HEIGHT, this.IMAGE_WIDTH, this.IMAGE_CHANNELS]));
        //         newLabels.push(labels.slice([i, 0], [1, 10]).squeeze());
        //         goodIndices.push(i);
        //     }
        //     if (goodIndices.length >= numExamples) {
        //         break;
        //     }
        // }
        // xs = tf.concat(newXs);
        // labels = tf.stack(newLabels) as tf.Tensor<Rank.R2>;
        return {xs, labels};
    }

    protected toggleLoadingOverlay(): void {
        if (document.getElementById("loadingDataTab").style.display === "none") {
            document.getElementById("datasetLoadingName").innerText = this.datasetName;
            document.getElementById("loadingDataTab").style.display = "block";
        } else {
            document.getElementById("loadingDataTab").style.display = "none";
        }
    }
}

/**
 * A class that fetches the sprited CIFAR dataset and provide data as
 * Tensors.
 */
export class Cifar10Data extends ImageData {

    public static get Instance(): ImageData {
        return this.instance || (this.instance = new this());
    }

    private static instance: Cifar10Data;
    public IMAGE_HEIGHT: number = 32;
    public IMAGE_WIDTH: number = 32;
    public IMAGE_CHANNELS: number = 3;
    public IMAGE_SIZE: number = this.IMAGE_HEIGHT * this.IMAGE_WIDTH * this.IMAGE_CHANNELS;
    public NUM_CLASSES: number = 10;

    public datasetName: string = "CIFAR-10";
    public pythonName: string = "cifar10";

    public readonly classStrings: string[] =
        ["Airplane", "Automobile", "Bird", "Cat", "Deer", "Dog", "Frog", "Horse", "Ship", "Truck"];

    public async load(): Promise<void> {
        if (this.dataLoaded) {
            return;
        }

        this.toggleLoadingOverlay();

        const data = new Cifar10();
        await data.load();

        const {xs: trainX, ys: trainY} = data.nextTrainBatch(15000);
        const {xs: testX, ys: testY} = data.nextTestBatch(1500);
        this.trainImages = trainX as unknown as Tensor<Rank.R4>;
        this.trainLabels = trainY as unknown as Tensor<Rank.R4>;
        this.testImages = testX as unknown as Tensor<Rank.R2>;
        this.testLabels = testY as unknown as Tensor<Rank.R2>;

        this.dataLoaded = true;

        document.getElementById("loadingDataTab").style.display = "none";
    }

}

/**
 * A class that fetches the sprited MNIST dataset and provide data as
 * Tensors.
 */
export class MnistData extends ImageData {

    public static get Instance(): ImageData {
        return this.instance || (this.instance = new this());
    }

    private static instance: MnistData;
    public IMAGE_HEIGHT: number = 28;
    public IMAGE_WIDTH: number = 28;
    public IMAGE_CHANNELS: number = 1;
    public IMAGE_SIZE: number = this.IMAGE_HEIGHT * this.IMAGE_WIDTH * this.IMAGE_CHANNELS;
    public NUM_CLASSES: number = 10;

    public datasetName: string = "MNIST";
    public pythonName: string = "mnist";

    public async load(): Promise<void> {
        // Make a request for the MNIST sprited image.
        if (this.dataLoaded) {
            return;
        }

        this.toggleLoadingOverlay();

        const img = new Image();
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        const imgRequest = new Promise<Float32Array>((resolve, _) => {
            img.crossOrigin = "";
            img.onload = () => {
                img.width = img.naturalWidth;
                img.height = img.naturalHeight;

                const datasetBytesBuffer = new ArrayBuffer(NUM_DATASET_ELEMENTS * this.IMAGE_SIZE * 4);

                const chunkSize = 5000;
                canvas.width = img.width;
                canvas.height = chunkSize;

                for (let i = 0; i < NUM_DATASET_ELEMENTS / chunkSize; i++) {
                    const datasetBytesView = new Float32Array(
                        datasetBytesBuffer, i * this.IMAGE_SIZE * chunkSize * 4,
                        this.IMAGE_SIZE * chunkSize);
                    ctx.drawImage(
                        img, 0, i * chunkSize, img.width, chunkSize, 0, 0, img.width,
                        chunkSize);

                    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

                    for (let j = 0; j < imageData.data.length / 4; j++) {
                        // All channels hold an equal value since the image is grayscale, so
                        // just read the red channel.
                        datasetBytesView[j] = imageData.data[j * 4] / 255;
                    }
                }
                const dataImages = new Float32Array(datasetBytesBuffer);

                resolve(dataImages);
            };
            img.src = MNIST_IMAGES_SPRITE_PATH;
        });

        const labelsRequest = fetch(MNIST_LABELS_PATH);
        const [datasetImages, labelsResponse] = await Promise.all([imgRequest, labelsRequest]);

        const datasetLabels = new Uint8Array(await labelsResponse.arrayBuffer());

        // Slice the the images and labels into train and test sets.
        const trainImages = datasetImages.slice(0, this.IMAGE_SIZE * NUM_TRAIN_ELEMENTS);
        this.trainImages = tf.tensor4d(trainImages, [trainImages.length / this.IMAGE_SIZE,
                                                     this.IMAGE_HEIGHT, this.IMAGE_WIDTH,
                                                     this.IMAGE_CHANNELS]);
        const testImages = datasetImages.slice(this.IMAGE_SIZE * NUM_TRAIN_ELEMENTS);
        this.testImages = tf.tensor4d(testImages, [testImages.length / this.IMAGE_SIZE,
                                                   this.IMAGE_HEIGHT, this.IMAGE_WIDTH,
                                                   this.IMAGE_CHANNELS]);
        const trainLabels = datasetLabels.slice(0, this.NUM_CLASSES * NUM_TRAIN_ELEMENTS);
        this.trainLabels = tf.tensor2d(trainLabels, [trainImages.length / this.IMAGE_SIZE, this.NUM_CLASSES]);
        const testLabels =
            datasetLabels.slice(this.NUM_CLASSES * NUM_TRAIN_ELEMENTS);
        this.testLabels = tf.tensor2d(testLabels, [testImages.length / this.IMAGE_SIZE, this.NUM_CLASSES]);

        this.dataLoaded = true;

        document.getElementById("loadingDataTab").style.display = "none";
    }

}

export let dataset: ImageData = MnistData.Instance;

export function changeDataset(newDataset: string): void {
    switch (newDataset) {
        case "mnist": dataset = MnistData.Instance; break;
        case "cifar": dataset = Cifar10Data.Instance; break;
    }

    // Set the image visualizations divs with class name identifiers
    Array.from(document.getElementById("classes").getElementsByClassName("option")).forEach((element, i) => {
        if (i !== 0) { // Skip the first since it represents 'Any' class
            element.innerHTML = (i - 1) + ( dataset.classStrings != null ? ` (${dataset.classStrings[i]})` : "");
        }
    });
}
