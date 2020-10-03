function initArrays() {
  for (let i = 0; i < (maxPages * 12); i++) {
    arrayOfBytes[i] = 0;
  }
  for (let i = 0; i < (maxPages * ledsPerPage); i++) {
    arrayOfPages[i] = false;
  }
  for (let i = 0; i <= (ledsPerPage - 1); i++) {
    clipBoardPage[i] = 0;
  }
}

//-----------

function updateLedStatesToCurrentPage() {
  let pageOffset = currentPageNum * ledsPerPage;
  for (let i = 0; i <= (ledsPerPage - 1); i++) {
    ledArray[i].setState(arrayOfPages[pageOffset + i]);
  }
}

function updatePageArray(page) { //updates the arrayOfPages according to displayed led page

  // now do arrayOfPages , 57 boolean values per page
  let pageOffset = page * ledsPerPage;
  for (let i = 0; i <= (ledsPerPage - 1); i++) {
    arrayOfPages[i + pageOffset] = ledArray[i].state;
  }
}

function updateAllBytePages() { //sets the binary values in the byte array for each page
  for (j = 0; j < numberOfPages; j++)
    updateByteArray(j);
}

function updateByteArray(page) { //update byte array according to page array
  let tableByte;
  let bitInByte;

  let pageOffsetByte = page * 12;

  for (i = pageOffsetByte; i <= (pageOffsetByte + 11); i++) { // fill array page with 0 
    arrayOfBytes[i] = 0;
  }

  // now convert the led objects state to the bytes  in arrayOfBytes 
  let pageOffsetPages = page * ledsPerPage;
  for (let i = 0; i <= (ledsPerPage - 1); i++) {
    tableByte = Math.trunc(i / 5);
    bitInByte = i % 5;
    if (arrayOfPages[pageOffsetPages + i] == true) {
      arrayOfBytes[pageOffsetByte + tableByte] = arrayOfBytes[pageOffsetByte + tableByte] | pow(2, bitInByte);


    }
  }

}

//-----------

function copyCurrentPage() {
  //print('Copy');
  let pageOffset = currentPageNum * ledsPerPage;
  for (let i = 0; i <= (ledsPerPage - 1); i++) {
    clipBoardPage[i] = arrayOfPages[pageOffset + i];
  }
}


function pasteIntoCurrentPage() { // copy clipboard to current page
  let pageOffset = currentPageNum * ledsPerPage;
  for (let i = 0; i <= (ledsPerPage - 1); i++) {
    arrayOfPages[pageOffset + i] = clipBoardPage[i];
  }
  updateLedStatesToCurrentPage();
}


function clearCurrentPage() {
  let pageOffset = currentPageNum * ledsPerPage;
  for (let i = 0; i <= (ledsPerPage - 1); i++) {
    arrayOfPages[pageOffset + i] = false;
  }
  updateLedStatesToCurrentPage();
}

function fillCurrentPage() {
  let pageOffset = currentPageNum * ledsPerPage;
  for (let i = 0; i <= (ledsPerPage - 1); i++) {
    arrayOfPages[pageOffset + i] = true;
  }
  updateLedStatesToCurrentPage();

}

function invertCurrentPage() {
  let pageOffset = currentPageNum * ledsPerPage;
  for (let i = 0; i <= (ledsPerPage - 1); i++) {
    arrayOfPages[pageOffset + i] = !(ledArray[i].state);
  }
  updateLedStatesToCurrentPage();
}

function fillTop() {
  let pageOffset = currentPageNum * ledsPerPage;
  for (let i = 0; i <= 27; i++) {
    arrayOfPages[pageOffset + i] = 1;
  }
  updateLedStatesToCurrentPage();
}

function fillBottom() {
  let pageOffset = currentPageNum * ledsPerPage;
  for (let i = 29; i <= (ledsPerPage - 1); i++) {
    arrayOfPages[pageOffset + i] = 1;
  }
  updateLedStatesToCurrentPage();
}

function invertTop() {
  let pageOffset = currentPageNum * ledsPerPage;
  for (let i = 0; i <= 27; i++) {
    arrayOfPages[pageOffset + i] = !(ledArray[i].state);
  }
  updateLedStatesToCurrentPage();
}

function invertBottom() {
  let pageOffset = currentPageNum * 57;
  for (let i = 29; i <= (ledsPerPage - 1); i++) {
    arrayOfPages[pageOffset + i] = !(ledArray[i].state);
  }
  updateLedStatesToCurrentPage();
}


