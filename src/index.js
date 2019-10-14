
const path = require("path");
const Chart = require('chart.js')
const app = express();
const dataman = require('./file-manipulation/data-man')
const public_path = path.join(__dirname, "../public");
const fs = require('fs')

//Write a function that plots data that it is given

//Write a function that reads data from specified file path

//Get input from user (what file to read)

//Write a function that reads all files in a folder and makes note of their existence in a persisting file
//  file should store the folders that have been added, and a list of files

//On load, load this list of files if any exist
//  Then parse the file name dates to determine which months / weeks / days should be available



app.get('/graph/data1', async (req, res) => {
    let fileDate = '2019-06-06'
    let byHourOrMinute = 'minutes'
    if (req.query.date) {
        fileDate = req.query.date
        if (fileDate === "today") {
            const now = new Date()
            let dd = String(now.getDate()).padStart(2, '0');
            let mm = String(now.getMonth() + 1).padStart(2, '0');
            let yyyy = now.getFullYear();
            fileDate = yyyy + '-' + mm + '-' + dd
        }
    } 
    
    if (req.query.unit) {
        byHourOrMinute = req.query.unit
    }
    let filepath = path.join('F:\\Timetracker', `${fileDate}-activity-log.csv`)
    const data = await dataman.readFile(filepath)
    let sums = []
    let yLabel = ''
    if (req.query.type === 'window') {
        sums = await dataman.sumTimesByWindow(data, byHourOrMinute)
        yLabel = byHourOrMinute
    } else {
        sums = await dataman.sumTimesByProcess(data, byHourOrMinute)
        yLabel = byHourOrMinute
    }

    let labels = Object.keys(sums)
    let values = Object.values(sums)

    if (req.query.filter) {
        let filterAmount = req.query.filter
        let removedCounter = 0
        try {
            filterAmount = parseFloat(filterAmount)
            values = values.filter((value, idx) => {
                if (value < filterAmount) {
                    labels.splice(idx - removedCounter, 1)
                    removedCounter++
                    return false
                }
                return true
            })
        } catch (e) {
            console.log('Error parsing filter amount')
        }
    }
    
    if (req.query.sortme === 'y') {
        let list = [];
        for (var i = 0; i < values.length; i++) {
            list.push({'label': labels[i], 'value': values[i]})
        }
        list.sort((a,b) => {
            return a.value > b.value ? -1: 1
        })
        for (var j = 0; j < list.length; j++) {
            labels[j] = list[j].label
            values[j] = list[j].value
        }
    }
    
    let sumMin = 0
    values.forEach((value) => {
        sumMin += value
    })
    if (byHourOrMinute !== 'hours') {
        sumMin = sumMin / 60
    }
    
    let bgColors = []
    let bdColors = []
    for (i = 0; i < labels.length; i++) {
        let r = parseInt(Math.random()*255)
        let g = parseInt(Math.random()*255)
        let b = parseInt(Math.random()*255)
        bgColors.push(`rgba(${r},${g},${b},0.3)`)
        bdColors.push(`rgba(${r},${g},${b},1)`)
    }
    fs.readFile(path.join(__dirname,'../public/template.html'), 'utf-8', (err, data) => {
        var result = data.replace('{{ labelData }}', JSON.stringify(labels))
            .replace('{{ chartData }}', JSON.stringify(values))
            .replace('{{ bgColor }}', JSON.stringify(bgColors))
            .replace('{{ bdColor }}', JSON.stringify(bdColors))
            .replace('{{ total }}', sumMin)
            .replace('{{ yLabel }}', yLabel)
        res.send(result)
    })
    
    //res.send({labels, values})
    
})

