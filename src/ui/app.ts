import * as d3 from "d3";
import { buildNetworkDAG, generateJulia, generatePython, topologicalSort } from "../model/build_network";
import { changeDataset } from "../model/data";
import { download, graphToJson } from "../model/export_model";
import { renderAccuracyPlot, renderLossPlot, setupPlots, setupTestResults,
    showConfusionMatrix, showPredictions } from "../model/graphs";
import { train } from "../model/mnist_model";
import { model } from "../model/paramsObject";
import { loadStateIfPossible, storeNetworkInUrl } from "../model/save_state_url";
import { clearError, displayError } from "./error";
import { blankTemplate, defaultTemplate, resnetTemplate } from "./model_templates";
import { Activation, Relu, Sigmoid, Tanh } from "./shapes/activation";
import { ActivationLayer } from "./shapes/activationlayer";
import { Draggable } from "./shapes/draggable";
import { Layer } from "./shapes/layer";
import { Add } from "./shapes/layers/add";
import { BatchNorm } from "./shapes/layers/batchnorm";
import { Concatenate } from "./shapes/layers/concatenate";
import { Conv2D } from "./shapes/layers/convolutional";
import { Dense } from "./shapes/layers/dense";
import { Dropout } from "./shapes/layers/dropout";
import { Flatten } from "./shapes/layers/flatten";
import { Input } from "./shapes/layers/input";
import { MaxPooling2D } from "./shapes/layers/maxpooling";
import { Output } from "./shapes/layers/output";
import { TextBox } from "./shapes/textbox";
import { WireGuide } from "./shapes/wireguide";
import { copyTextToClipboard } from "./utils";
import { windowProperties } from "./window";

export interface IDraggableData {
    draggable: Draggable[];
    input: Input;
    output: Output;
}

export let svgData: IDraggableData = {
    draggable: [],
    input: null,
    output: null,
};

document.addEventListener("DOMContentLoaded", () => {

    // This function runs when the DOM is ready, i.e. when the document has been parsed
    setupPlots();
    setupTestResults();

    const tabElements = document.getElementsByClassName("tab") as HTMLCollectionOf<HTMLElement>;
    for (const elmt of tabElements) {
        dispatchSwitchTabOnClick(elmt);
    }

    const optionElements = document.getElementsByClassName("option") as HTMLCollectionOf<HTMLElement>;
    for (const elmt of optionElements) {
        dispatchCreationOnClick(elmt);
    }

    const categoryElements = document.getElementsByClassName("categoryTitle") as HTMLCollectionOf<HTMLElement>;
    for (const elmt of categoryElements) {
        makeCollapsable(elmt);
    }

    window.addEventListener("resize", resizeMiddleSVG);
    window.addEventListener("resize", setupPlots);

    resizeMiddleSVG();

    document.getElementById("train").onclick = trainOnClick;

    document.getElementById("informationEducation").onclick = (_) => {
        document.getElementById("informationOverlay").style.display = "none";
        switchTab("education");

    };
    document.getElementById("informationOverlay").onclick = (_) => {
        document.getElementById("informationOverlay").style.display = "none";
    };

    document.getElementById("x").onclick = (_) => clearError();

    document.getElementById("svg").addEventListener("click", (event) => {
        // Only click if there is a selected element, and the clicked element is an SVG Element, and its id is "svg"
        // It does this to prevent unselecting if we click on a layer block or other svg shape
        if (windowProperties.selectedElement && event.target instanceof SVGElement && event.target.id === "svg") {
            windowProperties.selectedElement.unselect();
            windowProperties.selectedElement = null;
        }
    });

    window.onkeyup = (event) => {
        switch (event.key) {
            case "Escape":
                if (windowProperties.selectedElement) {
                    windowProperties.selectedElement.unselect();
                    windowProperties.selectedElement = null;
                }
                break;
            case "Delete":
                if (document.getElementsByClassName("focusParam").length === 0) {
                    deleteSelected();
                }
                break;
            case "Backspace":
                if (document.getElementsByClassName("focusParam").length === 0) {
                    deleteSelected();
                }
                break;
            case "Enter":
                break;
        }
    };

    windowProperties.wireGuide = new WireGuide();
    windowProperties.shapeTextBox = new TextBox();

    d3.select("#svg").on("mousemove", () => {
        if (windowProperties.selectedElement instanceof Layer) {
            windowProperties.wireGuide.moveToMouse();
        }
    });

    svgData = loadStateIfPossible();

    // Select the input block when we load the page
    svgData.input.select();

});

