"use strict";

const fs = require("fs");

const INPUT = "ExpertStandard.dat";
const OUTPUT = "EasyStandard.dat";

let difficulty = JSON.parse(fs.readFileSync(INPUT));

//#region this just counts how many time you ran it for fun, feel free to remove.
if (!fs.existsSync("count.txt")) {
  fs.writeFileSync("count.txt", parseInt("0").toString());
}
let count = parseInt(fs.readFileSync("count.txt"));
count++;
fs.writeFileSync("count.txt", count.toString());
console.log("GIVE IT UP FOR RUN " + count);
//#endregion

difficulty._customData = { _pointDefinitions: [], _customEvents: [] };

const _customData = difficulty._customData;
const _obstacles = difficulty._obstacles;
const _notes = difficulty._notes;
const _customEvents = _customData._customEvents;
const _pointDefinitions = _customData._pointDefinitions;

let filterednotes;

_obstacles.forEach(wall => {
  if (!wall._customData) {
    wall._customData = {};
  }
});

_notes.forEach(note => {
  if (!note._customData) {
    note._customData = {};
  }
});


//#region helper functions
function round(value, decimals) {
  return Number(Math.round(value + "e" + decimals) + "e-" + decimals);
}

function getJumps(njs, offset) {
  const _startHalfJumpDurationInBeats = 4;
  const _maxHalfJumpDistance = 18;
  const _startBPM = 68;
  const bpm = 68
  const _startNoteJumpMovementSpeed = 8
  const _noteJumpStartBeatOffset = 3

  let _noteJumpMovementSpeed = (_startNoteJumpMovementSpeed * bpm) / _startBPM;
  let num = 60 / bpm;
  let num2 = _startHalfJumpDurationInBeats;
  while (_noteJumpMovementSpeed * num * num2 > _maxHalfJumpDistance) {
    num2 /= 2;
  }
  num2 += _noteJumpStartBeatOffset;
  if (num2 < 1) {
    num2 = 1;
  }
  const _jumpDuration = num * num2 * 2;
  const _jumpDistance = _noteJumpMovementSpeed * _jumpDuration;
  return { half: num2, dist: _jumpDistance };
}
/*
function stackHide(stackTime, revealTime) {
  let dot
  let arrow
_notes.filter(o=>o._time==stackTime).forEach(o=>{
  if(o._cutDirection == 8){dot = o} else{arrow = o}
})
dot._time +=0.05
dot._customData._track = `stackThing${dot._time}`
let offset = [0,0]
StackWalls(revealTime,-get_note_direction(arrow))
switch (arrow._cutDirection) {
  case 0:
      offset = [0,-1]
      break;
  case 1:
      offset = [0, 1]
      break;
  case 2:
      offset = [-1,0]
      break;
  case 3:
      offset = [1,0]
      break;
  case 4:
      offset = [1, -1]
      break;
  case 5:
      offset = [-1, -1]
      break;
  case 6:
      offset = [1, 1]
      break; 
  case 7:
      offset = [-1, 1]
  break;
  default:
      break;
}
_customEvents.push({
  "_time":0,
  "_type":"AnimateTrack",
  "_data":{
      "_position":[[offset[0],offset[1],0,0]],
      "_track":`stackThing${dot._time}`,
      "_dissolve":[[0,0]],
      "_dissolveArrow":[[0,0]]

  }
}, {
  "_time":revealTime,
  "_type":"AnimateTrack",
  "_data":{
      "_position":[[offset[0],offset[1],0,0],[0,0,0,1,"easeOutElastic"]],
      "_scale":[[0.25,0.25,1,0],[1.5,1.5,1,0.5],[1,1,1,1,"easeOutElastic"]],
      "_track":`stackThing${dot._time}`,
      "_dissolve":[[1,0]],
      "_dissolveArrow":[[1,0]],
      "_duration":1,
      
  }
})
*/
function noteScale(startBeat, endBeat, track, interval, duration, magnitude) {
  for (let i = 0; i < (endBeat-startBeat); i+=interval){

          let currentBeat = startBeat+i;
          _customEvents.push({
              "_time":currentBeat,
              "_type":"AnimateTrack",
              "_data":{
                _track: track,
                _duration: duration,
                _scale: [[magnitude, magnitude, magnitude, 0, "easeOutExpo"], [1, 1, 1, 0.9, "easeOutBack"]],
              }
          })
     
  }

}

function BPMsync(startBeat, endBeat, type, interval, data) {
  for (let i = 0; i < (endBeat-startBeat); i+=interval){
          let currentBeat = startBeat+i;
          _customEvents.push({
              "_time":currentBeat,
              "_type":type,
              "_data":data
          })
     
  }

}

function offestOnNotesBetweenRBSep(trackR, trackB, p1, p2, potentialOffset, offsetR, offsetB) {
  filterednotes = _notes.filter(n => n._time >= p1 && n._time <= p2);
  filterednotes.forEach(object => {
    if (typeof potentialOffset !== "undefined") {
      object._customData._noteJumpStartBeatOffset = potentialOffset;
    }
    if (object._type == 0) {
      object._customData._track = trackR;
      object._customData._noteJumpStartBeatOffset = offsetR;
    }
    if (object._type == 1) {
      object._customData._track = trackB;
      object._customData._noteJumpStartBeatOffset = offsetB;
    }
  });
  return filterednotes;
}

