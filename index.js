const jsonfile = require('jsonfile');
const moment = require('moment');
const simpleGit = require('simple-git');

const FILE_PATH = './data.json';

// Specify the dates for which you want to make multiple contributions
const dates = [
    '2025-12-15T11:00:00Z',
    '2025-12-16T11:00:00Z',
    '2025-12-17T11:00:00Z',
    '2025-12-18T11:00:00Z',
    '2025-12-19T11:00:00Z',
    '2025-12-20T11:00:00Z',
    '2025-12-21T11:00:00Z',
    '2025-12-22T11:00:00Z',
    '2025-12-23T11:00:00Z',
    '2025-12-24T11:00:00Z',
    '2025-12-25T11:00:00Z'
]; // Add more dates as needed

// Number of contributions you want to make for each specified date
const numContributions = 4; // Example: 2 contributions per date

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

        // Set environment dates so both author and committer timestamps match
        const previousAuthorDate = process.env.GIT_AUTHOR_DATE;
        const previousCommitterDate = process.env.GIT_COMMITTER_DATE;
        process.env.GIT_AUTHOR_DATE = formattedDate;
        process.env.GIT_COMMITTER_DATE = formattedDate;

        git.add([FILE_PATH])
            .commit(`Update date to ${formattedDate} - Contribution #${contributionNumber}`, (commitErr) => {
                // Restore env vars regardless of commit result
                if (previousAuthorDate === undefined) delete process.env.GIT_AUTHOR_DATE; else process.env.GIT_AUTHOR_DATE = previousAuthorDate;
                if (previousCommitterDate === undefined) delete process.env.GIT_COMMITTER_DATE; else process.env.GIT_COMMITTER_DATE = previousCommitterDate;

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
    let count = 0;

    function next() {
        if (count < numContributions) {
            // Add a small offset so each contribution has a unique timestamp
            const formattedDate = moment(date).add(count, 'seconds').format('YYYY-MM-DDTHH:mm:ssZ');
            makeContribution(formattedDate, count + 1, (err) => {
                if (!err) {
                    count++;
                    next(); // Move to the next contribution
                } else {
                    // If an error occurs, surface it and stop further attempts
                    callback(err);
                }
            });
        } else {
            console.log(`All contributions completed for date ${moment(date).format('YYYY-MM-DD')}!`);
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
