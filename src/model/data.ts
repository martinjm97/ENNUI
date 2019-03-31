import * as tf from '@tensorflow/tfjs';
import { Rank, Tensor } from '@tensorflow/tfjs';
import { Cifar10 } from 'tfjs-cifar10-web'

const NUM_DATASET_ELEMENTS = 65000;

export const NUM_TRAIN_ELEMENTS = 55000;
const NUM_TEST_ELEMENTS = NUM_DATASET_ELEMENTS - NUM_TRAIN_ELEMENTS;

const MNIST_IMAGES_SPRITE_PATH =
    'https://storage.googleapis.com/learnjs-data/model-builder/mnist_images.png';
const MNIST_LABELS_PATH =
    'https://storage.googleapis.com/learnjs-data/model-builder/mnist_labels_uint8';



export abstract class ImageData {
    readonly IMAGE_HEIGHT: number;
    readonly IMAGE_WIDTH: number;
    readonly IMAGE_CHANNELS: number;
    readonly IMAGE_SIZE: number = this.IMAGE_HEIGHT * this.IMAGE_WIDTH * this.IMAGE_CHANNELS;
    readonly NUM_CLASSES: number;

    protected trainImages: Tensor<Rank.R4>;
    protected testImages: Tensor<Rank>;
    protected trainLabels: Tensor<Rank>;
    protected testLabels: Tensor<Rank>;
    protected datasetName: string;

    public dataLoaded : boolean = false;

    public readonly classStrings: Array<string> = null;

    abstract async load(): Promise<void>;
    
