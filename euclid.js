function euclide(c,k,n,r){
  return +((((c+r) * k) % n) < k);
}

function euclidianPattern(steps,hits,rotation){
  var retSeq = [];
  for(var i=0;i<steps;i++){
    retSeq[i] = euclide(i,hits,steps,rotation)
  }
  return retSeq;
}

const sample = euclidianPattern(8,3,3);
console.log(sample);

var midi = require('midi');

// Set up a new output.
var output = new midi.output();
console.log(output[0]);
// Count the available output ports.
console.log(output.getPortCount());
// Get the name of a specified output port.
console.log(output.getPortName(1));
// Open the first available output port.
output.openPort(1);

// Send a MIDI message.
//output.sendMessage([144,90,10]);

function playNote(note,output,duration,velocity){
  output.sendMessage([144,note,velocity]);
  //wait for duration
  setTimeout(function(){
    output.sendMessage([128,note,0]);
  },
  duration);
}

playNote(60,output,500,127);

function playSeq(seq,duration,note,output,velocity){
  for(var i=0;i<seq.length;i++){
    if(seq[i] == 1){
      playNote(note,output,duration,velocity);
    } else {
      setTimeout(function(){
        console.log("waiting for next beat");
      },
      duration);
    }
  }
}

playSeq(sample,500,60,output,127);
