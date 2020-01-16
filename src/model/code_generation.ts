import { displayError } from "../ui/error";
import { ActivationLayer } from "../ui/shapes/activationlayer";
import { Layer } from "../ui/shapes/layer";
import { juliaSkeleton } from "./julia_skeleton";
import { pythonSkeleton } from "./python_skeleton";
/**
 * Creates corresponding Python code.
 * @param sorted topologically sorted list of layers
 */
export function generatePython(sorted: Layer[]): string {
    let pythonScript: string = "";
    for (const layer of sorted) {
        const layerstring = layer.lineOfPython();
        let applystring = ""; // Nothing to apply if no parents (input)
        if (layer.parents.size === 1) {
            applystring = `(x${layer.parents.values().next().value.uid})`;
        } else if (layer.parents.size > 1) {
            applystring = `([${[...layer.parents].map((p) => "x" + p.uid).join(", ")}])`;
        }
        pythonScript += `x${layer.uid} = ` + layerstring + applystring + "\n";
        // TODO: Move this to BatchNorm and generalize layerstring to an array
        if (layer.layerType === "BatchNorm" && (layer as ActivationLayer).activation != null) {
            if (this.activation != null && this.activation.activationType !== "relu") {
                displayError(new Error("Batch Normalization does not support activations other than ReLu"));
            }
            pythonScript += `x${layer.uid} = ` + "ReLU()" + `(x${layer.uid})` + "\n";
        }
    }
    pythonScript += `model = Model(inputs=x${sorted[0].uid}, outputs=x${sorted[sorted.length - 1].uid})`;
    return pythonSkeleton(pythonScript);
}
/**
 * Creates corresponding Julia code.
 * @param sorted topologically sorted list of layers
 */
export function generateJulia(sorted: Layer[]): string {
    let juliaInitialization: string = "";
    let juliaScript: string = "";
    for (const layer of sorted) {
        juliaInitialization += layer.initLineOfJulia();
        juliaScript += layer.lineOfJulia();
    }
    return juliaSkeleton(juliaInitialization, juliaScript);
}
