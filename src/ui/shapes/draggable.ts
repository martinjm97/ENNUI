import * as d3 from "d3";
import { getSvgOriginalBoundingBox } from "../utils";
import { windowProperties } from "../window";
import { Point } from "./shape";

export abstract class Draggable {

    protected static nodeBoundingBox(node: SVGGraphicsElement):
            {top: number, bottom: number, left: number, right: number} {
        const nodeBbox = node.getBBox();
        return {bottom: nodeBbox.y + nodeBbox.height,
                left: nodeBbox.x,
                right: nodeBbox.x + nodeBbox.width,
                top: nodeBbox.y};
    }

    public readonly wireGuidePresent: boolean = false;
    public draggedX: number = null; // Use these to let draggables return to user dragged position after cropping
    public draggedY: number = null;

    public svgComponent: d3.Selection<SVGGraphicsElement, {}, HTMLElement, any>;

    protected moveTimeout: any;
    protected hoverText: any = d3.select("body")
                                 .append("div")
                                 .style("position", "absolute")
                                 .style("font-weight", "bold")
                                 .style("padding", "6px")
                                 .style("background", "rgba(0, 0, 0, 0.8)")
                                 .style("color", "#eee")
                                 .style("border-radius", "2px")
                                 .style("display", "none")
                                 .style("font-family", "Helvetica")
                                 .style("user-select", "none")
                                 .text(this.getHoverText());

    constructor(defaultLocation: Point = new Point(50, 100)) {
        this.svgComponent = d3.select<SVGGraphicsElement, {}>("#svg")
                            .append<SVGGraphicsElement>("g")
                            .attr("transform", "translate(" + defaultLocation.x + "," + defaultLocation.y + ")")
                            .on("click", () => {
                                this.select();
                                window.clearTimeout(this.moveTimeout);
                                this.hoverText.style("visibility", "hidden");
                                })
                            .on("contextmenu", () => {
                                window.clearTimeout(this.moveTimeout);
                                this.hoverText.style("visibility", "hidden");
                                })
                            .on("mousemove", () => {
                                this.hoverText.style("visibility", "hidden");
                                clearTimeout(this.moveTimeout);
                                this.moveTimeout = setTimeout(() => {
                                    this.hoverText.style("display", "");
                                    this.hoverText.style("visibility", "visible");
                                }, 280);
                                this.hoverText.style("top", (d3.event.pageY - 40) + "px")
                                              .style("left", (d3.event.pageX - 30) + "px");
                            })
                            .on("mouseout", () => {
                                clearTimeout(this.moveTimeout);
                                this.hoverText.style("visibility", "hidden");
                            });
        this.makeDraggable();
        this.draggedX = defaultLocation.x;
        this.draggedY = defaultLocation.y;
    }

    public makeDraggable(): void {
        let firstDrag = true;
        // Fix the offset from the mouse by calculating the distance from the mouse
        // to the center of the object upon mousedown
        let mousePosRelativeToCenter: Point;
        this.svgComponent.on("mousedown", function(): void {
            const coords = d3.mouse(this);
            mousePosRelativeToCenter = new Point(coords[0], coords[1]);
        });

        const dragThings = () => {
            clearTimeout(this.moveTimeout);
            this.hoverText.style("visibility", "hidden");
            if (firstDrag) {
                // Since touch drags don't activate the mousedown event,
                // catch touch drags here, even though there might be a slight offset
                if (mousePosRelativeToCenter == null) {
                    const coords = d3.mouse(this.svgComponent.node());
                    mousePosRelativeToCenter = new Point(coords[0], coords[1]);
                }
                // Perform on drag start here instead of using on("start", ...)
                // since d3 calls drag starts weirdly (on mousedown,
                // instead of after actually dragging a little bit)
                this.raise();
                firstDrag = false;
            }

            this.draggedX = d3.event.x - mousePosRelativeToCenter.x;
            this.draggedY = d3.event.y - mousePosRelativeToCenter.y;

            this.setPosition(new Point(this.draggedX, this.draggedY));
            this.cropPosition();
            this.moveAction();
            // Dragging seems to force mousemove event to be ignored. Since we
            // use the mousemove event on the svg to move the wire guide, just do that
            // here unless we find a way to not ignore the mousemove event.
            windowProperties.wireGuide.moveToMouse();
        };

        const dragHandler = d3.drag().touchable(true).clickDistance(4)
            .on("drag", dragThings)
            .on("end", () => {firstDrag = true; mousePosRelativeToCenter = null; });

        this.svgComponent.call(dragHandler);
    }

    // Special behavior when being dragged e.g. activations snap to Layers
    public moveAction(): void { return; }

    // Bring in front of the other UI elements
    public raise(): void {
        this.svgComponent.raise();
    }

    public raiseGroup(): void {
        this.svgComponent.raise();
    }

    // The text to display when hovering over an object
    public getHoverText(): string { return ""; }

    public select(): void {
        if (windowProperties.selectedElement != null) {
            if (windowProperties.selectedElement === this) {
                return;
            }
            windowProperties.selectedElement.unselect();
        }
        windowProperties.selectedElement = this;
        this.raise();
        this.svgComponent.selectAll("rect").style("stroke", "yellow").style("stroke-width", "2");
        if (this.wireGuidePresent) {
            windowProperties.wireGuide.moveToMouse();
            windowProperties.wireGuide.show();
        }
    }

    public unselect(): void {
        if (windowProperties.selectedElement === this) {
            windowProperties.selectedElement = null;
            windowProperties.wireGuide.hide();
        }
        this.svgComponent.selectAll("rect").style("stroke", null).style("stroke-width", null);
    }

    public delete(): void {
        this.unselect();
        this.svgComponent.remove();
        this.hoverText.remove();
    }

    public center(): Point {
        const bbox = this.svgComponent.node().getBBox();
        return new Point(bbox.x + bbox.width / 2, bbox.y + bbox.height / 2);
    }

    public outerBoundingBox(): {top: number, bottom: number, left: number, right: number} {
        const bbox = Draggable.nodeBoundingBox(this.svgComponent.nodes()[0]);

        for (const node of this.svgComponent.nodes().slice(1)) {
            const nodeBbox = Draggable.nodeBoundingBox(node);

            bbox.top = Math.min(nodeBbox.top, bbox.top);
            bbox.bottom = Math.max(nodeBbox.bottom, bbox.bottom);
            bbox.left = Math.min(nodeBbox.left, bbox.left);
            bbox.right = Math.max(nodeBbox.right, nodeBbox.right);
        }
        return bbox;
    }

    public getPosition(): Point {
        const transformation = this.svgComponent.attr("transform");
        const numArr = transformation.substring(
                transformation.indexOf("(") + 1 , transformation.indexOf(")") )
            .split(",").map((value) => Number(value));
        return new Point(numArr[0], numArr[1]);
    }

    public cropPosition(): void {
        const canvasBoundingBox = getSvgOriginalBoundingBox( document.getElementById("svg") as any as SVGSVGElement);
        const componentBBox  = this.outerBoundingBox();

        const bottomBoundary = (canvasBoundingBox.height - componentBBox.bottom) - windowProperties.svgYOffset;

        this.setPosition(new Point( Math.min(
                                        Math.max(-componentBBox.left, this.draggedX),
                                        canvasBoundingBox.width - componentBBox.right),
                                    Math.min(
                                        Math.max(-componentBBox.top + windowProperties.svgYOffset, this.draggedY),
                                        bottomBoundary)));
    }

    public setPosition(position: Point): void {
        this.svgComponent.attr("transform", "translate(" + position.x + "," + position.y + ")");
    }
}
