# FloodGuard – Make-A-Thon Demonstration & Presentation Guide

This guide provides a structured, step-by-step procedure for demonstrating **FloodGuard** live before judges and evaluators at a Make-A-Thon.

---

## 1. Physical Demonstration Setup

### Materials Required:
1. **Transparent Container**: A clear acrylic tank, tall glass vase, transparent 2-liter PET bottle with top cut off, or 1000ml laboratory beaker. (Recommended depth: 30–45 cm).
2. **Sensor Mounting Bracket**: A small cardboard, 3D-printed, or wooden beam placed horizontally across the top of the container holding the HC-SR04 facing downward.
3. **Water Supply**: A 500ml squeeze bottle or measuring cup for pouring water smoothly or rapidly.
4. **Moisture Simulator**: A dropper or spray bottle for activating the rain sensor.
5. **Computer / Laptop**: Running `python server.py` displaying the dashboard on a browser window, connected to the same WiFi or smartphone mobile hotspot as the ESP32.

```
       +------------------------------------+
       | Sensor Mount (Wood / Cardboard)     |
       |      [ HC-SR04 Transducer ]        |
       +------------------------------------+
                        || (Sound wave)
                        \/
         +--------------------------------+
         |  Transparent Container        |
         |                                |
         | - - - - Danger (85%) - - - - - |
         |                                |
         | - - - - Warning (60%) - - - -  |
         |                                |
         | ~~~~~~ Water Surface ~~~~~~~~~ |
         |                                |
         +================================+
```

---

## 2. Step-by-Step Live Demonstration Script

Follow this 5-stage script to showcase all hardware features to the judges:

### Stage 1: System Baseline & Calibration (30 seconds)
- **Action**: Power on ESP32. Ensure container is empty.
- **Explain to Judges**: 
  > *"Judges, FloodGuard has booted and performed its self-test. The empty container depth is calibrated at 40 cm. The ultrasonic sensor is currently measuring the distance to the dry bottom. As you can see on the OLED display, the local Green LED, and our live dashboard, the status is NORMAL with 0% capacity."*
- **Visuals**:
  - Green LED: ON (Solid)
  - Yellow & Red LEDs: OFF
  - Buzzer: Silent
  - OLED: `Level: 0.0cm (0%) | Status: NORMAL`
  - Dashboard: Green badge, empty tank gauge, stable baseline.

---

### Stage 2: Precipitation Detection (20 seconds)
- **Action**: Place a drop of water or wet finger onto the FC-37 rain sensor board.
- **Explain to Judges**:
  > *"When rainfall begins in the river catchment, our rain sensor immediately registers moisture. Notice how the OLED and dashboard update from 'No Rain' to 'Light Rain' / 'Heavy Rain'. This alerts operators before runoff reaches the main channel."*
- **Visuals**:
  - Rain status shifts to `Light Rain` or `Heavy Rain`.
  - Analog ADC value drops on telemetry stream.

---

### Stage 3: Steady Water Rise to Warning Level (30 seconds)
- **Action**: Pour water slowly until the level crosses the 60% mark (around 24 cm in a 40 cm container).
- **Explain to Judges**:
  > *"As runoff fills the river, the water level rises steadily. When it crosses our 60% Warning threshold, the Green LED turns off, the Yellow LED illuminates, and our web dashboard logs a formal Warning event."*
- **Visuals**:
  - Green LED: OFF
  - Yellow LED: ON (Solid)
  - OLED: `Level: 25.2cm (63%) | Status: WARNING`
  - Dashboard: Yellow warning badge, tank gauge fills to 63%, Warning line crossed on real-time graph.

---

### Stage 4: Critical Feature – Rapid-Rise Surge Detection (30 seconds)
- **Action**: Take the water bottle and pour a rapid burst of water over 3 to 4 seconds, causing the water level to jump +6 cm quickly.
- **Explain to Judges**:
  > *"Now watch our primary innovation: the Rate-of-Rise calculation. Even though the absolute water level has not yet hit the danger mark, notice how the Yellow LED begins flashing and a warning chirp sounds! The dashboard displays a pulsing 'RAPID RISE DETECTED' banner because the slope exceeded 5 cm/min. This provides critical lead time during cloudbursts or flash surges."*
- **Visuals**:
  - Yellow LED: Flashes rapidly
  - Buzzer: Short warning chirps
  - OLED: Displays `>> RAPID RISE! <<`
  - Dashboard: Pulsing orange banner with measured slope (e.g. `+14.2 cm/min`).

---

### Stage 5: Danger Level Breach & Alarm (30 seconds)
- **Action**: Fill the container above the 85% mark (above 34 cm).
- **Explain to Judges**:
  > *"When the water reaches the critical 85% mark, FloodGuard escalates into full DANGER mode. The high-intensity Red LED flashes and the active acoustic buzzer sounds an urgent pulsed evacuation siren. The dashboard logs a critical Danger incident with immediate timestamping."*
- **Visuals**:
  - Red LED: Fast flashing
  - Buzzer: Loud continuous pulsed alarm (400ms ON / 200ms OFF)
  - OLED: `Level: 35.8cm (89%) | Status: DANGER`
  - Dashboard: Red danger badge, crimson tank fill, event logged in incident table.

---

### Stage 6: Reliability & Sensor Error Handling (20 seconds)
- **Action**: Gently unplug one of the ultrasonic jumper wires (e.g. Echo wire on GPIO 18).
- **Explain to Judges**:
  > *"In a disaster prototype, reliability is essential. If a wire is severed or a sensor fails, the system must not guess or display incorrect zeroes. Notice how FloodGuard immediately traps the fault, turns off the green safe indicator, and displays 'SENSOR ERROR' on both the OLED and the dashboard."*
- **Visuals**:
  - OLED: `!! SENSOR ERROR !! Check HC-SR04 pins`
  - Dashboard: Red sensor fault banner appears.
  - Reconnecting the wire instantly restores normal tracking without rebooting.

---

## 3. Anticipated Judge Questions & Recommended Answers

**Q1: Why did you use an ultrasonic sensor instead of a submersible water level sensor?**
> *"Submersible contact sensors (like resistive tapes or pressure probes) suffer from silt deposits, algae growth, and damage from debris like tree branches during high-velocity flood currents. Ultrasonic sensing is non-contact: the electronics remain safely mounted high above the water surface."*

**Q2: Isn't the HC-SR04 not waterproof for outdoor rivers?**
> *"Yes, that is an important engineering distinction. For this bench prototype, we used the HC-SR04 because it is inexpensive and allows transparent container demonstrations. However, our firmware and pinout are 100% pin-compatible with the waterproof JSN-SR04T probe (which has an IP67 rating). In an outdoor deployment, we would swap to the JSN-SR04T and account for its 20 cm blind zone in our mounting bracket."*

**Q3: Why calculate Rate of Rise instead of just high water level?**
> *"In flash floods, the rate of increase is often more dangerous than the absolute height. A river that rises 10 cm over 12 hours is manageable. A river that jumps 10 cm in 3 minutes indicates an upstream flash flood or dam breach. By calculating slope ($\Delta h / \Delta t$), we give communities early warning minutes before the river overflows its banks."*

**Q4: What happens if there is no WiFi at the river site?**
> *"FloodGuard is built with multi-layer redundancy. First, all visual LEDs, the OLED screen, and the acoustic buzzer operate autonomously on the microcontroller with zero internet dependency. Second, the ESP32 hosts its own embedded emergency web server directly on its IP address. Third, for remote rural installations, our architecture is ready to integrate a low-cost LoRa or GSM module."*
