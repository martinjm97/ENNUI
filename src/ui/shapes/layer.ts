import { Draggable } from "./draggable";
import { Rectangle } from "./shape";

export abstract class Layer extends Draggable {
    pages: Array<Rectangle>;
    hole: Rectangle;

}

export class Conv2D extends Layer {

}

export class Dense extends Layer {

} 

export class MaxPooling2D extends Layer {

}


// let layerRectData = {
// 	conv2D : {
// 		page1 : [-54,-80,50,50,colors.layer.conv2D.page1],
// 		page2 : [-37,-60,50,50,colors.layer.conv2D.page2],
// 		page3 : [-20,-40,50,50,colors.layer.conv2D.page3],
// 		hole: [0,0,10,10,'#eee'],
// 	},
// 	dense : {
// 		main : [-8,-90,26,100,colors.layer.dense.main],
// 		hole: [0,0,10,10,'#eee'],
// 	},
// 	maxPooling2D : {
// 		page1 : [qwertx-54,qwerty-80,30,30,colors.layer.maxPooling2D.page1],
// 		page2 : [qwertx-37,qwerty-60,30,30,colors.layer.maxPooling2D.page2],
// 		page3 : [qwertx-20,qwerty-40,30,30,colors.layer.maxPooling2D.page3],
// 		hole: [0,0,10,10,'#eee'],
// 	},
// }