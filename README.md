# Simple Uncapped Youtube Speed
Tampermonkey script for uncapping youtube's speed control hotkeys.

## Usage
Once the script is loaded, just use <kbd>&lt;</kbd> (<kbd>Shift</kbd>+<kbd>,</kbd>) and <kbd>&gt;</kbd> (<kbd>Shift</kbd>+<kbd>.</kbd>) as normal to change speed by 0.25x increments.

Also adds the hotkey <kbd>:</kbd> (<kbd>Shift</kbd>+<kbd>;</kbd>) to reset speed to 1x.

These keys and the amount they change by can be modified in the config object at the top of the file.

Using the settings menu also works, but the Custom option hasn't been tested. Add your desired speed to the script config instead.

Speed is tracked between videos on the same tab, but not across tabs or through refreshes.
