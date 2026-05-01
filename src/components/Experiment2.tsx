import React, { useState, useMemo, useEffect } from 'react';
import SensorChart from './SensorChart';
import { useTimer } from '../hooks/useTimer';
import { shuffle, generateMultiSeriesChartData } from '../utils/randomizer';

interface Exp2Props {
  studyVersion: 'dynamic' | 'static';
  onComplete: (data: any) => void;
}

const Experiment2: React.FC<Exp2Props> = ({ studyVersion, onComplete }) => {
  const [step, setStep] = useState<'info' | 'task' | 'complete'>('info');
  const [variantIndex, setVariantIndex] = useState(0);
  const [variants] = useState<string[]>(
    shuffle(['Original', 'Current Value', 'Direct Axis', 'Direct label and value', 'Guide lines', 'Threshold'])
  );

  const timer = useTimer();
  const [results, setResults] = useState<any[]>([]);
  const [targetAxis, setTargetAxis] = useState<"X" | "Y" | "Z">("Z");
  const [currentQuestion, setCurrentQuestion] = useState("");

  const [answers, setAnswers] = useState({
    interpretation: '',
    easyToRead: 3,
    confidence: 3,
  });

  const chartData = useMemo(() => generateMultiSeriesChartData(20), [variantIndex]);

  useEffect(() => {
    const axis = (['X', 'Y', 'Z'] as const)[Math.floor(Math.random() * 3)];
    setTargetAxis(axis);

    // Choose a random question type
    const qTypes = [
      `Estimate the peak value for the ${axis} axis.`,
      `Which axis was the first to cross the warning threshold (7.5)?`,
      `Which axis reaches the highest value overall?`,
      `What is the approximate value at time = 10s for the ${axis} axis?`
    ];
    setCurrentQuestion(qTypes[Math.floor(Math.random() * qTypes.length)]);
  }, [variantIndex]);

  const startTask = () => {
    setStep('task');
    timer.start();
  };

  const submitAnswers = () => {
    const responseTime = timer.stop();
    const result = {
      variant: variants[variantIndex],
      question: currentQuestion,
      targetAxis,
      responseTime,
      answers,
    };
    const newResults = [...results, result];
    setResults(newResults);

    if (variantIndex < variants.length - 1) {
      setVariantIndex(variantIndex + 1);
      setStep('info');
      setAnswers({
        interpretation: '',
        easyToRead: 3,
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
          <h2 className="text-3xl font-bold">Data Interpretation Task</h2>
          <p className="text-xl text-secondary">
            In this task, you will see a sensor data chart.
            Please analyze the chart and answer the questions accurately.
          </p>
          <p className="text-secondary">
            Your accuracy and interpretation time will be recorded.
          </p>
          <div className="mt-12">
            <button className="btn btn-primary px-16 py-4" onClick={startTask}>
              Start Task {variantIndex + 1} of {variants.length}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'task') {
    return (
      <div className="experiment-container relative">
        <div className="timer-display">
          {(timer.elapsed / 1000).toFixed(2)}s
        </div>
        <div className="w-full max-w-5xl flex flex-col gap-8 items-center">
          <div className="w-full h-[400px]">
            <SensorChart
              type={variants[variantIndex] as any}
              targetAxis={targetAxis}
              condition="normal"
              studyVersion={studyVersion}
              series={chartData}
              threshold={7.5}
              unit="m/s²"
              title="Acceleration Dynamics"
            />
          </div>

          <div className="qa-container flex-1 max-w-2xl">
            <div className="flex flex-col gap-4">
              <div className="qa-row">
                <label className="qa-label">{currentQuestion}</label>
                <div className="qa-input-container">
                  <input
                    type="text" className="input-field max-w-[250px]"
                    placeholder="Your answer..."
                    value={answers.interpretation}
                    onChange={e => setAnswers({ ...answers, interpretation: e.target.value })}
                  />
                </div>
              </div>

              <div className="qa-row">
                <label className="qa-label">How easy was it to read the values?</label>
                <div className="qa-input-container">
                  <div className="w-full max-w-[200px]">
                    <div className="likert-labels">
                      <div className="likert-label-item">Difficult</div>
                      <div className="flex-1"></div>
                      <div className="likert-label-item">Easy</div>
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

              <div className="qa-row">
                <label className="qa-label">Confidence in your answers</label>
                <div className="qa-input-container">
                  <div className="w-full max-w-[200px]">
                    <div className="likert-labels">
                      <div className="likert-label-item">Very Low</div>
                      <div className="flex-1"></div>
                      <div className="likert-label-item">Very High</div>
                    </div>
                    <div className="likert-scale">
                      {[1, 2, 3, 4, 5].map(v => (
                        <div
                          key={v}
                          className={`likert-option ${answers.confidence === v ? 'selected' : ''}`}
                          onClick={() => setAnswers({ ...answers, confidence: v })}
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
                disabled={!answers.interpretation}
                onClick={submitAnswers}
              >
                Submit & Next Task
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default Experiment2;
