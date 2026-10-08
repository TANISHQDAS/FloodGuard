import { MonitoringStation, TelemetryReading, AlertLogItem, EvacuationZone, RiskPredictionResult } from './types';

// In-memory persistent state (persists during Vercel function lifetime & updates via real API calls)
const stations: Map<string, MonitoringStation> = new Map();
const telemetryHistory: Map<string, TelemetryReading[]> = new Map();
const alerts: AlertLogItem[] = [];

// Initialize default stations
function initializeDefaultData() {
  if (stations.size > 0) return;

  const defaultStations: MonitoringStation[] = [
    {
      id: 'FG-NODE-01',
      name: 'Station 1: Bench / River Node (ESP32 Live)',
      riverName: 'Upstream Tributary A',
      location: 'Bridge Crossing Sector 4',
      latitude: 19.0760,
      longitude: 72.8777,
      totalDepthCm: 50.0,
      warningThresholdPercent: 60.0,
      dangerThresholdPercent: 85.0,
      rapidRiseThreshold: 5.0,
      status: 'ONLINE',
      isHardwareNode: true,
      lastPing: new Date().toISOString(),
      currentReading: {
        id: 'read-init-1',
        stationId: 'FG-NODE-01',
        stationName: 'Station 1: Bench / River Node (ESP32 Live)',
        timestamp: new Date().toISOString(),
        distanceCm: 32.5,
        waterLevelCm: 17.5,
        waterLevelPercent: 35.0,
        rateOfRiseCmPerMin: 0.2,
        isRapidRise: false,
        rainStatus: 'No Rain',
        rainAnalogValue: 3850,
        alertLevel: 'NORMAL',
        sensorError: false,
        batteryPercent: 94,
        temperatureC: 28.4,
        humidityPercent: 65,
      }
    },
    {
      id: 'FG-NODE-02',
      name: 'Station 2: Main Canal Culvert',
      riverName: 'South Stormwater Basin',
      location: 'Industrial Canal Gate 3',
      latitude: 19.0880,
      longitude: 72.8950,
      totalDepthCm: 120.0,
      warningThresholdPercent: 65.0,
      dangerThresholdPercent: 88.0,
      rapidRiseThreshold: 8.0,
      status: 'ONLINE',
      isHardwareNode: false,
      lastPing: new Date().toISOString(),
      currentReading: {
        id: 'read-init-2',
        stationId: 'FG-NODE-02',
        stationName: 'Station 2: Main Canal Culvert',
        timestamp: new Date().toISOString(),
        distanceCm: 48.0,
        waterLevelCm: 72.0,
        waterLevelPercent: 60.0,
        rateOfRiseCmPerMin: 1.8,
        isRapidRise: false,
        rainStatus: 'Light Rain',
        rainAnalogValue: 2400,
        alertLevel: 'NORMAL',
        sensorError: false,
        batteryPercent: 88,
        temperatureC: 27.2,
        humidityPercent: 78,
      }
    },
    {
      id: 'FG-NODE-03',
      name: 'Station 3: Lowland Causeway',
      riverName: 'Eastern Creek Outlet',
      location: 'Suburban Causeway Km 12',
      latitude: 19.0520,
      longitude: 72.8420,
      totalDepthCm: 80.0,
      warningThresholdPercent: 55.0,
      dangerThresholdPercent: 80.0,
      rapidRiseThreshold: 4.5,
      status: 'ONLINE',
      isHardwareNode: false,
      lastPing: new Date().toISOString(),
      currentReading: {
        id: 'read-init-3',
        stationId: 'FG-NODE-03',
        stationName: 'Station 3: Lowland Causeway',
        timestamp: new Date().toISOString(),
        distanceCm: 22.0,
        waterLevelCm: 58.0,
        waterLevelPercent: 72.5,
        rateOfRiseCmPerMin: 4.8,
        isRapidRise: false,
        rainStatus: 'Moderate Rain',
        rainAnalogValue: 1650,
        alertLevel: 'WARNING',
        sensorError: false,
        batteryPercent: 81,
        temperatureC: 26.8,
        humidityPercent: 85,
      }
    }
  ];

  defaultStations.forEach(st => {
    stations.set(st.id, st);
    
    // Seed initial chronological history points (past 20 points)
    const history: TelemetryReading[] = [];
    const now = Date.now();
    for (let i = 20; i >= 0; i--) {
      const pointTime = new Date(now - i * 15000).toISOString();
      const wave = Math.sin((20 - i) * 0.4) * 2.0;
      const baseLevel = st.currentReading.waterLevelCm;
      const calculatedLevel = Math.max(0, baseLevel - (i * 0.2) + wave);
      const calculatedPct = (calculatedLevel / st.totalDepthCm) * 100;
      
      history.push({
        ...st.currentReading,
        id: `seed-${st.id}-${i}`,
        timestamp: pointTime,
        waterLevelCm: parseFloat(calculatedLevel.toFixed(1)),
        waterLevelPercent: parseFloat(calculatedPct.toFixed(1)),
        distanceCm: parseFloat((st.totalDepthCm - calculatedLevel).toFixed(1)),
        rateOfRiseCmPerMin: parseFloat((0.2 + (20 - i) * 0.05).toFixed(1)),
      });
    }
    telemetryHistory.set(st.id, history);
  });

  // Initial alerts seed
  alerts.push(
    {
      id: 'alt-001',
      stationId: 'FG-NODE-03',
      stationName: 'Station 3: Lowland Causeway',
      timestamp: new Date(Date.now() - 360000).toISOString(),
      type: 'WARNING',
      severity: 'medium',
      waterLevelCm: 58.0,
      waterLevelPercent: 72.5,
      rateOfRise: 4.8,
      message: 'Water level crossed 70% threshold. Causeway approaches monitoring active.',
      acknowledged: false,
    },
    {
      id: 'alt-002',
      stationId: 'FG-NODE-01',
      stationName: 'Station 1: Bench / River Node (ESP32 Live)',
      timestamp: new Date(Date.now() - 1200000).toISOString(),
      type: 'ADVISORY',
      severity: 'low',
      waterLevelCm: 16.0,
      waterLevelPercent: 32.0,
      rateOfRise: 0.1,
      message: 'Routine calibration check completed. ESP32 online.',
      acknowledged: true,
    }
  );
}

