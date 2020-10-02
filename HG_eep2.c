// program to drive an 57 led hourglass kit sold on Banggood, ICStation, Ebay...
// written in C to be compiled with SDCC compiler
// target MCU is STC15W201S or STC15W204S
//
// the patterns are stored in eeprom in 12 byte pages / the first 2 bytes of the data holds the page count 
// a program written in Javascript is used to produce the patterns and generate the Intel hex files that can be read by the STC-ISP software
//
// the leds are arranged in a 5 X 6 matrix with both common anode and common cathode sections so 60 leds could be driven but only 57 are used
// P3.0 , P3.1 , P3.3 , P3.6 , P3.7 make up the rows
// P1.0 , P1.1 , P1.2 , P1.3 , P1.4 , P1.5 make up the columns
// refer to the schematic for all the ugly details
//
// the design uses no current limiting resistors or drive transistors so only one led is driven at a time for a short period
// each led is driven in sequence 
// the display has to be driven constantly for the POV effect


// this is the windows batch file I used to compile the program
/* set PATH="C:\SDCC_compiler\bin";%PATH%
rem sdcc -mmcs51 --code-size 1016 --opt-code-size --verbose HGC.c -o HGC_bin.ihx
rem sdcc -mmcs51 --code-size 4088 --opt-code-size --verbose HGC.c -o HGC_bin.ihx
sdcc -mmcs51 --code-size 1016 --opt-code-size --verbose HG_eep2.c -o HG_eep2_bin.ihx
packihx HG_eep2_bin.ihx > HG_eep2_bin.hex
rem packihx HGC_bin.ihx > HGC_bin.hex

pause
 */

// the SDCC compiler folder is stored at c:\SDCC_compiler
// the source files are stored in this folder to make it easier
// it's a little messy but makes it easier set up


 
// the lines that start with rem are remarked out 
// the line 
// sdcc -mmcs51 --code-size 1016 --opt-code-size --verbose HG_eep2.c -o HG_eep2_bin.ihx
// compiles the program for the STC15W201S that has 1K of program memory
// the remarked out line
// rem sdcc -mmcs51 --code-size 4088 --opt-code-size --verbose HGC.c -o HGC_bin.ihx
// compile the program for the STC15W204S which has 4K of program memory
//
// the line
// packihx HG_eep2_bin.ihx > HG_eep2_bin.hex
// converts the ihx file to an intel hex file
//
// the pause line just keeps the command window until you close it so you can tell if the compile succeded


#include "my_stc_.h"	// converted header file

#define CMD_IDLE    0		// defines for eeprom routines taken from data sheet
#define CMD_READ    1
#define CMD_PROGRAM 2
#define CMD_ERASE   3
#define ENABLE_IAP 0x81           //if SYSCLK<24MHz

volatile unsigned int ISRvar;    // ISR counter variable
volatile unsigned char speedVal;

unsigned char barray[12];	// each page is held in a 12 byte array

const unsigned char P3convert[5] = {0,1,3,6,7};	//convert to bit number inside port

const unsigned char p3_out_table[5] = { 0xfe, 0xfd, 0xf7, 0xbf, 0x7f};	//byte value to write to port  11111110B, 11111101B, 11110111B, 10111111B, 01111111B

const unsigned char speed_table[8] = { 80, 70, 60, 50, 40, 30, 20, 10};

void IapIdle();

void Timer0_ISR(void) __interrupt (1)
    {
    ISRvar++;        // Increment counter variable.
	if(ISRvar >= speedVal){	// reset to 0 if it reaches speedVal set in foreground
		ISRvar = 0;
		speedVal =0;
		}
    }


void blip(void){	// delay for each led on time
 	unsigned char x;
	for(x = 0; x < 250; x++){ 	//generates a false warning in SDCC but compiles correctly
	}
}


void setAllHighImp(){	// set all IO to high impedence except P3.2 that is connected to speed push button / it's quasi bidirectional 
	P1M1 = 0xff;
	P1M0 = 0;
	P3M1 = 0xfb;
	P3M0 =0;
}

void setPortMode(unsigned char port,unsigned char bitNum, unsigned char mode){	// only works on ports 0, 3 now
	unsigned char tmp1 = 0;
	unsigned char tmp2 = 0;
	unsigned char tmp3 = 0;
	unsigned char tmp4 = 0;
	
		if(mode & 0x01){
			tmp1 = 1 << bitNum;
		}
		if(mode & 0x02){
			tmp2 = 1 << bitNum;
		}

	switch(port){
		case 1 :
			tmp3 = (P1M0 & ~tmp1) | tmp1;
			tmp4 = (P1M1 & ~tmp1) | tmp2;

			P1M0 = tmp3;
			P1M1 = tmp4;
			break;
		case 3 :
			tmp3 = (P3M0 & ~tmp1) | tmp1;
			tmp4 = (P3M1 & ~tmp1) | tmp2;

			P3M0 = tmp3;
			P3M1 = tmp4;
			break;
	}	
	
}

