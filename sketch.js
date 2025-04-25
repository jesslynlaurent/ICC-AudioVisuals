let mySound;
let amp;
let fft;
let bgColor = (0, 0, 0);
let shape = 'circle'; //main shape
let x, y;
let size = 100;
let targetSize = 100;

let changeInterval = 4000; //change every 4 seconds
let lastChangeTime = 0;

// snoke effects variables
let zoff = 0;

const setBgColor = (r, g, b) => {
  bgColor = [
    lerp(bgColor[0], r, 0.1),
    lerp(bgColor[1], g, 0.1),
    lerp(bgColor[2], b, 0.1),
  ];
};

function preload() {
  mySound = loadSound('tmpzedxj6ur.wav')
}

function setup() {
   createCanvas(600, 400);
  background(50);
  textSize(32);
  fill(255);
  text("Hello, p5.js!", 100, 200);
  
  let cnv = createCanvas(1000, 1000);
  cnv.mousePressed(canvasPressed); //play when users click on the screen

  x = width / 2;
  y = height / 2;

  amp = new p5.Amplitude();
  amp.setInput(mySound);

  fft = new p5.FFT(); //audio analysis 
  fft.setInput(mySound); 
}


 


function draw() {
  background(bgColor[0], bgColor[1], bgColor[2]);

  let level = amp.getLevel();
  size = lerp(size, map(level, 0, 0.6, 100, 500), 0.1); //lerp makes the change smooth
  size = constrain(size, 100, 500); //size only between 50 and 300

  //keep the shapes in the centre 
  x = width / 2;
  y = height / 2;

  if (!mySound.isPlaying()) {
    console.log('not playing');
    return;
  }
//frequency bands
  let spectrum = fft.analyze();
  let treble = fft.getEnergy("treble"); 
  let mid = fft.getEnergy("mid");
  let bass = fft.getEnergy("bass");


  //origin of the points
  let mappedTreble = map(treble, 0, 255, 0, 400);
  let mappedMid = map(mid, 0, 255, -400, 200);
  let mappedBass = map(bass, 0, 255, -400, 100);

  //different background color based on the frequency
  if (bass > mid && bass > treble) {
    setBgColor(0, 0, 0);
  } else if (mid > bass && mid > treble) {
    setBgColor(85, 85, 85);
  } else if (treble > bass && treble > mid) {
    setBgColor(0, 0, 255);
  }

  //drawing smoke 
  drawSmoke();
  fill(120, 120, 120, 30);

  //main shape
  push();
  translate(x, y);
  rotate(frameCount * 0.01);
  if (shape === 'circle') {
    ellipse(0, 0, size);
  } else if (shape === 'square') {
    rectMode(CENTER);
    rect(0, 0, size, size);
  } else if (shape === 'triangle') {
    triangle(0, -size / 2, -size / 2, size / 2, size / 2, size / 2);
  }
  pop(); //going back to previous state

  //timing so the shape change and move every few seconds
  if (millis() - lastChangeTime > changeInterval) {
    lastChangeTime = millis();
    changeShape();
  }

  let noOfPoints = 100; //total of points

  push(); //save the current state
  translate(width / 2, height / 2); //points origin

  for (let i = 0; i < noOfPoints; i++) {
    rotate(TWO_PI / noOfPoints); //the points rotating the main shapes

    //treble
    strokeWeight(3);
    stroke(255);
    point(mappedTreble, height / 4);
    //mid
    strokeWeight(3);
    stroke(175, 54, 60);
    point(mappedMid, height / 4);
    //bass
    strokeWeight(3);
    stroke(255, 0, 0);
    point(mappedBass, height / 4);
  }

  pop();
}

function drawSmoke() {
  push();
  translate(width / 2, height / 2);
  noStroke();
  fill(200, 200, 200, 15); // soft translucent grey
  beginShape();
  let radius = 300;
  let angleStep = TWO_PI / 150;
  for (let angle = 0; angle < TWO_PI; angle += angleStep) {
    let xoff = cos(angle) * 2;
    let yoff = sin(angle) * 2;
    let r = radius + noise(xoff + frameCount * 0.01, yoff, zoff) * 100;
    let x = r * cos(angle);
    let y = r * sin(angle);
    vertex(x, y);
  }
  endShape(CLOSE);
  pop();

  zoff += 0.005;
}
//the shapes change every 4 seconds
function changeShape() {
  const shapes = ['circle', 'square', 'triangle'];
  shape = random(shapes);
}

function canvasPressed() {
  mySound.play();
  mySound.loop();
}

