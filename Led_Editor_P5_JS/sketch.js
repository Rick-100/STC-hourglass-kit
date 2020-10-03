// hourglass led utility
// leds are an array of led objects numbered 0 - 56 

let myParagraph;
let myCanvas;
let addPageButton;
let insertPageButton;
let deletePageButton;
let nextPageButton;
let prevPageButton;
let startAnimateButton;
let stoptAnimateButton;
let fillTopPageButton;
let fillBottomPageButton;
let invertTopPageButton;
let invertBottomPageButton;
let copyPageButton;
let pastePageButton;
let clearPageButton;
let fillPageButton;
let invertPageButton;

let saveIhexButton;

let animateSlider;
let speedSlider;

let tArea;
let txt; //text variable for textarea
let fileInput;



let ledArray = []; //holds all 57 Led objects

let currentPageNum = 0; // 0 indexed
let numberOfPages = 1;
let prevPageNum = currentPageNum; // 0 indexed
let numOfPagesHasChanged = true; // to detect if user moved slider

let animateFlag = false;  //animatition variables
let frameCount = 0;
let speedCount = 10;
let appendFlag = false;

const maxPages = 341; // 4096 -2 / 12  for STC15W201S with 4K eeprom
//const maxPages = 85; // 1024 -2 / 12  for STC15W204S with 1K eeprom
const ledsPerPage = 57;



// build a 2 dimesnional array
let arrayOfBytes = new Array(maxPages * 12); // 12 bytes for each page
let arrayOfPages = new Array(maxPages * ledsPerPage); //57 leds for each page
let clipBoardPage = new Array(ledsPerPage); // array for pasting led states



function mousePressed() {
  for (let i = 0; i < ledArray.length; i++) { // loop through each led object
    ledArray[i].toggle(mouseX, mouseY, i); // check if it needs to be toggled
  }
  updatePageArray(currentPageNum);
}

function setUpButtons() {

  fillTopPageButton = createButton('Fill Top');
  fillTopPageButton.position(10, 50);
  fillTopPageButton.mousePressed(fillTop);

  fillBottomPageButton = createButton('Fill Bottom');
  fillBottomPageButton.position(10, 600);
  fillBottomPageButton.mousePressed(fillBottom);

  invertTopPageButton = createButton('Invert Top');
  invertTopPageButton.position(100, 50);
  invertTopPageButton.mousePressed(invertTop);

  invertBottomPageButton = createButton('Invert Bottom');
  invertBottomPageButton.position(100, 600);
  invertBottomPageButton.mousePressed(invertBottom);

  addPageButton = createButton('Add Page');
  addPageButton.position(270, 390);
  addPageButton.disabled = true;
  addPageButton.mousePressed(addPage);

  insertPageButton = createButton('Insert Page');
  insertPageButton.position(270, 440);
  insertPageButton.disabled = true;
  insertPageButton.mousePressed(insertPage);

  deletePageButton = createButton('Delete Page');
  deletePageButton.position(270, 480);
  deletePageButton.disabled = true;
  deletePageButton.mousePressed(deletePage);



  prevPageButton = createButton('<');
  prevPageButton.position(275, 290);
  prevPageButton.mousePressed(prevPage);

  nextPageButton = createButton('>');
  nextPageButton.position(405, 290);
  nextPageButton.mousePressed(nextPage);

  startAnimateButton = createButton('PLAY');
  startAnimateButton.position(270, 330);
  startAnimateButton.mousePressed(startAnimate);

  stopAnimateButton = createButton('STOP');
  stopAnimateButton.position(390, 330);
  stopAnimateButton.mousePressed(stopAnimate);

  copyPageButton = createButton('Copy');
  copyPageButton.position(270, 100);
  copyPageButton.mousePressed(copyCurrentPage);

  pastePageButton = createButton('Paste');
  pastePageButton.position(270, 130);
  pastePageButton.mousePressed(pasteIntoCurrentPage);

  clearPageButton = createButton('Clear');
  clearPageButton.position(270, 160);
  clearPageButton.mousePressed(clearCurrentPage);
  
  fillPageButton = createButton('Fill');
  fillPageButton.position(270, 190);
  fillPageButton.mousePressed(fillCurrentPage);
  
  invertPageButton = createButton('Invert');
  invertPageButton.position(270, 220);
  invertPageButton.mousePressed(invertCurrentPage);  
  

  saveIhexButton = createButton('Generate Hex');
  saveIhexButton.position(270, 520);
  saveIhexButton.mousePressed(saveIntelHex);

  animateSlider = createSlider(1, numberOfPages + 1, 1, 1);
  animateSlider.position(270, 270);
  animateSlider.style('width', '160px');
  
  speedSlider = createSlider(1,40,20,1);
  speedSlider.position(270,360);
  speedSlider.style('width', '100px');
  
  appendCheckbox = createCheckbox('Append', false);
  appendCheckbox.position(270,570);
  appendCheckbox.changed(appendCheckedEvent);
  
  
}

