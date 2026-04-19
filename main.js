let currentTask = 1;
let totalTasks = 0;
let taskNames = [];
let taskValues = [];
let chart;
let currentTotal = 0;
let maxTotal = 0;

function startTasks() {
  totalTasks = parseInt(document.getElementById("totalTasks").value);

  maxTotal = totalTasks;
  currentTask = 1;
  taskNames = [];
  taskValues = [];
  currentTotal = 0;

  showInput();
}

function showInput() {
  const section = document.getElementById("taskSection");

  let remaining = maxTotal - currentTotal;

  if (remaining === 0) {
    section.innerHTML = `
      <h3 style="color:#22c55e; text-align:center;">
        ✅ All data filled successfully!
      </h3>
    `;
    return;
  }
  if (currentTask <= totalTasks) {
    section.innerHTML = `
      <h3>Task ${currentTask} (Remaining: ${remaining})</h3>
      <input type="text" id="taskName" placeholder="Enter task name">
      <br>
      <input type="number" id="taskValue" placeholder="Enter value">
      <br>
      <button onclick="saveTask()">Next</button>
    `;
  } else {
    section.innerHTML = `
      <h3 style="color:#22c55e; text-align:center;">
        ✅ All tasks added!
      </h3>
    `;
  }
}

function saveTask() {
  let name = document.getElementById("taskName").value || "Task " + currentTask;
  let value = parseFloat(document.getElementById("taskValue").value) || 0;

  if (currentTotal + value > maxTotal) {
    Swal.fire({
      icon: "warning",
      title: "Limit Exceeded",
      text:
        "Total cannot exceed " +
        maxTotal +
        "! Remaining: " +
        (maxTotal - currentTotal),
      customClass: {
        popup: "my-swal",
      },
    });
    return;
  }

  taskNames.push(name);
  taskValues.push(value);
  currentTotal += value;

  currentTask++;
  let remaining = maxTotal - currentTotal;
  showInput();
}

function generateChart() {
  let dwnBtn = document.getElementById("DownloadBtn");
  dwnBtn.style.display = "block";
  if (currentTotal !== maxTotal) {
    Swal.fire({
      icon: "error",
      title: "Invalid Total",
      html: `
    Total must be exactly <b>${maxTotal}</b><br>
    Current total: <b>${currentTotal}</b>
  `,
      customClass: {
        popup: "my-swal",
      },
    });
    return;
  }

  if (chart) chart.destroy();

  const ctx = document.getElementById("pieChart").getContext("2d");

  chart = new Chart(ctx, {
    type: "pie",
    data: {
      labels: taskNames,
      datasets: [
        {
          data: taskValues,
          backgroundColor: generateColors(taskValues.length),
        },
      ],
    },
    options: {
      plugins: {
        legend: {
          position: "top",
          labels: {
            color: "#ffffff",
            font: {
              size: 16,
              weight: "bold",
            },
          },
        },
      },
    },
  });
}
function generateColors(count) {
  let colors = [];
  for (let i = 0; i < count; i++) {
    let hue = Math.floor((360 / count) * i);
    colors.push(`hsl(${hue}, 70%, 60%)`);
  }
  return colors;
}
Chart.register({
  id: "showPercent",
  afterDraw(chart) {
    const { ctx } = chart;
    const dataset = chart.data.datasets[0];
    const total = dataset.data.reduce((a, b) => a + b, 0);

    chart.getDatasetMeta(0).data.forEach((datapoint, index) => {
      const value = dataset.data[index];
      const percentage = ((value / total) * 100).toFixed(1) + "%";

      const { x, y } = datapoint.tooltipPosition();

      ctx.fillStyle = "#fff";
      ctx.font = "bold 14px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      ctx.fillText(percentage, x, y);
    });
  },
});
function goTime() {
  window.location.href = "Time.html";
}
function downloadChart() {
  if (!chart) {
    Swal.fire({
      icon: "warning",
      title: "No Chart",
      text: "Please generate the chart first!",
      customClass: { popup: "my-swal" },
    });
    return;
  }

  const tempCanvas = document.createElement("canvas");
  tempCanvas.width = 600;
  tempCanvas.height = 600;

  const ctx = tempCanvas.getContext("2d");

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);

  const tempChart = new Chart(ctx, {
    type: "pie",
    data: {
      labels: taskNames,
      datasets: [
        {
          data: taskValues,
          backgroundColor: taskValues.map(() => "#ffffff"),
          borderColor: "#000000",
          borderWidth: 2,
        },
      ],
    },
    options: {
      responsive: false,
      animation: {
        onComplete: function () {
          const link = document.createElement("a");
          link.download = "pie-chart.png";
          link.href = tempCanvas.toDataURL("image/png");
          link.click();

          tempChart.destroy();
        },
      },
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          enabled: false,
        },
        datalabels: {
          color: "#000000",
          font: {
            weight: "bold",
            size: 14,
          },
          formatter: function (value, context) {
            let total = context.dataset.data.reduce((a, b) => a + b, 0);
            let percent = ((value / total) * 100).toFixed(0);

            return (
              context.chart.data.labels[context.dataIndex] +
              "\n" +
              percent +
              "%"
            );
          },
          align: "center",
        },
      },
    },
    plugins: [ChartDataLabels],
  });
}
