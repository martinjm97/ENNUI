import { Draggable } from "./draggable";
import { Rectangle, Point } from "./shape";
import { Activation } from "./activation";
import { Wire } from "./wire";
import * as d3 from "d3";
import { windowProperties } from "../window";

// TODO params for entering things in UI for layer properties
// TODO make holes transparent
// TODO make dragging bring item to front
// TODO make transparent holes not terrible

export abstract class Layer extends Draggable {
    block: Array<Rectangle>;
    hole = new Rectangle(new Point(0, 1), 10, 10, '#eee')
    connections: Set<Layer> = new Set();
    wires: Array<d3.Selection<SVGGraphicsElement, {}, HTMLElement, any>>;

    wireCircle: d3.Selection<SVGGraphicsElement, {}, HTMLElement, any>;
    wireCircleSelected: boolean = false;
    

    activation: Activation = null;
    uid: number;

    constructor(block: Array<Rectangle>) { 
        super()
        this.uid = Math.random()
        this.block = block
        this.svgComponent = d3.select<SVGGraphicsElement, {}>("svg")
                              .append<SVGGraphicsElement>("g")
                              .data([{"x": Draggable.defaultLocation.x, "y": Draggable.defaultLocation.y}])
                              .attr('transform','translate('+Draggable.defaultLocation.x+','+Draggable.defaultLocation.y+')');

        
        var i = 0
        for (var rect of this.block) {
            i += 1
            let mask = this.svgComponent.append("mask").attr("id", "page"+i+"draggable"+this.uid)
            mask.append("rect")
                .attr("x", rect.location.x)
                .attr("y", rect.location.y)
                .attr("width", "100%")
                .attr("height", "100%")
                .style("fill", "white")
            mask.append("rect")
                .attr("x", this.hole.location.x)
                .attr("y", this.hole.location.y)
                .attr("width", this.hole.width)
                .attr("height", this.hole.height)

            this.svgComponent.append("rect")
                             .attr("x", rect.location.x)
                             .attr("y", rect.location.y)
                             .attr("width", rect.width)
                             .attr("height", rect.height)
                             .style("fill", rect.color)
                             .attr("mask", "url(#page"+i+"draggable"+this.uid+")");
        }

        this.wireCircle = this.svgComponent.append<SVGGraphicsElement>("circle")
                                                .attr("cx", this.center().x)
                                                .attr("cy", this.center().y)
                                                .attr("r", 10)
                                                .style("fill", "black")
                                                .style("stroke-width", "2")
                                                .style("visibility", "hidden")
                                                

        this.svgComponent.on("click", () => {this.select()})

        this.wireCircle.on("click", () => {
            this.wireCircleSelected = true
            this.wireCircle.style("stroke", "red")
        })
                              
        this.makeDraggable()
    }

    public select() {
        if (windowProperties.selectedElement != null) {
            if (windowProperties.selectedElement === this) {
                return
            } else if (windowProperties.selectedElement instanceof Layer && windowProperties.selectedElement.wireCircleSelected) {
                Layer.createConnection(this, windowProperties.selectedElement)

                console.log(this.connections)
            }
            windowProperties.selectedElement.unselect()
        }
        windowProperties.selectedElement = this
        this.svgComponent.raise()
        this.wireCircle.style("visibility", "visible")
        this.svgComponent.selectAll("rect").style("stroke", "yellow").style("stroke-width", "2")
    }

    public unselect() {
        this.wireCircle.style("visibility", "hidden")
        this.svgComponent.selectAll("rect").style("stroke", null).style("stroke-width", null)
        this.wireCircleSelected = false
        this.wireCircle.style("stroke", null)
    }

    public static createConnection(layer1: Layer, layer2: Layer) {
        layer1.connections.add(layer2)
        layer2.connections.add(layer1)
        layer2.wires.push(d3.select("svg").append("line"))

        function convertCoords(x,y) {

            // var offset = svgDoc.getBoundingClientRect();
          
            
          }

        var lines = 
                .style("stroke", "gray") // <<<<< Add a color
                .attr("x1", function (d: any, i) {
                    var matrix = layer1.svgComponent.node().getScreenCTM();
                    let x = layer1.center().x
                    let y = layer1.center().y
          
                    let thing = {
                    x: (matrix.a * x) + (matrix.c * y) + matrix.e, //- offset.left,
                    y: (matrix.b * x) + (matrix.d * y) + matrix.f, // - offset.top
                    };
                    return thing.x
                })
                .attr("y1", function (d: any) {
                    var matrix = layer1.svgComponent.node().getScreenCTM();
                    let x = layer1.center().x
                    let y = layer1.center().y
          
                    let thing = {
                    x: (matrix.a * x) + (matrix.c * y) + matrix.e, //- offset.left,
                    y: (matrix.b * x) + (matrix.d * y) + matrix.f, // - offset.top
                    };
                    return thing.y
                })
                .attr("x2", function (d: any) {
                    var matrix = layer2.svgComponent.node().getScreenCTM();
                    let x = layer2.center().x
                    let y = layer2.center().y
          
                    let thing = {
                    x: (matrix.a * x) + (matrix.c * y) + matrix.e, //- offset.left,
                    y: (matrix.b * x) + (matrix.d * y) + matrix.f, // - offset.top
                    };
                    return thing.x
                })
                .attr("y2", function (d: any) {
                    var matrix = layer2.svgComponent.node().getScreenCTM();
                    let x = layer2.center().x
                    let y = layer2.center().y

                    console.log(matrix)
                    console.log(layer2.center())
          
                    let thing = {
                    x: (matrix.a * x) + (matrix.c * y) + matrix.e, //- offset.left,
                    y: (matrix.b * x) + (matrix.d * y) + matrix.f, // - offset.top
                    };
                    return thing.y
                })


    }

    public center(): Point {
        let bbox = this.svgComponent.node().getBBox()
        console.log(bbox)
        return new Point(bbox.x+bbox.width/2, bbox.y+bbox.height/2)
    }

}

export class Conv2D extends Layer {
    static readonly blockSize: number = 50;

    constructor() {
        super([new Rectangle(new Point(-54, -80), Conv2D.blockSize, Conv2D.blockSize, '#028002'),
               new Rectangle(new Point(-37, -60), Conv2D.blockSize, Conv2D.blockSize, '#029002'),
               new Rectangle(new Point(-20, -40), Conv2D.blockSize, Conv2D.blockSize, '#02a002')])
    }
}

export class Dense extends Layer {
    constructor() {
        super([new Rectangle(new Point(-8, -90), 26, 100, '#b00202')])
    }
} 

export class MaxPooling2D extends Layer {
    static readonly blockSize: number = 30;

    constructor() {
        super([new Rectangle(new Point(-44, -60), MaxPooling2D.blockSize, MaxPooling2D.blockSize, '#3260a2'),
               new Rectangle(new Point(-27, -40), MaxPooling2D.blockSize, MaxPooling2D.blockSize, '#3260c2'),
               new Rectangle(new Point(-10, -20), MaxPooling2D.blockSize, MaxPooling2D.blockSize, '#3260e2')])
    }

}