function saveFile() {
  // Get the value of the textarea 
  // Split according to nextline characters 
  stringList = tArea.value().split("\n");

  // Save the strings to file 
  save(stringList, "output_file.txt");
}




function setup() {
  myCanvas = createCanvas(30 * 8, 30 * 16);
  myCanvas.position(0, 100);

  fileInput = createFileInput(handleFile);
  fileInput.position(270, 600);

  let ytab = 30;
  let xtab = 30;
  let dia = 28;

  let ledNum = 0;
  let xoffset = 0;
  let currentY = ytab;

  // draw the top half of leds
  for (let y = 7; y >= 1; y--) {
    //print('y = ' + y);
    for (let x = 0; x < y; x++) {
      ledArray[ledNum] = new Led(xoffset + ((x + 1) * xtab), currentY, dia);
      ledArray[ledNum].setState(0);
      ledNum++;

    }
    currentY = currentY + ytab;
    xoffset = xoffset + (xtab / 2);
  }


  //draw the middle led
  ledArray[ledNum] = new Led(xoffset + (xtab / 2), currentY, dia);
  ledArray[ledNum].setState(0);


  ledNum++;
  currentY = currentY + ytab;
  xoffset = xoffset - (xtab / 2); //adjust back half of xtab

  //draw  the bottom half of leds
  for (let y = 1; y <= 7; y++) {
    //print('y = ' + y);
    for (let x = 0; x < y; x++) {
      ledArray[ledNum] = new Led(xoffset + ((x + 1) * xtab), currentY, dia);
      ledArray[ledNum].setState(0);
      ledNum++;

    }
    currentY = currentY + ytab;
    xoffset = xoffset - (xtab / 2);
  }

  initArrays();

  setUpButtons();

  myParagraph = createP('');
  myParagraph.position(270, 230);
  myParagraph.html('Page ' + str(currentPageNum + 1) + " of " + str(numberOfPages));

  // Create a textarea for the input of text 
  tArea = createElement("textarea");
  tArea.position(10, 640);
  tArea.size(400, 100);
  //tArea.value(tArea.value() + "\n" + "another line");
}


function draw() {
  updateSlider();
  frameCount++;
  if (frameCount > speedSlider.value()) {
    frameCount = 0;
    if (animateFlag) {
      if (currentPageNum < numberOfPages - 1) {
        nextPage();
      } else {
        currentPageNum = 0;
        //print('nextPage' + currentPageNum);
        prevPageNum = currentPageNum;
        updateStatus();

      }
    }
  }
  background(220);
  let c = color(0, 255, 0);
  fill(c);
  noStroke();
  rect(0, 0, 30 * 8, 30 * 16);
  for (let i = 0; i < ledArray.length; i++) {
    ledArray[i].show();

  }



}