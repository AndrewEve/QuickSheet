This project is meant to help exporting multiple preconfigured Quickbase reports from Quickbase to Excel. Kanban Reports are not supported. The QuickSheets.html code page allows the user to select and order reports into their own separate Excel tabs. Once configured to the users liking the reports can be exported in full (>25 MB) to Excel. Users can also save configured Excel exports into templates using 2 dedicated tables. 

The QuickSheets.html page has 3 modes - create (default), run, and update. By loading the code page without a reference to a mode, you will be able to create a new export and save it to dedicated tables in your app. The run mode will export one of your saved templates by referencing a record id in the template table. The update mode will allow you to Export, Save, or Export and Save a template also by referencing a record id in the template table.

The installer will expedite setup of this extension in your application by creating the necessary code pages and tables.

Run Installer with following steps
    Download QuickSheetsInstaller.html
    Create Quickbase Code Page called "QuickSheetsSetup.html"
    Copy and paste installer contents into code page
    Open Code page

If you make changes to one of the template tables, this will impact the ability to save and export templates. You can run the QuickSheetsSetup.html code page to reconfigure the setup. This will directly edit the QuickSheetsConfig.js
