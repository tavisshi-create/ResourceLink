import { useState } from 'react';
import './SmartMatch.css';
import {
  findBestMatch,
  MatchApiError,
  type MatchedResource,
  type MatchRequest,
} from './matchApi';

const CATEGORY_OPTIONS = [
  'Imaging',
  'Diagnostics',
  'Microscopy',
  'Materials',
  'Molecular',
  'Medical Imaging',
  'Biotechnology',
  'Laboratory Systems',
];

type FormState = {
  category: string;
  capability: string;
  location: string;
  date: string;
  time: string;
  budget: string;
  operatorRequired: boolean;
};

const INITIAL_FORM: FormState = {
  category: '',
  capability: '',
  location: '',
  date: '',
  time: '',
  budget: '',
  operatorRequired: false,
};

type FieldErrors = Partial<Record<keyof FormState, string>>;

const REQUIRED_FIELDS: (keyof FormState)[] = ['category', 'capability', 'location', 'date', 'time'];

function validate(form: FormState): FieldErrors {
  const errors: FieldErrors = {};
  for (const field of REQUIRED_FIELDS) {
    if (!String(form[field]).trim()) {
      errors[field] = 'Required';
    }
  }
  return errors;
}

function scoreTier(score: number): 'high' | 'mid' | 'low' {
  if (score >= 80) return 'high';
  if (score >= 50) return 'mid';
  return 'low';
}

function ScoreRing({ score }: { score: number }) {
  const clamped = Math.max(0, Math.min(100, score));
  const tier = scoreTier(clamped);
  return (
    <div
      className={`sm-score-ring sm-score-ring-${tier}`}
      style={{ ['--sm-score-pct' as string]: `${clamped}%` }}
    >
      <div className="sm-score-ring-inner">
        <span>{Math.round(clamped)}%</span>
        <small>match</small>
      </div>
    </div>
  );
}

function ResourceFacts({ r }: { r: MatchedResource }) {
  return (
    <dl className="sm-fact-grid">
      {r.capability && (
        <div>
          <dt>Capability</dt>
          <dd>{r.capability}</dd>
        </div>
      )}
      <div>
        <dt>Location</dt>
        <dd>{r.location}</dd>
      </div>
      {r.availability && (
        <div>
          <dt>Availability</dt>
          <dd>{r.availability}</dd>
        </div>
      )}
      {typeof r.budget === 'number' && (
        <div>
          <dt>Budget / Cost</dt>
          <dd>₹{r.budget} / hour</dd>
        </div>
      )}
      <div>
        <dt>Operator</dt>
        <dd>
          {r.operatorAvailable === undefined
            ? '—'
            : r.operatorAvailable
            ? 'Available'
            : 'Not available'}
        </dd>
      </div>
    </dl>
  );
}

