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
  const _startBPM = 124; //INSERT BPM HERE -  -  -  -  -  -  -  -  -  -  -  -  -  
  const bpm = 124; //AND HERE -  -  -  -  -  -  -  -  -  -  -  -  -  
  const _startNoteJumpMovementSpeed = 14; //NJS -  -  -  -  -  -  -  -  -  -  -  -  -  
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
          [1, 1, 1, 0.95, "easeOutBack"]
        ]
      }
    });
  }
}

function noteScaleS1(startBeat, endBeat, track, interval, duration, magnitude) {
  for (let i = 0; i < endBeat - startBeat; i += interval) {
    let currentBeat = startBeat + i;
    _customEvents.push({
      _time: currentBeat,
      _type: "AnimateTrack",
      _data: {
        _track: track,
        _duration: duration,
        _scale: [[magnitude, magnitude, magnitude, 0, "easeOutExpo"],[1, 1, 1, 0.9, "easeOutBack"]],
        _position: [[magnitude/1.5, 0, 0, 0, "easeOutExpo"],[0, 0, 0, 0.45, "easeOutBack"],[0, 0, 0, 0.49, "easeOutBack"],[-magnitude/1.5, 0, 0, 0.5, "easeOutExpo"],[0, 0, 0, 0.95, "easeOutBack"]]
      }
    });
  }
}

function noteScaleS2(startBeat, endBeat, track, interval, duration, magnitude) {
  for (let i = 0; i < endBeat - startBeat; i += interval) {
    let currentBeat = startBeat + i;
    _customEvents.push({
      _time: currentBeat,
      _type: "AnimateTrack",
      _data: {
        _track: track,
        _duration: duration,
        _scale: [[magnitude, magnitude, magnitude, 0, "easeOutExpo"],[1, 1, 1, 0.9, "easeOutBack"]],
        _position: [[-magnitude/1.5, 0, 0, 0, "easeOutExpo"],[0, 0, 0, 0.75, "easeOutBack"]]
      }
    });
  }
}

function noteScaleS3(startBeat, endBeat, track, interval, duration, magnitude) {
  for (let i = 0; i < endBeat - startBeat; i += interval) {
    let currentBeat = startBeat + i;
    _customEvents.push({
      _time: currentBeat,
      _type: "AnimateTrack",
      _data: {
        _track: track,
        _duration: duration,
        _scale: [[magnitude, magnitude, magnitude, 0, "easeOutExpo"],[1, 1, 1, 0.9, "easeOutBack"]],
        _localRotation: [[0, 0, 169, 0, "easeOutSine"],[0, 0, 0, 0.4, "easeOutBack"],[0, 0, 0, 0.49],[0, 0, -169, 0.5, "easeOutSine"],[0, 0, 0, 0.9, "easeOutBack"]]
      }
    });
  }
}



