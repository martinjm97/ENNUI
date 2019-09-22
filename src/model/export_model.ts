import { saveAs } from 'file-saver';
import { IDraggableData } from "../ui/app";
import { displayError } from "../ui/error";
import { Activation, Relu, Sigmoid, Tanh } from "../ui/shapes/activation";
import { ActivationLayer } from "../ui/shapes/activationlayer";
import { Layer, ILayerJson } from "../ui/shapes/layer";
import { Add } from "../ui/shapes/layers/add";
import { BatchNorm } from "../ui/shapes/layers/batchnorm";
import { Concatenate } from "../ui/shapes/layers/concatenate";
import { Conv2D } from "../ui/shapes/layers/convolutional";
import { Dense } from "../ui/shapes/layers/dense";
import { Dropout } from "../ui/shapes/layers/dropout";
import { Flatten } from "../ui/shapes/layers/flatten";
import { Input } from "../ui/shapes/layers/input";
import { MaxPooling2D } from "../ui/shapes/layers/maxpooling";
import { Output } from "../ui/shapes/layers/output";
import { Point } from "../ui/shapes/shape";
import { IHyperparameterData } from "./paramsObject";

/**
 * Schema for serialized networks.
 */
export interface ISerializedNetwork {
    graph: ILayerJson[];
    hyperparameters: IHyperparameterData;
}

/**
 * Check that there is a path from the input to the output.
 * @param svgData the input nn architecture
 */
export function hasPathToOutput(svgData: IDraggableData): boolean {
    const queue: Layer[] = [svgData.input];
    const visited: Set<Layer> = new Set();
    const layersFromInput: Set<Layer> = new Set();
    while (queue.length !== 0) {
        const current = queue.shift();
        layersFromInput.add(current);
        // check each connections of the node
        for (const child of current.children) {
            if (!visited.has(child)) {
                queue.push(child);
                visited.add(child);
            }
        }
    }

    return layersFromInput.has(svgData.output);
}

/**
 * Convert the nn to a json blob for storage.
 * @param svgData the input nn architecture
 */
export function graphToJson(svgData: IDraggableData): ISerializedNetwork {
    // Initialize queues, dags, and parents (visited)
    const queue: Layer[] = [svgData.input];
    const visited: Set<Layer> = new Set();
    const layersjson: ILayerJson[] = new Array();
    while (queue.length !== 0) {
        const current = queue.shift();
        layersjson.push(current.toJson());
        // check each connections of the node
        for (const child of current.children) {
            if (!visited.has(child)) {
                queue.push(child);
                visited.add(child);
            }
        }
    }

    const serializedNet: ISerializedNetwork = {
        graph: layersjson,
        hyperparameters: setHyperparameterData(),
    };

    return serializedNet;
}

/**
 * Takes the hyperparemeters from the html and assigns them to the global model.
 */
function setHyperparameterData(): IHyperparameterData {
    let learningRate: number;
    let batchSize: number;
    let optimizerId: string;
    let epochs: number;
    let lossId: string;
    const hyperparams = document.getElementsByClassName("hyperparamvalue");
    for (const hyperparam of hyperparams) {
        const value = ( document.getElementById(hyperparam.id) as HTMLInputElement).value;
        switch (hyperparam.id) {
            case "learningRate":
                learningRate = Number(value);
                break;

            case "epochs":
                epochs = parseInt(value, 10);
                break;

            case "batchSize":
                batchSize = parseInt(value, 10);
                break;
        }
    }
    for (const elmt of document.getElementsByClassName("selected")) {
        if (elmt.hasAttribute("data-trainType")) {
            optimizerId = elmt.id;
        } else if (elmt.hasAttribute("data-lossType")) {
            lossId = elmt.id;
        }
    }

    return {batchSize, epochs, learningRate, lossId, optimizerId};
}

/**
 * Deserialize a `serializedNet` into svgData.
 * @param svgData an empty structure for `Layer` instances
 * @param serializedNet a blob of all of the json
 */
export function stateFromJson(svgData: IDraggableData, serializedNet: ISerializedNetwork): IDraggableData {
    const hyperparams: IHyperparameterData = serializedNet.hyperparameters;
    setHyperparams(hyperparams);

    const layersJson: ILayerJson[] = serializedNet.graph;
    return graphFromJson(svgData, layersJson);
}

