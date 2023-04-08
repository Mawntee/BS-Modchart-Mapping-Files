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
  const _startBPM = 144;
  const bpm = 144
  const _startNoteJumpMovementSpeed = 16
  const _noteJumpStartBeatOffset = 1

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



// This one is gross and I think was my first ever test for note animations?
// I had NO CLUE what I was doing, but god damn did I do it.

//This whole thing could be replaced with a function 
filterednotes = _notes.filter(n => n._time >= 23 && n._time < 69);
filterednotes.forEach(note => {
  note._customData._track = "FDAU"
});

//This should also be replaced with a basic function
filterednotes = _notes.filter(n => n._time >= 25 && n._time < 28);
filterednotes.forEach(note => {
  note._customData._noteJumpStartBeatOffset = 1;
});


filterednotes = _notes.filter(n => n._time >= 14 && n._time < 16);
filterednotes.forEach(note => {
  note._customData._disableSpawnEffect = "true"    // Disables spawn light
  note._customData._noteJumpStartBeatOffset = 6.9; // Forces Offset
});

filterednotes = _notes.filter(n => n._time >= 23 && n._time < 25);
filterednotes.forEach(note => {
  note._customData._track = "FDAU"
});

filterednotes = notesAt([30]);
filterednotes.forEach(note => {
  note._customData._noteJumpStartBeatOffset = 2;
  note._customData._animation = {}
  note._customData._animation._scale = [[1, 1, 1, 0.3], [1.3, 0.69, 1, 0.45]]; // Squashes note right after jump animation and finishes anim right before player cuts.
  //                                   [[x, y, z, t  ], [horizontal, vertical, back/fourth, note lifetime]];
});

filterednotes = notesAt([31]);
filterednotes.forEach(note => {
  note._customData._noteJumpStartBeatOffset = 2;
  note._customData._animation = {}
  note._customData._animation._position = [[0, 0, 0, 0],[0,1,0,0.3,"easeOutElastic"]];
  note._customData._animation._scale = [[1, 1, 1, 0.3], [1, 3, 1, 0.45,"easeOutBounce"]];
  note._customData._animation._localRotation = [[180, 0, 0, 0.2], [0, 0, 0, 0.35]];
});

filterednotes = _notes.filter(n => n._time >= 36 && n._time <= 38);
filterednotes.forEach(note => {
  note._customData._track = "befo"
  note._customData._noteJumpStartBeatOffset = -0.6;
  note._customData._noteJumpMovementSpeed = 21;
});

filterednotes = _notes.filter(n => n._time >= 42 && n._time < 44);
filterednotes.forEach(note => {
  note._customData._track = "peepoClown";
});
filterednotes = _notes.filter(n => n._time >= 44 && n._time <= 47);
filterednotes.forEach(note => {
  note._customData._track = "hlcyg";
  note._customData._noteJumpStartBeatOffset = 6;
});

filterednotes = notesAt([54, 55]);
filterednotes.forEach(note => {
  note._customData._noteJumpStartBeatOffset = 1.69;
  note._customData._animation = {}
  note._customData._animation._scale = [[0.2, 0.2, 10, 0.3], [2, 1.3, 1, 0.48,"easeOutBounce"]]; 
});

filterednotes = notesAt([56, 56.5]);
filterednotes.forEach(note => {
  note._customData._noteJumpStartBeatOffset = 2.69;
});

filterednotes = _notes.filter(n => n._time >= 57 && n._time < 59);
filterednotes.forEach(note => {
  note._customData._noteJumpStartBeatOffset = -0.2;
});

filterednotes = _notes.filter(n => n._time >= 59 && n._time < 61);
filterednotes.forEach(note => {
  note._customData._noteJumpStartBeatOffset = 2;
  note._customData._animation = {}
  note._customData._animation._localRotation = [[0, 359, 0, 0], [0, 180, 0, 0.23], [0, 0, 0, 0.45]]; 
});

filterednotes = _notes.filter(n => n._time >= 67 && n._time <= 72);
filterednotes.forEach(note => {
  note._customData._track = "yack";
});

_customEvents.push({
  _time: 66,
  _type: "AssignPlayerToTrack", // Does exactly what you think it does. BE CAREFUL WITH THIS.
  _data: {
    _track: "yack", // Track is named like this for a reason. It will make players motion sick.
  }
}, {
  _time: 67,
  _type: "AnimateTrack",
  _data: {
    _track: "yack",
    _duration: 5,
    _rotation: [[0, 0, 0, 0], [0, 0, 90, 0.25], [0, 0, 180, 0.5], [0, 0, 270, 0.75], [0, 0, 0, 1]],
    _position: [[0, 0, 0, 0], [0, -4, 0, 0.5], [0, 0, 0, 1]],
  }
});