function deleteSelected(): void {
    if (windowProperties.selectedElement) {
        windowProperties.selectedElement.delete();
        windowProperties.selectedElement = null;
    }
}

async function trainOnClick(): Promise<void> {

    // Only train if not already training

    const training = document.getElementById("train");
    if (!training.classList.contains("train-active")) {
        clearError();

        changeDataset(svgData.input.getParams().dataset);

        // Grab hyperparameters
        setModelHyperparameters();

        const trainingBox = document.getElementById("ti_training");
        trainingBox.children[1].innerHTML = "Yes";
        training.innerHTML = "Training";
        training.classList.add("train-active");
        try {
            model.architecture = buildNetworkDAG(svgData.input);
            await train();
        } catch (error) {
            displayError(error);
        } finally {
            training.innerHTML = "Train";
            training.classList.remove("train-active");
            trainingBox.children[1].innerHTML = "No";
        }
    }
}

function resizeMiddleSVG(): void {
    const originalSVGWidth = 1000;

    const svgWidth = document.getElementById("middle").clientWidth;
    const svgHeight = document.getElementById("middle").clientHeight;

    const ratio = svgWidth / originalSVGWidth;

    const xTranslate = (svgWidth - originalSVGWidth) / 2;
    const yTranslate = Math.max(0, (svgHeight * ratio - svgHeight) / 2);

    // Modify initialization heights for random locations for layers/activations so they don't appear above the svg
    const yOffsetDelta = yTranslate / ratio - windowProperties.svgYOffset;
    ActivationLayer.defaultInitialLocation.y += yOffsetDelta;
    Activation.defaultLocation.y += yOffsetDelta;

    windowProperties.svgYOffset = yTranslate / ratio;
    windowProperties.svgTransformRatio = ratio;

    document.getElementById("svg").setAttribute("transform", `translate(${xTranslate}, 0) scale(${ratio}, ${ratio})  `);

    // Call crop position on each draggable to ensure it is within the new canvas boundary
    if (svgData.input != null) {
        svgData.input.cropPosition();
        svgData.input.moveAction();
    }
    if (svgData.output != null) {
        svgData.output.cropPosition();
        svgData.output.moveAction();
    }
    svgData.draggable.forEach((elem) => {
        elem.cropPosition();
        elem.moveAction();
    });
}

function toggleExpanderTriangle(categoryTitle: Element): void {
    categoryTitle.getElementsByClassName("expander")[0].classList.toggle("expanded");
}

function makeCollapsable(elmt: Element): void {
    elmt.addEventListener("click", () => {
        toggleExpanderTriangle(elmt);
        const arr = Array.prototype.slice.call(elmt.parentElement.children).slice(1);

        if (elmt.getAttribute("data-expanded") === "false") {
            for (const sib of arr) {
                if (sib.id !== "defaultparambox") {
                    sib.style.display = "block";
                }
            }

            elmt.setAttribute("data-expanded", "true");
        } else {
            for (const sib of arr) {
                sib.style.display = "none";
            }
            elmt.setAttribute("data-expanded", "false");
        }
    });
}

/**
 * Takes the hyperparemeters from the html and assigns them to the global model
 */
