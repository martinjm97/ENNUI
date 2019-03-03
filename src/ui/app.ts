import { Draggable } from "./shapes/draggable";
import { Relu, Sigmoid, Tanh } from "./shapes/activation";
import { windowProperties } from "./window";
import { buildNetworkDAG, topologicalSort, cloneNetwork, generatePython, generateJulia } from "../model/build_network";
import { blankTemplate, defaultTemplate, complexTemplate } from "./model_templates";
import { graphToJson, download } from "../model/export_model";
import { train } from "../model/mnist_model";
import { setupPlots, showPredictions, setupTestResults, renderAccuracyPlot, renderLossPlot, showConfusionMatrix } from "../model/graphs";
import { model } from "../model/paramsObject"
import { Input } from "./shapes/layers/input";
import { Output } from "./shapes/layers/output";
import { Dense } from "./shapes/layers/dense";
import { Conv2D } from "./shapes/layers/convolutional";
import { MaxPooling2D } from "./shapes/layers/maxpooling";
import { BatchNorm } from "./shapes/layers/batchnorm";
import { clearError, displayError } from "./error";
import { loadStateIfPossible, storeNetworkInUrl } from "../model/save_state_url";
import { pythonSkeleton } from "../model/python_skeleton";
import { copyTextToClipboard } from "./utils";
import { browserLocalStorage } from "@tensorflow/tfjs-core/dist/io/local_storage";
import { Concatenate } from "./shapes/layers/concatenate";
import { Flatten } from "./shapes/layers/flatten";
import { Dropout } from "./shapes/layers/dropout";

export interface DraggableData {
	draggable: Array<Draggable>
	input: Input
	output: Output
}

let svgData: DraggableData = {
	draggable : [],
	input: null,
	output: null
}

document.addEventListener("DOMContentLoaded", function() {

	// This function runs when the DOM is ready, i.e. when the document has been parsed
	setupPlots();
	setupTestResults();

	document.getElementById("all").classList.add("selected")

	// Initialize the network tab to selected
	document.getElementById("network").classList.add("tab-selected");

	// Hide the progress and visualization tabs
	document.getElementById("progressTab").style.display = "none"
	document.getElementById("visualizationTab").style.display = "none"
	document.getElementById("informationTab").style.display = "none"
	document.getElementById("loadingDataTab").style.display = "none"

	// Hide the progress and visualization menus
	document.getElementById("progressMenu").style.display = "none";
	document.getElementById("visualizationMenu").style.display = "none";

	// Hide the progress and visualization paramshell
	document.getElementById("progressParamshell").style.display = "none";
	document.getElementById("visualizationParamshell").style.display = "none";

	// Hide the error box
	document.getElementById("error").style.display = "none";

	var elmts = document.getElementsByClassName('tab');
	for(let elmt of elmts){
		dispatchSwitchTabOnClick(elmt);
	}

	var elmts = document.getElementsByClassName('option');
	for(let elmt of elmts){
		dispatchCreationOnClick(elmt);
	}

	var elmts = document.getElementsByClassName('categoryTitle');
	for(let elmt of elmts){
		makeCollapsable(elmt);
	}

    window.addEventListener('create', function( e ) {
		appendItem(e);
	});

    window.addEventListener('selectClass', function( e ) {
		switchClassExamples(e);
	});

	window.addEventListener('switch', function( e: any ) {
		if (e.detail.tabType == 'information') {
			console.log("clicked on information")
			showInformationOverlay()
		} else {
			console.log("switching tabs!")
			switchTab(e);
		}
	});

	window.addEventListener('resize',resizeMiddleSVG);

	resizeMiddleSVG();

	bindMenuExpander();
	bindRightMenuExpander();

	document.getElementById('defaultOptimizer').classList.add('selected')
	document.getElementById('defaultLoss').classList.add('selected')

	document.getElementById('train').onclick = trainOnClick
	document.getElementById("informationTab").onclick = (_) => document.getElementById("informationTab").style.display = "none";
	document.getElementById("x").onclick = (_) => clearError()

	document.getElementById("svg").addEventListener("click", function(event) {
		// Only click if there is a selected element, and the clicked element is an SVG Element, and its id is "svg"
		// It does this to prevent unselecting if we click on a layer block or other svg shape
		if(windowProperties.selectedElement && event.target instanceof SVGElement && event.target.id == "svg"){
			windowProperties.selectedElement.unselect();
			windowProperties.selectedElement = null;
		}
	})

	window.onkeyup = function(event){
		switch(event.key){
			case 'Escape' :
				if (document.getElementById("informationTab").style.display != "none") {
					showInformationOverlay();
				}
				else if(windowProperties.selectedElement){
					windowProperties.selectedElement.unselect();
					windowProperties.selectedElement = null;
				}
				break;
			case 'Delete' :
				if (document.getElementsByClassName('focusParam').length == 0)
					deleteSelected();
				break;
			case 'Backspace' :
				if (document.getElementsByClassName('focusParam').length == 0)
					deleteSelected();
				break;
			case 'Enter' :
				if (document.getElementById("informationTab").style.display != "none") {
					showInformationOverlay();
				}
				break;
		}
	};


	svgData = loadStateIfPossible()

	// Begin page with info tab
	showInformationOverlay();


});

