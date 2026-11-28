import { useEffect, useMemo, useState } from "react";
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  Check,
  CheckCircle2,
  CircleHelp,
  Clock3,
  FileCheck2,
  FileDown,
  FileText,
  Landmark,
  LockKeyhole,
  Menu,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  X,
  Zap,
} from "lucide-react";

const STEPS = [
  "Your complaint",
  "Recommended route",
  "Your application",
  "Next steps",
];

const EXAMPLES = [
  "My electricity bill suddenly doubled",
  "Gas pressure has been very low",
  "I need a correction on my NADRA card",
];

const COMPLAINT_LANGUAGES = ["اردو", "Roman Urdu", "English"];

const EXAMPLES_BY_LANGUAGE = {
  اردو: [
    "میرا بجلی کا بل اچانک بہت زیادہ آ گیا ہے۔",
    "گیس کا پریشر بہت کم ہے۔",
    "مجھے نادرا ریکارڈ میں درستگی کروانی ہے۔",
  ],
  "Roman Urdu": [
    "Mera bijli ka bill achanak bohat zyada aa gaya hai.",
    "Gas ka pressure bohat kam hai.",
    "Mujhe NADRA record mein correction karwani hai.",
  ],
  English: EXAMPLES,
};

const SERVICE_PROMPTS = {
  electricity: EXAMPLES_BY_LANGUAGE["Roman Urdu"][0],
  gas: EXAMPLES_BY_LANGUAGE["Roman Urdu"][1],
  nadra: EXAMPLES_BY_LANGUAGE["Roman Urdu"][2],
};

const SERVICES = [
  {
    key: "electricity",
    icon: Zap,
    title: "Electricity",
    description: "Bills, meter readings, outages",
    tone: "sun",
  },
  {
    key: "gas",
    icon: Sparkles,
    title: "Gas",
    description: "Supply, billing, connections",
    tone: "sky",
  },
  {
    key: "nadra",
    icon: Landmark,
    title: "NADRA",
    description: "Identity records and services",
    tone: "rose",
  },
];

async function request(path, options = {}) {
  const response = await fetch(path, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });
  if (!response.ok) {
    let message = `Request failed (${response.status})`;
    try {
      const body = await response.json();
      message = body.detail || message;
    } catch {
      // Keep the HTTP status as the actionable fallback.
    }
    throw new Error(message);
  }
  return response;
}

function Brand({ onClick }) {
  return (
    <button className="brand" onClick={onClick} aria-label="scomplain2resolve home">
      <span className="brand-mark">
        <MessageCircle size={21} strokeWidth={2.2} />
        <ArrowUpRight className="brand-arrow" size={12} strokeWidth={3} />
      </span>
      <span>
        <strong>scomplain2resolve</strong>
        <small>CIVIC GUIDE</small>
      </span>
    </button>
  );
}

function Header({ screen, setScreen, start, reset }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const inFlow = screen !== "home";
  return (
    <header className="site-header">
      <div className="header-inner">
        <Brand onClick={reset} />
        <nav className={menuOpen ? "main-nav open" : "main-nav"}>
          <a
            href="#how-it-works"
            onClick={() => {
              setMenuOpen(false);
              if (inFlow) reset();
            }}
          >
            How it works
          </a>
          <a
            href="#services"
            onClick={() => {
              setMenuOpen(false);
              if (inFlow) reset();
            }}
          >
            Services
          </a>
          <a
            href="#our-promise"
            onClick={() => {
              setMenuOpen(false);
              if (inFlow) reset();
            }}
          >
            Our promise
          </a>
        </nav>
        <div className="header-actions">
          <span className="language-chip">
            <span className="language-dot" /> اردو / EN
          </span>
          <button className="button button-dark header-cta" onClick={start}>
            Start a guide <ArrowRight size={16} />
          </button>
          <button
            className="menu-toggle"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X size={21} /> : <Menu size={21} />}
          </button>
        </div>
      </div>
    </header>
  );
}

