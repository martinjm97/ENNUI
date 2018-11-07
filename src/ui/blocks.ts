



// let wireRectData = {
// 	'splitter' : {
// 			inData : [0, -10, 30, 20],
// 			splitData : [30, -100, 20, 200],
// 			out1Data : [50,80,30,20],
// 			out2Data : [50,-100,30,20]
// 		},
// }
















// /**
// *
// * LOGIC COMMON TO ALL BLOCKS
// *
// **/



// }

// /**
// *
// * BLOCK CLASS DEFINITIONS
// *
// **/

// class Layer {
// 	input: any;
// 	svgData: any;
	
// 	constructor(options) {
// 		options = {...layerDefaults, ...options}
// 		this.layerType = options.layerType;
// 		let rectData = layerRectData[this.layerType];
// 		let portData = layerPortData;
// 		this.svgComponent = svg.append('g');
// 		this.ports = {};
// 		this.rectangles = {};
// 		for(let key in rectData){
// 			this.rectangles[key] = this.svgComponent.append('rect').attr('x',rectData[key][0]).attr('y',rectData[key][1]).attr('width',rectData[key][2]).attr('height',rectData[key][3]).style('fill',rectData[key][4]);
// 		}
// 		for(let key in portData){
// 			this.ports[key] = portData[key];
// 		}
// 		this.svgComponent.attr('transform','translate('+options.x+','+options.y+')');
// 		makeDraggable(this);

// 		this.connectors = [];
// 		this.inputs = [];
// 		this.outputs = [];

// 		this.htmlComponent = createParamBox(this.layerType);

// 	}
// 	getPosition() {
// 		let transformation = this.svgComponent.attr('transform')
// 		return transformation.substring( transformation.indexOf('(') + 1 , transformation.indexOf(')') ).split(',').map(value => parseInt(value));
// 	}
// 	setPosition(x,y) {
// 		for(let connector of this.connectors){
// 			connector.update();
// 		}
// 		try{
// 			this.activation.setPosition(x,y);
// 		} catch(e){}
// 		return this.svgComponent.attr('transform','translate('+x+', '+y+')')
// 	}


// 	getJSON(){
// 		let output = {
// 			id: this.id,
// 			layer_name : titleCase(this.layerType),
// 			children_ids : this.outputs.map(layer => layer.id),
// 			parent_ids : this.inputs.map(layer => layer.id),
// 			params: {
// 				activation: null
// 			},
// 			// parent_flattenQ : this.inputs.map((layer => (this.layerType === 'dense' && layer.layerType !== 'dense')).bind(this))
// 		};

// 		// output.params = {};
// 		if(this.activation){
// 			output.params.activation = this.activation.activationType;
// 		}

// 		for(let line of this.htmlComponent.children){
// 			let name = line.children[0].getAttribute('data-name');
// 			let value = parseforpython(line.children[1].value);
// 			output.params[name] = value;
// 		}

// 		return output;
// 	}

// 	remove(){
// 		this.svgComponent.remove();
// 		this.htmlComponent.parentElement.removeChild(this.htmlComponent);
// 		for(let connector of this.connectors){
// 			connector.remove();
// 		}
// 		let i = svgData.layer.indexOf(this);
// 		delete svgData.layer[i];
// 		for(let output of this.outputs){
// 			let i = output.inputs.indexOf(this);
// 			delete output.inputs[i];
// 		}
// 		for(let input of this.inputs){
// 			let i = input.outputs.indexOf(this);
// 			delete input.outputs[i];
// 		}

// 	}

// 	moveToFront(){
// 		this.svgComponent.moveToFront();
// 		try{
// 			this.activation.svgComponent.moveToFront();
// 		}
// 		catch(e){}
// 		for(let connector of this.connectors){
// 			connector.moveToFront();
// 		}
// 	}

// 	snap(){}
// }

// class Activation {
// 	constructor(options) {
// 		options = {...activationDefaults, ...options}
// 		this.activationType = options.activationType;
// 		let rectData = activationRectData[this.activationType];
// 		let portData = activationPortData;
// 		this.svgComponent = svg.append('g');
// 		this.ports = {};
// 		this.rectangles = {};
// 		for(let key in rectData){
// 			this.rectangles[key] = this.svgComponent.append('rect').attr('x',rectData[key][0]).attr('y',rectData[key][1]).attr('width',rectData[key][2]).attr('height',rectData[key][3]).style('fill',rectData[key][4]);
// 		}
// 		for(let key in portData){
// 			this.ports[key] = portData[key];
// 		}
// 		this.svgComponent.attr('transform','translate('+options.x+', '+options.y+')');
// 		makeDraggable(this);
// 	}
// 	getPosition() {
// 		let transformation = this.svgComponent.attr('transform')
// 		return transformation.substring( transformation.indexOf('(') + 1 , transformation.indexOf(')') ).split(',').map(value => parseInt(value));
// 	}
// 	setPosition(x,y) {
// 		return this.svgComponent.attr('transform','translate('+x+', '+y+')')
// 	}
// 	snap() {
// 		let ap = this.getPosition()
// 		let app = this.ports.activation;
// 		let as = add(ap,app);

// 		for(let layer of svgData.layer){
// 			let lp = layer.getPosition()
// 			let lpp = layer.ports.activation;
// 			let ls = add(lp,lpp);
// 			if(dist2(ls , as) < snapRadius){
// 				let delta = minus(ls,as);
// 				this.setPosition(...add(ap,delta));
// 				layer.activation = this;

// 				return;
// 			} else {
// 				if(layer.activation === this){
// 					layer.activation = null;
// 				}
// 			}
// 		}
// 	}

// 	moveToFront(){
// 		this.svgComponent.moveToFront();
// 	}

// 	remove(){
// 		this.svgComponent.remove();
// 		let i = svgData.activation.indexOf(this);
// 		svgData.activation.pop(i);
// 	}
// }

// class Wire {
// 	constructor(options) {
// 		options = {...wireDefaults, ...options}
// 		let rectData = wireRectData[options.wireType];
// 		this.svgComponent = svg.append('g');
// 		this.rectangles = {};
// 		for(let key in rectData){
// 			this.rectangles[key] = this.svgComponent.append('rect').attr('x',rectData[key][0]).attr('y',rectData[key][1]).attr('width',rectData[key][2]).attr('height',rectData[key][3]).style('fill','black');
// 		}
// 		this.svgComponent.attr('transform','translate('+options.x+', '+options.y+') scale(1.4)');
// 		makeDraggable(this);
// 	}
// 	getPosition() {
// 		let transformation = this.svgComponent.attr('transform')
// 		return transformation.substring( transformation.indexOf('(') + 1 , transformation.indexOf(')') ).split(',').map(value => parseInt(value));
// 	}
// 	setPosition(x,y) {
// 		return this.svgComponent.attr('transform','translate('+x+', '+y+') scale(1.4)')
// 	}
// }