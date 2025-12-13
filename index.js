const jsonfile = require('jsonfile');
const moment = require('moment');
const simpleGit = require('simple-git');

const FILE_PATH = './data.json';

// Specify the dates for which you want to make multiple contributions
const dates = [
    '2025-12-10T11:00:00Z',
    '2025-12-11T11:00:00Z',
    '2025-12-12T11:00:00Z',
    '2025-12-13T11:00:00Z',
    '2025-12-14T11:00:00Z'

]; // Add more dates as needed

// Number of contributions you want to make for each specified date
const numContributions = 5; // Example: 2 contributions per date

// Initialize git
const git = simpleGit();

// Function to perform the write, commit, and push operation
function makeContribution(formattedDate, contributionNumber, callback) {
    const data = {
        date: formattedDate,
        contribution: `Contribution #${contributionNumber}` // Unique content to make each commit different
    };

    // Write to JSON file
    jsonfile.writeFile(FILE_PATH, data, { spaces: 2 }, (err) => {
        if (err) {
            console.error('Error writing file:', err);
            return callback(err);
        }

        // Add, commit with specific date, and push
        git.add([FILE_PATH])
            .commit(`Update date to ${formattedDate} - Contribution #${contributionNumber}`, { '--date': formattedDate }, (commitErr) => {
                if (commitErr) {
                    console.error('Error committing:', commitErr);
                    return callback(commitErr);
                }

                git.push((pushErr) => {
                    if (pushErr) {
                        console.error('Error pushing:', pushErr);
                        return callback(pushErr);
                    }

                    console.log(`Contribution #${contributionNumber} committed and pushed successfully for date ${formattedDate}!`);
                    callback(null); // Proceed to the next contribution
                });
            });
    });
}

// Function to make multiple contributions for a specific date
function makeMultipleContributions(date, numContributions, callback) {
    const formattedDate = moment(date).format('YYYY-MM-DDTHH:mm:ssZ'); // Format date
    let count = 0;

    function next() {
        if (count < numContributions) {
            makeContribution(formattedDate, count + 1, (err) => {
                if (!err) {
                    count++;
                    next(); // Move to the next contribution
                }
            });
        } else {
            console.log(`All contributions completed for date ${formattedDate}!`);
            callback();
        }
    }

    next(); // Start the process for this date
}

// Function to loop through each date and make contributions
function makeContributionsForMultipleDates(dates, numContributions) {
    let dateIndex = 0;

    function processNextDate() {
        if (dateIndex < dates.length) {
            makeMultipleContributions(dates[dateIndex], numContributions, () => {
                dateIndex++;
                processNextDate(); // Move to the next date
            });
        } else {
            console.log('All contributions completed for all specified dates!');
        }
    }

    processNextDate(); // Start with the first date
}

// Start making multiple contributions for all specified dates
makeContributionsForMultipleDates(dates, numContributions);
