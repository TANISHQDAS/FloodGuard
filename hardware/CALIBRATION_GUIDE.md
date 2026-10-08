# FloodGuard Sensor Calibration & Mathematical Reference Guide

## 1. Physics of Ultrasonic Distance Measurement

The ultrasonic sensor (HC-SR04 or JSN-SR04T) operates on the time-of-flight (ToF) principle. A high-frequency acoustic pulse ($40\text{ kHz}$) is emitted from the transmitter transducer, travels through the air column, reflects off the boundary between air and water, and is detected by the receiver transducer.

```
       [ Ultrasonic Sensor ]
        | TX (Trig)   RX (Echo) |
        |   \            ^      |
        |    \          /       |
        |     v        /        |  d = Measured Air Gap
        |      \      /         |
  - - - | - - - \ - -/- - - - - | - - - Sensor Mounting Datum
        |        \  /           |
        |         v             |
  ~~~~~~+~~~~~~~~~~~~~~~~~~~~~~~+~~~~~~ Water Surface
  |                                   |
  |                                   |  h = Calculated Water Level
  |                                   |
  +===================================+ Riverbed / Container Floor
            H_total = Total Calibrated Depth
```

### 1.1 Sound Velocity Calculation
In dry air at temperature $T$ (°C), the speed of sound $c$ is given by:

$$c(T) = 331.3 \times \sqrt{1 + \frac{T}{273.15}} \approx 331.3 + 0.606 \times T \quad (\text{m/s})$$

At standard laboratory room temperature ($T = 20^\circ\text{C}$):
$$c(20^\circ\text{C}) \approx 331.3 + (0.606 \times 20) = 343.42\text{ m/s} = 0.03434\text{ cm/\mu s}$$

The round-trip distance traveled by the sound wave is $2 \times d$. Given duration $\Delta t$ in microseconds:

$$d = \frac{c \times \Delta t}{2} = \frac{0.03434 \times \Delta t}{2} = \Delta t \times 0.01717\text{ cm}$$

---

## 2. Water Level & Capacity Calculation

To determine the actual water elevation ($h$), we establish a fixed datum baseline:
- $H_{\text{total}}$: The calibrated vertical distance from the ultrasonic sensor face to the dry riverbed/container bottom (in cm).
- $d$: The instantaneous measured distance to the liquid surface.

### Water Elevation Formula:
$$h(t) = H_{\text{total}} - d(t)$$

Subject to physical constraints:
$$0 \le h(t) \le H_{\text{total}}$$

### Water Capacity Percentage:
$$P(t) = \left( \frac{h(t)}{H_{\text{total}}} \right) \times 100\%$$

---

## 3. Rate-of-Rise (Slope) Detection Derivation

Flash floods are characterized by steep rates of level increase rather than solely high static depth. A river that climbs $5\text{ cm}$ over an hour is manageable, but a river that jumps $5\text{ cm}$ in two minutes indicates a sudden storm surge or upstream dam release.

### Mathematical Formulation:
Given two discrete water elevation measurements $h(t_2)$ and $h(t_1)$ separated by time difference $\Delta t = t_2 - t_1$:

$$\text{Rate of Rise} = \frac{\Delta h}{\Delta t} = \frac{h(t_2) - h(t_1)}{t_2 - t_1}$$

To normalize into practical hydrological units ($\text{cm/min}$):

$$\text{Rate of Rise } (\text{cm/min}) = \frac{h(t_2) - h(t_1)}{\frac{t_2 - t_1}{60000}} \quad (\text{where } t \text{ is in milliseconds})$$

### Noise Suppression Rules:
To prevent false alarms from surface ripples, splashing, or single-sample digitizer jitter:
1. **Minimum Sampling Window**: $\Delta t \ge 3.0\text{ seconds}$ (preventing division by small numbers that amplify noise).
2. **Minimum Elevation Delta**: $|\Delta h| \ge 0.5\text{ cm}$ before calculating slope.
3. **Median Filter**: Every sensor cycle takes 5 rapid bursts and takes the median value to discard outlier acoustic reflections.

---

## 4. Step-by-Step Make-A-Thon Calibration Procedure

### Step 1: Physical Setup
1. Mount the ultrasonic sensor perpendicularly over the demonstration container.
2. Ensure the sensor face is parallel to the bottom surface.
3. Keep the sensor at least $5\text{ cm}$ above the rim of the container. This prevents the water level from entering the sensor's blind zone ($2\text{ cm}$ for HC-SR04).

### Step 2: Zero-Point / Datum Calibration
1. Ensure the demonstration container is completely dry and empty.
2. Power up the ESP32 and open the Serial Monitor at 115200 baud.
3. Note the reported distance value (e.g. `39.8 cm`).
4. Update `DEFAULT_TOTAL_DEPTH_CM` in `Config.h` or input this value into the dashboard web settings (e.g., `40.0 cm`).
5. Verify that the dashboard reads:
   - Water Level: `0.0 cm`
   - Depth Capacity: `0%`
   - Alert Status: `NORMAL` (Green LED ON).

### Step 3: Threshold Verification
1. Fill container to $60\%$ depth ($24.0\text{ cm}$ of water in a $40\text{ cm}$ container).
   - Verify Yellow LED turns ON.
   - Verify OLED and dashboard report `WARNING`.
2. Fill container to $85\%$ depth ($34.0\text{ cm}$ of water).
   - Verify Red LED flashes and Buzzer activates.
   - Verify OLED and dashboard report `DANGER`.

### Step 4: Rapid Rise Verification
1. From an empty or half-full container, pour water rapidly using a measuring cup or water bottle over 4–5 seconds.
2. Observe that even before the water reaches the 85% Danger mark, the system detects the steep positive slope ($\ge 5.0\text{ cm/min}$) and flashes:
   - **"RAPID RISE DETECTED!"** on the OLED and dashboard.
   - Yellow LED flashing / warning alert beeps.
