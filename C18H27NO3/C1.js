// GitHub notes: 
// Please only use this a reference. This is EXTREMELY old and scuffed code, and also built on the V2 mapping format. 
// Use this to get a rough idea of how some effects are achieved, and try to adapt these concepts int your own workflow. 
// Also, please try to use the V3 mapping format for any future mapping projects :)

"use strict";

const fs = require("fs");

const INPUT = "ExpertStandard.dat";
const OUTPUT = "ExpertPlusStandard.dat";

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



//    -  -  -  -  -  -  -  -  -  -  -  -  -  LOOK BELOW FOR GREEN TEXT WITH A LINE LIKE THIS. READ ALL OF THESE BEFORE USING!  -  -  -  -  -  -  -  -  -  -  -  -  -  





difficulty._customData = { _pointDefinitions: [], _environment: [], _customEvents: [] };

const _customData = difficulty._customData;
const _obstacles = difficulty._obstacles;
const _notes = difficulty._notes;
const _customEvents = _customData._customEvents;
const _pointDefinitions = _customData._pointDefinitions;
const _environment = _customData._environment;

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



//#region helper functions -  -  -  -  -  -  -  -  -  -  -  -  -   These make life a LOT eassier, look through, figure out what they do, add your own, have fun :)  --- many are very specific use cases and might need to be modified depnding on use.

