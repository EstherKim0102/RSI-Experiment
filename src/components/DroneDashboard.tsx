import React, { useMemo } from 'react';
import type { TelemetryData } from '../utils/randomizer';
import { generateMultiSeriesChartData } from '../utils/randomizer';
import SensorChart from './SensorChart';

interface DashboardProps {
  data: TelemetryData;
  variant: string;
  mode?: 'normal' | 'glare' | 'night' | 'reflection' | 'direct_sunlight' | 'darkness' | 'shaded_area';
  studyVersion: 'dynamic' | 'static';
  hideCharts?: boolean;
  isOutdoor?: boolean;
  trialNumber?: number;
}

const DroneDashboard: React.FC<DashboardProps> = ({ 
  data, variant, mode = 'normal', studyVersion, hideCharts = false,
  isOutdoor = false,
}) => {
  const isSidebar = variant === 'layout';
  const isHighContrast = variant === 'contrast';
  const isColorCoded = variant === 'color';
  
  const accelerationData = useMemo(() => generateMultiSeriesChartData(), []);
  const velocityData = useMemo(() => generateMultiSeriesChartData(), []);
  const orientationData = useMemo(() => generateMultiSeriesChartData(), []);

  const renderChart = (title: string, unit: string, series: any[]) => (
    <div className="h-[200px] w-full">
      <SensorChart 
        title={title}
        unit={unit}
        type="axis"
        series={series}
        studyVersion={studyVersion}
      />
    </div>
  );

  const renderStatCard = (title: string, value: string | number, unit: string, colorClass: string = '') => (
    <div className={`tello-card ${isHighContrast ? 'hc-card' : ''} ${colorClass}`}>
      <span className="tello-card-title">{title}</span>
      <div className="tello-card-value">
        {value} <span className="tello-unit">{unit}</span>
      </div>
    </div>
  );

  const DashboardContent = () => (
    <div className="tello-dashboard">
      <main className="tello-content">
        <div className="tello-banner" style={isHighContrast ? { background: 'black', borderBottom: '2px solid white' } : {}}>
            <div className="tello-grid">
              {renderStatCard('Altitude', data.altitude.toFixed(2), 'm', isColorCoded ? 'border-blue-500 text-blue-400' : '')}
              {renderStatCard('Barometer', (data.altitude * 1.05).toFixed(3), 'm', isColorCoded ? 'border-cyan-500 text-cyan-400' : '')}
              {renderStatCard('Battery', data.battery, '%', isColorCoded ? 'border-green-500 text-green-400' : '')}
              {renderStatCard('TOF Distance', (data.altitude * 0.95).toFixed(3), 'cm', isColorCoded ? 'border-orange-500 text-orange-400' : '')}
            </div>
        </div>

        {hideCharts ? (
          <div className="tello-chart-grid opacity-30">
            {[1, 2, 3].map(i => (
              <div key={i} className="tello-chart-card flex flex-col items-center justify-center min-h-[200px] border-dashed">
                <span className="text-xs font-mono mb-2">STREAM {i}</span>
                <div className="w-1/2 h-[2px] bg-gray-700 animate-pulse" />
              </div>
            ))}
          </div>
        ) : (
          <div className="tello-chart-grid">
            {renderChart('Acceleration', 'm/s²', accelerationData)}
            {renderChart('Velocity', 'm/s', velocityData)}
            {renderChart('Orientation', 'deg', orientationData)}
          </div>
        )}
      </main>

      <footer className="tello-footer" style={{ border: 'none', background: 'transparent' }}>
        <div className="w-full h-1 bg-gray-800 rounded-full relative overflow-hidden">
             <div className="absolute inset-0 bg-accent-secondary animate-shimmer" style={{ width: '65%', background: 'linear-gradient(90deg, transparent, var(--accent-secondary), transparent)', transform: 'translateX(-100%)' }}></div>
             <div className="h-full bg-accent-secondary" style={{ width: '45%' }}></div>
        </div>
      </footer>
    </div>
  );

  const SidebarDashboard = () => (
    <div className="tello-dashboard dashboard-sidebar">
      <aside className="tello-sidebar">
        <div className="tello-sidebar-stats mt-4">
            {renderStatCard('Altitude', data.altitude.toFixed(2), 'm', isColorCoded ? 'border-blue-500 text-blue-400' : '')}
            {renderStatCard('Battery', data.battery, '%', isColorCoded ? 'border-green-500 text-green-400' : '')}
            {renderStatCard('Barometer', (data.altitude * 1.05).toFixed(3), 'm', isColorCoded ? 'border-cyan-500 text-cyan-400' : '')}
            {renderStatCard('TOF Distance', (data.altitude * 0.95).toFixed(3), 'cm', isColorCoded ? 'border-orange-500 text-orange-400' : '')}
        </div>
      </aside>

      <main className="tello-content">
        {hideCharts ? (
          <div className="flex flex-col gap-6 opacity-30">
            {[1, 2, 3].map(i => (
              <div key={i} className="tello-chart-card flex flex-col items-center justify-center min-h-[180px] border-dashed">
                <span className="text-xs font-mono mb-2">STREAM {i}</span>
                <div className="w-1/2 h-[2px] bg-gray-700 animate-pulse" />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-8">
            <div className="grid grid-cols-1 gap-6">
                {renderChart('Acceleration Dynamics', 'm/s²', accelerationData)}
                {renderChart('Velocity Tracking', 'm/s', velocityData)}
                {renderChart('Orientation Vector', 'deg', orientationData)}
            </div>
          </div>
        )}
      </main>
    </div>
  );

  return (
    <div className={`relative overflow-hidden w-full h-full border border-gray-800 rounded-lg bg-black ${isHighContrast ? 'theme-hc' : ''} flex items-center justify-center`}>
      {/* Simulation Overlays */}
      {mode === 'glare' && <div className="overlay-glare absolute inset-0 z-50 pointer-events-none" />}
      {mode === 'night' && <div className="overlay-night absolute inset-0 z-50 pointer-events-none" />}
      {mode === 'reflection' && (
        <div className="absolute inset-0 z-50 pointer-events-none opacity-20" 
             style={{ background: 'linear-gradient(45deg, transparent 45%, white 50%, transparent 55%)', backgroundSize: '10px 10px' }} />
      )}

      {studyVersion === 'static' ? (
        <div className="w-full h-full flex items-center justify-center bg-black/60 p-6 overflow-hidden">
          <img 
            src={isOutdoor 
              ? `/UIDesignAsset/Outdoor variants/Dashboard variants/Dashboard_${mode === 'shaded_area' ? 'under_shade' : mode}.png`
              : mode === 'normal' 
                ? `/UIDesignAsset/Dashboard variants/${variant}.png`
                : `/UIDesignAsset/dashboard_${variant}_${mode}.png`
            } 
            alt={`Dashboard Variant ${variant} Mode ${mode}`}
            style={{ 
              maxWidth: '70vw', 
              maxHeight: '70vh', 
              boxShadow: '0 0 50px rgba(0,0,0,0.8)',
              borderRadius: '16px',
              border: '1px solid rgba(255,255,255,0.1)',
              display: 'block',
              margin: '0 auto'
            }}
            className="object-contain"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              const fileName = isOutdoor 
                ? `Dashboard_${mode === 'shaded_area' ? 'under_shade' : mode}.png`
                : mode === 'normal' 
                  ? `${variant}.png` 
                  : `dashboard_${variant}_${mode}.png`;
              target.src = `https://via.placeholder.com/1200x800/0a0b10/ffffff?text=Upload+${fileName}`;
            }}
          />
        </div>
      ) : (
        isSidebar ? <SidebarDashboard /> : <DashboardContent />
      )}

      <style>{`
        .theme-hc {
            --accent-primary: #ffff00;
            --accent-secondary: #ffffff;
            background: black !important;
        }

        .hc-card {
            border: 2px solid white !important;
            background: black !important;
        }

        .hc-card .tello-card-value {
            color: yellow !important;
            font-size: 3rem !important;
            font-weight: 900 !important;
        }

        @keyframes shimmer {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(200%); }
        }
        .animate-shimmer {
            animation: shimmer 3s infinite linear;
        }
      `}</style>
    </div>
  );
};

export default DroneDashboard;
