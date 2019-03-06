import { Point } from "./shape";
import * as d3 from "d3";
import { windowProperties } from "../window";
import { getSvgOriginalBoundingBox } from "../utils";

export abstract class Draggable {
    static readonly snapRadius: number = 400;
    htmlComponent: HTMLElement;
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
    readonly wireGuidePresent: boolean = false;

    constructor(defaultLocation=new Point(50,100), invisible=false) {
        if(!invisible) {
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
                                    this.moveTimeout = setTimeout(() => {this.hoverText.style("display", "");this.hoverText.style("visibility", "visible")}, 280);
                                    this.hoverText.style("top", (d3.event.pageY - 40)+"px").style("left",(d3.event.pageX - 30)+"px") })
                                .on("mouseout", () => {clearTimeout(this.moveTimeout)})
            this.makeDraggable()
        }
    }

    public makeDraggable(){
        let firstDrag = true
        // Fix the offset from the mouse by calculating the distance from the mouse to the center of the object upon mousedown
        let mousePosRelativeToCenter:Point;
        this.svgComponent.on("mousedown", function() {
            let coords = d3.mouse(this)
            mousePosRelativeToCenter = new Point(coords[0], coords[1])
        })

        var dragThings = (d: any) => {
            clearTimeout(this.moveTimeout)
            this.hoverText.style("visibility", "hidden")
            if (firstDrag) {
                // Since touch drags don't activate the mousedown event, catch touch drags here, even though there might be a slight offset
                if (mousePosRelativeToCenter == null) {
                    let coords = d3.mouse(this.svgComponent.node())
                    mousePosRelativeToCenter = new Point(coords[0], coords[1])
                }
                // Perform on drag start here instead of using on("start", ...) since d3 calls drag starts weirdly (on mousedown,
                // instead of after actually dragging a little bit)
                // this.select()
                firstDrag = false
            }
            let canvasBoundingBox = getSvgOriginalBoundingBox(document.getElementById("svg"))
            // TODO: take into account the width of the object this.svgComponent
            let tx = Math.min(Math.max(0, d3.event.x - mousePosRelativeToCenter.x), canvasBoundingBox.width)
            let ty = Math.min(Math.max(0, d3.event.y - mousePosRelativeToCenter.y), canvasBoundingBox.height)

            this.svgComponent.attr("transform", "translate(" + (tx) + "," + (ty) + ")")

            this.dragAction(d)
            // Dragging seems to force mousemove event to be ignored. Since we
            // use the mousemove event on the svg to move the wire guide, just do that
            // here unless we find a way to not ignore the mousemove event.
            Draggable.moveWireGuideToMouse()
        }

        let dragHandler = d3.drag().touchable(true).clickDistance(4)
            .on("drag", dragThings)
            .on("end", () => {firstDrag = true; mousePosRelativeToCenter = null;})

        this.svgComponent.call(dragHandler)
    }

    // Special behavior when being dragged e.g. activations snap to Layers
    public dragAction(d) {}

    public static showWireGuide(): void {
        windowProperties.wireGuide.style("display", null)
        windowProperties.wireGuideCircle.style("display", null)
        windowProperties.wireGuide.raise()
        windowProperties.wireGuideCircle.raise()
    }

    public static hideWireGuide(): void {
        windowProperties.wireGuide.style("display", "none")
        windowProperties.wireGuideCircle.style("display", "none")
    }

    public static moveWireGuideToMouse(): void {
        if (windowProperties.selectedElement != null && 
            windowProperties.selectedElement.wireGuidePresent && 
            windowProperties.selectedElement instanceof Draggable) {

            let sourceCenter = windowProperties.selectedElement.getPosition().add(windowProperties.selectedElement.center())
            // Catch the error when there the mouse does not yet have a relative position
            let endCoords;
            try {
                endCoords = d3.mouse(<any>d3.select("#svg").node())
            } catch (error) {
                endCoords = [0,0]
            }           

            windowProperties.wireGuide.attr('x1',sourceCenter.x)
                .attr('y1',sourceCenter.y)
                .attr('x2',endCoords[0])
                .attr('y2',endCoords[1])

            windowProperties.wireGuideCircle.attr("cx", sourceCenter.x)
                .attr("cy", sourceCenter.y)
        }
    }

    // Bring in front of the other UI elements
    public raise(){
        this.svgComponent.raise()
    }

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
        this.raise()
        this.svgComponent.selectAll("rect").style("stroke", "yellow").style("stroke-width", "2")
        if(this.wireGuidePresent) {
            Draggable.moveWireGuideToMouse()
            Draggable.showWireGuide();            
        }
    }

    public unselect() {
        if (windowProperties.selectedElement === this) {
            windowProperties.selectedElement = null
        }
        this.svgComponent.selectAll("rect").style("stroke", null).style("stroke-width", null)
        windowProperties.wireGuide.style("display", "none")
        if(this.wireGuidePresent) {
            Draggable.hideWireGuide();
        }
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