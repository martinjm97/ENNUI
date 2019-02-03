import { Point } from "./shape";
import * as d3 from "d3";
import { windowProperties } from "../window";

export abstract class Draggable {
    static readonly snapRadius: number = 400;
    htmlComponent: any;
    svgComponent: d3.Selection<SVGGraphicsElement, {}, HTMLElement, any>;
    hoverText: any = d3.select("body")
                       .append("div")
                       .style("position", "absolute")
                       .style("font-weight", "bold")
                       .style("padding", "6px")
                       .style("background", "rgba(0, 0, 0, 0.8)")
                       .style("color", "#eee")
                       .style("border-radius", "2px")
                       .style("display", "none")
                       .style("font-family", "Helvetica")
                       .style("user-select","none")
                       .text(this.getHoverText());
    moveTimeout: any;
    
    constructor(defaultLocation=new Point(50,100)) {        
        this.svgComponent = d3.select<SVGGraphicsElement, {}>("#svg")
                              .append<SVGGraphicsElement>("g")
                              .attr('transform','translate('+defaultLocation.x+','+defaultLocation.y+')')
                              .on("click", () => { 
                                  this.select()
                                  window.clearTimeout(this.moveTimeout)
                                  this.hoverText.style("visibility", "hidden") 
                                })
                              .on("contextmenu", () => {
                                window.clearTimeout(this.moveTimeout)
                                this.hoverText.style("visibility", "hidden") 
                                })
                              .on("mousemove", () => {
                                  this.hoverText.style("visibility", "hidden")
                                  clearTimeout(this.moveTimeout);
                                  this.moveTimeout = setTimeout(() => {this.hoverText.style("display", "");this.hoverText.style("visibility", "visible")}, 1000);
                                  this.hoverText.style("top", (d3.event.pageY - 40)+"px").style("left",(d3.event.pageX - 30)+"px") })
                              .on("mouseout", () => {clearTimeout(this.moveTimeout)})
        this.makeDraggable()
    }

    public makeDraggable(){
        let firstDrag = true
        let mousePosRelativeToCenter:Point;
        this.svgComponent.on("mousedown", function() {
            let coords = d3.mouse(this)
            mousePosRelativeToCenter = new Point(coords[0], coords[1])
        })

        var dragThings = (d: any) => {
            clearTimeout(this.moveTimeout)
            this.hoverText.style("visibility", "hidden")
            if (firstDrag) {
                // Perform on drag start here instead of using on("start", ...) since d3 calls drag starts weirdly (on mousedown,
                // instead of after actually dragging a little bit)
                this.select()                
                firstDrag = false
            }
            let canvas = document.getElementById("svg")          
            // TODO: take into account the width of the object this.svgComponent
            let tx = Math.min(Math.max(0, d3.event.x - mousePosRelativeToCenter.x), canvas.clientWidth)
            let ty = Math.min(Math.max(0, d3.event.y - mousePosRelativeToCenter.y), canvas.clientHeight)
            this.svgComponent.attr("transform", "translate(" + (tx) + "," + (ty) + ")")

            this.dragAction(d)
        }

        let dragHandler = d3.drag().touchable(true).clickDistance(4)
            .on("drag", dragThings) 
            .on("end", () => {firstDrag = true})

        this.svgComponent.call(dragHandler)
    }

    // Special behavior when being dragged e.g. activations snap to Layers
    public dragAction(d) {}

    // The text to display when hovering over an object
    public getHoverText(): string { return "" }

    public select() {
        if (windowProperties.selectedElement != null) {
            if (windowProperties.selectedElement === this) {
                return
            }
            windowProperties.selectedElement.unselect()
        }
        windowProperties.selectedElement = this
        this.svgComponent.raise()
        this.svgComponent.selectAll("rect").style("stroke", "yellow").style("stroke-width", "2")
    }

    public unselect() {
        this.svgComponent.selectAll("rect").style("stroke", null).style("stroke-width", null)
    }

    public delete() {
        this.unselect()
        this.svgComponent.remove()
        this.hoverText.remove()
    }

    public center(): Point {
        let bbox = this.svgComponent.node().getBBox()
        return new Point(bbox.x+bbox.width/2, bbox.y+bbox.height/2)
    }
    

    getPosition(): Point {
		let transformation = this.svgComponent.attr('transform')
		let numArr = transformation.substring( transformation.indexOf('(') + 1 , transformation.indexOf(')') ).split(',').map(value => parseInt(value));
        return new Point(numArr[0], numArr[1])
    }
    
    setPosition(position: Point) {
		this.svgComponent.attr('transform','translate('+position.x+','+position.y+')')
    }
}