filterednotes = notesAt([79]);
filterednotes.forEach(note => {
  note._customData._track = "oh";
  note._customData._animation = {}
  note._customData._animation._scale = [[0.2, 0.2, 0.2, 0.2], [3, 1.1, 1, 0.4,"easeOutElastic"]];
  note._customData._animation._position = [[0, 0, 0, 0.2], [-0.5, 0, 0, 0.4,"easeOutElastic"]];
});

filterednotes = notesAt([79.75, 80]);
filterednotes.forEach(note => {
  note._customData._animation = {}
  note._customData._animation._position = [[0, 0, 0, 0], [0, 2, 0, 0.3,"easeOutElastic"]];
});

filterednotes = notesAt([82]);
filterednotes.forEach(note => {
  note._customData._animation = {}
  note._customData._animation._position = [[0, 4, 0, 0], [0, 0, 0, 0.45,"easeOutElastic"]];
});

filterednotes = notesAt([84]);
filterednotes.forEach(note => {
  note._customData._animation = {}
  note._customData._animation._position = [[0, 0, 0, 0], [0, 2, 0, 0.3,"easeOutElastic"]];
});

filterednotes = notesAt([87]);
filterednotes.forEach(note => {
  note._customData._noteJumpStartBeatOffset = 1.3;
  note._customData._animation = {}
  note._customData._animation._rotation = [[0, 0, 90, 0], [0, 0, 0, 0.4,"easeOutBack"]];
});

filterednotes = notesAt([90]);
filterednotes.forEach(note => {
  note._customData._noteJumpStartBeatOffset = 1.69;
  note._customData._animation = {}
  note._customData._animation._scale = [[1, 1, 1, 0.2], [0.5, 0.5, 0.5, 0.4,"easeOutBack"]];
});

filterednotes = notesAt([95]);
filterednotes.forEach(note => {
  note._customData._animation = {}
  note._customData._animation._scale = [[0, 0, 0, 0.2], [1, 1, 1, 0.43,"easeOutBack"]];
});

filterednotes = notesAt([103]);
filterednotes.forEach(note => {
  note._customData._animation = {}
  note._customData._animation._position = [[0, 2, 0, 0], [0, 0, 0, 0.3,"easeOutElastic"]];
  note._customData._animation._scale = [[0, 1, 1, 0], [1, 1, 5, 0.4,"easeOutElastic"]];
});

filterednotes = notesAt([106]);
filterednotes.forEach(note => {
  note._customData._noteJumpStartBeatOffset = 1.69;
  note._customData._animation = {}
  note._customData._animation._scale = [[1, 1, 1, 0.3], [3, 3, 2, 0.4,"easeOutElastic"]];
});

filterednotes = notesAt([111]);
filterednotes.forEach(note => {
  note._customData._noteJumpStartBeatOffset = 2;
  note._customData._animation = {}
  note._customData._animation._position = [[0, 0, 0, 0.25], [0, 6.9, 0, 0.45,"easeInCirc"]];
  note._customData._animation._scale = [[1, 1, 1, 0.2], [1.5, 30, 2, 0.45,"easeInCirc"]];
});

offestOnNotesBetweenRBSep("bootyR", "bootyB", 25, 28, 1, 2, 2)
offestOnNotesBetweenRBSep("pantsR1", "pantsB1", 32, 33.5, 1, 2, 2)
offestOnNotesBetweenRBSep("pantsR2", "pantsB2", 34, 35.5, 1, 2, 2)
offestOnNotesBetweenRBSep("mamaR", "mamaB", 48, 53.5, 1, 3, 3)
offestOnNotesBetweenRBSep("mindR", "mindB", 63, 63.5, 1, 2, -0.4)


_customEvents.push({
  _time: 21.5,
  _type: "AnimateTrack",
  _data: {
    _track: "FDAU",
    _duration: 1,
    _position: [[0, 0, 0, 0], [0, 2, 0, 1, "easeInBack"]],

  }
}, {
  _time: 23,
  _type: "AnimateTrack",
  _data: {
    _track: "FDAU",
    _duration: 0.5,
    _position: [[0, 2, 0, 0], [0, 0, 0, 1, "easeInSine"]],

  }
});

