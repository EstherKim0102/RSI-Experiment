export function shuffle<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export interface TelemetryData {
  battery: number;
  altitude: number;
  speed: number;
  signalStrength: number;
  warning?: string;
  coordinates: { x: number; y: number; z: number };
}

export function generateRandomTelemetry(): TelemetryData {
  const warnings = [
    'Low battery warning - return to home',
    'High wind speed - exercise caution',
    'Signal interference detected',
    'Obstacle proximity alert',
    'GPS signal weak',
    undefined
  ];
  
  return {
    battery: Math.floor(Math.random() * 80) + 15,
    altitude: Math.floor(Math.random() * 300) + 10,
    speed: Math.floor(Math.random() * 60) + 5,
    signalStrength: Math.floor(Math.random() * 40) + 60,
    warning: warnings[Math.floor(Math.random() * warnings.length)],
    coordinates: {
      x: Math.random() * 100,
      y: Math.random() * 100,
      z: Math.random() * 200,
    }
  };
}

export function generateRandomChartData(points = 6) {
  return Array.from({ length: points }, (_, i) => ({
    time: i * 4, // 0 to 20 seconds
    value: Math.random() * 8 + 1 // 1 to 9 range for reference images
  }));
}

export function generateMultiSeriesChartData(points = 6) {
  const colors = ['#00f0ff', '#3b82f6', '#ec4899']; // Cyan, Blue, Pink
  const labels = ['1', '2', '3'];
  
  return labels.map((label, i) => ({
    label,
    color: colors[i],
    points: generateRandomChartData(points)
  }));
}

export function generateStudyFlow() {
  const experiments = [
    { id: 'exp1', type: 'memory' },
    { id: 'exp2', type: 'comprehension' },
    { id: 'exp3', idKey: 'exp3', type: 'environment' }
  ];
  
  return {
    order: experiments, // Fixed order as requested
    startTime: Date.now()
  };
}