function ohno(startBeat, track) {
  filterednotes = _notes.filter(n => n._time > startBeat && n._time < startBeat+0.5);
  filterednotes.forEach(note => {
    note._customData._disableNoteGravity = true;
    note._customData._noteJumpMovementSpeed = 19;
});
  trackOnNotesBetween(track, startBeat, startBeat+0.5, 5);
  _customEvents.push({
    _time: 0,
    _type: "AnimateTrack",
    _data: {
      _duration:1,
      _track:track,
      _rotation: [[0,0,90,0]],
      _position: [[0,0,-6.9,0]],
      _dissolve: [[0, 0]],
      _dissolveArrow: [[0, 0]]
    }
  }, {
    _time: startBeat-3.5,
    _type: "AnimateTrack",
    _data: {
      _duration: 4,
      _track:track,
      _position: [[0,0,2,0],[0,0,-6.9,0.4], [0,0,0,0.75, "easeOutBack"]],
      _rotation: [[0,0,getRndInteger(-69,69),0], [0,0,0,1, "easeOutElastic"]],
      _dissolve: [[0, 0], [1, 0.125]],
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

function offestOnNotesBetweenRBSep(
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

//p1, p2, potentialoffset, up, down, left, right,
//TODO: ADD OTHER DIRS
function trackOnNotesBetweenDirSep(
  p1,
  p2,
  potentialOffset,
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
    //i might want to make this only run if I assign a track...
    if (typeof potentialOffset !== "undefined") {
      object._customData._noteJumpStartBeatOffset = potentialOffset;
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
  filterednotes = _notes.filter(n => n._time > beat && n._time <= endBeat);
  filterednotes.forEach(note => {
    if (!note._customData._fake) {
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
  _time: beat-0.25,
  _type: "AnimateTrack",
  _data: {
    _duration: 0.25,
    _position: [[2, 0, 4, 0], [2, 0, 4, 0.24], [-2, 0, 2, 0.25], [-2, 0, 2, 0.49], [0, 0, 4, 0.5], [0, 0, 4, 0.74], [-1, 0.5, 2, 0.75], [-1, 0.5, 2, 0.99], [0, 0, 0, 1]],
    _track: "redglitch",
  }
});
_customEvents.push({
  _time: beat-0.125,
  _type: "AnimateTrack",
  _data: {
    _duration: 0.25,
    _dissolveArrow: [[2, 0], [2, 0.24], [0, 0.25], [0, 0.49], [1, 0.5], [1, 0.74], [0, 0.75], [0, 0.99], [1, 1]],
    _track: "redglitch",
  }
});
_customEvents.push({
  _time: beat-0.25,
  _type: "AnimateTrack",
  _data: {
    _duration: 0.25,
    _position: [[-2, 0, 4, 0], [-2, 0, 4, 0.24], [2, 0, 2, 0.25], [2, 0, 2, 0.49], [0, 0, 4, 0.5], [0, 0, 4, 0.74], [1, -0.5, 2, 0.75], [1, -0.5, 2, 0.99], [0, 0, 0, 1]],
    _track: "blueglitch",
  }
});
_customEvents.push({
  _time: beat-0.125,
  _type: "AnimateTrack",
  _data: {
    _duration: 0.25,
    _dissolve: [[1,0]],
    _dissolveArrow: [[2, 0], [2, 0.24], [0, 0.25], [0, 0.49], [1, 0.5], [1, 0.74], [0, 0.75], [0, 0.99], [1, 1]],
    _track: "blueglitch",
  }
});
}


function glitchPosBassackwards(beat, endBeat) {
  filterednotes = _notes.filter(n => n._time > beat && n._time <= endBeat);
  filterednotes.forEach(note => {
    if (note._customData._track !== "ArrowsGlitch2") {
    note._customData._disableSpawnEffect = true;
    note._customData._animation = {};
    note._customData._animation._rotation = [[0,180,0,0]]
    note._customData._animation._dissolve = [[0, 0],[0,0.399], [1,0.4]];
    note._customData._animation._dissolveArrow = [[0.69, 0]];
    for (let index = 0; index < 1; index++) {
      let notef = JSON.parse(JSON.stringify(note));
      notef._time += 0.01
      notef._customData._fake = true;
      notef._customData._interactable = false;
      notef._customData._animation = {};
      notef._customData._animation._rotation = [[0,180,0,0]]
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
  _time: beat-0.125,
  _type: "AnimateTrack",
  _data: {
    _duration: 0.25,
    _position: [[2, 0, 4, 0], [2, 0, 4, 0.24], [-2, 0, 2, 0.25], [-2, 0, 2, 0.49], [0, 0, 4, 0.5], [0, 0, 4, 0.74], [-1, 0.5, 2, 0.75], [-1, 0.5, 2, 0.99], [0, 0, 0, 1]],
    _track: "redglitch",
  }
});
_customEvents.push({
  _time: beat+0.125,
  _type: "AnimateTrack",
  _data: {
    _duration: 0.25,
    _dissolveArrow: [[2, 0], [2, 0.24], [0, 0.25], [0, 0.49], [1, 0.5], [1, 0.74], [0, 0.75], [0, 0.99], [1, 1]],
    _track: "redglitch",
  }
});
_customEvents.push({
  _time: beat-0.125,
  _type: "AnimateTrack",
  _data: {
    _duration: 0.25,
    _position: [[-2, 0, 4, 0], [-2, 0, 4, 0.24], [2, 0, 2, 0.25], [2, 0, 2, 0.49], [0, 0, 4, 0.5], [0, 0, 4, 0.74], [1, -0.5, 2, 0.75], [1, -0.5, 2, 0.99], [0, 0, 0, 1]],
    _track: "blueglitch",
  }
});
_customEvents.push({
  _time: beat+0.125,
  _type: "AnimateTrack",
  _data: {
    _duration: 0.25,
    _dissolve: [[1,0]],
    _dissolveArrow: [[2, 0], [2, 0.24], [0, 0.25], [0, 0.49], [1, 0.5], [1, 0.74], [0, 0.75], [0, 0.99], [1, 1]],
    _track: "blueglitch",
  }
});
}

function glitchPosFunny(beat, endBeat, time, magnitude, offset, easeing) {
  filterednotes = _notes.filter(n => n._time >= beat && n._time < endBeat);
  filterednotes.forEach(note => {
    if (note._customData._fake != true) {
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
        notef._customData._animation._rotation =  [[getRndInteger(-magnitude,magnitude),getRndInteger(-magnitude,magnitude),getRndInteger(-magnitude,magnitude),0], [0,0,0,0.39, easeing]];
        notef._customData._animation._localRotation =  [[getRndInteger(-magnitude,magnitude),getRndInteger(-magnitude,magnitude),getRndInteger(-magnitude,magnitude),0], [0,0,0,0.38, "easeInOutBack"]];
      }
      if (notef._type == 1) {
        notef._customData._noteJumpStartBeatOffset = offset;
        notef._customData._track = "blueglitch";
        notef._customData._animation._rotation =  [[getRndInteger(-magnitude,magnitude),getRndInteger(-magnitude,magnitude),getRndInteger(-magnitude,magnitude),0], [0,0,0,0.39, easeing]];
        notef._customData._animation._localRotation =  [[getRndInteger(-magnitude,magnitude),getRndInteger(-magnitude,magnitude),getRndInteger(-magnitude,magnitude),0], [0,0,0,0.38, "easeInOutBack"]];
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

function glitchPosFunnyBassackwards(beat, endBeat, time, magnitude, offset, easeing) {
  filterednotes = _notes.filter(n => n._time >= beat && n._time < endBeat);
  filterednotes.forEach(note => {
    if (note._customData._fake != true) {
    note._customData._noteJumpStartBeatOffset = offset;
    note._customData._disableSpawnEffect = true;
    note._customData._animation = {};
    note._customData._animation._rotation = [[0,180,0,0]]
    note._customData._animation._dissolve = [[0, 0],[0,0.399], [1,0.4]];
    note._customData._animation._dissolveArrow = [[0.69, 0]];
    for (let index = 0; index < 1; index++) {
      let notef = JSON.parse(JSON.stringify(note));
      notef._time += 0.01
      notef._customData._fake = true;
      notef._customData._interactable = false;
      notef._customData._animation = {};
      notef._customData._animation._rotation = [[0,180,0,0]]
      notef._customData._animation._dissolve = [[1, 0],[1,0.399], [0,0.4]];
      notef._customData._animation._dissolveArrow = [[1, 0], [1,0.45], [0,0.5]];
      if (notef._type == 0) {
        notef._customData._noteJumpStartBeatOffset = offset;
        notef._customData._track = "redglitch";
        notef._customData._animation._rotation =  [[getRndInteger(-magnitude,magnitude),180,getRndInteger(-magnitude,magnitude),0], [0,180,0,0.39, easeing]];
        notef._customData._animation._localRotation =  [[getRndInteger(-magnitude,magnitude),getRndInteger(-magnitude,magnitude),getRndInteger(-magnitude,magnitude),0], [0,0,0,0.38, "easeInOutBack"]];
      }
      if (notef._type == 1) {
        notef._customData._noteJumpStartBeatOffset = offset;
        notef._customData._track = "blueglitch";
        notef._customData._animation._rotation =  [[getRndInteger(-magnitude,magnitude),180,getRndInteger(-magnitude,magnitude),0], [0,180,0,0.39, easeing]];
        notef._customData._animation._localRotation =  [[getRndInteger(-magnitude,magnitude),getRndInteger(-magnitude,magnitude),getRndInteger(-magnitude,magnitude),0], [0,0,0,0.38, "easeInOutBack"]];
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


function trail(Schurte,samples) {
  filterednotes = notesAt([Schurte]);
  filterednotes.forEach(note => {
    for (let index = 1; index < samples; index++) {
      let n1 = JSON.parse(JSON.stringify(note));
      n1._time += 0.01437 * (index * 2);
      n1._customData._track = "notes";
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
      },{
        _time: 0,
        _type: "AssignTrackParent",
        _data: {
        _childrenTracks: [`stackThing${dot._time}`], 
        _parentTrack: "notes" 
        }
      }
    );
  }
  
  _pointDefinitions.push({
    _name: "ohnoTime",
    _points: [[0.41, 0.1, "splineCatmullRom"], [0.35, 0.25, "splineCatmullRom"], [0.35, 0.35, "splineCatmullRom"], [0.5, 0.5], [1, 1]]
});
  

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

function Space(Start, End, amount) {
  filterednotes = _notes.filter(n => n._time >= Start && n._time < End);
  filterednotes.forEach(note => {
    if (note._customData._disableNoteGravity != true) {
    if (note._type == 0) {
      //note._customData._track = trackR;
    }
    if (note._type == 1) {
      //note._customData._track = trackB;
    }
    note._customData._noteJumpStartBeatOffset = 12;
    note._customData._noteJumpMovementSpeed = 10;
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
      n1._time -= 3*(index*0.666);
      if (note._type == 0) {
        //n1._customData._track = trackR;
      }
      if (note._type == 1) {
        //n1._customData._track = trackB;
      }
      n1._customData._noteJumpStartBeatOffset = 12;
      n1._customData._noteJumpMovementSpeed = 10 + (index*2.69);
      n1._customData._animation = {};
      n1._customData._animation._position = [[9 * index, getRndInteger(-20, 20), getRndInteger(-20, 20), 0], [6.5 * index, getRndInteger(-12, 15), 50, 1]];
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
      n1._time -= 3*(index2*0.69);
      n1._customData._noteJumpStartBeatOffset = 12;
      n1._customData._noteJumpMovementSpeed = 10 + (index2*2.69);
      n1._customData._animation = {};
      n1._customData._animation._position = [[-9 * index2, getRndInteger(-20, 20), getRndInteger(-20, 20), 0], [-6.5 * index2, getRndInteger(-12, 15), 50, 1]];
      n1._customData._animation._rotation = [[getRndInteger(-25, 15), getRndInteger(-25, 25), getRndInteger(-25, 25), 0], [getRndInteger(-15, 15), getRndInteger(-15, 15), getRndInteger(-15, 15), 1]];
      n1._customData._animation._localRotation = [[getRndInteger(-90,90),getRndInteger(-90,90),getRndInteger(-90,90),0], [getRndInteger(-10,10),getRndInteger(-10,10),getRndInteger(-10,10),1, "easeInOutBack"]];
      n1._customData._animation._dissolve = [[0,0]];
      n1._customData._animation._dissolveArrow = [[0,0], [1,0.15]];
      n1._customData._fake = true;
      n1._customData._interactable = false;
      n1._customData._disableSpawnEffect = true;
      n1._customData._disableNoteGravity = true;
      if (note._type == 0) {
        //n1._customData._track = trackR;
      }
      if (note._type == 1) {
        //n1._customData._track = trackB;
      }
      _notes.push(n1);
    }
  }
  });
}

function outerSpace(Start, End, amount) {
  filterednotes = _notes.filter(n => n._time >= Start && n._time < End);
  filterednotes.forEach(note => {
    if (note._customData._disableNoteGravity != true) {
    note._customData._noteJumpStartBeatOffset = 1;
   note._customData._noteJumpMovementSpeed = 16;
    note._customData._disableSpawnEffect = true;
    //note._customData._disableNoteGravity = true;
    for (let index = 1; index < amount*2; index++) {
      let n1 = JSON.parse(JSON.stringify(note));
      n1._time += 2*(index*0.666);
      if (note._type == 0) {
        //n1._customData._track = trackR;
      }
      if (note._type == 1) {
        //n1._customData._track = trackB;
      }
      n1._customData._noteJumpStartBeatOffset = 16;
      n1._customData._noteJumpMovementSpeed = 16 + (index*2.69);
      n1._customData._animation = {};
      n1._customData._animation._position = [[45 * index, getRndInteger(-60, 60), 40, 0], [20 * index, getRndInteger(-50, 50), 0, 1, "easeInOutQuad"]];
      n1._customData._animation._rotation = [[getRndInteger(-25, 25), getRndInteger(-25, 25), getRndInteger(-25, 25), 0], [getRndInteger(-20, 20), getRndInteger(-20, 20), getRndInteger(-20, 20), 1, "easeInOutBack"]];
      n1._customData._animation._localRotation = [[getRndInteger(-90,90),getRndInteger(-90,90),getRndInteger(-90,90),0], [getRndInteger(-10,10),getRndInteger(-10,10),getRndInteger(-10,10),1, "easeInOutQuad"]];
      n1._customData._animation._scale = [[35,35,0,0]];
      n1._customData._animation._dissolve = [[0,0]];
      n1._customData._animation._dissolveArrow = [[0,0], [1,0.25, "easeOutCubic"], [1,1]];
      n1._customData._fake = true;
      n1._customData._interactable = false;
      n1._customData._disableSpawnEffect = true;
      n1._customData._disableNoteGravity = true;
      _notes.push(n1);
    }
    for (let index2 = 1; index2 < amount*2 ; index2++) {
      let n1 = JSON.parse(JSON.stringify(note));
      n1._time += 2*(index2*0.69);
      n1._customData._noteJumpStartBeatOffset = 16;
      n1._customData._noteJumpMovementSpeed = 16 + (index2*2.69);
      n1._customData._animation = {};
      n1._customData._animation._position = [[-45 * index2, getRndInteger(-60, 60), 40, 0], [-20 * index2, getRndInteger(-50, 50), 0, 1, "easeInOutQuad"]];
      n1._customData._animation._rotation = [[getRndInteger(-25, 15), getRndInteger(-25, 25), getRndInteger(-25, 25), 0], [getRndInteger(-15, 15), getRndInteger(-15, 15), getRndInteger(-15, 15), 1, "easeInOutQuad"]];
      n1._customData._animation._localRotation = [[getRndInteger(-90,90),getRndInteger(-90,90),getRndInteger(-90,90),0], [getRndInteger(-10,10),getRndInteger(-10,10),getRndInteger(-10,10),1, "easeInOutQuad"]];
      n1._customData._animation._scale = [[35,35,0,0]];
      n1._customData._animation._dissolve = [[0,0]];
      n1._customData._animation._dissolveArrow = [[0,0], [1,0.25, "easeOutCubic"], [1,1]];
      n1._customData._fake = true;
      n1._customData._interactable = false;
      n1._customData._disableSpawnEffect = true;
      n1._customData._disableNoteGravity = true;
      if (note._type == 0) {
        //n1._customData._track = trackR;
      }
      if (note._type == 1) {
        //n1._customData._track = trackB;
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

function curveNJS(start, end, NJS, Offset, pos, amount) {
  filterednotes = _notes.filter(n => n._time >= start && n._time <= end); 
    filterednotes.forEach(note => { 
      if (note._customData._fake != true) {
      note._customData._track = "note";
      note._customData._noteJumpStartBeatOffset = Offset;
      note._customData._noteJumpMovementSpeed = NJS;
      note._customData._disableSpawnEffect = true;
      note._customData._disableNoteGravity = true; 
      note._customData._animation = {}
      note._customData._animation._dissolve = [[0,0], [0.2,0.25, "easeInSine"],[0.75,0.375, "easeOutBounce"],[0.420,0.437, "easeOutBounce"],[0.9,0.5, "easeOutBounce"]];
      note._customData._animation._dissolveArrow = [[0,0],[0.25,0.375, "easeInSine"],[0.69,0.4375, "easeInOutBounce"],[0,0.51, "easeOutBounce"]];
      note._customData._animation._rotation = [[getRndInteger(-60,60),getRndInteger(-20,20),getRndInteger(-69,69),0],[0,0,0,0.45,"easeInOutSine"]]
      note._customData._animation._localRotation = [[getRndInteger(-15,15),getRndInteger(-20,20),getRndInteger(-69,69),0],[getRndInteger(-69,69),getRndInteger(-69,69),getRndInteger(160,200),0.25,"easeInOutSine"],[0,0,0,0.5,"easeOutQuad"]]
      note._customData._animation._position = [[0,0,pos,0], [0,0,0,0.5, "easeOutQuad"]];
      for (let index = 1; index <= amount; index++) {
        let n1 = JSON.parse(JSON.stringify(note));
        n1._time -= index*0.4;
        n1._customData._track = "fakenote";
        n1._customData._animation = {};
        n1._customData._animation._rotation = [[getRndInteger(-85,85), getRndInteger(-85,85), getRndInteger(-45,45), 0], [0,0,0,0.375, "easeOutSine"]];
        n1._customData._animation._dissolveArrow = [[0,0],[0.69,0.25, "easeInOutElastic"],[0,0.4375, "easeInQuad"]];
        n1._customData._animation._dissolve = [[0,0]];
        n1._customData._animation._scale = [[4,4,1,0.125], [1.35,1.35,1,0.5, "easeOutQuad"]];
        n1._customData._fake = true;
        n1._customData._interactable = false;
            _notes.push(n1);
      }
    }
  }); 
}

function RBFlash(Start, End, trackR, trackB, interval, ArrowOn) {
  for (let index = Start; index <= End; index+=interval) {
  //red lane
    _customEvents.push({
        _time: index,
        _type: "AnimateTrack",
        _data: {
          _track: trackR,
          _duration: interval/2,
          _dissolve: [[0, 0]],
          _dissolveArrow: [[1, 0]],
        }
      },{
        _time: index+(interval/2),
        _type: "AnimateTrack",
        _data: {
          _track: trackR,
          _duration: interval/2,
          _dissolve: [[1, 0]],
          _dissolveArrow: [[1, 0]],
        }
      });
  // blue lane
  _customEvents.push({
    _time: index-(interval/2),
    _type: "AnimateTrack",
    _data: {
      _track: trackB,
      _duration: interval/2,
      _dissolve: [[0, 0]],
      _dissolveArrow: [[0, 0]],
    }
  },{
    _time: index,
    _type: "AnimateTrack",
    _data: {
      _track: trackB,
      _duration: interval/2,
      _dissolve: [[1, 0]],
      _dissolveArrow: [[1, 0]],
    }
  });
    }
  }
  


//#endregion



//#region COPY/PASTE   -  -  -  -  -  -  -  -  -  -  -  -  -  use these as a copy/paste template for the lazy   -  -  -  -  -  -  -  -  -  -  -  -  -  
/*

//---------------------------------------------- NOTES ----------------------------------------------

_pointDefinitions.push({
  _name: "buildupshake2",
  _points: DecayShakePath(0.5, 0, 0, 50)
});

filterednotes = notesAt([69]);
filterednotes.forEach(note => {
  note._customData._noteJumpStartBeatOffset = 0;      
  note._customData._noteJumpMovementSpeed = 19;       
  note._customData._animation = {}
  note._customData._animation._rotation = [[0, 0, 0, 0],[0,0,0,0.5,"easeOutElastic"]]; 
});

filterednotes = _notes.filter(n => n._time >= 69 && n._time <= 420);
filterednotes.forEach(note => {
  note._customData._track = "dumb track name here";
  note._customData._noteJumpStartBeatOffset = 69;
  note._customData._noteJumpMovementSpeed = 420;
  note._customData._fake = true;
  note._customData._disableSpawnEffect = true;
  note._customData._disableNoteGravity = true;
  note._customData._disableNoteLook = true;
  note._customData._animation = {}
  note._customData._animation._position = [[0, 0, 0, 0],[0,0,0,0.5,"easeOutElastic"]]; 
});

//---------------------------------------------- EVENTS ----------------------------------------------

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


_customEvents.push({
  _time: 69,
  _type: "AssignPathAnimation",
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




//---------------------------------------------- ENVIRONMENTS ----------------------------------------------

_environment.push({
  _id: "^.*Environment\\.\\[\\d*\\]BottomGlow$",
  _lookupMethod: "Regex",
  _active: false
});

_environment.push({
  _id: "^.*Environment\\.\\[\\d*\\]Construction$",
  _lookupMethod: "Regex",
  _track: "Construction",
  _active: true
});
_customEvents.push({
  _time: 0,
  _type: "AnimateTrack",
  _data: {
    _track: "Construction",
    _duration: 0,
    _position: [[0, 0, -2/0.6, 0]],
    _rotation: [[0, 0, 0, 0]],
    _scale: [[1, 1, 1, 0]],
  }
}); 

*/
//#endregion


//#region                       -  -  -  -  -  -  -  -  -  -  -  -  -  DO YOUR DIRTY WORK HERE  -  -  -  -  -  -  -  -  -  -  -  -  -

//trackOnNotesBetween("notes", 0,36,0)

//First few notes set up and applied to same track as the player
//When the player is first moved up the highway, the notes will also follow
filterednotes = _notes.filter(n => n._time >= 0 && n._time <= 4);
filterednotes.forEach(note => {
  note._customData._track = "Player";
  note._customData._noteJumpStartBeatOffset = -0.5;
  note._customData._noteJumpMovementSpeed = 14;
  note._customData._animation = {}
});

// Small "wave" or "curve" applied to the NJS
// I do this in a lot of maps to get the reaction time of having a far offset, without the offset actually feeling far/slow for the player.
// Note Jump and Spawn light disabled to give a slightly more "uncomfortable" or "unfamiliar" feeling to the gameplay
filterednotes = _notes.filter(n => n._time > 4 && n._time <= 420);
filterednotes.forEach(note => {
  note._customData._track = "notes";
  note._customData._noteJumpStartBeatOffset = 0;
  note._customData._noteJumpMovementSpeed = 14;
  note._customData._disableNoteGravity = true;
  note._customData._disableSpawnEffect = true;
  note._customData._animation = {}
  note._customData._animation._position = [[0,0,-5,0],[0,0,0,0.5,"easeOutCubic"]]
});

// Spawns walls to be used as fake screen distortion effects
_obstacles.push({
  _time: 0.01,
  _duration: 5,
  _lineIndex: 0,
  _type: 0,
  _width: 0,
  _customData:{
    _noteJumpStartBeatOffset: 0,
    _noteJumpMovementSpeed: 10,
    _interactable: false, // Walls won't vibrate players controllers when touched | Also good for optimization on visual walls as all colision/interaction scripts are removed.
    _fake: true,          // Disables scoring on wall.
    _disableSpawnEffect: true,
    _track: "Distortion",
    _rotation: [0,0,0],
    _scale: [10,2,1],
    _position: [0,-20,-0.5],
    _color: [0,0,0,1]
  }
}, {
  _time: 3,
  _duration: 5,
  _lineIndex: 0,
  _type: 0,
  _width: 0,
  _customData:{
    _noteJumpStartBeatOffset: 0,
    _noteJumpMovementSpeed: 10,
    _interactable: false,
    _fake: true,
    _disableSpawnEffect: true,
    _track: "Distortion2",
    _rotation: [0,0,0],
    _scale: [10,2,1],
    _position: [0,0,-0.5],
    _color: [0,0,0,1]
  }
}, {
  _time: 3,
  _duration: 5,
  _lineIndex: 0,
  _type: 0,
  _width: 0,
  _customData:{
    _noteJumpStartBeatOffset: 0,
    _noteJumpMovementSpeed: 10,
    _interactable: false,
    _fake: true,
    _disableSpawnEffect: true,
    _track: "Distortion3",
    _rotation: [0,0,0],
    _scale: [10,2,1],
    _position: [0,0,-0.5],
    _color: [0,0,0,1]
  }
}, {
  _time: 3,
  _duration: 5,
  _lineIndex: 0,
  _type: 0,
  _width: 0,
  _customData:{
    _noteJumpStartBeatOffset: 0,
    _noteJumpMovementSpeed: 10,
    _interactable: false,
    _fake: true,
    _disableSpawnEffect: true,
    _track: "Distortion4",
    _rotation: [0,0,0],
    _scale: [10,2,1],
    _position: [0,0,-0.5],
    _color: [0,0,0,1]
  }
}, {
  _time: 3,
  _duration: 5,
  _lineIndex: 0,
  _type: 0,
  _width: 0,
  _customData:{
    _noteJumpStartBeatOffset: 0,
    _noteJumpMovementSpeed: 10,
    _interactable: false,
    _fake: true,
    _disableSpawnEffect: true,
    _track: "DistortionBack",
    _rotation: [0,0,0],
    _scale: [10,2,1],
    _position: [0,0,-0.5],
    _color: [0,0,0,1]
  }
}, {
  _time: 3,
  _duration: 5,
  _lineIndex: 0,
  _type: 0,
  _width: 0,
  _customData:{
    _noteJumpStartBeatOffset: 0,
    _noteJumpMovementSpeed: 10,
    _interactable: false,
    _fake: true,
    _disableSpawnEffect: true,
    _track: "DistortionLower",
    _rotation: [0,0,0],
    _scale: [10,2,1],
    _position: [0,0,-0.5],
    _color: [0,0,0,1]
  }
}, {
  _time: 3,
  _duration: 5,
  _lineIndex: 0,
  _type: 0,
  _width: 0,
  _customData:{
    _noteJumpStartBeatOffset: 0,
    _noteJumpMovementSpeed: 10,
    _interactable: false,
    _fake: true,
    _disableSpawnEffect: true,
    _track: "DistortionTop",
    _rotation: [0,0,0],
    _scale: [10,2,1],
    _position: [0,0,-0.5],
    _color: [0,0,0,1]
  }
})

//These events below control all the funny distortion effects going on in the map.

//This one controls the main "layers" or "slices" of distortion blocking the notes.
_customEvents.push({
  _time: 3,
  _type: "AnimateTrack",
  _data: {
    _track: "Distortion2",
    _time: [[0.5,0]],
    _duration: 34,
    _localRotation: [[getRndInteger(-2,2), getRndInteger(-2,2), getRndInteger(-2,2), 0], [getRndInteger(-2,2), getRndInteger(-2,2), getRndInteger(-2,2), 1, "easeInOutSine"]],
    _position: [[0, -50, -72, 0], [0, -50, -67, 1]],
    _scale: [[500,200,100,0]], // Walls scaled by track animation events after being created will "stretch". The distortion size was set when wall was created, then "zoomed in" using these effects to make it seem like the whole screen was distorted.
    _dissolve: [[0.125,0], [0.2, 1, "easeInOutElastic"]],
    _color: [[0,0,0,-5,0], [0,0,0,-10,1, "easeInOutBack"]] // [r,g,b,a,t] - [red,green,blue,alpha,time] | The "alpha" value of walls controls their distortion levels. Negative alpha makes walls look "reflective", but will invert the colours.
  }
},{
  _time: 3,
  _type: "AnimateTrack",
  _data: {
    _track: "Distortion3",
    _time: [[0.5,0]],
    _duration: 34,
    _localRotation: [[getRndInteger(-2,2), getRndInteger(-2,2), getRndInteger(-2,2), 0], [getRndInteger(-2,2), getRndInteger(-2,2), getRndInteger(-2,2), 1, "easeInOutSine"]],
    _position: [[0, -50, -67, 0], [0, -50, -65, 1]],
    _scale: [[500,200,100,0]],
    _dissolve: [[0.25,0], [0.35, 1, "easeInOutElastic"]],
    _color: [[0,0,0,-10,0], [0,0,0,-15,1, "easeInOutBack"]]
  }
},{
  _time: 3,
  _type: "AnimateTrack",
  _data: {
    _track: "Distortion4",
    _time: [[0.5,0]],
    _duration: 34,
    _localRotation: [[getRndInteger(-2,2), getRndInteger(-2,2), getRndInteger(-2,2), 0], [getRndInteger(-2,2), getRndInteger(-2,2), getRndInteger(-2,2), 1, "easeInOutSine"]],
    _position: [[0, -50, -63, 0], [0, -45, -50, 1]],
    _scale: [[500,200,100,0]],
    _dissolve: [[0.35,0], [0.45, 1, "easeInOutElastic"]],
    _color: [[0,0,0,-15,0], [0,0,0,-25,1, "easeInOutBounce"]]
  }
},{   // This event sets up the furthest piece of ditortion that acts as the "back wall"
  _time: 3,
  _type: "AnimateTrack",
  _data: {
    _track: "DistortionBack",
    _time: [[0.5,0]],
    _duration: 34,
    _localRotation: [[getRndInteger(-2,2), getRndInteger(-2,2), getRndInteger(-2,2), 0], [getRndInteger(-2,2), getRndInteger(-2,2), getRndInteger(-2,2), 1, "easeInOutSine"]],
    _position: [[0, -20, -45, 0], [0, -20, -45, 1]],
    _scale: [[500,200,100,0]],
    _dissolve: [[1,0]],
    _color: [[0,0,0,-420,0],[0,0,0,-696.9,1, "easeInOutBack"]]
  }
},{  // This one controls the little "waves" you see floating just above the mirror on the floor.
  _time: 3,
  _type: "AnimateTrack",
  _data: {
    _track: "DistortionLower",
    _time: [[0.5,0]],
    _duration: 34,
    _localRotation: [[0, -3, 0, 0],[0, -8, 0, 1]],
    _position: [[0, -0.05, -150, 0], [0, -0.05, -150, 1]],
    _scale: [[500,0.1,300,0]],
    _dissolve: [[0.45,0],[0.55,1, "easeInOutBack"]],
    _color: [[0,0,0,-15,0], [0,0,0,-69,1, "easeInOutBack"]],
  }
},{  // Same thing as above, but for the top.
  _time: 3,
  _type: "AnimateTrack",
  _data: {
    _track: "DistortionTop",
    _time: [[0.5,0]],
    _duration: 34,
    _localRotation: [[0, -3, 180, 0],[0, 3, 180, 1]],
    _position: [[0, 6.9, -150, 0], [0, 14, -150, 1,"easeInOutCubic"]],
    _scale: [[500,0.1,300,0]],
    _dissolve: [[1,0]],
    _color: [[0,0,0,-25,0], [0,0,0,-100,1, "easeOutBack"]],
  }
});


// These events are used to fine tune the main distortion effect directly in front of the players face. 
// This distortion layer is what does all the funny flickers and colour changes/flashes
// Don't dig too deep into this as many events are just syncing certain things to specific sounds
_customEvents.push({
  _time: 0,
  _type: "AnimateTrack",
  _data: {
    _track: "Distortion",
    _time: [[0.5,0]],
    _duration: 0,
    _position: [[0, -50, -250, 0]],
    _scale: [[1000,250,1000,0]],
    _dissolve: [[0,0]],
    _color: [[0,0,0,0,0]]
  }
},{
  _time: 2.5,
  _type: "AnimateTrack",
  _data: {
    _track: "Distortion",
    _duration: 1,
    _position: [[0, -20, -72, 0], [0, -120, -71, 1, "easeInOutCubic"]],
    _scale: [[500,200,100,0]],
    _dissolve: [[0,0],[1,0.125],[1,0.9], [0.0125,1]],
    _color: [[0,0,0,0,0], [0,0,0,-55,0.75, "easeInOutElastic"], [0,0,0,-5,1, "easeInOutBounce"]]
  }
},{
  _time: 3.5,
  _type: "AnimateTrack",
  _data: {
    _track: "Distortion",
    _duration: 2,
    _position: [[0, -120, -72, 0], [0, -120, -71, 1, "easeOutCubic"]],
    _scale: [[500,200,100,0]],
    _dissolve: [[0.25,0],[0.125,1,"easeInOutSine"]],
    _color: [[0,0,0,0,0], [0,0,0,-10,0.125, "easeInOutElastic"], [0,0,-0,-10,1, "easeInOutBounce"]]
  }
},{ 
  _time: 5.55,
  _type: "AnimateTrack",
  _data: {
    _track: "Distortion",
    _duration: 1,
    _position: [[0, -20, -72, 0], [0, -120, -71, 1, "easeInOutCubic"]],
    _scale: [[500,200,100,0]],
    _dissolve: [[0,0],[1,0.125],[0.5,0.75,"easeInCubic"],[1,0.9,"easeOutExpo"], [0.125,1]],
    _color: [[0,0,0,0,0], [0,0,0,-50,0.75, "easeInBack"], [0,0,-0,-10,1, "easeInOutBounce"]]
  }
},{
  _time: 6.66,
  _type: "AnimateTrack",
  _data: {
    _track: "Distortion",
    _duration: 0.25,
    _position: [[0, -20, -72, 0], [0, -120, -69, 1, "easeInOutCubic"]],
    _scale: [[500,200,100,0]],
    _dissolve: [[0,0],[1,0.125],[1,0.9], [0.0125,1]],
    _color: [[0,0,0,0,0], [2,0,0,-50,0.75, "easeInOutElastic"], [0,0,0,-10,1, "easeInOutBounce"]]
  }
},{
  _time: 7.4,
  _type: "AnimateTrack",
  _data: {
    _track: "Distortion",
    _duration: 0.25,
    _position: [[0, -20, -72, 0], [0, -120, -72, 1, "easeInOutCubic"]],
    _scale: [[500,200,100,0]],
    _dissolve: [[0,0],[1,0.125],[1,0.9], [0.0125,1]],
    _color: [[0,0,0,0,0], [0,0,2,-50,0.75, "easeInOutElastic"], [0,0,-0,-10,1, "easeInOutBounce"]]
  }
},{
  _time: 7.4+0.25,
  _type: "AnimateTrack",
  _data: {
    _track: "Distortion",
    _duration: 2,
    _position: [[0, -120, -69, 0], [0, -120, -72, 1, "easeOutCubic"]],
    _scale: [[500,200,100,0]],
    _dissolve: [[0.25,0],[0.125,1,"easeInOutSine"]],
    _color: [[0,0,0,0,0], [0,0,0,-10,0.125, "easeInOutElastic"], [0,0,-0,-10,1, "easeInOutBounce"]]
  }
},{
  _time: 11.75,
  _type: "AnimateTrack",
  _data: {
    _track: "Distortion",
    _duration: 0.25,
    _position: [[0, -20, -72, 0], [0, -120, -73, 1, "easeInOutCubic"]],
    _scale: [[500,200,100,0]],
    _dissolve: [[0,0],[1,0.125],[1,0.9], [0.0125,1]],
    _color: [[0,0,0,0,0], [0,0,0,-50,0.75, "easeInOutElastic"], [0,0,0,-10,1, "easeInOutBounce"]]
  }
},{
  _time: 12,
  _type: "AnimateTrack",
  _data: {
    _track: "Distortion",
    _duration: 1,
    _position: [[0, -120, -72, 0], [0, -120, -67, 1, "easeOutSine"]],
    _scale: [[500,200,100,0]],
    _dissolve: [[0.25,0],[0.125,1,"easeInOutSine"]],
    _color: [[0,0,0,0,0], [0,0,0,-10,0.125, "easeInOutElastic"], [0,0,-0,-10,1, "easeInOutBounce"]]
  }
},{
  _time: 13.1666,
  _type: "AnimateTrack",
  _data: {
    _track: "Distortion",
    _duration: 0.25,
    _position: [[0, -20, -72, 0], [0, -120, -73, 1, "easeInOutCubic"]],
    _scale: [[500,200,100,0]],
    _dissolve: [[0,0],[1,0.125],[1,0.9], [0.0125,1]],
    _color: [[0,0,0,0,0], [0,0,0,-50,0.75, "easeInOutElastic"], [0,0,-0,-5,1, "easeInOutBounce"]]
  }
},{ 
  _time: 14,
  _type: "AnimateTrack",
  _data: {
    _track: "Distortion",
    _duration: 0.83,
    _position: [[0, -50, -73, 0], [30, -69, -71, 1, "easeInExpo"]],
    _scale: [[500,200,100,0]],
    _dissolve: [[0,0],[1,0.125],[0.5,0.75,"easeInCubic"],[1,0.9,"easeOutExpo"], [0.125,1]],
    _color: [[0,0,0,0,0], [0,0,0,-30,0.85, "easeInCubic"], [0,0,-0,-10,1, "easeInOutBounce"]]
  }
},{
  _time: 14.83,
  _type: "AnimateTrack",
  _data: {
    _track: "Distortion",
    _duration: 0.25,
    _position: [[0, -20, -73, 0], [0, -120, -71, 1, "easeInOutCubic"]],
    _scale: [[500,200,100,0]],
    _dissolve: [[0,0],[1,0.125],[1,0.9], [0.0125,1]],
    _color: [[0,0,0,0,0], [0,0,2,-50,0.75, "easeInOutElastic"], [0,0,-0,-10,1, "easeInOutBounce"]]
  }
},{
  _time: 15.5,
  _type: "AnimateTrack",
  _data: {
    _track: "Distortion",
    _duration: 2,
    _position: [[0, -120, -69, 0], [0, -120, -73, 1, "easeInOutCubic"]],
    _scale: [[500,200,100,0]],
    _dissolve: [[0.25,0],[0.125,1,"easeInOutSine"]],
    _color: [[0,0,0,0,0], [0,0,0,-13,0.125, "easeInOutElastic"], [0,0,-0,-3,1, "easeInOutBounce"]]
  }
},{
  _time: 16.75,
  _type: "AnimateTrack",
  _data: {
    _track: "Distortion",
    _duration: 0.25,
    _position: [[0, -20, -73, 0], [0, -120, -72, 1, "easeInOutCubic"]],
    _scale: [[500,200,100,0]],
    _dissolve: [[0,0],[1,0.125],[1,0.9], [0.0125,1]],
    _color: [[0,0,0,0,0], [0,0,0,-50,0.75, "easeInOutElastic"], [0,0,-0,-10,1, "easeInOutBounce"]]
  }
},{ 
  _time: 18.9,
  _type: "AnimateTrack",
  _data: {
    _track: "Distortion",
    _duration: 0.75,
    _position: [[0, -120, -73, 0], [0, -50, -71, 1, "easeInOutCubic"]],
    _scale: [[500,200,100,0]],
    _dissolve: [[0,0],[1,0.125],[0.5,0.75,"easeInCubic"],[1,0.9,"easeOutExpo"], [0.125,1]],
    _color: [[0,0,0,0,0], [0,0,0,-40,0.75, "easeInBack"], [2,0,-0,-10,1, "easeInOutBounce"]]
  }
},{
  _time: 20.3,
  _type: "AnimateTrack",
  _data: {
    _track: "Distortion",
    _duration: 0.25,
    _position: [[0, -20, -72, 0], [0, -120, -72, 1, "easeInOutCubic"]],
    _scale: [[500,200,100,0]],
    _dissolve: [[0,0],[1,0.125],[1,0.9], [0.0125,1]],
    _color: [[0,0,0,0,0], [2,0,0,-50,0.75, "easeInOutElastic"], [0,0,-0,-5,1, "easeInOutBounce"]]
  }
},{
  _time: 20.7,
  _type: "AnimateTrack",
  _data: {
    _track: "Distortion",
    _duration: 2,
    _position: [[0, -120, -73, 0], [0, -120, -71, 1, "easeInBack"]],
    _scale: [[500,200,100,0]],
    _dissolve: [[0.25,0],[0.125,1,"easeInOutSine"]],
    _color: [[0,0,0,0,0], [0,0,0,-10,0.125, "easeInOutElastic"], [0,0,-0,-10,1, "easeInOutBounce"]]
  }
},{
  _time: 24.25,
  _type: "AnimateTrack",
  _data: {
    _track: "Distortion",
    _duration: 0.25,
    _position: [[0, -20, -73, 0], [0, -120, -73, 1, "easeInOutCubic"]],
    _scale: [[500,200,100,0]],
    _dissolve: [[0,0],[1,0.125],[1,0.9], [0.0125,1]],
    _color: [[0,0,0,0,0], [0,0,0,-50,0.75, "easeInOutElastic"], [0,0,-0,-10,1, "easeInOutBounce"]]
  }
},{
  _time: 25.55,
  _type: "AnimateTrack",
  _data: {
    _track: "Distortion",
    _duration: 0.2,
    _position: [[0, -30, -73, 0], [0, -100, -72, 1, "easeInOutCubic"]],
    _scale: [[500,200,100,0]],
    _dissolve: [[0,0],[1,0.125],[1,0.9], [0.0125,1]],
    _color: [[0,2,0,0,0], [2,0,0,-50,0.75, "easeInOutElastic"], [0,0,2,-10,1, "easeInOutBounce"]]
  }
},{
  _time: 25.75,
  _type: "AnimateTrack",
  _data: {
    _track: "Distortion",
    _duration: 1,
    _position: [[-2, -120, -73, 0], [2, -120, -70, 1, "easeInOutBounce"]],
    _scale: [[500,200,100,0]],
    _dissolve: [[0.25,0],[0.125,1,"easeInOutSine"]],
    _color: [[0,0,0,0,0], [0,0,0,-10,0.125, "easeInOutElastic"], [0,0,-0,-10,1, "easeInOutBounce"]]
  }
},{
  _time: 26.24,
  _type: "AnimateTrack",
  _data: {
    _track: "Distortion",
    _duration: 0.25,
    _position: [[0, -20, -73, 0], [0, -120, -73, 1, "easeInOutCubic"]],
    _scale: [[500,200,100,0]],
    _dissolve: [[0,0],[1,0.125],[1,0.9], [0.0125,1]],
    _color: [[0,0,0,0,0], [0,0,0,-50,0.75, "easeInOutElastic"], [0,0,-0,-10,1, "easeInOutBounce"]]
  }
},{
  _time: 26.5,
  _type: "AnimateTrack",
  _data: {
    _track: "Distortion",
    _duration: 1,
    _position: [[0, -120, -70, 0], [0, -120, -73, 1, "easeInOutBounce"]],
    _scale: [[500,200,100,0]],
    _dissolve: [[0.25,0],[0.125,1,"easeInOutSine"]],
    _color: [[0,0,0,0,0], [0,0,0,-10,0.125, "easeInOutElastic"], [0,0,-0,-10,1, "easeInOutBounce"]]
  }
},{
  _time: 27.2,
  _type: "AnimateTrack",
  _data: {
    _track: "Distortion",
    _duration: 0.25,
    _position: [[0, -20, -73, 0], [0, -120, -73, 1, "easeInOutCubic"]],
    _scale: [[500,200,100,0]],
    _dissolve: [[0,0],[1,0.125],[1,0.9], [0.0125,1]],
    _color: [[0,0,0,0,0], [0,0,0,-50,0.75, "easeInOutElastic"], [0,0,-0,-10,1, "easeInOutBounce"]]
  }
});




// Section below assigns player to a track so the player can be animated/moved.
_customEvents.push({
  _time: 0.25,
  _type: "AssignPlayerToTrack",
  _data: {
  _track: "Player" 
  }
});

// parents all wall objects to one track so all effects can be hidden/revealed using a single event at the start of the map.
_customEvents.push({
  _time: 0,
  _type: "AssignTrackParent",
  _data: {
  _childrenTracks: ["notes", "Distortion", "Distortion2", "Distortion3", "Distortion4", "DistortionBack", "DistortionTop", "DistortionLower", "blueglitch", "redglitch"], 
  _parentTrack: "Yes" 
  }
});



// First event shoves the walls/distortion stuff really far away and out of sight
// Second event overrides first event giving walls/player the same position. Then slowly moves everything forward through the environment all at once.
_customEvents.push({
  _time: 0,
  _type: "AnimateTrack",
  _data: {
    _track: "Yes",
    _duration: 0,
    _position: [[0, 0, 1112, 0]],
  }
},{
  _time: 3,
  _type: "AnimateTrack",
  _data: {
    _track: ["Yes", "Player"], // tracks can be arrays both in events, and applied per object. | Single events can move multiple tracks & One object can be assigned to multiple tracks.
    _duration: 32,
    _position: [[0, 0, 12, 0],[0, 0, 35, 1]],
  }
});






glitchPos(7.416,8.5)
trail(5.583332538604736, 32)
trail(11.833332061767578, 8)
glitchPos(13.1666,14.5)
glitchPos(16.75,17.5)
trail(25.5,8)
glitchPos(25.58,26.25)
glitchPos(27.3,27.75)



_environment.push({
  _id: "GlowLine \\(\\d*\\)$",
  _lookupMethod: "Regex",
  _scale: [1,getRndInteger(20,40)*0.1,1]
}); 


_environment.push({
  _id: "GlowLine$",
  _lookupMethod: "Regex",
  _scale: [1,3.5,1],
},{
  _id: "BigSmokePS$",
  _lookupMethod: "Regex",
  _active: true,
},{
  _id: "TentacleLeft$",
  _lookupMethod: "Regex",
  _active: false,
},{
  _id: "TentacleRight$",
  _lookupMethod: "Regex",
  _active: false,
},{
  _id: "FloorMirror$",
  _lookupMethod: "Regex",
  _duplicate: 1,
  _active: true,
  _position: [0,15/0.6, -20/0.6],
  _rotation: [0,0,180]
},{
  _id: "If you're a girl and you're reading this please DM me",
  _lookupMethod: "Contains",
  _active: true,
});





//#endregion

//// This is the thingy that does the stuff with the walls and shit 
//JSON.parse(fs.readFileSync("./wallsPre.dat"))._obstacles.forEach(o=>{
//  if(o._customData._track!="walls") {
//    _obstacles.push(o)
//
//  } else {
//    console.log("you should only see this once, if you see it more, exec Eat_Ass.jpg")
//    franklinContainer = o;
//  }
//})


//#region write file
const precision = 6; //decimals to round to  --- use this for better wall precision or to try and decrease JSON file size

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
