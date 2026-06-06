import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/auth';

const visaTypes = [
  'Critical Skills Employment Permit',
  'General Employment Permit',
  'Student (Stamp 2)',
  'Spouse / Dependant',
  'EU / EEA Freedom of Movement',
  'Refugee / Protection',
  'Other',
];

const employmentStatuses = [
  { value: 'employed', label: 'Employed (full time or part time)' },
  { value: 'self_employed', label: 'Self employed' },
  { value: 'student', label: 'Student' },
  { value: 'unemployed', label: 'Currently looking for work' },
];

export default function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // tracks which question we are on
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    nationality: '',
    visa_type: visaTypes[0],
    employment_status: 'employed',
    arrival_date: '',
    has_children: false,
    has_driving_licence: false,
  });

  const totalSteps = 4;

  const handleNext = () => {
    // Validate current step before moving forward
    if (step === 1 && !form.nationality.trim()) {
      setError('Please enter your nationality');
      return;
    }
    if (step === 3 && !form.arrival_date) {
      setError('Please enter your arrival date');
      return;
    }
    setError('');
    setStep(step + 1);
  };

  const handleBack = () => {
    setError('');
    setStep(step - 1);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    try {
      await API.post('/roadmap/onboard', form);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 w-full max-w-lg">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900">
            Settle.ie
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Let's personalise your Ireland roadmap
          </p>
        </div>

        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex justify-between text-xs text-gray-400 mb-2">
            <span>Step {step} of {totalSteps}</span>
            <span>{Math.round((step / totalSteps) * 100)}% complete</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2">
            <div
              className="bg-emerald-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(step / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Step 1 — Nationality and visa */}
        {step === 1 && (
          <div>
            <h2 className="text-lg font-medium text-gray-800 mb-6">
              Tell us about yourself
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  What is your nationality?
                </label>
                <input
                  type="text"
                  placeholder="e.g. Indian, Brazilian, Nigerian"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  value={form.nationality}
                  onChange={e => setForm({
                    ...form, nationality: e.target.value
                  })}
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  What is your visa type?
                </label>
                <select
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  value={form.visa_type}
                  onChange={e => setForm({
                    ...form, visa_type: e.target.value
                  })}
                >
                  {visaTypes.map(v => (
                    <option key={v} value={v}>{v}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Step 2 — Employment */}
        {step === 2 && (
          <div>
            <h2 className="text-lg font-medium text-gray-800 mb-6">
              What is your employment situation?
            </h2>
            <div className="space-y-3">
              {employmentStatuses.map(status => (
                <label
                  key={status.value}
                  className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all ${form.employment_status === status.value
                      ? 'border-emerald-500 bg-emerald-50'
                      : 'border-gray-200 hover:border-gray-300'
                    }`}
                >
                  <input
                    type="radio"
                    name="employment"
                    value={status.value}
                    checked={form.employment_status === status.value}
                    onChange={e => setForm({
                      ...form, employment_status: e.target.value
                    })}
                    className="accent-emerald-500"
                  />
                  <span className="text-sm text-gray-700">
                    {status.label}
                  </span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Step 3 — Arrival date */}
        {step === 3 && (
          <div>
            <h2 className="text-lg font-medium text-gray-800 mb-2">
              When did you arrive in Ireland?
            </h2>
            <p className="text-sm text-gray-500 mb-6">
              This helps us calculate deadlines like your IRP card
              registration which must be done within 90 days of arrival.
            </p>
            <div>
              <label className="block text-sm text-gray-600 mb-1">
                Arrival date
              </label>
              <input
                type="date"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                value={form.arrival_date}
                onChange={e => setForm({
                  ...form, arrival_date: e.target.value
                })}
              />
            </div>
          </div>
        )}

        {/* Step 4 — Additional info */}
        {step === 4 && (
          <div>
            <h2 className="text-lg font-medium text-gray-800 mb-2">
              A couple more things
            </h2>
            <p className="text-sm text-gray-500 mb-6">
              This helps us add the right steps to your roadmap.
            </p>
            <div className="space-y-4">
              <label className={`flex items-start gap-4 p-4 rounded-xl border cursor-pointer transition-all ${form.has_children
                  ? 'border-emerald-500 bg-emerald-50'
                  : 'border-gray-200 hover:border-gray-300'
                }`}>
                <input
                  type="checkbox"
                  checked={form.has_children}
                  onChange={e => setForm({
                    ...form, has_children: e.target.checked
                  })}
                  className="mt-0.5 accent-emerald-500"
                />
                <div>
                  <p className="text-sm font-medium text-gray-700">
                    I have children
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    We will add school enrolment steps to your roadmap
                  </p>
                </div>
              </label>

              <label className={`flex items-start gap-4 p-4 rounded-xl border cursor-pointer transition-all ${form.has_driving_licence
                  ? 'border-emerald-500 bg-emerald-50'
                  : 'border-gray-200 hover:border-gray-300'
                }`}>
                <input
                  type="checkbox"
                  checked={form.has_driving_licence}
                  onChange={e => setForm({
                    ...form, has_driving_licence: e.target.checked
                  })}
                  className="mt-0.5 accent-emerald-500"
                />
                <div>
                  <p className="text-sm font-medium text-gray-700">
                    I have a driving licence
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    We will add a licence conversion step to your roadmap
                  </p>
                </div>
              </label>
            </div>
          </div>
        )}

        {/* Navigation buttons */}
        <div className="flex gap-3 mt-8">
          {step > 1 && (
            <button
              onClick={handleBack}
              className="flex-1 border border-gray-200 text-gray-600 py-3 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              Back
            </button>
          )}
          {step < totalSteps ? (
            <button
              onClick={handleNext}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl text-sm font-medium transition-colors"
            >
              Continue
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl text-sm font-medium transition-colors disabled:opacity-50"
            >
              {loading ? 'Building your roadmap...' : 'Build my roadmap'}
            </button>
          )}
        </div>

      </div>
    </div>
  );
}