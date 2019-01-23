import { Draggable } from "./shapes/draggable";
import { Relu, Sigmoid, Tanh } from "./shapes/activation";
import { windowProperties } from "./window";
import { buildNetwork, buildNetworkDAG } from "../model/build_network";
import { blankTemplate, defaultTemplate } from "./model_templates";
import { graphToJson } from "../model/export_model";
import { train } from "../model/mnist_model";
import { setupPlots, showPredictions, setupTestResults } from "../model/graphs";
import { model } from "../model/paramsObject"
import { Input } from "./shapes/layers/input";
import { Output } from "./shapes/layers/output";
import { Dense } from "./shapes/layers/dense";
import { Conv2D } from "./shapes/layers/convolutional";
import { MaxPooling2D } from "./shapes/layers/maxpooling";
import { clearError, displayError } from "./error";

export interface DraggableData {
	draggable: Array<Draggable>
	input: Input
	output: Output
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
			console.log("switching tabs")
			switchTab(e);
		}
	});
	
	document.getElementById('defaultOptimizer').classList.add('selected')

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
				if(windowProperties.selectedElement){
					windowProperties.selectedElement.unselect();
					windowProperties.selectedElement = null;
				}
				break;
			case 'Delete' :
				if(windowProperties.selectedElement){
					windowProperties.selectedElement.delete();
					windowProperties.selectedElement = null;
				}
				break;
			case 'Enter' :
				// graphToJson();
				// train(buildNetwork(svgData.input))
				break;
		}
	};

	svgData.input = new Input();
	svgData.output = new Output();
	defaultTemplate(svgData)
});



async function trainOnClick() {

	// Only train if not already training

	let training = document.getElementById('train'); 
	if (!training.classList.contains("train-active")){
		clearError()

		// Grab hyperparameters
		
		let temp : number = 0;
		let hyperparams = document.getElementsByClassName("hyperparamvalue")
	
		for (var hp of hyperparams) {
			let name : string = hp.id; 
	
			temp = Number((<HTMLInputElement>document.getElementById(name)).value);
			if (temp > 0) {
				
			}
			else {
				let error : Error = Error("Hyperparameters should be positive numbers.")
				displayError(error);
				return;
			}
			switch(name){
				case "paramlr":
					model.params.learningRate = temp;
					break;
				
				case "paramepoch":
					model.params.epochs = Math.trunc(temp);
					break;
	
				case "parambaatch":
					model.params.batchSize = Math.trunc(temp);
					break;
	
			};
			
		}

		let trainingBox = document.getElementById('ti_training');
		trainingBox.children[1].innerHTML = 'Yes';
		training.innerHTML = "Training"; 
		training.classList.add("train-active");
		try {
			model.architecture = buildNetworkDAG(svgData.output)
			await train()
		} 
		finally {
			training.innerHTML = "Train";
			training.classList.remove("train-active");
			trainingBox.children[1].innerHTML = 'No'
		}
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


function dispatchCreationOnClick(elmt){
	elmt.addEventListener('click', function(e){
		let itemType = elmt.parentElement.getAttribute('data-itemType')

		if (model.params.isParam(itemType)){
			let setting = elmt.getAttribute('data-trainType')
			
			let selected = elmt.parentElement.getElementsByClassName("selected")
			if (selected.length > 0) {
				selected[0].classList.remove("selected")
			}
			elmt.classList.add("selected");
			updateNetworkParameters({itemType: itemType, setting : setting});
		} else if (itemType == "classes") {
			let selected = elmt.parentElement.getElementsByClassName("selected");
			if (selected.length > 0) {
				selected[0].classList.remove("selected")
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
		}
		case 'activation': switch(options.detail.activationType) {
			case 'relu': item = new Relu(); console.log("Created Relu"); break;
			case 'sigmoid': item = new Sigmoid(); console.log("Created Sigmoid"); break;
			case 'tanh': item = new Tanh(); console.log("Created Tanh"); break;
		}
		case 'template':  switch(options.detail.templateType) {
			case 'default': template = true; defaultTemplate(svgData); console.log("Created Default Template"); break;
			case 'blank': template = true; blankTemplate(svgData); console.log("Created Blank Template"); break;
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
	document.getElementById(tab.detail.tabType).style.display = null; 
	document.getElementById(tab.detail.tabType).classList.add("tab-selected")
	document.getElementById(tab.detail.tabType + "Menu").style.display = null;
	document.getElementById(tab.detail.tabType +"Paramshell").style.display = null;
	
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


let svgData: DraggableData = {
	draggable : [],
	input: null,
	output: null
}	