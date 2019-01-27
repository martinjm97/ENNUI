import { layerJson } from "../ui/shapes/layer";
import { jsonToLayers } from "./export_model";

export function storeNetworkInUrl(state: layerJson[]){
    window.location.hash = encodeURIComponent(JSON.stringify(state))
}

export function loadStateIfPossible() {
    let urlParams: string = window.location.hash
    try {
        if (urlParams.length > 0) {
            let network: layerJson[] = JSON.parse(decodeURIComponent(urlParams.slice(1,)))
           
            // Serialize the model if it exists
            let svgData = jsonToLayers(network)
            console.log("Generated svg data", svgData)
        }
    } catch (err){
        console.log("Error decoding!")
        // TODO: maybe add redirect message?
        window.location.hash = ''
        throw err
    }
}