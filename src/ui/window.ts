import { Draggable } from "./shapes/draggable";

class WindowProperties
{
    private static _instance: WindowProperties;
    selectedElement: Draggable;
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