function addPage() {
  if (currentPageNum < maxPages - 1) {
    numberOfPages++;
    numOfPagesHasChanged = true;
    currentPageNum = numberOfPages - 1;
    prevPageNum = currentPageNum;

    clearCurrentPage();
    updatePageArray(currentPageNum);
    updateStatus();
  }

}


function insertPage() { //inserts a new blank page at current page
  if (numberOfPages < maxPages) {
    //print('insert at' + currentPageNum);
    numberOfPages++;
    prevPageNum = currentPageNum;
    numOfPagesHasChanged = true;
    for (let j = numberOfPages; j > currentPageNum; j--) { //loop through each page
      let pageOffset = j * ledsPerPage;
      //print('j = ' + j);
      for (i = 0; i <= (ledsPerPage - 1); i++) { // loop through each led of page
        arrayOfPages[pageOffset + i] = arrayOfPages[pageOffset + i - ledsPerPage];
      }

    }
    clearCurrentPage();
  }
  updateStatus();
}


function deletePage() { //deletes  the current page

  if (numberOfPages > 1) {
    if ((currentPageNum + 1) == numberOfPages) { //if current page is last page
      numberOfPages--;
      currentPageNum--;
      prevPageNum = currentPageNum;
      numOfPagesHasChanged = true;
    } else {
      for (let j = currentPageNum + 1; j <= numberOfPages; j++) { //loop through each page
        let pageOffset = j * ledsPerPage;
        for (i = 0; i <= (ledsPerPage - 1); i++) { // loop through each led of page
          arrayOfPages[pageOffset + i - ledsPerPage] = arrayOfPages[pageOffset + i];
        }
      }
      numberOfPages--;
    }
    updateLedStatesToCurrentPage();
  }
  updateStatus();

}


function prevPage() {
  if (currentPageNum > 0) {
    currentPageNum--;
    //print('prevPage' + currentPageNum);
    prevPageNum = currentPageNum;
    updateStatus();

  }
}

function nextPage() {
  //print('nextPage' + currentPageNum);
  if (currentPageNum < (numberOfPages - 1)) {
    currentPageNum++;
    //print('nextPage' + currentPageNum);
    prevPageNum = currentPageNum;
    updateStatus();

  }
}

function updateStatus() {
  updateLedStatesToCurrentPage();
  //animateSlider.value(currentPageNum + 1);
  if (numOfPagesHasChanged) {
    reloadSlider();
    numOfPagesHasChanged = false;
  } else {
    animateSlider.value(currentPageNum + 1);
  }
  updateP();

}



function updateP() {
  myParagraph.html('Page ' + str(currentPageNum + 1) + " of " + str(numberOfPages));
}

function reloadSlider() { //done to resize slider so no mapping is needed
  animateSlider.remove();

  animateSlider = createSlider(1, numberOfPages, currentPageNum + 1, 1);

  animateSlider.position(10, 10);
  animateSlider.position(270, 270);
  animateSlider.style('width', '160px');
  //print('reload slider');

}

function updateSlider() {
  // detect that user moved slider

  let tempSlider = animateSlider.value();
  if ((tempSlider - 1) != prevPageNum) {
    //print('slider changed ' + prevPageNum + tempSlider);
    //currentPageNum = (tempSlider);
    currentPageNum = (tempSlider - 1);
    prevPageNum = currentPageNum;
    updateLedStatesToCurrentPage();
    updateP();

  }
}

function appendCheckedEvent() {
  appendFlag = this.checked();
}

function startAnimate() {
  animateFlag = true;
}

function stopAnimate() {
  animateFlag = false;
}

function saveIntelHex() {

  updateAllBytePages();

  let hexLine = "";
  let eepromAdd = 0;
  let checksum = 0;

  //first line adds :nnAAAArr to hexLine
  hexLine = hexLine + ":" + hex(2, 2) + hex(floor(eepromAdd / 256), 2) + hex(eepromAdd % 256, 2) + "00";
  checkSum = 2 + (floor(eepromAdd / 256)) + (eepromAdd % 256);

  //the first 2 bytes in eeprom are the numberOfPages count, least significant byte first
  hexLine = hexLine + hex(numberOfPages % 256, 2);
  checkSum = checkSum + numberOfPages % 256;
  hexLine = hexLine + hex(floor(numberOfPages / 256), 2);
  checkSum = checkSum + floor(numberOfPages / 256);
  checkSum = (((checkSum & 255) ^ 255) + 1) & 255;
  hexLine = hexLine + hex(checkSum, 2) + "\r\n";
  eepromAdd = eepromAdd + 2;
  checkSum = 0;

  // now do the pages
  for (let i = 0; i < numberOfPages; i++) {
    hexLine = hexLine + ":" + hex(12, 2) + hex(floor(eepromAdd / 256), 2) + hex(eepromAdd % 256, 2) + "00";
    checkSum = 12 + (floor(eepromAdd / 256)) + (eepromAdd % 256);
    for (let j = 0; j <= 11; j++) {
      hexLine = hexLine + hex(arrayOfBytes[(i * 12) + j], 2);
      checkSum = checkSum + arrayOfBytes[(i * 12) + j];
    }
    checkSum = (((checkSum & 255) ^ 255) + 1) & 255;
    hexLine = hexLine + hex(checkSum, 2) + "\r\n";
    eepromAdd = eepromAdd + 12;
    checkSum = 0;
  }
  hexLine = hexLine + ":00000001FF\r\n";
  //print(hexLine);
  tArea.value(hexLine);

}