_customEvents.push({
  _time: 61.8,
  _type: "Animatetrack",
  _data: {
    _track: "mindR",
    _duration: 1,
    _position: [[0, 0, 0, 0.3], [1, -2, 0, 0.6], [0, 0, 0, 1, "easeInBack"]],

  }
});

_customEvents.push({
  _time: 0,
  _type: "AssignPathAnimation",
  _data: {
    _track: "bootyR",
    _duration: 2.5,
   //_easing: "easeOutCirc",
    _rotation: [[0, -45, 0, 0], [0, 10, 0, 0.1], [0, -10, 0, 0.3], [0, 0, 0, 0.4]],
  }
}, {
  _time: 0,
  _type: "AssignPathAnimation",
  _data: {
    _track: "bootyB",
    _duration: 2.5,
    //_easing: "easeOutCirc",
    _rotation: [[0, 45, 0, 0], [0, -10, 0, 0.1], [0, 10, 0, 0.3], [0, 0, 0, 0.4]],
  }
});

_customEvents.push({
  _time: 0,
  _type: "AnimateTrack",
  _data: {
    _track: "pantsB1",
    _duration: 1,
    _position: [[0, 0, 0, 0], [6.9, 0, 0, 1]],

  }
}, {
  _time: 0,
  _type: "AnimateTrack",
  _data: {
    _track: "pantsR1",
    _duration: 1,
    _position: [[0, 0, 0, 0], [-6.9, 0, 0, 1]],

  }
},{
  _time: 30.9,
  _type: "AnimateTrack",
  _data: {
    _track: "pantsB1",
    _duration: 1,
    _position: [[6.9, 0, 0, 0], [0, 0, 0, 1,"easeOutElastic"]],

  }
}, {
  _time: 31.9,
  _type: "AnimateTrack",
  _data: {
    _track: "pantsR1",
    _duration: 1,
    _position: [[-6.9, 0, 0, 0], [0, 0, 0, 1,"easeOutElastic"]],

  }
}, {
  _time: 0,
  _type: "AnimateTrack",
  _data: {
    _track: "pantsB2",
    _duration: 1,
    _position: [[0, 0, 0, 0], [6.9, 0, 0, 1,"easeOutElastic"]],

  }
}, {
  _time: 0,
  _type: "AnimateTrack",
  _data: {
    _track: "pantsR2",
    _duration: 1,
    _position: [[0, 0, 0, 0], [-6.9, 0, 0, 1,"easeOutElastic"]],

  }
}, {
  _time: 32.9,
  _type: "AnimateTrack",
  _data: {
    _track: "pantsB2",
    _duration: 1,
    _position: [[6.9, 0, 0, 0], [0, 0, 0, 1,"easeOutElastic"]],

  }
}, {
  _time: 33.9,
  _type: "AnimateTrack",
  _data: {
    _track: "pantsR2",
    _duration: 1,
    _position: [[-6.9, 0, 0, 0], [0, 0, 0, 1,"easeOutElastic"]],
  }
}, {
  _time: 0,
  _type: "AnimateTrack",
  _data: {
    _track: "befo",
    _duration: 1,
    _position: [[0, 0, 0, 0], [0, -10, 0, 1,"easeOutElastic"]],

  }
}, {
  _time: 34,
  _type: "AnimateTrack",
  _data: {
    _track: "befo",
    _duration: 2,
    _position: [[0, -10, 0, 0], [0, 0, 0, 1,"easeOutBack"]],

  }
});


_customEvents.push({
  _time: 0,
  _type: "AssignTrackParent",    //Does what you think it does. Parents a track to another child track. Anything done to the parent, will also be applied to children tracks.
  _data: {
    _childrenTracks: ["hlcyg"], // is an array, multiple tracks can be added as shown below
    //_childrenTracks: ["hlcyg", "example2", "example3", "ThisBitchCanFitSoManyChildrednInsideOfIt"],
    _parentTrack: "peepoClown",
  }
});

// Not going to comment out the rest as it's fairly easy to figure out past this point
_customEvents.push({
  _time: 0,
  _type: "AnimateTrack",
  _data: {
    _track: "peepoClown",
    _duration: 1,
    _position: [[0, 0, 0, 0], [0, 25, 0, 1]],
  }
}, {
  _time: 39,
  _type: "AnimateTrack",
  _data: {
    _track: "peepoClown",
    _duration: 3,
    _position: [[0, 25, 0, 0], [0, 0, 0, 1,"easeOutElastic"]],
  }
},{
  _time: 42,
  _type: "AnimateTrack",
  _data: {
    _track: "peepoClown",
    _duration: 2,
    _position: [[0, 0, 0, 0], [0, 0, 0, 1]],
  }
});

