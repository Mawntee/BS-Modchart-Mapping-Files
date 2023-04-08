"use strict";

const fs = require("fs");


const lightsPath = "Lights.dat";
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
  const _startBPM = 175; //INSERT BPM HERE -  -  -  -  -  -  -  -  -  -  -  -  -  
  const bpm = 175; //AND HERE -  -  -  -  -  -  -  -  -  -  -  -  -  
  const _startNoteJumpMovementSpeed = 20; //NJS -  -  -  -  -  -  -  -  -  -  -  -  -  
  const _noteJumpStartBeatOffset = -0.5; //OFFSET -  -  -  -  -  -  -  -  -  -  -  -  -  

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
  filterednotes = _notes.filter(n => n._time >= beat && n._time < endBeat);
  filterednotes.forEach(note => {
    if (note._customData._track !== "ArrowsGlitch2") {
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
  note._customData._disableSpawnEffect = "true"      // NOTE: removing spawn effect will scuff practice mode if you try and play at a section or track with a note already spawnd that has this property set to true - you need to start playing before these spawn in
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


//#region                       -  -  -  -  -  -  -  -  -  -  -  -  -  DO YOUR DIRTY WORK HERE  -  -  -  -  -  -  -  -  -  -  -  -  -

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

_pointDefinitions.push({
  _name: "ohnoTime",
  _points: [[0.41, 0.1, "splineCatmullRom"], [0.35, 0.25, "splineCatmullRom"], [0.35, 0.35, "splineCatmullRom"], [0.5, 0.5], [1, 1]]
});

//#endregion 





//#region       -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  Stuff & Things -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  


filterednotes = _notes.filter(n => n._time >= 0 && n._time <= 666);
filterednotes.forEach(note => {
 note._customData._noteJumpStartBeatOffset = -1
 note._customData._noteJumpMovementSpeed = 12
 note._customData._disableSpawnEffect = true;
 note._customData._disableNoteGravity = true;
 note._customData._animation = {}
 //note._customData._animation._position = [[0,0,6.9,0.25],[0,0,0,0.4875,"easeOutBack"]];
 note._customData._animation._localRotation = [[179,0,0,0.125], [0,0,0,0.25,"easeOutCirc"]];
 if (note._lineLayer == 0) {
  if (note._lineIndex == 0) {
    note._customData._animation._position = [[1.5,0,16.9,0], [0,0,0,0.25,"easeInBack"]];
  }
  if (note._lineIndex == 1) {
    note._customData._animation._position = [[0.5,0,16.9,0], [0,0,0,0.25,"easeInBack"]];
  }
  if (note._lineIndex == 2) {
    note._customData._animation._position = [[-0.5,0,16.9,0], [0,0,0,0.25,"easeInBack"]];
  }
  if (note._lineIndex == 3) {
    note._customData._animation._position = [[-1.5,0,16.9,0], [0,0,0,0.25,"easeInBack"]];
  }
 }
 if (note._lineLayer == 1) {
  if (note._lineIndex == 0) {
    note._customData._animation._position = [[1.5,-1,16.9,0], [0,0,0,0.25,"easeInBack"]];
  }
  if (note._lineIndex == 1) {
    note._customData._animation._position = [[0.5,-1,16.9,0], [0,0,0,0.25,"easeInBack"]];
  }
  if (note._lineIndex == 2) {
    note._customData._animation._position = [[-0.5,-1,16.9,0], [0,0,0,0.25,"easeInBack"]];
  }
  if (note._lineIndex == 3) {
    note._customData._animation._position = [[-1.5,-1,16.9,0], [0,0,0,0.25,"easeInBack"]];
  }
 }
 if (note._lineLayer == 2) {
  if (note._lineIndex == 0) {
    note._customData._animation._position = [[1.5,-2,16.9,0], [0,0,0,0.25,"easeInBack"]];
  }
  if (note._lineIndex == 1) {
    note._customData._animation._position = [[0.5,-2,16.9,0], [0,0,0,0.25,"easeInBack"]];
  }
  if (note._lineIndex == 2) {
    note._customData._animation._position = [[-0.5,-2,16.9,0], [0,0,0,0.25,"easeInBack"]];
  }
  if (note._lineIndex == 3) {
    note._customData._animation._position = [[-1.5,-2,6.9,0], [0,0,0,0.25,"easeInBack"]];
  }
 }
});

filterednotes = _notes.filter(n => n._time >= 83.9 && n._time <= 84.25);
filterednotes.forEach(note => {
  note._customData._animation._position = [[0.5,0,6.9,0.125], [0,0,0,0.375,"easeInBack"]];
});


filterednotes = _notes.filter(n => n._time >= 84.9 && n._time <= 85.3);
filterednotes.forEach(note => {
  note._customData._animation._position = [[-0.5,0,6.9,0.25], [0,0,0,0.375,"easeInBack"]];
});

filterednotes = _notes.filter(n => n._time > 85.25 && n._time <= 86);
filterednotes.forEach(note => {
  note._customData._noteJumpStartBeatOffset = -1
  note._customData._noteJumpMovementSpeed = 18;
  note._customData._fake = true;
  note._customData._disableSpawnEffect = true;
  note._customData._animation = {}
  note._customData._animation._position = [[-0.5,1,0,0]];
  note._customData._animation._scale = [[4.20,4.20,4.20,0]];
});

//#endregion       -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  STOP  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -






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


const diffPaths = [OUTPUT];

var L = JSON.parse(fs.readFileSync(lightsPath));

for(var diffPath of diffPaths) {
	var j = JSON.parse(fs.readFileSync(diffPath));

	j._events = [...(j._events || []), ...(L._events || [])].sort((a, b) => a._time - b._time);

	fs.renameSync(diffPath, diffPath + ".original");
	fs.writeFileSync(diffPath, JSON.stringify(j, null, 2));
}