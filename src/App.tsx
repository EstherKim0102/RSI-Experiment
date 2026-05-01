import { useState, useEffect } from 'react';
import PrePostTest from './components/PrePostTest';
import Experiment1 from './components/Experiment1';
import Experiment2 from './components/Experiment2';
import Experiment3 from './components/Experiment3';
import { generateStudyFlow } from './utils/randomizer';

type StudyStep = 'setup' | 'intro' | 'pre' | 'exp1' | 'exp2' | 'exp3' | 'post' | 'summary';
type StudyVersion = 'dynamic' | 'static';

interface StudyResults {
  startTime: number | null;
  endTime: number | null;
  preTest: any;
  postTest: any;
  exp1: any;
  exp2: any;
  exp3: any;
}

function App() {
  const [step, setStep] = useState<StudyStep>('setup');
  const [studyVersion, setStudyVersion] = useState<StudyVersion>('dynamic');
  const [flow, setFlow] = useState<any>(null);
  const [expIndex, setExpIndex] = useState(0);
  const [results, setResults] = useState<StudyResults>({
    startTime: null,
    endTime: null,
    preTest: null,
    postTest: null,
    exp1: null,
    exp2: null,
    exp3: null,
  });

  useEffect(() => {
    const studyFlow = generateStudyFlow();
    setFlow(studyFlow);
    setResults(prev => ({ ...prev, startTime: studyFlow.startTime }));
  }, []);

  const nextExperiment = () => {
    if (expIndex < flow.order.length - 1) {
      setExpIndex(expIndex + 1);
      setStep(flow.order[expIndex + 1].id as StudyStep);
    } else {
      setStep('post');
    }
  };

  const startStudy = () => {
    setStep('pre');
  };

  const handlePreComplete = (data: any) => {
    setResults(prev => ({ ...prev, preTest: data }));
    setStep(flow.order[0].id as StudyStep);
  };

  const handleExp1Complete = (data: any) => {
    setResults(prev => ({ ...prev, exp1: data }));
    nextExperiment();
  };

  const handleExp2Complete = (data: any) => {
    setResults(prev => ({ ...prev, exp2: data }));
    nextExperiment();
  };

  const handleExp3Complete = (data: any) => {
    setResults(prev => ({ ...prev, exp3: data }));
    nextExperiment();
  };

  const handlePostComplete = (data: any) => {
    const finalResults = { ...results, postTest: data, endTime: Date.now() };
    setResults(finalResults);
    setStep('summary');
  };

  const generateTextSummary = () => {
    let output = "REMOTE SENSOR INTERFACE VISUALIZATION STUDY RESULTS\n";
    output += "====================================================\n\n";
    output += `Session Date: ${new Date(results.startTime || 0).toLocaleString()}\n`;
    output += `Duration: ${Math.round(((results.endTime || 0) - (results.startTime || 0)) / 1000)} seconds\n\n`;

    output += "PART 1: INITIAL QUESTIONNAIRE\n";
    output += "---------------------------\n";
    if (results.preTest) {
      Object.entries(results.preTest).forEach(([key, val]) => {
        output += `${key}: ${val}\n`;
      });
    }
    output += "\n";

    output += "PART 2: EXPERIMENTAL DATA\n";
    output += "---------------------------\n\n";

    if (results.exp1) {
      output += "TASK 1 (Visual Recognition):\n";
      results.exp1.forEach((res: any, i: number) => {
        output += `Trial ${i+1} [Variant ${res.variant}]:\n`;
        output += `  Response Time: ${res.responseTime}ms\n`;
        output += `  Accuracy/Recall: ${JSON.stringify(res.answers)}\n\n`;
      });
    }

    if (results.exp2) {
      output += "TASK 2 (Data Interpretation):\n";
      results.exp2.forEach((res: any, i: number) => {
        output += `Trial ${i+1} [Chart ${res.variant}]:\n`;
        output += `  Response Time: ${res.responseTime}ms\n`;
        output += `  Answers: ${JSON.stringify(res.answers)}\n\n`;
      });
    }

    if (results.exp3) {
      output += "TASK 3 (Environmental Visibility):\n";
      results.exp3.forEach((res: any, i: number) => {
        output += `Trial ${i+1} [Condition ${res.mode}]:\n`;
        output += `  Response Time: ${res.responseTime}ms\n`;
        output += `  Answers: ${JSON.stringify(res.answers)}\n\n`;
      });
    }

    output += "PART 3: FINAL QUESTIONNAIRE\n";
    output += "---------------------------\n";
    if (results.postTest) {
      Object.entries(results.postTest).forEach(([key, val]) => {
        output += `${key}: ${val}\n`;
      });
    }

    return output;
  };

  const downloadResults = async (format: 'json' | 'txt') => {
    const content = format === 'json' ? JSON.stringify(results, null, 2) : generateTextSummary();
    const fileName = `study_results_${Date.now()}.${format === 'json' ? 'json' : 'txt'}`;

    // Modern browsers: File System Access API
    if ('showSaveFilePicker' in window) {
      try {
        const handle = await (window as any).showSaveFilePicker({
          suggestedName: fileName,
          types: [{
            description: format === 'json' ? 'JSON File' : 'Text File',
            accept: { [format === 'json' ? 'application/json' : 'text/plain']: [`.${format === 'json' ? 'json' : 'txt'}`] },
          }],
        });
        const writable = await handle.createWritable();
        await writable.write(content);
        await writable.close();
        return;
      } catch (err) {
        console.error("Save Picker failed, falling back to traditional download:", err);
      }
    }

    // Fallback: Traditional download
    const mimeType = format === 'json' ? "application/json" : "text/plain";
    const dataStr = `data:${mimeType};charset=utf-8,` + encodeURIComponent(content);
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", fileName);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const handleMasterReset = () => {
    console.log("Master Reset Triggered");
    const code = window.prompt("Enter Master Passcode:");
    if (code === "0102") {
      setStep('setup');
      setExpIndex(0);
      setResults({
        startTime: Date.now(),
        endTime: null,
        preTest: null,
        postTest: null,
        exp1: null,
        exp2: null,
        exp3: null,
      });
      setFlow(generateStudyFlow());
    }
  };

  return (
    <div className="w-full h-full relative">
      {step === 'setup' && (
        <div className="experiment-container">
          <div className="intro-content">
            <h1 className="text-4xl font-bold mb-12">Experimenter Setup</h1>
            <div className="grid grid-cols-2 gap-8 max-w-4xl mx-auto">
              <div 
                className={`card p-8 cursor-pointer setup-card ${studyVersion === 'dynamic' ? 'selected' : ''}`}
                onClick={() => setStudyVersion('dynamic')}
              >
                <div className="flex justify-between items-start mb-4">
                    <h3 className="text-2xl font-bold">Version 1: Dynamic</h3>
                    {studyVersion === 'dynamic' && <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold shadow-lg">✓</div>}
                </div>
                <p className="text-secondary text-sm">Fully coded, live-generated UI and charts. Interactive and randomized data.</p>
              </div>
              <div 
                className={`card p-8 cursor-pointer setup-card ${studyVersion === 'static' ? 'selected' : ''}`}
                onClick={() => setStudyVersion('static')}
              >
                <div className="flex justify-between items-start mb-4">
                    <h3 className="text-2xl font-bold">Version 2: Static Images</h3>
                    {studyVersion === 'static' && <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold shadow-lg">✓</div>}
                </div>
                <p className="text-secondary text-sm">Uses .png assets from /UIDesignAsset folder. Non-interactive placeholders.</p>
               </div>
            </div>
            <div className="mt-12">
              <button className="btn btn-primary px-16 py-4" onClick={() => setStep('intro')}>
                Continue to Participant View
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Discreet Reset Button */}
      <button 
        className="master-reset-btn"
        onClick={handleMasterReset}
        title="Reset Experiment Session (Requires Passcode)"
      >
        Reset Session
      </button>

      {step === 'intro' && (
        <div className="experiment-container">
          <div className="intro-content">
            <div className="flex justify-between items-center mb-12">
              <h1 className="text-5xl font-bold">Interface Visualization Study</h1>
              <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 text-xs font-mono uppercase tracking-widest border border-blue-500/30">
                Mode: {studyVersion}
              </span>
            </div>
            <div className="card text-left max-w-2xl mx-auto p-12">
              <p className="text-xl text-secondary mb-6 leading-relaxed">
                Welcome. You are participating in a research study on real-time data visualization.
              </p>
              <p className="text-secondary mb-8 leading-relaxed">
                This session consists of three distinct interaction tasks followed by brief questionnaires. 
                All data collected is anonymized and used exclusively for academic research.
              </p>
              <div className="flex justify-center mt-8">
                <button className="btn btn-primary px-24 py-4 text-xl" onClick={startStudy}>
                  Begin Session
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {step === 'pre' && <PrePostTest type="pre" onComplete={handlePreComplete} />}

      {step === 'exp1' && <Experiment1 studyVersion={studyVersion} onComplete={handleExp1Complete} />}

      {step === 'exp2' && <Experiment2 studyVersion={studyVersion} onComplete={handleExp2Complete} />}

      {step === 'exp3' && <Experiment3 studyVersion={studyVersion} onComplete={handleExp3Complete} />}

      {step === 'post' && <PrePostTest type="post" onComplete={handlePostComplete} />}

      {step === 'summary' && (
        <div className="experiment-container">
          <div className="intro-content">
            <div className="card max-w-2xl mx-auto p-12">
              <h2 className="text-4xl font-bold mb-6">Session Complete</h2>
              <p className="text-xl text-secondary mb-12">
                Thank you for your valuable contribution to this study. Your responses have been finalized.
              </p>
              <div className="flex flex-col gap-6">
                <div className="grid grid-cols-2 gap-4">
                  <button className="btn btn-primary py-4" onClick={() => downloadResults('json')}>
                    Export JSON
                  </button>
                  <button className="btn btn-primary py-4" onClick={() => downloadResults('txt')}>
                    Export Text Sheet
                  </button>
                </div>
                <button className="btn bg-gray-900 border border-gray-800 py-4" onClick={() => window.location.reload()}>
                  Start New Session
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