void driveLeds(void){
//DRIVE_LEDS
//first drive the leds with anodes connected to P3 and cathodes connected to P1
//a Hi on P3 pin and LOW on P1 pin will turn on led
// the odd number elements in the array are common anode with respect to P1 so p1.X  is low to drive the led
// the even numbers are common cathode so P1.x is high to drive the led
// the first time through the outermost loop the even elements are used
// the second time through the odd elements are used

	unsigned char ledCtr;
	unsigned char currentByte;	//the byte indexed by ledCtr read into a local variable
	unsigned char common;	// outer most loop is run twice // value will be 0 or 1 
	unsigned char column;	//P1
	unsigned char row;	//P3

	unsigned char bitMaskP1; 	//bitmask for P1 only one bit low at a time
	unsigned char bitMaskColumn;	//mask for the bit inside currentByte

	P1 = 0xff;	//default all high
	P3 = 0xff;	//
	ledCtr = 0;
	bitMaskP1 =0xfe; //row starts with only one line low
	bitMaskColumn = 0x01;
	for(common = 0; common < 2; common++){
		for(row = 0;row < 6; row++){
			for(column = 0;column < 5; column++){
				currentByte =  barray[ledCtr];
				P1 = bitMaskP1;			//bring one line low but it's still high impedence
				setPortMode(1,row,1);		//this should make the column driver on P1 a push pull output
				if(currentByte & bitMaskColumn){
					setPortMode(3,P3convert[column],1);	//make P3.X mode 1 push pull outputs
					if(ledCtr & 1){		// only on odd elements of array are the P3.X pin driven low
						P3 = p3_out_table[column];
					}
					blip();
				}
				P3 = 0xff;
				P1 = 0xff;
				setAllHighImp();
				bitMaskColumn = bitMaskColumn << 1;	// mask for next bit in currentByte
			}
			bitMaskColumn = 0x01;	// reset it for next byte
			ledCtr++;		// every other byte
			ledCtr++;

			bitMaskP1 = bitMaskP1 << 1; //row
		}
		bitMaskP1 =0xff; //the second time through the loop the P1 pins stay high
		ledCtr = 1;	// do the odd elements
	}	


}

unsigned char IapReadByte(unsigned int addr){	//read a byte from eeprom / copied from data sheet
    unsigned char dat;

    IAP_CONTR = ENABLE_IAP;
    IAP_CMD = CMD_READ;
    IAP_ADDRL = addr;
    IAP_ADDRH = addr >> 8;
    IAP_TRIG = 0x5a;
    IAP_TRIG = 0xa5;
	
    //_nop_();                        // works in Keil
	__asm								// for sdcc use inline assembly for nop ********note the 2 leafding underscores for asm and endasm*********
	nop
	__endasm;
	
    dat = IAP_DATA;
    IapIdle();

    return dat;                     //·µ»Ø
}

void IapIdle(){		// used by eeprom read routine / copied from data sheet
    IAP_CONTR = 0;                  //
    IAP_CMD = 0;                    //
    IAP_TRIG = 0;                   //
    IAP_ADDRH = 0x80;               //
    IAP_ADDRL = 0;
}

void loadPage(unsigned int pageNum){	// load a page(12 bytes) from eeprom into barray
	unsigned int address;
	unsigned char x;

	address = pageNum * 12 + 2;
	for(x = 0;x < 12;x++){
		barray[x] = IapReadByte(address);
		address++;
	}
}

void main(void){
	unsigned int pages;
	unsigned char pagecntH;
	unsigned char pagecntL;
	unsigned int pagecnt;
	unsigned char speedIndex;

	setAllHighImp();
	
	// set up the t0 interrupt
	TMOD = 0x3;        // Timer mode 3 16 bit auto reload
    TL0 = 224;        // set up timer 0 for 20000 cycles of (sys clock / 12) so each int = .01 sec at 24MHz
    TH0 = 177;        // timer counts up so reload value is (65536 - 20000)
    TR0 = 1;        // Set timer to run.
    ET0 = 1;        // Set interruptenable
    EA = 1;            // Set global interrupt enable
	
	speedIndex = 4;
	
	// repeatedly cycle through pages checking for speed change button press
	while(1){
		pagecntL = IapReadByte(0);					// get the number of pages held in first 2 bytes of eeprom
		pagecntH = IapReadByte(1);
		pagecnt = pagecntL + (pagecntH * 256);
		
		speedVal = speed_table[speedIndex & 0x07];

		for(pages = 0;pages < pagecnt;pages++){
			loadPage(pages);
			while(speedVal){	// number of times  to drive leds before changing led pattern / it is decremented to 0 by interrupt routine
				driveLeds();	//must be called continously
				if(!P3_2){
				speedIndex++;
				speedVal = speed_table[speedIndex & 0x07];
				while(!P3_2){};		//wait here until button is released
				}	
			}
			speedVal = speed_table[speedIndex & 0x07];	//mask off all except bottom 3 bits for 0 - 7 counter
		}
	}
}
