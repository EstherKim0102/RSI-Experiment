import React from 'react';

interface SeriesData {
  label: string;
  color: string;
  points: { time: number; value: number }[];
}

interface ChartProps {
  title: string;
  unit: string;
  type: 'normal' | 'axis' | 'threshold' | 'direct' | 'guides' | 'precise' | 'rounded' | 'color' | 'redundant';
  series: SeriesData[];
  studyVersion: 'dynamic' | 'static';
  condition?: 'normal' | 'glare' | 'night' | 'reflection' | 'direct_sunlight' | 'darkness' | 'shaded_area';
  targetAxis?: 'X' | 'Y' | 'Z';
  threshold?: number;
  showShadedThreshold?: boolean;
  isOutdoor?: boolean;
  trialNumber?: number;
  showDirectValues?: boolean;
  showVerticalTracker?: boolean;
  trackerTime?: number;
}

const SensorChart: React.FC<ChartProps> = ({ 
  title, unit, type, series, studyVersion, 
  condition = 'normal', targetAxis, threshold, showShadedThreshold = false,
  isOutdoor = false, trialNumber = 1, showDirectValues, showVerticalTracker, trackerTime = 35
}) => {
  const width = 600;
  const height = 350;
  const padding = 40;
  const maxTime = 20; // 20 seconds horizontal scale
  const maxValue = 10; // Max sensor value

  const isThreshold = type === 'threshold';
  const isDirect = type === 'direct';
  const isGuides = type === 'guides';

  const getX = (t: number) => padding + (t / maxTime) * (width - 2 * padding);
  const getY = (v: number) => height - padding - (v / maxValue) * (height - 2 * padding);


  if (studyVersion === 'static') {
    const fileName = isOutdoor 
      ? `Chart ${trialNumber}_${condition === 'shaded_area' ? 'under_shade' : condition}.png`
      : condition === 'normal' 
        ? `${type}.png` 
        : `chart_${type}_${condition}${targetAxis ? '_' + targetAxis : ''}.png`;
    
    const imagePath = isOutdoor 
      ? `/UIDesignAsset/Outdoor variants/Chart variants/${fileName}`
      : condition === 'normal' 
        ? `/UIDesignAsset/Chart variants/${fileName}` 
        : `/UIDesignAsset/${fileName}`;

    return (
      <div className="w-full h-full flex items-center justify-center bg-black/40 backdrop-blur-md p-10 overflow-hidden">

        <img 
          src={imagePath} 
          alt={`Chart Variant ${type} ${condition} ${targetAxis}`}
          style={{ 
            maxWidth: '70vw', 
            maxHeight: '70vh', 
            boxShadow: '0 0 40px rgba(0,0,0,0.7)',
            borderRadius: '12px',
            border: '1px solid rgba(255,255,255,0.08)',
            display: 'block',
            margin: '0 auto'
          }}
          className="object-contain"
          onError={(e) => {
            (e.target as HTMLImageElement).src = `https://via.placeholder.com/600x350/0a0b10/ffffff?text=Upload+${fileName}`;
          }}
        />
      </div>
    );
  }

  return (
    <div className="card w-full flex flex-col items-center bg-black/40 backdrop-blur-sm border-gray-800">
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
        {/* ... existing SVG content ... */}
        {/* Warning Threshold Area */}
        {(showShadedThreshold || isThreshold) && threshold !== undefined && (
          <rect 
            x={padding} y={getY(maxValue)} 
            width={width - 2 * padding} height={getY(threshold) - getY(maxValue)} 
            fill="rgba(255, 0, 0, 0.15)" 
          />
        )}

        {/* Grid Lines */}
        {(isGuides ? [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10] : [0, 2, 4, 6, 8, 10]).map(v => (
          <g key={v}>
            <line 
              x1={padding} y1={getY(v)} x2={width - padding} y2={getY(v)} 
              stroke={isGuides ? "#4a4a6a" : "#2a2a3a"} strokeWidth={isGuides ? "1.5" : "1"} 
            />
            <text x={padding - 15} y={getY(v) + 4} textAnchor="end" fill={isGuides ? "#aaa" : "#888"} fontSize={isGuides ? "12" : "10"}>{v}</text>
          </g>
        ))}

        {/* Warning Threshold Line */}
        {threshold && (
          <g>
            <line 
              x1={padding} y1={getY(threshold)} x2={width - padding} y2={getY(threshold)} 
              stroke="#4a4a9a" strokeWidth="1" strokeDasharray="3,3"
            />
          </g>
        )}

        {/* X-Axis Labels */}
        {[0, 5, 10, 15, 20].map(t => (
          <text key={t} x={getX(t)} y={height - padding + 25} textAnchor="middle" fill="#888" fontSize="10">{t}</text>
        ))}

        {/* Vertical Tracker */}
        {showVerticalTracker && (
          <line 
            x1={getX(trackerTime)} y1={padding} x2={getX(trackerTime)} y2={height - padding} 
            stroke="#4a4a9a" strokeWidth="1.5"
          />
        )}

        {/* Axes */}
        <g stroke="#3a3a4a" strokeWidth="1">
          <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} />
          <line x1={padding} y1={padding} x2={padding} y2={height - padding} />
        </g>

        <text x={30} y={height / 2} textAnchor="middle" fill="#6a6a8a" fontSize="14" fontWeight="500" transform={`rotate(-90, 30, ${height / 2})`}>{unit}</text>
        <text x={width - 40} y={height - 10} textAnchor="end" fill="#6a6a8a" fontSize="14" fontWeight="500">Time (s)</text>
        
        {/* Legend from Screenshots */}
        <g transform={`translate(${width - 180}, 20)`}>
          {(title.includes('Orientation') ? ['Pitch', 'Roll', 'Yaw'] : ['X', 'Y', 'Z']).map((label, i) => (
            <g key={i} transform={`translate(${i * 60}, 0)`}>
              <line x1={0} y1={-4} x2={10} y2={-4} stroke={['#00f0ff', '#3b82f6', '#ec4899'][i]} strokeWidth="2" />
              <text x={15} y={0} fill="#888" fontSize="10">{label}</text>
            </g>
          ))}
        </g>

        {/* Legend / Current Values */}
        {(type === 'direct' || type === 'redundant') && (
          <g transform={`translate(${width - padding - 180}, 20)`}>
            {series.map((s, i) => (
              <g key={i} transform={`translate(${i * 60}, 0)`}>
                <text x={0} y={0} fill="#888" fontSize="10">{s.label}</text>
                <text x={15} y={0} fill={s.color} fontSize="12" fontWeight="bold">{s.points[s.points.length - 1].value.toFixed(1)}</text>
              </g>
            ))}
          </g>
        )}

      {/* Data Series */}
        {series.map((s, seriesIdx) => {
          const pointsStr = s.points.map(d => `${getX(d.time)},${getY(d.value)}`).join(' ');
          const lastPoint = s.points[s.points.length - 1];
          const trackerPoint = s.points.find(p => Math.abs(p.time - trackerTime) < 1) || lastPoint;

          // Legend labels from screenshots: Pitch, Roll, Yaw for Orientation
          const labels = ['Pitch', 'Roll', 'Yaw', 'X', 'Y', 'Z'];
          const displayLabel = title.includes('Orientation') ? labels[seriesIdx] : s.label;

          return (
            <g key={seriesIdx}>
              <polyline
                fill="none"
                stroke={s.color}
                strokeWidth="1.5"
                strokeLinejoin="round"
                strokeLinecap="round"
                points={pointsStr}
              />
              
              {/* Vertical Tracker Labels */}
              {showVerticalTracker && (
                <g>
                   <rect 
                    x={getX(trackerTime) + 5} y={getY(trackerPoint.value) - 10} 
                    width={25} height={16} rx="2" fill="rgba(0,0,0,0.5)" 
                  />
                  <text 
                    x={getX(trackerTime) + 8} y={getY(trackerPoint.value) + 2} 
                    fill={s.color} fontSize="10" fontWeight="bold"
                  >
                    {trackerPoint.value.toFixed(1)}
                  </text>
                </g>
              )}

              {/* End of line markers */}
              {(showDirectValues || isDirect) && (
                <g>
                  <rect x={getX(lastPoint.time) + 5} y={getY(lastPoint.value) - 6} width={4} height={4} fill={s.color} />
                  <text x={getX(lastPoint.time) + 12} y={getY(lastPoint.value) + 4} fill={s.color} fontSize="11" fontWeight="bold">
                    {displayLabel} {lastPoint.value.toFixed(1)}
                  </text>
                </g>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
};

export default SensorChart;
