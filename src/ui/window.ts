import { Draggable } from "./shapes/draggable";
import { Wire } from "./shapes/wire";
import { ActivationLayer } from "./shapes/layer";

export enum Mode {
    Move,
    Connect
}

class WindowProperties
{
    private static _instance: WindowProperties;
    selectedElement: Draggable | Wire;
    activationLayers: Set<ActivationLayer> = new Set();
    mode: Mode = Mode.Move;
    draggedElement: any;
    selectState: any;
    xClickOffset: any;
    yClickOffset: any;
    wireInputElement: any;
    defaultparambox: any;
    wireGuide: d3.Selection<SVGGraphicsElement, {}, HTMLElement, any>;
    wireGuideCircle: d3.Selection<SVGGraphicsElement, {}, HTMLElement, any>;

    private constructor(){}

    public static get Instance()
    {
        return this._instance || (this._instance = new this());
    }
}

export const windowProperties = WindowProperties.Instance;