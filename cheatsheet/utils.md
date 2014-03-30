# Utility Program Cheatsheets
## Screen
The following table shows the default key bindings:

* `screen -r` reattach
* `C-a '` -- Prompt for a window identifier and switch. See Selecting. 
* `C-a "` Present a list of all windows for selection. See Selecting. 
* `C-a <SPC>` `C-a n` `C-a C-n` (next) Switch to the next window. See Selecting. 
*  `C-a w` `C-a C-w` (windows) Show a list of active windows. See Windows. 
* `C-a p` `C-a C-p` `C-a C-h` `C-a <BackSpace>` (prev) Switch to the previous window (opposite of C-a n). See Selecting. 
* `C-a 0...9, -` (select 0...select 9, select -) Switch to window number 0...9, or the blank window. See Selecting. 
* `C-a d` `C-a C-d` (detach) Detach screen from this terminal. See Detach. 
* `C-a <Tab>` (focus) Switch the input focus to the next region. See Regions. 
* `C-a C-a` (other) Toggle to the window displayed previously. If this window does no longer exist, other has the same effect as next. See Selecting. 
* `C-a a` (meta) Send the command character (C-a) to window. See escape command. See Command Character. 
* `C-a A` (title) Allow the user to enter a title for the current window. See Naming Windows. 
* `C-a b` `C-a C-b` (break) Send a break to the tty. See Break. 
* `C-a B` (pow_break) Close and reopen the tty-line. See Break. 
* `C-a c` `C-a C-c` (screen) Create a new window with a shell and switch to that window. See Screen Command. 
* `C-a C` (clear) Clear the screen. See Clear. 
* `C-a D D` (pow_detach) Detach and logout. See Power Detach. 
* `C-a f` `C-a C-f` (flow) Cycle flow among ‘on’, ‘off’ or ‘auto’. See Flow. 
* `C-a F` (fit) Resize the window to the current region size. See Window Size. 
* `C-a C-g` (vbell) Toggle visual bell mode. See Bell. 
* `C-a h` (hardcopy) Write a hardcopy of the current window to the file “hardcopy.n”. See Hardcopy. 
* `C-a H` (log) Toggle logging of the current window to the file “screenlog.n”. See Log. 
* `C-a i` `C-a C-i` (info) Show info about the current window. See Info. 
* `C-a k` `C-a C-k` (kill) Destroy the current window. See Kill. 
* `C-a l` `C-a C-l` (redisplay) Fully refresh the current window. See Redisplay. 
* `C-a L` (login) Toggle the current window's login state. See Login. 
* `C-a m` `C-a C-m` (lastmsg) Repeat the last message displayed in the message line. See Last Message. 
* `C-a M` (monitor) Toggle monitoring of the current window. See Monitor. 
* `C-a N` (number) Show the number (and title) of the current window. See Number. 
* `C-a q` `C-a C-q` (xon) Send a ^Q (ASCII XON) to the current window. See XON/XOFF. 
* `C-a Q` (only) Delete all regions but the current one. See Regions. 
* `C-a r` `C-a C-r` (wrap) Toggle the current window's line-wrap setting (turn the current window's automatic margins on or off). See Wrap. 
* `C-a s` `C-a C-s` (xoff) Send a ^S (ASCII XOFF) to the current window. See XON/XOFF. 


## ps
* Show command line parameter: 
```sh
ps -fp <pid>
cat /proc/<pid>/cmdline
```
