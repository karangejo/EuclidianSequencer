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
output.sendMessage([144,90,10]);
output.sendMessage([144,90,10]);

// Close the port when done.
output.closePort();
