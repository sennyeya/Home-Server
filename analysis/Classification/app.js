const tf = require('@tensorflow/tfjs-node-gpu');

const fs = require('fs')

const folder = "F:/New folder";
let conversionFolder = "F:/Conversions/"

let classificationPaths = fs.readdirSync(conversionFolder).map(e=>{
    let files = e;
    if(fs.lstatSync(`${conversionFolder}/${e}`).isDirectory()){
        files = fs.readdirSync(`${conversionFolder}/${e}`)
    }
    return files.filter(file=>file.substring(file.lastIndexOf(".")+1)==="json").map(file=>`${conversionFolder}/${e}/${file}`);
}).reduce((p, c)=>p.concat(c));

let classifications = []
for(let file of classificationPaths){
    classifications = classifications.concat(...JSON.parse(fs.readFileSync(file)).shapes)
}

function createModel(){
    const model = tf.sequential();

    model.add(tf.layers.dense({inputShape:[1], units:1, useBias:true}));

    model.add(tf.layers.dense({units:1, useBias:true}))

    return model;
}

/**
 * Convert the input data to tensors that we can use for machine 
 * learning. We will also do the important best practices of _shuffling_
 * the data and _normalizing_ the data
 * MPG on the y-axis.
 */
function convertToTensor(data) {
    // Wrapping these calculations in a tidy will dispose any 
    // intermediate tensors.
    
    return tf.tidy(() => {
      // Step 1. Shuffle the data    
      tf.util.shuffle(data);
  
      // Step 2. Convert data to Tensor
      const inputs = data.map(d => d.points)
      const labels = data.map(d => d.label);

      console.log(inputs)
  
      const inputTensor = tf.tensor3d(inputs);
      const labelTensor = tf.tensor2d(labels, [labels.length, 1]);
  
      //Step 3. Normalize the data to the range 0 - 1 using min-max scaling
      const inputMax = inputTensor.max();
      const inputMin = inputTensor.min();  
      const labelMax = labelTensor.max();
      const labelMin = labelTensor.min();
  
      const normalizedInputs = inputTensor.sub(inputMin).div(inputMax.sub(inputMin));
      const normalizedLabels = labelTensor.sub(labelMin).div(labelMax.sub(labelMin));
  
      return {
        inputs: normalizedInputs,
        labels: normalizedLabels,
        // Return the min/max bounds so we can use them later.
        inputMax,
        inputMin,
        labelMax,
        labelMin,
      }
    });  
  }

const model = createModel();

convertToTensor(classifications)