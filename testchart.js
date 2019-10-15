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
  return { labels, values, bgColors, bdColors, yLabel };
}

async function drawChart(dataSet) {
  let ctx = document.getElementById("main-chart").getContext("2d");
  let chart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: dataSet.labels,
      datasets: [
        {
          label: "asdf",
          data: dataSet.values,
          backgroundColor: dataSet.bgColors,
          borderColor: dataSet.bdColors,
          borderWidth: 1
        }
      ]
    },
    options: {
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
  });
  return chart
}

async function updateChart(chart, dataSet) {
  chart.data = {
    labels: dataSet.labels,
    datasets: [
      {
        label: "asdf",
        data: dataSet.values,
        backgroundColor: dataSet.bgColors,
        borderColor: dataSet.bdColors,
        borderWidth: 1
      }
    ]
  }
  chart.options = {
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

const redrawMainChart = async (chart, filterMinInput, fileDateInput) => {
  const fileName = path.join("F:\\Timetracker\\logs", `${fileDateInput.value}-activity-log.csv`);
  const dataSet = await getDataSet(fileName, {
      unit: 'minutes',
      type: 'window',
      sort: 'descend',
      min: parseInt(filterMinInput.value)
  });
  await updateChart(chart, dataSet)
}

const start = async () => {
  console.log("Starting!");
  const fileName = path.join("F:\\Timetracker\\logs", `2019-04-06-activity-log.csv`);
  const dataSet = await getDataSet(fileName, {
      unit: 'minutes',
      type: 'window',
      sort: 'descend',
      min: 1
  });
  const chart = await drawChart(dataSet);
  return chart
};


(async() => {
let mainChart = await start();
console.log(mainChart)
const filterMinInput = document.getElementById("input-min")
const fileDateInput = document.getElementById("input-date")
filterMinInput.addEventListener("change", () => redrawMainChart(mainChart, filterMinInput, fileDateInput))
fileDateInput.addEventListener("change", () => redrawMainChart(mainChart, filterMinInput, fileDateInput))

})()