// Global accessor functions
export function getStations(): MonitoringStation[] {
  initializeDefaultData();
  return Array.from(stations.values());
}

export function getStationById(id: string): MonitoringStation | undefined {
  initializeDefaultData();
  return stations.get(id);
}

export function updateStationConfig(
  id: string,
  config: Partial<Pick<MonitoringStation, 'totalDepthCm' | 'warningThresholdPercent' | 'dangerThresholdPercent' | 'rapidRiseThreshold' | 'name' | 'location'>>
): MonitoringStation | null {
  initializeDefaultData();
  const station = stations.get(id);
  if (!station) return null;

  const updated: MonitoringStation = {
    ...station,
    ...config,
  };
  stations.set(id, updated);
  return updated;
}

export function getTelemetryHistory(stationId: string): TelemetryReading[] {
  initializeDefaultData();
  return telemetryHistory.get(stationId) || [];
}

export function recordTelemetryReading(
  reading: Omit<TelemetryReading, 'id' | 'stationName'>
): { reading: TelemetryReading; alertCreated: AlertLogItem | null } {
  initializeDefaultData();
  let station = stations.get(reading.stationId);

  // Auto-register new station if it doesn't exist yet
  if (!station) {
    station = {
      id: reading.stationId,
      name: `Sensor Node ${reading.stationId}`,
      riverName: 'Local Catchment River',
      location: 'Field Deployed Node',
      latitude: 19.0760,
      longitude: 72.8777,
      totalDepthCm: 50.0,
      warningThresholdPercent: 60.0,
      dangerThresholdPercent: 85.0,
      rapidRiseThreshold: 5.0,
      status: 'ONLINE',
      isHardwareNode: true,
      lastPing: new Date().toISOString(),
      currentReading: {
        ...reading,
        id: `read-${Date.now()}`,
        stationName: `Sensor Node ${reading.stationId}`,
      }
    };
    stations.set(reading.stationId, station);
  }

  const completeReading: TelemetryReading = {
    ...reading,
    id: `read-${Date.now()}`,
    stationName: station.name,
    timestamp: reading.timestamp || new Date().toISOString(),
  };

  // Update station current reading & ping
  station.currentReading = completeReading;
  station.lastPing = completeReading.timestamp;
  stations.set(station.id, station);

  // Append to station history buffer (keep up to 100 points)
  const history = telemetryHistory.get(station.id) || [];
  history.push(completeReading);
  if (history.length > 100) {
    history.shift();
  }
  telemetryHistory.set(station.id, history);

  // Alert generation logic
  let alertCreated: AlertLogItem | null = null;
  if (reading.alertLevel === 'DANGER') {
    alertCreated = {
      id: `alt-${Date.now()}`,
      stationId: station.id,
      stationName: station.name,
      timestamp: completeReading.timestamp,
      type: 'DANGER',
      severity: 'critical',
      waterLevelCm: reading.waterLevelCm,
      waterLevelPercent: reading.waterLevelPercent,
      rateOfRise: reading.rateOfRiseCmPerMin,
      message: `CRITICAL FLOOD DANGER! Water level reached ${reading.waterLevelCm.toFixed(1)} cm (${Math.round(reading.waterLevelPercent)}%). Evacuation sirens triggered.`,
      acknowledged: false,
    };
    alerts.unshift(alertCreated);
  } else if (reading.isRapidRise) {
    alertCreated = {
      id: `alt-${Date.now()}`,
      stationId: station.id,
      stationName: station.name,
      timestamp: completeReading.timestamp,
      type: 'RAPID_RISE',
      severity: 'high',
      waterLevelCm: reading.waterLevelCm,
      waterLevelPercent: reading.waterLevelPercent,
      rateOfRise: reading.rateOfRiseCmPerMin,
      message: `RAPID RISE DETECTED (+${reading.rateOfRiseCmPerMin.toFixed(1)} cm/min)! Water surging quickly before absolute threshold reached.`,
      acknowledged: false,
    };
    alerts.unshift(alertCreated);
  } else if (reading.alertLevel === 'WARNING' && (!station.currentReading || station.currentReading.alertLevel !== 'WARNING')) {
    alertCreated = {
      id: `alt-${Date.now()}`,
      stationId: station.id,
      stationName: station.name,
      timestamp: completeReading.timestamp,
      type: 'WARNING',
      severity: 'medium',
      waterLevelCm: reading.waterLevelCm,
      waterLevelPercent: reading.waterLevelPercent,
      rateOfRise: reading.rateOfRiseCmPerMin,
      message: `Warning threshold crossed at ${station.name}: ${reading.waterLevelCm.toFixed(1)} cm (${Math.round(reading.waterLevelPercent)}%).`,
      acknowledged: false,
    };
    alerts.unshift(alertCreated);
  } else if (reading.sensorError) {
    alertCreated = {
      id: `alt-${Date.now()}`,
      stationId: station.id,
      stationName: station.name,
      timestamp: completeReading.timestamp,
      type: 'SENSOR_ERROR',
      severity: 'medium',
      waterLevelCm: 0,
      waterLevelPercent: 0,
      rateOfRise: 0,
      message: `Ultrasonic telemetry dropped on ${station.name}. Echo pulse out of range. Check wiring.`,
      acknowledged: false,
    };
    alerts.unshift(alertCreated);
  }

  return { reading: completeReading, alertCreated };
}

