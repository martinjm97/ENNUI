import { ActivationLayer } from "./shapes/activationlayer";
import { Draggable } from "./shapes/draggable";
import { TextBox } from "./shapes/textbox";
import { Wire } from "./shapes/wire";
import { WireGuide } from "./shapes/wireguide";

export enum Mode {
    Move,
    Connect,
}

class WindowProperties {
    private static instance: WindowProperties;
    public selectedElement: Draggable | Wire;
    public activationLayers: Set<ActivationLayer> = new Set();
    public mode: Mode = Mode.Move;
    public draggedElement: any;
    public selectState: any;
    public xClickOffset: any;
    public yClickOffset: any;
    public wireInputElement: any;
    public defaultparambox: any;
    public wireGuide: WireGuide;
    public svgTransformRatio: number = 1;
    public svgYOffset: number = 0;
    public shapeTextBox: TextBox;

    private constructor() {}

    public static get Instance(): WindowProperties {
        return this.instance || (this.instance = new this());
    }
}

export const windowProperties = WindowProperties.Instance;
