let currentTask = 1;
let totalTasks = 0;
let taskNames = [];
let taskValues = [];
let chart;

let currentTotal = 0;
let maxTotal = 0;
let taskTimeRanges = [];

function startTasks() {
  if (sessionStorage.getItem("DataFilled") === "true") {
    Swal.fire({
      title: "Restart?",
      text: "All your current data will be lost.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#8a61b1",
      customClass: {
        popup: "my-swal",
      },
      cancelButtonColor: "#657ea2",
      confirmButtonText: "Yes, restart",
    }).then((result) => {
      if (result.isConfirmed) {
        sessionStorage.removeItem("DataFilled");
        location.reload();
      }
    });

    return;
  }

  totalTasks = 24;

  let totalHours = parseInt(document.getElementById("totalHours").value) || 0;
  maxTotal = totalHours * 60;

  currentTask = 1;
  currentTotal = 0;
  taskNames = [];
  taskValues = [];

  showNextTask();
}

function showNextTask() {
  const taskSection = document.getElementById("taskSection");
  sessionStorage.setItem("DataFilled", "true");
  if (currentTask <= totalTasks) {
    taskSection.innerHTML = `
      <div class="task-card">
        <h3>Task ${currentTask}</h3>

        <input type="text" id="taskName" placeholder="Enter task name" />

        <div class="time-picker">
          <div class="time-box">
            <label>Start Time</label>
            <input type="time" id="startTime" />
          </div>

          <div class="time-box">
            <label>End Time</label>
            <input type="time" id="endTime" />
          </div>
        </div>

        <p style="margin-top:10px; color:#94a3b8;">
          Remaining: ${Math.floor((maxTotal - currentTotal) / 60)}h ${(maxTotal - currentTotal) % 60}m
        </p>

        <button onclick="saveTask()">Save Task</button>
      </div>
    `;
  } else {
    taskSection.innerHTML = `<p class="done">All tasks added ✅</p>`;
  }
}

function saveTask() {
  let name = document.getElementById("taskName").value || "Task " + currentTask;

  let start = document.getElementById("startTime").value;
  let end = document.getElementById("endTime").value;

  if (!start || !end) {
    Swal.fire({
      icon: "info",
      title: "Incomplete Selection",
      html: `
    You need to select <b>both start and end time</b> before continuing.
  `,
      customClass: {
        popup: "my-swal",
      },
    });
    return;
  }

  let [sh, sm] = start.split(":").map(Number);
  let [eh, em] = end.split(":").map(Number);

  let startMin = sh * 60 + sm;
  let endMin = eh * 60 + em;

  //26April2026 Shubham Changed logic for cross midnight time comparision

  // if (endMin <= startMin) {
  //   Swal.fire({
  //     icon: "warning",
  //     title: "End time",
  //     html: `End time must be greater than start time`,
  //     customClass: {
  //       popup: "my-swal",
  //     },
  //   });
  //   return;
  // }
  // Case: End time is smaller (possible next-day)
  if (endMin <= startMin) {
    if (startMin >= 12 * 60) {
      endMin += 1440;
    } else {
      Swal.fire({
        icon: "warning",
        title: "Invalid Time",
        html: `End time cannot be earlier than start time`,
        customClass: {
          popup: "my-swal",
        },
      });
      return;
    }
  }
  let value = endMin - startMin;

  if (currentTotal + value > maxTotal) {
    Swal.fire({
      icon: "warning",
      title: "Time",
      html: `Time exceeded! Reduce task time.`,
      customClass: {
        popup: "my-swal",
      },
    });
    return;
  }

  for (let i = 0; i < taskTimeRanges.length; i++) {
    let [existingStart, existingEnd] = taskTimeRanges[i];
    if (startMin < existingEnd && endMin > existingStart) {
      Swal.fire({
        icon: "warning",
        title: "Time Repeat",
        html: `Time overlaps with another task!`,
        customClass: {
          popup: "my-swal",
        },
      });
      return;
    }
  }
  taskTimeRanges.push([startMin, endMin]);
  taskNames.push(name);
  taskValues.push(value);
  currentTotal += value;

  currentTask++;
  showNextTask();
}

function generateChart() {
  let dwnBtn = document.getElementById("DownloadBtn");
  dwnBtn.style.display = "block";
  if (currentTotal !== maxTotal) {
    Swal.fire({
      icon: "warning",
      title: "Total Time",
      html: `Total time must match exactly!`,
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
          labels: {
            color: "#ffffff",
          },
        },

        // ✅ Add this block
        datalabels: {
          color: "#fff",
          formatter: (value, context) => {
            let total = context.dataset.data.reduce((a, b) => a + b, 0);
            let percent = ((value / total) * 100).toFixed(1);
            return percent + "%";
          },
        },

        tooltip: {
          backgroundColor: "#020617",
          titleColor: "#ffffff",
          bodyColor: "#ffffff",
          borderColor: "#38bdf8",
          borderWidth: 1,
          callbacks: {
            label: function (context) {
              let value = context.raw;
              let total = context.dataset.data.reduce((a, b) => a + b, 0);
              let percent = ((value / total) * 100).toFixed(1);

              let h = Math.floor(value / 60);
              let m = value % 60;

              return `${context.label}: ${h}h ${m}m (${percent}%)`;
            },
          },
        },
      },
    },

    // ✅ Important
    plugins: [ChartDataLabels],
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
function goAmount() {
  window.location.href = "Amount.html";
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
            size: 16,
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
