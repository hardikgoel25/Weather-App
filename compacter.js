// Sample Data
const hourlyData = Array(24).fill({ time: "12:00", temp: 50 });
const dailyData = [
  { day: "Today", high: 50, low: 45 },
  { day: "Tomorrow", high: 52, low: 46 },
  { day: "Day 3", high: 53, low: 47 },
  { day: "Day 4", high: 53, low: 47 },
  { day: "Day 5", high: 53, low: 47 },
  { day: "Day 6", high: 53, low: 47 },
  { day: "Day 7", high: 53, low: 47 },
];

const hourlyForecast = document.getElementById("hourlyForecast");
hourlyData.forEach(({ time, temp }) => {
  hourlyForecast.innerHTML += `
    <div class="col-2 d-flex flex-column text-center">
      <span class="time">${time}</span>
      <span class="hourTemp">${temp}&deg;</span>
    </div>
  `;
});

const dailyForecast = document.getElementById("dailyForecast");
dailyData.forEach(({ day, high, low }) => {
  dailyForecast.innerHTML += `
    <div class="col d-flex justify-content-between text-center align-items-center my-2">
                            <span id="day">-</span>
                            <div class="d-flex align-items-center justify-content-between info">
                                <span id="l1">45</span>
                                <div class="bar d-inline-block" id="bar"></div>
                                <span id="h1">50</span>
                            </div>
                        </div>
  `;
});
