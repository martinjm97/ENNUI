d3.selection.prototype.moveToFront = function() {

	return this.each(function(){
		this.parentNode.appendChild(this);
	});

};

function width(){
	return svg.node().width.baseVal.value;
}

function height(){
	return svg.node().height.baseVal.value;
}

function mousePosition(){
	return d3.mouse(svg.node());
}