function deleteSelected(){
	if(windowProperties.selectedElement){
		windowProperties.selectedElement.delete();
		windowProperties.selectedElement = null;
	}
}


async function trainOnClick() {

	// Only train if not already training

	let training = document.getElementById('train');
	if (!training.classList.contains("train-active")){
		clearError()

		// Grab hyperparameters
		setModelHyperparameters()

		let trainingBox = document.getElementById('ti_training');
		trainingBox.children[1].innerHTML = 'Yes';
		training.innerHTML = "Training";
		training.classList.add("train-active");
		try {
			model.architecture = buildNetworkDAG(svgData.input)
			await train()
		} catch (error) {
			displayError(error);
		}
		finally {
			training.innerHTML = "Train";
			training.classList.remove("train-active");
			trainingBox.children[1].innerHTML = 'No'
		}
	}
}

function bindMenuExpander(){
	document.getElementById('menu').style.display = 'block';
	document.getElementById('menu_expander_handle').addEventListener('click',function(e){
		if(document.getElementById('menu').style.display == 'none'){

			document.getElementById('menu').style.display = 'block'
			document.getElementById('expander_triangle').setAttribute('points',"0,15 10,30 10,0");

			if(document.getElementById('paramshell').style.display == 'block'){
				document.getElementById('middle').style.width = 'calc(100% - 430px)'
			} else {
				document.getElementById('middle').style.width = 'calc(100% - 230px)'
			}

		} else {

			document.getElementById('menu').style.display = 'none'
			document.getElementById('expander_triangle').setAttribute('points',"10,15 0,30 0,0");

			if(document.getElementById('paramshell').style.display == 'block'){
				document.getElementById('middle').style.width = 'calc(100% - 270px)'
			} else {
				document.getElementById('middle').style.width = 'calc(100% - 70px)'
			}


		}

		resizeMiddleSVG();

	});
}

function bindRightMenuExpander(){
	document.getElementById('paramshell').style.display = 'block';
	document.getElementById('right_menu_expander_handle').addEventListener('click',function(e){
		if(document.getElementById('paramshell').style.display == 'none'){

			document.getElementById('paramshell').style.display = 'block'
			document.getElementById('right_expander_triangle').setAttribute('points',"20,15 10,30 10,0");

			if(document.getElementById('menu').style.display == 'block'){
				document.getElementById('middle').style.width = 'calc(100% - 430px)'
			} else {
				document.getElementById('middle').style.width = 'calc(100% - 250px)'
			}

		} else {

			document.getElementById('paramshell').style.display = 'none'
			document.getElementById('right_expander_triangle').setAttribute('points',"0,15 10,30 10,0");

			if(document.getElementById('menu').style.display == 'block'){
				document.getElementById('middle').style.width = 'calc(100% - 250px)'
			} else {
				document.getElementById('middle').style.width = 'calc(100% - 70px)'
			}


		}

		resizeMiddleSVG();

	});
}

