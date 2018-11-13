import { Draggable } from "./shapes/draggable";
import { Wire } from "./shapes/wire";

export enum Mode {
    Move,
    Connect
}

class WindowProperties
{
    private static _instance: WindowProperties;
    selectedElement: Draggable | Wire;
    mode: Mode = Mode.Move
    draggedElement: any;
    selectState: any;
    xClickOffset: any;
    yClickOffset: any;
    wireInputElement: any;
    defaultparambox: any;

    private constructor(){}

    public static get Instance()
    {
        return this._instance || (this._instance = new this());
    }
}

export const windowProperties = WindowProperties.Instance;