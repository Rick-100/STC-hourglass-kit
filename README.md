# STC-hourglass-kit
Hour Glass Kit firmware

This is a C program written for driving the 57 led hourglass kits available on sites like Banggood, ICStation, Ebay etc. It was compiled using the SDCC compiler for the STC15W201S mcu that comes with the kit. The mcu is 8051 based and has 1K of program memory, 256 bytes of ram, and 4K of eeprom. It is cheap and available from LCSC. The only hardware required to program the STC mcu is a USB to TTL serial converter like the CH340. STC-ISP is the free utility used to download the program and data to the STC. The new firmware allows you to display your own patterns. It cycles through each page. The pushbutton is used to adjust the speed it cycles. I have written a P5 JS program that can create the data for the display in the Intel hex format. The Javascript program can generate an Intel hex file that can be read by the STC-ISP software. The data is stored in the mcu eeprom. Each page or screen of data is stored in 12 bytes. The first 2 data bytes of the hex file are the number of pages. The maximum number of pages is 341 for the 4k eeprom STC15W201S.

Link to the P5 JS LED Editor:
https://rick-100.github.io/STC-Hourglass-Led-Editor-P5-JS/

There are 2 Intel hex files. The HG_eep2_bin.hex is the firmware. The page_336b.hex is a sample data file that can be programmed into the eeprom. You can also load the data file into the led editor. It contains 336 pages of data. The C source file contains the Windows batch file I used to compile the program. I stored the 2 source files in the same folder I put the SDCC compiler in. This is kind of messy but it made things simpler. 

