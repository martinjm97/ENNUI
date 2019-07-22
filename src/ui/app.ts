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

    document.getElementById("all").classList.add("selected");

    // Initialize the network tab to selected
    document.getElementById("network").classList.add("tab-selected");

    // Hide the progress and visualization tabs
    document.getElementById("progressTab").style.display = "none";
    document.getElementById("visualizationTab").style.display = "none";
    document.getElementById("loadingDataTab").style.display = "none";
    document.getElementById("educationTab").style.display = "none";

    // Hide the progress and visualization menus
    document.getElementById("progressMenu").style.display = "none";
    document.getElementById("visualizationMenu").style.display = "none";
    document.getElementById("educationMenu").style.display = "none";

    // Hide the progress and visualization paramshell
    document.getElementById("progressParamshell").style.display = "none";
    document.getElementById("visualizationParamshell").style.display = "none";
    document.getElementById("educationParamshell").style.display = "none";

    // Hide the error box
    document.getElementById("error").style.display = "none";

    const tabElements: HTMLCollectionOf<Element> = document.getElementsByClassName("tab");
    for (const elmt of tabElements) {
        dispatchSwitchTabOnClick(elmt);
    }

    const optionElements: HTMLCollectionOf<Element> = document.getElementsByClassName("option");
    for (const elmt of optionElements) {
        dispatchCreationOnClick(elmt);
    }

    const categoryElements: HTMLCollectionOf<Element> = document.getElementsByClassName("categoryTitle");
    for (const elmt of categoryElements) {
        makeCollapsable(elmt);
    }

    window.addEventListener("create", (e) => {
        appendItem(e);
    });

    window.addEventListener("selectClass", (e) => {
        switchClassExamples(e);
    });

    window.addEventListener("switch", (e) => {
        switchTab(e);
    });

    window.addEventListener("resize", resizeMiddleSVG);
    window.addEventListener("resize", setupPlots);

    resizeMiddleSVG();

    document.getElementById("defaultOptimizer").classList.add("selected");
    document.getElementById("defaultLoss").classList.add("selected");

    document.getElementById("train").onclick = trainOnClick;
    document.getElementById("informationEducation").onclick = (_) => {
        document.getElementById("informationOverlay").style.display = "none";
        switchTab({ detail: { tabType: "education" } });

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

    d3.select("#svg").on("mousemove", (d: any, i) => {
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

function bindMenuExpander(): void {
    document.getElementById("menu").style.display = "block";
    document.getElementById("menu_expander_handle").addEventListener("click", (_) => {
        if (document.getElementById("menu").style.display === "none") {

            document.getElementById("menu").style.display = "block";
            document.getElementById("expander_triangle").setAttribute("points", "0,15 10,30 10,0");

            if (document.getElementById("paramshell").style.display === "block") {
                document.getElementById("middle").style.width = "calc(100% - 430px)";
            } else {
                document.getElementById("middle").style.width = "calc(100% - 240px)";
            }

        } else {

            document.getElementById("menu").style.display = "none";
            document.getElementById("expander_triangle").setAttribute("points", "10,15 0,30 0,0");

            if (document.getElementById("paramshell").style.display === "block") {
                document.getElementById("middle").style.width = "calc(100% - 250px)";
            } else {
                document.getElementById("middle").style.width = "calc(100% - 60px)";
            }

        }

        resizeMiddleSVG();

    });
}

function bindRightMenuExpander() {
    const thing = 0;
    document.getElementById("paramshell").style.display = "block";
    document.getElementById("right_menu_expander_handle").addEventListener("click", () => {
        if (document.getElementById("paramshell").style.display == "none") {

            document.getElementById("paramshell").style.display = "block";
            document.getElementById("right_expander_triangle").setAttribute("points", "20,15 10,30 10,0");

            if (document.getElementById("menu").style.display == "block") {
                document.getElementById("middle").style.width = "calc(100% - 430px)";
            } else {
                document.getElementById("middle").style.width = "calc(100% - 250px)";
            }
        } else {

            document.getElementById("paramshell").style.display = "none";
            document.getElementById("right_expander_triangle").setAttribute("points", "0,15 10,30 10,0");

            if (document.getElementById("menu").style.display == "block") {
                document.getElementById("middle").style.width = "calc(100% - 240px)";
            } else {
                document.getElementById("middle").style.width = "calc(100% - 60px)";
            }
        }

        resizeMiddleSVG();
    });
}

function resizeMiddleSVG() {
    const original_svg_width = 1000;

    const svgWidth = document.getElementById("middle").clientWidth;
    const svgHeight = document.getElementById("middle").clientHeight;

    const ratio = svgWidth / original_svg_width;

    const xTranslate = (svgWidth - original_svg_width) / 2;
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

function toggleExpanderTriangle(categoryTitle) {
    categoryTitle.getElementsByClassName("expander")[0].classList.toggle("expanded");
}

function makeCollapsable(elmt) {
    elmt.addEventListener("click", function(e) {
        toggleExpanderTriangle(elmt);
        const arr = Array.prototype.slice.call(elmt.parentElement.children).slice(1);

        if (elmt.getAttribute("data-expanded") == "false") {
            for (const sib of arr) {
                if (sib.id != "defaultparambox") {
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
export function setModelHyperparameters() {
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

function dispatchSwitchTabOnClick(elmt) {
    elmt.addEventListener("click", function(e) {
        const tabType = elmt.getAttribute("data-tabType");
        const detail = { tabType };
        const event = new CustomEvent("switch", { detail });
        window.dispatchEvent(event);
    });
}

export function tabSelected(): string {
    if (document.getElementById("networkTab").style.display != "none") {
        return "networkTab";
    } else if (document.getElementById("progressTab").style.display != "none") {
        return "progressTab";
    } else if (document.getElementById("visualizationTab").style.display != "none") {
        return "visualizationTab";
    } else if (document.getElementById("educationTab").style.display != "none") {
        return "educationTab";
    } else {
        throw new Error("No tab selection found");
    }
}

function dispatchCreationOnClick(elmt) {
    if (!elmt.classList.contains("dropdown")) {
        elmt.addEventListener("click", function(e) {
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
                updateNetworkParameters({ itemType, setting });
            } else if (itemType == "share") {
                changeDataset(svgData.input.getParams().dataset);
                if (elmt.getAttribute("share-option") == "exportPython") {
                    const filename = svgData.input.getParams().dataset + "_model.py";
                    download(generatePython(topologicalSort(svgData.input)), filename);
                } else if (elmt.getAttribute("share-option") == "exportJulia") {
                    if (svgData.input.getParams().dataset == "cifar") {
                        const error: Error = Error("CIFAR-10 dataset exporting to Julia not currently supported. Select MNIST dataset instead.");
                        displayError(error);
                        return;
                    }
                    download(generateJulia(topologicalSort(svgData.input)), "mnist_model.jl");
                } else if (elmt.getAttribute("share-option") == "copyModel") {
                    const state = graphToJson(svgData);
                    const baseUrl: string = window.location.href;
                    const urlParam: string = storeNetworkInUrl(state);
                    copyTextToClipboard(baseUrl + "#" + urlParam);
                }
            } else if (itemType == "classes") {
                selectOption(elmt);
                if (model.architecture != null) {
                    showPredictions();
                }
            } else if (itemType == "educationPage") {
                // selectOption(elmt); // TODO uncomment this line to add back in selections
                const target: HTMLElement = document.getElementById("education" + elmt.getAttribute("data-articleType"));
                ( target.parentNode as Element).scrollTop = target.offsetTop;
            } else {
                const detail = { itemType };
                detail[itemType + "Type"] = elmt.getAttribute("data-" + itemType + "Type");
                const event = new CustomEvent("create", { detail });
                window.dispatchEvent(event);
            }
        });
    }
}

function selectOption(elmt: HTMLElement) {

    const parents = Array.from(document.querySelectorAll(`[data-itemType="${elmt.parentElement.getAttribute("data-itemType")}"]`).values());
    for (const parent of parents) {
        for (const option of parent.getElementsByClassName("option")) {
            option.classList.remove("selected");
        }
    }

    elmt.classList.add("selected");
}

function updateNetworkParameters(params) {
    switch (params.itemType) {
        case "optimizer":
            model.params.optimizer = params.setting;
            break;
        case "loss":
            model.params.loss = params.setting;
            break;
    }
}

function appendItem(options) {
    let item: Draggable;
    let template = null;
    switch (options.detail.itemType) {
        case "layer": switch (options.detail.layerType) {
            case "dense": item = new Dense(); console.log("Created Dense Layer"); break;
            case "conv2D": item = new Conv2D(); console.log("Created Conv2D Layer"); break;
            case "maxPooling2D": item = new MaxPooling2D(); console.log("Created MaxPooling2D Layer"); break;
            case "batchnorm": item = new BatchNorm(); console.log("Created Batch Normalization Layer"); break;
            case "flatten": item = new Flatten(); console.log("Created Flatten Layer"); break;
            case "concatenate": item = new Concatenate(); console.log("Created Concatenate Layer"); break;
            case "add": item = new Add(); console.log("Created Add Layer"); break;
            case "dropout": item = new Dropout(); console.log("Created Dropout Layer"); break;
        }
        case "activation": switch (options.detail.activationType) {
            case "relu": item = new Relu(); console.log("Created Relu"); break;
            case "sigmoid": item = new Sigmoid(); console.log("Created Sigmoid"); break;
            case "tanh": item = new Tanh(); console.log("Created Tanh"); break;
        }
        case "template": switch (options.detail.templateType) {
            case "blank": template = true; blankTemplate(svgData); console.log("Created Blank Template"); break;
            case "default": template = true; defaultTemplate(svgData); console.log("Created Default Template"); break;
            case "resnet": template = true; resnetTemplate(svgData); console.log("Created ResNet Template"); break;
        }
    }

    if (template == null) {
        // item.select()
        svgData.draggable.push(item);
    }
}

function switchClassExamples(options) {
    // showPredictions()
}

function switchTab(tab) {
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
    document.getElementById(tab.detail.tabType + "Tab").style.display = null;
    document.getElementById(tab.detail.tabType).classList.add("tab-selected");
    document.getElementById(tab.detail.tabType + "Menu").style.display = null;
    document.getElementById(tab.detail.tabType + "Paramshell").style.display = null;
    document.getElementById("paramshell").style.display = null;
    document.getElementById("menu").style.display = null;
    // document.getElementById("menu_expander").style.display = null;

    switch (tab.detail.tabType) {
        case "network": resizeMiddleSVG(); break;
        case "progress": renderAccuracyPlot(); renderLossPlot(); showConfusionMatrix(); break;
        case "visualization": showPredictions(); break;
        case "education":
            document.getElementById("paramshell").style.display = "none";
            break;
    }

    // Give border radius to top and bottom neighbors
    if (document.getElementsByClassName("top_neighbor_tab-selected").length > 0) {
        document.getElementsByClassName("top_neighbor_tab-selected")[0].classList.remove("top_neighbor_tab-selected");
        document.getElementsByClassName("bottom_neighbor_tab-selected")[0].classList.remove("bottom_neighbor_tab-selected");
    }

    const tabMapping = ["blanktab", "network", "progress", "visualization",
        "middleblanktab", "education", "bottomblanktab"];
    const index = tabMapping.indexOf(tab.detail.tabType);

    document.getElementById(tabMapping[index - 1]).classList.add("top_neighbor_tab-selected");
    document.getElementById(tabMapping[index + 1]).classList.add("bottom_neighbor_tab-selected");

}