function getJumps(njs, offset) {
  const _startHalfJumpDurationInBeats = 4;
  const _maxHalfJumpDistance = 18;
  const _startBPM = 210; //INSERT BPM HERE -  -  -  -  -  -  -  -  -  -  -  -  -  
  const bpm = 210; //AND HERE -  -  -  -  -  -  -  -  -  -  -  -  -  
  const _startNoteJumpMovementSpeed = 19; //NJS -  -  -  -  -  -  -  -  -  -  -  -  -  
  const _noteJumpStartBeatOffset = 0; //OFFSET -  -  -  -  -  -  -  -  -  -  -  -  -  

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

function yack(startBeat, endBeat, track, interval, duration) {
  for (let i = 0; i < endBeat - startBeat; i += interval) {
    let currentBeat = startBeat + i;
    _customEvents.push({
      _time: currentBeat,
      _type: "AnimateTrack",
      _data: {
        _track: track,
        _duration: duration,
        _position: [[0,-2.5,0,0]],
        _rotation: [[0,0,180,0]]
      }
    }, {
      _time: currentBeat + 1,
      _type: "AnimateTrack",
      _data: {
        _track: track,
        _duration: duration,
        _position: [[0,0,0,0]],
        _rotation: [[0,0,0,0]]
      }
    });
  }
}

function noteScale(startBeat, endBeat, track, interval, duration, magnitude) {
  for (let i = 0; i < endBeat - startBeat; i += interval) {
    let currentBeat = startBeat + i;
    _customEvents.push({
      _time: currentBeat,
      _type: "AnimateTrack",
      _data: {
        _track: track,
        _duration: duration,
        _scale: [
          [magnitude, magnitude, magnitude, 0, "easeOutExpo"],
          [1, 1, 1, 0.9, "easeOutBack"]
        ]
      }
    });
  }
}
function noteScale2(startBeat, endBeat, track, interval, duration, magnitude) {
  for (let i = 0; i < endBeat - startBeat; i += interval) {
    let currentBeat = startBeat + i;
    _customEvents.push({
      _time: currentBeat,
      _type: "AnimateTrack",
      _data: {
        _track: track,
        _duration: duration,
        _scale: [
          [magnitude, magnitude, magnitude, 0],
          [1, 1, 1, 1, "easeOutBounce"]
        ]
      }
    });
  }
}

function noteSlide(startBeat, endBeat, track, interval, duration, amntX, amntY, amntZ) {
  for (let i = 0; i < endBeat - startBeat; i += interval) {
    let currentBeat = startBeat + i;
    _customEvents.push({
      _time: currentBeat,
      _type: "AssignPathAnimation",
      _data: {
        _track: track,
        _duration: duration,
        _position: [[amntX,amntY,amntZ,0.125], [0,0,0,0.375, "easeInOutExpo"]],
        //_rotation: [[amntX*2,amntY*2,amntZ*2,0], [0,0,0,0.48, "easeInOutExpo"]]
      }
    });
  }
}

function laneFlashB(startBeat, endBeat, track, interval, duration, amntX, amntY, amntZ) {
  for (let i = 0; i < endBeat - startBeat; i += interval) {
    let currentBeat = startBeat + i;
    _customEvents.push({
      _time: currentBeat,
      _type: "AssignPathAnimation",
      _data: {
        _track: track,
        //_duration: duration,
        _dissolve: [[1,0],[1,0.0624], [0,0.0625],[0,0.1249], [1,0.125],[1,0.1874], [0,0.1875],[0,0.2499], [1,0.25],[1,0.3124], [0,0.3125],[0,0.3749], [1,0.375], [1,0.47], [0,0.485]],
        _dissolveArrow: [[0,0]],
        _position: [[0,0,-10,0.125], [0,0,0,0.5, "easeOutCirc"]],
        //_localRotation: [[0,0,90,0, "splineCatmullRom"], [0,0,180,0.0625, "splineCatmullRom"], [0,0,270,0.1875, "splineCatmullRom"], [0,0,0,0.45, "splineCatmullRom", "easeOutQuad"]]
      }
    });
  }
}

function laneFlashA(startBeat, endBeat, track, interval, duration, amntX, amntY, amntZ) {
  for (let i = 0; i < endBeat - startBeat; i += interval) {
    let currentBeat = startBeat + i;
    _customEvents.push({
      _time: currentBeat,
      _type: "AssignPathAnimation",
      _data: {
        _track: track,
        //_duration: duration,
        _dissolve: [[0,0]],
        _dissolveArrow: [[0,0],[0,0.0624], [1,0.0625],[1,0.1249], [0,0.125],[0,0.1874], [1,0.1875],[1,0.2499], [0,0.25],[0,0.3124], [1,0.3125],[1,0.3749], [0,0.375],[0,0.43749], [1,0.4375]],
        _position: [[0,0,-10,0.125], [0,0,0,0.5, "easeOutCirc"]]

      }
    });
  }
}

function ohno(startBeat, track) {
  filterednotes = _notes.filter(n => n._time > startBeat && n._time < startBeat+0.5);
  filterednotes.forEach(note => {
    note._customData._disableNoteGravity = true;
    note._customData._disableSpawnEffect = true;
    note._customData._noteJumpMovementSpeed = 19;
});
  trackOnNotesBetween(track, startBeat, startBeat+0.5, 5);
  _customEvents.push({
    _time: 0,
    _type: "AnimateTrack",
    _data: {
      _duration:1,
      _track:track,
      _localRotation: [[0,0,90,0]],
      _scale: [[0.1,0.1,0.1,0]],
      _position: [[0,0,5000,0]],
      _dissolve: [[0, 0]],
      _dissolveArrow: [[0, 0]]
    }
  }, {
    _time: startBeat-4,
    _type: "AnimateTrack",
    _data: {
      _duration: 4,
      _track:track,
      _position: [[0,0,2,0],[0,0,-5,0.4], [0,0,0,0.75, "easeOutBack"]],
      _localRotation: [[(-69,69),(-69,69),getRndInteger(-69,69),0], [0,0,0,1, "easeOutElastic"]],
      _scale:[[6.9,6.9,6.9,0], [1,1,1,0.25, "easeOutBounce"]],
      _dissolve: [[0, 0], [1, 0.125]],
      _dissolveArrow: [[0, 0], [1, 0.125]]
    }
  }, {
    _time: startBeat-5,
    _type: "AnimateTrack",
    _data: {
      _time:"ohnoTime",
      _duration:10,
      _track:track,
    }
  });
}

function ohnoFast(startBeat, track) {
  filterednotes = _notes.filter(n => n._time > startBeat && n._time < startBeat+0.5);
  filterednotes.forEach(note => {
    note._customData._disableNoteGravity = true;
    note._customData._disableSpawnEffect = true;
    note._customData._noteJumpMovementSpeed = 19;
});
  trackOnNotesBetween(track, startBeat, startBeat+0.5, 5);
  _customEvents.push({
    _time: 0,
    _type: "AnimateTrack",
    _data: {
      _duration:1,
      _track:track,
      _localRotation: [[0,0,90,0]],
      _scale: [[0.1,0.1,0.1,0]],
      _position: [[0,0,-5000,0]],
      _dissolve: [[0, 0]],
      _dissolveArrow: [[0, 0]]
    }
  }, {
    _time: startBeat-2.25,
    _type: "AnimateTrack",
    _data: {
      _duration: 2.25,
      _track:track,
      _position: [[0,0,2,0],[0,0,-5,0.4], [0,0,0,0.75, "easeOutBack"]],
      _localRotation: [[(-69,69),(-69,69),getRndInteger(-69,69),0], [0,0,0,1, "easeOutElastic"]],
      _scale:[[6,6,6,0], [1,1,1,0.5, "easeOutBounce"]],
      _dissolve: [[0, 0], [1, 0.25]],
      _dissolveArrow: [[0, 0], [1, 0.25]]
    }
  }, {
    _time: startBeat-5,
    _type: "AnimateTrack",
    _data: {
      _time:"ohnoTime",
      _duration:10,
      _track:track,
    }
  });
}




function arrowFlash(startBeat, endBeat, track, interval, duration) {
  for (let i = 0; i < endBeat - startBeat; i += interval) {
    let currentBeat = startBeat + i;
    _customEvents.push({
      _time: currentBeat,
      _type: "AnimateTrack",
      _data: {
        _track: track,
        _duration: duration,
        _dissolveArrow: [[0, 0.499], [1, 0.5], [1, 1]]
      }
    });
  }
}

function bloqFlash(startBeat, endBeat, track, interval, duration) {
  for (let i = 0; i < endBeat - startBeat; i += interval) {
    let currentBeat = startBeat + i;
    _customEvents.push({
      _time: currentBeat,
      _type: "AnimateTrack",
      _data: {
        _track: track,
        _duration: duration,
        _dissolve: [[0, 0.499], [1, 0.5], [1, 1]]
      }
    });
  }
}

function stackHide(stackTime, revealTime) {
  let dot;
  let arrow;
  _notes
    .filter(o => o._time == stackTime)
    .forEach(o => {
      if (o._cutDirection == 8) {
        dot = o;
      } else {
        arrow = o;
      }
    });
  dot._time += 0.0125;
  dot._customData._track = `stackThing${dot._time}`;
  let offset = [0, 0];
  StackWalls(revealTime, -get_note_direction(arrow));
  switch (arrow._cutDirection) {
    case 0:
      offset = [0, -1];
      break;
    case 1:
      offset = [0, 1];
      break;
    case 2:
      offset = [-1, 0];
      break;
    case 3:
      offset = [1, 0];
      break;
    case 4:
      offset = [1, -1];
      break;
    case 5:
      offset = [-1, -1];
      break;
    case 6:
      offset = [1, 1];
      break;
    case 7:
      offset = [-1, 1];
      break;
    default:
      break;
  }
  _customEvents.push(
    {
      _time: 0,
      _type: "AnimateTrack",
      _data: {
        _position: [[offset[0], offset[1], 0, 0]],
        _track: `stackThing${dot._time}`,
        _dissolve: [[0, 0]],
        _dissolveArrow: [[0, 0]]
      }
    },
    {
      _time: revealTime-0.5,
      _type: "AnimateTrack",
      _data: {
        _position: [
          [offset[0], offset[1], 0, 0],
          [0, 0, 0, 1, "easeOutExpo"]
        ],
        _scale: [
          [0.25, 0.25, 1, 0],
          [1, 1, 1, 1, "easeOutExpo"]
        ],
        _track: `stackThing${dot._time}`,
        _dissolve: [[1, 0]],
        _dissolveArrow: [[1, 0]],
        _duration: 0.5
      }
    }
  );
}

function genCircle(radius, n) {
  let pointss = [];
  for (let i = 0; i < n; i++) {
    pointss.push([
      radius * Math.cos(((2 * Math.PI) / n) * i) - 0.5,
      radius * Math.sin(((2 * Math.PI) / n) * i) * 1.16 - 1.6
    ]);
  }
  return pointss;
}
function genCircleNoCorrection(radius, n) {
  let pointss = [];

  for (let i = 0; i < n; i++) {
    pointss.push([
      radius * Math.cos(((2 * Math.PI) / n) * i),
      radius * Math.sin(((2 * Math.PI) / n) * i)
    ]);
  }
  return pointss;
}

function round(value, decimals) {
  return Number(Math.round(value + "e" + decimals) + "e-" + decimals);
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

function trackOnNotesBetweenNoO(track, p1, p2) {
  filterednotes = _notes.filter(n => n._time >= p1 && n._time <= p2);
  filterednotes.forEach(object => {
    object._customData._track = track;
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

function trackOffestOnNotesBetweenRBSep(
  trackR,
  trackB,
  p1,
  p2,
  potentialOffset,
  offsetR,
  offsetB
) {
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

function offestOnNotesBetweenRBSep(
  p1,
  p2,
  offsetR,
  offsetB
) {
  filterednotes = _notes.filter(n => n._time >= p1 && n._time <= p2);
  filterednotes.forEach(object => {
    if (object._type == 0) {
      object._customData._noteJumpStartBeatOffset = offsetR;
    }
    if (object._type == 1) {
      object._customData._noteJumpStartBeatOffset = offsetB;
    }
  });
  return filterednotes;
}

function offestOnNotesBetweenRBSepG(
  p1,
  p2,
  offsetR,
  offsetB
) {
  filterednotes = _notes.filter(n => n._time >= p1 && n._time <= p2);
  filterednotes.forEach(object => {
    if (object._type == 0) {
      object._customData._noteJumpStartBeatOffset = offsetR;
      //object._customData._disableNoteGravity = true;
    }
    if (object._type == 1) {
      object._customData._noteJumpStartBeatOffset = offsetB;
      //object._customData._disableNoteGravity = true;
    }
  });
  return filterednotes;
}

//p1, p2, up, down, left, right,
//TODO: ADD OTHER DIRS
function trackOnNotesBetweenDirSep(
  p1,
  p2,
  trackUp,
  trackDown,
  trackLeft,
  trackRight
) {
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
  });
  return filterednotes;
}

function multR (Start, End, trackR, trackB, amount) {
  filterednotes = _notes.filter(n => n._time >= Start && n._time < End);
  filterednotes.forEach(note => {
    if (note._type == 0) {
      note._customData._track = trackR;
    }
    if (note._type == 1) {
      note._customData._track = trackB;
    }
    note._customData._noteJumpStartBeatOffset = 8;
    note._customData._noteJumpMovementSpeed = 12;
    note._customData._animation = {};
    note._customData._animation._rotation = [[0, 16, 0, 0]];
    note._customData._disableSpawnEffect = true;
    note._customData._disableNoteGravity = true;
    for (let index = 1; index < amount * 3; index++) {
      let n1 = JSON.parse(JSON.stringify(note));
      n1._time += 0.001;
      if (note._type == 0) {
        note._customData._track = trackR;
      }
      if (note._type == 1) {
        note._customData._track = trackB;
      }
      n1._customData._noteJumpStartBeatOffset = 8;
      n1._customData._noteJumpMovementSpeed = 12;
      n1._customData._animation = {};
      n1._customData._animation._position = [[-4 * index, 0, 0, 0]];
      n1._customData._animation._rotation = [[0, 16, 0, 0]];
      //n1._customData._animation._dissolveArrow = [[0,0]];
      n1._customData._fake = true;
      n1._customData._interactable = false;
      n1._customData._disableSpawnEffect = true;
      n1._customData._disableNoteGravity = true;
      _notes.push(n1);
    }
    for (let index2 = 1; index2 < amount * 2 ; index2++) {
      let n1 = JSON.parse(JSON.stringify(note));
      n1._time += 0.001;
      n1._customData._noteJumpStartBeatOffset = 8;
      n1._customData._noteJumpMovementSpeed = 12
      n1._customData._animation = {};
      n1._customData._animation._position = [[4 * index2, 0, 0, 0]];
      n1._customData._animation._rotation = [[0, 16, 0, 0]];
      //n1._customData._animation._dissolveArrow = [[0,0]];
      n1._customData._fake = true;
      n1._customData._interactable = false;
      n1._customData._disableSpawnEffect = true;
      n1._customData._disableNoteGravity = true;
      if (note._type == 0) {
        note._customData._track = trackR;
      }
      if (note._type == 1) {
        note._customData._track = trackB;
      }
      _notes.push(n1);
    }
  });
  }
  function multRs (Start, End, trackR, trackB, amount) {
    filterednotes = _notes.filter(n => n._time >= Start && n._time < End);
    filterednotes.forEach(note => {
      if (note._type == 0) {
        note._customData._track = trackR;
      }
      if (note._type == 1) {
        note._customData._track = trackB;
      }
      note._customData._noteJumpStartBeatOffset = 1;
      note._customData._noteJumpMovementSpeed = 12;
      note._customData._animation = {};
      note._customData._animation._rotation = [[getRndInteger(-10, 10), getRndInteger(-10, 10), getRndInteger(-10, 10), 0], [0, 0, 0, 0.38, "easeOutBack"]];
      note._customData._animation._localRotation = [[getRndInteger(-90,90),getRndInteger(-90,90),getRndInteger(-90,90),0], [0,0,0,0.4, "easeOutQuad"]],
      note._customData._disableSpawnEffect = true;
      note._customData._disableNoteGravity = true;
      for (let index = 1; index < amount * 2; index++) {
        let n1 = JSON.parse(JSON.stringify(note));
        n1._time += 0.001;
        if (note._type == 0) {
          note._customData._track = trackR;
        }
        if (note._type == 1) {
          note._customData._track = trackB;
        }
        n1._customData._noteJumpStartBeatOffset = 6.9;
        n1._customData._noteJumpMovementSpeed = 17 + (index*1.69);
        n1._customData._animation = {};
        n1._customData._animation._position = [[-5 * index, 0, 0, 0]];
        n1._customData._animation._rotation = [[getRndInteger(-5, 5), getRndInteger(-6.9, 6.9), getRndInteger(-5, 5), 0], [getRndInteger(-2, 2), getRndInteger(-2, 2), getRndInteger(-2, 2), 0.69]];
        n1._customData._animation._localRotation = [[getRndInteger(-90,90),getRndInteger(-90,90),getRndInteger(-90,90),0], [getRndInteger(-10,10),getRndInteger(-10,10),getRndInteger(-10,10),0.69, "easeInOutBack"]];
        //n1._customData._animation._dissolveArrow = [[0,0]];
        n1._customData._fake = true;
        n1._customData._interactable = false;
        n1._customData._disableSpawnEffect = true;
        n1._customData._disableNoteGravity = true;
        _notes.push(n1);
      }
      for (let index2 = 1; index2 < amount * 2 ; index2++) {
        let n1 = JSON.parse(JSON.stringify(note));
        n1._time += 0.001;
        n1._customData._noteJumpStartBeatOffset = 6.9;
        n1._customData._noteJumpMovementSpeed = 17 + (index2*1.69);
        n1._customData._animation = {};
        n1._customData._animation._position = [[5 * index2, 0, 0, 0]];
        n1._customData._animation._rotation = [[getRndInteger(-5, 5), getRndInteger(-6.9, 6.9), getRndInteger(-5, 5), 0], [getRndInteger(-2, 2), getRndInteger(-2, 2), getRndInteger(-2, 2), 0.69]];
        n1._customData._animation._localRotation = [[getRndInteger(-90,90),getRndInteger(-90,90),getRndInteger(-90,90),0], [getRndInteger(-10,10),getRndInteger(-10,10),getRndInteger(-10,10),0.69, "easeInOutBack"]];
        //n1._customData._animation._dissolveArrow = [[0,0]];
        n1._customData._fake = true;
        n1._customData._interactable = false;
        n1._customData._disableSpawnEffect = true;
        n1._customData._disableNoteGravity = true;
        if (note._type == 0) {
          note._customData._track = trackR;
        }
        if (note._type == 1) {
          note._customData._track = trackB;
        }
        _notes.push(n1);
      }
    });
}

function glitchPos(beat, endBeat) {
  filterednotes = _notes.filter(n => n._time >= beat && n._time < endBeat);
  filterednotes.forEach(note => {
    if (note._customData._fake !== true) {
    note._customData._disableSpawnEffect = true;
    note._customData._animation = {};
    note._customData._animation._dissolve = [[0, 0],[0,0.399], [1,0.4]];
    note._customData._animation._dissolveArrow = [[0.69, 0]];
    for (let index = 0; index < 1; index++) {
      let notef = JSON.parse(JSON.stringify(note));
      notef._time += 0.01
      notef._customData._fake = true;
      notef._customData._interactable = false;
      notef._customData._animation = {};
      notef._customData._animation._dissolve = [[1, 0],[1,0.399], [0,0.4]];
      notef._customData._animation._dissolveArrow = [[1, 0], [1,0.45], [0,0.5]];
      if (notef._type == 0) {
        notef._customData._track = "redglitch";
      }
      if (notef._type == 1) {
        notef._customData._track = "blueglitch";
      }
       _notes.push(notef);
    }
  }
 }),

_customEvents.push({
  _time: beat,
  _type: "AnimateTrack",
  _data: {
    _duration: 0.5,
    _position: [[2, 0, 4, 0], [2, 0, 4, 0.24], [-2, 0, 2, 0.25], [-2, 0, 2, 0.49], [0, 0, 4, 0.5], [0, 0, 4, 0.74], [-1, 0.5, 2, 0.75], [-1, 0.5, 2, 0.99], [0, 0, 0, 1]],
    _track: "redglitch",
  }
});
_customEvents.push({
  _time: beat + 0.5,
  _type: "AnimateTrack",
  _data: {
    _duration: 0.5,
    _dissolveArrow: [[2, 0], [2, 0.24], [0, 0.25], [0, 0.49], [1, 0.5], [1, 0.74], [0, 0.75], [0, 0.99], [1, 1]],
    _track: "redglitch",
  }
});
_customEvents.push({
  _time: beat,
  _type: "AnimateTrack",
  _data: {
    _duration: 0.5,
    _position: [[-2, 0, 4, 0], [-2, 0, 4, 0.24], [2, 0, 2, 0.25], [2, 0, 2, 0.49], [0, 0, 4, 0.5], [0, 0, 4, 0.74], [1, -0.5, 2, 0.75], [1, -0.5, 2, 0.99], [0, 0, 0, 1]],
    _track: "blueglitch",
  }
});
_customEvents.push({
  _time: beat + 0.5,
  _type: "AnimateTrack",
  _data: {
    _duration: 0.5,
    _dissolve: [[1,0]],
    _dissolveArrow: [[2, 0], [2, 0.24], [0, 0.25], [0, 0.49], [1, 0.5], [1, 0.74], [0, 0.75], [0, 0.99], [1, 1]],
    _track: "blueglitch",
  }
});
}

function glitchPosFunny(beat, endBeat, magnitude, offset, easeing) {
  filterednotes = _notes.filter(n => n._time >= beat && n._time < endBeat);
  filterednotes.forEach(note => {
    if (note._customData._track !== "ArrowsGlitch2") {
    note._customData._noteJumpStartBeatOffset = offset;
    note._customData._disableSpawnEffect = true;
    note._customData._animation = {};
    note._customData._animation._dissolve = [[0, 0],[0,0.399], [1,0.4]];
    note._customData._animation._dissolveArrow = [[0.69, 0]];
    for (let index = 0; index < 1; index++) {
      let notef = JSON.parse(JSON.stringify(note));
      notef._time += 0.01
      notef._customData._fake = true;
      notef._customData._interactable = false;
      notef._customData._animation = {};
      notef._customData._animation._dissolve = [[1, 0],[1,0.399], [0,0.4]];
      notef._customData._animation._dissolveArrow = [[1, 0], [1,0.45], [0,0.5]];
      if (notef._type == 0) {
        notef._customData._noteJumpStartBeatOffset = offset;
        notef._customData._track = "redglitch";
        notef._customData._animation._rotation =  [[getRndInteger(-magnitude,magnitude),getRndInteger(-magnitude,magnitude),getRndInteger(-magnitude,magnitude),0.125], [0,0,0,0.375, easeing]];
        notef._customData._animation._localRotation =  [[getRndInteger(-magnitude,magnitude),getRndInteger(-magnitude,magnitude),getRndInteger(-magnitude,magnitude),0.125], [0,0,0,0.375, "easeInOutBack"]];
      }
      if (notef._type == 1) {
        notef._customData._noteJumpStartBeatOffset = offset;
        notef._customData._track = "blueglitch";
        notef._customData._animation._rotation =  [[getRndInteger(-magnitude,magnitude),getRndInteger(-magnitude,magnitude),getRndInteger(-magnitude,magnitude),0.125], [0,0,0,0.375, easeing]];
        notef._customData._animation._localRotation =  [[getRndInteger(-magnitude,magnitude),getRndInteger(-magnitude,magnitude),getRndInteger(-magnitude,magnitude),0.125], [0,0,0,0.375, "easeInOutBack"]];
      }
       _notes.push(notef);
    }
  }
 }),
_customEvents.push({
  _time: beat,
  _type: "AnimateTrack",
  _data: {
    _duration: 0.5,
    _position: [[0, 0, 0, 0], [-5, 0, -4, 0.14, "easeInBack"], [5, 0, 4, 0.15], [4, 0, 4, 0.24], [-4, 0, 4, 0.25], [-2, 0, 2, 0.49], [0, 0, 4, 0.5], [0, 0, 4, 0.74], [-1, 0.5, 2, 0.75], [-1, 0.5, 2, 0.99], [0, 0, 0, 1]],
    _track: "redglitch",
  }
});
_customEvents.push({
  _time: beat + 0.5,
  _type: "AnimateTrack",
  _data: {
    _duration: 0.5,
    _dissolveArrow: [[2, 0], [2, 0.24], [0, 0.25], [0, 0.49], [1, 0.5], [1, 0.74], [0, 0.75], [0, 0.99], [1, 1]],
    _track: "redglitch",
  }
});
_customEvents.push({
  _time: beat,
  _type: "AnimateTrack",
  _data: {
    _duration: 0.5,
    _position: [[0, 0, 0, 0], [-5, 0, -4, 0.14, "easeInBack"], [5, 0, 4, 0.15], [-2, 0, 4, 0.24], [2, 0, 2, 0.25], [2, 0, 2, 0.49], [0, 0, 4, 0.5], [0, 0, 4, 0.74], [1, -0.5, 2, 0.75], [1, -0.5, 2, 0.99], [0, 0, 0, 1]],
    _track: "blueglitch",
  }
});
_customEvents.push({
  _time: beat + 0.5,
  _type: "AnimateTrack",
  _data: {
    _duration: 0.5,
    _dissolve: [[1,0]],
    _dissolveArrow: [[2, 0], [2, 0.24], [0, 0.25], [0, 0.49], [1, 0.5], [1, 0.74], [0, 0.75], [0, 0.99], [1, 1]],
    _track: "blueglitch",
  }
});
}

function glitchPosInline(beat, endBeat) {
  filterednotes = _notes.filter(n => n._time >= beat && n._time < endBeat);
  filterednotes.forEach(note => {
    if (note._customData._fake !== true) {
    note._customData._disableSpawnEffect = true;
    note._customData._animation = {};
    note._customData._animation._dissolve = [[0, 0],[0,0.399], [1,0.4]];
    note._customData._animation._dissolveArrow = [[0.69, 0]];
    for (let index = 0; index < 1; index++) {
      let notef = JSON.parse(JSON.stringify(note));
      notef._time += 0.01
      notef._customData._fake = true;
      notef._customData._interactable = false;
      notef._customData._animation = {};
      notef._customData._animation._dissolve = [[1, 0],[1,0.399], [0,0.4]];
      notef._customData._animation._dissolveArrow = [[1, 0], [1,0.45], [0,0.5]];
      if (notef._type == 0) {
        notef._customData._track = "redglitch";
      }
      if (notef._type == 1) {
        notef._customData._track = "blueglitch";
      }
       _notes.push(notef);
    }
  }
 }),

_customEvents.push({
  _time: beat,
  _type: "AnimateTrack",
  _data: {
    _duration: 0.5,
    _position: [[2, 0, 4, 0], [2, 0, 4, 0.24], [-2, 0, 2, 0.25], [-2, 0, 2, 0.49], [0, 0, 4, 0.5], [0, 0, 4, 0.74], [-1, 0.5, 2, 0.75], [-1, 0.5, 2, 0.99], [0, 0, 0, 1]],
    _track: "redglitch",
  }
});
_customEvents.push({
  _time: beat + 0.5,
  _type: "AnimateTrack",
  _data: {
    _duration: 0.5,
    _dissolveArrow: [[2, 0], [2, 0.24], [0, 0.25], [0, 0.49], [1, 0.5], [1, 0.74], [0, 0.75], [0, 0.99], [1, 1]],
    _track: "redglitch",
  }
});
_customEvents.push({
  _time: beat,
  _type: "AnimateTrack",
  _data: {
    _duration: 0.5,
    _position: [[-2, 0, 4, 0], [-2, 0, 4, 0.24], [2, 0, 2, 0.25], [2, 0, 2, 0.49], [0, 0, 4, 0.5], [0, 0, 4, 0.74], [1, -0.5, 2, 0.75], [1, -0.5, 2, 0.99], [0, 0, 0, 1]],
    _track: "blueglitch",
  }
});
_customEvents.push({
  _time: beat + 0.5,
  _type: "AnimateTrack",
  _data: {
    _duration: 0.5,
    _dissolve: [[1,0]],
    _dissolveArrow: [[2, 0], [2, 0.24], [0, 0.25], [0, 0.49], [1, 0.5], [1, 0.74], [0, 0.75], [0, 0.99], [1, 1]],
    _track: "blueglitch",
  }
});
}

function glitchPosFunnyInline(beat, endBeat, magnitude, easeing) {
  filterednotes = _notes.filter(n => n._time >= beat && n._time <= endBeat);
  filterednotes.forEach(note => {
    if (note._customData._fake !== true) {
    //note._customData._noteJumpStartBeatOffset = offset;
    note._customData._disableSpawnEffect = true;
    note._customData._animation = {};
    note._customData._animation._dissolve = [[0, 0],[0,0.399], [1,0.4]];
    note._customData._animation._dissolveArrow = [[0, 0]];
    for (let index = 0; index < 1; index++) {
      let notef = JSON.parse(JSON.stringify(note));
      notef._time += 0.01
      notef._customData._fake = true;
      notef._customData._interactable = false;
      notef._customData._animation = {};
      notef._customData._animation._dissolve = [[1, 0],[1,0.399], [0,0.4]];
      notef._customData._animation._dissolveArrow = [[0, 0]];
      if (notef._type == 0) {
        //notef._customData._noteJumpStartBeatOffset = offset;
        notef._customData._track = "redglitch";
        notef._customData._animation._rotation =  [[getRndInteger(-magnitude,magnitude),getRndInteger(-magnitude,magnitude),getRndInteger(-magnitude,magnitude),0.125], [0,0,0,0.375, easeing]];
        notef._customData._animation._localRotation =  [[getRndInteger(-magnitude,magnitude),getRndInteger(-magnitude,magnitude),getRndInteger(-magnitude,magnitude),0.125], [0,0,0,0.375, "easeInOutBack"]];
      }
      if (notef._type == 1) {
        //notef._customData._noteJumpStartBeatOffset = offset;
        notef._customData._track = "blueglitch";
        notef._customData._animation._rotation =  [[getRndInteger(-magnitude,magnitude),getRndInteger(-magnitude,magnitude),getRndInteger(-magnitude,magnitude),0.125], [0,0,0,0.375, easeing]];
        notef._customData._animation._localRotation =  [[getRndInteger(-magnitude,magnitude),getRndInteger(-magnitude,magnitude),getRndInteger(-magnitude,magnitude),0.125], [0,0,0,0.375, "easeInOutBack"]];
      }
       _notes.push(notef);
    }
  }
 }),
_customEvents.push({
  _time: beat,
  _type: "AnimateTrack",
  _data: {
    _duration: 0.5,
    _position: [[0, 0, 0, 0], [-5, 0, -4, 0.14, "easeInBack"], [5, 0, 4, 0.15], [4, 0, 4, 0.24], [-4, 0, 4, 0.25], [-2, 0, 2, 0.49], [0, 0, 4, 0.5], [0, 0, 4, 0.74], [-1, 0.5, 2, 0.75], [-1, 0.5, 2, 0.99], [0, 0, 0, 1]],
    _track: "redglitch",
  }
});
_customEvents.push({
  _time: beat + 0.5,
  _type: "AnimateTrack",
  _data: {
    _duration: 0.5,
    _dissolveArrow: [[2, 0], [2, 0.24], [0, 0.25], [0, 0.49], [1, 0.5], [1, 0.74], [0, 0.75], [0, 0.99], [1, 1]],
    _track: "redglitch",
  }
});
_customEvents.push({
  _time: beat,
  _type: "AnimateTrack",
  _data: {
    _duration: 0.5,
    _position: [[0, 0, 0, 0], [-5, 0, -4, 0.14, "easeInBack"], [5, 0, 4, 0.15], [-2, 0, 4, 0.24], [2, 0, 2, 0.25], [2, 0, 2, 0.49], [0, 0, 4, 0.5], [0, 0, 4, 0.74], [1, -0.5, 2, 0.75], [1, -0.5, 2, 0.99], [0, 0, 0, 1]],
    _track: "blueglitch",
  }
});
_customEvents.push({
  _time: beat + 0.5,
  _type: "AnimateTrack",
  _data: {
    _duration: 0.5,
    _dissolve: [[1,0]],
    _dissolveArrow: [[2, 0], [2, 0.24], [0, 0.25], [0, 0.49], [1, 0.5], [1, 0.74], [0, 0.75], [0, 0.99], [1, 1]],
    _track: "blueglitch",
  }
});
}

function trail(Schurte) {
  filterednotes = notesAt([Schurte]);
  filterednotes.forEach(note => {
    for (let index = 1; index < 32; index++) {
      let n1 = JSON.parse(JSON.stringify(note));
      n1._time += 0.01 * (index * 2);
      n1._customData._track = "ArrowsGlitch2";
      n1._customData._noteJumpStartBeatOffset = -0.4;
      n1._customData._animation = {};
      n1._customData._animation._dissolve = [[0, 0.73], [1, 0.75], [1, 0.8], [0, 0.82, "EaseOutExpo"]];
      n1._customData._animation._dissolveArrow = [[0, 0.3], [0, 0.35], [1, 0.45], [1, 0.5]];
      n1._customData._animation._position = [[0, 0, 0, 0.4], [0, 0, 1.69 * (index * 4.2), 0.5]];
      n1._customData._animation._rotation = [[0, 0, 0, 0.4], [0, -1, -2 * (index * 6.9), 0.5]];
      n1._customData._fake = true;
      n1._customData._interactable = false;
      n1._customData._disableSpawnEffect = true;
      n1._customData._disableNoteGravity = true;
      _notes.push(n1);
    }
});
}
function trailR(Schurte) {
  filterednotes = notesAt([Schurte]);
  filterednotes.forEach(note => {
    for (let index = 1; index < 32; index++) {
      let n1 = JSON.parse(JSON.stringify(note));
      n1._time += 0.01 * (index * 2);
      n1._customData._track = "ArrowsGlitch2";
      n1._customData._noteJumpStartBeatOffset = -0.4;
      n1._customData._animation = {};
      n1._customData._animation._dissolve = [[0, 0.73], [1, 0.75], [1, 0.8], [0, 0.82, "EaseOutExpo"]];
      n1._customData._animation._dissolveArrow = [[0, 0.3], [0, 0.35], [1, 0.45], [1, 0.5]];
      n1._customData._animation._position = [[0, 0, 0, 0.4], [0, 0, 1.69 * (index * 4.2), 0.5]];
      n1._customData._animation._rotation = [[0, 0, 0, 0.4], [0, 1, 2 * (index * 6.9), 0.5]];
      n1._customData._fake = true;
      n1._customData._interactable = false;
      n1._customData._disableSpawnEffect = true;
      n1._customData._disableNoteGravity = true;
      _notes.push(n1);
    }
});
}
function trailS(Schurte) {
  filterednotes = notesAt([Schurte]);
  filterednotes.forEach(note => {
    for (let index = 1; index < 32; index++) {
      let n1 = JSON.parse(JSON.stringify(note));
      n1._time += 0.01 * (index * 2);
      n1._customData._track = "ArrowsGlitch2";
      n1._customData._noteJumpStartBeatOffset = -0.4;
      n1._customData._animation = {};
      n1._customData._animation._dissolve = [[0, 0.73], [1, 0.75], [1, 0.8], [0, 0.82, "EaseOutExpo"]];
      n1._customData._animation._dissolveArrow = [[0, 0.3], [0, 0.35], [1, 0.45], [1, 0.5]];
      n1._customData._animation._position = [[0, 0, 0, 0.4], [0, 0, 1.69 * (index * 4.2), 0.5]];
      //n1._customData._animation._rotation = [[0, 0, 0, 0.4], [0, 1, 2 * (index * 6.9), 0.5]];
      n1._customData._fake = true;
      n1._customData._interactable = false;
      n1._customData._disableSpawnEffect = true;
      n1._customData._disableNoteGravity = true;
      _notes.push(n1);
    }
});
}

function funnySpawnEase(startBeat, endBeat, offset, magnitude, Easing) {
  filterednotes = _notes.filter(n => n._time >= startBeat && n._time <= endBeat);
  filterednotes.forEach(note => {
    if (note._type == 0) {
      note._customData._noteJumpStartBeatOffset = offset;
      note._customData._animation = {}
      note._customData._animation._rotation =  [[getRndInteger(-magnitude,magnitude),getRndInteger(-magnitude,magnitude),getRndInteger(-magnitude,magnitude),0], [0,0,0,0.4, Easing]],
      note._customData._animation._localRotation =  [[getRndInteger(-magnitude*6.9,magnitude*6.9),getRndInteger(-magnitude*6.9,magnitude*6.9),getRndInteger(-magnitude*6.9,magnitude*6.9),0], [0,0,0,0.48, Easing]]
    }
    if (note._type == 1) {
      note._customData._noteJumpStartBeatOffset = offset;
      note._customData._animation = {}
      note._customData._animation._rotation =  [[getRndInteger(-magnitude,magnitude),getRndInteger(-magnitude,magnitude),getRndInteger(-magnitude,magnitude),0], [0,0,0,0.4, Easing]],
      note._customData._animation._localRotation =  [[getRndInteger(-magnitude*6.9,magnitude*6.9),getRndInteger(-magnitude*6.9,magnitude*6.9),getRndInteger(-magnitude*6.9,magnitude*6.9),0], [0,0,0,0.48, Easing]]
  }
});
}

function paul(startBeat, length) {
  filterednotes = notesAt([startBeat]);
  filterednotes.forEach(note => {
    //note._customData._disableNoteGravity = true;
    for (let index = 1; index < (length*16); index++) {
      let n1 = JSON.parse(JSON.stringify(note));
      n1._time += 0.0625 * (index);
      n1._customData._track = "paul";
      n1._customData._animation = {}
      n1._customData._animation._dissolveArrow = [[0,0]];
      n1._customData._animation._scale = [[0.9,0.9,1.2,0]];
      //n1._customData._disableNoteGravity = true;
      _notes.push(n1);
    }
  });
  }
  
  function multiPaul(startBeat, endBeat, length) {
    filterednotes = _notes.filter(n => n._time >= startBeat && n._time <= endBeat)
    filterednotes.forEach(note => {
      //note._customData._disableNoteGravity = true;
      for (let index = 1; index < (length*16); index++) {
        let n1 = JSON.parse(JSON.stringify(note));
        n1._time += 0.0625 * (index);
        n1._customData._track = "paul";
        n1._customData._animation = {}
        n1._customData._animation._dissolveArrow = [[0,0]];
        n1._customData._animation._scale = [[0.9,0.9,1.2,0]];
        //n1._customData._disableNoteGravity = true;
        _notes.push(n1);
      }
    });
  }
  
  function paulSpam(startBeat, endBeat, length) {
    filterednotes = _notes.filter(n => n._time >= startBeat && n._time <= endBeat);
    filterednotes.forEach(note => {
      //note._customData._disableNoteGravity = true;
      for (let index = 1; index < (length*32); index++) {
        let n1 = JSON.parse(JSON.stringify(note));
        n1._time += 0.0375 * (index);
        n1._customData._track = "paul";
        n1._customData._animation = {}
        n1._customData._animation._dissolveArrow = [[0,0]];
        n1._customData._animation._scale = [[0.9,0.9,1.2,0]];
        //n1._customData._disableNoteGravity = true;
        _notes.push(n1);
      }
    });
  }
  
  
  function BombNoteBoom(note, dissolve = true, bombTrack) {
    if (!note._customData) {
      note._customData = {};
    }
    if (!note._customData._animation) {
      note._customData._animation = {};
    }
    let bomb = JSON.parse(JSON.stringify(note)); //done to retain most custom data
    //now its got the offsets n shit
    bomb._type = 3;
    bomb._customData._fake = true;
    bomb._customData._interactable = true;
    bomb._time = bomb._time + 0.05;
    if (dissolve) {
      note._customData._animation._dissolve = [[1, 0], [0, 0]];
      bomb._customData._animation._dissolve = [[1, 0], [1, 0.5], [0, 0.525]];
    }
    if (!bomb._customData._color) {
      switch (note._type) {
        case 0:
          bomb._customData._color = [1, 0, 0];
          break;
        case 1:
          bomb._customData._color = [0, 0, 1];
  
        default:
          break;
      }
    }
    if (bombTrack) {
      bomb._customData._track = bombTrack;
    }
    _notes.push(bomb);
  }
  
  function getRndInteger(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
  }
  
  function offestNJSOnNotesBetween(p1, p2, NJS, offset) {
    filterednotes = _notes.filter(n => n._time >= p1 && n._time <= p2);
    filterednotes.forEach(object => {
      //always worth having.
      //man this shit BETTER not be undefined.
      if (typeof offset !== "undefined") {
        object._customData._noteJumpStartBeatOffset = offset;
        object._customData._noteJumpMovementSpeed = NJS;
      }
    });
    return filterednotes;
  }
  
  function stackHideDir(stackTime, revealTime) {
    let dot;
    let arrow;
    _notes
      .filter(o => o._time == stackTime)
      .forEach(o => {
        o._customData._disableNoteGravity = true;
        if (o._cutDirection == 8) {  
          dot = o;
          if (arrow && arrow._type == o._type)
            dot._cutDirection = arrow._cutDirection
        } else {
          arrow = o;
          if (dot && dot._type == arrow._type)
            dot._cutDirection = arrow._cutDirection
        }
      });
    if (!dot) return
    dot._time += 0.05;
    dot._customData._track = `stackThing${dot._time}`;
    let offset = [0, 0];
    if (!arrow) return 
    //dot._cutDirection = arrow._cutDirection
    switch (arrow._cutDirection) {
      case 0:
        offset = [0, -1];
        break;
      case 1:
        offset = [0, 1];
        break;
      case 2:
        offset = [-1, 0];
        break;
      case 3:
        offset = [1, 0];
        break;
      case 4:
        offset = [1, -1];
        break;
      case 5:
        offset = [-1, -1];
        break;
      case 6:
        offset = [1, 1];
        break;
      case 7:
        offset = [-1, 1];
        break;
      default:
        break;
    }
    _customEvents.push(
      {
        _time: 0,
        _type: "AnimateTrack",
        _data: {
          _position: [[offset[0], offset[1], 0, 0]],
          _track: `stackThing${dot._time}`,
          _dissolve: [[0, 0]],
          _dissolveArrow: [[0, 0]]
        }
      },
      {
        _time: revealTime-0.5,
        _type: "AnimateTrack",
        _data: {
          _position: [[offset[0], offset[1], 0, 0], [0, 0, 0, 0.5, "easeOutExpo"]],
          _scale: [[0.25, 0.25, 1, 0], [1.1, 1.2, 1, 0.5], [1, 1, 1, 1, "easeOutBack"]],
          _track: `stackThing${dot._time}`,
          _dissolve: [[1, 0]],
          _dissolveArrow: [[1, 0]],
          _duration: 1
        }
      }
    );
}
  

function writeText(text, track, time, duration) {
  let arr = text.split("");
  let font = JSON.parse(fs.readFileSync("./font.dat"))._obstacles;
  let offset = 1.5;
  for (let i = 0; i < arr.length; i++) {
    let letter = arr[i];
    font
      .filter(x => x._customData._track == letter)
      .forEach(wall => {
        let workWith = JSON.parse(JSON.stringify(wall));
        workWith._time = time;
        workWith._customData._position[0] += i * offset;
        workWith._customData._track = track;
        workWith._duration = duration;
        workWith._customData._color = [10, 10, 10, -50000];
        workWith._customData._animation = {}
        workWith._customData._animation._position = [[0,0,20,0]];
        workWith._customData._animation._dissolve = [[0,0],[1,0.15,"easeOutQuad"]]
        //workWith._customData._animation._localRotation = [[getRndInteger(-180,180),getRndInteger(-180,180),getRndInteger(-180,180),0, "easeInQuad"], [0,0,0,0.25, "easeOutCubic"], [0,0,0,0.5, "easeOutCubic"], [getRndInteger(-180,180),getRndInteger(-180,180),getRndInteger(-180,180),1, "easeInQuad"]],
        _obstacles.push(workWith);
      });
  }
}

function writeTextObs(text, track, time, duration) {
  let walls = [];
  let arr = text.split("");
  let font = JSON.parse(fs.readFileSync("./font.dat"))._obstacles;
  let offset = 1.5;
  for (let i = 0; i < arr.length; i++) {
    let letter = arr[i];
    font
      .filter(x => x._customData._track == letter)
      .forEach(wall => {
        let workWith = JSON.parse(JSON.stringify(wall));
        workWith._time = time;
        workWith._customData._position[0] += i * offset;
        workWith._customData._track = track;
        workWith._duration = duration;
        workWith._customData._color = [10, 10, 10, -50000];
        walls.push(workWith);
      });
  }
  return walls;
}

function writeTextLetters(text, track, time, duration) {
  let walls = [];
  let arr = text.split("");
  let font = JSON.parse(fs.readFileSync("./font.dat"))._obstacles;
  let offset = 1.5;
  for (let i = 0; i < arr.length; i++) {
    let letter = arr[i];
    walls[i] = [];
    font
      .filter(x => x._customData._track == letter)
      .forEach(wall => {
        let workWith = JSON.parse(JSON.stringify(wall));
        workWith._time = time;
        workWith._customData._position[0] += i * offset;
        workWith._customData._track = track;
        workWith._duration = duration;
        workWith._customData._color = [10, 10, 10, -50000];
        walls[i].push(workWith);
      });
  }
  return walls;
}

// Multiplies position values by Noodle Unit conversion
const noodleUnitConvert = (1.0/0.6)
function convertEnvironmentFromNoodleUnits() {
  _environment.forEach((env) => {
    if (env._position) {
      env._position[0] *= noodleUnitConvert
      env._position[1] *= noodleUnitConvert
      env._position[2] *= noodleUnitConvert
    }
    if (env._localPosition) {
      env._localPosition[0] *= noodleUnitConvert
      env._localPosition[1] *= noodleUnitConvert
      env._localPosition[2] *= noodleUnitConvert
    }
  })
}

function Space(Start, End, trackR, trackB, amount) {
  filterednotes = _notes.filter(n => n._time >= Start && n._time < End);
  filterednotes.forEach(note => {
    if (note._customData._disableNoteGravity != true) {
    if (note._type == 0) {
      note._customData._track = trackR;
    }
    if (note._type == 1) {
      note._customData._track = trackB;
    }
    note._customData._noteJumpStartBeatOffset = 10;
    note._customData._noteJumpMovementSpeed = 16;
    note._customData._animation = {};
    note._customData._animation._position = [[0, getRndInteger(-15, 10), 0, 0], [0, 0, 0, 0.48, "easeInOutQuart"]];
    note._customData._animation._rotation = [[getRndInteger(-15, 8), getRndInteger(-10, 10), getRndInteger(-10, 10), 0], [0, 0, 0, 0.5, "easeInOutQuad"]];
    note._customData._animation._localRotation = [[getRndInteger(-120,120),getRndInteger(-120,120),getRndInteger(-120,120),0], [0,0,0,0.5, "easeInOutQuad"]],
    note._customData._animation._dissolve = [[0,0.35], [1,0.5, "easeOutSine"]]
    note._customData._animation._dissolveArrow = [[0,0], [1,0.15]];
    note._customData._disableSpawnEffect = true;
    note._customData._disableNoteGravity = true;
    for (let index = 1; index < amount*2; index++) {
      let n1 = JSON.parse(JSON.stringify(note));
      n1._time += 1*(index*0.666);
      if (note._type == 0) {
        n1._customData._track = trackR;
      }
      if (note._type == 1) {
        n1._customData._track = trackB;
      }
      n1._customData._noteJumpStartBeatOffset = 12;
      n1._customData._noteJumpMovementSpeed = 16 + (index*2.69);
      n1._customData._animation = {};
      n1._customData._animation._position = [[5 * index, getRndInteger(-25, 25), getRndInteger(-20, 20), 0], [2.5 * index, getRndInteger(-12, 15), 50, 1]];
      n1._customData._animation._rotation = [[getRndInteger(-25, 25), getRndInteger(-25, 25), getRndInteger(-25, 25), 0], [getRndInteger(-20, 20), getRndInteger(-20, 20), getRndInteger(-20, 20), 1, "easeInOutBack"]];
      n1._customData._animation._localRotation = [[getRndInteger(-90,90),getRndInteger(-90,90),getRndInteger(-90,90),0], [getRndInteger(-10,10),getRndInteger(-10,10),getRndInteger(-10,10),1, "easeInOutBack"]];
      n1._customData._animation._dissolve = [[0,0]];
      n1._customData._animation._dissolveArrow = [[0,0], [1,0.15]];
      n1._customData._fake = true;
      n1._customData._interactable = false;
      n1._customData._disableSpawnEffect = true;
      n1._customData._disableNoteGravity = true;
      _notes.push(n1);
    }
    for (let index2 = 1; index2 < amount*2 ; index2++) {
      let n1 = JSON.parse(JSON.stringify(note));
      n1._time += 1*(index2*0.69);
      n1._customData._noteJumpStartBeatOffset = 12;
      n1._customData._noteJumpMovementSpeed = 16 + (index2*2.69);
      n1._customData._animation = {};
      n1._customData._animation._position = [[-5 * index2, getRndInteger(-25, 25), getRndInteger(-20, 20), 0], [-2.5 * index2, getRndInteger(-12, 15), 50, 1]];
      n1._customData._animation._rotation = [[getRndInteger(-25, 15), getRndInteger(-25, 25), getRndInteger(-25, 25), 0], [getRndInteger(-15, 15), getRndInteger(-15, 15), getRndInteger(-15, 15), 1]];
      n1._customData._animation._localRotation = [[getRndInteger(-90,90),getRndInteger(-90,90),getRndInteger(-90,90),0], [getRndInteger(-10,10),getRndInteger(-10,10),getRndInteger(-10,10),1, "easeInOutBack"]];
      n1._customData._animation._dissolve = [[0,0]];
      n1._customData._animation._dissolveArrow = [[0,0], [1,0.15]];
      n1._customData._fake = true;
      n1._customData._interactable = false;
      n1._customData._disableSpawnEffect = true;
      n1._customData._disableNoteGravity = true;
      if (note._type == 0) {
        n1._customData._track = trackR;
      }
      if (note._type == 1) {
        n1._customData._track = trackB;
      }
      _notes.push(n1);
    }
  }
  });
}

function outerSpace(Start, End, amount) {
  filterednotes = _notes.filter(n => n._time >= Start && n._time < End);
  filterednotes.forEach(note => {
    if (note._customData._fake != true) {
    for (let index = 1; index < amount*2; index++) {
      let n1 = JSON.parse(JSON.stringify(note));
      n1._time += 2*(index*0.666);
      n1._customData._noteJumpStartBeatOffset = 15;
      n1._customData._noteJumpMovementSpeed = 22 + (index*2.69);
      n1._customData._animation = {};
      n1._customData._animation._position = [[45 * index, getRndInteger(-69, 69), 120, 0], [-20 * index, getRndInteger(-50, 50), 60, 1, "easeInOutBack"]];
      n1._customData._animation._rotation = [[getRndInteger(-90, 90), getRndInteger(-90, 90), getRndInteger(-90, 90), 0], [getRndInteger(-90, 90), getRndInteger(-90, 90), getRndInteger(-90, 90), 1, "easeInOutBounce"]];
      n1._customData._animation._localRotation = [[getRndInteger(-90,90),getRndInteger(-90,90),getRndInteger(-90,90),0], [getRndInteger(-90,90),getRndInteger(-90,90),getRndInteger(-90,90),1, "easeInOutBack"]];
      n1._customData._animation._scale = [[25,25,0,0]];
      n1._customData._animation._dissolve = [[0,0]];
      n1._customData._animation._dissolveArrow = [[0,0], [1,0.25, "easeOutCubic"], [1,1]];
      n1._customData._fake = true;
      n1._customData._interactable = false;
      n1._customData._disableSpawnEffect = true;
      n1._customData._disableNoteGravity = true;
      if (n1._cutDirection == 0 && typeof "up" !== "undefined") {
        n1._customData._track = "upA";
      }
      if (n1._cutDirection == 1 && typeof "up" !== "undefined") {
        n1._customData._track = "downA";
      }
      if (n1._cutDirection == 2 && typeof "up" !== "undefined") {
        n1._customData._track = "leftA";
      }
      if (n1._cutDirection == 3 && typeof "up" !== "undefined") {
        n1._customData._track = "rightA";
      }
      _notes.push(n1);
    }
    for (let index2 = 1; index2 < amount*2 ; index2++) {
      let n1 = JSON.parse(JSON.stringify(note));
      n1._time += 2*(index2*0.69);
      n1._customData._noteJumpStartBeatOffset = 15;
      n1._customData._noteJumpMovementSpeed = 22 + (index2*2.69);
      n1._customData._animation = {};
      n1._customData._animation._position = [[-45 * index2, getRndInteger(-69, 69), 120, 0], [20 * index2, getRndInteger(-50, 50), 60, 1, "easeInOutBack"]];
      n1._customData._animation._rotation = [[getRndInteger(-90, 90), getRndInteger(-90, 90), getRndInteger(-90, 90), 0], [getRndInteger(-90, 90), getRndInteger(-90, 90), getRndInteger(-90, 90), 1, "easeInOutBounce"]];
      n1._customData._animation._localRotation = [[getRndInteger(-90,90),getRndInteger(-90,90),getRndInteger(-90,90),0], [getRndInteger(-90,90),getRndInteger(-90,90),getRndInteger(-90,90),1, "easeInOutBack"]];
      n1._customData._animation._scale = [[25,25,0,0]];
      n1._customData._animation._dissolve = [[0,0]];
      n1._customData._animation._dissolveArrow = [[0,0], [1,0.25, "easeOutCubic"], [1,1]];
      n1._customData._fake = true;
      n1._customData._interactable = false;
      n1._customData._disableSpawnEffect = true;
      n1._customData._disableNoteGravity = true;
      if (n1._cutDirection == 0 && typeof "up" !== "undefined") {
        n1._customData._track = "upA";
      }
      if (n1._cutDirection == 1 && typeof "up" !== "undefined") {
        n1._customData._track = "downA";
      }
      if (n1._cutDirection == 2 && typeof "up" !== "undefined") {
        n1._customData._track = "leftA";
      }
      if (n1._cutDirection == 3 && typeof "up" !== "undefined") {
        n1._customData._track = "rightA";
      }
      _notes.push(n1);
    }
  }
  });
}

function trackOnNotesBetweenIndexSep(trackLane1, trackLane2, trackLane3, trackLane4, p1, p2, potentialOffset) {
  filterednotes = _notes.filter(n => n._time >= p1 && n._time <= p2);
  filterednotes.forEach(object => {
    if (typeof potentialOffset !== "undefined") {
      object._customData._noteJumpStartBeatOffset = potentialOffset;
    }
    if (object._lineIndex == 0) {
      object._customData._track = trackLane1;
    }
    if (object._lineIndex == 1) {
      object._customData._track = trackLane2;
    }
    if (object._lineIndex == 2) {
      object._customData._track = trackLane3;
    }
    if (object._lineIndex == 3) {
      object._customData._track = trackLane4;
    }
  });
  return filterednotes;
}



//#endregion








//#region BASIC EXAMPLES   -  -  -  -  -  -  -  -  -  -  -  -  -  use these as a copy/paste template for the lazy   -  -  -  -  -  -  -  -  -  -  -  -  -  
/*

_pointDefinitions.push({
  _name: "buildupshake2",
  _points: DecayShakePath(0.5, 0, 0, 50)
});

filterednotes = notesAt([insert specific note time/beat here]);
filterednotes.forEach(note => {
  note._customData._noteJumpStartBeatOffset = -0.1;       // tbh I only really use this for NJS/offset changes and to remove the spawn effect.
  note._customData._noteJumpMovementSpeed = 17;       
  note._customData._animation = {}
  note._customData._animation._rotation = [[-90, 0, 0, 0],[0,0,0,0.5,"easeOutElastic"]];     // feel free to use any of the other animation properties from the github --- these will add each animation on a per note basis
});

filterednotes = _notes.filter(n => n._time >= 69 && n._time <= 420);
filterednotes.forEach(note => {
  note._customData._track = "dumb track name here";
  note._customData._noteJumpStartBeatOffset = 69;
  note._customData._noteJumpMovementSpeed = 420;
});



trackOnNotesBetween("dumb track name here", start beat here, end beat here, offset here);         // ---- function calling example - use these when possible to get rid of clutter and make life easier

filterednotes = _notes.filter(n => n._time >= 69 && n._time <= 420);
filterednotes.forEach(note => {
  note._customData._track = "dumb track name here";
  note._customData._noteJumpStartBeatOffset = 666;
  note._customData._noteJumpMovementSpeed = 777;
  note._customData._fake = true;
  note._customData._disableSpawnEffect = true      // NOTE: removing spawn effect will scuff practice mode if you try and play at a section or track with a note already spawnd that has this property set to true - you need to start playing before these spawn in
});



//use this to push track animations - path animations, track parenting, assigning player to track, etc.
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

// you can string together multiple thingies by adding a comma after ""}"" and slapping in another {} thingy - like so

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
}, {
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



// alternates beats --- don't use this - it's kinda shit one time use but you get the idea maybe idk
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
//#endregion


//#region                       -  -  -  -  -  -  -  -  -  -  -  -  -  DO YOUR DIRTY WORK HERE  -  -  -  -  -  -  -  -  -  -  -  -  -

//#region Environment Stuff

/*
_environment.push({
  _id: "ID",//put that shit here or something idk
  _lookupMethod: "Exact",
  _track: "track name here",
  _active: true //or false
});

  //other stuff
  "_scale": [x, y, z] (float) Sets scale of GameObject.
  "_position": [x, y, z] (float) Sets position of GameObject.
  "_localPosition": [x, y, z] (float) Sets localPosition of GameObject.
  "_rotation": [x, y, z] (float) Sets rotation of GameObject.
  "_localRotation": [x, y, z] (float) Sets localRotation of GameObject.
*/ 
  

// Note: This way of doing a lookup is cringe and not based. 
// simply putting "PanelsTrackLaneRings$" would do the same thing.

_environment.push({
  _id: "^DragonsEnvironment.\\[0\\]Environment.\\[12\\]PanelsTrackLaneRings$",
  _lookupMethod: "Regex",
  _active: true,
});


_environment.push({
  _id: "^DragonsEnvironment.\\[0\\]Environment.\\[5\\]HallConstruction$",
  _lookupMethod: "Regex",
  _active: true, 
  _track: "hallCon",
  _localPosition: [0,10,-3],
  _scale: [1.5,1.5,1.5]
});

_environment.push({
  _id: "^DragonsEnvironment.\\[0\\]Environment.\\[6\\]Underground$",
  _lookupMethod: "Regex",
  _active: false, 
  _track: "underg",
  _scale: [15,15,15],
  _position: [0,20,0]
});

_environment.push({
  _id: "BigSmokePS",
  _lookupMethod: "Contains",
  _active: true, 
  _scale: [4.20,4.20,4.20],
},{
  _id: "BigSmokePS",
  _lookupMethod: "Contains",
  _active: true, 
  _duplicate: 1,
  _scale: [6.9,6.9,6.9],
});

_environment.push({
  _id: "DragonsSidePSL",
  _lookupMethod: "Contains",
  _active: true, 
  _position: [-14.5*1.65,14.*1.65,35*1.65],
  _scale: [1.5,1,1],
  _localEuler: [42,90,270],
}, {
  _id: "DragonsSidePSL",
  _lookupMethod: "Contains",
  _active: true, 
  _duplicate: 1,
  _position: [14.5*1.65,-9.5*1.65,35*1.65],
  _scale: [1.5,1,1],
  _localEuler: [42,90,270],
});

_environment.push({
  _id: "DragonsSidePSR",
  _lookupMethod: "Contains",
  _active: true, 
  _localPosition: [14.5*1.65,14.5*1.65,35*1.65],
  _scale: [1.5,1,1],
  _localEuler: [318,90,270],
}, {
  _id: "DragonsSidePSR",
  _lookupMethod: "Contains",
  _active: true, 
  _duplicate: 1,
  _localPosition: [-14.5*1.65,-9.5*1.65,35*1.65],
  _scale: [1.5,1,1],
  _localEuler: [42,270,90],
});

_environment.push({
  _id: "Spectrograms",
  _lookupMethod: "Contains",
  _active: false, 
});

_environment.push({
  _id: "TrackMirror",
  _lookupMethod: "Contains",
  _active: true,
  _track: "TrackMirror"
});

_environment.push({
  _id: "TrackConstruction",
  _lookupMethod: "Contains",
  _active: true,
  _track: "TrackConstruction"
});


// Note: `_environment.push({` doesn't need to be repeated every time, all of these could have been joined into one statement like so:

//_environment.push({
//  _id: "Spectrograms",
//  _lookupMethod: "Contains",
//  _active: false, 
//},{
//  _id: "TrackMirror",
//  _lookupMethod: "Contains",
//  _active: true,
//  _track: "TrackMirror"
//},{
//  _id: "TrackConstruction",
//  _lookupMethod: "Contains",
//  _active: true,
//  _track: "TrackConstruction"
//});



//#endregion



 
//#region intro 10

filterednotes = _notes.filter(n => n._time >= 10 && n._time < 46); 
  filterednotes.forEach(note => { 
    note._customData._noteJumpStartBeatOffset = 5;
    note._customData._noteJumpMovementSpeed = 12;
    note._customData._disableSpawnEffect = true;
    note._customData._disableNoteGravity = true;
    note._customData._animation = {}
    if (note._lineIndex == 0) {
      note._customData._animation._position = [[1.5,0,0,0.25], [0,0,0,0.48, "easeInOutQuart"]];
    }
    if (note._lineIndex == 1) {
      note._customData._animation._position = [[0.5,0,0,0.25], [0,0,0,0.48, "easeInOutQuint"]];
    }
    if (note._lineIndex == 2) {
      note._customData._animation._position = [[-0.5,0,0,0.25], [0,0,0,0.48, "easeInOutQuint"]];
    }
    if (note._lineIndex == 3) {
      note._customData._animation._position = [[-1.5,0,0,0.25], [0,0,0,0.48, "easeInOutQuart"]];
    }
}); 






//#endregion

//#region build 46
filterednotes = _notes.filter(n => n._time >= 46 && n._time <= 77); 
  filterednotes.forEach(note => { 
    note._customData._noteJumpStartBeatOffset = 2.5;
    note._customData._noteJumpMovementSpeed = 17; 
    note._customData._disableSpawnEffect = true;
    note._customData._animation = {}
    for (let index = 46-45; index <= 77-45; index++) {
    if (note._lineIndex == 0) {
      note._customData._animation._position = [[1.5,0,0,0.05], [0,0,0,0.45, "easeInOutQuart"]];
    }
    if (note._lineIndex == 1) {
      note._customData._animation._position = [[0.5,0,0,0.05], [0,0,0,0.45, "easeInOutQuint"]];
    }
    if (note._lineIndex == 2) {
      note._customData._animation._position = [[-0.5,0,0,0.05], [0,0,0,0.45, "easeInOutQuint"]];
    }
    if (note._lineIndex == 3) {
      note._customData._animation._position = [[-1.5,0,0,0.05], [0,0,0,0.45, "easeInOutQuart"]];
    }
  }
}); 







//#endregion

//#region drop 1 82
filterednotes = _notes.filter(n => n._time >= 82 && n._time <= 137);
filterednotes.forEach(note => {
note._customData._disableNoteGravity = true
});
trackOnNotesBetweenIndexSep("d1","d2","d3","d4",82,113.75,2)
trackOnNotesBetweenIndexSep("d1","d2","d3","d4",114,137,1)
for (let index = 82; index < 114; index+=2) {
 noteSlide(index,114,"d1", 2,0.5,getRndInteger(0,3),0,getRndInteger(-6.9,-3))
 noteSlide(index,114,"d3", 2,0.5,getRndInteger(-1,2),0,getRndInteger(-6.9,-3))
 noteSlide(index,114,"d2", 2,0.5,getRndInteger(-2,1),0,getRndInteger(-6.9,-3))
 noteSlide(index,114,"d4", 2,0.5,getRndInteger(-3,0),0,getRndInteger(-6.9,-3))
}
for (let index = 114; index < 137; index+=2) {
  noteSlide(index,137,"d1", 2,0.5,getRndInteger(0,3),0,getRndInteger(-3,-1))
  noteSlide(index,137,"d3", 2,0.5,getRndInteger(-1,2),0,getRndInteger(-3,-1))
  noteSlide(index,137,"d2", 2,0.5,getRndInteger(-2,1),0,getRndInteger(-3,-1))
  noteSlide(index,137,"d4", 2,0.5,getRndInteger(-3,0),0,getRndInteger(-3,-1))
}
 

noteScale(114,128,"d1", 2,1,1.35)
noteScale(113,128,"d2", 2,1,1.35)
noteScale(113,128,"d3", 2,1,1.35)
noteScale(114,128,"d4", 2,1,1.35)
noteScale(131,137,"d1", 2,1,1.5)
noteScale(130,137,"d2", 2,1,1.5)
noteScale(130,137,"d3", 2,1,1.5)
noteScale(131,137,"d4", 2,1,1.5)

// Note: Using fuctions for repeating stuff like this is no longer required. 
// There is a newer feature that was recenetly added called `repeat` (`_repeat` in v2)
// `repeat` does exactly what you think it does. Read the documentation for more info on it here: https://github.com/Aeroluna/Heck/wiki/Animation#animatetrack

glitchPos(138, 139.5)
glitchPosFunny(140, 141.75, 2, 0, "easeOutExpo")
glitchPosFunny(142, 146,5,0,"easeOutElastic")

//#region lanes 147

filterednotes = _notes.filter(n => n._time >= 147 && n._time <= 174);
filterednotes.forEach(note => {
 note._customData._noteJumpStartBeatOffset = 2
 note._customData._noteJumpMovementSpeed = 18
 note._customData._disableSpawnEffect = true;
 note._customData._disableNoteGravity = true;
 note._customData._animation = {}
 note._customData._animation._dissolve = [[0,0]];
 note._customData._animation._dissolveArrow = [[0,0]];
  let n1 = JSON.parse(JSON.stringify(note));
  n1._time += 0.01;
  if (n1._lineIndex == 0) {
    n1._customData._track = "l1";
  }
  if (n1._lineIndex == 1) {
    n1._customData._track = "l2";
  }
  if (n1._lineIndex == 2) {
    n1._customData._track = "l3";
  }
  if (n1._lineIndex == 3) {
    n1._customData._track = "l4";
  }
  n1._customData._animation = {}
  n1._customData._noteJumpStartBeatOffset = 2
  n1._customData._noteJumpMovementSpeed = 18
  n1._customData._fake = true;
  n1._customData._interactable = false;
  //n1._customData._disableSpawnEffect = true;
  //n1._customData._disableNoteGravity = true;
  _notes.push(n1);
  let n2 = JSON.parse(JSON.stringify(n1));
  n2._time -= 0.01;
  if (n2._lineIndex == 0) {
    n2._customData._track = "la1";
  }
  if (n2._lineIndex == 1) {
    n2._customData._track = "la2";
  }
  if (n2._lineIndex == 2) {
    n2._customData._track = "la3";
  }
  if (n2._lineIndex == 3) {
    n2._customData._track = "la4";
  }
  n2._customData._animation = {}
  n2._customData._noteJumpStartBeatOffset = 2
  n2._customData._noteJumpMovementSpeed = 18
  n2._customData._fake = true;
  n2._customData._interactable = false;
  //n2._customData._disableSpawnEffect = true;
  //n1._customData._disableNoteGravity = true;
  _notes.push(n2);
});

filterednotes = _notes.filter(n => n._time >= 180 && n._time <= 210);
filterednotes.forEach(note => {
 note._customData._noteJumpStartBeatOffset = 2
 note._customData._noteJumpMovementSpeed = 18
 note._customData._disableNoteGravity = true;
 note._customData._animation = {}
 note._customData._animation._dissolve = [[0,0]];
 note._customData._animation._dissolveArrow = [[0,0]];
  let n1 = JSON.parse(JSON.stringify(note));
  n1._time += 0.01;
  if (n1._lineIndex == 0) {
    n1._customData._track = "l1";
  }
  if (n1._lineIndex == 1) {
    n1._customData._track = "l2";
  }
  if (n1._lineIndex == 2) {
    n1._customData._track = "l3";
  }
  if (n1._lineIndex == 3) {
    n1._customData._track = "l4";
  }
  n1._customData._animation = {}
  n1._customData._noteJumpStartBeatOffset = 2
  n1._customData._noteJumpMovementSpeed = 18
  n1._customData._fake = true;
  n1._customData._interactable = false;
  //n1._customData._disableSpawnEffect = true;
  //n1._customData._disableNoteGravity = true;
  _notes.push(n1);
  let n2 = JSON.parse(JSON.stringify(n1));
  n2._time -= 0.01;
  if (n2._lineIndex == 0) {
    n2._customData._track = "la1";
  }
  if (n2._lineIndex == 1) {
    n2._customData._track = "la2";
  }
  if (n2._lineIndex == 2) {
    n2._customData._track = "la3";
  }
  if (n2._lineIndex == 3) {
    n2._customData._track = "la4";
  }
  n2._customData._animation = {}
  n2._customData._noteJumpStartBeatOffset = 2
  n2._customData._noteJumpMovementSpeed = 18
  n2._customData._fake = true;
  n2._customData._interactable = false;
  //n2._customData._disableSpawnEffect = true;
  //n1._customData._disableNoteGravity = true;
  _notes.push(n2);
});

for (let index = 146; index < 210; index+=1) {
  laneFlashB(index,210,"l1", 1,1)
  laneFlashB(index,210,"l2", 1,1)
  laneFlashB(index,210,"l3", 1,1)
  laneFlashB(index,210,"l4", 1,1)
}

for (let index = 146; index < 210; index+=1) {
  laneFlashA(index,210,"la1", 1,1)
  laneFlashA(index,210,"la2", 1,1)
  laneFlashA(index,210,"la3", 1,1)
  laneFlashA(index,210,"la4", 1,1)
}

glitchPosFunny(176,178,2,0.25,"easeInOutElastic")

function laneWiggleA(startBeat, endBeat, track, interval, duration, amntX, amntY, amntZ) {
  for (let i = 0; i < endBeat - startBeat; i += interval) {
    let currentBeat = startBeat + i;
    _customEvents.push({
      _time: currentBeat,
      _type: "AnimateTrack",
      _data: {
        _track: track,
        _duration: duration,
        _position: [[amntX,amntY,amntZ,0], [0,0,0,0.25, "easeInOutExpo"], [0,0,0,0.49],[-amntX,-amntY,-amntZ,0.5], [0,0,0,0.75, "easeInOutExpo"]]
      }
    });
  }
}

function laneWiggleA2(startBeat, endBeat, track, interval, duration, amntX, amntY, amntZ) {
  for (let i = 0; i < endBeat - startBeat; i += interval) {
    let currentBeat = startBeat + i;
    _customEvents.push({
      _time: currentBeat,
      _type: "AnimateTrack",
      _data: {
        _track: track,
        _duration: duration,
        _position: [[amntX,amntY,amntZ,0], [0,0,0,0.25, "easeInOutBack"], [0,0,0,0.49],[-amntX,-amntY,-amntZ,0.5], [0,0,0,0.75, "easeInOutBack"]]
      }
    });
  }
}

for (let index = 146; index < 210; index+=2) {
  laneWiggleA(index,210,"l1", 2,2,-1,0,0)
  laneWiggleA(index,210,"l2", 2,2,1,0,0)
  laneWiggleA(index,210,"l3", 2,2,-1,0,0)
  laneWiggleA(index,210,"l4", 2,2,1,0,0)
}
for (let index = 146; index < 210; index+=2) {
  laneWiggleA2(index+1,210,"la1", 2,2,1,0,0)
  laneWiggleA2(index,210,"la2", 2,2,-1,0,0)
  laneWiggleA2(index+1,210,"la3", 2,2,1,0,0)
  laneWiggleA2(index,210,"la4", 2,2,-1,0,0)
}



//#endregion 

//#region inlines 212
offestNJSOnNotesBetween(212,264,18,1.5)
offestOnNotesBetweenRBSepG(212, 213.75, 6,6)
offestOnNotesBetweenRBSepG(214, 215.75, 6,1.5)
offestOnNotesBetweenRBSepG(220, 223.75, 6,6)
offestOnNotesBetweenRBSepG(228, 229.75, 6,6)
offestOnNotesBetweenRBSepG(230, 231.75, 6,1.5)
offestOnNotesBetweenRBSepG(234, 235.75, 0,1)
offestOnNotesBetweenRBSepG(239, 241.75, 1,0)
offestOnNotesBetweenRBSepG(244, 245.75, 6,6)
offestOnNotesBetweenRBSepG(246, 247.75, 6,1.5)
offestOnNotesBetweenRBSepG(252, 255.75, 6,6)
offestOnNotesBetweenRBSepG(260, 261.75, 6,6)
offestOnNotesBetweenRBSepG(262, 263.75, 6,1.5)


function laneWiggle(startBeat, endBeat, track, interval, duration, amntX, amntY, amntZ) {
  for (let i = 0; i < endBeat - startBeat; i += interval) {
    let currentBeat = startBeat + i;
    _customEvents.push({
      _time: currentBeat,
      _type: "AnimateTrack",
      _data: {
        _track: track,
        _duration: duration,
        _position: [[amntX,amntY,amntZ,0], [0,0,0,0.25, "easeOutElastic"], [0,0,0,0.49],[-amntX,-amntY,-amntZ,0.5], [0,0,0,0.75, "easeOutElastic"]]
      }
    });
  }
}




filterednotes = _notes.filter(n => n._time >= 212 && n._time < 260);
filterednotes.forEach(note => {
  note._customData._animation = {}
  note._customData._animation._dissolveArrow = [[0,0]];
  let object = JSON.parse(JSON.stringify(note));
  object._time -= 0.01;
  object._customData._fake = true;
  object._customData._interactable = false;
  object._customData._animation = {}
  object._customData._animation._dissolve = [[0,0]];
  object._customData._animation._dissolveArrow = [[0,0.125], [1,0.375,"easeInOutBounce"], [1,0.47], [0,0.485]];
  if (object._cutDirection == 0 && typeof "up" !== "undefined") {
    object._customData._track = "up";
  }
  if (object._cutDirection == 1 && typeof "up" !== "undefined") {
    object._customData._track = "down";
  }
  if (object._cutDirection == 2 && typeof "up" !== "undefined") {
    object._customData._track = "left";
  }
  if (object._cutDirection == 3 && typeof "up" !== "undefined") {
    object._customData._track = "right";
  }
  _notes.push(object);
});

glitchPosFunnyInline(233, 235.5, 5, "easeOutElastic")
glitchPosFunnyInline(236, 237.75, 10, "easeOutElastic")

filterednotes = _notes.filter(n => n._time >= 260 && n._time <= 263);
filterednotes.forEach(note => {
  note._customData._animation = {}
  note._customData._animation._dissolveArrow = [[0,0]];
  //note._customData._animation._position = [[-0.5,0,0,0]]
  let object = JSON.parse(JSON.stringify(note));
  object._time -= 0.01;
  object._customData._fake = true;
  object._customData._interactable = false;
  object._customData._animation = {}
  //object._customData._animation._position = [[-0.5,0,0,0]]
  object._customData._animation._dissolveArrow = [[0,0.125], [1,0.375,"easeInOutBounce"], [1,0.47], [0,0.485]];
  object._customData._animation._dissolve = [[0,0]];
  if (object._cutDirection == 0 && typeof "up" !== "undefined") {
    object._customData._track = "up";
  }
  if (object._cutDirection == 1 && typeof "up" !== "undefined") {
    object._customData._track = "down";
  }
  if (object._cutDirection == 2 && typeof "up" !== "undefined") {
    object._customData._track = "left";
  }
  if (object._cutDirection == 3 && typeof "up" !== "undefined") {
    object._customData._track = "right";
  }
  _notes.push(object);
});

trail(210)
glitchPosFunnyInline(210,215,6.9, "easeInOutBack")
trailR(218)
glitchPosFunnyInline(218,224,6.9, "easeInOutBack")
trail(226)
glitchPosFunnyInline(226,231,6.9, "easeInOutBack")
trailS(238)
trailS(240)
glitchPos(238, 241.5)
glitchPosFunnyInline(242,247,6.9, "easeInOutBack")
trailR(242)
glitchPosFunnyInline(250,255.75,6.9, "easeInOutBack")
trail(250)
glitchPosFunnyInline(258,263,6.9, "easeInOutBack")
trail(258)
filterednotes = notesAt([273.5]);
filterednotes.forEach(note => {
  for (let index = 1; index < 30; index++) {
    let n1 = JSON.parse(JSON.stringify(note));
    n1._time += 0.05 * (index * 2);
    n1._customData._track = "ArrowsGlitch2";
    n1._customData._noteJumpStartBeatOffset = -0.4;
    n1._customData._animation = {};
    n1._customData._animation._dissolve = [[0, 0.73], [1, 0.75], [1, 0.8], [0, 0.82, "EaseOutExpo"]];
    n1._customData._animation._dissolveArrow = [[0, 0.3], [0, 0.35], [1, 0.45], [1, 0.5]];
    n1._customData._animation._position = [[0, 0, 0, 0.4], [0, 0, 1.69 * (index * 4.2), 0.5]];
    n1._customData._animation._scale = [[0, 0, 0, 0.4], [index, index, index, 0.5,"easeInBounce"]];
    n1._customData._fake = true;
    n1._customData._interactable = false;
    n1._customData._disableSpawnEffect = true;
    n1._customData._disableNoteGravity = true;
    _notes.push(n1);
  }
});
filterednotes = notesAt([273.75]);
filterednotes.forEach(note => {
  for (let index = 1; index < 30; index++) {
    let n1 = JSON.parse(JSON.stringify(note));
    n1._time += 0.05 * (index * 2);
    n1._customData._track = "ArrowsGlitch2";
    n1._customData._noteJumpStartBeatOffset = -0.4;
    n1._customData._animation = {};
    n1._customData._animation._dissolve = [[0, 0.73], [1, 0.75], [1, 0.8], [0, 0.82, "EaseOutExpo"]];
    n1._customData._animation._dissolveArrow = [[0, 0.3], [0, 0.35], [1, 0.45], [1, 0.5]];
    n1._customData._animation._position = [[0, 0, 0, 0.4], [0, 0, 1.69 * (index * 4.2), 0.5]];
    n1._customData._animation._scale = [[0, 0, 0, 0.4], [index, index, index, 0.5,"easeInBounce"]];
    n1._customData._fake = true;
    n1._customData._interactable = false;
    n1._customData._disableSpawnEffect = true;
    n1._customData._disableNoteGravity = true;
    _notes.push(n1);
  }
});

function ohYes(beat, amt){
filterednotes = notesAt([beat]);
filterednotes.forEach(note => {
  for (let index = 1; index < amt; index++) {
    let n1 = JSON.parse(JSON.stringify(note));
    n1._time += 0.05 * (index * 2);
    n1._customData._track = "ArrowsGlitch2";
    n1._customData._noteJumpStartBeatOffset = -0.4;
    n1._customData._animation = {};
    n1._customData._animation._dissolve = [[0, 0.73], [1, 0.75], [1, 0.8], [0, 0.82, "EaseOutExpo"]];
    n1._customData._animation._dissolveArrow = [[0, 0.3], [0, 0.35], [1, 0.45], [1, 0.5]];
    n1._customData._animation._position = [[0, 0, 0, 0.4], [0, 0, 1.69 * (index * 4.2), 0.5]];
    n1._customData._animation._scale = [[0, 0, 0, 0.5], [index, index, index, 1,"easeOutExpo"]];
    n1._customData._fake = true;
    n1._customData._interactable = false;
    n1._customData._disableSpawnEffect = true;
    n1._customData._disableNoteGravity = true;
    _notes.push(n1);
  }
});
}

/*
ohYes(278,30)
ohYes(282,30)
ohYes(286,30)
ohYes(290,10)
ohYes(292,10)
ohYes(294,10)
ohYes(296,10)
ohYes(298,6.9)
ohYes(299,6.9)
ohYes(300,50)
ohYes(301,50)
*/


glitchPos(266,267.75)
glitchPos(268,269.75)
glitchPosFunny(270,271.75,2,0.5,"easeOutElastic")
glitchPosFunny(272,274,5,0.5,"easeOutElastic")



for (let index = 212; index < 265; index+=16) {
  laneWiggle(index,265,"up", 16,8,-1,0,0)
  laneWiggle(index,265,"down", 16,8,0,1,0)
  laneWiggle(index,265,"left", 16,8,-1,0,0)
  laneWiggle(index,265,"right", 16,8,0,1,0)
}
for (let index = 220; index < 265; index+=16) {
  laneWiggle(index,265,"up", 16,8,0,-1,0)
  laneWiggle(index,265,"down", 16,8,1,0,0)
  laneWiggle(index,265,"left", 16,8,0,-1,0)
  laneWiggle(index,265,"right", 16,8,1,0,0)
}


//#endregion


filterednotes = notesAt([309.75]);
filterednotes.forEach(note => {
  for (let index = 1; index < 69; index++) {
    let n1 = JSON.parse(JSON.stringify(note));
    n1._time += 0.06 * (index * 2);
    n1._customData._noteJumpStartBeatOffset = -0.69;
    n1._customData._animation = {};
    n1._customData._animation._dissolve = [[0, 0.69], [1, 0.75], [1, 0.8], [0, 0.82, "EaseOutExpo"]];
    n1._customData._animation._dissolveArrow = [[0, 0.35], [1, 0.45], [1, 0.69], [0,1,"easeInOutQuad"]];
    n1._customData._animation._position = [[1*(index*0.008), 0, 0, 0.4], [0, 0, 1.420 * (index * 1.69), 0.5]];
    //n1._customData._animation._rotation = [[0, 0, 0, 0.4], [0, 0, 0, 0.5]];
    n1._customData._animation._scale = [[1*(index*0.09), 1*(index*0.09), 1, 0.35], [1*(index*1.5), 1*(index*1.5), 1, 1,"easeOutBounce"]];
    n1._customData._fake = true;
    n1._customData._interactable = false;
    n1._customData._disableSpawnEffect = true;
    n1._customData._disableNoteGravity = true;
    _notes.push(n1);
  }
});


_pointDefinitions.push({
  _name: "FlashyBoiTime",
  _points: [[0.4, 0.1], [0.4, 0.9], [1, 1]]
});

function SFT1(startBeat, endBeat){
  filterednotes = _notes.filter(n => n._time >= startBeat && n._time <= endBeat);
  filterednotes.forEach(note => {
    note._customData._animation = {}
    note._customData._animation._dissolve = [[0,0]];
    for (let index = 0; index < 1; index++) {
      let n1 = JSON.parse(JSON.stringify(note));
      n1._time -= 0.01;
      n1._customData._track = "FlashyBoi";
      n1._customData._fake = true;
      n1._customData._interactable = false;
      n1._customData._disableSpawnEffect = true;
      n1._customData._disableNoteGravity = true;
      n1._customData._disableNoteLook = true;
      n1._customData._definitePosition = [0,0,10]
      _notes.push(n1);
    }
  });
  for (let FlashBeat = startBeat; index < endBeat; FlashBeat++) {
    _customEvents.push({
      _time: FlashBeat,
      _type: "AnimateTrack",
      _data: {
        _track: "FlashyBoi",
        _duration: 1,
        _dissolveArrow: [[0,0]],
        _dissolve: [[0,0.249], [1,0.025], [1,0.29], [0,0.3]],
      }
    }); 
  }
}

function StreamBlockFlashThing2(startBeat, endBeat){
  filterednotes = _notes.filter(n => n._time >= startBeat && n._time <= endBeat);
  filterednotes.forEach(note => {
    note._customData._animation = {}
    note._customData._animation._dissolve = [[0,0]];
    for (let index = 0; index < 1; index++) {
      let n1 = JSON.parse(JSON.stringify(note));
      n1._time -= 0.01;
      n1._customData._track = "FlashyBoi";
      n1._customData._noteJumpStartBeatOffset = 1;
      n1._customData._fake = true;
      n1._customData._interactable = false;
      n1._customData._disableSpawnEffect = true;
      n1._customData._disableNoteGravity = true;
      n1._customData._disableNoteLook = true;
      _notes.push(n1);
    }
  });
  for (let index = startBeat; index < endBeat; index++) {
    let FlashBeat = startbeat+index
    _customEvents.push({
      _time: FlashBeat,
      _type: "AnimateTrack",
      _data: {
        _track: "FlashyBoi",
        _duration: 0.125,
        _dissolveArrow: [[0,0]],
        _dissolve: [[0,0], [1,0.001], [1,0.999], [1,1]],
      }
    }); 
  }
}



_pointDefinitions.push({
  _name: "ohnoTime",
  _points: [[0.41, 0.1, "splineCatmullRom"], [0.35, 0.25, "splineCatmullRom"], [0.35, 0.35, "splineCatmullRom"], [0.5, 0.5], [1, 1]]
});

ohno(278, "278")
ohno(282, "282")
ohno(286, "286")
ohno(290, "290")
ohnoFast(292, "292")
ohnoFast(294, "294")
ohnoFast(296, "296")
ohnoFast(298, "298")

filterednotes = _notes.filter(n => n._time >= 299 && n._time < 306);
  filterednotes.forEach(note => {
    note._customData._track = "ahahaFUCK"
    note._customData._noteJumpStartBeatOffset = 0.25;
    note._customData._startNoteJumpMovementSpeed = 22;
});
filterednotes = _notes.filter(n => n._time >= 306 && n._time < 310);
  filterednotes.forEach(note => {
    note._customData._track = "ahahaFUCK"
    note._customData._noteJumpStartBeatOffset = 0;
    note._customData._startNoteJumpMovementSpeed = 22;
  });

filterednotes = _notes.filter(n => n._time >= 318 && n._time <= 379);
  filterednotes.forEach(note => {
    note._customData._track = "ahahaFUCK"
    note._customData._animation = {}
    note._customData._animation._scale = [[5,5,5,0.125], [1,1,1,0.375, "easeInOutBounce"]];
    note._customData._noteJumpStartBeatOffset = 4
    for (let index = 261; index < 293; index++) {
      note._customData._animation._position = [[getRndInteger(-35,35),getRndInteger(-35,35),-6.9,0.125], [getRndInteger(-25,25),getRndInteger(-25,25),0,0.375, "easeInOutExpo"], [0,0,0,0.4, "easeOutElastic"]];
      note._customData._animation._rotation = [[getRndInteger(-90,90),getRndInteger(-90,90),getRndInteger(-90,90),0.125], [getRndInteger(-35,35),getRndInteger(-35,35),getRndInteger(-35,35),0.25,"easeInExpo"], [0,0,0,0.325, "easeOutExpo"]];
      note._customData._animation._localRotation = [[getRndInteger(-90,90),getRndInteger(-90,90),getRndInteger(-90,90),0],[getRndInteger(-90,90),getRndInteger(-90,90),getRndInteger(-90,90),0.25,"easeInExpo"], [0,0,0,0.4, "easeInOutBack"]];
      note._customData._animation._dissolveArrow = [[1,0.25], [0,0.325,"easeOutExpo"]];
    }
    let na = JSON.parse(JSON.stringify(note));
    na._customData._animation._scale = [[5,5,5,0.125], [1,1,1,0.375, "easeInOutBounce"]];
    na._customData._animation._position = [[getRndInteger(-25,25),getRndInteger(-25,25),-6.9,0.125], [0,0,0,0.375, "easeInOutBack"]];
    na._customData._animation._rotation = [[getRndInteger(-90,90),getRndInteger(-90,90),getRndInteger(-90,90),0.125], [getRndInteger(-35,35),getRndInteger(-35,35),getRndInteger(-35,35),0.25,"easeInExpo"], [0,0,0,0.325, "easeOutExpo"]];
    //na._customData._animation._localRotation = [[getRndInteger(-69,69),getRndInteger(-69,69),getRndInteger(-69,69),0.125], [getRndInteger(-69,69),getRndInteger(-69,69),getRndInteger(-69,69),0.25, "easeOutExpo"], [0,0,0,0.45, "easeOutBack"]];
    na._customData._animation._dissolve = [[1,0.25], [0,0.325,"easeOutExpo"]];
    na._customData._animation._dissolveArrow = [[0,0.125], [1, 0.25,"easeOutExpo"]];
    na._time -= 0.01;
    na._customData._disableSpawnEffect = true;
    na._customData._fake = true;
    na._customData._interactable = false;
    if (na._cutDirection == 0 && typeof "up" !== "undefined") {
      na._customData._track = "upA";
    }
    if (na._cutDirection == 1 && typeof "up" !== "undefined") {
      na._customData._track = "downA";
    }
    if (na._cutDirection == 2 && typeof "up" !== "undefined") {
      na._customData._track = "leftA";
    }
    if (na._cutDirection == 3 && typeof "up" !== "undefined") {
      na._customData._track = "rightA";
    }
    _notes.push(na);
});

noteScale2(299,301.75,"ahahaFUCK", 1,1,1.35)
noteScale2(302,305.75,"ahahaFUCK", 0.5,0.5,1.69)
noteScale2(306,310,"ahahaFUCK", 0.25,0.25,2.25)

noteScale2(317,346,"ahahaFUCK", 1,1,1.35)
noteScale2(350,362,"ahahaFUCK", 1,1,1.69)
noteScale2(366,378,"ahahaFUCK", 1,1,2.25)

_customEvents.push({
  _time: 370,
  _type: "AssignTrackParent",
  _data: {
    _childrenTracks: ["upA","downA","leftA","rightA"],
    _parentTrack: "ahahaFUCK"
  }
});  


for (let index = 317; index < 378; index+=8) {
  laneWiggle(index,378,"upA", 4,2,-2,0,0)
  laneWiggle(index,378,"downA", 4,2,0,2,0)
  laneWiggle(index,378,"leftA", 4,2,-2,0,0)
  laneWiggle(index,378,"rightA", 4,2,0,2,0)
}
for (let index = 317+4; index < 378; index+=8) {
  laneWiggle(index,378,"upA", 4,2,0,-2,0)
  laneWiggle(index,378,"downA", 4,2,2,0,0)
  laneWiggle(index,378,"leftA", 4,2,0,-2,0)
  laneWiggle(index,378,"rightA", 4,2,2,0,0)
}



Space(382, 406,"endRed","endBlue",5)

glitchPosFunny(405,407, 4.20, 2, "easeInOutElastic")

//#endregion


//#region write file
const precision = 4; //decimals to round to  --- use this for better wall precision or to try and decrease JSON file size

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
