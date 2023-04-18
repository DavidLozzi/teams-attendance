# Microsoft Teams Meeting Attendance Tabular Report

Download your meeting's attendance, works best with recurring meetings, and point this script to it and get a tabular report of who attended, who missed, and who was late or left early!

Intention is not to be "big brother" but instead identify folks who are struggling with attendance. You can also create summary reports in Excel to understand how well your meetings are being attended.

## How to use

Clone down this repo.

Run `npm i` to install the dependencies

Run the script:

`node index.js "path/to/files/Meeting Name*.csv"`

It will output `attendance.csv` file and write to the console.
