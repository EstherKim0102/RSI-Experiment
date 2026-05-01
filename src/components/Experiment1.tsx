import React, { useState, useMemo } from 'react';
import DroneDashboard from './DroneDashboard';
import { useTimer } from '../hooks/useTimer';
import { shuffle, generateRandomTelemetry } from '../utils/randomizer';

interface Exp1Props {
  studyVersion: 'dynamic' | 'static';
  onComplete: (data: any) => void;
}

const Experiment1: React.FC<Exp1Props> = ({ studyVersion, onComplete }) => {
  const [step, setStep] = useState<'info' | 'view' | 'black' | 'qa' | 'complete'>('info');
  const [variantIndex, setVariantIndex] = useState(0);
  const [variants] = useState<string[]>(
    shuffle(['Original', 'Color', 'Contrast', 'Grouping', 'Light mode'])
  );
  const timer = useTimer();
  const [results, setResults] = useState<any[]>([]);

  const [answers, setAnswers] = useState({
    battery: '',
    altitude: '',
    speed: '',
    tof: '',
    firstNotice: '',
    easyToRead: 3,
  });

  const telemetryData = useMemo(() => generateRandomTelemetry(), [variantIndex]);

  const startVariant = () => {
    setStep('view');
    setTimeout(() => {
      setStep('black');
      setTimeout(() => {
        setStep('qa');
        timer.start();
      }, 1000);
    }, 5000);
  };

  const submitAnswers = () => {
    const responseTime = timer.stop();
    const result = {
      variant: variants[variantIndex],
      responseTime,
      answers,
    };
    const newResults = [...results, result];
    setResults(newResults);

    if (variantIndex < variants.length - 1) {
      setVariantIndex(variantIndex + 1);
      setStep('info');
      setAnswers({
        battery: '',
        altitude: '',
        speed: '',
        tof: '',
        firstNotice: '',
        easyToRead: 3,
      });
    } else {
      setStep('complete');
      onComplete(newResults);
    }
  };

  if (step === 'info') {
    return (
      <div className="experiment-container">
        <div className="intro-content">
          <h2 className="text-3xl font-bold">Visual Recognition Task</h2>
          <p className="text-xl text-secondary">
            You will be shown a drone dashboard for 5 seconds.
            Try to observe and remember the telemetry information presented.
          </p>
          <p className="text-secondary">
            After a brief pause, you will be asked to recall specific values.
          </p>
          <div className="mt-12">
            <button className="btn btn-primary px-16 py-4" onClick={startVariant}>
              Start Task {variantIndex + 1} of {variants.length}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'view') {
    return (
      <div className="w-full min-h-screen flex items-center justify-center p-12 bg-black">
        <div className="w-full max-w-6xl h-[650px] flex items-center justify-center">
          <DroneDashboard
            data={telemetryData}
            variant={variants[variantIndex]}
            studyVersion={studyVersion}
            hideCharts={true}
          />
        </div>
      </div>
    );
  }

  if (step === 'black') {
    return <div className="black-screen" />;
  }

  if (step === 'qa') {
    return (
      <div className="experiment-container relative">
        <div className="timer-display">
          {(timer.elapsed / 1000).toFixed(2)}s
        </div>
        <div className="qa-container">
          <div className="intro-content">
            <h3 className="text-2xl font-bold">Recall Questions</h3>
            <p className="text-secondary">Please enter the values as you remember them.</p>
          </div>

          <div className="flex flex-col gap-4">
            <div className="qa-row">
              <label className="qa-label">Battery Level (%)</label>
              <div className="qa-input-container">
                <input
                  type="text" className="input-field max-w-[200px]"
                  placeholder="Value..."
                  value={answers.battery}
                  onChange={e => setAnswers({ ...answers, battery: e.target.value })}
                />
              </div>
            </div>

            <div className="qa-row">
              <label className="qa-label">Altitude (m)</label>
              <div className="qa-input-container">
                <input
                  type="text" className="input-field max-w-[200px]"
                  placeholder="Value..."
                  value={answers.altitude}
                  onChange={e => setAnswers({ ...answers, altitude: e.target.value })}
                />
              </div>
            </div>

            <div className="qa-row">
              <label className="qa-label">Speed (km/h)</label>
              <div className="qa-input-container">
                <input
                  type="text" className="input-field max-w-[200px]"
                  placeholder="Value..."
                  value={answers.speed}
                  onChange={e => setAnswers({ ...answers, speed: e.target.value })}
                />
              </div>
            </div>

            <div className="qa-row">
              <label className="qa-label">TOF Distance (cm)</label>
              <div className="qa-input-container">
                <input
                  type="text" className="input-field max-w-[200px]"
                  placeholder="Value..."
                  value={answers.tof}
                  onChange={e => setAnswers({ ...answers, tof: e.target.value })}
                />
              </div>
            </div>

            <div className="qa-row">
              <label className="qa-label">What item did you notice first?</label>
              <div className="qa-input-container">
                <input
                  type="text" className="input-field max-w-[300px]"
                  placeholder="e.g. Battery, Altitude..."
                  value={answers.firstNotice}
                  onChange={e => setAnswers({ ...answers, firstNotice: e.target.value })}
                />
              </div>
            </div>

            <div className="qa-row">
              <label className="qa-label">How easy was it to read this interface?</label>
              <div className="qa-input-container">
                <div className="w-full max-w-[200px]">
                  <div className="likert-labels">
                    <div className="likert-label-item">Very Difficult</div>
                    <div className="flex-1"></div>
                    <div className="likert-label-item">Very Easy</div>
                  </div>
                  <div className="likert-scale">
                    {[1, 2, 3, 4, 5].map(v => (
                      <div
                        key={v}
                        className={`likert-option ${answers.easyToRead === v ? 'selected' : ''}`}
                        onClick={() => setAnswers({ ...answers, easyToRead: v })}
                      >
                        {v}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-center mt-8">
            <button className="btn btn-primary px-16 py-4" onClick={submitAnswers}>
              Submit & Continue
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default Experiment1;
