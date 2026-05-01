import React, { useState } from 'react';

interface PrePostProps {
  type: 'pre' | 'post';
  onComplete: (data: any) => void;
}

const PrePostTest: React.FC<PrePostProps> = ({ type, onComplete }) => {
  const [answers, setAnswers] = useState({
    designImportance: 3,
    trustInUI: 3,
    experienceLevel: 3,
    comments: '',
  });

  const questions = [
    { key: 'designImportance', label: 'How important do you think UI design is for safety-critical systems?', minLabel: 'Not at all', maxLabel: 'Very much' },
    { key: 'trustInUI', label: 'How much do you trust automated sensor visualizations?', minLabel: 'Not at all', maxLabel: 'Very much' },
    { key: 'experienceLevel', label: 'How would you rate your experience with drone or aviation interfaces?', minLabel: 'Novice', maxLabel: 'Expert' },
  ];

  const handleSubmit = () => {
    onComplete(answers);
  };

  return (
    <div className="experiment-container">
      <div className="qa-container">
        <div className="intro-content">
          <h2 className="text-2xl font-bold">
            {type === 'pre' ? 'Initial Questionnaire' : 'Final Questionnaire'}
          </h2>
          <p className="text-secondary">
            Please answer the following questions honestly. Your data is anonymized.
          </p>
        </div>
        
        <div className="flex flex-col gap-12">
          {questions.map(q => (
            <div key={q.key}>
                <div className="qa-row">
                  <label className="qa-label">{q.label}</label>
                  <div className="qa-input-container">
                    <div className="w-full max-w-[300px]"> {/* Adjusted max-width to 300px for consistency */}
                      <div className="likert-labels">
                        <div className="likert-label-item">{q.minLabel}</div>
                        <div className="flex-1"></div>
                        <div className="likert-label-item">{q.maxLabel}</div>
                      </div>
                      <div className="likert-scale">
                        {[1, 2, 3, 4, 5].map(v => (
                          <div 
                            key={v} 
                            className={`likert-option ${(answers as any)[q.key] === v ? 'selected' : ''}`}
                            onClick={() => setAnswers({...answers, [q.key]: v})}
                          >
                            {v}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
            </div>
          ))}

          <div className="qa-item card">
            <label className="text-lg font-medium block mb-2">Any additional comments or observations?</label>
            <textarea 
              className="input-field h-32" 
              placeholder="Type your comments here..."
              value={answers.comments}
              onChange={e => setAnswers({...answers, comments: e.target.value})}
            />
          </div>
        </div>

        <div className="flex justify-center mt-8">
          <button className="btn btn-primary px-16 py-4" onClick={handleSubmit}>
            {type === 'pre' ? 'Start Study' : 'Complete Study'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PrePostTest;