    /**
     * Get all training data as a data tensor and a labels tensor.
     *
     * @returns
     *   xs: The data tensor, of shape `[numTrainExamples, IMAGE_HEIGHT, IMAGE_WIDTH, IMAGE_CHANNELS]`.
     *   labels: The one-hot encoded labels tensor, of shape `[numTrainExamples, NUM_CLASSES]`.
     */
    getTrainData(numExamples: number = 15000): {xs: tf.Tensor<tf.Rank.R4>, labels: tf.Tensor<tf.Rank.R2>} {
        console.log(this.trainImages)
        let xs = tf.reshape<tf.Rank.R4>(this.trainImages, [this.trainImages.size / this.IMAGE_SIZE, this.IMAGE_HEIGHT, this.IMAGE_WIDTH, this.IMAGE_CHANNELS])
        let labels = tf.reshape<tf.Rank.R2>(this.trainLabels, [this.trainLabels.size / this.NUM_CLASSES, this.NUM_CLASSES])
        console.log(xs)
        if (numExamples != null) {
            xs = xs.slice([0, 0, 0, 0], [numExamples, this.IMAGE_HEIGHT, this.IMAGE_WIDTH, this.IMAGE_CHANNELS]);
            labels = labels.slice([0, 0], [numExamples, this.NUM_CLASSES]);
        }
        console.log(xs)
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
    getTestData(numExamples:number = 1500): {xs: tf.Tensor<tf.Rank.R4>, labels: tf.Tensor<tf.Rank.R2>} {
        let xs = tf.reshape<tf.Rank.R4>(this.testImages, [this.testImages.size / this.IMAGE_SIZE, this.IMAGE_HEIGHT, this.IMAGE_WIDTH, this.IMAGE_CHANNELS]);
        let labels = tf.reshape<tf.Rank.R2>(this.testLabels, [this.testLabels.size / this.NUM_CLASSES, this.NUM_CLASSES]);

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
    getTestDataWithLabel(numExamples, label): {xs: tf.Tensor<tf.Rank.R4>, labels: tf.Tensor<tf.Rank.R2>} {
        if (label == "all") {
            return this.getTestData(numExamples)
        }

        let {xs, labels} = this.getTestData();

        // select only the numbers with the given label
        let newLabels = []
        let newXs = []
        let goodIndices: number[] = [] 

        for (let i=0; i < this.testLabels.size/this.NUM_CLASSES; i++) {
            let theLabel = 0
            for (let j=0; j < this.NUM_CLASSES; j++){
                if (labels.get(i,j) == 1) {
                    theLabel = j
                    break
                }
            }
            if (theLabel == label) {
                newXs.push(xs.slice([i, 0, 0, 0], [1, this.IMAGE_HEIGHT, this.IMAGE_WIDTH, this.IMAGE_CHANNELS]))
                newLabels.push(labels.slice([i,0], [1,10]).squeeze())
                goodIndices.push(i)
            }
            if (goodIndices.length >= numExamples) {
                break
            }
        }
        xs = tf.concat(newXs)
        labels = <tf.Tensor<Rank.R2>> tf.stack(newLabels)
        return {xs, labels};
    }

    protected toggleLoadingOverlay(): void {
        if (document.getElementById("loadingDataTab").style.display == "none") {
            document.getElementById("datasetLoadingName").innerText = this.datasetName;
            document.getElementById("loadingDataTab").style.display = "block";
        } else {
            document.getElementById("loadingDataTab").style.display = "none";
        }
    }
}

export class Cifar10Data extends ImageData {
    IMAGE_HEIGHT = 32;
    IMAGE_WIDTH = 32;
    IMAGE_CHANNELS = 3;
    IMAGE_SIZE = this.IMAGE_HEIGHT * this.IMAGE_WIDTH * this.IMAGE_CHANNELS;
    NUM_CLASSES = 10;

    datasetName = "CIFAR-10";

    public readonly classStrings: Array<string> = 
        ["Airplane", "Automobile", "Bird", "Cat", "Deer", "Dog", "Frog", "Horse", "Ship", "Truck"]

    private static _instance: Cifar10Data;
    
    public static get Instance() {
        return this._instance || (this._instance = new this())
    }

    async load(): Promise<void> {
        if (this.dataLoaded){
            return;
        }
        
        this.toggleLoadingOverlay();

        const data = new Cifar10()
        await data.load()

        const {xs: trainX, ys: trainY} = data.nextTrainBatch(15000)
        const {xs: testX, ys: testY} = data.nextTestBatch(1500)
        this.trainImages = <Tensor<Rank.R4>> <unknown> trainX;
        this.trainLabels = <Tensor<Rank.R4>> <unknown> trainY;
        this.testImages = <Tensor<Rank.R2>> <unknown> testX;
        this.testLabels = <Tensor<Rank.R2>> <unknown> testY;

        this.dataLoaded = true

        document.getElementById("loadingDataTab").style.display = "none";
    }


}

/**
 * A class that fetches the sprited MNIST dataset and provide data as
 * tf.Tensors.
 */
export class MnistData extends ImageData {
    IMAGE_HEIGHT = 28;
    IMAGE_WIDTH = 28;
    IMAGE_CHANNELS = 1;
    IMAGE_SIZE = this.IMAGE_HEIGHT * this.IMAGE_WIDTH * this.IMAGE_CHANNELS;
    NUM_CLASSES = 10;

    datasetName = "MNIST";

    private static _instance: MnistData;

    public static get Instance()
    {
        return this._instance || (this._instance = new this());
    }

    async load() {
        // Make a request for the MNIST sprited image.
        if (this.dataLoaded){
            return;
        }

        this.toggleLoadingOverlay();

        const img = new Image();
        let datasetImages;
        let datasetLabels;
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const imgRequest = new Promise((resolve, reject) => {
        img.crossOrigin = '';
        img.onload = () => {
            img.width = img.naturalWidth;
            img.height = img.naturalHeight;

            const datasetBytesBuffer =
                new ArrayBuffer(NUM_DATASET_ELEMENTS * this.IMAGE_SIZE * 4);

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
            datasetImages = new Float32Array(datasetBytesBuffer);

            resolve();
        };
        img.src = MNIST_IMAGES_SPRITE_PATH;
        });

        const labelsRequest = fetch(MNIST_LABELS_PATH);
        const [imgResponse, labelsResponse] =
            await Promise.all([imgRequest, labelsRequest]);

        datasetLabels = new Uint8Array(await labelsResponse.arrayBuffer());

        // Slice the the images and labels into train and test sets.
        let trainImages = datasetImages.slice(0, this.IMAGE_SIZE * NUM_TRAIN_ELEMENTS);
        this.trainImages = tf.tensor4d(trainImages, [trainImages.length / this.IMAGE_SIZE, this.IMAGE_HEIGHT, this.IMAGE_WIDTH, this.IMAGE_CHANNELS])
        let testImages = datasetImages.slice(this.IMAGE_SIZE * NUM_TRAIN_ELEMENTS);
        this.testImages = tf.tensor4d(testImages, [testImages.length / this.IMAGE_SIZE, this.IMAGE_HEIGHT, this.IMAGE_WIDTH, this.IMAGE_CHANNELS])
        let trainLabels =
            datasetLabels.slice(0, this.NUM_CLASSES * NUM_TRAIN_ELEMENTS);
        this.trainLabels = tf.tensor2d(trainLabels, [trainImages.length / this.IMAGE_SIZE, this.NUM_CLASSES])
        let testLabels =
            datasetLabels.slice(this.NUM_CLASSES * NUM_TRAIN_ELEMENTS);
        this.testLabels = tf.tensor2d(testLabels, [testImages.length / this.IMAGE_SIZE, this.NUM_CLASSES])

        

        this.dataLoaded = true;

        document.getElementById("loadingDataTab").style.display = "none"
    }

}


export let dataset: ImageData = MnistData.Instance;

export function changeDataset(newDataset: string) {
    switch (newDataset) {
        case "mnist": dataset = MnistData.Instance; break;
        case "cifar": dataset = Cifar10Data.Instance; break;
    }

    // Set the image visualizations divs with class name identifiers
    Array.from(document.getElementsByClassName("data-class-option")).forEach(function (element, i) {
        element.innerHTML = i + ( dataset.classStrings != null ? ` (${dataset.classStrings[i]})` : '' );
    })
}