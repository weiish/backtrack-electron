# backtrack-electron

This is my first attempt at making an Electron application. I wanted to visualize the time I spend on my computer, so I built an application in two parts.

This is the visualization part of the application, and takes in specifically formatted files to output how much time I've spent on each process or window. 

The data collection part of the application which was built using python (wxpython for the GUI) can be found here at https://github.com/weiish/backtrack-logger

# Usage

First, data must be collected using the logger python app. It runs in the background and can be minimized to the tray.
It will store IN LOCAL FILES the active process name, window name, and time spent on that window/process as you use your computer.
When you have some data you want to display, you can use the electron visualizer app to open those files and filter them to see what you spent the most time on for that day!