export function getAlerts(): AlertLogItem[] {
  initializeDefaultData();
  return alerts;
}

export function acknowledgeAlert(alertId: string): boolean {
  initializeDefaultData();
  const alert = alerts.find(a => a.id === alertId);
  if (alert) {
    alert.acknowledged = true;
    return true;
  }
  return false;
}

export const defaultEvacuationZones: EvacuationZone[] = [
  {
    id: 'ZONE-A',
    name: 'Sector 4 Riverbank Lowlands',
    stationId: 'FG-NODE-01',
    riskLevel: 'MODERATE',
    estimatedPopulation: 1450,
    safeHavenLocation: 'Government Polytechnic Hill Campus, Ward 12',
    primaryEvacuationRoute: 'Route 4B via North Elevated Causeway',
    contactOfficer: 'Inspector R. Deshmukh',
    contactPhone: '+91 98201 44521',
    activeOrders: 'Stage 1 Readiness: Community volunteers alerted.',
  },
  {
    id: 'ZONE-B',
    name: 'Industrial Basin Canal Settlement',
    stationId: 'FG-NODE-02',
    riskLevel: 'LOW',
    estimatedPopulation: 2800,
    safeHavenLocation: 'St. Mary High School Shelter Complex',
    primaryEvacuationRoute: 'Industrial Bypass to Highway 66',
    contactOfficer: 'Chief Officer S. Patil',
    contactPhone: '+91 98334 11290',
    activeOrders: 'Normal monitoring. Drainage gates opened.',
  },
  {
    id: 'ZONE-C',
    name: 'Eastern Creek Causeway Settlement',
    stationId: 'FG-NODE-03',
    riskLevel: 'HIGH',
    estimatedPopulation: 3200,
    safeHavenLocation: 'Central Sports Complex (Higher Elevation)',
    primaryEvacuationRoute: 'East Highway Link, Exit 8',
    contactOfficer: 'Disaster Relief Coordinator K. Sharma',
    contactPhone: '+91 98190 77341',
    activeOrders: 'Stage 2 Advisory: Prepare emergency go-bags. Low bridge barricaded.',
  }
];

