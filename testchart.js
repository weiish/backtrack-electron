const Chart = require("chart.js");
const path = require("path");
const dataman = require("./src/data-man");
var chart = null;

async function getDataSet(filePath, settings) {
  //Valid Settings are (defaults marked by *)
  //  type = window* | process
  //  unit = hours* | minutes
  //  min = none* | ?
  //  max = none* | ?
  //  sort = none* | ascend | descend | schedule

  const data = await dataman.readFile(filePath);
  let sums = [];
  let yLabel = "";

  // UNITS Setting
  let byHourOrMinute = "hours";
  if ("unit" in settings) {
    byHourOrMinute = settings["unit"];
  }

  //TYPE Setting
  if ("type" in settings) {
    if (settings["type"] === "window") {
      sums = await dataman.sumTimesByWindow(data, byHourOrMinute);
      yLabel = byHourOrMinute;
    } else {
      sums = await dataman.sumTimesByProcess(data, byHourOrMinute);
      yLabel = byHourOrMinute;
    }
  }

  let labels = Object.keys(sums);
  labels = labels.map(label => formatLabel(label, 35))
  let values = Object.values(sums);
  let min = -Infinity;
  let max = Infinity;

  // MIN / MAX filtering
  if ("min" in settings) min = settings["min"];
  if ("max" in settings) max = settings["max"];

  if (min !== -Infinity || max !== Infinity) {
    let removedCounter = 0;
    values = values.filter((value, idx) => {
      if (value < min || value > max) {
        labels.splice(idx - removedCounter, 1);
        removedCounter++;
        return false;
      }
      return true;
    });
  }

  if ("sort" in settings) {
    let list = [];
    for (var i = 0; i < values.length; i++) {
      list.push({ label: labels[i], value: values[i] });
    }
    if (settings["sort"] === "ascend") {
      list.sort((a, b) => {
        return a.value < b.value ? -1 : 1;
      });
    } else if (settings["sort"] === "descend") {
      list.sort((a, b) => {
        return a.value > b.value ? -1 : 1;
      });
    }

    for (var j = 0; j < list.length; j++) {
      labels[j] = list[j].label;
      values[j] = list[j].value;
    }
  }

  let totalTime = 0;
  values.forEach(value => {
    totalTime += value;
  });
  if (byHourOrMinute !== "hours") {
    totalTime = totalTime / 60;
  }

  let bgColors = [];
  let bdColors = [];
  for (i = 0; i < labels.length; i++) {
    let r = parseInt(Math.random() * 255);
    let g = parseInt(Math.random() * 255);
    let b = parseInt(Math.random() * 255);
    bgColors.push(`rgba(${r},${g},${b},0.3)`)
        bdColors.push(`rgba(${r},${g},${b},1)`)
  }
  return { labels, values, bgColors, bdColors, yLabel, filePath };
}

async function drawChart(dataSet) {
  let ctx = document.getElementById("main-chart").getContext("2d");
  let chart = new Chart(ctx, {
    type: "horizontalBar",
    data: {
      labels: dataSet.labels,
      datasets: [
        {
          label: dataSet.filePath,
          data: dataSet.values,
          backgroundColor: dataSet.bgColors,
          borderColor: dataSet.bdColors,
          borderWidth: 1
        }
      ]
    },
    options: {
      aspectRatio: 1.4,
      scaleShowValues: true,
      scales: {
        yAxes: [
          {
            scaleLabel: {
              display: true,
              labelString: dataSet.yLabel
            },
            ticks: {
              beginAtZero: true
            }
          }
        ],
        xAxes: [
          {
            position: 'top',
            scaleLabel: {
              display: true,
              labelString: "Minutes"
            },
            ticks: {
              autoSkip: false
            }
          }
        ]
      }
    }
  });
  return chart
}

async function updateChart(chart, dataSet) {
  chart.data = {
    labels: dataSet.labels,
    datasets: [
      {
        label: dataSet.filePath,
        data: dataSet.values,
        backgroundColor: dataSet.bgColors,
        borderColor: dataSet.bdColors,
        borderWidth: 1
      }
    ]
  }
  chart.options = {
    aspectRatio: 1.4,
    scaleShowValues: true,
    scales: {
      yAxes: [
        {
          scaleLabel: {
            display: true,
            labelString: dataSet.yLabel
          },
          ticks: {
            beginAtZero: true
          }
        }
      ],
      xAxes: [
        {
          position: 'top',
          scaleLabel: {
            display: true,
            labelString: "Process Name"
          },
          ticks: {
            autoSkip: false
          }
        }
      ]
    }
  }
  chart.update();

}

function calculateAspectRatio(canvasWidth, numElements) {

}

function formatLabel(str, maxwidth){
  var sections = [];
  var words = str.split(" ");
  var temp = "";

  words.forEach(function(item, index){
      if(temp.length > 0)
      {
          var concat = temp + ' ' + item;

          if(concat.length > maxwidth){
              sections.push(temp);
              temp = "";
          }
          else{
              if(index == (words.length-1))
              {
                  sections.push(concat);
                  return;
              }
              else{
                  temp = concat;
                  return;
              }
          }
      }

      if(index == (words.length-1))
      {
          sections.push(item);
          return;
      }

      if(item.length < maxwidth) {
          temp = item;
      }
      else {
          sections.push(item);
      }

  });

  return sections;
}

const redrawMainChart = async (chart, settings) => {
  const fileName = path.join("F:\\Timetracker\\logs", `${settings.date}-activity-log.csv`);
  const dataSet = await getDataSet(fileName, {
      unit: settings.units,
      type: settings.type,
      sort: 'descend',
      min: settings.min,
      max: settings.max
  });
  await updateChart(chart, dataSet)
}

const start = async () => {
  console.log("Starting!");
  const fileName = path.join("F:\\Timetracker\\logs", `2019-10-15-activity-log.csv`);
  const dataSet = await getDataSet(fileName, {
      unit: 'minutes',
      type: 'window',
      sort: 'descend',
      min: 0,
      max: Infinity
  });
  const chart = await drawChart(dataSet);
  return chart
};

(async() => {
let mainChart = await start();
console.log(mainChart)
let settings = {
  date: "2019-10-15",
  min: 0,
  type: "window",
  unit: "hours"
}
const filterMinInput = document.getElementById("input-min")
const filterMaxInput = document.getElementById("input-max")
const fileDateInput = document.getElementById("input-date")
const radioTypeWindow = document.getElementById("input-window")
const radioTypeProcess = document.getElementById("input-process")
const radioUnitsHours = document.getElementById("input-hours")
const radioUnitsMinutes = document.getElementById("input-minutes")
filterMinInput.addEventListener("change", () => {
  settings.min = parseInt(filterMinInput.value) 
  redrawMainChart(mainChart, settings)
})
filterMaxInput.addEventListener("change", () => {
  settings.max = parseInt(filterMaxInput.value) 
  redrawMainChart(mainChart, settings)
})
fileDateInput.addEventListener("change", () => {
  settings.date = fileDateInput.value
  redrawMainChart(mainChart, settings)
})
radioTypeWindow.addEventListener("change", () => {
  settings.type="window" 
  redrawMainChart(mainChart, settings)
})
radioTypeProcess.addEventListener("change", () => {
  settings.type="process" 
  redrawMainChart(mainChart, settings)
})
radioUnitsHours.addEventListener("change", () => {
  settings.units="hours" 
  redrawMainChart(mainChart, settings)
})
radioUnitsMinutes.addEventListener("change", () => {
  settings.units="minutes"
  redrawMainChart(mainChart, settings)
})
})()