function DecayShakePath(xAmp, yAmp, zAmp, points, easing = "easeStep") {
  let step = 1 / points;
  let tog = false;
  let WOWTHISISANAME = [[0, 0, 0, 0]];
  for (let i = 0; i < points; i++) {
    let xVal = xAmp * (1 - i * step);
    let yVal = yAmp * (1 - i * step);
    let zVal = zAmp * (1 - i * step);
    if (tog) {
      xVal = -xVal;
      yVal = -yVal;
      zVal = -zVal;
    }
    WOWTHISISANAME.push([xVal, yVal, zVal, (i + 1) * step, easing]);

    tog = !tog;
  }
  return WOWTHISISANAME;
}

function offestOnNotesBetween(p1, p2, offset) {
  filterednotes = _notes.filter(n => n._time >= p1 && n._time <= p2);
  filterednotes.forEach(object => {
    //always worth having.
    //man this shit BETTER not be undefined.
    if (typeof offset !== "undefined") {
      object._customData._noteJumpStartBeatOffset = offset;
    }
  });
  return filterednotes;
}

function lerp(v0, v1, t) {
  return v0 * (1 - t) + v1 * t;
}

function notesAt(times) {
  return _notes.filter(n => times.some(t => n._time == t));
}

function trackOnNotesBetween(track, p1, p2, potentialOffset) {
  filterednotes = _notes.filter(n => n._time >= p1 && n._time <= p2);
  filterednotes.forEach(object => {
    object._customData._track = track;
    if (typeof potentialOffset !== "undefined") {
      object._customData._noteJumpStartBeatOffset = potentialOffset;
    }
  });
  return filterednotes;
}
//applies a track to notes on two tracks between two times based on the color of the notes
//IT GONNA FUCK UP WITH BOMBS I TELL YOU HWAT BOI
//red, blue, p1, p2, potentialOffset
function trackOnNotesBetweenRBSep(trackR, trackB, p1, p2, potentialOffset) {
  filterednotes = _notes.filter(n => n._time >= p1 && n._time <= p2);
  filterednotes.forEach(object => {
    if (typeof potentialOffset !== "undefined") {
      object._customData._noteJumpStartBeatOffset = potentialOffset;
    }
    if (object._type == 0) {
      object._customData._track = trackR;
    }
    if (object._type == 1) {
      object._customData._track = trackB;
    }
  });
  return filterednotes;
}
//p1, p2, potentialoffset, up, down, left, right,
//TODO: ADD OTHER DIRS
function trackOnNotesBetweenDirSep(p1, p2, potentialOffset, trackUp, trackDown, trackLeft, trackRight) {
  filterednotes = _notes.filter(n => n._time >= p1 && n._time <= p2);
  filterednotes.forEach(object => {
    if (object._cutDirection == 0 && typeof trackUp !== "undefined") {
      object._customData._track = trackUp;
    }
    if (object._cutDirection == 1 && typeof trackUp !== "undefined") {
      object._customData._track = trackDown;
    }
    if (object._cutDirection == 2 && typeof trackUp !== "undefined") {
      object._customData._track = trackLeft;
    }
    if (object._cutDirection == 3 && typeof trackUp !== "undefined") {
      object._customData._track = trackRight;
    }
    //i might want to make this only run if I assign a track...
    if (typeof potentialOffset !== "undefined") {
      object._customData._noteJumpStartBeatOffset = potentialOffset;
    }
  });
  return filterednotes;
}

//#endregion

