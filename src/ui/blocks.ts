function dist2(p1,p2){
	return (p1[0]-p2[0])*(p1[0]-p2[0]) + (p1[1]-p2[1])*(p1[1]-p2[1]);
}

function add(p1,p2){
	return [p1[0]+p2[0],p1[1]+p2[1]];
}

function minus(p1,p2){
	return [p1[0]-p2[0],p1[1]-p2[1]];
}

let snapRadius = 400;

let layerDefaults = {
	x:50,
	y:100,
}

let qwertx = 10
let qwerty = 20

let layerRectData = {
	conv2D : {
		page1 : [-54,-80,50,50,colors.layer.conv2D.page1],
		page2 : [-37,-60,50,50,colors.layer.conv2D.page2],
		page3 : [-20,-40,50,50,colors.layer.conv2D.page3],
		hole: [0,0,10,10,'#eee'],
	},
	dense : {
		main : [-8,-90,26,100,colors.layer.dense.main],
		hole: [0,0,10,10,'#eee'],
	},
	maxPooling2D : {
		page1 : [qwertx-54,qwerty-80,30,30,colors.layer.maxPooling2D.page1],
		page2 : [qwertx-37,qwerty-60,30,30,colors.layer.maxPooling2D.page2],
		page3 : [qwertx-20,qwerty-40,30,30,colors.layer.maxPooling2D.page3],
		hole: [0,0,10,10,'#eee'],
	},
}

let layerPortData = {
	activation : [0,0]
}

let wireDefaults = {
	x:200,
	y:200
}

let activationDefaults = {
	x:25,
	y:25,
}

let activationRectData = {
	relu: {
		middleTooth : [0,0,10,10,colors.activation.relu],
		main : [-8,10,26,10,colors.activation.relu],
	},
	softmax: {
		middleTooth : [0,0,10,10,colors.activation.softmax],
		main : [-8,10,26,10,colors.activation.softmax],
	},
	sigmoid: {
		middleTooth : [0,0,10,10,colors.activation.sigmoid],
		main : [-8,10,26,10,colors.activation.sigmoid],
	},
}

let activationPortData = {
	//male : [{type : activation, position: [-5,-40]}]
	activation : [0,0]
}

let wireRectData = {
	'splitter' : {
			inData : [0, -10, 30, 20],
			splitData : [30, -100, 20, 200],
			out1Data : [50,80,30,20],
			out2Data : [50,-100,30,20]
		},
}

/**
*
* LOGIC COMMON TO ALL BLOCKS
*
**/

function select(item){
	// console.log(item.htmlComponent)
	if(item.htmlComponent){
		// console.log(item.htmlComponent)
		item.htmlComponent.style.visibility = 'visible';
		item.htmlComponent.style.position = 'relative';
		defaultparambox.style.visibility = 'hidden';
		defaultparambox.style.position = 'absolute';
	}

	window.selectedElement = item;
	item.moveToFront();
	item.svgComponent.style('stroke','yellow')
}

function unselect(item){
	if(item.htmlComponent){
		item.htmlComponent.style.visibility = 'hidden';
		item.htmlComponent.style.position = 'absolute';
		defaultparambox.style.visibility = 'visible';
		defaultparambox.style.position = 'relative';
	}

	window.selectedElement = false;
	window.draggedElement = false;

	item.svgComponent.style('stroke','none');
}

function bindToMouse(item){
	window.draggedElement = item;
}

function unbindFromMouse(item){
	window.draggedElement = false;
}

window.selectState = 'default'

function startWiring(){
	window.selectState = 'wiring+break';
	console.log(window.selectState);
}
function startAdding(){
	window.selectState = 'default';
	console.log(window.selectState);
}

