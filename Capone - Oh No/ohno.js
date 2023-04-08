"use strict";

const fs = require("fs");

const INPUT = "HardStandard.dat";
const OUTPUT = "ExpertStandard.dat";

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

function getJumps(njs, offset) {
  const _startHalfJumpDurationInBeats = 4;
  const _maxHalfJumpDistance = 18;
  const _startBPM = 176; //INSERT BPM HERE
  const bpm = 176; //AND HERE
  const _startNoteJumpMovementSpeed = 17; //NJS
  const _noteJumpStartBeatOffset = 0; //OFFSET

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
  dot._time += 0.05;
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
      _time: revealTime,
      _type: "AnimateTrack",
      _data: {
        _position: [
          [offset[0], offset[1], 0, 0],
          [0, 0, 0, 1, "easeOutElastic"]
        ],
        _scale: [
          [0.25, 0.25, 1, 0],
          [1.5, 1.5, 1, 0.5],
          [1, 1, 1, 1, "easeOutElastic"]
        ],
        _track: `stackThing${dot._time}`,
        _dissolve: [[1, 0]],
        _dissolveArrow: [[1, 0]],
        _duration: 1
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

// alternates beats --- don't use this it's kinda shit one time use but you get the idea maybe idk
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


//#region             -  -  -  -  -  -  -  -  -  -  -  -  -  DO YOUR DIRTY WORK HERE  -  -  -  -  -  -  -  -  -  -  -  -  -

// This one is gross and I hate everything about it. 
// Comments will kept minimal, check out other files like "We like to Party" or "Small shock" for details on what these events are/how they work




function ohno(startBeat, track) { // I wasn't about to copy/paste the same thing for every single note in this song, So I made it into an easy to call function!
  _pointDefinitions.push({ // This should not have been included in the function. A point defintion only has to be made ONCE. That's the whole point of them. 
    _name:"ohnoTime",
    _points:[ // First point in each array is for the notes "new" custom lifetime, and the second value is it's actual calculated lifetime
      [0.44,0], // when the note first spawns in, custom time is set midway through it's jump animation
      [0.4, 0.3,"easeOutCubic"], // from 0 - 0.3 of the notes life, the note's custom life reverses slightly give it a slight bounce back effect
      [1,1] // This should have been 0.5,0.5 (or slighty sooner at 0.48,0.48 as "0.5" is on beat when the note is cut. 
            // I had to make some funny timing changes to get everything to lined up and timed correctly later on.
    ]
  })
  filterednotes = _notes.filter(n => n._time > startBeat && n._time < startBeat+2);
  filterednotes.forEach(note => {
    note._customData._disableNoteGravity = true; // disables jump animation so note spawns already in it's final grid position instead of on the floor.
    note._customData._noteJumpMovementSpeed = 17;
});
  trackOnNotesBetween(track, startBeat, startBeat+2, 6);
  _customEvents.push({ // Every note assigned to this track will spawn in fully disolved/invisible
    _time: 0,
    _type: "AnimateTrack",
    _data: {
      _duration:1,
      _track:track,
      _dissolve: [[0, 0]],
      _dissolveArrow: [[0, 0]]
    }
  }, {
    _time: startBeat-4,    // fades in the note 4 beats before it is cut.
    _type: "AnimateTrack",
    _data: {
      _duration: 1,
      _track:track,
      _dissolve: [[0, 0], [1, 0.5]],
      _dissolveArrow: [[0, 0], [1, 1]]
    }
  }, {
    _time: startBeat-4,    // Animates the note "lifetime" based on the point defintion set above. 
    _type: "AnimateTrack",
    _data: {
      _time:"ohnoTime",
      _duration:10,
      _track:track,
    }
  });
}

// The rest of these are slightly modified cases that are either personalized for certain patterns, or slightly sped up to increase the intensity and pacing of the chart
function ohnoend(startBeat, track) {
  _pointDefinitions.push({ // more useless pint definiton push
    _name:"ohnoTime",
    _points:[
      [0.44,0],
      [0.4, 0.3,"easeOutCubic"],
      [1,1]
    ]
  })
  filterednotes = _notes.filter(n => n._time > startBeat && n._time < startBeat);
  filterednotes.forEach(note => {
    note._customData._disableNoteGravity = true;
    note._customData._noteJumpMovementSpeed = 17;
});
  trackOnNotesBetween(track, startBeat, startBeat, 6);
  _customEvents.push({
    _time: 0,
    _type: "AnimateTrack",
    _data: {
      _duration:1,
      _track:track,
      _dissolve: [[0, 0]],
      _dissolveArrow: [[0, 0]]
    }
  }, {
    _time: startBeat-4,
    _type: "AnimateTrack",
    _data: {
      _duration: 2,
      _track:track,
      _dissolve: [[0, 0], [1, 0.5]],
      _dissolveArrow: [[0, 0], [1, 1]]
    }
  }, {
    _time: startBeat-4,
    _type: "AnimateTrack",
    _data: {
      _time:"ohnoTime",
      _duration:10,
      _track:track,
    }
  });
}

function ohnonononono(startBeat, track) {
  _pointDefinitions.push({
    _name:"ohnononononoTime",
    _points:[
      [0.44,0],
      [0.4, 0.4,"easeOutCubic"],
      [1,1]
    ]
  })
  filterednotes = _notes.filter(n => n._time > startBeat && n._time < startBeat+2);
  filterednotes.forEach(note => {
    note._customData._disableNoteGravity = true;
    note._customData._noteJumpMovementSpeed = 17;
  });
  trackOnNotesBetween(track, startBeat, startBeat+2, 6);
  _customEvents.push({
    _time: 0,
    _type: "AnimateTrack",
    _data: {
      _duration:1,
      _track:track,
      _dissolve: [[0, 0]],
      _dissolveArrow: [[0, 0]]
    }
  }, {
    _time: startBeat-6,
    _type: "AnimateTrack",
    _data: {
      _duration: 4,
      _track:track,
      _dissolve: [[0, 0], [1, 1,"easeOutCubic"]],
      _dissolveArrow: [[0, 0], [1, 1,"easeOutCubic"]]
    }
  }, {
    _time: startBeat-6,
    _type: "AnimateTrack",
    _data: {
      _time:"ohnononononoTime",
      _duration:12,
      _track:track,
    }
  });
}
filterednotes = _notes.filter(n => n._time > 40 && n._time < 136);
filterednotes.forEach(note => {
  note._customData._noteJumpMovementSpeed = 17;
});

function ohnononononoend(startBeat, track) {
  _pointDefinitions.push({
    _name:"ohnononononoTime",
    _points:[
      [0.44,0],
      [0.4, 0.4,"easeOutCubic"],
      [1,1]
    ]
  })
  filterednotes = _notes.filter(n => n._time > startBeat && n._time < startBeat);
  filterednotes.forEach(note => {
    note._customData._disableNoteGravity = true;
    note._customData._noteJumpMovementSpeed = 17;
  });
  trackOnNotesBetween(track, startBeat, startBeat, 6);
  _customEvents.push({
    _time: 0,
    _type: "AnimateTrack",
    _data: {
      _duration:1,
      _track:track,
      _dissolve: [[0, 0]],
      _dissolveArrow: [[0, 0]]
    }
  }, {
    _time: startBeat-6,
    _type: "AnimateTrack",
    _data: {
      _duration: 4,
      _track:track,
      _dissolve: [[0, 0], [1, 1,"easeOutCubic"]],
      _dissolveArrow: [[0, 0], [1, 1,"easeOutCubic"]]
    }
  }, {
    _time: startBeat-6,
    _type: "AnimateTrack",
    _data: {
      _time:"ohnononononoTime",
      _duration:12,
      _track:track,
    }
  });
}


// setting NJS of the normal sections - In later scripts this was converted to a function.
filterednotes = _notes.filter(n => n._time > 40 && n._time < 136);
filterednotes.forEach(note => {
  note._customData._noteJumpMovementSpeed = 14;
});

filterednotes = _notes.filter(n => n._time >= 168 && n._time < 199);
filterednotes.forEach(note => {
  note._customData._noteJumpMovementSpeed = 14;
});

filterednotes = _notes.filter(n => n._time > 232 && n._time < 296);
  filterednotes.forEach(note => {
  note._customData._noteJumpMovementSpeed = 14;
});

filterednotes = _notes.filter(n => n._time > 328 && n._time < 360);
filterednotes.forEach(note => {
  note._customData._noteJumpMovementSpeed = 14;
}); 

filterednotes = _notes.filter(n => n._time > 392 && n._time < 456);
filterednotes.forEach(note => {
  note._customData._noteJumpMovementSpeed = 14;
}); 



// these are all the function calls for each cursed pattern in this stupid fucking map.
// If you look up at the original function parameters (line 446) you will see that 44 is the start beat, and "1" is the track name. 
ohno(44,"1")
ohno(48,"2")
ohnonononono(56,"3")
ohno(60,"4")
// random events are sprinkled just to personalize some of the patterns.
// This is why each pattern is given a unique track name instead of them all getting the same thing.
_customEvents.push({ 
  _time: 0,
  _type: "AnimateTrack",
  _data: {
    _duration:1,
    _track:"4",
    _position: [[-0.5,0,0,0]] // this one had to be centered as it was probably a single or three note width pattern I didn't want off to one side
  }
});
ohno(64,"5")
_customEvents.push({
  _time: 0,
  _type: "AnimateTrack",
  _data: {
    _duration:1,
    _track:"5",
    _position: [[-0.5,0,0,0]]
  }
});
ohnonononono(72,"6")
ohno(76,"7")
ohno(80,"8")
_customEvents.push({
  _time: 0,
  _type: "AnimateTrack",
  _data: {
    _duration:1,
    _track:"8",
    _position: [[-0.5,0,0,0]]
  }
});
ohnonononono(88,"9")
ohno(92,"10")
ohno(96,"11")
ohnonononono(104,"12")
ohno(108,"13")
ohno(112,"14")
_customEvents.push({
  _time: 0,
  _type: "AnimateTrack",
  _data: {
    _duration:1,
    _track: "14",
    _position: [[-0.5,0,0,0]]
  }
});
ohnonononono(120,"15")
ohno(124,"16")
_customEvents.push({
  _time: 0,
  _type: "AnimateTrack",
  _data: {
    _duration:1,
    _track:"16",
    _position: [[-0.5,0,0,0]]
  }
});
ohno(128,"17")
ohnononononoend(136,"18")



ohno(172,"19")
ohnoend(176,"20") 
ohnonononono(184,"21")
ohno(188,"22")
ohno(192,"23") 
_customEvents.push({
  _time: 0,
  _type: "AnimateTrack",
  _data: {
    _duration:1,
    _track: "23",
    _position: [[-0.5,0,0,0]]
  }
});
ohnononononoend(200,"24")  
_customEvents.push({
  _time: 0,
  _type: "AnimateTrack",
  _data: {
    _duration:1,
    _track: "24",
    _position: [[-0.5,0,0,0]]
  }
});
ohno(236,"25")
ohno(240,"26")  
ohnonononono(248,"27")
ohno(252,"28")
ohno(256,"29") 
ohnonononono(264,"30")
ohno(268,"31")
ohno(272,"32") 
ohnonononono(280,"33") 
ohno(284,"34")
_customEvents.push({
  _time: 0,
  _type: "AnimateTrack",
  _data: {
    _duration:1,
    _track: "34",
    _position: [[-0.5,0,0,0]]
  }
});
ohno(288,"35") 
ohnononononoend(296,"36")




ohno(332,"37")
ohno(336,"38") 
ohnonononono(344 ,"39")
ohno(348,"40")
ohno(352,"41") 
ohnononononoend(360 ,"42")


ohno(396,"43")
ohno(400,"44") 
ohnonononono(408 ,"45")
ohno(412,"46")
ohno(416,"47") 
ohnonononono(424 ,"48")
ohno(428,"49")
ohno(432,"50") 
ohnonononono(440 ,"51")
ohno(444,"52")
ohno(448,"53") 
ohnononononoend(456 ,"55")

// This section displays a bunch of notes that the player thinks they should cut, but dissolves them out as they approach the player to act as a little "fake-out"
filterednotes = _notes.filter(n => n._time > 264 && n._time < 265);
filterednotes.forEach(note => {
  note._customData._animation = {}
  note._customData._animation._dissolve = [[1,0.4],[0,0.42]]
  note._customData._animation._dissolveArrow = [[1,0.4],[0,0.42]]
  note._customData._fake = true;  // This removes the notes/walls from score calculation
    // note: Makeing a note fake means you are still able to cut it, but it just won't affect scoring. | use "_interactable" if you don't want to cut the note.
});

// Dissolves out the end notes. 
filterednotes = _notes.filter(n => n._time > 486 && n._time <=488);
filterednotes.forEach(note => {
  note._customData._animation = {}
  note._customData._animation._dissolve = [[1,0.3],[0,0.35]]
  note._customData._animation._dissolveArrow = [[1,0.3],[0,0.35]] 
  note._customData._fake = true;  
});



//#endregion           -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  STOP  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -






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
