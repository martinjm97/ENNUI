import { Draggable } from "./draggable";
import { Rectangle, Point } from "./shape";
import { Activation } from "@tensorflow/tfjs-layers/dist/layers/core";

// TODO params for entering things in UI for layer properties

export abstract class Layer extends Draggable {
    pages: Array<Rectangle>;
    hole: Rectangle;

    inputLayers: Array<Layer>;
    outputLayers: Array<Layer>;
    wires: Array<Layer>;

    activation: Activation = null;
    uid: number;

}

export class Conv2D extends Layer {
    static readonly pageOffsetX: number = -17;
    static readonly pageOffsetY: number = -20;
    static readonly initOffsetX: number = -20;
    static readonly initOffsetY: number = -40;
    static readonly pageSize: number = 50;

    pages = [new Rectangle(new Point(2*Conv2D.pageOffsetX + Conv2D.initOffsetX, 
                                     2*Conv2D.pageOffsetY + Conv2D.initOffsetY), 
                           Conv2D.pageSize, Conv2D.pageSize, '#028002'),
             new Rectangle(new Point(Conv2D.pageOffsetX + Conv2D.initOffsetX, 
                                     Conv2D.pageOffsetY + Conv2D.initOffsetY), 
                           Conv2D.pageSize, Conv2D.pageSize, '#029002'),
             new Rectangle(new Point(Conv2D.initOffsetX, Conv2D.initOffsetY), 
                           Conv2D.pageSize, Conv2D.pageSize, '#02a002') ]
    hole = new Rectangle(new Point(0, 0), 10, 10, '#eee')

}

export class Dense extends Layer {
    pages = [new Rectangle(new Point(-8, -90), 26, 100, '#b00202')]
    hole = new Rectangle(new Point(0, 0), 10, 10, '#eee')
} 

export class MaxPooling2D extends Layer {
    static readonly reducedSizeX: number = 10;
    static readonly reducedSizeY: number = 20;

    pages = [new Rectangle(new Point(MaxPooling2D.reducedSizeX + (2*Conv2D.pageOffsetX + Conv2D.initOffsetX), 
                                     MaxPooling2D.reducedSizeY + (2*Conv2D.pageOffsetY + Conv2D.initOffsetY)), 
                           50, 50, '#028002'),
             new Rectangle(new Point(MaxPooling2D.reducedSizeX + (Conv2D.pageOffsetX + Conv2D.initOffsetX), 
                                     MaxPooling2D.reducedSizeY + (Conv2D.pageOffsetY + Conv2D.initOffsetY)), 
                           50, 50, '#029002'),
             new Rectangle(new Point(MaxPooling2D.reducedSizeX + Conv2D.initOffsetX, 
                                     MaxPooling2D.reducedSizeY + Conv2D.initOffsetY), 
                           50, 50, '#02a002') ]
    hole = new Rectangle(new Point(0, 0), 10, 10, '#eee')

}
