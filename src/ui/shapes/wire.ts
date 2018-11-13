import { Shape, Point } from "./shape";
import { Layer, Dense } from "./layer";
import * as d3 from "d3";

export class Wire extends Shape {
    static readonly defaultLocation: Point = new Point(200, 200);

    layer1: Layer;
    layer2: Layer;
    lines: Array<d3.Selection<SVGGraphicsElement, {}, HTMLElement, any>> = [];
    lineData: number[][];

    constructor(layer1: Layer, layer2: Layer) {
        super()
        this.layer1 = layer1
        this.layer2 = layer2


        let inputPosition = layer1.getPosition()
        let outputPosition = layer2.getPosition()

        let connections = connectionTypes.get(layer1.type).get(layer2.type)
        this.lineData = connections.input.concat(connections.cross)
        for (let data of this.lineData ) {
            this.lines.push(d3.select<SVGGraphicsElement, {}>("svg")
                    .append<SVGGraphicsElement>("g")
                    .append<SVGGraphicsElement>("line")
                    .attr('x1',inputPosition[0]+data[0])
                    .attr('y1',inputPosition[1]+data[1])
                    .attr('x2',outputPosition[0]+data[2])
                    .attr('y2',outputPosition[1]+data[3])
                    .style('stroke','black')
                    .style('stroke-width',2));
        }

        this.layer1.svgComponent.raise()
        this.layer2.svgComponent.raise()

        
    }

    updatePosition() {
        let inputPosition = this.layer1.getPosition()
        let outputPosition = this.layer2.getPosition()
        for (let i in this.lineData) {
            this.lines[i].attr('x1',inputPosition[0]+this.lineData[i][0])
                .attr('y1',inputPosition[1]+this.lineData[i][1])
                .attr('x2',outputPosition[0]+this.lineData[i][2])
                .attr('y2',outputPosition[1]+this.lineData[i][3])
        }
    }

}

let connectionTypes: Map<string, Map<string, {input: number[][], cross: number[][]} >> = new Map([
    ["dense", new Map([
        ["input", {
            input: [],
            cross : [
            [30,10,5,-70],
            [30,10,5,-40],
            [30,10,5,-10],
            [30,20,5,-70],
            [30,20,5,-40],
            [30,20,5,-10],
            [30,30,5,-70],
            [30,30,5,-40],
            [30,30,5,-10]]
        }],
        ["conv2D", {
            input: [],
            cross : [
            [5, -70, 5-50,-33-17-17],
            [5, -40, 5-50,-33-17-17],
            [5, -10, 5-50,-33-17-17],
            [5, -70, 5-50+17,-33-17],
            [5, -40, 5-50+17,-33-17],
            [5, -10, 5-50+17,-33-17],
            [5, -70, 5-50+17+17,-33],
            [5, -40, 5-50+17+17,-33],
            [5, -10, 5-50+17+17,-33]]
        }],
        ["dense", {
            input: [],
            cross : [
            [5,-70,5,-70],
            [5,-70,5,-40],
            [5,-70,5,-10],
            [5,-40,5,-70],
            [5,-40,5,-40],
            [5,-40,5,-10],
            [5,-10,5,-70],
            [5,-10,5,-40],
            [5,-10,5,-10]]
        }],
        ["maxPooling2D", {
            input: [],
            cross : [ 
            [5,-70, 5-17-17,-8-17-17],
            [5,-40, 5-17-17,-8-17-17],
            [5,-10, 5-17-17,-8-17-17],
            [5, -70, 5-17,-8-17],
            [5, -40, 5-17,-8-17],
            [5, -10, 5-17,-8-17],
            [5, -70, 5,-8],
            [5, -40, 5,-8],
            [5, -10, 5,-8]]
        }],
        ["output", {
            input: [],
            cross : [
            [5,-70,0,-60],
            [5,-70,0,-0],
            [5,-70,0, 60],
            [5,-40,0,-60],
            [5,-40,0,-0],
            [5,-40,0, 60],
            [5,-10,0,-60],
            [5,-10,0,-0],
            [5,-10,0, 60]]
        }]
    ])],
    ["input", new Map([
        ["maxPooling2D", {
            input : [
            [10,10,10,30],
            [30,30,10,30],
            [30,30,30,10],
            [10,10,30,10],
            ],
            cross : [
            [10,10,-7,-27],
            [10,30,-7,-27],
            [30,10,-7,-27],
            [30,30,-7,-27],
            ]
        }]
    ])],
    ["conv2D", new Map([
        ["dense", {
            input: [],
            cross : [
            [5-50,-33-17-17,5,-70],
            [5-50,-33-17-17,5,-40],
            [5-50,-33-17-17,5,-10],
            [5-50+17,-33-17,5,-70],
            [5-50+17,-33-17,5,-40],
            [5-50+17,-33-17,5,-10],
            [5-50+17+17,-33,5,-70],
            [5-50+17+17,-33,5,-40],
            [5-50+17+17,-33,5,-10]]
        }],
        ["conv2D", {
            input : [
            [-20,-40,5,-40],
            [5,-40,5,-15],
            [5,-15,-20,-15],
            [-20,-15,-20,-40],
            ],
            cross : [
            [-20,-40,-7,-27],
            [5,-40,-7,-27],
            [5,-15,-7,-27],
            [-20,-15,-7,-27],
            ]
        }],
        ["maxPooling2D", {
            input : [
            [-20,-40,5,-40],
            [5,-40,5,-15],
            [5,-15,-20,-15],
            [-20,-15,-20,-40],
            ],
            cross : [
            [-20,-40,-7,-27],
            [5,-40,-7,-27],
            [5,-15,-7,-27],
            [-20,-15,-7,-27],
            ]
        }]
    ])],
    ["maxPooling2D", new Map([
        ["dense", {
            input: [],
            cross : [ 
            [5-17-17,-8-17-17,5,-70],
            [5-17-17,-8-17-17,5,-40],
            [5-17-17,-8-17-17,5,-10],
            [5-17,-8-17,5,-70],
            [5-17,-8-17,5,-40],
            [5-17,-8-17,5,-10],
            [5,-8,5,-70],
            [5,-8,5,-40],
            [5,-8,5,-10]]
        }],
        ["conv2D", {
            input : [
            [-10,-20,15-10,-20],
            [15-10,15-20,15-10,-20],
            [15-10,15-20,-10,15-20],
            [-10,-20,-10,15-20],
            ],
            cross : [
            [-10,-20,-7,-27],
            [-10,15-20,-7,-27],
            [15-10,15-20,-7,-27],
            [15-10,-20,-7,-27],
            ]
        }],
        ["maxPooling2D", {
            input : [
            [-10,-20,15-10,-20],
            [15-10,15-20,15-10,-20],
            [15-10,15-20,-10,15-20],
            [-10,-20,-10,15-20],
            ],
            cross : [
            [-10,-20,-7,-27],
            [-10,15-20,-7,-27],
            [15-10,15-20,-7,-27],
            [15-10,-20,-7,-27],
            ]
        }]
    ])]
])