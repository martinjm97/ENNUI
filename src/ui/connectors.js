function connect(input,output){

	if(input.layerType === 'dense' && output.layerType === 'conv2D'){return;}
	if(input === output){return;}

	output.input = input;
	let c = new Connector(input,output);
	input.connectors.push(c);
	output.inputs.push(input);
	output.connectors.push(c);
	input.outputs.push(output);
}

connectorData = {}

connectorData.inputdenseData = {
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
}

connectorData.inputconv2DData = {
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
}

connectorData.inputmaxPooling2DData = {
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
}


connectorData.densedenseData = {
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
}

connectorData.denseoutputData = {
	cross : [
	[5,-70,0,-60],
	[5,-70,0,-00],
	[5,-70,0, 60],
	[5,-40,0,-60],
	[5,-40,0,-00],
	[5,-40,0, 60],
	[5,-10,0,-60],
	[5,-10,0,-00],
	[5,-10,0, 60]]
}
connectorData.conv2DdenseData = {
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
}


connectorData.conv2Dconv2DData = {
	input : [
	[-20,-40,05,-40],
	[05,-40,05,-15],
	[05,-15,-20,-15],
	[-20,-15,-20,-40],
	],
	cross : [
	[-20,-40,-7,-27],
	[05,-40,-7,-27],
	[05,-15,-7,-27],
	[-20,-15,-7,-27],
	]
}

connectorData.conv2DmaxPooling2DData = {
	input : [
	[-20,-40,05,-40],
	[05,-40,05,-15],
	[05,-15,-20,-15],
	[-20,-15,-20,-40],
	],
	cross : [
	[-20,-40,-7,-27],
	[05,-40,-7,-27],
	[05,-15,-7,-27],
	[-20,-15,-7,-27],
	]
}

connectorData.maxPooling2DdenseData = {
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
}

connectorData.maxPooling2Dconv2DData = {
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
}

class Connector{
	constructor(input,output){

		this.input = input;
		this.output = output;
		this.update();
	}

	update(){
		var inputPosition = this.input.getPosition();
		var outputPosition = this.output.getPosition();
		if(this.svgComponent){this.svgComponent.remove();}
		this.svgComponent = svg.append('g');

		let endTypes = this.input.layerType + this.output.layerType + 'Data'
		console.log(endTypes)
		for(let data of connectorData[endTypes].cross || []){
			console.log(inputPosition,data)
			this.svgComponent.append('line')
			.attr('x1',inputPosition[0]+data[0])
			.attr('y1',inputPosition[1]+data[1])
			.attr('x2',outputPosition[0]+data[2])
			.attr('y2',outputPosition[1]+data[3])
			.style('stroke','black')
			.style('stroke-width',2);
		}
		for(let data of connectorData[endTypes].input || []){
			this.svgComponent.append('line')
			.attr('x1',inputPosition[0]+data[0])
			.attr('y1',inputPosition[1]+data[1])
			.attr('x2',inputPosition[0]+data[2])
			.attr('y2',inputPosition[1]+data[3])
			.style('stroke','black')
			.style('stroke-width',2);
		}

		// switch(this.input.layerType + '+' + this.output.layerType){
		// 	case 'dense+dense':
		// 	for(let data of densedenseData.cross){
		// 		this.svgComponent.append('line')
		// 		.attr('x1',inputPosition[0]+data[0])
		// 		.attr('y1',inputPosition[1]+data[1])
		// 		.attr('x2',outputPosition[0]+data[2])
		// 		.attr('y2',outputPosition[1]+data[3])
		// 		.style('stroke','black')
		// 		.style('stroke-width',2);
		// 	}
		// 	break;
		// 	case 'conv2D+dense':
		// 	for(let data of conv2DdenseData.cross){
		// 		this.svgComponent.append('line')
		// 		.attr('x1',inputPosition[0]+data[0])
		// 		.attr('y1',inputPosition[1]+data[1])
		// 		.attr('x2',outputPosition[0]+data[2])
		// 		.attr('y2',outputPosition[1]+data[3])
		// 		.style('stroke','black')
		// 		.style('stroke-width',2);
		// 	}
		// 	break;
		// 	case 'conv2D+conv2D':
		// 	for(let data of conv2Dconv2DData.input){
		// 		this.svgComponent.append('line')
		// 		.attr('x1',inputPosition[0]+data[0])
		// 		.attr('y1',inputPosition[1]+data[1])
		// 		.attr('x2',inputPosition[0]+data[2])
		// 		.attr('y2',inputPosition[1]+data[3])
		// 		.style('stroke','black')
		// 		.style('stroke-width',2);
		// 	}
		// 	for(let data of conv2Dconv2DData.cross){
		// 		this.svgComponent.append('line')
		// 		.attr('x1',inputPosition[0]+data[0])
		// 		.attr('y1',inputPosition[1]+data[1])
		// 		.attr('x2',outputPosition[0]+data[2])
		// 		.attr('y2',outputPosition[1]+data[3])
		// 		.style('stroke','black')
		// 		.style('stroke-width',2);
		// 	}
		// 	break;
		// 	default:
		// 	this.svgComponent.append('line')
		// 	.attr('x1',inputPosition[0])
		// 	.attr('y1',inputPosition[1])
		// 	.attr('x2',outputPosition[0])
		// 	.attr('y2',outputPosition[1])
		// 	.style('stroke','black')
		// 	.style('stroke-width',2);
		// }

	}

	remove(){
		this.svgComponent.remove();
	}

	moveToFront(){
		this.svgComponent.moveToFront();
	}
}