function SmartMatch() {
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [results, setResults] = useState<MatchedResource[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const updateField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (fieldErrors[key]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const errors = validate(form);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setLoading(true);
    setError(null);
    setHasSearched(true);

    const payload: MatchRequest = {
      category: form.category,
      capability: form.capability.trim(),
      location: form.location.trim(),
      date: form.date,
      time: form.time,
      budget: form.budget ? Number(form.budget) : null,
      operatorRequired: form.operatorRequired,
    };

    try {
      const matched = await findBestMatch(payload);
      const ranked = [...matched].sort((a, b) => b.matchScore - a.matchScore);
      setResults(ranked);
    } catch (err) {
      setResults(null);
      setError(
        err instanceof MatchApiError
          ? err.message
          : 'Could not reach the matching service. Please try again.',
      );
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setForm(INITIAL_FORM);
    setFieldErrors({});
    setResults(null);
    setError(null);
    setHasSearched(false);
  };

  const [best, ...rest] = results ?? [];

  return (
    <main className="sm-page">
      <div className="sm-shell">
        <nav className="sm-breadcrumb">
          <span>Home</span>
          <span>/</span>
          <span>Resources</span>
          <span>/</span>
          <strong>Smart Match</strong>
        </nav>

        <header className="sm-header">
          <div>
            <p className="sm-eyebrow">RESOURCE LINK</p>
            <h1>Smart Resource Matching</h1>
            <p className="sm-subtitle">
              Enter what you need and we'll rank the best-fit equipment for your requirement.
            </p>
          </div>
        </header>

        <form className="sm-form" onSubmit={handleSubmit} noValidate>
          <div className="sm-form-grid">
            <label className={`sm-field${fieldErrors.category ? ' sm-field-error' : ''}`}>
              <span>
                Category <em>*</em>
              </span>
              <select
                value={form.category}
                onChange={(e) => updateField('category', e.target.value)}
              >
                <option value="">Select category…</option>
                {CATEGORY_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
              {fieldErrors.category && <small>{fieldErrors.category}</small>}
            </label>

            <label className={`sm-field${fieldErrors.capability ? ' sm-field-error' : ''}`}>
              <span>
                Required Capability <em>*</em>
              </span>
              <input
                type="text"
                placeholder="e.g. high-resolution cell imaging"
                value={form.capability}
                onChange={(e) => updateField('capability', e.target.value)}
              />
              {fieldErrors.capability && <small>{fieldErrors.capability}</small>}
            </label>

            <label className={`sm-field${fieldErrors.location ? ' sm-field-error' : ''}`}>
              <span>
                Location <em>*</em>
              </span>
              <input
                type="text"
                placeholder="e.g. Chennai"
                value={form.location}
                onChange={(e) => updateField('location', e.target.value)}
              />
              {fieldErrors.location && <small>{fieldErrors.location}</small>}
            </label>

            <label className={`sm-field${fieldErrors.date ? ' sm-field-error' : ''}`}>
              <span>
                Date <em>*</em>
              </span>
              <input
                type="date"
                value={form.date}
                onChange={(e) => updateField('date', e.target.value)}
              />
              {fieldErrors.date && <small>{fieldErrors.date}</small>}
            </label>

            <label className={`sm-field${fieldErrors.time ? ' sm-field-error' : ''}`}>
              <span>
                Time / Availability <em>*</em>
              </span>
              <input
                type="time"
                value={form.time}
                onChange={(e) => updateField('time', e.target.value)}
              />
              {fieldErrors.time && <small>{fieldErrors.time}</small>}
            </label>

            <label className="sm-field">
              <span>Budget (₹ / hour)</span>
              <input
                type="number"
                min="0"
                placeholder="e.g. 5000"
                value={form.budget}
                onChange={(e) => updateField('budget', e.target.value)}
              />
            </label>

            <div className="sm-field">
              <span>Operator Required</span>
              <div className="sm-toggle-group" role="group" aria-label="Operator required">
                <button
                  type="button"
                  className={form.operatorRequired ? 'sm-toggle-btn sm-toggle-active' : 'sm-toggle-btn'}
                  onClick={() => updateField('operatorRequired', true)}
                >
                  Yes
                </button>
                <button
                  type="button"
                  className={!form.operatorRequired ? 'sm-toggle-btn sm-toggle-active' : 'sm-toggle-btn'}
                  onClick={() => updateField('operatorRequired', false)}
                >
                  No
                </button>
              </div>
            </div>
          </div>

          {Object.keys(fieldErrors).length > 0 && (
            <p className="sm-form-error-summary">Please fill in all required fields.</p>
          )}

          <div className="sm-form-actions">
            <button type="button" className="sm-reset-button" onClick={handleReset}>
              Reset / Clear Search
            </button>
            <button type="submit" className="sm-submit-button" disabled={loading}>
              {loading ? 'Finding matches…' : 'Find Best Match'}
            </button>
          </div>
        </form>

        {error && <div className="sm-error">{error}</div>}

        {hasSearched && !error && (
          <section className="sm-results">
            <div className="sm-results-header">
              <h2>Ranked Matches</h2>
              {results && <span className="sm-result-count">{results.length} found</span>}
            </div>

            {loading && <div className="sm-status">Scoring available resources…</div>}

            {!loading && results && results.length === 0 && (
              <div className="sm-empty">
                No resources matched that requirement. Try widening your budget, date, or location.
              </div>
            )}

            {!loading && best && (
              <>
                <article className="sm-best-card">
                  <div className="sm-best-badge">BEST MATCH</div>
                  <div className="sm-best-layout">
                    {best.image && (
                      <div className="sm-best-image">
                        <img src={best.image} alt={best.name} />
                      </div>
                    )}
                    <div className="sm-best-content">
                      <div className="sm-best-top">
                        <div>
                          <h3>{best.name}</h3>
                          {best.institution && <p className="sm-best-institution">{best.institution}</p>}
                        </div>
                        <ScoreRing score={best.matchScore} />
                      </div>

                      <div className="sm-card-meta">
                        <span>{best.category}</span>
                      </div>

                      <ResourceFacts r={best} />

                      <button
                        type="button"
                        className="sm-details-button"
                        onClick={() => best.detailsUrl && window.open(best.detailsUrl, '_blank')}
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                </article>

                {rest.length > 0 && (
                  <div className="sm-card-grid">
                    {rest.map((r) => (
                      <article className="sm-card" key={r.resourceId}>
                        {r.image && (
                          <div className="sm-card-image">
                            <img src={r.image} alt={r.name} />
                          </div>
                        )}

                        <div className="sm-card-body">
                          <div className="sm-card-top">
                            <div>
                              <h3>{r.name}</h3>
                              {r.institution && <p className="sm-card-id">{r.institution}</p>}
                            </div>
                            <div className={`sm-score sm-score-${scoreTier(r.matchScore)}`}>
                              <span>{Math.round(r.matchScore)}%</span>
                              <small>match</small>
                            </div>
                          </div>

                          <div className="sm-card-meta">
                            <span>{r.category}</span>
                          </div>

                          <ResourceFacts r={r} />

                          <button
                            type="button"
                            className="sm-details-button sm-details-button-outline"
                            onClick={() => r.detailsUrl && window.open(r.detailsUrl, '_blank')}
                          >
                            View Details
                          </button>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </>
            )}
          </section>
        )}
      </div>
    </main>
  );
}

export default SmartMatch;
