Create a code page for each file in the repository. Name each code page the name of the file. Here is a description of each file

quickSheetCreate.html - creates new exports that you can then run and update later

qbAPI.js - repository of QB api calls for other code pages to reference

stylesheet.css - sets visual properties of script

#TODO - installer.html - will create tables and fields to store exports in app, then it will create code page config.js

config.js = stores the dbids and fids where exports are stored in your app

#TODO - update quickSheetCreate.html to intake a mode - run, update, add(default) 
    
    run mode - will export current QuickSheet Template and send user back to their original page

    update mode - will preload QuickSheet Template - option to run and/or run + save (can update export name, export tabs)