export function setModelHyperparameters(): void {
    let temp: number = 0;
    const hyperparams = document.getElementsByClassName("hyperparamvalue");

    for (const hp of hyperparams) {
        const name: string = hp.id;

        temp = Number(( document.getElementById(name) as HTMLInputElement).value);
        if (temp < 0 || temp == null) {
            const error: Error = Error("Hyperparameters should be positive numbers.");
            displayError(error);
            return;
        }
        switch (name) {
            case "learningRate":
                model.params.learningRate = temp;
                break;

            case "epochs":
                model.params.epochs = Math.trunc(temp);
                break;

            case "batchSize":
                model.params.batchSize = Math.trunc(temp);
                break;
        }
    }
}

function dispatchSwitchTabOnClick(elmt: Element): void {
    elmt.addEventListener("click", () => {
        const tabType = elmt.getAttribute("data-tabType");
        switchTab(tabType);
    });
}

export function tabSelected(): string {
    if (document.getElementById("networkTab").style.display !== "none") {
        return "networkTab";
    } else if (document.getElementById("progressTab").style.display !== "none") {
        return "progressTab";
    } else if (document.getElementById("visualizationTab").style.display !== "none") {
        return "visualizationTab";
    } else if (document.getElementById("educationTab").style.display !== "none") {
        return "educationTab";
    } else {
        throw new Error("No tab selection found");
    }
}

function dispatchCreationOnClick(elmt: HTMLElement): void {
    if (!elmt.classList.contains("dropdown")) {
        elmt.addEventListener("click", () => {
            let itemType;
            if (elmt.parentElement.classList.contains("dropdown-content")) {
                itemType = elmt.parentElement.parentElement.parentElement.getAttribute("data-itemType");
            } else {
                itemType = elmt.parentElement.getAttribute("data-itemType");
            }

            if (model.params.isParam(itemType)) {
                let setting;
                if (elmt.hasAttribute("data-trainType")) {
                    setting = elmt.getAttribute("data-trainType");
                } else if (elmt.hasAttribute("data-lossType")) {
                    setting = elmt.getAttribute("data-lossType");
                }

                const selected = elmt.parentElement.getElementsByClassName("selected");
                if (selected.length > 0) {
                    selected[0].classList.remove("selected");
                }
                elmt.classList.add("selected");
                updateNetworkParameters(itemType, setting);
            } else if (itemType === "share") {
                changeDataset(svgData.input.getParams().dataset);
                if (elmt.getAttribute("share-option") === "exportPython") {
                    const filename = svgData.input.getParams().dataset + "_model.py";
                    download(generatePython(topologicalSort(svgData.input)), filename);
                } else if (elmt.getAttribute("share-option") === "exportJulia") {
                    if (svgData.input.getParams().dataset === "cifar") {
                        displayError(Error("CIFAR-10 dataset exporting to Julia not currently supported. " +
                            "Select MNIST dataset instead."));
                        return;
                    }
                    download(generateJulia(topologicalSort(svgData.input)), "mnist_model.jl");
                } else if (elmt.getAttribute("share-option") === "copyModel") {
                    const state = graphToJson(svgData);
                    const baseUrl: string = window.location.href;
                    const urlParam: string = storeNetworkInUrl(state);
                    copyTextToClipboard(baseUrl + "#" + urlParam);
                }
            } else if (itemType === "classes") {
                selectOption(elmt);
                if (model.architecture != null) {
                    showPredictions();
                }
            } else if (itemType === "educationPage") {
                // selectOption(elmt); // TODO uncomment this line to add back in selections
                const target = document.getElementById("education" + elmt.getAttribute("data-articleType"));
                ( target.parentNode as Element).scrollTop = target.offsetTop;
            } else if (itemType === "template") {
                createTemplate(elmt.getAttribute("data-templateType"));
            } else {
                appendItem(elmt.getAttribute("data-" + itemType + "Type"));
            }
        });
    }
}

