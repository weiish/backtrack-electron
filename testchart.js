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
  labels = labels.map(label => formatLabel(label, 50));
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

  //SORTING
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
    bgColors.push(`rgba(${r},${g},${b},0.3)`);
    bdColors.push(`rgba(${r},${g},${b},1)`);
  }
  return { labels, values, bgColors, bdColors, yLabel, filePath };
}

async function drawChart(dataSet) {
  let canvas = document.getElementById("main-chart");
  let ctx = canvas.getContext("2d");
  console.log(canvas.width, dataSet.labels.length);
  console.log(
    `New aspect ratio is ${calculateAspectRatio(
      canvas.width,
      dataSet.labels.length
    )}`
  );
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
      maintainAspectRatio: false,
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
            position: "top",
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
  return chart;
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
  };
  chart.options = {
    maintainAspectRatio: false,
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
  };
  chart.update();
  console.log("Chart after updating options");
  console.log(chart);
}

function calculateAspectRatio(canvasWidth, numElements) {
  const rowHeight = 10;
  //We want each element to take up 25 px
  //So total height should be = numElements * rowHeight
  //Then the aspect ratio should be canvasWidth / totalHeight
  return canvasWidth / (rowHeight * numElements);
}

function formatLabel(str, maxWidth) {
  var sections = [];
  var words = str.split(" ");
  var section = "";
  for (let i = 0; i < words.length; i++) {
    let word = words[i];
    if (word.length > maxWidth) {
      word = word.substring(0, maxWidth - 3) + "...";
    }
    if (section.length + word.length > maxWidth) {
      sections.push(section);
      section = word;
    } else if (i === words.length - 1) {
      sections.push(section + " " + word);
    } else {
      section = section + " " + word;
    }
    if (sections.length === 3) {
      return sections;
    }
  }
  return sections;
}

const redrawMainChart = async (chart, settings, mainChartDiv) => {
  const chartRowHeight = 50;
  const fileName = path.join(
    "F:\\Timetracker\\logs",
    `${settings.date}-activity-log.csv`
  );
  const dataSet = await getDataSet(fileName, {
    unit: settings.units,
    type: settings.type,
    sort: "descend",
    min: settings.min,
    max: settings.max
  });
  await updateChart(chart, dataSet);
  mainChartDiv.style.minHeight = `${dataSet.labels.length * chartRowHeight +
    100}px`;
  mainChartDiv.style.maxHeight = `${dataSet.labels.length * chartRowHeight +
    100}px`;
  console.log("new chart");
  console.log(chart);
};

const start = async () => {
  console.log("Starting!");
  const fileName = path.join(
    "F:\\Timetracker\\logs",
    `${formatDate(Date.now())}-activity-log.csv`
  );
  const dataSet = await getDataSet(fileName, {
    unit: "minutes",
    type: "window",
    sort: "descend",
    min: 0,
    max: Infinity
  });
  const chart = await drawChart(dataSet);
  return chart;
};

function formatDate(date) {
  var d = new Date(date),
    month = "" + (d.getMonth() + 1),
    day = "" + d.getDate(),
    year = d.getFullYear();

  if (month.length < 2) month = "0" + month;
  if (day.length < 2) day = "0" + day;

  return [year, month, day].join("-");
}

function beforePrintHandler() {
  for (var id in Chart.instances) {
    Chart.instances[id].resize();
  }
}

(async () => {
  let mainChart = await start();
  console.log(mainChart);
  let settings = {
    date: formatDate(Date.now()),
    min: 0,
    type: "window",
    unit: "hours"
  };
  window.addEventListener("beforeprint", beforePrintHandler);
  const mainChartDiv = document.getElementById("main-chart-container");
  redrawMainChart(mainChart, settings, mainChartDiv);

  const filterMinInput = document.getElementById("input-min");
  const filterMaxInput = document.getElementById("input-max");
  const fileDateInput = document.getElementById("input-date");
  const radioTypeWindow = document.getElementById("input-window");
  const radioTypeProcess = document.getElementById("input-process");
  const radioUnitsHours = document.getElementById("input-hours");
  const radioUnitsMinutes = document.getElementById("input-minutes");
  filterMinInput.addEventListener("change", () => {
    settings.min = parseFloat(filterMinInput.value);
    redrawMainChart(mainChart, settings, mainChartDiv);
  });
  filterMaxInput.addEventListener("change", () => {
    settings.max = parseFloat(filterMaxInput.value);
    redrawMainChart(mainChart, settings, mainChartDiv);
  });
  fileDateInput.addEventListener("change", () => {
    settings.date = fileDateInput.value;
    redrawMainChart(mainChart, settings, mainChartDiv);
  });
  radioTypeWindow.addEventListener("change", () => {
    settings.type = "window";
    redrawMainChart(mainChart, settings, mainChartDiv);
  });
  radioTypeProcess.addEventListener("change", () => {
    settings.type = "process";
    redrawMainChart(mainChart, settings, mainChartDiv);
  });
  radioUnitsHours.addEventListener("change", () => {
    settings.units = "hours";
    redrawMainChart(mainChart, settings, mainChartDiv);
  });
  radioUnitsMinutes.addEventListener("change", () => {
    settings.units = "minutes";
    redrawMainChart(mainChart, settings, mainChartDiv);
  });
})();