/**
 * Set hyperparameters from serialized data.
 * @param hyperparamData a container for all of the hyperparameter data
 */
function setHyperparams(hyperparamData: IHyperparameterData): void {
    const hyperparams = document.getElementsByClassName("hyperparamvalue");
    for (const hyperparam of hyperparams) {
        const paramName = document.getElementById(hyperparam.id as string) as HTMLInputElement;
        paramName.value = hyperparamData[hyperparam.id].toString();
    }
    document.getElementById("defaultOptimizer").classList.remove("selected");
    document.getElementById(hyperparamData.optimizerId).classList.add("selected");
    document.getElementById("defaultLoss").classList.remove("selected");
    document.getElementById(hyperparamData.lossId).classList.add("selected");
}

/**
 * Populate `svgData` from a serialize nn architecture in `layersJson`.
 * @param svgData empty empty structure blob to be filled
 * @param layersJson a json blob of all of the nn architecture
 */
function graphFromJson(svgData: IDraggableData, layersJson: ILayerJson[]): IDraggableData {

    // Make each of the objects without parents and children
    const uidToObject: Map<number, Layer> = new Map();
    for (const l of layersJson) {
        const layer = createLayerInstanceFromName(svgData, l);
        uidToObject.set(l.id, layer);
    }

    // Add in all of the parents, children, and activations
    for (const l of layersJson) {
        const layer: Layer = uidToObject.get(l.id);
        for (const childId of l.children_ids) {
            layer.addChild(uidToObject.get(childId));
        }
        for (const parentId of l.parent_ids) {
            layer.addParent(uidToObject.get(parentId));
        }
        layer.setParams(l.params);
        if (l.params.activation != null) {
            createActivationInstanceFromName(svgData,  layer as ActivationLayer, l.params.activation);
        }
    }

    return svgData;
}

/**
 * Make an `Activation` instance from it's name, adding it to svgData, and attaching it to the given layer.
 * @param svgData the input nn architecture
 * @param layer layer to attach the activation to
 * @param activation_name the name of an `Activation` to be created
 */
function createActivationInstanceFromName(svgData: IDraggableData,
                                          layer: ActivationLayer,
                                          activationName: string): Activation {
    let activation: Activation;
    switch (activationName) {
        case "relu":
            activation = new Relu();
            break;
        case "sigmoid":
            activation = new Sigmoid();
            break;
        case "tanh":
            activation = new Tanh();
            break;
        default:
            displayError(new Error(`The specified activation "${activationName}" was not recognized. `));
    }
    layer.addActivation(activation);
    svgData.draggable.push(activation);
    return activation;
}

/**
 * Make a `Layer` instance from it's name and add it to svgData.
 * @param svgData the input nn architecture
 * @param lj a json blob of all of the layers
 */
function createLayerInstanceFromName(svgData: IDraggableData, lj: ILayerJson): Layer {

    // Create an instance from the instance name.
    let layer: Layer;
    const location = new Point(lj.xPosition, lj.yPosition);
    switch (lj.layer_name) {
        case "Input":
            layer = new Input();
            layer.setPosition(location);
            svgData.input = layer as Input;
            break;
        case "Output":
            layer = new Output();
            layer.setPosition(location);
            svgData.output = layer as Output;
            break;
        default:
            switch (lj.layer_name) {
                case "MaxPooling2D":
                    layer = new MaxPooling2D(location); break;
                case "Dense":
                    layer = new Dense(location); break;
                case "Conv2D":
                    layer = new Conv2D(location); break;
                case "Concatenate":
                    layer = new Concatenate(location); break;
                case "Flatten":
                    layer = new Flatten(location); break;
                case "BatchNorm":
                    layer = new BatchNorm(location); break;
                case "Dropout":
                    layer = new Dropout(location); break;
                case "Add":
                    layer = new Add(location); break;
                default:
                     displayError(new Error(`The specified layer "${lj}" was not recognized. `));
            }
            svgData.draggable.push(layer);
            break;
    }

    return layer;
}

/**
 * Download a file given the content and name.
 * @param content content to add to the file
 * @param filename name of the file to be created
 */
export function download(content: string, filename: string): void {
    const blob = new Blob([content], {
     type: "text/plain;charset=utf-8",
    });
    saveAs(blob, filename);
}
