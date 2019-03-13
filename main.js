const electron = require('electron');
const url = require('url');
const path = require('path');
const midi = require('midi');
require('electron-reload')(__dirname, {
    electron: require(`${__dirname}/node_modules/electron`)
});
const  {app, BrowserWindow, Menu, ipcMain} = electron;

//Set ENV
process.env.NODE_ENV = 'production';

//initialize some variables
let mainWindow;
let createSeqWindow;
let choosenMidiPorts = [];
let channelCount = 0;
let dontLoop = false;
let sequences = [];
// initialize midi ports
const output = new midi.output();
let numMidiOuts = output.getPortCount();
let midiPortNames=[];

for(var i=0;i<numMidiOuts;i++){
  midiPortNames[i]=output.getPortName(i);
}


// functions for creating euclidian rhythms
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


// functions for playing a note, sequence or looping a sequence

function playNote(note,output,duration,velocity){
  //console.log('playing Note');
  output.sendMessage([144,note,velocity]);
  //wait for duration
  setTimeout(function(){
    //console.log('note off');
    output.sendMessage([128,note,0]);
  },
  duration);
}

function playSeq(seq,duration,note,output,velocity){
  if(seq.length == 0){
    return;
  }
  //console.log('sequence: ',seq);
  //console.log('step:', seq[0]);
  if(seq[0] == 1){
    playNote(note,output,duration,velocity);
    seq.shift();

    setTimeout(function(){
      playSeq(seq,duration,note,output,velocity);
    },
    duration)
  } else if(seq[0] == 0){
    seq.shift()
    setTimeout(function(){
    //  console.log("waiting for next beat");
      playSeq(seq,duration,note,output,velocity);
    },
    duration);
  }
}

function loopSeq(seq,duration,note,output,velocity){
  const loop =(duration *(seq.length));
  const sequence = seq;
  if(dontLoop){
    return;
  }
  /*
  console.log('sequence first :',sequence);
  console.log('loop length: ',loop);
  */
  playSeq(seq.slice(),duration,note,output,velocity);
  setTimeout(function(){
    /*
    console.log('sequence callback: ',sequence);
    console.log('dur: ',duration);
    console.log('velocity',velocity);
    console.log('note',note);
    */
    loopSeq(sequence,duration,note,output,velocity);
  },
  loop
);
}


// Create the Main Window
app.on('ready', function(){

  mainWindow = new BrowserWindow({});

  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname,'mainWindow.html'),
    protocol: 'file',
    slashes: true
  }));

  const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
  Menu.setApplicationMenu(mainMenu);

  mainWindow.on('closed',function(){
    app.quit();
  });
});


// Window for creating a new sequencer
function createSeq(){
  createSeqWindow = new BrowserWindow({
    width: 300,
    height: 600,
    autoHideMenuBar: true
  });

  createSeqWindow.loadURL(url.format({
    pathname: path.join(__dirname,'createSeqWindow.html'),
    protocol: 'file',
    slashes: true
  }));

  createSeqWindow.on('close', function(){
  createSeqWindow = null;
});
}

// receiver for making a new Sequencer
//pass it on to the main window
ipcMain.on('seq:new',function(e,seqParams){
  seqParams = {...seqParams,channelNumber: channelCount}
  channelCount++;
  sequences.push(seqParams);
//  console.log('All Sequences: ',sequences);
//  console.log(seqParams);
  mainWindow.webContents.send('seq:new',seqParams);
  createSeqWindow.close();
});

ipcMain.on('getMidi',function(){
  mainWindow.webContents.send('startup',midiPortNames);
});
// receiver for playing the sequencer
ipcMain.on('play',function(e,seqParams){

  dontLoop=false;

//  console.log('parameters :',seqParams);
//  console.log('play Something Here');

  var {beat,hit,offset,bpm,channelNumber,midi,note} = seqParams;
  beat = parseInt(beat);
  hit = parseInt(hit);
  offset = parseInt(offset);
  bpm = parseInt(bpm);
  channelNumber = parseInt(channelNumber);
  midi = parseInt(midi);
  note = parseInt(note);

  output.closePort();
  output.openPort(midi);

  dontLoop=false;

  var pattern = euclidianPattern(beat,hit,offset);
//  console.log('pattern : ',pattern);
  const duration = 60/bpm*1000;
//  console.log('duration: ',duration);
//  console.log('output :',output);

  loopSeq(pattern,duration,note,output,127);
});

//receiver for stoping all sequences
ipcMain.on('stop',function(e){
//  console.log('Stop Playing Here');
  dontLoop = true;
});

// play all created sequences in sync
ipcMain.on('playSync',function(e,midiChan){
  dontLoop=false;
  midiChan = parseInt(midiChan);
  output.closePort();
  output.openPort(midiChan);
  for(var i=0;i<sequences.length;i++){
    var {beat,hit,offset,bpm,channelNumber,midi,note} = sequences[i];
    beat = parseInt(beat);
    hit = parseInt(hit);
    offset = parseInt(offset);
    bpm = parseInt(bpm);
    channelNumber = parseInt(channelNumber);
    note = parseInt(note);

    var pattern = euclidianPattern(beat,hit,offset);
    console.log('pattern : ',pattern);
    const duration = 60/bpm*1000;
  //  console.log('duration: ',duration);
  //  console.log('output :',output);

    loopSeq(pattern,duration,note,output,127);
  }
})
//Main Menu
const mainMenuTemplate = [
  {
    label:'File',
    submenu:[
      {
        label: 'Add Sequencer',
        click(){
          createSeq();
        }
      },
      {
        label: 'Clear Items',
        click(){
          mainWindow.webContents.send('item:clear')
        }
      },
      {
        label: 'Quit',
        accelerator: process.platform == 'darwin' ? 'Command+Q':
        'Ctrl+Q',
        click(){
          app.quit();
        }
      }
    ]
  },
]


//menu  for mac users
if(process.platform == 'darwin'){
  mainMenuTemplate.unshift({});
}

// turn on dev tools while not in production mode
if(process.env.NODE_ENV !== 'production'){
  mainMenuTemplate.push({
    label: 'Developer Tools',
    submenu:[
      {
        label: 'Toggle DevTools',
        accelerator: process.platform == 'darwin' ? 'Command+I':
        'Ctrl+I',
        click(item,focusedWindow){
          focusedWindow.toggleDevTools();
        }
      },
      {
        role: 'reload'
      }
    ]
  })
}