export function calculateHydrologicalRisk(
  waterLevelPercent: number,
  rateOfRise: number,
  rainStatus: string,
  soilSaturationPercent: number = 72,
  upstreamSurgeIndex: number = 1.2
): RiskPredictionResult {
  // Analytical hydrological modeling (inspired by USGS/XGBoost flood risk factors)
  let rainWeight = 0;
  if (rainStatus === 'Heavy Rain') rainWeight = 28;
  else if (rainStatus === 'Moderate Rain') rainWeight = 18;
  else if (rainStatus === 'Light Rain') rainWeight = 8;

  const levelWeight = Math.min(45, (waterLevelPercent / 100) * 45);
  const slopeWeight = Math.min(25, Math.max(0, rateOfRise * 3.5));
  const soilWeight = (soilSaturationPercent / 100) * 15;
  const surgeWeight = upstreamSurgeIndex * 5;

  const rawScore = levelWeight + slopeWeight + rainWeight + (soilWeight * 0.5) + (surgeWeight * 0.5);
  const riskScore = Math.min(100, Math.max(5, Math.round(rawScore)));

  let riskCategory: 'MINIMAL' | 'ELEVATED' | 'HIGH' | 'SEVERE' = 'MINIMAL';
  let recommendedAction = 'Routine catchment observation.';
  let timeToCrestHours = 12.0;

  if (riskScore >= 80) {
    riskCategory = 'SEVERE';
    recommendedAction = 'MANDATORY EVACUATION: Immediate life-safety warning. Sound sirens.';
    timeToCrestHours = Math.max(0.5, parseFloat((2.0 - (rateOfRise * 0.15)).toFixed(1)));
  } else if (riskScore >= 60) {
    riskCategory = 'HIGH';
    recommendedAction = 'EVACUATION WARNING: Move elderly & livestock to designated shelters.';
    timeToCrestHours = Math.max(1.5, parseFloat((4.5 - (rateOfRise * 0.2)).toFixed(1)));
  } else if (riskScore >= 35) {
    riskCategory = 'ELEVATED';
    recommendedAction = 'ADVISORY ALERT: Clear stormwater drains and test backup power.';
    timeToCrestHours = 6.5;
  }

  const predictedPeakCm = Math.round(waterLevelPercent * 0.5 + (rateOfRise * 4.2) + 12);

  return {
    riskScore,
    riskCategory,
    timeToCrestHours,
    predictedPeakCm,
    confidencePercent: 88,
    contributingFactors: {
      soilSaturationPercent,
      rainfallIntensityMmPerHour: rainStatus === 'Heavy Rain' ? 45 : rainStatus === 'Moderate Rain' ? 18 : 2,
      upstreamSurgeIndex,
      channelRoughness: 0.035,
    },
    recommendedAction,
  };
}
