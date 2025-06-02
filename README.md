# PSD Exporter

## What is it?
This plugin is designed to loop through all layers in the document searching for Groups with the suffixes '_MERGE' or '_SWIPE'. If found, it flattens the relevant Group. Once all layers are flattened, it can then be used to export the file at the preset resolution. Optional functionality to add layer Masks to ensure layers don't increase in size when edited.

![image](https://github.com/user-attachments/assets/849c0554-2802-4a3b-8ad2-48b23ae207a4)

## How to use it
To install this plugin, you can either package the files yourself using Adobe UXP, or double click the package file with extension .ccx

Once a plugin is installed, it can be found in the Plugins dropdown.

**Plugins > Area Exporter > Area Exporter**

Once open, you can use this tool's interface in the same manner as other Photoshop panels, allowing you to resize (within limits), collapse and dock to the side bar.

## Features

### Flatten Layers

This function is designed to flatten all Groups with the correct suffixes.

1. Ensure that all groups have been created as outlined in the PSD setup guide. In short:
   - Individual assets should be self contained inside of a group with the suffix '_MERGE', which then sits inside the relevant parent group.
   - Full screen sprites should be in a group with the suffix '_SWIPE'. 

2. If step 1 is confirmed, press 'Flatten Layers' in the panel.

### Create Masks

This function is designed to loop through all groups in the file and apply a layer mask set to the position of the pixel data. This ensures that further edits to this file cannot increase the layer sizes accidentally.

1. Once the file is ready, simply click on 'Create Masks' to loop through all groups and create layer masks based on pixel data.

### Export File

This function is designed to resize the image to the correct export size and then save the file as a copy with the suffix '_EXPORT'.

1. Clean up or rename any necessary files after running the flatten layers function.
2. Click 'Export File', which will then open up a save dialog box, allowing you to rename the file if you wish, and select a save location. By default the save name will be the same as the original file, but with the suffix '_EXPORT'.

The file should now have been resized and saved to the chosen file name.
