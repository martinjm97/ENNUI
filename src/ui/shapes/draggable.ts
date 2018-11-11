import {Shape, Point} from "./shape";
import {window} from "../window";
import { Layer } from "./layer";
import * as d3 from "d3";

// TODO: A TON
export abstract class Draggable extends Shape {
    static readonly snapRadius: number = 400;
    static readonly defaultLocation: Point = new Point(50,100);
    htmlComponent: any;
    svgComponent: any;
    
    // TODO: figure out how to set: window.selectState = 'default';

    public static moveToFront(item: Layer){
		item.svgComponent.moveToFront();
		if (!(item.activation === null)) {
			item.activation.svgComponent.moveToFront();
		}
	}

    private static select(item: Draggable): void {
        if(item.htmlComponent){
            item.htmlComponent.style.visibility = 'visible';
            item.htmlComponent.style.position = 'relative';
            window.defaultparambox.style.visibility = 'hidden';
            window.defaultparambox.style.position = 'absolute';
        }

        window.selectedElement = item;
        item.svgComponent.moveToFront();
        item.svgComponent.style('stroke','yellow')
    }

    private static unselect(item: Draggable): void {
        if(item.htmlComponent){
            item.htmlComponent.style.visibility = 'hidden';
            item.htmlComponent.style.position = 'absolute';
            window.defaultparambox.style.visibility = 'visible';
            window.defaultparambox.style.position = 'relative';
        }

        window.selectedElement = false;
        window.draggedElement = false;

        item.svgComponent.style('stroke','none');
    }

    private static bindToMouse(item: Draggable): void{
        window.draggedElement = item;
    }

    private static unbindFromMouse(item: Draggable): void{
        window.draggedElement = false;
    }

    private static startWiring(){
        window.selectState = 'wiring+break';
        console.log(window.selectState);
    }

    private static startAdding(){
        window.selectState = 'default';
        console.log(window.selectState);
    }

    // private static mousePosition(){
    //     return d3.mouse(svg.node());
    // }

    public makeDraggable(){
        console.log("I eat thousands of babies")
        var dragHandler = d3.drag().on("drag", function (d: any) {
            console.log("I eat thousands of babies")
            d3.select(this)
                .attr("x", d.x = d3.event.x)
                .attr("y", d.y = d3.event.y)
        })
        dragHandler(this.svgComponent)
    }
    // makeDraggable(item: Draggable){

    //     item.svgComponent.on('mousedown', function(){

    //         //if a different element is selected, return
    //         if(window.selectedElement && item !== window.selectedElement){return;}

    //         switch(window.selectState){
    //             case 'default' :
    //             window.selectState = 'selected+tracking';
    //             console.log(window.selectState);

    //             Draggable.select(item);
    //             Draggable.bindToMouse(item);
    //             break;
    //             case 'selected+nontracking' :
    //             window.selectState = 'abouttounselect+tracking';
    //             console.log(window.selectState);
    //             Draggable.bindToMouse(item);
    //             break;
    //         }

    //         let mouse = Draggable.mousePosition();
    //         // let position = item.getPosition();
            
    //         window.xClickOffset = 100 - mouse[0];
    //         window.yClickOffset = 100 - mouse[1];

    //     });

    //     item.svgComponent.on('mouseup', function(){

    //         //if a different element is selected, return
    //         if(window.selectedElement && item !== window.selectedElement){return;}
    //         console.log('mu',window.selectState)
    //         switch(window.selectState){
    //             case 'selected+tracking' :
    //             window.selectState = 'selected+nontracking';
    //             console.log(window.selectState);

    //             Draggable.unbindFromMouse(item);
    //             break;
    //             case 'abouttounselect+tracking':
    //             window.selectState = 'default';
    //             console.log(window.selectState);
    //             Draggable.unselect(item);
    //             Draggable.unbindFromMouse(item);
    //             item.snap();
    //             break;
    //             case 'wiring+wiring':
    //             window.selectState = 'wiring+break'
    //             console.log(window.selectState);
    //             // Draggable.connect(window.wireInputElement,item);
    //             window.wireInputElement = false;
    //             break;
    //             case 'wiring+break':
    //             window.selectState = 'wiring+wiring'
    //             console.log(window.selectState);
    //             window.wireInputElement = item;
    //             break;
    //         }
    //     });
    // }   
}