function selectOption(elmt: HTMLElement): void {

    const parents = Array.from(document.querySelectorAll(
        `[data-itemType="${elmt.parentElement.getAttribute("data-itemType")}"]`).values());
    for (const parent of parents) {
        for (const option of parent.getElementsByClassName("option")) {
            option.classList.remove("selected");
        }
    }

    elmt.classList.add("selected");
}

function updateNetworkParameters(itemType: string, setting: string): void {
    switch (itemType) {
        case "optimizer":
            model.params.optimizer = setting;
            break;
        case "loss":
            model.params.loss = setting;
            break;
    }
}

function createTemplate(template: string): void {
    switch (template) {
        case "blank": blankTemplate(svgData); break;
        case "default": defaultTemplate(svgData); break;
        case "resnet": resnetTemplate(svgData); break;

    }
}

function appendItem(itemType: string): void {
    const item: Draggable = new ({
        add: Add,
        batchnorm: BatchNorm,
        concatenate: Concatenate,
        conv2D: Conv2D,
        dense: Dense,
        dropout: Dropout,
        flatten: Flatten,
        maxPooling2D: MaxPooling2D,
        relu: Relu,
        sigmoid: Sigmoid,
        tanh: Tanh,
    } as any)[itemType]();

    svgData.draggable.push(item);
}

function switchTab(tabType: string): void {
    // Hide all tabs
    document.getElementById("networkTab").style.display = "none";
    document.getElementById("progressTab").style.display = "none";
    document.getElementById("visualizationTab").style.display = "none";
    document.getElementById("educationTab").style.display = "none";

    // Hide all menus
    document.getElementById("networkMenu").style.display = "none";
    document.getElementById("progressMenu").style.display = "none";
    document.getElementById("visualizationMenu").style.display = "none";
    document.getElementById("educationMenu").style.display = "none";

    // Hide all paramshells
    document.getElementById("networkParamshell").style.display = "none";
    document.getElementById("progressParamshell").style.display = "none";
    document.getElementById("visualizationParamshell").style.display = "none";
    document.getElementById("educationParamshell").style.display = "none";

    // Unselect all tabs
    document.getElementById("network").classList.remove("tab-selected");
    document.getElementById("progress").classList.remove("tab-selected");
    document.getElementById("visualization").classList.remove("tab-selected");
    document.getElementById("education").classList.remove("tab-selected");

    // Display only the selected tab
    document.getElementById(tabType + "Tab").style.display = null;
    document.getElementById(tabType).classList.add("tab-selected");
    document.getElementById(tabType + "Menu").style.display = null;
    document.getElementById(tabType + "Paramshell").style.display = null;
    document.getElementById("paramshell").style.display = null;
    document.getElementById("menu").style.display = null;
    // document.getElementById("menu_expander").style.display = null;

    switch (tabType) {
        case "network": resizeMiddleSVG(); break;
        case "progress": renderAccuracyPlot(); renderLossPlot(); showConfusionMatrix(); break;
        case "visualization": showPredictions(); break;
        case "education":
            document.getElementById("paramshell").style.display = "none";
            break;
    }

    // Give border radius to top and bottom neighbors
    if (document.getElementsByClassName("top_neighbor_tab-selected").length > 0) {
        document.getElementsByClassName("top_neighbor_tab-selected")[0].classList
            .remove("top_neighbor_tab-selected");
        document.getElementsByClassName("bottom_neighbor_tab-selected")[0].classList
            .remove("bottom_neighbor_tab-selected");
    }

    const tabMapping = ["blanktab", "network", "progress", "visualization",
        "middleblanktab", "education", "bottomblanktab"];
    const index = tabMapping.indexOf(tabType);

    document.getElementById(tabMapping[index - 1]).classList.add("top_neighbor_tab-selected");
    document.getElementById(tabMapping[index + 1]).classList.add("bottom_neighbor_tab-selected");

}
