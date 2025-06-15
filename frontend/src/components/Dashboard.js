import React, { useEffect, useState, useRef } from "react";
import {
  Chart as ChartJS, ArcElement, Tooltip, Legend,
  CategoryScale, LinearScale, BarElement, Title
} from "chart.js";
import { Doughnut, Bar } from "react-chartjs-2";
import "./Dashboard.css";

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const periods = [
  { start: "08:00", end: "08:50" },
  { start: "08:50", end: "09:40" },
  { start: "09:50", end: "10:40" },
  { start: "10:40", end: "11:30" },
  { start: "12:20", end: "13:10" },
  { start: "13:10", end: "14:00" },
  { start: "14:00", end: "14:50" },
  { start: "14:50", end: "15:40" },
];

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

const getCurrentPeriod = (date) => {
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const totalMins = hours * 60 + minutes;

  for (let i = 0; i < periods.length; i++) {
    const [sh, sm] = periods[i].start.split(":").map(Number);
    const [eh, em] = periods[i].end.split(":").map(Number);
    const startMins = sh * 60 + sm;
    const endMins = eh * 60 + em;
    if (totalMins >= startMins && totalMins < endMins) {
      return i;
    }
  }
  return -1;
};

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(null);

  const prevPeriodRef = useRef(null);
  const autoTimeoutRef = useRef(null);

  const fetchStats = async (period = null, day = null) => {
    const url = `/api/dashboard-stats?${period !== null ? `period=${period}` : ""}${day !== null ? `&day=${day}` : ""}`;
    const res = await fetch(url);
    const data = await res.json();
    setStats(data);

    if (period === null && data.currentPeriod !== -1) {
      prevPeriodRef.current = data.currentPeriod; // Update ref only in auto mode
    }
  };

  // Initial fetch + real-time clock
  useEffect(() => {
    fetchStats(); // Initial auto fetch

    const timeUpdater = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timeUpdater);
  }, []);

  // Period-based auto-fetch logic
  useEffect(() => {
  let isMounted = true;

  const autoFetch = async () => {
    const now = new Date();
    const currentPeriod = getCurrentPeriod(now);

    if (currentPeriod === -1 && prevPeriodRef.current === -1) {
      console.log("⛔ Still outside class hours, skipping fetch.");
    } else if (currentPeriod !== prevPeriodRef.current) {
      console.log(`🔁 Period change detected (was ${prevPeriodRef.current}, now ${currentPeriod}). Fetching...`);
      await fetchStats();
      prevPeriodRef.current = currentPeriod;
    } else {
      console.log("✅ Period unchanged. No fetch needed.");
    }

    if (isMounted) {
      autoTimeoutRef.current = setTimeout(autoFetch, 3595000); // every 59m55s
    }
  };

  if (selectedPeriod === null && selectedDay === null) {
    // Only if both day and period are auto
    autoFetch();
  }

  return () => {
    isMounted = false;
    if (autoTimeoutRef.current) clearTimeout(autoTimeoutRef.current);
  };
}, [selectedPeriod, selectedDay]); // Runs only when manual controls change

  // Manual period fetch
  useEffect(() => {
    if (selectedPeriod !== null) {
      fetchStats(selectedPeriod);
    } else {
      fetchStats();
    }
  }, [selectedPeriod]);

  // Fetch stats when day or period is explicitly changed
  useEffect(() => {
    if (selectedPeriod !== null || selectedDay !== null) {
      fetchStats(selectedPeriod, selectedDay);
    }
  }, [selectedDay, selectedPeriod]);

  if (!stats) return <div>Loading...</div>;

  const donutOptions = {
    cutout: "65%",
    plugins: {
      legend: { position: "bottom", labels: { boxWidth: 12, padding: 10 } },
      tooltip: { enabled: true },
    },
  };

  const getDonutData = (labels, values, colors) => ({
    labels,
    datasets: [{
      data: values,
      backgroundColor: colors,
      borderWidth: 0,
    }],
  });

  const barData = {
    labels: Object.keys(stats.barChart),
    datasets: [{
      label: "Free Rooms",
      data: Object.values(stats.barChart),
      backgroundColor: ["#2196F3", "#8BC34A", "#FF9800", "#03A9F4", "#E91E63", "#FFC107"],
      barThickness: 30,
    }],
  };

  return (
    <div className="dashboard-container">
      <h2 className="dashboard-heading">Classroom Dashboard</h2>

      <div className="time-row">
        <span><strong>Time:</strong> {currentTime.toLocaleTimeString()}</span>
        <span className="separator">|</span>
        <span><strong>Period:</strong> {stats.periodLabel}</span>
        <span className="separator">|</span>

        <span>
          <strong>Manual Day:</strong>{" "}
          <select
            value={selectedDay ?? ""}
            onChange={(e) => setSelectedDay(e.target.value === "" ? null : e.target.value)}
          >
            <option value="">Auto</option>
            {days.map((day) => (
              <option key={day} value={day}>{day}</option>
            ))}
          </select>
        </span>

        <span className="separator">|</span>

        <span>
          <strong>Manual Period:</strong>{" "}
          <select
            value={selectedPeriod ?? ""}
            onChange={(e) =>
              setSelectedPeriod(e.target.value === "" ? null : parseInt(e.target.value))
            }
          >
            <option value="">Auto</option>
            {periods.map((_, i) => (
              <option key={i} value={i}>Period {i + 1}</option>
            ))}
          </select>
        </span>
      </div>

      <div className="dashboard-grid">
        <div className="card small-chart">
          <h4>Free vs Occupied</h4>
          <Doughnut
            data={getDonutData(["Occupied", "Free"], [stats.pieChart.occupied, stats.pieChart.free], ["#f44336", "#4CAF50"])}
            options={donutOptions}
          />
        </div>

        <div className="card small-chart">
          <h4>Projector Rooms</h4>
          <Doughnut
            data={getDonutData(["Free", "Occupied"],[stats.freeProjectorRoomNames.length,stats.resources.projectorRooms - stats.freeProjectorRoomNames.length],["#FF9800", "#e0e0e0"])}
            options={donutOptions}
          />
        </div>

        <div className="card small-chart">
          <h4>Free Labs</h4>
          <Doughnut
            data={getDonutData(["Free", "Occupied"], [stats.resources.labs, stats.resources.totalRooms - stats.resources.labs], ["#9C27B0", "#e0e0e0"])}
            options={donutOptions}
          />
        </div>

        <div className="card small-chart">
          <h4>Free Classrooms</h4>
          <Doughnut
            data={getDonutData(["Classrooms", "Others"], [stats.resources.classrooms, stats.resources.totalRooms - stats.resources.classrooms], ["#3F51B5", "#e0e0e0"])}
            options={donutOptions}
          />
        </div>

        <div className="card small-chart">
          <h4>Not Occupied</h4>
          <Doughnut
            data={getDonutData(["Not Occupied", "Occupied"], [stats.resources.totalRooms - stats.pieChart.occupied, stats.pieChart.occupied], ["#009688", "#f44336"])}
            options={donutOptions}
          />
        </div>

        <div className="card full-width">
          <h4 style={{ marginLeft: '10px' }}>Free Rooms Per Weekday</h4>
          <div className="bar-info-container">
            <div className="bar-chart">
              <Bar
                data={barData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { display: false } },
                  scales: { y: { beginAtZero: true } },
                }}
              />
            </div>
            <div className="info-panel">
              <p><strong>Total rooms:</strong> {stats.resources.totalRooms}</p>
              <p><strong>Total Free labs:</strong> {stats.resources.labs}</p>
              <p><strong>Total Occupied rooms:</strong> {stats.pieChart.free}</p>
              <p><strong>Total projector free:</strong> {stats.resources.projectorRooms}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
