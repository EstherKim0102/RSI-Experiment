import React, { useState, useMemo, useEffect } from 'react';
import DroneDashboard from './DroneDashboard';
import { useTimer } from '../hooks/useTimer';
import { shuffle, generateRandomTelemetry, generateMultiSeriesChartData } from '../utils/randomizer';
import SensorChart from './SensorChart';

interface Exp3Props {
  studyVersion: 'dynamic' | 'static';
  onComplete: (data: any) => void;
}

const Experiment3: React.FC<Exp3Props> = ({ studyVersion, onComplete }) => {
  const [step, setStep] = useState<'info' | 'view' | 'black' | 'answer' | 'feedback' | 'complete'>('info');
  const [trialIndex, setTrialIndex] = useState(0);
  const [recordedTime, setRecordedTime] = useState<number | null>(null);
  
  // 3 modes: Direct Sunlight, Darkness, Shaded Area
  const modeMap: Record<string, string> = {
    'direct_sunlight': 'Direct Sunlight',
    'darkness': 'Darkness',
    'shaded_area': 'Under Shade'
  };

  // 6 trials: 3 dashboard recall, 3 chart interpretation
  const [trials] = useState<any[]>(() => {
    // Group by environment pairs: Chart first, then Dashboard
    const modes = shuffle(['direct_sunlight', 'darkness', 'shaded_area']);
    const paired = modes.flatMap(mode => [
        { type: 'chart', mode },
        { type: 'dashboard', mode }
    ]);
    
    let dIdx = 0;
    let cIdx = 0;
    return paired.map(t => {
        if (t.type === 'dashboard') {
            dIdx++;
            return { ...t, trialNumber: dIdx };
        } else {
            cIdx++;
            return { ...t, trialNumber: cIdx };
        }
    });
  });

  const timer = useTimer();
  const [results, setResults] = useState<any[]>([]);
  
  const [answers, setAnswers] = useState({
    interpretation: '', // Combined for recall and estimation
    clarity: 3,
    confidence: 3,
  });

  const currentTrial = trials[trialIndex];
  const [targetAxis, setTargetAxis] = useState<"X" | "Y" | "Z">("Z");
  const [currentQuestion, setCurrentQuestion] = useState("");

  useEffect(() => {
    if (currentTrial.type === 'chart') {
      const axis = (['X', 'Y', 'Z'] as const)[Math.floor(Math.random() * 3)];
      setTargetAxis(axis);
      const qTypes = [
          `Estimate the peak value in the ${axis} axis.`,
          `Which axis first crossed the warning threshold (7.5)?`,
          `What is the value of the ${axis} axis at the end?`
      ];
      setCurrentQuestion(qTypes[Math.floor(Math.random() * qTypes.length)]);
    }
  }, [trialIndex, currentTrial.type]);

  const telemetryData = useMemo(() => generateRandomTelemetry(), [trialIndex]);
  const chartData = useMemo(() => generateMultiSeriesChartData(), [trialIndex]);

  const startTrial = () => {
    if (currentTrial.type === 'dashboard') {
      setStep('view');
      setTimeout(() => {
        setStep('black');
        setTimeout(() => {
          setStep('answer');
          timer.start();
        }, 1000);
      }, 5000);
    } else {
      setStep('view');
      timer.start();
    }
  };

  const handleTaskComplete = () => {
    const time = timer.stop();
    setRecordedTime(time);
    setStep('feedback');
  };

  const submitAnswers = () => {
    const result = {
      type: currentTrial.type,
      mode: modeMap[currentTrial.mode],
      trialNumber: currentTrial.trialNumber,
      question: currentTrial.type === 'chart' ? currentQuestion : 'recall',
      responseTime: recordedTime,
      answers,
    };
    const newResults = [...results, result];
    setResults(newResults);

    if (trialIndex < trials.length - 1) {
      setTrialIndex(trialIndex + 1);
      setStep('info');
      setRecordedTime(null);
      setAnswers({
        interpretation: '',
        clarity: 3,
        confidence: 3,
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
          <h2 className="text-3xl font-bold">Outdoor Visibility Task</h2>
          <p className="text-xl text-secondary">
            {currentTrial.type === 'dashboard' 
              ? 'Recall task: Observe the dashboard for 5 seconds.' 
              : 'Estimation task: Analyze the chart under environmental glare.'}
          </p>
          <p className="text-secondary mt-4">
            Condition: <span className="capitalize font-bold text-accent-primary">{modeMap[currentTrial.mode]} Simulation</span>
          </p>
          <div className="mt-12">
            <button className="btn btn-primary px-16 py-4" onClick={startTrial}>
              Start Trial {trialIndex + 1} of {trials.length}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'view') {
    return (
      <div className="experiment-container relative">
        <div className="timer-display">
          {(timer.elapsed / 1000).toFixed(2)}s
        </div>
        <div className="w-full max-w-6xl flex flex-col gap-12">
          <div className="w-full h-[500px] flex items-center justify-center rounded-xl overflow-hidden shadow-2xl border border-gray-800 relative">
             {currentTrial.type === 'dashboard' ? (
                <DroneDashboard 
                    data={telemetryData} 
                    variant="normal" 
                    mode={currentTrial.mode} 
                    studyVersion={studyVersion} 
                    hideCharts={true}
                    isOutdoor={true}
                    trialNumber={currentTrial.trialNumber}
                />
             ) : (
                <div className="flex flex-col items-center justify-center w-full h-full p-8 bg-black relative">
                   <SensorChart 
                      title="Outdoor Interpretation" 
                      unit="m/s²"
                      type="normal"
                      series={chartData}
                      studyVersion={studyVersion}
                      condition={currentTrial.mode}
                      threshold={7.5}
                      isOutdoor={true}
                      trialNumber={currentTrial.trialNumber}
                      targetAxis={targetAxis}
                   />
                </div>
             )}
          </div>
          
          {currentTrial.type === 'chart' && (
            <div className="qa-container w-full">
               <div className="qa-row">
                <label className="qa-label">{currentQuestion}</label>
                <div className="qa-input-container">
                  <input 
                    type="text" className="input-field max-w-[250px]" 
                    placeholder="Your answer..."
                    value={answers.interpretation} 
                    onChange={e => setAnswers({...answers, interpretation: e.target.value})}
                  />
                </div>
              </div>
              <div className="flex justify-center mt-8">
                <button className="btn btn-primary px-16 py-4" onClick={handleTaskComplete}>
                   Next to Questionnaire
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (step === 'black') {
    return <div className="black-screen" />;
  }

  if (step === 'answer') {
    return (
      <div className="experiment-container relative">
        <div className="timer-display">
          {(timer.elapsed / 1000).toFixed(2)}s
        </div>
        <div className="qa-container max-w-2xl w-full">
          <h3 className="text-2xl font-bold mb-8 text-center">Recall Phase</h3>
          <div className="qa-row">
            <label className="qa-label">Recall Task: What were the Battery and Altitude values?</label>
            <div className="qa-input-container">
              <input 
                type="text" className="input-field" 
                placeholder="e.g. 45%, 210m"
                value={answers.interpretation} 
                onChange={e => setAnswers({...answers, interpretation: e.target.value})}
              />
            </div>
          </div>
          <div className="flex justify-center mt-12">
            <button className="btn btn-primary px-24 py-4 text-lg" onClick={handleTaskComplete}>
              Next to Feedback
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'feedback') {
    return (
      <div className="experiment-container relative">
        <div className="qa-container max-w-2xl w-full">
            <h3 className="text-2xl font-bold mb-8 text-center text-blue-400">Trial Feedback</h3>
            <p className="text-center text-secondary mb-12">How was your experience seeing the interface under {modeMap[currentTrial.mode]}?</p>
            
            <div className="flex flex-col gap-8">
              <div className="qa-row">
                <label className="qa-label">Perceived Clarity</label>
                <div className="qa-input-container">
                  <div className="w-full">
                    <div className="likert-labels">
                      <div className="likert-label-item">Very Blurry</div>
                      <div className="flex-1"></div>
                      <div className="likert-label-item">Very Clear</div>
                    </div>
                    <div className="likert-scale">
                      {[1, 2, 3, 4, 5].map(v => (
                        <div 
                          key={v} 
                          className={`likert-option ${answers.clarity === v ? 'selected' : ''}`}
                          onClick={() => setAnswers({...answers, clarity: v})}
                        >
                          {v}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="qa-row">
                <label className="qa-label">Confidence level</label>
                <div className="qa-input-container">
                  <div className="w-full">
                    <div className="likert-labels">
                      <div className="likert-label-item">Uncertain</div>
                      <div className="flex-1"></div>
                      <div className="likert-label-item">Certain</div>
                    </div>
                    <div className="likert-scale">
                      {[1, 2, 3, 4, 5].map(v => (
                        <div 
                          key={v} 
                          className={`likert-option ${answers.confidence === v ? 'selected' : ''}`}
                          onClick={() => setAnswers({...answers, confidence: v})}
                        >
                          {v}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-center mt-12">
              <button 
                className="btn btn-primary px-24 py-4 text-lg" 
                onClick={submitAnswers}
              >
                Submit & Next Trial
              </button>
            </div>
        </div>
      </div>
    );
  }

  return null;
};

export default Experiment3;
