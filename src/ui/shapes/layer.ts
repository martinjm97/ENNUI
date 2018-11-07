import { Draggable } from "./draggable";
import { Rectangle, Point } from "./shape";

export abstract class Layer extends Draggable {
    block: Array<Rectangle>;
    hole: Rectangle;
}

export class Conv2D extends Layer {
    static readonly pageOffsetX: number = -17;
    static readonly pageOffsetY: number = -20;
    static readonly initOffsetX: number = -20;
    static readonly initOffsetY: number = -40;
    static readonly blockSize: number = 50;

    block = [new Rectangle(new Point(2*Conv2D.pageOffsetX + Conv2D.initOffsetX, 
                                     2*Conv2D.pageOffsetY + Conv2D.initOffsetY), 
                           Conv2D.blockSize, Conv2D.blockSize, '#028002'),
             new Rectangle(new Point(Conv2D.pageOffsetX + Conv2D.initOffsetX, 
                                     Conv2D.pageOffsetY + Conv2D.initOffsetY), 
                           Conv2D.blockSize, Conv2D.blockSize, '#029002'),
             new Rectangle(new Point(Conv2D.initOffsetX, Conv2D.initOffsetY), 
                           Conv2D.blockSize, Conv2D.blockSize, '#02a002') ]
    hole = new Rectangle(new Point(0, 0), 10, 10, '#eee')

}

export class Dense extends Layer {
    block = [new Rectangle(new Point(-8, -90), 26, 100, '#b00202')]
    hole = new Rectangle(new Point(0, 0), 10, 10, '#eee')
} 

export class MaxPooling2D extends Layer {
    static readonly reducedSizeX: number = 10;
    static readonly reducedSizeY: number = 20;

    block = [new Rectangle(new Point(MaxPooling2D.reducedSizeX + (2*Conv2D.pageOffsetX + Conv2D.initOffsetX), 
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
