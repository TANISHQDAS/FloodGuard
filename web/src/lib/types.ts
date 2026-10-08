export type AlertLevel = 'NORMAL' | 'WARNING' | 'DANGER' | 'SENSOR_ERROR';
export type RainStatus = 'No Rain' | 'Light Rain' | 'Moderate Rain' | 'Heavy Rain';

export interface TelemetryReading {
  id: string;
  stationId: string;
  stationName: string;
  timestamp: string;
  distanceCm: number;
  waterLevelCm: number;
  waterLevelPercent: number;
  rateOfRiseCmPerMin: number;
  isRapidRise: boolean;
  rainStatus: RainStatus;
  rainAnalogValue: number;
  alertLevel: AlertLevel;
  sensorError: boolean;
  batteryPercent?: number;
  temperatureC?: number;
  humidityPercent?: number;
}

export interface MonitoringStation {
  id: string;
  name: string;
  riverName: string;
  location: string;
  latitude: number;
  longitude: number;
  totalDepthCm: number;
  warningThresholdPercent: number;
  dangerThresholdPercent: number;
  rapidRiseThreshold: number;
  status: 'ONLINE' | 'STANDBY' | 'MAINTENANCE';
  isHardwareNode: boolean;
  lastPing: string;
  currentReading: TelemetryReading;
}

export interface AlertLogItem {
  id: string;
  stationId: string;
  stationName: string;
  timestamp: string;
  type: 'WARNING' | 'DANGER' | 'RAPID_RISE' | 'SENSOR_ERROR' | 'ADVISORY';
  severity: 'low' | 'medium' | 'high' | 'critical';
  waterLevelCm: number;
  waterLevelPercent: number;
  rateOfRise: number;
  message: string;
  acknowledged: boolean;
}

export interface EvacuationZone {
  id: string;
  name: string;
  stationId: string;
  riskLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  estimatedPopulation: number;
  safeHavenLocation: string;
  primaryEvacuationRoute: string;
  contactOfficer: string;
  contactPhone: string;
  activeOrders: string;
}

export interface RiskPredictionResult {
  riskScore: number; // 0 to 100
  riskCategory: 'MINIMAL' | 'ELEVATED' | 'HIGH' | 'SEVERE';
  timeToCrestHours: number;
  predictedPeakCm: number;
  confidencePercent: number;
  contributingFactors: {
    soilSaturationPercent: number;
    rainfallIntensityMmPerHour: number;
    upstreamSurgeIndex: number;
    channelRoughness: number;
  };
  recommendedAction: string;
}