function resizeMiddleSVG(){
	let ratio = document.getElementById('middle').clientWidth/800;

	document.getElementById('svg').style.transform = 'matrix('+[ratio,0,0,ratio,400*(ratio-1),0].join(',')+')';
}

function makeCollapsable(elmt){

	elmt.addEventListener('click', function(e){

		var arr = Array.prototype.slice.call( elmt.parentElement.children ).slice(1);

		if(elmt.getAttribute('data-expanded') == 'false'){

			for(let sib of arr){

				sib.style.display = 'block';

			}

			elmt.setAttribute('data-expanded','true');

		} else {

			for(let sib of arr){

				sib.style.display = 'none';

			}

			elmt.setAttribute('data-expanded','false');
		}

	})
}

/**
 * Takes the hyperparemeters from the html and assigns them to the global model
 */
export function setModelHyperparameters() {
	let temp : number = 0;
	let hyperparams = document.getElementsByClassName("hyperparamvalue")

	for (let hp of hyperparams) {
		let name : string = hp.id;

		temp = Number((<HTMLInputElement>document.getElementById(name)).value);
		if (temp < 0 || temp == null) {
			let error : Error = Error("Hyperparameters should be positive numbers.")
			displayError(error);
			return;
		}
		switch(name){
			case "learningRate":
				model.params.learningRate = temp;
				break;

			case "epochs":
				model.params.epochs = Math.trunc(temp);
				break;

			case "batchSize":
				model.params.batchSize = Math.trunc(temp);
				break;
		};
	}
}

