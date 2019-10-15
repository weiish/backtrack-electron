const csv = require("csvtojson");
const fs = require("fs");
const path = require("path");
const moment = require("moment")
//const filepath = path.join(__dirname, "../../files/2019-04-16-activity-log.csv");
//const filepath = path.join(__dirname, "../../files/test.csv");

const sumTimesByProcess = async (data, unit) => {
    let result = {}
    data.forEach((row) => {
        if (!result[row['Process Name']]) {
            result[row['Process Name'] ] = 0
        }
        if (unit === 'hours') {
            result[row['Process Name']] += moment.duration(row['Duration']).asHours()
        } else {
            result[row['Process Name']] += moment.duration(row['Duration']).asMinutes()
        }
        
    })
    return result
}

const sumTimesByWindow = async (data, unit) => {
    let result = {}
    data.forEach((row) => {
        if (!result[row['Window Name']]) {
            result[row['Window Name'] ] = 0
        }
        if (unit === 'hours') {
            result[row['Window Name']] += moment.duration(row['Duration']).asHours()
        } else {
            result[row['Window Name']] += moment.duration(row['Duration']).asMinutes()
        }
        
    
    })
    return result
}

//Not sure if needed
const getUniqueWindows = async (data) => {
    let windows = new Set();
    data.forEach((row) => {
        windows.add(row['Window Name']);
    })
    return windows
}

//Not sure if needed
const getUniqueProcesses = async (data) => {
    let processes = new Set();
    data.forEach((row) => {
        processes.add(row['Process Name']);
    })
    return processes
}

const readFile = async (filepath) => {
    var results = []
    try {
        const results = await(csv().fromFile(filepath));
        return results
      } catch (error) {
          console.log(error)
      }
}

module.exports = {sumTimesByProcess, sumTimesByWindow, getUniqueWindows, getUniqueProcesses, readFile}



