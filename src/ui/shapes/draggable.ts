import {Shape, Point} from "./shape";

export abstract class Draggable extends Shape {
    static readonly snapRadius: number = 400;

    static readonly defaultLocation: Point = new Point(50,100);
    // let layerDefaults = {
// 	x:50,
// 	y:100,
// }

}