function dispatchSwitchTabOnClick(elmt){
	elmt.addEventListener('click', function(e){
        let tabType = elmt.getAttribute('data-tabType')
		let detail = { tabType : tabType}
        let event = new CustomEvent('switch', { detail : detail } );
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
	} else if (document.getElementById("informationTab").style.display != "none") {
		return "informationTab";
	} else {
		throw new Error("No tab selection found");
	}
}


function  dispatchCreationOnClick(elmt){
	if (!elmt.classList.contains('dropdown'))
		elmt.addEventListener('click', function(e){
			let itemType
			if (elmt.parentElement.classList.contains('dropdown-content')) {
				itemType = elmt.parentElement.parentElement.parentElement.getAttribute('data-itemType')
			}
			else {
				itemType = elmt.parentElement.getAttribute('data-itemType')
			}
			if (model.params.isParam(itemType)){
				let setting;
				if (elmt.hasAttribute('data-trainType')) {
					setting = elmt.getAttribute('data-trainType');
				} else if (elmt.hasAttribute('data-lossType')) {
					setting = elmt.getAttribute('data-lossType');
				}

				let selected = elmt.parentElement.getElementsByClassName("selected");
				if (selected.length > 0) {
					selected[0].classList.remove("selected");
				}
				elmt.classList.add("selected");
				updateNetworkParameters({itemType: itemType, setting : setting});
			} else if (itemType == "share") {
				if (elmt.getAttribute('share-option') == "exportPython") {
					download(generatePython(topologicalSort(svgData.input)), "mnist_model.py");
				} else if (elmt.getAttribute('share-option') == "exportJulia") {
					download(generateJulia(topologicalSort(svgData.input)), "mnist_model.jl");
				} else if (elmt.getAttribute('share-option') == "copyModel"){
					let state = graphToJson(svgData);
					let baseUrl: string = window.location.href;
					let urlParam: string = storeNetworkInUrl(state);
					copyTextToClipboard(baseUrl + "#" + urlParam);
				}
			} else if (itemType == "classes") {
				let selected = elmt.parentElement.getElementsByClassName("selected");
				if (selected.length > 0) {
					selected[0].classList.remove("selected");
				}

				elmt.classList.add("selected");

				if (model.architecture != null){
					showPredictions()
				}
			} else {
				let detail = { itemType : itemType}
				detail[itemType + 'Type'] = elmt.getAttribute('data-'+itemType+'Type')
				let event = new CustomEvent('create', { detail : detail } );
				window.dispatchEvent(event);
			}
		});
}


function updateNetworkParameters(params){
	switch(params.itemType){
		case 'optimizer':
			model.params.optimizer = params.setting;
			break;
		case 'loss':
			model.params.loss = params.setting;
			break;
	}
}

function appendItem(options){
	var item: Draggable
	var template = null
	switch(options.detail.itemType){
        case 'layer': switch(options.detail.layerType) {
			case "dense": item = new Dense(); console.log("Created Dense Layer"); break;
			case "conv2D": item = new Conv2D(); console.log("Created Conv2D Layer"); break;
			case "maxPooling2D": item = new MaxPooling2D(); console.log("Created MaxPooling2D Layer"); break;
			case "batchnorm": item = new BatchNorm(); console.log("Created Batch Normalization Layer"); break;
			case "flatten": item = new Flatten(); console.log("Created Flatten Layer"); break;
			case "concatenate": item = new Concatenate(); console.log("Created Concatenate Layer"); break;
			case "dropout": item = new Dropout(); console.log("Created Dropout Layer"); break;


		}
		case 'activation': switch(options.detail.activationType) {
			case 'relu': item = new Relu(); console.log("Created Relu"); break;
			case 'sigmoid': item = new Sigmoid(); console.log("Created Sigmoid"); break;
			case 'tanh': item = new Tanh(); console.log("Created Tanh"); break;
		}
		case 'template':  switch(options.detail.templateType) {
			case 'blank': template = true; blankTemplate(svgData); console.log("Created Blank Template"); break;
			case 'default': template = true; defaultTemplate(svgData); console.log("Created Default Template"); break;
			case 'complex': template = true; complexTemplate(svgData); console.log("Created Complex Template"); break;
		}
	}

	if (template == null) {
		item.select()
		svgData.draggable.push(item);
	}
}

function switchClassExamples(options){
	// showPredictions()
}


function switchTab(tab) {
	// Hide all tabs
	document.getElementById("networkTab").style.display = "none"
    document.getElementById("progressTab").style.display = "none"
	document.getElementById("visualizationTab").style.display = "none"
	document.getElementById("informationTab").style.display = "none";

	// Hide all menus
	document.getElementById("networkMenu").style.display = "none";
	document.getElementById("progressMenu").style.display = "none";
	document.getElementById("visualizationMenu").style.display = "none";

	// Hide all paramshells
	document.getElementById("networkParamshell").style.display = "none";
	document.getElementById("progressParamshell").style.display = "none";
	document.getElementById("visualizationParamshell").style.display = "none";

	// Unselect all tabs
	document.getElementById("network").classList.remove("tab-selected")
	document.getElementById("progress").classList.remove("tab-selected")
	document.getElementById("visualization").classList.remove("tab-selected")

	// Display only the selected tab
	document.getElementById(tab.detail.tabType + "Tab").style.display = null;
	document.getElementById(tab.detail.tabType).classList.add("tab-selected")
	document.getElementById(tab.detail.tabType + "Menu").style.display = null;
	document.getElementById(tab.detail.tabType +"Paramshell").style.display = null;

	switch(tab.detail.tabType){
		case 'progress': renderAccuracyPlot(); renderLossPlot(); showConfusionMatrix(); break;
		case 'visualization': showPredictions(); break;
	}

	// Give border radius to top and bottom neighbors
	if (document.getElementsByClassName("top_neighbor_tab-selected").length > 0) {
		document.getElementsByClassName("top_neighbor_tab-selected")[0].classList.remove("top_neighbor_tab-selected")
		document.getElementsByClassName("bottom_neighbor_tab-selected")[0].classList.remove("bottom_neighbor_tab-selected")
	}

	let tabMapping = ["blanktab", "network", "progress", "visualization", "bottomblanktab"]
	let index = tabMapping.indexOf(tab.detail.tabType)

	document.getElementById(tabMapping[index-1]).classList.add("top_neighbor_tab-selected")
	document.getElementById(tabMapping[index+1]).classList.add("bottom_neighbor_tab-selected")

}

function showInformationOverlay() {
	if (document.getElementById("informationTab").style.display == "none") {
		document.getElementById("informationTab").style.display = "block";
	} else {
		document.getElementById("informationTab").style.display = "none";
	}
}

