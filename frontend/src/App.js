import React, { useState } from 'react';
import { predictSalary } from './api';
import './App.css';

const BENEFITS_LIST = [
  { id: 'health', label: ' Comprehensive Health Insurance' },
  { id: 'flexible', label: ' Flexible Work Hours' },
  { id: 'training', label: ' Professional Development Budget' },
  { id: 'wellness', label: ' Wellness & Gym Allowance' },
  { id: 'equipment', label: ' Home Office & Travel Allowance' }
];

function App() {
  const [formData, setFormData] = useState({
    job_title: 'Machine Learning Engineer',
    experience_level: 'SE',
    employment_type: 'FT',
    company_location: 'United States',
    company_size: 'M',
    employee_residence: 'United States',
    remote_ratio: 100,
    required_skills: 'Python, TensorFlow, AWS',
    education_required: 'Master',
    years_experience: 4,
    industry: 'Technology',
  });

  // State for job description text (automatically counts characters)
  const [jobDescription, setJobDescription] = useState(
    "We are looking for a Machine Learning Engineer to join our growing AI team. In this role, you will design, develop, and deploy state-of-the-art machine learning models to solve complex real-world problems. You will collaborate closely with data scientists, software engineers, and product managers to integrate models into our production pipeline. The ideal candidate has strong programming skills in Python, solid experience with TensorFlow or PyTorch, and hands-on experience deploying models on AWS. You will also participate in code reviews, optimize model performance, and contribute to our core machine learning library. We offer a dynamic work environment with cutting-edge technology, opportunities for professional growth, and a competitive salary package. Key responsibilities: Design and implement machine learning systems, clean and preprocess large datasets, perform statistical analysis and model evaluation, build scalable APIs for model serving, and monitor production models. Qualifications: Master's degree in Computer Science, Data Science, or a related quantitative field; 3+ years of experience in machine learning; proficiency in Python and ML libraries; excellent communication and teamwork skills."
  );

  // State for checkbox benefits (default 3 checked = 5.0 + 3 = 8.0 benefits score)
  const [selectedBenefits, setSelectedBenefits] = useState({
    health: true,
    flexible: true,
    training: false,
    wellness: false,
    equipment: true
  });

  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: isNaN(value) ? value : parseFloat(value),
    }));
  };

  const handleBenefitChange = (benefitId) => {
    setSelectedBenefits((prev) => ({
      ...prev,
      [benefitId]: !prev[benefitId]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setPrediction(null);

    // Automatically calculate Job Desc. Length
    const textLength = jobDescription.trim().length;
    // Map to acceptable range [500, 2500] to stay inside model's training distribution
    const calculatedLength = textLength > 0 ? Math.min(Math.max(textLength, 500), 2500) : 1500;

    // Automatically calculate Benefits Score (5.0 base + 1.0 for each checked benefit)
    const checkedCount = Object.values(selectedBenefits).filter(Boolean).length;
    const calculatedBenefitsScore = 5.0 + checkedCount;

    const payload = {
      ...formData,
      job_description_length: calculatedLength,
      benefits_score: calculatedBenefitsScore
    };

    try {
      const result = await predictSalary(payload);
      setPrediction(result);
    } catch (err) {
      setError(err.detail || 'Failed to get prediction. Please check if the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      <div className="card">
        <h1>💼 Salary Predictor</h1>
        <p className="subtitle">High-precision AI salary forecasting</p>

        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label>Job Title</label>
              <input
                type="text"
                name="job_title"
                placeholder="e.g. Data Scientist"
                value={formData.job_title}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Experience Level</label>
              <select name="experience_level" value={formData.experience_level} onChange={handleChange}>
                <option value="EN">EN (Entry Level)</option>
                <option value="MI">MI (Mid Level)</option>
                <option value="SE">SE (Senior)</option>
                <option value="EX">EX (Executive)</option>
              </select>
            </div>

            <div className="form-group">
              <label>Education Required</label>
              <select name="education_required" value={formData.education_required} onChange={handleChange}>
                <option value="Bachelor">Bachelor</option>
                <option value="Master">Master</option>
                <option value="PhD">PhD</option>
              </select>
            </div>

            <div className="form-group">
              <label>Employment Type</label>
              <select name="employment_type" value={formData.employment_type} onChange={handleChange}>
                <option value="FT">FT (Full Time)</option>
                <option value="PT">PT (Part Time)</option>
                <option value="CT">CT (Contract)</option>
                <option value="FL">FL (Freelance)</option>
              </select>
            </div>

            <div className="form-group">
              <label>Employee Residence</label>
              <input
                type="text"
                name="employee_residence"
                value={formData.employee_residence}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Company Location</label>
              <input
                type="text"
                name="company_location"
                value={formData.company_location}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Company Size</label>
              <select name="company_size" value={formData.company_size} onChange={handleChange}>
                <option value="S">S (Small)</option>
                <option value="M">M (Medium)</option>
                <option value="L">L (Large)</option>
              </select>
            </div>

            <div className="form-group">
              <label>Years of Experience</label>
              <input
                type="number"
                name="years_experience"
                min="0"
                step="0.5"
                value={formData.years_experience}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Industry</label>
              <input
                type="text"
                name="industry"
                value={formData.industry}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Workplace Setup (Remote Ratio)</label>
              <div className="segmented-control">
                <button
                  type="button"
                  className={`segment-btn ${formData.remote_ratio === 0 ? 'active' : ''}`}
                  onClick={() => setFormData(prev => ({ ...prev, remote_ratio: 0 }))}
                >
                   On-site (0%)
                </button>
                <button
                  type="button"
                  className={`segment-btn ${formData.remote_ratio === 50 ? 'active' : ''}`}
                  onClick={() => setFormData(prev => ({ ...prev, remote_ratio: 50 }))}
                >
                   Hybrid (50%)
                </button>
                <button
                  type="button"
                  className={`segment-btn ${formData.remote_ratio === 100 ? 'active' : ''}`}
                  onClick={() => setFormData(prev => ({ ...prev, remote_ratio: 100 }))}
                >
                   Full Remote (100%)
                </button>
              </div>
            </div>

            <div className="form-group full-width">
              <label>Company Benefits (Select all that apply)</label>
              <div className="benefits-grid">
                {BENEFITS_LIST.map((benefit) => (
                  <label key={benefit.id} className={`benefit-checkbox-label ${selectedBenefits[benefit.id] ? 'checked' : ''}`}>
                    <input
                      type="checkbox"
                      checked={selectedBenefits[benefit.id]}
                      onChange={() => handleBenefitChange(benefit.id)}
                    />
                    <span>{benefit.label}</span>
                  </label>
                ))}
              </div>
              <div className="benefits-preview-score">
                Estimated Benefits Score: <span className="score-value">{(5.0 + Object.values(selectedBenefits).filter(Boolean).length).toFixed(1)} / 10.0</span>
              </div>
            </div>

            <div className="form-group full-width">
              <label>Job Description (We will automatically calculate the length for you)</label>
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                rows="5"
                placeholder="Paste the job description here..."
              />
              <div className="textarea-footer">
                <span>{jobDescription.length.toLocaleString()} characters</span>
                <span className="clamped-info">
                  (Model Input: {jobDescription.trim().length > 0 ? Math.min(Math.max(jobDescription.trim().length, 500), 2500) : 1500} chars)
                </span>
              </div>
            </div>

            <div className="form-group full-width">
              <label>Required Skills (Separated by commas)</label>
              <textarea
                name="required_skills"
                value={formData.required_skills}
                onChange={handleChange}
                rows="2"
                placeholder="e.g. Python, SQL, Machine Learning, Docker"
                required
              />
            </div>
          </div>

          <button type="submit" className="btn-predict" disabled={loading}>
            {loading ? 'Analyzing Market Data...' : ' Generate Prediction'}
          </button>
        </form>

        {error && <div className="error-message">❌ {error}</div>}

        {prediction && (
          <div className="result-card">
            <h2>Estimated Annual Salary</h2>
            <div className="salary-display">
              <span className="currency">$</span>
              <span className="amount">{prediction.predicted_salary_usd.toLocaleString()}</span>
              <span className="currency-code">USD</span>
            </div>
            <p className="model-info">
              Predicted by Engine v{prediction.model_version} • {new Date(prediction.timestamp).toLocaleDateString()}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
