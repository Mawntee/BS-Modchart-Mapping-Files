// GitHub Note: Please refer to the "FunV3 script instead.
// This is essentially the same thing as that, but slightly modified to match the mapping, and nerf some of the notemod gimmicks.
// Other than four three lines, none of this code was edited or commented on before uploading.
// Things in here will probably be confusing to look at or unimportant.



"use strict";

const fs = require("fs");

const lightsPath = "Lightshow.dat";
const convertV2toV3 = true;
let ClearOldEvents = true;

const INPUT = "EasyLawless.dat";
const OUTPUT = "ExpertLawless.dat";

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





difficulty.customData = { materials: {}, pointDefinitions: {}, environment: [], customEvents: [], fakeColorNotes: [], fakeBombNotes: [], fakeObstacles: [], fakeBurstSliders: [] };



const customData = difficulty.customData;
const obstacles = difficulty.obstacles;
const notes = difficulty.colorNotes; 
const burstSliders = difficulty.burstSliders; 
const sliders = difficulty.sliders; 
const bombs = difficulty.bombNotes; 
const events = difficulty.basicBeatmapEvents;
const customEvents = customData.customEvents;
const pointDefinitions = customData.pointDefinitions;
const environment = customData.environment;
const geometry = customData.environment.geometry;
const materials = customData.materials;
const fakeNotes = customData.fakeColorNotes;
const fakeBombs = customData.fakeBombNotes;
const fakeObstacles  = customData.fakeObstacles;
const fakeBurstSliders = customData.fakeBurstSliders;

let filterednotes;
let filteredSliders;
let filteredburstSliders;
let filteredevents;
let filteredobstacles;
let filteredbombs;
let filteredsliders;

obstacles.forEach(wall => {
  if (!wall.customData) {
    wall.customData = {};
  }
});
notes.forEach(note => {
  if (!note.customData) {
    note.customData = {};
  }
});

bombs.forEach(bomb => {
  if (!bomb.customData) {
    bomb.customData = {};
  }
});

sliders.forEach(slider => {
  if (!slider.customData) {
    slider.customData = {};
  }
});

burstSliders.forEach(burstSlider => {
  if (!burstSlider.customData) {
    burstSlider.customData = {};
  }
});

if (!environment.geometry) {
  environment.geometry = {};
}



//#region DEAD helper functions -  -  -  -  -  -  -  -  -  -  -  -  -   These make life a LOT eassier, look through, figure out what they do, add your own, have fun :)  --- many are very specific use cases and might need to be modified depnding on use.

