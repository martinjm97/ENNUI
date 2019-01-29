import { stateFromJson, SerializedNetwork } from "./export_model";
import { DraggableData } from "../ui/app";
import { Input } from "../ui/shapes/layers/input";
import { Output } from "../ui/shapes/layers/output";
import { defaultTemplate, resetWorkspace } from "../ui/model_templates";

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
            console.log("following if")
            let network: SerializedNetwork = JSON.parse(decodeURI(urlParams.slice(1,)))
           
            // Serialize the model if it exists
            svgData = stateFromJson(svgData, network)
        } else {
            console.log("following else")
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
    window.location.hash = ''
    return svgData
}