//HLCYG
_customEvents.push({
  _time: 44,
  _type: "AnimateTrack",
  _data: {
    _track: "hlcyg",
    _duration: 1,
   //_easing: "easeOutCirc",
    _scale: [[1.1, 0.8, 1, 0.2,"easeOutBack"], [1, 1.1, 1, 1,"easeOutBack"]],
  }
}, {
  _time: 45,
  _type: "AnimateTrack",
  _data: {
    _track: "hlcyg",
    _duration: 1,
   //_easing: "easeOutCirc",
    _scale: [[1.1, 0.69, 1, 0.9,"easeOutBack"], [1, 1, 1, 1]],
  }
}, {
  _time: 46,
  _type: "AnimateTrack",
  _data: {
    _track: "hlcyg",
    _duration: 0.5,
    _scale: [[1.2, 0.6, 1, 0.9,"easeOutBack"], [1, 1, 1, 1]],
  }
}, {
  _time: 46.5,
  _type: "AnimateTrack",
  _data: {
    _track: "hlcyg",
    _duration: 0.5,
   //_easing: "easeOutCirc",
    _scale: [[1.4, 0.4, 1, 0.9,"easeOutBack"], [1, 1, 1, 1]],
  }
},{
  _time: 47,
  _type: "AnimateTrack",
  _data: {
    _track: "hlcyg",
    _duration: 1,
   //_easing: "easeOutCirc",
    _scale: [[1.6, 0.2, 1, 0.9,"easeOutBack"], [1, 1, 1, 1]],
  }
});

_customEvents.push({
  _time: 0,
  _type: "AssignPathAnimation",
  _data: {
    _track: "mamaB",
    _duration: 3,
    _rotation: [[25, 0, 45, 0], [0, 0, 0, 0.5,"easeOutCirc"]],
    _position: [[10, 0, 0, 0], [0, 0, 0, 0.4, "easeOutBack"]],
    _localRotation: [[90, 0, -180, 0.1], [0, -90, 0, 0.2], [0, 0, 180, 0.3], [0, 0, 0, 0.4]],

  }
}, {
  _time: 0,
  _type: "AssignPathAnimation",
  _data: {
    _track: "mamaR",
    _duration: 3,
    _rotation: [[-25, 0, -45, 0], [0, 0, 0, 0.5,"easeOutCirc"]],
    _position: [[10, 0, 0, 0], [0, 0, 0, 0.4, "easeOutBack"]],
    _localRotation: [[90, 0, -180, 0.1], [0, -90, 0, 0.2], [0, 0, 180, 0.3], [0, 0, 0, 0.4]],

  }
});


_customEvents.push({
  _time: 0,
  _type: "AssignPathAnimation",
  _data: {
    _track: "bootyR",
    _duration: 3,
   //_easing: "easeOutCirc",
    _rotation: [[0, -45, 0, 0], [0, 10, 0, 0.1], [0, -10, 0, 0.3], [0, 0, 0, 0.45]],
  }
}, {
  _time: 0,
  _type: "AssignPathAnimation",
  _data: {
    _track: "bootyB",
    _duration: 3,
    //_easing: "easeOutCirc",
    _rotation: [[0, 45, 0, 0], [0, -10, 0, 0.1], [0, 10, 0, 0.3], [0, 0, 0, 0.45]],
  }
});





/* gross
_customEvents.push({
  _time: 0,
  _type: "AssignPathAnimation",
  _data: {
    _track: "mamaB",
    _duration: 3,
    _rotation: [[25, 0, 45, 0], [0, 0, 0, 0.5,"easeOutCirc"]],
    _position: [[10, 0, 0, 0], [0, 0, 0, 0.4, "easeOutCirc"]],
    _localRotation: [[90, 0, -180, 0.1], [0, -90, 0, 0.2], [0, 0, 180, 0.3], [0, 0, 0, 0.4]],

  }
}, {
  _time: 0,
  _type: "AssignPathAnimation",
  _data: {
    _track: "mamaR",
    _duration: 3,
    _rotation: [[-25, 0, -45, 0], [0, 0, 0, 0.5,"easeOutCirc"]],
    _position: [[-10, 0, 0, 0], [0, 0, 0, 0.4, "easeOutCirc"]],
    _localRotation: [[90, 0, -180, 0.1], [0, -90, 0, 0.2], [0, 0, 180, 0.3], [0, 0, 0, 0.4]],

  }
});
*/

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