function parseLine(lineToParse) {
  //print('linetoparse = ' + lineToParse);
  let localArray = []; // array of integers

  let byteCount = parseInt(lineToParse.substring(1, 3), 16); // get byte count



  let address = parseInt(lineToParse.substring(3, 7), 16); // get address

  let recordType = parseInt(lineToParse.substring(7, 9), 16); // get address
  //print(recordType);
  //localArray.push(recordType);

  //   let pageCountLow = parseInt(lineToParse.substring(9, 11), 16); // get number of pages
  //   //print(pageCountLow);

  //   let pageCountHigh = parseInt(lineToParse.substring(11, 13), 16); // get number of pages
  //   //print(pageCountHigh);

  //let pageCount = (pageCountHigh * 256) + pageCountLow;
  //print(pageCount);
  //localArray.push(pageCount);

  for (let j = 0; j < byteCount; j++) {
    localArray.push(parseInt(lineToParse.substring((j * 2) + 9, (j * 2) + 11), 16));
  }

  return localArray;

}


function handleFile(file) {
  let appendOffset = 0;
  let okToLoad = true;
  let numberOfPagesToLoad;
  let arrayLength;
  let myStrArray;
  let parsedArray;

  //print(file);
  if (file.type === 'text') {
    tArea.value(file.data);
    myStrArray = splitTokens(file.data);
    //print(myStrArray);

    arrayLength = myStrArray.length;
    parsedArray = parseLine(myStrArray[0]);
    numberOfPagesToLoad = (parsedArray[0] + (parsedArray[1] * 256));
    //print('numberOfPagesToLoad = ' + numberOfPagesToLoad);

    if (appendFlag) {
      //print('append');
      appendOffset = numberOfPages; // add new pages to end of current pages
    } else {
      appendOffset = 0;
    }

    if (appendFlag && ((numberOfPagesToLoad + numberOfPages) > maxPages)) {
      okToLoad = false;
      alert("File has too many pages to append.\nFile was nor loaded.");
    }
  }
  if (okToLoad) {
    //let arrayLength = myStrArray.length;
    // the first line contains the number of pages
    //let parsedArray = parseLine(myStrArray[0]);
    // set numberOfPages to number of pages in file plus the appendOffset 
    numberOfPages = numberOfPagesToLoad + appendOffset;
    //print('number pages = ' + numberOfPages);

    for (let pageNum = 1; pageNum < (arrayLength - 1); pageNum++) {
      //print('pagenum = ' + pageNum);
      let parsedLine = parseLine(myStrArray[pageNum]);
      //print(parsedLine);
      let ledCounter = 0;
      for (let byteNumber = 0; byteNumber < 12; byteNumber++) {
        let bitMask = 1;
        for (let bitNumber = 0; bitNumber < 5; bitNumber++) {
          if (parsedLine[byteNumber] & bitMask) {
            //arrayOfPages[((pageNum - 1) * ledsPerPage) + ledCounter] = 1;
            arrayOfPages[(((pageNum - 1) + appendOffset) * ledsPerPage) + ledCounter] = 1;
          } else {
            //arrayOfPages[((pageNum - 1) * ledsPerPage) + ledCounter] = 0;
            arrayOfPages[(((pageNum - 1) + appendOffset) * ledsPerPage) + ledCounter] = 0;

          }
          //print('page ' + (pageNum -1) + ' byte ' + byteNumber + ' bit ' + bitNumber + 'bit mask ' + bitMask + 'led ' + ledCounter);

          bitMask = bitMask << 1;
          ledCounter++;
        }

      }




    }
    currentPageNum = 0;
    //updateLedStatesToCurrentPage();
    numOfPagesHasChanged = true;
    updateStatus();
    myParagraph.html('Page ' + str(currentPageNum + 1) + " of " + str(numberOfPages));

  }
  fileInput.value(''); // have to do this to reload same file again
}