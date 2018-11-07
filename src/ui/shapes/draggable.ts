import {Shape, Point} from "./shape";
import {window} from "../window";
import { Layer } from "./layer";

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
		for(let connector of item.connectors){
			connector.moveToFront();
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
        item.moveToFront();
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

    makeDraggable(item){

        item.svgComponent.on('mousedown', function(){

            //if a different element is selected, return
            if(window.selectedElement && item !== window.selectedElement){return;}

            switch(window.selectState){
                case 'default' :
                window.selectState = 'selected+tracking';
                console.log(window.selectState);

                Draggable.select(item);
                bindToMouse(item);
                break;
                case 'selected+nontracking' :
                window.selectState = 'abouttounselect+tracking';
                console.log(window.selectState);
                bindToMouse(item);
                break;
            }

            let mouse = mousePosition();
            let position = item.getPosition();

            window.xClickOffset = parseInt(position[0] - mouse[0]);
            window.yClickOffset = parseInt(position[1] - mouse[1]);

        });

        item.svgComponent.on('mouseup', function(){

            //if a different element is selected, return
            if(window.selectedElement && item !== window.selectedElement){return;}
            console.log('mu',window.selectState)
            switch(window.selectState){
                case 'selected+tracking' :
                window.selectState = 'selected+nontracking';
                console.log(window.selectState);

                unbindFromMouse(item);
                break;
                case 'abouttounselect+tracking':
                window.selectState = 'default';
                console.log(window.selectState);
                unselect(item);
                unbindFromMouse(item);
                item.snap();
                break;
                case 'wiring+wiring':
                window.selectState = 'wiring+break'
                console.log(window.selectState);
                connect(window.wireInputElement,item);
                window.wireInputElement = false;
                break;
                case 'wiring+break':
                window.selectState = 'wiring+wiring'
                console.log(window.selectState);
                window.wireInputElement = item;
                break;
            }
        });
    }   
}