/*
//#region BASIC EXAMPLES

_pointDefinitions.push({
  _name: "buildupshake2",
  _points: DecayShakePath(0.5, 0, 0, 50)
});


filterednotes = notesAt([  insert specific note time here  ]);
filterednotes.forEach(note => {
  note._customData._noteJumpStartBeatOffset = -0.1;
  note._customData._noteJumpMovementSpeed = 17;
  note._customData._animation = {}
  note._customData._animation._rotation = [[-90, 0, 0, 0],[0,0,0,0.5,"easeOutElastic"]];

});

filterednotes = _notes.filter(n => n._time >= 69 && n._time <= 420);
filterednotes.forEach(note => {
  note._customData._track = "dumb track name here";
  note._customData._noteJumpStartBeatOffset = 69;
  note._customData._noteJumpMovementSpeed = 420;
});

trackOnNotesBetween("dumb track name here");
filterednotes = _notes.filter(n => n._time >= 69 && n._time <= 420);
filterednotes.forEach(note => {
  note._customData._track = "dumb track name here";
  note._customData._noteJumpStartBeatOffset = 666;
  note._customData._noteJumpMovementSpeed = 777;
  note._customData._fake = true;
  n._customData._disableSpawnEffect = "true"
});

_customEvents.push({
  _time: 69,
  _type: "AnimateTrack",
  _data: {
    _track: "dumb track name here",
    _duration: 420,
    _easing: "easeOutQuad",
    _position: [[0, 0, 0, 0], [0, 10, 10, 1]],
    _rotation: [[0, 180, 0, 0]],
    _dissolve: [[1, 0], [0, 0.8]],
    _dissolveArrow: [[1, 0], [0, 1]]
  }
});

// FUNCTIONS EXAMPLE
// noteScale
function noteScale(startBeat, endBeat, track, interval, duration, magnitude) {
  for (let i = 0; i < (endBeat-startBeat); i+=interval){

          let currentBeat = startBeat+i;
          _customEvents.push({
              "_time":currentBeat,
              "_type":"AnimateTrack",
              "_data":{
                _track: track,
                _duration: duration,,
                _scale: [[magnitude, magnitude, magnitude, 0], [1, 1, 1, 0.9, "easeOutBack"],[magnitude, magnitude, magnitude, 1,"easeInQuart"]],
              }
          })
     
  }

}
//Function call
noteScale(startBeat, endBeat, track, interval, duration, magnitude);




// alternates beats
let toggle = false;
let startBeat = 136;
for (let i = 0; i < (196-136); i++){
    if(toggle){
        let currentBeat = startBeat+i;
        _customEvents.push({
            "_time":currentBeat,
            "_type":"AnimateTrack",
            "_data":{
              _track: "slowbuild",
              _duration: 1,
              _scale: [[1.3, 1.3, 1.3, 0], [1, 1, 1, 0.9, "easeOutBack"],[1.3, 1.3, 1.3, 1,"easeInQuart"]],
              //_localRotation: [[0, 20, 0, 0], [0, 0, 0, 1,"easeOutCirc"]], 
              //_dissolve: [[1, 0], [0, 0.8]],
              //_dissolveArrow: [[1, 0], [0, 1]]
            }
        })
    } else {
        let currentBeat = startBeat+i;
        _customEvents.push({
            "_time":currentBeat,
            "_type":"AnimateTrack",
            "_data":{
              _track: "slowbuild",
              _duration: 1,
              _scale: [[1.3, 1.3, 1.3, 0], [1, 1, 1, 0.9, "easeOutBack"],[1.3, 1.3, 1.3, 1,"easeInQuart"]],
              //_localRotation: [[0, -20, 0, 0], [0, 0, 0, 1,"easeOutCirc"]],
              //_dissolve: [[1, 0], [0, 0.8]],
              //_dissolveArrow: [[1, 0], [0, 1]]
            }
        })
    }
    toggle = !toggle;
}




//#endregion
*/





//#region Do your dirty work here
filterednotes = _notes.filter(n => n._time >=1 && n._time <= 18); // filters notes from beat (_time) 1 to beat 18
filterednotes.forEach(note => {
  note._customData._animation = {} // creates a new section in each individual notes _customData for _animation
  note._customData._animation._scale = [[0.1, 0.1, 0.1, 0]]; // sets x,y,z scale of the note to 0.1 at the very start of the notes life (0)
});

//#endregion






/*
// This is the thingy that does the stuff with the walls and shit 
JSON.parse(fs.readFileSync("./wallsPre.dat"))._obstacles.forEach(o=>{
  if(o._customData._track!="walls") {
    _obstacles.push(o)

  } else {
    console.log("you should only see this once, if you see it more, exec Eat_Ass.jpg")
    franklinContainer = o;
  }
})
*/

//#region write file
const precision = 4; //decimals to round to

const jsonP = Math.pow(10, precision);
const sortP = Math.pow(10, 2);
function deeperDaddy(obj) {
  if (obj)
    for (const key in obj) {
      if (obj[key] == null) {
        delete obj[key];
      } else if (typeof obj[key] === "object" || Array.isArray(obj[key])) {
        deeperDaddy(obj[key]);
      } else if (typeof obj[key] == "number") {
        obj[key] = parseFloat(
          Math.round((obj[key] + Number.EPSILON) * jsonP) / jsonP
        );
      }
    }
}
deeperDaddy(difficulty);

difficulty._notes.sort(
  (a, b) =>
    parseFloat(Math.round((a._time + Number.EPSILON) * sortP) / sortP) -
      parseFloat(Math.round((b._time + Number.EPSILON) * sortP) / sortP) ||
    parseFloat(Math.round((a._lineIndex + Number.EPSILON) * sortP) / sortP) -
      parseFloat(Math.round((b._lineIndex + Number.EPSILON) * sortP) / sortP) ||
    parseFloat(Math.round((a._lineLayer + Number.EPSILON) * sortP) / sortP) -
      parseFloat(Math.round((b._lineLayer + Number.EPSILON) * sortP) / sortP)
);
difficulty._obstacles.sort((a, b) => a._time - b._time);
difficulty._events.sort((a, b) => a._time - b._time);

fs.writeFileSync(OUTPUT, JSON.stringify(difficulty, null, 0));

//#endregion
