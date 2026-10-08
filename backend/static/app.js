/**
 * FloodGuard Real-Time Dashboard Client Application
 * Connects to REST API, renders Chart.js telemetry, updates visual gauges,
 * and synthesizes hardware buzzer alerts via Web Audio API.
 */

// State variables
let telemetryChart = null;
let audioContext = null;
let buzzerEnabled = false;
let lastAlertLevel = "NORMAL";
let totalTankDepth = 40.0;
let warningPercent = 60.0;
let dangerPercent = 85.0;

// Initialize on page load
document.addEventListener("DOMContentLoaded", () => {
    initChart();
    fetchConfig();
    fetchAlerts();
    setupEventListeners();

    // Start live polling loop (every 1.5 seconds)
    setInterval(fetchLiveData, 1500);
});

// ============================================================================
// Chart Initialization & Rendering
// ============================================================================

function initChart() {
    const ctx = document.getElementById("telemetryChart").getContext("2d");

    telemetryChart = new Chart(ctx, {
        type: "line",
        data: {
            labels: [],
            datasets: [
                {
                    label: "Water Level (cm)",
                    data: [],
                    borderColor: "#38bdf8",
                    backgroundColor: "rgba(56, 189, 248, 0.15)",
                    borderWidth: 2.5,
                    fill: true,
                    tension: 0.25,
                    pointRadius: 2,
                    pointHoverRadius: 5
                },
                {
                    label: "Warning Threshold",
                    data: [],
                    borderColor: "rgba(245, 158, 11, 0.7)",
                    borderWidth: 1.5,
                    borderDash: [5, 5],
                    fill: false,
                    pointRadius: 0
                },
                {
                    label: "Danger Threshold",
                    data: [],
                    borderColor: "rgba(239, 68, 68, 0.8)",
                    borderWidth: 1.5,
                    borderDash: [5, 5],
                    fill: false,
                    pointRadius: 0
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: false,
            scales: {
                x: {
                    grid: { color: "#334155" },
                    ticks: { color: "#94a3b8", maxTicksLimit: 8 }
                },
                y: {
                    grid: { color: "#334155" },
                    ticks: { color: "#94a3b8" },
                    min: 0,
                    max: 45,
                    title: {
                        display: true,
                        text: "Water Level (cm)",
                        color: "#94a3b8"
                    }
                }
            },
            plugins: {
                legend: {
                    labels: { color: "#cbd5e1", boxWidth: 14 }
                },
                tooltip: {
                    callbacks: {
                        label: (ctx) => `${ctx.dataset.label}: ${ctx.raw.toFixed(1)} cm`
                    }
                }
            }
        }
    });
}

function updateChart(history) {
    if (!telemetryChart || !history || history.length === 0) return;

    const labels = history.map(item => item.timestamp.split(" ")[1] || item.timestamp);
    const levels = history.map(item => item.water_level_cm);

    // Compute threshold level lines in cm
    const warnCm = (warningPercent / 100.0) * totalTankDepth;
    const dangerCm = (dangerPercent / 100.0) * totalTankDepth;
    const warnLine = new Array(levels.length).fill(warnCm);
    const dangerLine = new Array(levels.length).fill(dangerCm);

    telemetryChart.data.labels = labels;
    telemetryChart.data.datasets[0].data = levels;
    telemetryChart.data.datasets[1].data = warnLine;
    telemetryChart.data.datasets[2].data = dangerLine;

    // Dynamically adjust Y-axis maximum to tank depth + 10%
    telemetryChart.options.scales.y.max = Math.ceil(totalTankDepth * 1.1);

    telemetryChart.update("none");
}

// ============================================================================
// Data Fetching & UI Updates
// ============================================================================

async function fetchLiveData() {
    try {
        const response = await fetch("/api/data");
        if (!response.ok) throw new Error("Network response failed");
        
        const data = await response.json();
        const current = data.current;

        // 1. Connection status
        document.getElementById("connection-dot").className = "dot-online";
        document.getElementById("connection-status").textContent = current.device_id || "Connected";
        document.getElementById("last-updated").textContent = `Updated: ${current.timestamp.split(" ")[1] || "Just now"}`;

        // 2. Metrics update
        const levelCm = current.water_level_cm !== undefined ? current.water_level_cm.toFixed(1) : "--";
        const levelPct = current.water_level_percent !== undefined ? Math.round(current.water_level_percent) : "--";
        const slope = current.rate_of_rise !== undefined ? (current.rate_of_rise >= 0 ? `+${current.rate_of_rise.toFixed(1)}` : current.rate_of_rise.toFixed(1)) : "0.0";
        
        document.getElementById("water-level-cm").textContent = levelCm;
        document.getElementById("water-level-percent").textContent = `${levelPct}%`;
        document.getElementById("rain-status").textContent = current.rain_status || "No Rain";
        document.getElementById("rate-of-rise").textContent = slope;
        document.getElementById("sensor-distance").textContent = `${current.distance_cm ? current.distance_cm.toFixed(1) : "--"} cm`;

        // 3. Slope subtext interpretation
        const slopeElem = document.getElementById("slope-subtext");
        if (current.rate_of_rise > 3.0) {
            slopeElem.textContent = "Fast Rising Trend";
            slopeElem.style.color = "#f97316";
        } else if (current.rate_of_rise < -1.0) {
            slopeElem.textContent = "Receding Water";
            slopeElem.style.color = "#38bdf8";
        } else {
            slopeElem.textContent = "Stable Trend";
            slopeElem.style.color = "#94a3b8";
        }

        // 4. Alert Level Badge
        const alertBadge = document.getElementById("alert-badge");
        const alertSub = document.getElementById("alert-subtext");
        const alertLevel = current.alert_level || "NORMAL";

        alertBadge.className = `badge-status badge-${alertLevel.toLowerCase()}`;
        alertBadge.textContent = alertLevel;

        if (alertLevel === "DANGER") {
            alertSub.textContent = "CRITICAL: Flood Danger! Evacuate low-lying areas.";
            alertSub.style.color = "#ef4444";
        } else if (alertLevel === "WARNING") {
            alertSub.textContent = "ATTENTION: River level rising. Monitor closely.";
            alertSub.style.color = "#f59e0b";
        } else {
            alertSub.textContent = "Safe water level conditions.";
            alertSub.style.color = "#94a3b8";
        }

        // 5. Visual Cross-Section Tank
        const fillBar = document.getElementById("water-fill");
        const fillLabel = document.getElementById("water-fill-label");
        const clampedPct = Math.min(100, Math.max(0, levelPct));
        fillBar.style.height = `${clampedPct}%`;
        fillLabel.textContent = `${levelCm} cm (${levelPct}%)`;

        // Color gradation based on depth
        if (alertLevel === "DANGER") {
            fillBar.style.background = "linear-gradient(180deg, #ef4444 0%, #b91c1c 100%)";
        } else if (alertLevel === "WARNING" || current.is_rapid_rise) {
            fillBar.style.background = "linear-gradient(180deg, #f59e0b 0%, #d97706 100%)";
        } else {
            fillBar.style.background = "linear-gradient(180deg, #38bdf8 0%, #0284c7 100%)";
        }

        // 6. Rapid Rise Banner Display
        const rapidBanner = document.getElementById("rapid-rise-banner");
        if (current.is_rapid_rise) {
            rapidBanner.classList.remove("hidden");
            document.getElementById("rapid-rise-details").textContent = 
                `Water rising at ${slope} cm/min! Early warning initiated before danger threshold reached.`;
        } else {
            rapidBanner.classList.add("hidden");
        }

        // 7. Sensor Error Banner Display
        const sensorBanner = document.getElementById("sensor-error-banner");
        if (current.sensor_error) {
            sensorBanner.classList.remove("hidden");
            document.getElementById("sensor-error-msg").textContent = 
                "Ultrasonic echo signal lost or out of physical range (2-400cm). Check breadboard wiring.";
        } else {
            sensorBanner.classList.add("hidden");
        }

        // 8. Update Chart
        updateChart(data.history);

        // 9. Simulator Status Indicator
        const simLabel = document.getElementById("sim-status-label");
        const simBtn = document.getElementById("btn-toggle-sim");
        if (data.simulation_active) {
            simLabel.textContent = "ACTIVE (Simulating Flood Scenario)";
            simLabel.style.color = "#10b981";
            simBtn.textContent = "Stop Autonomous Simulation";
            simBtn.className = "btn btn-secondary";
        } else {
            simLabel.textContent = "Idle (Real Hardware / Standby)";
            simLabel.style.color = "#a5b4fc";
            simBtn.textContent = "Start Autonomous Simulation";
            simBtn.className = "btn btn-primary";
        }

        // 10. Hardware Buzzer Audio Synthesis
        playBuzzerIfActive(alertLevel, current.is_rapid_rise);

        // Check if alert changed to trigger history refresh
        if (alertLevel !== lastAlertLevel) {
            lastAlertLevel = alertLevel;
            fetchAlerts();
        }

    } catch (err) {
        document.getElementById("connection-dot").className = "dot-offline";
        document.getElementById("connection-status").textContent = "Offline (Reconnecting...)";
    }
}

async function fetchAlerts() {
    try {
        const response = await fetch("/api/alerts");
        const data = await response.json();
        const tbody = document.getElementById("alerts-tbody");

        if (!data.alerts || data.alerts.length === 0) {
            tbody.innerHTML = `<tr><td colspan="4" class="text-center">No alerts logged yet. System in normal state.</td></tr>`;
            return;
        }

        tbody.innerHTML = data.alerts.map(a => `
            <tr>
                <td>${a.timestamp.split(" ")[1] || a.timestamp}</td>
                <td><span class="log-${a.alert_type}">${a.alert_type}</span></td>
                <td>${a.water_level_cm.toFixed(1)} cm (${Math.round(a.water_level_percent)}%)</td>
                <td>${a.message}</td>
            </tr>
        `).join("");

    } catch (e) {
        console.error("Failed to load alerts:", e);
    }
}

async function fetchConfig() {
    try {
        const response = await fetch("/api/config");
        const config = await response.json();

        totalTankDepth = config.total_depth_cm;
        warningPercent = config.warning_threshold_percent;
        dangerPercent = config.danger_threshold_percent;

        document.getElementById("configured-depth").textContent = `${totalTankDepth} cm`;
        document.getElementById("input-total-depth").value = totalTankDepth;
        document.getElementById("input-warning-percent").value = warningPercent;
        document.getElementById("input-danger-percent").value = dangerPercent;
        document.getElementById("input-rapid-rise").value = config.rapid_rise_threshold;

        // Reposition visual threshold lines in CSS
        document.querySelector(".warning-line").style.bottom = `${warningPercent}%`;
        document.querySelector(".warning-line .threshold-tag").textContent = `WARNING (${warningPercent}%)`;
        document.querySelector(".danger-line").style.bottom = `${dangerPercent}%`;
        document.querySelector(".danger-line .threshold-tag").textContent = `DANGER (${dangerPercent}%)`;

    } catch (e) {
        console.error("Failed to load configuration:", e);
    }
}

// ============================================================================
// Web Audio API Buzzer Synthesis
// ============================================================================

function setupAudioContext() {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioContext.state === "suspended") {
        audioContext.resume();
    }
}

function playBuzzerTone(freq = 2400, duration = 0.15) {
    if (!buzzerEnabled || !audioContext) return;

    try {
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();

        osc.type = "square"; // Piezo buzzer tone
        osc.frequency.setValueAtTime(freq, audioContext.currentTime);

        gain.gain.setValueAtTime(0.12, audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);

        osc.connect(gain);
        gain.connect(audioContext.destination);

        osc.start();
        osc.stop(audioContext.currentTime + duration);
    } catch (err) {
        console.error("Audio error:", err);
    }
}

let buzzerTick = 0;
function playBuzzerIfActive(alertLevel, isRapidRise) {
    if (!buzzerEnabled) return;

    buzzerTick++;

    if (alertLevel === "DANGER") {
        // Continuous loud urgent pulsing alarm
        playBuzzerTone(2600, 0.25);
    } else if (isRapidRise) {
        // Double chirp pattern
        if (buzzerTick % 2 === 0) {
            playBuzzerTone(2200, 0.1);
        }
    }
}

// ============================================================================
// User Event Listeners
// ============================================================================

function setupEventListeners() {
    // Audio Buzzer Toggle
    const audioBtn = document.getElementById("toggle-audio-btn");
    audioBtn.addEventListener("click", () => {
        setupAudioContext();
        buzzerEnabled = !buzzerEnabled;
        if (buzzerEnabled) {
            audioBtn.innerHTML = `<span>🔊</span> Disable Web Buzzer`;
            audioBtn.className = "btn btn-primary";
            playBuzzerTone(2000, 0.1); // Test beep
        } else {
            audioBtn.innerHTML = `<span>🔇</span> Enable Web Buzzer`;
            audioBtn.className = "btn btn-secondary";
        }
    });

    // Toggle Autonomous Simulation
    document.getElementById("btn-toggle-sim").addEventListener("click", async () => {
        try {
            await fetch("/api/simulate/toggle", { method: "POST" });
            fetchLiveData();
        } catch (e) {
            alert("Error toggling simulator");
        }
    });

    // Surge Test Trigger
    document.getElementById("btn-surge-test").addEventListener("click", async () => {
        try {
            await fetch("/api/simulate/surge", { method: "POST" });
            fetchLiveData();
            fetchAlerts();
        } catch (e) {
            alert("Error injecting surge");
        }
    });

    // Refresh Alerts
    document.getElementById("refresh-alerts-btn").addEventListener("click", fetchAlerts);

    // Save Configuration
    document.getElementById("config-form").addEventListener("submit", async (e) => {
        e.preventDefault();
        const payload = {
            total_depth_cm: parseFloat(document.getElementById("input-total-depth").value),
            warning_threshold_percent: parseFloat(document.getElementById("input-warning-percent").value),
            danger_threshold_percent: parseFloat(document.getElementById("input-danger-percent").value),
            rapid_rise_threshold: parseFloat(document.getElementById("input-rapid-rise").value)
        };

        try {
            const res = await fetch("/api/config", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });
            if (res.ok) {
                alert("Calibration parameters saved successfully!");
                fetchConfig();
            }
        } catch (err) {
            alert("Failed to save settings: " + err.message);
        }
    });
}
