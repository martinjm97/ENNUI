function download(filename, text) {
  let element = document.createElement('a');
  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
  element.setAttribute('download', filename);
  element.style.display = 'none';
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
}

function loadjs(fn)
{
  var head= document.getElementsByTagName('head')[0];
  var script= document.createElement('script');
  script.src= fn;
  head.appendChild(script);
}

function loadTrainingInfo(){
  try{
    loadjs('python_output/training_output.js');
  } catch(e){
    tims.children[1].value = 'Inactive'
  }
  setTimeout(function(){
    try{
      if(Object.keys(q).length === 0){
        for(let item in ti){
          ti[item].children[1].value = 'N/A'
        }
        tims.children[1].value = 'Inactive'
      } else{
        tims.children[1].value = 'Training'
        for(let item in q){
          if(item !== 'status'){
            ti[item].children[1].value = q[item].toFixed(4);
          } else {
            tims.children[1].value = q[item];
          }
        }
      }
    } catch(e){
      for(let item in ti){
        ti[item].children[1].value = 'N/A'
      }
      tims.children[1].value = 'Inactive'
    }
  },1000);
}


function continuouslyLoadTrainingInfo(){
  loadTrainingInfo();
  setTimeout(continuouslyLoadTrainingInfo,1500);
}

// function loadCoolFilter(filter){
//   console.log('f',filter)
//   dx = 197/filter.length;
//   dy = 197/filter[0].length;

//   // console.log(filter.length,filter[0].length)

//   // for(let i = 0; i < filter.length; i++){
//   //   for(let j = 0; j < filter[0].length; j++){
//       thecoolestfilter.append('g').append('rect')
//       .attr('x',0)
//       .attr('y',0)
//       .attr('width',10)
//       .attr('height',10)
//       .style('fill','blue');
//   //   }
//   // }
// }
// setTimeout(
// function(){
// loadCoolFilter([
//   [1,0,1],
//   [1,1,1],
//   [1,0,1]
//   ])},1000)