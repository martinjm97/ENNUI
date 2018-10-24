			// <!--<div class = 'parambox'>
			// 	<div class = 'paramline'>
			// 		<div class = 'paramname'>units:</div>
			// 		<div class = 'paramvalue'>10</div>
			// 	</div>
			// 	<div class = 'paramline'>
			// 		<div class = 'paramname'>bla:</div>
			// 		<input class = 'paramvalue'>8</input>
			// 	</div>
			// </div>-->
function createParamBox(type){
	let box = boxmaker['create'+titleCase(type)+'Parambox']();
	box.style.visibility = 'hidden'
	box.style.position = 'absolute'	
	return box;
}

boxmaker = {};

boxmaker.createOutputParambox = function(){
	let box = document.createElement('div')
	box.className = 'parambox'
	let line = document.createElement('div')
	line.className = 'paramline'
	let name = document.createElement('div')
	name.className = 'paramname'
	name.innerHTML = 'Units:'
	name.setAttribute('data-name','units')
	let value = document.createElement('input')
	value.className = 'paramvalue'
	value.value = '4'
	line.appendChild(name);
	line.appendChild(value);
	box.append(line);
	paramtruck.appendChild(box);

	value.addEventListener('change',function(e){
		try{
			svgData.output.updateNumberOfUnits(parseInt(e.target.value));
		}catch(e){}
	},false);

	return box;
};

boxmaker.createConv2DParambox = function(){
	let box = document.createElement('div')
	box.className = 'parambox'

	let line1 = document.createElement('div')
	line1.className = 'paramline'

	let name1 = document.createElement('div')
	name1.className = 'paramname'
	name1.innerHTML = 'Filters:'
	name1.setAttribute('data-name','filters')

	let value1 = document.createElement('input')
	value1.className = 'paramvalue'
	value1.value = '64'

	line1.appendChild(name1);
	line1.appendChild(value1);

	box.append(line1);

	let line2 = document.createElement('div')
	line2.className = 'paramline'
	let name2 = document.createElement('div')
	name2.className = 'paramname'
	name2.innerHTML = 'Kernel size:'
	name2.setAttribute('data-name','kernel_size')
	let value2 = document.createElement('input')
	value2.className = 'paramvalue'
	value2.value = '(5, 5)'
	line2.appendChild(name2);
	line2.appendChild(value2);
	box.append(line2);

	let line3 = document.createElement('div')
	line3.className = 'paramline'
	let name3 = document.createElement('div')
	name3.className = 'paramname'
	name3.innerHTML = 'Stride:'
	name3.setAttribute('data-name','strides')
	let value3 = document.createElement('input')
	value3.className = 'paramvalue'
	value3.value = '(2, 2)'
	line3.appendChild(name3);
	line3.appendChild(value3);
	box.append(line3);

	paramtruck.appendChild(box);

	return box;
};

boxmaker.createDenseParambox = function(){
	let box = document.createElement('div')
	box.className = 'parambox'
	let line = document.createElement('div')
	line.className = 'paramline'
	let name = document.createElement('div')
	name.className = 'paramname'
	name.innerHTML = 'Units:'
	name.setAttribute('data-name','units')
	let value = document.createElement('input')
	value.className = 'paramvalue'
	value.value = '64'
	line.appendChild(name);
	line.appendChild(value);
	box.append(line);
	paramtruck.appendChild(box);
	return box;
};

boxmaker.createMaxPooling2DParambox = function(){
	let box = document.createElement('div')
	box.className = 'parambox'
	let line = document.createElement('div')
	line.className = 'paramline'
	let name = document.createElement('div')
	name.className = 'paramname'
	name.innerHTML = 'Pool size:'
	name.setAttribute('data-name','pool_size')
	let value = document.createElement('input')
	value.className = 'paramvalue'
	value.value = '(2,2)';
	line.appendChild(name);
	line.appendChild(value);
	box.append(line);
	paramtruck.appendChild(box);
	return box;
};