import { stateFromJson, SerializedNetwork } from "./export_model";
import { DraggableData } from "../ui/app";
import { Input } from "../ui/shapes/layers/input";
import { Output } from "../ui/shapes/layers/output";
import { defaultTemplate, resetWorkspace } from "../ui/model_templates";
import { getSvgOriginalBoundingBox } from "../ui/utils";

export function storeNetworkInUrl(state: SerializedNetwork): string{
    // To encode in URL
    // window.location.hash = encodeURI(JSON.stringify(state))
    return encodeURI(JSON.stringify(state))
}

export function loadStateIfPossible() {
    
    let svgData: DraggableData = {
		draggable : [],
		input: null,
		output: null
    };
    
    let urlParams: string = window.location.hash
    try {
        resetWorkspace(svgData)
        if (urlParams.length > 1) {
            console.log("loading from URL")
            let network: SerializedNetwork = JSON.parse(decodeURI(urlParams.slice(1,)))
           
            // Serialize the model if it exists
            svgData = stateFromJson(svgData, network)
        } else {
            console.log("Creating default network")
            svgData.input = new Input();
            svgData.output = new Output();
            defaultTemplate(svgData)
        }
    } catch (err){
        console.log("Error decoding!")
        // TODO: maybe add redirect message?
        svgData.input = new Input();
        svgData.output = new Output();
        defaultTemplate(svgData)
        throw err
    }


    // Used for getting positions of each draggable in terms of percents of svg canvas; useful if creating a new template
    // let canvasBoundingBox = getSvgOriginalBoundingBox(document.getElementById("svg"));
	// let width = canvasBoundingBox.width;
    // let height = canvasBoundingBox.height;
    
    // for (let draggable of svgData.draggable) {
    //     let pos = draggable.getPosition()
    //     console.log(pos.x / width, pos.y / height, draggable.getHoverText())
    // }
    
    history.replaceState(null, null, ' ');

    return svgData
}