function Home({ start, startForService }) {
  return (
    <>
      <main>
        <section className="hero page-width">
          <div className="hero-copy">
            <div className="eyebrow">
              <span className="eyebrow-line" /> A little help goes a long way
            </div>
            <h1>
              Make your next
              <br />
              step <span className="serif-accent">clear.</span>
            </h1>
            <p className="hero-description">
              Everyday complaints can be confusing. Tell us what happened and
              we’ll help you find the right department, prepare your documents,
              and write your application.
            </p>
            <div className="hero-actions">
              <button className="button button-primary button-large" onClick={start}>
                Get started <ArrowRight size={18} />
              </button>
              <button
                className="text-button"
                onClick={() =>
                  document
                    .getElementById("how-it-works")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
              >
                See how it works <ArrowDown size={16} />
              </button>
            </div>
            <div className="trust-line">
              <ShieldCheck size={17} />
              <span>No CNIC needed</span>
              <i />
              <span>Nothing is submitted</span>
            </div>
          </div>

          <div className="hero-art" aria-label="A preview of a complaint guide">
            <div className="art-shape art-shape-back" />
            <div className="art-shape art-shape-front" />
            <div className="orbit orbit-one" />
            <div className="orbit orbit-two" />
            <div className="art-note art-note-top">
              <span className="note-icon note-icon-yellow">
                <Zap size={18} />
              </span>
              <span>
                <b>Electricity bill</b>
                <small>We found your next step</small>
              </span>
              <CheckCircle2 className="note-check" size={19} />
            </div>
            <div className="art-file">
              <div className="file-topline">
                <span className="file-dot" />
                <span className="file-dot" />
                <span className="file-dot" />
                <small>YOUR GUIDE</small>
              </div>
              <div className="file-icon">
                <FileText size={23} />
              </div>
              <div className="file-lines">
                <i className="file-line-long" />
                <i />
                <i className="file-line-short" />
              </div>
              <div className="file-footer">
                <BadgeCheck size={15} /> Official route, explained
              </div>
            </div>
            <div className="art-step">
              <span className="art-step-icon">
                <Check size={15} />
              </span>
              <span>
                <b>One clear step at a time</b>
                <small>From complaint to application</small>
              </span>
            </div>
            <span className="art-sparkle sparkle-a">✳</span>
            <span className="art-sparkle sparkle-b">✳</span>
            <div className="art-caption">
              <span>01</span> A calmer way to handle the hard stuff
            </div>
          </div>
        </section>

        <section className="service-band" id="services">
          <div className="page-width service-band-inner">
            <div className="service-intro">
              <div className="eyebrow eyebrow-muted">Here to help with</div>
              <h2>Three everyday services.</h2>
            </div>
            <div className="service-cards">
              {SERVICES.map(({ key, icon: Icon, title, description, tone }) => (
                <button
                  className="service-card"
                  key={key}
                  onClick={() => startForService(key)}
                >
                  <span className={`service-icon ${tone}`}>
                    <Icon size={20} />
                  </span>
                  <span className="service-card-copy">
                    <b>{title}</b>
                    <small>{description}</small>
                  </span>
                  <ArrowUpRight className="service-arrow" size={17} />
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="how-section page-width" id="how-it-works">
          <div className="how-heading">
            <div className="eyebrow eyebrow-muted">Simple by design</div>
            <h2>From “what now?” to a plan.</h2>
            <p>No complicated forms. Just a few clear steps, at your pace.</p>
          </div>
          <div className="how-steps">
            {[
              ["01", "Tell us what happened", "Write it in Urdu, Roman Urdu, or English."],
              ["02", "Review your route", "See the authority, sources, and documents."],
              ["03", "Prepare your application", "Create a formal letter and a demo plan."],
            ].map(([number, title, description]) => (
              <article className="how-step" key={number}>
                <span className="how-number">{number}</span>
                <h3>{title}</h3>
                <p>{description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="promise-section" id="our-promise">
          <div className="page-width promise-inner">
            <div className="promise-mark">
              <LockKeyhole size={21} />
            </div>
            <div>
              <div className="eyebrow eyebrow-light">A promise, not fine print</div>
              <h2>Your information stays yours.</h2>
              <p>
                No CNIC, phone number, or bill uploads required. Your guide is
                just that—a guide. We never submit anything to a department.
              </p>
            </div>
            <button className="button button-light" onClick={start}>
              Try it for yourself <ArrowRight size={16} />
            </button>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

function Progress({ active }) {
  return (
    <div className="progress">
      {STEPS.map((step, index) => {
        const number = index + 1;
        const state = number < active ? "done" : number === active ? "active" : "";
        return (
          <div className={`progress-step ${state}`} key={step}>
            <span className="progress-number">
              {number < active ? <Check size={14} /> : `0${number}`}
            </span>
            <span className="progress-name">{step}</span>
            {index < STEPS.length - 1 && <span className="progress-line" />}
          </div>
        );
      })}
    </div>
  );
}

function FlowLayout({ active, back, children }) {
  return (
    <main className="flow-page page-width">
      <button className="back-link" onClick={back}>
        <ArrowLeft size={16} /> Back
      </button>
      <Progress active={active} />
      {children}
    </main>
  );
}

function Intake({ complaint, setComplaint, complaintLanguage, setComplaintLanguage, useAi, setUseAi, aiAvailable, onAnalyze, busy, error, back }) {
  const remaining = 1200 - complaint.length;
  return (
    <FlowLayout active={1} back={back}>
      <section className="flow-panel intake-panel">
        <div className="flow-copy">
          <div className="eyebrow">
            <span className="eyebrow-line" /> STEP 1 · YOUR STORY
          </div>
          <h1>What’s been<br />going on?</h1>
          <p>
            Tell us in your own words. A few sentences are enough to get
            started.
          </p>
          <div className="complaint-language">
            <span className="field-label">I’ll write in</span>
            <div className="language-switch" role="group" aria-label="Complaint language">
              {COMPLAINT_LANGUAGES.map((option) => (
                <button
                  type="button"
                  className={complaintLanguage === option ? "chosen" : ""}
                  key={option}
                  aria-pressed={complaintLanguage === option}
                  onClick={() => setComplaintLanguage(option)}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="complaint-box">
          <label htmlFor="complaint">Your complaint</label>
          <textarea
            id="complaint"
            maxLength={1200}
            rows={5}
            placeholder={EXAMPLES_BY_LANGUAGE[complaintLanguage][0]}
            dir={complaintLanguage === "اردو" ? "rtl" : "ltr"}
            lang={complaintLanguage === "اردو" ? "ur" : complaintLanguage === "English" ? "en" : "ur-Latn"}
            value={complaint}
            onChange={(event) => setComplaint(event.target.value)}
            autoFocus
          />
          <div className="textarea-meta">
            <span>Write how you’d explain it to someone you trust.</span>
            <span>{remaining}</span>
          </div>
          <div className="example-row">
            <span>Need a starting point?</span>
            {EXAMPLES_BY_LANGUAGE[complaintLanguage].map((example) => (
              <button key={example} onClick={() => setComplaint(example)}>
                {example}
              </button>
            ))}
          </div>
          {aiAvailable ? (
            <label className="ai-toggle">
              <input
                type="checkbox"
                checked={useAi}
                onChange={(event) => setUseAi(event.target.checked)}
              />
              <span className="toggle-box"><Check size={12} /></span>
              <span>
                <b>Allow optional AI backup</b>
                <small>Only used if local matching can’t identify the service.</small>
              </span>
              <CircleHelp size={16} />
            </label>
          ) : (
            <div className="local-only-note"><ShieldCheck size={14} /> Local-only matching is active. No complaint text is sent to an AI service.</div>
          )}
          {error && <div className="error-message">{error}</div>}
          <div className="panel-footer">
            <p><LockKeyhole size={14} /> Please don’t include CNIC, phone, or account numbers.</p>
            <button
              className="button button-primary button-large"
              onClick={onAnalyze}
              disabled={busy || complaint.trim().length < 5}
            >
              {busy ? "Finding your route..." : "Find my next step"}
              {!busy && <ArrowRight size={17} />}
            </button>
          </div>
        </div>
      </section>
      <aside className="flow-aside">
        <div className="aside-icon"><ShieldCheck size={20} /></div>
        <div>
          <b>A little reassurance</b>
          <p>Your story is only used to suggest a route. No complaint is sent anywhere.</p>
        </div>
      </aside>
    </FlowLayout>
  );
}

function ResultScreen({ result, checklist, setChecklist, onDownloadChecklist, onNext, back, error }) {
  const department = result.department;
  const analysis = result.analysis;
  const checkedCount = Object.values(checklist).filter(Boolean).length;
  const firstStep = department.escalation_steps[0];
  return (
    <FlowLayout active={2} back={back}>
      <div className="result-heading">
        <div>
          <div className="eyebrow"><span className="eyebrow-line" /> STEP 2 · YOUR ROUTE</div>
          <h1>Here’s where to start.</h1>
          <p>We matched your complaint to the route below. Review it before moving on.</p>
        </div>
        <div className="verified-chip"><BadgeCheck size={16} /> From our verified guide</div>
      </div>
      <div className="result-grid">
        <section className="route-panel">
          <div className="route-topline">
            <span className={`service-icon ${SERVICES.find((item) => item.key === analysis.category)?.tone}`}>
              {analysis.category === "electricity" ? <Zap size={20} /> : analysis.category === "gas" ? <Sparkles size={20} /> : <Landmark size={20} />}
            </span>
            <span className="category-name">{department.label}</span>
            <span className="match-label">{Math.round(analysis.confidence * 100)}% match*</span>
          </div>
          <h2>{analysis.issue === "billing dispute" ? "A billing concern" : analysis.issue === "service interruption" ? "A service concern" : "Your service request"}</h2>
          <p className="route-explainer">{department.scope_note}</p>
          <div className="detail-list">
            <div className="detail-row">
              <span className="detail-icon"><Landmark size={17} /></span>
              <span><small>Responsible route</small><b>{department.authority}</b></span>
            </div>
            <div className="detail-row">
              <span className="detail-icon"><FileCheck2 size={17} /></span>
              <span><small>Why we recommend it</small><b>{analysis.reason}</b></span>
            </div>
            <div className="detail-row">
              <span className="detail-icon"><ArrowUpRight size={17} /></span>
              <span><small>Official website</small><b className="portal-links">{department.official_portals.map((url) => <a key={url} href={url} target="_blank" rel="noreferrer">{new URL(url).hostname}</a>)}</b></span>
            </div>
          </div>
          <div className="first-action">
            <span className="action-number">01</span>
            <span><small>YOUR FIRST STEP</small><b>{firstStep.action}</b></span>
            <ArrowRight size={18} />
          </div>
          <p className="fine-print">*The match score is a simple keyword guide, not a probability or guarantee.</p>
        </section>

        <aside className="checklist-panel">
          <div className="checklist-title">
            <span className="checklist-icon"><FileText size={19} /></span>
            <span><b>What to prepare</b><small>{checkedCount} of {department.required_documents.length} checked</small></span>
            <button className="checklist-download" onClick={onDownloadChecklist}>
              <FileDown size={15} /> Download
            </button>
          </div>
          <p className="checklist-intro">Keep these handy for the official process. Don’t upload them here.</p>
          <div className="document-list">
            {department.required_documents.map((document, index) => (
              <label className={`document-item ${checklist[index] ? "selected" : ""}`} key={document}>
                <input
                  type="checkbox"
                  checked={Boolean(checklist[index])}
                  onChange={() => setChecklist((current) => ({ ...current, [index]: !current[index] }))}
                />
                <span className="document-check"><Check size={13} /></span>
                <span>{document}</span>
              </label>
            ))}
          </div>
          <div className="checklist-notice"><LockKeyhole size={15} /> Keep private IDs and bill numbers out of this demo.</div>
        </aside>
      </div>
      {error && <div className="error-message">{error}</div>}
      <div className="flow-bottom">
        <p><Clock3 size={15} /> Follow-up times are suggestions, not official deadlines.</p>
        <button className="button button-primary button-large" onClick={onNext}>
          Prepare my application <ArrowRight size={17} />
        </button>
      </div>
    </FlowLayout>
  );
}

function ApplicationScreen({ result, complaint, applicant, setApplicant, language, setLanguage, application, setApplication, previewIsCurrent, onGenerate, onDownload, busy, error, back }) {
  const department = result.department;
  return (
    <FlowLayout active={3} back={back}>
      <div className="result-heading">
        <div>
          <div className="eyebrow"><span className="eyebrow-line" /> STEP 3 · YOUR APPLICATION</div>
          <h1>Put it in writing.</h1>
          <p>We’ve started a formal letter for you. Add only the details you’re comfortable sharing.</p>
        </div>
        <div className="route-mini"><span className="mini-dot" /> {department.label}</div>
      </div>
      <div className="application-grid">
        <section className="app-details-panel">
          <div className="panel-heading">
            <span className="panel-step">A</span>
            <span><b>Your details</b><small>Optional, used only in this application</small></span>
          </div>
          <label className="field-label" htmlFor="applicant-name">Your name <span>optional</span></label>
          <input
            id="applicant-name"
            className="text-field"
            placeholder="e.g. Ayesha Khan"
            value={applicant.name}
            onChange={(event) => setApplicant({ ...applicant, name: event.target.value })}
          />
          <label className="field-label" htmlFor="applicant-address">Your address <span>optional</span></label>
          <textarea
            id="applicant-address"
            className="text-field address-field"
            placeholder="City or area is enough"
            rows={3}
            value={applicant.address}
            onChange={(event) => setApplicant({ ...applicant, address: event.target.value })}
          />
          <div className="privacy-note"><LockKeyhole size={15} /> Don’t enter CNIC, phone, or account numbers.</div>
          <label className="field-label">Letter language</label>
          <div className="language-switch">
            {["اردو", "English"].map((option) => (
              <button className={language === option ? "chosen" : ""} key={option} onClick={() => setLanguage(option)}>
                {option}
              </button>
            ))}
          </div>
          <p className={`preview-hint ${application && !previewIsCurrent ? "preview-stale" : ""}`}>
            {application && !previewIsCurrent
              ? "Your details changed. Refresh the preview before downloading the updated letter."
              : "After editing your details or language, refresh the preview to update the letter."}
          </p>
          <button className="button button-primary generate-button" onClick={onGenerate} disabled={busy}>
            {busy ? "Preparing your letter..." : application ? "Refresh letter preview" : "Create my letter"}
            <ArrowRight size={17} />
          </button>
        </section>
        <section className="letter-panel">
          <div className="letter-toolbar">
            <span><FileText size={17} /> APPLICATION PREVIEW</span>
            <span className="edit-tag">EDITABLE</span>
          </div>
          {application ? (
            <>
              <textarea
                className="letter-editor"
                value={application}
                onChange={(event) => setApplication(event.target.value)}
                aria-label="Editable application letter"
                dir={language === "اردو" ? "rtl" : "ltr"}
              />
              <div className="letter-actions">
                {error && <span className="error-inline">{error}</span>}
                <button className="button button-dark" onClick={onDownload} disabled={busy || !previewIsCurrent}>
                  <FileDown size={16} /> {busy ? "Creating PDF..." : "Download PDF"}
                </button>
              </div>
            </>
          ) : (
            <div className="letter-empty">
              <div className="empty-file"><FileText size={23} /></div>
              <b>Your letter will appear here</b>
              <p>Choose your language, then create a first draft. You can edit it before downloading.</p>
            </div>
          )}
        </section>
      </div>
      <button className="back-link bottom-back" onClick={back}><ArrowLeft size={15} /> Back to your route</button>
    </FlowLayout>
  );
}

function FinishScreen({ result, demo, onCreateDemo, busy, error, back, restart }) {
  const [copied, setCopied] = useState(false);
  const copyReference = async () => {
    await navigator.clipboard.writeText(demo.reference);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };
  return (
    <FlowLayout active={4} back={back}>
      <section className="finish-heading">
        <span className="finish-icon"><Check size={27} /></span>
        <div className="eyebrow"><span className="eyebrow-line" /> YOUR GUIDE IS READY</div>
        <h1>You’ve got a way forward.</h1>
        <p>Your application PDF is ready. Here are the next steps to take outside this demo.</p>
      </section>

      <div className="finish-grid">
        <section className="next-steps-panel">
          <div className="panel-heading">
            <span className="panel-step">01</span>
            <span><b>Your next steps</b><small>{result.department.label}</small></span>
          </div>
          <div className="ladder-list">
            {result.department.escalation_steps.map((step, index) => (
              <div className="ladder-item" key={`${step.after_working_days}-${step.action}`}>
                <span className={`ladder-node ${index === 0 ? "current" : ""}`}>{index === 0 ? <Check size={13} /> : `0${index + 1}`}</span>
                <span className="ladder-copy">
                  <small>{step.after_working_days === 0 ? "START HERE" : `AFTER ${step.after_working_days} WORKING DAYS`}</small>
                  <b>{step.action}</b>
                </span>
              </div>
            ))}
          </div>
          <div className="warning-note"><CircleHelp size={16} /> Follow-up periods are suggestions, not official deadlines. Check the authority’s current guidance.</div>
        </section>

        <aside className="demo-panel">
          <div className="demo-watermark">DEMO ONLY</div>
          {demo ? (
            <div className="demo-created">
              <span className="demo-success"><CheckCircle2 size={20} /></span>
              <small>YOUR DEMO REFERENCE</small>
              <div className="reference-code">{demo.reference}</div>
              <button className="copy-button" onClick={copyReference}>{copied ? <Check size={14} /> : <FileText size={14} />}{copied ? "Copied" : "Copy reference"}</button>
              <p>No government department was contacted. This number is only for the hackathon demo.</p>
              <div className="demo-timeline">
                {demo.timeline.map((item) => (
                  <div className="timeline-row" key={item.event}>
                    <span className={item.status === "complete" ? "timeline-dot complete" : "timeline-dot"} />
                    <span><b>{item.event}</b><small>{item.status}</small></span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="demo-create">
              <span className="demo-icon"><Sparkles size={20} /></span>
              <div className="eyebrow eyebrow-light">HACKATHON DEMO</div>
              <h2>Want a demo reference?</h2>
              <p>Create a temporary reference to see how a status timeline could work. This does not submit your complaint.</p>
              {error && <div className="error-message">{error}</div>}
              <button className="button button-light" onClick={onCreateDemo} disabled={busy}>
                {busy ? "Creating..." : "Create demo reference"} <ArrowRight size={16} />
              </button>
            </div>
          )}
        </aside>
      </div>
      <div className="finish-footer">
        <span><ShieldCheck size={16} /> Your details aren’t saved in an account.</span>
        <button className="text-button" onClick={restart}>Start a new guide <ArrowRight size={15} /></button>
      </div>
    </FlowLayout>
  );
}

function Footer() {
  return (
    <footer className="site-footer">
      <div className="page-width footer-inner">
        <span>© 2026 scomplain2resolve</span>
        <span>Guidance, not legal advice. Verify details with official sources.</span>
        <a href="#our-promise">Privacy promise <ArrowUpRight size={13} /></a>
      </div>
    </footer>
  );
}

export default function App() {
  const [screen, setScreen] = useState("home");
  const [complaint, setComplaint] = useState("");
  const [complaintLanguage, setComplaintLanguage] = useState("Roman Urdu");
  const [useAi, setUseAi] = useState(false);
  const [aiAvailable, setAiAvailable] = useState(false);
  const [result, setResult] = useState(null);
  const [checklist, setChecklist] = useState({});
  const [applicant, setApplicant] = useState({ name: "", address: "" });
  const [language, setLanguage] = useState("اردو");
  const [application, setApplication] = useState("");
  const [applicationDetailsKey, setApplicationDetailsKey] = useState("");
  const [demo, setDemo] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const issueCategory = useMemo(() => result?.analysis?.category, [result]);
  const currentApplicationDetailsKey = JSON.stringify({
    complaint,
    category: issueCategory,
    name: applicant.name,
    address: applicant.address,
    language,
  });
  const previewIsCurrent = Boolean(application) && applicationDetailsKey === currentApplicationDetailsKey;

  useEffect(() => {
    request("/api/health")
      .then((response) => response.json())
      .then((health) => setAiAvailable(health.ai_available === "true"))
      .catch(() => setAiAvailable(false));
  }, []);

  const start = (category) => {
    setComplaint(SERVICE_PROMPTS[category] || "");
    setComplaintLanguage("Roman Urdu");
    setUseAi(false);
    setResult(null);
    setChecklist({});
    setApplicant({ name: "", address: "" });
    setLanguage("اردو");
    setApplication("");
    setApplicationDetailsKey("");
    setDemo(null);
    setError("");
    setScreen("intake");
    window.location.hash = "guide";
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const reset = () => {
    setScreen("home");
    setResult(null);
    setComplaint("");
    setComplaintLanguage("Roman Urdu");
    setUseAi(false);
    setChecklist({});
    setApplicant({ name: "", address: "" });
    setLanguage("اردو");
    setApplication("");
    setApplicationDetailsKey("");
    setDemo(null);
    setError("");
    window.location.hash = "";
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const analyzeComplaint = async () => {
    setBusy(true);
    setError("");
    try {
      const response = await request("/api/analyze", {
        method: "POST",
        body: JSON.stringify({ complaint, use_ai: useAi }),
      });
      const data = await response.json();
      if (!data.analysis.category || !data.department) {
        setError(data.analysis.reason || "Please add a little more detail.");
        return;
      }
      setResult(data);
      setChecklist({});
      setScreen("result");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  };

  const makeApplication = async () => {
    setBusy(true);
    setError("");
    try {
      const response = await request("/api/application", {
        method: "POST",
        body: JSON.stringify({
          complaint,
          category: issueCategory,
          applicant_name: applicant.name,
          applicant_address: applicant.address,
          language,
        }),
      });
      const data = await response.json();
      setApplication(data.application);
      setApplicationDetailsKey(currentApplicationDetailsKey);
      setScreen("application");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  };

  const downloadPdf = async () => {
    if (!previewIsCurrent) {
      setError("Refresh the letter preview before downloading.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const response = await request("/api/pdf", {
        method: "POST",
        body: JSON.stringify({ application, language }),
      });
      const blob = await response.blob();
      const href = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = href;
      link.download = "scomplain2resolve-application.pdf";
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(href), 1000);
      setScreen("finish");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  };

  const downloadChecklist = () => {
    const department = result.department;
    const lines = [
      `${department.label} complaint checklist`,
      "",
      `Responsible route: ${department.authority}`,
      "",
      "Documents to prepare:",
      ...department.required_documents.map((document) => `- ${document}`),
      "",
      `Submission guidance: ${department.submission_channel}`,
      "",
      "Suggested follow-up steps (not official deadlines):",
      ...department.escalation_steps.map(
        (step) => `- ${step.after_working_days === 0 ? "Start now" : `After ${step.after_working_days} working days`}: ${step.action}`,
      ),
      "",
      "Guidance only, not legal advice. Verify current details with official sources.",
      "This checklist was prepared by scomplain2resolve. Nothing was submitted.",
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8" });
    const href = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = href;
    link.download = `scomplain2resolve-${department.label.toLowerCase()}-checklist.txt`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(href), 1000);
  };

  const createDemo = async () => {
    setBusy(true);
    setError("");
    try {
      const response = await request("/api/demo", {
        method: "POST",
        body: JSON.stringify({ category: issueCategory }),
      });
      setDemo(await response.json());
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  };

  const beginAgain = () => {
    setScreen("intake");
    setComplaint("");
    setComplaintLanguage("Roman Urdu");
    setUseAi(false);
    setResult(null);
    setChecklist({});
    setApplicant({ name: "", address: "" });
    setLanguage("اردو");
    setApplication("");
    setApplicationDetailsKey("");
    setDemo(null);
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const flow = screen !== "home";
  return (
    <div className="app-shell">
      <Header
        screen={screen}
        setScreen={setScreen}
        start={() => start()}
        reset={reset}
      />
      {screen === "home" && (
        <Home
          start={() => start()}
          startForService={start}
        />
      )}
      {screen === "intake" && (
        <Intake
          complaint={complaint}
          setComplaint={setComplaint}
          complaintLanguage={complaintLanguage}
          setComplaintLanguage={setComplaintLanguage}
          useAi={useAi}
          setUseAi={setUseAi}
          aiAvailable={aiAvailable}
          onAnalyze={analyzeComplaint}
          busy={busy}
          error={error}
          back={reset}
        />
      )}
      {screen === "result" && result && (
        <ResultScreen
          result={result}
          checklist={checklist}
          setChecklist={setChecklist}
          onDownloadChecklist={downloadChecklist}
          onNext={makeApplication}
          back={() => setScreen("intake")}
          error={error}
        />
      )}
      {screen === "application" && result && (
        <ApplicationScreen
          result={result}
          complaint={complaint}
          applicant={applicant}
          setApplicant={setApplicant}
          language={language}
          setLanguage={setLanguage}
          application={application}
          setApplication={setApplication}
          previewIsCurrent={previewIsCurrent}
          onGenerate={makeApplication}
          onDownload={downloadPdf}
          busy={busy}
          error={error}
          back={() => setScreen("result")}
        />
      )}
      {screen === "finish" && result && (
        <FinishScreen
          result={result}
          demo={demo}
          onCreateDemo={createDemo}
          busy={busy}
          error={error}
          back={() => setScreen("application")}
          restart={beginAgain}
        />
      )}
      {flow && <Footer />}
    </div>
  );
}
