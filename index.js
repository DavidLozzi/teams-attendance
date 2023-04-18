const fs = require('fs');
const {glob} = require('glob');

const filePath = process.argv[2];

console.log('getting files from', filePath);
const dates = []

// Use glob to find all CSV files that match the given file path
const processFiles = async () => {
  const files = await glob(filePath, {})
  const participants = new Map();

  console.log('found',files.length,'files')
  // Loop through each file and extract the participants data
  files.forEach((file) => {
    const contents = fs.readFileSync(file, 'utf16le');
    const lines = contents.split('\n');

    let start = null;
    let end = null;

    // Loop through each line and extract the participants data
    lines.some((line) => {
      if (line.startsWith('Meeting title')) {
        return;
      } else if (line.startsWith('Attended participants')) {
        return;
      } else if (line.startsWith('Start time')) {
        start = new Date(line.split('\t')[1]);
      } else if (line.startsWith('End time')) {
        end = new Date(line.split('\t')[1]);
      } else if (line.startsWith('Name\tFirst Join\tLast Leave')) {
        // Extract participants data
        dates.push(new Date(start).toLocaleDateString())
        const participantsData = lines.slice(lines.indexOf(line) + 1);
        return participantsData.some((participantLine) => {
          if (participantLine.startsWith('3. In-Meeting')) {
            return true; // exit the .some()
          }
          if (participantLine.trim() !== '') {
            const participant = participantLine.split('\t');
            const name = participant[0];
            if (name !== '') {
              const firstJoin = new Date(participant[1]);
              const lastLeave = new Date(participant[2]);
              let dateText = 'Present';

              // Check if participant left early or joined late
              if (firstJoin - start >= 600000) {
                dateText += ` - late (${Math.floor((firstJoin - start)/1000/60)} mins)`
              }

              if (end - lastLeave >= 600000) {
                dateText += ` - left early (${Math.floor((end - lastLeave)/1000/60)} mins)`
              }
              // Add participant data to participants array
              let vals = []
              if (participants.has(name)) {
                vals = participants.get(name)
              }
              vals.push({ date: new Date(start).toLocaleDateString(), attendance: dateText })
              participants.set(name, vals);
            }
          }
        });
      } else if (line.startsWith('3. In-Meeting')) {
        return true; // exit the .some()
      }
    });

    // Output participant data for the current file
    console.log(`File: ${file}`);
  });

  let output = `Name\t${dates.join('\t')}\n`
  console.log(`Name\t${dates.join('\t')}`);
  participants.forEach((val, key) => {
    const dateVals = dates.map(d => val.some(v => v.date.indexOf(d) > -1) ? val.find(v => v.date.indexOf(d) > -1).attendance : 'missed')
    console.log(`${key}\t${dateVals.join('\t')}`)
    output += `${key}\t${dateVals.join('\t')}\n`
  })
  console.log();

  fs.writeFileSync('attendance.csv',output.replace(/\t/g,','))
}

processFiles();