function getJumps(njs, offset) {
  const _startHalfJumpDurationInBeats = 4;
  const _maxHalfJumpDistance = 18;
  const _startBPM = 202; //INSERT BPM HERE -  -  -  -  -  -  -  -  -  -  -  -  -  
  const bpm = 202; //AND HERE -  -  -  -  -  -  -  -  -  -  -  -  -  
  const _startNoteJumpMovementSpeed = 18; //NJS -  -  -  -  -  -  -  -  -  -  -  -  -  
  const _noteJumpStartBeatOffset = -0.25; //OFFSET -  -  -  -  -  -  -  -  -  -  -  -  -  

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

function offsetOnNotesBetween(p1, p2, offset) {
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

function glitchPos(beat, endBeat) {
  filterednotes = _notes.filter(n => n._time > beat && n._time <= endBeat);
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
      note._customData._animation._rotation = [[rnd(-60,60),rnd(-20,20),rnd(-69,69),0],[0,0,0,0.45,"easeInOutSine"]]
      note._customData._animation._localRotation = [[rnd(-15,15),rnd(-20,20),rnd(-69,69),0],[rnd(-69,69),rnd(-69,69),rnd(160,200),0.25,"easeInOutSine"],[0,0,0,0.5,"easeOutQuad"]]
      note._customData._animation._position = [[0,0,pos,0], [0,0,0,0.5, "easeOutQuad"]];
      for (let index = 1; index <= amount; index++) {
        let n1 = JSON.parse(JSON.stringify(note));
        n1._time -= index*0.125;
        n1._customData._track = "fakenote";
        n1._customData._animation = {};
        n1._customData._animation._rotation = [[rnd(-85,85), rnd(-85,85), rnd(-45,45), 0], [0,0,0,0.375, "easeOutSine"]];
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

function RBFlash(Start, End, trackR, trackB, interval) {
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
        workWith._customData._color = [0, 0, 0, -1000];
        workWith._customData._animation = {}
        workWith._customData._animation._definitePosition = [[0,0,0,0]];
        _obstacles.push(workWith);
      });
  }
}

function writeTextEnv(text, track, time, duration) {
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
        workWith._customData._color = [-100, -100, -100, 0];
        workWith._customData._animation = {}
        workWith._customData._animation._definitePosition = [[0,0,0,0]];
        workWith._customData._animation._dissolve = [[0,0],[1,0.15,"easeOutQuad"]]
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
//#endregion





//#region FIXED FUNCTIONS
function lerp(v0, v1, t) {
  return v0 * (1 - t) + v1 * t;
}

function rnd(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

function notesAt(times) {
  return notes.filter(n => times.some(t => n.b == t));
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

function trackOnNotesBetween(track, p1, p2) {
  filterednotes = notes.filter(n => n.b >= p1 && n.b <= p2);
  filterednotes.forEach(note => {
    if (!note.customData.track) {
    note.customData.track = track;
    }
    else {
      if(Array.isArray(note.customData.track)) {
        note.customData.track.push(track);
      }
      else {
        let prevTrack = note.customData.track;
        note.customData.track = [prevTrack];
        note.customData.track.push(track);
      }
    }
  });
  return filterednotes;
}

function trackOnNotesBetweenRBSep(trackR, trackB, p1, p2) {
  filterednotes = notes.filter(n => n.b >= p1 && n.b <= p2);
  filterednotes.forEach(note => {
  if (!note.customData.track) {
    if (note.c == 0) {
      note.customData.track = trackR;
    }
    if (note.c == 1) {
      note.customData.track = trackB;
    }
  }
  else {
    if(Array.isArray(note.customData.track)) {
      if (note.c == 0) {
      note.customData.track.push(trackR);
      }
      if (note.c == 0) {
        note.customData.track.push(trackB);
        }
    }
    else {
      let prevTrack = note.customData.track;
      note.customData.track = [prevTrack];
      if (note.c == 0) {
        note.customData.track.push(trackR);
        }
        if (note.c == 0) {
          note.customData.track.push(trackB);
          }
    }
  }
  });
  return filterednotes;
}

function offestOnNotesBetweenRBSep(start, end, potentialOffset, offsetR, offsetB ) {
  filterednotes = notes.filter(n => n.b >= start && n.b <= end);
  filterednotes.forEach(note => {
    if (typeof potentialOffset !== "undefined") {
      note.customData.noteJumpStartBeatOffset = potentialOffset;
    }
    if (note.c == 0) {
      note.customData.noteJumpStartBeatOffset = offsetR;
    }
    if (note.c == 1) {
      note.customData.noteJumpStartBeatOffset = offsetB;
    }
  });
  filteredburstSliders = burstSliders.filter(n => n.b >= start && n.b <= end);
  filteredburstSliders.forEach(burstSliders => {
    if (typeof potentialOffset !== "undefined") {
      burstSliders.customData.noteJumpStartBeatOffset = potentialOffset;
    }
    if (burstSliders.c == 0) {
      burstSliders.customData.noteJumpStartBeatOffset = offsetR;
    }
    if (burstSliders.c == 1) {
      burstSliders.customData.noteJumpStartBeatOffset = offsetB;
    }
  });
  return filteredburstSliders && filterednotes;
}

function trackOnNotesBetweenDirSep( p1, p2, trackUp, trackDown, trackLeft, trackRight, trackUpLeft, trackUpRight, trackDownLeft, trackDownRight, trackDot) {
  filterednotes = notes.filter(n => n.b >= p1 && n.b <= p2);
  filterednotes.forEach(note => {
    if (!note.customData.track) {
      if (note.d == 0) {
        note.customData.track = trackUp;
      }
      if (note.d == 1) {
        note.customData.track = trackDown;
      }
      if (note.d == 2) {
        note.customData.track = trackLeft;
      }
      if (note.d == 3) {
        note.customData.track = trackRight;
      }
      if (note.d == 4) {
        note.customData.track = trackUpLeft;
      }
      if (note.d == 5) {
        note.customData.track = trackUpRight;
      }
      if (note.d == 6) {
        note.customData.track = trackDownLeft;
      }
      if (note.d == 7) {
        note.customData.track = trackDownRight;
      }
      if (note.d == 8) {
        note.customData.track = trackDot;
      }
  }
  else {
    if(Array.isArray(note.customData.track)) {
      if (note.d == 0) {
        note.customData.track.push(trackUp);
      }
      if (note.d == 1) {
        note.customData.track.push(trackDown);
      }
      if (note.d == 2) {
        note.customData.track.push(trackLeft);
      }
      if (note.d == 3) {
        note.customData.track.push(trackRight);
      }
      if (note.d == 4) {
        note.customData.track.push(trackUpLeft);
      }
      if (note.d == 5) {
        note.customData.track.push(trackUpRight);
      }
      if (note.d == 6) {
        note.customData.track.push(trackDownLeft);
      }
      if (note.d == 7) {
        note.customData.track.push(trackDownRight);
      }
      if (note.d == 8) {
        note.customData.track.push(trackDot);
      }
    }
    else {
      let prevTrack = note.customData.track;
      note.customData.track = [prevTrack];
      if (note.d == 0) {
        note.customData.track.push(trackUp);
      }
      if (note.d == 1) {
        note.customData.track.push(trackDown);
      }
      if (note.d == 2) {
        note.customData.track.push(trackLeft);
      }
      if (note.d == 3) {
        note.customData.track.push(trackRight);
      }
      if (note.d == 4) {
        note.customData.track.push(trackUpLeft);
      }
      if (note.d == 5) {
        note.customData.track.push(trackUpRight);
      }
      if (note.d == 6) {
        note.customData.track.push(trackDownLeft);
      }
      if (note.d == 7) {
        note.customData.track.push(trackDownRight);
      }
      if (note.d == 8) {
        note.customData.track.push(trackDot);
      }
    }
  }
  });
  return filterednotes;
}

function offsetNJSOnNotesBetween(p1, p2, NJS, offset) {
  filterednotes = notes.filter(n => n.b >= p1 && n.b <= p2);
  filterednotes.forEach(note => {
      note.customData.noteJumpStartBeatOffset = offset;
      note.customData.noteJumpMovementSpeed = NJS;
  });
  filteredburstSliders = burstSliders.filter(n => n.b >= p1 && n.b <= p2);
  filteredburstSliders.forEach(burstSliders => {
    burstSliders.customData.noteJumpStartBeatOffset = offset;
    burstSliders.customData.noteJumpMovementSpeed = NJS;
  });
  filteredSliders = sliders.filter(s => s.b >= p1 && s.b <= p2);
  filteredSliders.forEach(sliders => {
    sliders.customData.noteJumpStartBeatOffset = offset;
    sliders.customData.noteJumpMovementSpeed = NJS;
  });
  return filteredSliders && filteredburstSliders && filterednotes;
}

function trackOnNotesBetweenLaneSep(trackLane1, trackLane2, trackLane3, trackLane4, p1, p2) {
  filterednotes = notes.filter(n => n.b >= p1 && n.b <= p2);
  filterednotes.forEach(note => {
    if (!note.customData.track) {
      if (note.x == 0) {
        note.customData.track = trackLane1;
      }
      if (note.x == 1) {
        note.customData.track = trackLane2;
      }
      if (note.x == 2) {
        note.customData.track = trackLane3;
      }
      if (note.x == 3) {
        note.customData.track = trackLane4;
      }
    }
    else {
      if(Array.isArray(note.customData.track)) {
        if (note.x == 0) {
          note.customData.track.push(trackLane1);
        }
        if (note.x == 1) {
          note.customData.track.push(trackLane2);
        }
        if (note.x == 2) {
          note.customData.track.push(trackLane3);
        }
        if (note.x == 3) {
          note.customData.track.push(trackLane4);
        }
      }
      else {
        let prevTrack = note.customData.track;
        note.customData.track = [prevTrack];
          if (note.x == 0) {
            note.customData.track.push(trackLane1);
          }
          if (note.x == 1) {
            note.customData.track.push(trackLane2);
          }
          if (note.x == 2) {
            note.customData.track.push(trackLane3);
          }
          if (note.x == 3) {
            note.customData.track.push(trackLane4);
          }
      }
    }
  });
  return filterednotes;
}





//#endregion

//#region COPY/PASTE   -  -  -  -  -  -  -  -  -  -  -  -  -  use these as a copy/paste template for the lazy   -  -  -  -  -  -  -  -  -  -  -  -  -  
/*

Check out the aimation docs for examples of just about everything featured here:
https://github.com/Aeroluna/Heck/wiki/AnimationProperties


//---------------------------------------------- NOTES & WALLS ----------------------------------------------

filterednotes = notesAt([69]);
filterednotes.forEach(note => {
  
});

filterednotes = notes.filter(n => n.b >= 69 && n.b <= 420);
filterednotes.forEach(note => {
  note.customData.track = "dumbTrackNameHere";
  note.customData.noteJumpStartBeatOffset = 69;
  note.customData.noteJumpMovementSpeed = 420;
  note.customData.flip = [x, y];
  note.customData.spawnEffect = false;
  note.customData.disableNoteGravity = true;
  note.customData.disableNoteLook = true;
  note.customData.uninteractable = true;
  note.customData.coordinates = [x, y];
  note.customData.worldRotation = [x, y, z];
  note.customData.localRotation = [x, y, z];
  note.customData.color = [r, g, b, a];
  note.customData.animation = {}
  note.customData.animation.offsetPosition = [[x, y, z, t], [x, y, z, 0.5,"easeOutElastic"]];
  note.customData.animation.offsetWorldRotation = [[pitch, yaw, roll, time], [pitch, yaw, roll, 0.5,"easeOutElastic"]];
  note.customData.animation.scale = [[x, y, z, time], [x, y, z, time]]; 
  note.customData.animation.dissolveArrow = [[0,0], [1,0.5]]; 
  note.customData.animation.interactable = [[0,02499], [1,0.25]];
});



obstacles.push({
  b: 69,
  x: 0,
  y: 0,   //base 0-2
  d: 420, //duration
  h: 0,   //height 1-5
  w: 0,   //width
  customData:{
    track = "dumbTrackNameHere";
    noteJumpStartBeatOffset = 69;
    noteJumpMovementSpeed = 420;
    uninteractable = true;
    coordinates = [x, y];
    worldRotation = [x, y, z];
    localRotation = [x, y, z];
    size: [w, h, l];
    color = [r, g, b, a];
    animation = {}
    animation.offsetPosition = [[x, y, z, t], [x, y, z, 0.5,"easeOutElastic"]];
    animation.offsetWorldRotation = [[pitch, yaw, roll, time], [pitch, yaw, roll, 0.5,"easeOutElastic"]];
    animation.scale = [[x, y, z, time], [[x, y, z, time]]; 
    animation.interactable = [[0,0.2499], [1,0.25]];
  }
});


//---------------------------------------------- EVENTS ----------------------------------------------

pointDefinitions.push({
  _name: "pointDefExample",
  _points: pointDefExample(0.69, 0, 0, 50)
});

----- Color is on a scale from 0 - 1, and NOT 0 - 255 -----

customEvents.push({
  b: 69,
  t: "AnimateTrack",
  d: {
    track: "dumbTrackNameHere",
    duration: 420,
    easing: "easeOutQuad",
    offsetPosition: [[x, y, z, time, (optional)easing], [0, 10, 10, 1]],
    offsetWorldRotation: [[pitch, yaw, roll, time, (optional)easing], [0, 0, 180, 1]],
    localRotation: [[pitch, yaw, roll, time, (optional)easing], [0, 0, 180, 1]],
    scale: [[x, y, z, time], [[x, y, z, time]],
    dissolve: [[dissolve, time, (optional)easing], [1, 1]],
    dissolveArrow: [[1, 0], [0, 1]],
    color: [[red, green, blue, alpha, time, (optional)easing]]
  }
});       

customEvents.push({
  b: 69,
  t: "AssignPathAnimation",
  d: {
    track: "dumbTrackNameHere",
    duration: 420,
    easing: "easeOutQuad",
    definitePosition: [[x, y, z, time, (optional)easing], [0, 10, 10, 1]],
    offsetPosition: [[x, y, z, time, (optional)easing], [0, 10, 10, 1]],
    offsetWorldRotation: [[pitch, yaw, roll, time, (optional)easing], [0, 0, 180, 1]],
    localRotation: [[pitch, yaw, roll, time, (optional)easing], [0, 0, 180, 1]],
    scale: [[x, y, z, time], [x, y, z, time]],
    dissolve: [[dissolve, time, (optional)easing], [1, 1]],
    dissolveArrow: [[1, 0], [0, 1]],
    color: [[red, green, blue, alpha, time, (optional)easing]],
    interactable: [[0,02499], [1,0.25]];
  }
});  


customEvents.push({
  b: 69,
  t: "AssignPlayerToTrack",
  d: {
  track: "playerTrack" 
  }
});

customEvents.push({
  b: 0,
  t: "AssignTrackParent",
  d: {
  childrenTracks: ["heckTrack", "frigTrack"], 
  parentTrack: "dumbTrackNameHere" ,
  worldPositionStays: true,
  }
});


//---------------------------------------------- ENVIRONMENTS ----------------------------------------------
----- Dividing position values by 0.6 will convert them to Meters, just putting in standard values will act as "Noodle Units" ----- 
----- 1 unit = 1 Lane  |  1/0.6 = 1 Meter ----- 


environment.push({
  id: "Environment\\.\\[\\d*\\]BottomGlow$",
  lookupMethod: "Regex", // Regex, Exact, Contains, StartsWith, EndsWith
  scale: [69, 1, 1]
  //components: // see below
  duplicate: 1,
  active: true,
  scale: [x, y, z],
  position: [x, y, z],
  localPosition: [x, y, z],
  rotation: [x, y, z],
  localRotation: [x, y, z],
  track: "dumbTrackNameHere"
});

// Components for the thing:

ILightWithId
  lightID: Which ID to assign. For use with the lightID tag for lighting events (Not animateable)
  type: Which event type to active on. (Not animateable)
BloomFogEnvironment: Will always be found on the [0]Environment object.
  attenuation: attenuation is the fog density. logarithmic
  offset: offset I have no idea
  startY: startY is starting Y of the gradient thing
  height: height is the gradient length of the dissolving plane fog
TubeBloomPrePassLight
  colorAlphaMultiplier
  bloomFogIntensityMultiplier



customEvents.push({
  b: 69, // Time in beats.
  t: "AnimateComponent",
  d: {
    track: string // The track you want to animate.
    duration: float, // The length of the event in beats (defaults to 0).
    easing: string, // An easing for the animation to follow (defaults to easeLinear).
    component name: { // name of component
      field name: point definition // name of field on component
    }
  }
}

customEvents.push({
  b: 0,
  t: "AssignFogTrack",
  d: {
    track: "pogFog"
  }
}); 
customEvents.push({
  b: 69,
  t: "AnimateComponent",
  d: {
    track: "pogFog",
    duration: 0,
    attenuation: [value, time, (optional)easing],
    offset: [[value, time, (optional)easing]],
    startY: [[value, time, (optional)easing]],
    height: [[value, time, (optional)easing]],
  }
}); 







filterednotes = notes.filter(n => n.b >= 0 && n.b <= 420);
filterednotes.forEach(note => {
  let n1 = JSON.parse(JSON.stringify(note));
    n1.b -= 0.025;
    n1.customData.track = "fakeNote";
    n1.customData.animation = {}
    n1.customData.animation.offsetPosition = [[-12, 0, 0, 0]];
    n1.customData.uninteractable = true;
    n1.customData.spawnEffect = false;
      fakeNotes.push(n1);
});

filterednotes = bombs.filter(n => n.b >= 0 && n.b <= 420);
filterednotes.forEach(bomb => {
  let b1 = JSON.parse(JSON.stringify(bomb));
    b1.b -= 0.025;
    b1.customData.track = "fakeBomb";
    b1.customData.animation = {}
    b1.customData.animation.offsetPosition = [[-12, 0, 0, 0]];
    b1.customData.uninteractable = true;
    b1.customData.spawnEffect = false;
      fakeBombs.push(b1);
});

filterednotes = obstacles.filter(n => n.b >= 0 && n.b <= 420);
filterednotes.forEach(wall => {
  let w1 = JSON.parse(JSON.stringify(wall));
    w1.b -= 0.025;
    w1.customData.track = "fakeWall";
    w1.customData.animation = {}
    w1.customData.animation.offsetPosition = [[-12, 0, 0, 0]];
    w1.customData.uninteractable = true;
    w1.customData.spawnEffect = false;
      fakeObstacles.push(w1);
});

filterednotes = burstSliders.filter(n => n.b >= 0 && n.b <= 420);
filterednotes.forEach(chain => {
  let c1 = JSON.parse(JSON.stringify(chain));
    c1.b -= 0.025;
    c1.customData.track = "fakeChain";
    c1.customData.animation = {}
    c1.customData.animation.offsetPosition = [[-12, 0, 0, 0]];
    c1.customData.uninteractable = true;
    c1.customData.spawnEffect = false;
      fakeBurstSliders.push(c1);
});

filterednotes = sliders.filter(n => n.b >= 0 && n.b <= 420);
filterednotes.forEach(slider => {
  let s1 = JSON.parse(JSON.stringify(slider));
    s1.b -= 0.025;
    s1.customData.track = "fakeSlider";
    s1.customData.animation = {}
    s1.customData.animation.offsetPosition = [[-12, 0, 0, 0]];
    s1.customData.uninteractable = true;
    s1.customData.spawnEffect = false;
      sliders.push(s1);
});

*/
//#endregion








//#region                       -  -  -  -  -  -  -  -  -  -  -  -  -  DO YOUR DIRTY WORK HERE  -  -  -  -  -  -  -  -  -  -  -  -  -




// NJS changes
offsetNJSOnNotesBetween(1, 1337, 16, -0.25)

offsetNJSOnNotesBetween(1, 39.125, 14, -2.0)

offsetNJSOnNotesBetween(39.5, 79, 16, -0.25)

offsetNJSOnNotesBetween(79.1, 84.1, 16, -0.25)

offsetNJSOnNotesBetween(84, 100, 16, -0.125)

offsetNJSOnNotesBetween(105, 137, 16, -0.25)

offsetNJSOnNotesBetween(137, 161, 16, -0.125)

offsetNJSOnNotesBetween(161.1, 164.1, 14,-2) 

offsetNJSOnNotesBetween(164.2, 197.9, 16,-0.25)

offsetNJSOnNotesBetween(198, 199.25, 16, 0)
offsetNJSOnNotesBetween(199.3, 264.1, 16, -0.25)
offsetNJSOnNotesBetween(226.1, 131.5, 16, -0.125)
offsetNJSOnNotesBetween(257, 260.5, 16, -0.25)

offsetNJSOnNotesBetween(264.25, 295.75, 14, -2.0)

offsetNJSOnNotesBetween(296, 297, 12, -2.0)

offsetNJSOnNotesBetween(298, 301, 14, -2.0)

offsetNJSOnNotesBetween(301, 303, 16, -0.25)

offsetNJSOnNotesBetween(306, 329, 14,-2)

offsetNJSOnNotesBetween(331, 361, 16, -0.125)

offsetNJSOnNotesBetween(361, 397, 16, -0.25)

offsetNJSOnNotesBetween(397, 494, 18, -0.25)

offsetNJSOnNotesBetween(494.1, 1337, 16, -0.125)

filterednotes = notes.filter(n => n.b >= 103 && n.b <= 104.5);
filterednotes.forEach(note => {
  note.customData.track = "shlapper";
  note.customData.noteJumpStartBeatOffset = 6;
  note.customData.noteJumpMovementSpeed = 16;
  note.customData.spawnEffect = false;
  note.customData.animation = {}
  note.customData.animation.offsetPosition = [[0,0,-37.5,0], [0,0,0,0.4875, "easeInOutQuad"]];
});


filterednotes = notes.filter(n => n.b >= 164 && n.b <= 169);
filterednotes.forEach(note => {
  note.customData.track = "shlapper";
  note.customData.noteJumpStartBeatOffset = 4;
  note.customData.noteJumpMovementSpeed = 16;
  note.customData.spawnEffect = false;
  note.customData.animation = {}
  note.customData.animation.offsetPosition = [[rnd(-12,12)*0.1,rnd(-12,12)*0.1,-18,0], [0,0,0,0.4875, "easeInOutQuad"]];
  note.customData.animation.localRotation  = [[rnd(-65,65),rnd(-65,65),rnd(-89,89),0], [0,0,0,0.4375, "easeOutBack"]];
  note.customData.animation.dissolveArrow = [[0,0], [1,0.4375, "easeInOutQuad"]];
  note.customData.animation.dissolve = [[0,0], [1,0.375, "easeOutQuad"]];
});

filterednotes = notes.filter(n => n.b >= 171 && n.b <= 173);
filterednotes.forEach(note => {
  note.customData.track = "shlapper";
  note.customData.noteJumpStartBeatOffset = 6;
  note.customData.noteJumpMovementSpeed = 16;
  note.customData.spawnEffect = false;
  note.customData.animation = {}
  note.customData.animation.offsetPosition = [[rnd(-22,22)*0.1,rnd(-22,22)*0.1,-32,0], [0,0,0,0.4875, "easeInOutQuad"]];
  note.customData.animation.localRotation  = [[rnd(-65,65),rnd(-65,65),rnd(-89,89),0], [0,0,0,0.4875, "easeOutBack"]];
  note.customData.animation.dissolveArrow = [[0,0.125], [1,0.375, "easeInOutQuad"]];
});

filterednotes = notes.filter(n => n.b >= 178 && n.b <= 181);
filterednotes.forEach(note => {
  note.customData.track = "shlapper";
  note.customData.noteJumpStartBeatOffset = 4;
  note.customData.noteJumpMovementSpeed = 14;
  note.customData.spawnEffect = false;
  note.customData.animation = {}
  note.customData.animation.offsetPosition = [[rnd(-2,2)*0.1,rnd(-2,2)*0.1,-22,0], [0,0,0,0.4375, "easeInOutQuad"]];
  note.customData.animation.localRotation  = [[rnd(-35,35),rnd(-35,35),rnd(-55,55),0], [0,0,0,0.375, "easeOutBack"]];
  note.customData.animation.dissolveArrow = [[0,0], [1,0.375, "easeOutCubic"]];
  note.customData.animation.dissolve = [[0,0], [1,0.25, "easeOutCubic"]];
});
filteredbombs = bombs.filter(b => b.b >= 178 && b.b <= 181);
filterednotes.forEach(bomb => {
  bomb.customData.track = "shlapper";
  bomb.customData.noteJumpStartBeatOffset = 4;
  bomb.customData.noteJumpMovementSpeed = 14;
  bomb.customData.spawnEffect = false;
  bomb.customData.animation = {}
  bomb.customData.animation.offsetPosition = [[rnd(-2,2)*0.1,rnd(-2,2)*0.1,-22,0], [0,0,0,0.4375, "easeInOutQuad"]];
  bomb.customData.animation.localRotation  = [[rnd(-35,35),rnd(-35,35),rnd(-55,55),0], [0,0,0,0.375, "easeOutBack"]];
  bomb.customData.animation.dissolveArrow = [[0,0], [1,0.375, "easeOutCubic"]];
  bomb.customData.animation.dissolve = [[0,0], [1,0.25, "easeOutCubic"]];
});

filterednotes = notes.filter(n => n.b >= 183 && n.b <= 185);
filterednotes.forEach(note => {
  note.customData.track = "shlapper";
  note.customData.noteJumpStartBeatOffset = 6;
  note.customData.noteJumpMovementSpeed = 16;
  note.customData.spawnEffect = false;
  note.customData.animation = {}
  note.customData.animation.offsetPosition = [[rnd(-22,22)*0.1,rnd(-22,22)*0.1,-32,0], [0,0,0,0.4875, "easeInOutQuad"]];
  note.customData.animation.localRotation  = [[rnd(-65,65),rnd(-65,65),rnd(-89,89),0], [0,0,0,0.4875, "easeOutBack"]];
  note.customData.animation.dissolveArrow = [[0,0], [1,0.4875, "easeInOutQuad"]];
  note.customData.animation.dissolve = [[0,0], [1,0.375, "easeOutQuad"]];
});

filterednotes = notes.filter(n => n.b >= 188 && n.b <= 189);
filterednotes.forEach(note => {
  note.customData.track = "shlapper";
  note.customData.noteJumpStartBeatOffset = 4;
  note.customData.noteJumpMovementSpeed = 16;
  note.customData.spawnEffect = false;
  note.customData.animation = {}
  note.customData.animation.offsetPosition = [[rnd(-22,22)*0.1,rnd(-22,22)*0.1,-22,0], [0,0,0,0.4875, "easeInOutQuad"]];
  note.customData.animation.localRotation  = [[rnd(-65,65),rnd(-65,65),rnd(-89,89),0], [0,0,0,0.4875, "easeOutBack"]];
  note.customData.animation.dissolveArrow = [[0,0], [1,0.4875, "easeInOutQuad"]];
  note.customData.animation.dissolve = [[0,0], [1,0.375, "easeOutQuad"]];
});

filterednotes = notes.filter(n => n.b >= 191 && n.b <= 197.75);
filterednotes.forEach(note => {
  note.customData.track = "shlapper";
  note.customData.noteJumpStartBeatOffset = 4;
  note.customData.noteJumpMovementSpeed = 16;
  note.customData.spawnEffect = false;
  note.customData.animation = {}
  note.customData.animation.offsetPosition = [[rnd(-22,22)*0.1,rnd(-22,22)*0.1,-12.5,0], [0,0,0,0.4875, "easeInOutQuad"]];
  note.customData.animation.localRotation  = [[rnd(-65,65),rnd(-65,65),rnd(-89,89),0], [0,0,0,0.4875, "easeOutBack"]];
});

filterednotes = notes.filter(n => n.b >= 303 && n.b <= 305);
filterednotes.forEach(note => {
  note.customData.track = "shlapper";
  note.customData.noteJumpStartBeatOffset = 12;
  note.customData.noteJumpMovementSpeed = 16;
  note.customData.spawnEffect = false;
  note.customData.animation = {}
  note.customData.animation.offsetPosition = [[3,-1,-65,0], [0,0,0,0.4875, "easeInOutQuad"]];
  note.customData.animation.localRotation  = [[rnd(-65,65),rnd(-65,65),rnd(-89,89),0], [0,0,0,0.4875, "easeOutBack"]];
  note.customData.animation.dissolve = [[0,0.375], [1,0.4375, "easeInOutBounce"], [0.25,0.475, "easeInOutBounce"], [1,0.4875, "easeOutBounce"]];
  note.customData.animation.dissolveArrow = [[0,0], [1,0.4875, "easeInBounce"]];
});

customEvents.push({
  b: 0,
  t: "AnimateTrack",
  d: {
    track: "shlapper",
    dissolve: [[0, 0]],
    dissolveArrow: [[0, 0]],
  }
},{
  b: 98.5,
  t: "AnimateTrack",
  d: {
    track: "shlapper",
    duration: 5,
    dissolve: [[0, 0], [1, 1,"easeInBounce"]],
    dissolveArrow: [[0, 0], [1, 0.75,"easeInOutSine"]],
  }
});


filterednotes = notes.filter(n => n.b >= 311 && n.b <= 313);
filterednotes.forEach(note => {
  note.customData.track = "shlapper";
  note.customData.noteJumpStartBeatOffset = 4;
  note.customData.noteJumpMovementSpeed = 16;
  note.customData.spawnEffect = false;
  note.customData.animation = {}
  note.customData.animation.offsetPosition = [[rnd(-22,22)*0.1,rnd(-22,22)*0.1,-32,0], [0,0,0,0.4875, "easeInOutQuad"]];
  note.customData.animation.localRotation  = [[rnd(-65,65),rnd(-65,65),rnd(-89,89),0], [0,0,0,0.4875, "easeOutBack"]];
  note.customData.animation.dissolve = [[0,0.125], [1,0.375, "easeInOutCubic"]];
  note.customData.animation.dissolveArrow = [[0,0.125], [1,0.4375, "easeInOutSine"]];
});

filterednotes = notes.filter(n => n.b >= 324 && n.b <= 327.25);
filterednotes.forEach(note => {
  note.customData.track = "shlapper";
  note.customData.noteJumpStartBeatOffset = 4;
  note.customData.noteJumpMovementSpeed = 16;
  note.customData.spawnEffect = false;
  note.customData.animation = {}
  note.customData.animation.offsetPosition = [[rnd(-8,8)*0.1,0,-22.5,0], [0,0,0,0.4875, "easeInOutQuad"]];
  note.customData.animation.localRotation  = [[rnd(-65,65),rnd(-65,65),rnd(-89,89),0], [0,0,0,0.4875, "easeOutBack"]];
  note.customData.animation.dissolve = [[0,0], [1,0.375, "easeInOutBounce"]];
  note.customData.animation.dissolveArrow = [[0,0.125], [1,0.4375, "easeInOutSine"]];
});


filterednotes = notes.filter(n => n.b >= 327.5 && n.b <= 328.5);
filterednotes.forEach(note => {
  note.customData.track = "shlapper";
  note.customData.noteJumpStartBeatOffset = 8;
  note.customData.noteJumpMovementSpeed = 16;
  note.customData.spawnEffect = false;
  note.customData.animation = {}
  note.customData.animation.offsetPosition = [[rnd(-69,69)*0.1,rnd(-25,25)*0.1,-50,0], [0,0,0,0.4875, "easeInOutQuad"]];
  note.customData.animation.localRotation  = [[rnd(-65,65),rnd(-65,65),rnd(-89,89),0], [0,0,0,0.4875, "easeInOutBack"]];
  note.customData.animation.dissolve = [[0,0],[0.69,0.125, "easeInOutBounce"], [0.22,0.25, "easeInOutBounce"], [1,0.4375, "easeInOutBounce"]];
  note.customData.animation.dissolveArrow = [[0,0.25], [1,0.4375, "easeInOutBounce"]];
});

filterednotes = notes.filter(n => n.b >= 397.75 && n.b <= 398.1);
filterednotes.forEach(note => {
  note.customData.track = "shlapper";
  note.customData.noteJumpStartBeatOffset = 4;
  note.customData.noteJumpMovementSpeed = 18;
  note.customData.spawnEffect = false;
  note.customData.animation = {}
  note.customData.animation.offsetPosition = [[rnd(-10,10)*0.1,rnd(-5,5)*0.1,-32,0], [0,0,0,0.4875, "easeInOutQuad"]];
  note.customData.animation.localRotation  = [[rnd(-45,45),rnd(-45,45),rnd(-69,69),0], [0,0,0,0.4375, "easeOutBack"]];
  note.customData.animation.dissolve = [[0,0.125], [1,0.375, "easeInCubic"]];
  note.customData.animation.dissolveArrow = [[0,0.25], [1,0.375, "easeOutSine"]];
});


//#region Sliders

//first short boi - 37
filterednotes = sliders.filter(s => s.b >= 37 && s.b <= 37);
filterednotes.forEach(slider => {
  slider.customData.track = "slidur";
});
customEvents.push({
  b: 30,
  t: "AnimateTrack",
  d: {
    track: "slidur",
    dissolve: [[0, 0]],
  }
},{
  b: 36,
  t: "AnimateTrack",
  d: {
    track: "slidur",
    duration: 1,
    dissolve: [[0, 0], [0.5, 0.5,"easeOutQuad"], [0, 1,"easeOutQuad"]],
  }
},{
  b: 37,
  t: "AnimateTrack",
  d: {
    track: "slidur",
    duration: 1,
    dissolve: [[0, 0], [0.6, 0.6375,"easeInOutQuad"], [0.125, 1,"easeOutQuad"]],
  }
},{
  b: 38,
  t: "AnimateTrack",
  d: {
    track: "slidur",
    duration: 1,
    dissolve: [[0.125, 0], [0.7, 0.75,"easeInQuad"], [0.5, 1,"easeOutQuad"]],
  }
},{
  b: 39,
  t: "AnimateTrack",
  d: {
    track: "slidur",
    duration: 1,
    dissolve: [[0.5, 0], [1, 0.875,"easeOutQuad"], [0.75, 1,"easeOutQuad"]],
  }
},{
  b: 42,
  t: "AnimateTrack",
  d: {
    track: "slidur",
    duration: 1,
    dissolve: [[0.75, 0], [0.125, 1,"easeInOutQuad"]],
  }
}); 


//first long boi - 95
filterednotes = sliders.filter(s => s.b >= 95 && s.b <= 100);
filterednotes.forEach(slider => {
  slider.customData.track = "slidur";
  //slider.customData.noteJumpStartBeatOffset = 69;
  //slider.customData.noteJumpMovementSpeed = 420;
  //slider.customData.flip = [x, y];
  //slider.customData.spawnEffect = false;
  //slider.customData.disableNoteGravity = true;
  //slider.customData.disableNoteLook = true;
  //slider.customData.uninteractable = true;
  //slider.customData.coordinates = [x, y];
  //slider.customData.worldRotation = [x, y, z];
  //slider.customData.localRotation = [x, y, z];
  //slider.customData.color = [r, g, b, a];
  //slider.customData.animation = {}
  //slider.customData.animation.dissolveArrow = [[1,0], [0,0.5]]; 
});
customEvents.push({
  b: 90,
  t: "AnimateTrack",
  d: {
    track: "slidur",
    dissolve: [[0, 0]],
    uninteractable: [[0,0]],
  }
},{
  b: 100,
  t: "AnimateTrack",
  d: {
    track: "slidur",
    duration: 1,
    dissolve: [[0, 0], [0.34, 0.6375,"easeOutQuad"], [0, 1,"easeOutBounce"]],
    uninteractable: [[1,0]],
  }
},{
  b: 101,
  t: "AnimateTrack",
  d: {
    track: "slidur",
    duration: 1,
    dissolve: [[0, 0], [0.44, 0.6375,"easeInOutQuad"], [0.1, 1,"easeOutBounce"]],
    uninteractable: [[0,0]],
  }
},{
  b: 102,
  t: "AnimateTrack",
  d: {
    track: "slidur",
    duration: 1,
    dissolve: [[0.1, 0], [0.54, 0.6375,"easeInQuad"], [0, 1,"easeOutBounce"]],
    uninteractable: [[1,0]],
  }
},{
  b: 103,
  t: "AnimateTrack",
  d: {
    track: "slidur",
    duration: 1,
    dissolve: [[0, 0], [1, 0.75,"easeInQuad"], [0, 1,"easeOutBounce"]],
    uninteractable: [[0,0]],
  }
},{
  b: 104,
  t: "AnimateTrack",
  d: {
    track: "slidur",
    duration: 1,
    dissolve: [[0, 0], [1, 1,"easeInOutQuad"]],
    uninteractable: [[1,0]],
  }
}); 


//lil whoops 110,126
filterednotes = sliders.filter(s => s.b >= 110 && s.b <= 127);
filterednotes.forEach(slider => {
  slider.customData.track = "slidur";
});
customEvents.push({
  b: 108,
  t: "AnimateTrack",
  d: {
    track: "slidur",
    dissolve: [[1, 0]],
  }
},{
  b: 110,
  t: "AnimateTrack",
  d: {
    track: "slidur",
    duration: 1,
    dissolve: [[1, 0], [0, 1,"easeInOutQuint"]],
  }
}); 
customEvents.push({
  b: 123,
  t: "AnimateTrack",
  d: {
    track: "slidur",
    dissolve: [[1, 0]],
  }
},{
  b: 126,
  t: "AnimateTrack",
  d: {
    track: "slidur",
    duration: 1,
    dissolve: [[1, 0], [0, 1,"easeInOutQuint"]],
  }
}); 
customEvents.push({
  b: 129,
  t: "AnimateTrack",
  d: {
    track: "slidur",
    dissolve: [[1, 0]],
  }
}); 

// wanna have fun 116 - 120
filterednotes = sliders.filter(s => s.b >= 115 && s.b <= 121);
filterednotes.forEach(slider => {
  if (slider.c == 0) {
    slider.customData.track = "slidurR";
  }
  if (slider.c == 1) {
    slider.customData.track = "slidurB";
  }
});
customEvents.push({ 
  b: 112,
  t: "AnimateTrack",
  d: {
    track: ["slidurB", "slidurR"],
    dissolve: [[0, 0]],
  }
},{ 
  b: 114,
  t: "AnimateTrack",
  d: {
    track: "slidurB",
    duration: 2,
    dissolve: [[0, 0],[1, 0.5,"easeOutCubic"],[0, 1,"easeOutCubic"]],
    repeat: 2,
  }
},{ 
  b: 115,
  t: "AnimateTrack",
  d: {
    track: "slidurR",
    duration: 2,
    dissolve: [[0, 0],[1, 0.5,"easeOutCubic"],[0, 1,"easeOutCubic"]],
    repeat: 1,
  }
});

// wanna have fun 133 - 136
filterednotes = sliders.filter(s => s.b >= 133 && s.b <= 121);
filterednotes.forEach(slider => {
  if (slider.c == 0) {
    slider.customData.track = "slidurR";
  }
  if (slider.c == 1) {
    slider.customData.track = "slidurB";
  }
});
customEvents.push({ 
  b: 129,
  t: "AnimateTrack",
  d: {
    track: ["slidurB", "slidurR"],
    dissolve: [[0, 0]],
  }
},{ 
  b: 130,
  t: "AnimateTrack",
  d: {
    track: "slidurR",
    duration: 2,
    dissolve: [[0, 0],[1, 0.5,"easeOutCubic"],[0, 1,"easeOutCubic"]],
    repeat: 2,
  }
},{ 
  b: 131,
  t: "AnimateTrack",
  d: {
    track: "slidurB",
    duration: 2,
    dissolve: [[0, 0],[1, 0.5,"easeOutCubic"],[0, 1,"easeOutCubic"]],
    repeat: 1,
  }
});


// haaaaaaa---- 144,152
filterednotes = sliders.filter(s => s.b >= 144 && s.b <= 152);
filterednotes.forEach(slider => {
  if (slider.c == 0) {
    slider.customData.track = "slidurR";
  }
  if (slider.c == 1) {
    slider.customData.track = "slidurB";
  }
});
customEvents.push({ 
  b: 139,
  t: "AnimateTrack",
  d: {
    track: ["slidurB", "slidurR"],
    dissolve: [[0, 0]],
  }
},{
  b: 143,
  t: "AnimateTrack",
  d: {
    track: "slidurR",
    duration: 2,
    dissolve: [[0, 0], [1, 0.75,"easeInOutQuad"], [0, 1,"easeInOutQuad"]],
  }
},{
  b: 143,
  t: "AnimateTrack",
  d: {
    track: "slidurB",
    duration: 3,
    dissolve: [[0, 0], [1, 0.75,"easeInOutQuad"], [0, 1,"easeOutQuint"]],
  }
});
customEvents.push({
  b: 148,
  t: "AnimateTrack",
  d: {
    track: ["slidurB", "slidurR"],
    dissolve: [[0, 0]],
  }
},{
  b: 151,
  t: "AnimateTrack",
  d: {
    track: "slidurB",
    duration: 2,
    dissolve: [[0, 0], [1, 0.75,"easeInOutQuad"], [0, 1,"easeInOutQuad"]],
  }
},{
  b: 151,
  t: "AnimateTrack",
  d: {
    track: "slidurR",
    duration: 3,
    dissolve: [[0, 0], [1, 0.75,"easeInOutQuad"], [0, 1,"easeOutQuint"]],
  }
});


//We don't give a - 257
filterednotes = sliders.filter(s => s.b >= 272.5 && s.b <= 273.5);
filterednotes.forEach(slider => {
  if (slider.c == 0) {
    slider.customData.track = "slidurR";
  }
  if (slider.c == 1) {
    slider.customData.track = "slidurB";
  }
});
customEvents.push({
  b: 250,
  t: "AnimateTrack",
  d: {
    track: ["slidurR","slidurB"],
    dissolve: [[0, 0]],
  }
},{
  b: 257,
  t: "AnimateTrack",
  d: {
    track: "slidurR",
    duration: 2,
    dissolve: [[0, 0],[1, 0.5,"easeInQuint"],[0, 1,"easeOutQuint"]],
  }
},{
  b: 258.5,
  t: "AnimateTrack",
  d: {
    track: "slidurB",
    duration: 1,
    dissolve: [[0, 0],[1, 1,"easeInOutQuint"]],
  }
},{
  b: 259.5,
  t: "AnimateTrack",
  d: {
    track: "slidurR",
    duration: 1,
    dissolve: [[0, 0],[1, 1,"easeInOutQuint"]],
  }
}); 



//vocals 273
filterednotes = sliders.filter(s => s.b >= 272.5 && s.b <= 273.5);
filterednotes.forEach(slider => {
  slider.customData.track = "slidur";
  //slider.customData.noteJumpStartBeatOffset = 69;
  //slider.customData.noteJumpMovementSpeed = 420;
  //slider.customData.flip = [x, y];
  //slider.customData.spawnEffect = false;
  //slider.customData.disableNoteGravity = true;
  //slider.customData.disableNoteLook = true;
  //slider.customData.uninteractable = true;
  //slider.customData.coordinates = [x, y];
  //slider.customData.worldRotation = [x, y, z];
  //slider.customData.localRotation = [x, y, z];
  //slider.customData.color = [r, g, b, a];
  //slider.customData.animation = {}
  //slider.customData.animation.dissolveArrow = [[1,0], [0,0.5]]; 
});
customEvents.push({
  b: 273.5,
  t: "AnimateTrack",
  d: {
    track: "slidur",
    duration: 1.5,
    dissolve: [[1, 0], [0, 1,"easeInOutQuint"]],
  }
}); 

// side doodles - 291,293
filterednotes = sliders.filter(s => s.b >= 290 && s.b <= 293.25);
filterednotes.forEach(slider => {
  if (slider.c == 0) {
    slider.customData.track = "slidurR";
  }
  if (slider.c == 1) {
    slider.customData.track = "slidurB";
  }
});
customEvents.push({
  b: 288,
  t: "AnimateTrack",
  d: {
    track: ["slidurR","slidurB"],
    dissolve: [[0, 0]],
  }
},{
  b: 289,
  t: "AnimateTrack",
  d: {
    track: "slidurB",
    duration: 3,
    dissolve: [[0, 0], [1, 1,"easeInOutSine"]],
  }
},{
  b: 291,
  t: "AnimateTrack",
  d: {
    track: "slidurR",
    duration: 3,
    dissolve: [[0, 0], [1, 1,"easeInOutSine"]],
  }
}); 

//scrungle 296
filterednotes = sliders.filter(s => s.b >= 295.5 && s.b <= 297.25);
filterednotes.forEach(slider => {
  slider.customData.track = "slidur";
});
customEvents.push({
  b: 295,
  t: "AnimateTrack",
  d: {
    track: "slidur",
    duration: 0.5,
    dissolve: [[1, 0], [0, 0.25,"easeInOutBounce"], [1, 1,"easeInBounce"]],
    repeat: 6,
  }
},{
  b: 298,
  t: "AnimateTrack",
  d: {
    track: "slidur",
    duration: 1,
    dissolve: [[1, 0], [0, 0.25,"easeInOutBounce"], [1, 1,"easeOutBounce"]],
  }
},{
  b: 299,
  t: "AnimateTrack",
  d: {
    track: "slidur",
    duration: 0.5,
    dissolve: [[1, 0], [0, 0.75,"easeInOutBounce"], [1, 1,"easeInBounce"]],
  }
},{
  b: 299.5,
  t: "AnimateTrack",
  d: {
    track: "slidur",
    duration: 0.5,
    dissolve: [[1, 0], [0, 1,"easeInBounce"]],
    repeat: 2,
  }
}); 

//scrungle 299
filterednotes = sliders.filter(s => s.b >= 299 && s.b <= 299);
filterednotes.forEach(slider => {
  slider.customData.track = "slidur";
});
customEvents.push({
  b: 299,
  t: "AnimateTrack",
  d: {
    track: "slidur",
    duration: 0.5,
    dissolve: [[0, 0], [1, 0.5,"easeInOutBounce"], [0, 1,"easeInCubic"]],
    repeat: 2,
  }
},{
  b: 300,
  t: "AnimateTrack",
  d: {
    track: "slidur",
    duration: 1,
    dissolve: [[0, 0], [1, 1,"easeInQuad"]],
  }
},{
  b: 301,
  t: "AnimateTrack",
  d: {
    track: "slidur",
    duration: 1,
    dissolve: [[1, 0], [0, 1,"easeInOutQuad"]],
  }
}); 

//scrungle multi 302
filterednotes = sliders.filter(s => s.b >= 301 && s.b <= 303);
filterednotes.forEach(slider => {
  if (slider.d == 6) {
    slider.customData.track = "slidur1";
  }
  if (slider.d == 7) {
    slider.customData.track = "slidur2";
  }
  if (slider.d == 1) {
    slider.customData.track = "slidur3";
  }
});
customEvents.push({ //setup
  b: 298,
  t: "AnimateTrack",
  d: {
    track: ["slidur1", "slidur2"],
    dissolve: [[0, 0]],
  }
},{
  b: 301,
  t: "AnimateTrack",
  d: {
    track: "slidur3",
    duration: 1,
    dissolve: [[0, 0], [1, 1,"easeInBounce"]],
  }
}); 

customEvents.push({
  b: 302,
  t: "AnimateTrack",
  d: {
    track: "slidur3",
    duration: 1,
    dissolve: [[1, 0,"easeInOutQuart"],[0, 0.5,"easeInOutQuart"], [1, 1,"easeInOutQuart"]],
    repeat: 2,
  }
},{
  b: 302,
  t: "AnimateTrack",
  d: {
    track: "slidur2",
    duration: 0.5,
    dissolve: [[0, 0,"easeInOutQuart"],[1, 0.5,"easeInOutQuart"], [0, 1,"easeInOutQuart"]],
    repeat: 4,
  }
},{
  b: 302,
  t: "AnimateTrack",
  d: {
    track: "slidur1",
    duration: 0.5,
    dissolve: [[1, 0,"easeInOutQuart"],[0, 0.5,"easeInOutQuart"], [1, 1,"easeInOutQuart"]],
    repeat: 3,
  }
},{
  b: 303.5,
  t: "AnimateTrack",
  d: {
    track: "slidur1",
    duration: 0.5,
    dissolve: [[1, 0,"easeOutBounce"],[0, 1,"easeOutBounce"]],
  }
}); 

//scrungle 320
filterednotes = sliders.filter(s => s.b >= 319 && s.b <= 320);
filterednotes.forEach(slider => {
  slider.customData.track = "slidur";
});
customEvents.push({
  b: 318,
  t: "AnimateTrack",
  d: {
    track: "slidur",
    dissolve: [[0, 0]],
  }
},{
  b: 321,
  t: "AnimateTrack",
  d: {
    track: "slidur",
    duration: 1,
    dissolve: [[0, 0], [0.25, 1,"easeInQuint"]],
  }
},{
  b: 322,
  t: "AnimateTrack",
  d: {
    track: "slidur",
    duration: 1,
    dissolve: [[0, 0], [0.5, 1,"easeInCubic"]],
  }
},{
  b: 323,
  t: "AnimateTrack",
  d: {
    track: "slidur",
    duration: 1,
    dissolve: [[0, 0], [0.75, 1,"easeInQuad"]],
  }
},{
  b: 324,
  t: "AnimateTrack",
  d: {
    track: "slidur",
    duration: 1,
    dissolve: [[0, 0], [1, 1,"easeInSine"]],
  }
}); 


//scrungle 325
filterednotes = sliders.filter(s => s.b >= 325 && s.b <= 329);
filterednotes.forEach(slider => {
  if (slider.c == 0) {
    slider.customData.track = "slidurR";
  }
  if (slider.c == 1) {
    slider.customData.track = "slidurB";
  }
});
customEvents.push({
  b: 324,
  t: "AnimateTrack",
  d: {
    track: "slidurR",
    duration: 1,
    dissolve: [[0, 0.5], [1, 1,"easeInOutCubic"]],
    repeat: 328-324
  }
},{
  b: 325,
  t: "AnimateTrack",
  d: {
    track: "slidurB",
    duration: 1,
    dissolve: [[1, 0.5], [0, 1,"easeInOutCubic"]],
    repeat: 328-325
  }
},{
  b: 328,
  t: "AnimateTrack",
  d: {
    track: ["slidurB", "slidurR"],
    duration: 0.25,
    dissolve: [[1, 0],[0, 0.5,"easeOutSine"],[1, 1,"easeOutCubic"]],
    repeat: 10,
  }
},{
  b: 331,
  t: "AnimateTrack",
  d: {
    track: ["slidurB", "slidurR"],
    duration: 0.5,
    dissolve: [[0, 0],[0.25, 0.5,"easeInBounce"],[0, 1,"easeOutBounce"]],
  }
});


// haaaaaaa---- 336,344
filterednotes = sliders.filter(s => s.b >= 336 && s.b <= 344);
filterednotes.forEach(slider => {
  if (slider.c == 0) {
    slider.customData.track = "slidurR";
  }
  if (slider.c == 1) {
    slider.customData.track = "slidurB";
  }
});
customEvents.push({ 
  b: 332,
  t: "AnimateTrack",
  d: {
    track: ["slidurB", "slidurR"],
    dissolve: [[0, 0]],
  }
},{
  b: 335,
  t: "AnimateTrack",
  d: {
    track: "slidurR",
    duration: 2.5,
    dissolve: [[0, 0], [1, 0.5,"easeInOutQuad"], [0, 1,"easeInOutQuad"]],
  }
},{
  b: 335,
  t: "AnimateTrack",
  d: {
    track: "slidurB",
    duration: 3,
    dissolve: [[0, 0], [1, 0.5,"easeOutQuad"], [0, 1,"easeInQuad"]],
  }
});
customEvents.push({
  b: 340,
  t: "AnimateTrack",
  d: {
    track: ["slidurB", "slidurR"],
    dissolve: [[0, 0]],
  }
},{
  b: 343,
  t: "AnimateTrack",
  d: {
    track: "slidurB",
    duration: 2.5,
    dissolve: [[0, 0], [1, 0.5,"easeInOutQuad"], [0, 1,"easeInOutQuad"]],
  }
},{
  b: 343,
  t: "AnimateTrack",
  d: {
    track: "slidurR",
    duration: 3,
    dissolve: [[0, 0], [1, 0.5,"easeOutQuad"], [0, 1,"easeInQuad"]],
  }
});


// BRRRAAAAAAAAAAA---- 360-387
filterednotes = sliders.filter(s => s.b >= 360 && s.b <= 386);
filterednotes.forEach(slider => {
  if (slider.c == 0) {
    slider.customData.track = "slidurR";
  }
  if (slider.c == 1) {
    slider.customData.track = "slidurB";
  }
});
customEvents.push({
  b: 357,
  t: "AnimateTrack",
  d: {
    track: ["slidurR", "slidurB"],
    dissolve: [[0, 0]],
  }
},{
  b: 359,
  t: "AnimateTrack",
  d: {
    track: ["slidurR", "slidurB"],
    duration: 0.25,
    dissolve: [[0, 0],[1, 1,"easeInCubic"]],
    repeat: 3,
  }
},{
  b: 360,
  t: "AnimateTrack",
  d: {
    track: ["slidurR", "slidurB"],
    duration: 2,
    dissolve: [[1, 0],[0, 1,"easeOutCubic"]],
  }
},{
  b: 367,
  t: "AnimateTrack",
  d: {
    track: ["slidurR", "slidurB"],
    duration: 0.25,
    dissolve: [[0, 0],[1, 1,"easeInCubic"]],
    repeat: 3,
  }
},{
  b: 368,
  t: "AnimateTrack",
  d: {
    track: ["slidurR", "slidurB"],
    duration: 2,
    dissolve: [[1, 0],[0, 1,"easeOutCubic"]],
  }
},{
  b: 375,
  t: "AnimateTrack",
  d: {
    track: ["slidurR", "slidurB"],
    duration: 0.25,
    dissolve: [[0, 0],[1, 1,"easeInCubic"]],
    repeat: 3,
  }
},{
  b: 376,
  t: "AnimateTrack",
  d: {
    track: "slidurR",
    duration: 2,
    dissolve: [[1, 0],[0, 1,"easeOutCubic"]],
  }
},{
  b: 376,
  t: "AnimateTrack",
  d: {
    track: "slidurB",
    duration: 1,
    dissolve: [[1, 0],[0, 0.75,"easeOutCubic"],[1, 1,"easeOutCubic"]],
    repeat: 3,
  }
},{
  b: 379,
  t: "AnimateTrack",
  d: {
    track: "slidurR",
    duration: 0.25,
    dissolve: [[0, 0],[1, 1,"easeInCubic"]],
    repeat: 3,
  }
},{
  b: 380,
  t: "AnimateTrack",
  d: {
    track: "slidurR",
    duration: 1,
    dissolve: [[1, 0],[0, 0.75,"easeOutCubic"],[1, 1,"easeOutCubic"]],
    repeat: 4,
  }
},{
  b: 381,
  t: "AnimateTrack",
  d: {
    track: "slidurB",
    duration: 0.25,
    dissolve: [[0, 0],[1, 1,"easeInCubic"]],
    repeat: 3,
  }
},{
  b: 382,
  t: "AnimateTrack",
  d: {
    track: "slidurB",
    duration: 1,
    dissolve: [[1, 0],[0, 0.75,"easeOutCubic"],[1, 1,"easeOutCubic"]],
    repeat: 1,
  }
});

// looong 387
filterednotes = sliders.filter(s => s.b >= 387 && s.b <= 388);
filterednotes.forEach(slider => {
  if (slider.c == 0) {
    slider.customData.track = "slidurR";
  }
  if (slider.c == 1) {
    slider.customData.track = "slidurB";
  }
});
customEvents.push({ 
  b: 386,
  t: "AnimateTrack",
  d: {
    track: ["slidurB", "slidurR"],
    dissolve: [[0, 0]],
  }
},{ 
  b: 387.5,
  t: "AnimateTrack",
  d: {
    track: ["slidurB", "slidurR"],
    duration: 2.5,
    dissolve: [[0, 0],[1, 1,"easeInQuad"]],
  }
},{ 
  b: 390,
  t: "AnimateTrack",
  d: {
    track: ["slidurB", "slidurR"],
    duration: 0.5,
    dissolve: [[1, 0],[0, 0.5,"easeInOutSine"],[1, 1,"easeInOutSine"]],
    repeat:2
  }
},{ 
  b: 391,
  t: "AnimateTrack",
  d: {
    track: "slidurB",
    duration: 0.25,
    dissolve: [[1, 0],[0, 0.5,"easeInOutCirc"],[1, 1,"easeInOutCirc"]],
    repeat: (393-391)*4
  }
},{ 
  b: 391,
  t: "AnimateTrack",
  d: {
    track: "slidurR",
    duration: 0.5,
    dissolve: [[1, 0],[0, 1,"easeInOutCirc"]],
  }
},{ 
  b: 391.5,
  t: "AnimateTrack",
  d: {
    track: "slidurR",
    duration: 0.25,
    dissolve: [[1, 0],[0, 0.5,"easeInOutCirc"],[1, 1,"easeInOutCirc"]],
    repeat: (393-391)*4
  }
},{ 
  b: 393.5,
  t: "AnimateTrack",
  d: {
    track: "slidurB",
    duration: 0.25,
    dissolve: [[1, 0],[0, 0.5,"easeInOutCirc"],[0.5, 1,"easeInOutCirc"]],
  }
},{ 
  b: 393.5,
  t: "AnimateTrack",
  d: {
    track: "slidurR",
    duration: 0.25,
    dissolve: [[1, 0],[0, 0.5,"easeInOutCirc"]],
  }
},{ 
  b: 393.75,
  t: "AnimateTrack",
  d: {
    track: "slidurB",
    duration: 0.75,
    dissolve: [[0.5, 0],[0, 1,"easeOutBounce"]],
  }
},{ 
  b: 394,
  t: "AnimateTrack",
  d: {
    track: ["slidurR","slidurB"],
    uninteractable: [[1,0]],
  }
});


// we don't give a 
filterednotes = sliders.filter(s => s.b >= 423 && s.b <= 491);
filterednotes.forEach(slider => {
  if (slider.c == 0) {
    slider.customData.track = "slidurR";
  }
  if (slider.c == 1) {
    slider.customData.track = "slidurB";
  }
});
customEvents.push({ 
  b: 420,
  t: "AnimateTrack",
  d: {
    track: ["slidurB", "slidurR"],
    dissolve: [[0, 0]],
    uninteractable: [[0,0]],
  }
},{ 
  b: 423.25,
  t: "AnimateTrack",
  d: {
    track: "slidurB",
    duration: 1.5,
    dissolve: [[0, 0], [1, 1,"easeInOutCubic"]],
  }
},{ 
  b: 424.25,
  t: "AnimateTrack",
  d: {
    track: "slidurR",
    duration: 1.5,
    dissolve: [[0, 0], [1, 1,"easeInOutCubic"]],
  }
});
customEvents.push({ 
  b: 450,
  t: "AnimateTrack",
  d: {
    track: ["slidurB", "slidurR"],
    dissolve: [[0, 0]],
  }
},{ 
  b: 455.25,
  t: "AnimateTrack",
  d: {
    track: "slidurB",
    duration: 1.5,
    dissolve: [[0, 0], [1, 1,"easeInOutCubic"]],
  }
},{ 
  b: 456.25,
  t: "AnimateTrack",
  d: {
    track: "slidurR",
    duration: 1.5,
    dissolve: [[0, 0], [1, 1,"easeInOutCubic"]],
  }
});
customEvents.push({ 
  b: 480,
  t: "AnimateTrack",
  d: {
    track: ["slidurB", "slidurR"],
    dissolve: [[0, 0]],
  }
},{ 
  b: 487.25,
  t: "AnimateTrack",
  d: {
    track: "slidurR",
    duration: 1.5,
    dissolve: [[0, 0], [1, 1,"easeInOutCubic"]],
  }
},{ 
  b: 488.25,
  t: "AnimateTrack",
  d: {
    track: "slidurB",
    duration: 1.5,
    dissolve: [[0, 0], [1, 1,"easeInOutCubic"]],
  }
});








// Scripted Arcs
function arcSplode(beat,length,amnt) {
  for (let i = 1; i <= amnt; i++) {
    sliders.push({
      b: beat + (i*0.01),  // Head Beat
      c: 1,     // Color
      x: 1,     // Head x
      y: 0,     // Head y
      d: 8,     // Head direction
      mu: 0.0,  // Head multiplier
      tb: beat+length + (i*0.01), // Tail Beat
      tx: 1,    // Tail x
      ty: 0,    // Tail y
      tc: 8,    // Tail direction
      tmu: 0.0, // Tail Multiplier
      m: 1,     // Mid-anchor mode
      customData:{
        track: `holyHeckArc${i}`,
        noteJumpStartBeatOffset: 64,
        noteJumpMovementSpeed: 18,
        disableNoteGravity: 1,
        uninteractable: 1,
      }
    });

    sliders.push({
      b: (beat + (i*0.01))+0.01,  // Head Beat
      c: 1,     // Color
      x: 1,     // Head x
      y: 0,     // Head y
      d: 8,     // Head direction
      mu: 0.0,  // Head multiplier
      tb: (beat+length + (i*0.01))+0.01, // Tail Beat
      tx: 1,    // Tail x
      ty: 0,    // Tail y
      tc: 8,    // Tail direction
      tmu: 0.0, // Tail Multiplier
      m: 1,     // Mid-anchor mode
      customData:{
        track: `holyHeckArcC${i}`,
        noteJumpStartBeatOffset: 64,
        noteJumpMovementSpeed: 18,
        disableNoteGravity: 1,
        uninteractable: 1,
      }
    });  

    customEvents.push({ 
      b: 0, 
      t: "AnimateTrack",
      d: {
        track: [`holyHeckArc${i}`, `holyHeckArcC${i}`],
        dissolve: [[0,0]],
      }
    },{ 
      b: beat + (i*0.01), 
      t: "AnimateTrack",
      d: {
        track: `holyHeckArc${i}`,
        duration: length,
        dissolve: [[0,0],[1,0.25,"easeInOutQuint"],[1,0.75],[0,1,"easeInOutQuad"]],
        offsetWorldRotation: [[0, 0, 0, 0],[i, 0, -i, 1,"easeInOutBack"]],
        offsetPosition: [[0.5, -4, 0, 0],[-i+0.5, -2, -i*-0.5, 1, "easeInOutSine"]],
        scale: [[1,1,1,0],[1,1,2,1]]
      }
    },{ 
      b: (beat+0.001) + (i*0.01), 
      t: "AnimateTrack",
      d: {
        track: `holyHeckArcC${i}`,
        duration: length,
        dissolve: [[0,0],[1,0.25,"easeInOutQuint"],[1,0.75],[0,1,"easeInOutQuad"]],
        offsetWorldRotation: [[0, 0, 0, 0],[i, 0, i, 1,"easeInOutBack"]],
        offsetPosition: [[0.5, -4, 0, 0],[i+0.5, -2, -i*-0.5, 1, "easeInOutSine"]],
        scale: [[1,1,1,0],[1,1,2,1]]
      }
    });
  }
}
function arcSplode2(beat,length,amnt) {
  for (let i = 1; i <= amnt; i++) {
    sliders.push({
      b: beat + (i*0.01),  // Head Beat
      c: 1,     // Color
      x: 1,     // Head x
      y: 0,     // Head y
      d: 8,     // Head direction
      mu: 0.0,  // Head multiplier
      tb: beat+length + (i*0.01), // Tail Beat
      tx: 1,    // Tail x
      ty: 0,    // Tail y
      tc: 8,    // Tail direction
      tmu: 0.0, // Tail Multiplier
      m: 1,     // Mid-anchor mode
      customData:{
        track: `holyFrickArc${i}`,
        noteJumpStartBeatOffset: 32,
        noteJumpMovementSpeed: 18,
        disableNoteGravity: 1,
        uninteractable: 1,
      }
    });

    sliders.push({
      b: (beat + (i*0.01))+0.01,  // Head Beat
      c: 1,     // Color
      x: 1,     // Head x
      y: 0,     // Head y
      d: 8,     // Head direction
      mu: 0.0,  // Head multiplier
      tb: (beat+length + (i*0.01))+0.01, // Tail Beat
      tx: 1,    // Tail x
      ty: 0,    // Tail y
      tc: 8,    // Tail direction
      tmu: 0.0, // Tail Multiplier
      m: 1,     // Mid-anchor mode
      customData:{
        track: `holyFrickArcC${i}`,
        noteJumpStartBeatOffset: 32,
        noteJumpMovementSpeed: 18,
        disableNoteGravity: 1,
        uninteractable: 1,
      }
    });  

    customEvents.push({ 
      b: 0, 
      t: "AnimateTrack",
      d: {
        track: [`holyFrickArc${i}`, `holyFrickArcC${i}`],
        dissolve: [[0,0]],
      }
    },{ 
      b: beat + (i*0.01), 
      t: "AnimateTrack",
      d: {
        track: `holyFrickArc${i}`,
        duration: length,
        dissolve: [[0,0],[1,0.25,"easeInOutQuint"],[1,0.75],[0,1,"easeInOutQuad"]],
        offsetWorldRotation: [[0, 0, 0, 0],[i, 0, -i, 1,"easeInOutBack"]],
        offsetPosition: [[0.5, -4, 0, 0],[-i+0.5, -2, i*-0.5, 1, "easeInOutSine"]],
        scale: [[1,1,1,0],[1,1,2,1]]
      }
    },{ 
      b: (beat+0.001) + (i*0.01), 
      t: "AnimateTrack",
      d: {
        track: `holyFrickArcC${i}`,
        duration: length,
        dissolve: [[0,0],[1,0.25,"easeInOutQuint"],[1,0.75],[0,1,"easeInOutQuad"]],
        offsetWorldRotation: [[0, 0, 0, 0],[i, 0, i, 1,"easeInOutBack"]],
        offsetPosition: [[0.5, -4, 0, 0],[i+0.5, -2, i*-0.5, 1, "easeInOutSine"]],
        scale: [[1,1,1,0],[1,1,2,1]]
      }
    });
  }
}



//arcSplode(397,32,250)
//arcSplode2(429,32,200)
//arcSplode(463,32,350)

//#endregion



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

difficulty.colorNotes.sort(
  (a, b) =>
    parseFloat(Math.round((a.b + Number.EPSILON) * sortP) / sortP) -
      parseFloat(Math.round((b.b + Number.EPSILON) * sortP) / sortP) ||
    parseFloat(Math.round((a.x + Number.EPSILON) * sortP) / sortP) -
      parseFloat(Math.round((b.x + Number.EPSILON) * sortP) / sortP) ||
    parseFloat(Math.round((a.y + Number.EPSILON) * sortP) / sortP) -
      parseFloat(Math.round((b.y + Number.EPSILON) * sortP) / sortP)
);
difficulty.customData.fakeColorNotes.sort(
  (a, b) =>
    parseFloat(Math.round((a.b + Number.EPSILON) * sortP) / sortP) -
      parseFloat(Math.round((b.b + Number.EPSILON) * sortP) / sortP) ||
    parseFloat(Math.round((a.x + Number.EPSILON) * sortP) / sortP) -
      parseFloat(Math.round((b.x + Number.EPSILON) * sortP) / sortP) ||
    parseFloat(Math.round((a.y + Number.EPSILON) * sortP) / sortP) -
      parseFloat(Math.round((b.y + Number.EPSILON) * sortP) / sortP)
);

difficulty.bombNotes.sort(
  (a, b) =>
    parseFloat(Math.round((a.b + Number.EPSILON) * sortP) / sortP) -
      parseFloat(Math.round((b.b + Number.EPSILON) * sortP) / sortP) ||
    parseFloat(Math.round((a.x + Number.EPSILON) * sortP) / sortP) -
      parseFloat(Math.round((b.x + Number.EPSILON) * sortP) / sortP) ||
    parseFloat(Math.round((a.y + Number.EPSILON) * sortP) / sortP) -
      parseFloat(Math.round((b.y + Number.EPSILON) * sortP) / sortP)
);
difficulty.customData.fakeBombNotes.sort(
  (a, b) =>
    parseFloat(Math.round((a.b + Number.EPSILON) * sortP) / sortP) -
      parseFloat(Math.round((b.b + Number.EPSILON) * sortP) / sortP) ||
    parseFloat(Math.round((a.x + Number.EPSILON) * sortP) / sortP) -
      parseFloat(Math.round((b.x + Number.EPSILON) * sortP) / sortP) ||
    parseFloat(Math.round((a.y + Number.EPSILON) * sortP) / sortP) -
      parseFloat(Math.round((b.y + Number.EPSILON) * sortP) / sortP)
);

difficulty.sliders.sort(
  (a, b) =>
    parseFloat(Math.round((a.b + Number.EPSILON) * sortP) / sortP) -
      parseFloat(Math.round((b.b + Number.EPSILON) * sortP) / sortP) ||
    parseFloat(Math.round((a.x + Number.EPSILON) * sortP) / sortP) -
      parseFloat(Math.round((b.x + Number.EPSILON) * sortP) / sortP) ||
    parseFloat(Math.round((a.y + Number.EPSILON) * sortP) / sortP) -
      parseFloat(Math.round((b.y + Number.EPSILON) * sortP) / sortP)
);

difficulty.burstSliders.sort(
  (a, b) =>
    parseFloat(Math.round((a.b + Number.EPSILON) * sortP) / sortP) -
      parseFloat(Math.round((b.b + Number.EPSILON) * sortP) / sortP) ||
    parseFloat(Math.round((a.x + Number.EPSILON) * sortP) / sortP) -
      parseFloat(Math.round((b.x + Number.EPSILON) * sortP) / sortP) ||
    parseFloat(Math.round((a.y + Number.EPSILON) * sortP) / sortP) -
      parseFloat(Math.round((b.y + Number.EPSILON) * sortP) / sortP)
);
difficulty.customData.fakeBurstSliders.sort(
  (a, b) =>
    parseFloat(Math.round((a.b + Number.EPSILON) * sortP) / sortP) -
      parseFloat(Math.round((b.b + Number.EPSILON) * sortP) / sortP) ||
    parseFloat(Math.round((a.x + Number.EPSILON) * sortP) / sortP) -
      parseFloat(Math.round((b.x + Number.EPSILON) * sortP) / sortP) ||
    parseFloat(Math.round((a.y + Number.EPSILON) * sortP) / sortP) -
      parseFloat(Math.round((b.y + Number.EPSILON) * sortP) / sortP)
);

difficulty.obstacles.sort((a, b) => a.b- b.b);
difficulty.basicBeatmapEvents.sort((a, b) => a.b - b.b);

fs.writeFileSync(OUTPUT, JSON.stringify(difficulty, null, 0));

//#endregion

const diffPaths = [OUTPUT];

var L = JSON.parse(fs.readFileSync(lightsPath));

//let eventType = L._events;
//if (!convertV2toV3) {
//  eventType = L.basicBeatmapEvents;
//}

L._events.forEach(event => {
  event._floatValue = 1;
});

    L = JSON.parse(JSON.stringify(L).split('"_time":').join('"b":'));
    L = JSON.parse(JSON.stringify(L).split('"_type":').join('"et":'));
    L = JSON.parse(JSON.stringify(L).split('"_value":').join('"i":'));
    L = JSON.parse(JSON.stringify(L).split('"_floatValue":').join('"f":'));
    L = JSON.parse(JSON.stringify(L).split('"_customData":').join('"customData":'));
    L = JSON.parse(JSON.stringify(L).split('"_rotation":').join('"rotation":'));
    L = JSON.parse(JSON.stringify(L).split('"_step":').join('"step":'));
    L = JSON.parse(JSON.stringify(L).split('"_prop":').join('"prop":'));
    L = JSON.parse(JSON.stringify(L).split('"_speed":').join('"speed":'));
    L = JSON.parse(JSON.stringify(L).split('"_direction":').join('"direction":'));
    L = JSON.parse(JSON.stringify(L).split('"_color":').join('"color":'));
    L = JSON.parse(JSON.stringify(L).split('"_lightID":').join('"lightID":'));
    L = JSON.parse(JSON.stringify(L).split('"_easing":').join('"easing":'));
    L = JSON.parse(JSON.stringify(L).split('"_lerpType":').join('"lerpType":'));
    L = JSON.parse(JSON.stringify(L).split('"_lockPosition":').join('"lockRotation":'));
    L = JSON.parse(JSON.stringify(L).split('"_lightGradient":').join('"lightGradient":'));
    L = JSON.parse(JSON.stringify(L).split('"_duration":').join('"duration":'));
    L = JSON.parse(JSON.stringify(L).split('"_startColor":').join('"startColor":'));
    L = JSON.parse(JSON.stringify(L).split('"_endColor":').join('"endColor":'));
    L = JSON.parse(JSON.stringify(L).split('"_reset":').join('"reset":'));
    L = JSON.parse(JSON.stringify(L).split('"_preciseSpeed":').join('"preciseSpeed":'));
    L = JSON.parse(JSON.stringify(L).split('"_duration":').join('"duration":'));

	for(var diffPath of diffPaths) {
		var j = JSON.parse(fs.readFileSync(diffPath));
		
    if (ClearOldEvents) {
      j.basicBeatmapEvents = [];
    }
    
    j.basicBeatmapEvents = [...(j.basicBeatmapEvents || []), ...(L._events || [])].sort((a, b) => a.b - b.b);

		fs.renameSync(diffPath, diffPath + ".original");
		fs.writeFileSync(diffPath, JSON.stringify(j, null, 2));
}