function makeDraggable(item){
	console.log('mkd',item)

	item.svgComponent.on('mousedown', function(){

		//if a different element is selected, return
		if(window.selectedElement && item !== window.selectedElement){return;}

		switch(window.selectState){
			case 'default' :
			window.selectState = 'selected+tracking';
			console.log(window.selectState);

			select(item);
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

/**
*
* BLOCK CLASS DEFINITIONS
*
**/

class Layer {
	layerType: any;
	svgComponent: any;
	ports: any;
	rectangles: any;
	connectors: any;
	inputs: any;
	outputs: any;
	htmlComponent: any;
	activation: any;
	index: any;
	id: any;
	activationType: any;
	input: any;
	svgData: any;
	
	constructor(options) {
		options = {...layerDefaults, ...options}
		this.layerType = options.layerType;
		let rectData = layerRectData[this.layerType];
		let portData = layerPortData;
		this.svgComponent = svg.append('g');
		this.ports = {};
		this.rectangles = {};
		for(let key in rectData){
			this.rectangles[key] = this.svgComponent.append('rect').attr('x',rectData[key][0]).attr('y',rectData[key][1]).attr('width',rectData[key][2]).attr('height',rectData[key][3]).style('fill',rectData[key][4]);
		}
		for(let key in portData){
			this.ports[key] = portData[key];
		}
		this.svgComponent.attr('transform','translate('+options.x+','+options.y+')');
		makeDraggable(this);

		this.connectors = [];
		this.inputs = [];
		this.outputs = [];

		this.htmlComponent = createParamBox(this.layerType);

	}
	getPosition() {
		let transformation = this.svgComponent.attr('transform')
		return transformation.substring( transformation.indexOf('(') + 1 , transformation.indexOf(')') ).split(',').map(value => parseInt(value));
	}
	setPosition(x,y) {
		for(let connector of this.connectors){
			connector.update();
		}
		try{
			this.activation.setPosition(x,y);
		} catch(e){}
		return this.svgComponent.attr('transform','translate('+x+', '+y+')')
	}

	getPython(){
		return 'x' + this.index + ' = '+this.layerType[0].toUpperCase()+this.layerType.substring(1)+'(activation = '+(this.activationType||"default")+')(x'+ (this.input || {index : '_in'}).index +')'
	}

	getJSON(){
		let output = {
			id: this.id,
			layer_name : titleCase(this.layerType),
			children_ids : this.outputs.map(layer => layer.id),
			parent_ids : this.inputs.map(layer => layer.id),
			params: {
				activation: null
			},
			// parent_flattenQ : this.inputs.map((layer => (this.layerType === 'dense' && layer.layerType !== 'dense')).bind(this))
		};

		// output.params = {};
		if(this.activation){
			output.params.activation = this.activation.activationType;
		}

		for(let line of this.htmlComponent.children){
			let name = line.children[0].getAttribute('data-name');
			let value = parseforpython(line.children[1].value);
			output.params[name] = value;
		}

		return output;
	}

	remove(){
		this.svgComponent.remove();
		this.htmlComponent.parentElement.removeChild(this.htmlComponent);
		for(let connector of this.connectors){
			connector.remove();
		}
		let i = svgData.layer.indexOf(this);
		delete svgData.layer[i];
		for(let output of this.outputs){
			let i = output.inputs.indexOf(this);
			delete output.inputs[i];
		}
		for(let input of this.inputs){
			let i = input.outputs.indexOf(this);
			delete input.outputs[i];
		}

	}

	moveToFront(){
		this.svgComponent.moveToFront();
		try{
			this.activation.svgComponent.moveToFront();
		}
		catch(e){}
		for(let connector of this.connectors){
			connector.moveToFront();
		}
	}

	snap(){}
}

class Activation {
	constructor(options) {
		options = {...activationDefaults, ...options}
		this.activationType = options.activationType;
		let rectData = activationRectData[this.activationType];
		let portData = activationPortData;
		this.svgComponent = svg.append('g');
		this.ports = {};
		this.rectangles = {};
		for(let key in rectData){
			this.rectangles[key] = this.svgComponent.append('rect').attr('x',rectData[key][0]).attr('y',rectData[key][1]).attr('width',rectData[key][2]).attr('height',rectData[key][3]).style('fill',rectData[key][4]);
		}
		for(let key in portData){
			this.ports[key] = portData[key];
		}
		this.svgComponent.attr('transform','translate('+options.x+', '+options.y+')');
		makeDraggable(this);
	}
	getPosition() {
		let transformation = this.svgComponent.attr('transform')
		return transformation.substring( transformation.indexOf('(') + 1 , transformation.indexOf(')') ).split(',').map(value => parseInt(value));
	}
	setPosition(x,y) {
		return this.svgComponent.attr('transform','translate('+x+', '+y+')')
	}
	snap() {
		let ap = this.getPosition()
		let app = this.ports.activation;
		let as = add(ap,app);

		for(let layer of svgData.layer){
			let lp = layer.getPosition()
			let lpp = layer.ports.activation;
			let ls = add(lp,lpp);
			if(dist2(ls , as) < snapRadius){
				let delta = minus(ls,as);
				this.setPosition(...add(ap,delta));
				layer.activation = this;

				return;
			} else {
				if(layer.activation === this){
					layer.activation = null;
				}
			}
		}
	}

	moveToFront(){
		this.svgComponent.moveToFront();
	}

	remove(){
		this.svgComponent.remove();
		let i = svgData.activation.indexOf(this);
		svgData.activation.pop(i);
	}
}

class Wire {
	constructor(options) {
		options = {...wireDefaults, ...options}
		let rectData = wireRectData[options.wireType];
		this.svgComponent = svg.append('g');
		this.rectangles = {};
		for(let key in rectData){
			this.rectangles[key] = this.svgComponent.append('rect').attr('x',rectData[key][0]).attr('y',rectData[key][1]).attr('width',rectData[key][2]).attr('height',rectData[key][3]).style('fill','black');
		}
		this.svgComponent.attr('transform','translate('+options.x+', '+options.y+') scale(1.4)');
		makeDraggable(this);
	}
	getPosition() {
		let transformation = this.svgComponent.attr('transform')
		return transformation.substring( transformation.indexOf('(') + 1 , transformation.indexOf(')') ).split(',').map(value => parseInt(value));
	}
	setPosition(x,y) {
		return this.svgComponent.attr('transform','translate('+x+', '+y+') scale(1.4)')
	}
}