import { DraggableData } from "../ui/app";
import { defaultTemplate, resetWorkspace } from "../ui/model_templates";
import { Input } from "../ui/shapes/layers/input";
import { Output } from "../ui/shapes/layers/output";
import { ISerializedNetwork, stateFromJson } from "./export_model";

export function storeNetworkInUrl(state: ISerializedNetwork): string {
    // To encode in URL
    return encodeURI(JSON.stringify(state));
}

/**
 * Load a network from a URL if possible. Otherwise, load the default workspace.
 */
export function loadStateIfPossible(): DraggableData {

    let svgData: DraggableData = {
        draggable : [],
        input: null,
        output: null,
    };

    const urlParams: string = window.location.hash;
    try {
        resetWorkspace(svgData);
        if (urlParams.length > 1) {
            const network: ISerializedNetwork = JSON.parse(decodeURI(urlParams.slice(1)));

            // Serialize the model if it exists
            svgData = stateFromJson(svgData, network);
        } else {
            svgData.input = new Input();
            svgData.output = new Output();
            defaultTemplate(svgData);
        }
    } catch (err) {
        svgData.input = new Input();
        svgData.output = new Output();
        defaultTemplate(svgData);
        throw err;
    }

    // Used for getting positions of each draggable in terms of percents of svg canvas
    // useful if creating a new template
    // let canvasBoundingBox = getSvgOriginalBoundingBox(document.getElementById("svg"));
    // let width = canvasBoundingBox.width;
    // let height = canvasBoundingBox.height;

    // for (let draggable of svgData.draggable) {
    //     let pos = draggable.getPosition()
    //     console.log(pos.x / width, pos.y / height, draggable.getHoverText())
    // }

    history.replaceState(null, null, " ");

    return svgData;
}
