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

    draggedX = null; // Use these to let draggables return to user dragged position after cropping
    draggedY = null;

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
                                this.moveTimeout = setTimeout(() => {this.hoverText.style("display", ""); this.hoverText.style("visibility", "visible")}, 280);
                                this.hoverText.style("top", (d3.event.pageY - 40)+"px").style("left",(d3.event.pageX - 30)+"px") })
                            .on("mouseout", () => {
                                clearTimeout(this.moveTimeout)
                                this.hoverText.style("visibility", "hidden")
                            })
        this.makeDraggable()
        this.draggedX = defaultLocation.x
        this.draggedY = defaultLocation.y
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
                this.raise()
                firstDrag = false
            }

            this.draggedX = d3.event.x - mousePosRelativeToCenter.x;
            this.draggedY = d3.event.y - mousePosRelativeToCenter.y;

            this.setPosition(new Point(this.draggedX, this.draggedY))
            this.cropPosition()
            this.moveAction()
            // Dragging seems to force mousemove event to be ignored. Since we
            // use the mousemove event on the svg to move the wire guide, just do that
            // here unless we find a way to not ignore the mousemove event.
            windowProperties.wireGuide.moveToMouse()
        }

        let dragHandler = d3.drag().touchable(true).clickDistance(4)
            .on("drag", dragThings)
            .on("end", () => {firstDrag = true; mousePosRelativeToCenter = null;})

        this.svgComponent.call(dragHandler)
    }

    // Special behavior when being dragged e.g. activations snap to Layers
    public moveAction() {}

    // Bring in front of the other UI elements
    public raise(){
        this.svgComponent.raise()
    }

    public raiseGroup() {
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
            windowProperties.wireGuide.moveToMouse()
            windowProperties.wireGuide.show();
        }
    }

    public unselect() {
        if (windowProperties.selectedElement === this) {
            windowProperties.selectedElement = null
            windowProperties.wireGuide.hide();
        }
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

    protected static nodeBoundingBox(node: SVGGraphicsElement): {top: number, bottom: number, left: number, right: number} {
        let nodeBbox = node.getBBox()
        return {top: nodeBbox.y, bottom: nodeBbox.y+nodeBbox.height, left: nodeBbox.x, right: nodeBbox.x+nodeBbox.width}
    }

    public outerBoundingBox(): {top: number, bottom: number, left: number, right: number} {
        let bbox: {top, bottom, left, right} = Draggable.nodeBoundingBox(this.svgComponent.nodes()[0])

        for(let node of this.svgComponent.nodes().slice(1)) {
            let nodeBbox = Draggable.nodeBoundingBox(node)

            bbox.top = Math.min(nodeBbox.top, bbox.top)
            bbox.bottom = Math.max(nodeBbox.bottom, bbox.bottom)
            bbox.left = Math.min(nodeBbox.left, bbox.left)
            bbox.right = Math.max(nodeBbox.right, nodeBbox.right)
        }
        return bbox
    }


    getPosition(): Point {
		let transformation = this.svgComponent.attr('transform')
		let numArr = transformation.substring( transformation.indexOf('(') + 1 , transformation.indexOf(')') ).split(',').map(value => parseInt(value));
        return new Point(numArr[0], numArr[1])
    }

    public cropPosition() {
        let canvasBoundingBox = getSvgOriginalBoundingBox(document.getElementById("svg"))
        let componentBBox  = this.outerBoundingBox()

        let bottomBoundary = (canvasBoundingBox.height-componentBBox.bottom) - windowProperties.svgYOffset;

        this.setPosition(new Point( Math.min(Math.max(-componentBBox.left, this.draggedX), canvasBoundingBox.width-componentBBox.right),
                                    Math.min(Math.max(-componentBBox.top + windowProperties.svgYOffset, this.draggedY), bottomBoundary)
        ))
    }

    setPosition(position: Point) {
        this.svgComponent.attr('transform','translate('+position.x+','+position.y+')')
    }
}