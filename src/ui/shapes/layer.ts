import { Draggable } from "./draggable";
import { Rectangle, Point } from "./shape";
import { Activation } from "./activation";
import { Wire } from "./wire";
import * as d3 from "d3";

// TODO params for entering things in UI for layer properties

export abstract class Layer extends Draggable {
    block: Array<Rectangle>;
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
    block: Array<Rectangle> = [new Rectangle(new Point(-8, -90), 26, 100, '#b00202')]
    hole = new Rectangle(new Point(0, 0), 10, 10, '#eee')

    constructor() { 
        super()
        this.svgComponent = d3.select("svg")
                              .append("g")
                              .data([{"x": 10, "y": 10}])
                              .append("svg")

        for (var rect of this.block) {
            this.svgComponent.append("rect")
                             .attr("x", 0)//rect.location.x)
                             .attr("y", 0)//rect.location.y)
                             .attr("width", 26)//rect.width)
                             .attr("height", 100)//rect.height)
                             .style("fill", rect.color);
        }

        // this.svgComponent.attr('transform','translate('+100+','+100+')');

        this.svgComponent.append("rect")
                             .attr("x", 0)//rect.location.x)
                             .attr("y", 0)//rect.location.y)
                             .attr("width", 10)//rect.width)
                             .attr("height", 10)//rect.height)
                             .style("fill", "#0e0");

        

                              
        this.makeDraggable()
		// let rectData = layerRectData[this.layerType];
		// let portData = layerPortData;
		// this.svgComponent = svg.append('g');
		// this.ports = {};
		// this.rectangles = {};
		// for(let key in rectData){
		// 	this.rectangles[key] = this.svgComponent.append('rect').attr('x',rectData[key][0]).attr('y',rectData[key][1]).attr('width',rectData[key][2]).attr('height',rectData[key][3]).style('fill',rectData[key][4]);
		// }
		// for(let key in portData){
		// 	this.ports[key] = portData[key];
		// }
		// this.svgComponent.attr('transform','translate('+options.x+','+options.y+')');
		// makeDraggable(this);

		// this.connectors = [];
		// this.inputs = [];
		// this.outputs = [];

		// this.htmlComponent = createParamBox(this.layerType);
    }
    
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
