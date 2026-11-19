import { useMemo, useState } from "react";
import {
  Activity, ArrowDownRight, ArrowRight, Bell, BriefcaseBusiness, Check, CheckCircle2,
  ChevronDown, CircleHelp, Clock3, FileCheck2, FileText, Filter, GraduationCap,
  HeartHandshake, Home, Landmark, LayoutDashboard, Menu, MessageCircle, Search,
  ShieldCheck, Sparkles, UserRound, WalletCards, X
} from "lucide-react";
import { customerTimeline, reviewCases, type CaseStatus, type ReviewCase } from "./data/fixtures";

type Mode = "customer" | "operations";
const statuses: CaseStatus[] = ["Needs review", "In progress", "Waiting for customer", "Completed"];

function StatusPill({ status }: { status: CaseStatus }) {
  const cls = status === "Needs review" ? "amber" : status === "Completed" ? "green" : status === "In progress" ? "blue" : "slate";
  return <span className={"status-pill " + cls}><span className="status-dot" />{status}</span>;
}

function Brand() {
  return <div className="brand"><span className="brand-mark"><Landmark size={19} strokeWidth={1.8} /></span><span>northline<span className="brand-period">.</span></span></div>;
}

function App() {
  const [mode, setMode] = useState<Mode>(window.location.pathname === "/operations" ? "operations" : "customer");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"All" | CaseStatus>("All");
  const [selected, setSelected] = useState<ReviewCase>(reviewCases[0]);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notice, setNotice] = useState("");

  const filteredCases = useMemo(() => reviewCases.filter((item) => {
    const matchesText = [item.customer, item.product, item.reference, item.stage].join(" ").toLowerCase().includes(query.toLowerCase());
    return matchesText && (filter === "All" || item.status === filter);
  }), [query, filter]);

  function changeMode(next: Mode) {
    setMode(next);
    setMobileOpen(false);
    setNotice("");
    window.history.replaceState({}, "", next === "operations" ? "/operations" : "/");
  }

  const navNotice = (message: string) => { setNotice(message); setMobileOpen(false); };

  return (
    <div className="app-frame">
      <aside className={mobileOpen ? "sidebar sidebar-open" : "sidebar"}>
        <div className="sidebar-top"><Brand /><button className="icon-button mobile-close" aria-label="Close navigation" onClick={() => setMobileOpen(false)}><X size={19} /></button></div>
        <div className="workspace-label">WORKSPACE</div>
        <button className={mode === "customer" ? "workspace-switch selected" : "workspace-switch"} onClick={() => changeMode("customer")}><span className="nav-icon"><UserRound size={17} /></span><span>Customer space</span><ChevronDown size={15} /></button>
        <nav className="side-nav" aria-label="Primary navigation">
          {mode === "customer" ? <>
            <span className="nav-section">YOUR ACCOUNT</span>
            <button className="nav-item active" aria-current="page"><Home size={17} />Overview</button>
            <button className="nav-item" onClick={() => navNotice("The product catalogue will be connected to approved product and eligibility services in a later stage.")}><Landmark size={17} />Explore loans</button>
            <button className="nav-item" onClick={() => navNotice("Your application records will appear here after secure customer sign-in and application services are implemented.")}><FileText size={17} />My applications</button>
            <button className="nav-item" onClick={() => navNotice("Loan servicing and payment history are not connected in this preview.")}><WalletCards size={17} />My loans</button>
            <button className="nav-item" onClick={() => navNotice("Secure document storage is planned. This preview does not collect or store personal documents.")}><FileCheck2 size={17} />Documents</button>
            <span className="nav-section nav-section-spaced">HELP & SETTINGS</span>
            <button className="nav-item" onClick={() => navNotice("Support conversations will be available when the secure support service is implemented.")}><CircleHelp size={17} />Help centre</button>
            <button className="nav-item" onClick={() => navNotice("Profile and security controls require the customer identity service, which is not connected yet.")}><ShieldCheck size={17} />Security & profile</button>
          </> : <>
            <span className="nav-section">OPERATIONS</span>
            <button className="nav-item active" aria-current="page"><LayoutDashboard size={17} />Case overview</button>
            <button className="nav-item" onClick={() => navNotice("The customer directory will be connected to authenticated customer services in a later stage.")}><UserRound size={17} />Customers</button>
            <button className="nav-item" onClick={() => navNotice("Product administration is not part of this presentation-only portal increment.")}><BriefcaseBusiness size={17} />Loan products</button>
            <button className="nav-item" onClick={() => navNotice("Financial operations are not implemented in this preview. No payment or balance action is available.")}><Activity size={17} />Financial operations</button>
            <span className="nav-section nav-section-spaced">CONTROL</span>
            <button className="nav-item" onClick={() => navNotice("Staff access controls will be connected after identity and authorization services are implemented.")}><ShieldCheck size={17} />Access & audit</button>
          </>}
        </nav>
        <div className="sidebar-bottom">
          <div className="help-card"><span className="help-icon"><CircleHelp size={17} /></span><div><strong>Here when you need us</strong><small>Guidance and support</small></div><ArrowRight size={15} /></div>
          <div className="profile-mini"><div className="avatar">{mode === "customer" ? "SC" : "SO"}</div><div className="profile-copy"><strong>{mode === "customer" ? "Sample customer" : "Sample operator"}</strong><small>{mode === "customer" ? "Customer preview" : "Operations preview"}</small></div><ChevronDown size={15} /></div>
        </div>
      </aside>
      {mobileOpen && <button className="scrim" aria-label="Close navigation overlay" onClick={() => setMobileOpen(false)} />}
      <main className="main-area">
        <header className="topbar">
          <button className="icon-button mobile-menu" aria-label="Open navigation" onClick={() => setMobileOpen(true)}><Menu size={20} /></button>
          <div className="breadcrumb"><span>Northline</span><span className="crumb-separator">/</span><strong>{mode === "customer" ? "Your overview" : "Case overview"}</strong></div>
          <div className="topbar-actions"><span className="preview-label"><span />Illustrative preview</span><button className="icon-button notification-button" aria-label="Notifications" onClick={() => navNotice("Notifications are illustrative in this preview; no live inbox is connected.")}><Bell size={18} /><i /></button><div className="top-avatar">{mode === "customer" ? "SC" : "SO"}</div></div>
        </header>
        <div className="content-wrap">
          <div className="mode-switch" role="group" aria-label="Preview workspace"><button className={mode === "customer" ? "mode-active" : ""} onClick={() => changeMode("customer")}>Customer view</button><button className={mode === "operations" ? "mode-active" : ""} onClick={() => changeMode("operations")}>Operations view</button></div>
          {notice && <div className="notice-banner" role="status"><span>{notice}</span><button aria-label="Dismiss notice" onClick={() => setNotice("")}><X size={16} /></button></div>}
          {mode === "customer" ? <CustomerView onNotice={setNotice} /> : <OperationsView query={query} setQuery={setQuery} filter={filter} setFilter={setFilter} cases={filteredCases} selected={selected} setSelected={setSelected} onNotice={setNotice} />}
          <footer className="page-footer"><span>Northline is a product concept for a lending platform.</span><span>Illustrative interface · No live financial services</span></footer>
        </div>
      </main>
    </div>
  );
}

function CustomerView({ onNotice }: { onNotice: (message: string) => void }) {
  const dateLabel = new Intl.DateTimeFormat("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(new Date());
  const stepsComplete = customerTimeline.filter((item) => item.done).length;

  return <section className="customer-page">
    <div className="customer-intro"><div><div className="eyebrow">{dateLabel.toUpperCase()}</div><h1>Your financial life,<br className="desktop-break" /> in clearer view.</h1><p>A secure place to follow your journey, understand your options and find the right next step.</p></div><div className="intro-trust"><span className="trust-icon"><ShieldCheck size={21} /></span><div><strong>Designed around you</strong><small>Private, clear and considered</small></div></div></div>

    <section className="customer-hero" aria-label="Welcome to your financial workspace">
      <div className="hero-copy"><span className="hero-kicker"><Sparkles size={14} /> YOUR NORTHLINE SPACE</span><h2>Good decisions<br />start with clarity.</h2><p>Keep your application, important documents and helpful guidance together in one thoughtfully designed space.</p><div className="hero-actions"><button className="button-primary" onClick={() => onNotice("The product catalogue will show verified product terms and country eligibility once the product API is connected.")}>Explore loan options <ArrowRight size={16} /></button><button className="button-quiet-light" onClick={() => onNotice("Application details will be available after secure customer sign-in and application services are connected.")}>Track an application</button></div><div className="hero-footnote"><ShieldCheck size={14} /> Clear information. No pressure to apply.</div></div>
      <div className="hero-visual"><img src="/images/customer-adviser.jpg" alt="A customer speaking with a financial adviser in a bright, welcoming office" /><div className="image-caption"><span className="caption-mark"><HeartHandshake size={17} /></span><div><strong>Support at every step</strong><small>Helpful guidance, when you need it</small></div></div><span className="hero-image-wash" /></div>
    </section>

    <div className="sample-notice"><span className="sample-mark"><CheckCircle2 size={16} /></span><div><strong>Illustrative customer workspace</strong><p>Everything below uses fictional sample information. No real account, loan, balance or application is connected.</p></div><span className="sample-tag">SAMPLE DATA</span></div>

    <div className="overview-strip">
      <article className="overview-tile"><span className="overview-icon blue"><FileCheck2 size={19} /></span><div className="overview-copy"><small>APPLICATION JOURNEY</small><strong>In review</strong><span>Sample application · SAMPLE-001</span></div><span className="tile-chevron"><ArrowRight size={16} /></span></article>
      <article className="overview-tile"><span className="overview-icon gold"><Clock3 size={19} /></span><div className="overview-copy"><small>NEXT STEP</small><strong>Review information</strong><span>Illustrative workflow step</span></div><span className="tile-chevron"><ArrowRight size={16} /></span></article>
      <article className="overview-tile"><span className="overview-icon green"><MessageCircle size={19} /></span><div className="overview-copy"><small>HELP & GUIDANCE</small><strong>We're here to help</strong><span>Find answers and support</span></div><span className="tile-chevron"><ArrowRight size={16} /></span></article>
    </div>

    <div className="customer-main-grid">
      <section className="panel journey-panel">
        <div className="panel-heading"><div><span className="eyebrow">YOUR JOURNEY</span><h2>Application progress</h2><p className="panel-subtitle">A simple view of the steps in your sample application.</p></div><span className="quiet-tag">Sample journey</span></div>
        <div className="journey-summary"><div className="journey-icon"><FileCheck2 size={20} /></div><div className="journey-title"><strong>Personal loan application</strong><span>Reference: SAMPLE-APP-001</span></div><span className="journey-status">In review</span></div>
        <div className="progress-heading"><span>Journey progress</span><strong>{stepsComplete} of {customerTimeline.length} steps shown complete</strong></div>
        <div className="progress-track"><span style={{ width: Math.round((stepsComplete / Math.max(customerTimeline.length, 1)) * 100) + "%" }} /></div>
        <div className="timeline">{customerTimeline.map((item, i) => <div className={item.done ? "timeline-row timeline-done" : "timeline-row"} key={item.title}><div className="timeline-marker">{item.done ? <Check size={15} /> : <span>{i + 1}</span>}</div><div className="timeline-copy"><strong>{item.title}</strong><p>{item.detail}</p></div><time>{item.time}</time></div>)}</div>
        <button className="text-action" onClick={() => onNotice("Live application tracking will be enabled when the authenticated customer application API is implemented.")}>View application details <ArrowRight size={15} /></button>
      </section>
      <aside className="customer-side-stack">
        <section className="panel next-panel"><div className="next-panel-top"><span className="eyebrow">A HELPFUL NEXT STEP</span><span className="next-step-icon"><FileText size={18} /></span></div><div className="next-illustration"><div className="doc-illustration"><FileCheck2 size={30} /><span /></div><span className="illustration-orbit orbit-a" /><span className="illustration-orbit orbit-b" /><span className="illustration-spark spark-a">✦</span><span className="illustration-spark spark-b">✧</span></div><h2>Keep everything in one place.</h2><p>When connected, you can review document requests and share supporting information through a secure process.</p><button className="button-outline full-button" onClick={() => onNotice("Secure document upload is planned. This preview does not collect or store personal documents.")}>How document requests work <ArrowRight size={15} /></button></section>
        <section className="security-card"><span className="security-icon"><ShieldCheck size={19} /></span><div><strong>Your privacy matters</strong><p>Personal information should only be shared through verified, secure channels.</p><button onClick={() => onNotice("Privacy, consent and security controls will be documented and connected before live customer onboarding.")}>Our security approach <ArrowRight size={13} /></button></div></section>
      </aside>
    </div>

    <section className="product-discovery">
      <div className="section-intro"><div><span className="eyebrow">EXPLORE POSSIBILITIES</span><h2>Finance for life's next chapter.</h2><p>Learn about different types of finance and the information to compare before making a decision.</p></div><button className="text-action" onClick={() => onNotice("The loan catalogue is not connected yet. No live offers, rates or eligibility decisions are displayed.")}>How loan options work <ArrowRight size={15} /></button></div>
      <div className="product-card-grid">
        <article className="product-card"><div className="product-art"><img src="/images/personal-finance.svg" alt="" /></div><div className="product-card-copy"><span className="product-label"><WalletCards size={14} /> PERSONAL</span><h3>Personal finance</h3><p>Understand common borrowing options for everyday plans and expenses.</p><button onClick={() => onNotice("Personal finance information will be backed by published product terms and your country's eligibility rules.")}>Explore the basics <ArrowRight size={14} /></button></div></article>
        <article className="product-card"><div className="product-art"><img src="/images/education-finance.svg" alt="" /></div><div className="product-card-copy"><span className="product-label"><GraduationCap size={14} /> EDUCATION</span><h3>Education finance</h3><p>Learn how education funding can differ by course, provider and location.</p><button onClick={() => onNotice("Education finance information will be displayed only where a supported product and jurisdiction are available.")}>Explore the basics <ArrowRight size={14} /></button></div></article>
        <article className="product-card"><div className="product-art"><img src="/images/home-finance.svg" alt="" /></div><div className="product-card-copy"><span className="product-label"><Home size={14} /> HOME & PROPERTY</span><h3>Home finance</h3><p>Compare the structure, costs and obligations of property finance.</p><button onClick={() => onNotice("Home finance terms and eligibility depend on local law, lender policy and property requirements.")}>Explore the basics <ArrowRight size={14} /></button></div></article>
        <article className="product-card"><div className="product-art"><img src="/images/business-finance.svg" alt="" /></div><div className="product-card-copy"><span className="product-label"><BriefcaseBusiness size={14} /> BUSINESS</span><h3>Business finance</h3><p>Discover finance concepts for working capital, equipment and growth.</p><button onClick={() => onNotice("Business finance options will appear only after product, country and regulatory checks are in place.")}>Explore the basics <ArrowRight size={14} /></button></div></article>
      </div>
      <p className="discovery-disclaimer">Illustrative categories only. Availability, eligibility, rates, fees and repayment terms must be confirmed from current, country-specific product disclosures.</p>
    </section>

    <div className="lower-grid">
      <section className="panel activity-panel"><div className="panel-heading"><div><span className="eyebrow">RECENT UPDATES</span><h2>Latest activity</h2><p className="panel-subtitle">A quick look at the activity in this sample workspace.</p></div><span className="quiet-tag">Sample</span></div><div className="activity-row"><span className="activity-icon"><FileText size={17} /></span><div><strong>Application received</strong><small>Sample application was added to the preview.</small></div><time>Today</time></div><div className="activity-row"><span className="activity-icon"><Clock3 size={17} /></span><div><strong>Initial review pending</strong><small>No lending decision has been made.</small></div><time>Today</time></div><button className="text-action" onClick={() => onNotice("A full activity history will be available after the customer event and notification services are implemented.")}>View activity history <ArrowRight size={15} /></button></section>
      <section className="support-panel"><div className="support-art"><div className="support-ring"><HeartHandshake size={28} /></div><span className="support-star star-one">✦</span><span className="support-star star-two">✧</span></div><span className="eyebrow">HERE WHEN YOU NEED US</span><h2>Questions are part of the journey.</h2><p>Find clear answers about applications, documents and responsible borrowing.</p><button className="button-outline full-button" onClick={() => onNotice("The help centre and secure support messaging are planned for a later implementation stage.")}>Visit the help centre <ArrowRight size={15} /></button></section>
    </div>
  </section>;
}

function OperationsView({ query, setQuery, filter, setFilter, cases, selected, setSelected, onNotice }: {
  query: string; setQuery: (value: string) => void; filter: "All" | CaseStatus;
  setFilter: (value: "All" | CaseStatus) => void; cases: ReviewCase[];
  selected: ReviewCase; setSelected: (value: ReviewCase) => void; onNotice: (message: string) => void;
}) {
  return <section className="operations-page">
    <div className="page-heading operations-heading"><div><div className="eyebrow">OPERATIONS / CASE MANAGEMENT</div><h1>Review the evidence<br className="mobile-break" /> before you decide.</h1><p>A focused workspace for reviewing application cases and tracking the next action.</p></div><div className="heading-meta"><span className="meta-dot" /><span>Illustrative case queue</span></div></div>
    <div className="sample-notice"><span className="sample-mark"><ShieldCheck size={16} /></span><div><strong>Demonstration data only</strong><p>All names, references and statuses below are fictional. No approval, credit decision or financial transaction can be performed here.</p></div></div>
    <div className="ops-summary">
      <div className="summary-card"><span>Cases shown</span><strong>{reviewCases.length.toString().padStart(2, "0")}</strong><small><Activity size={13} /> Sample queue</small></div>
      <div className="summary-card"><span>Needs review</span><strong>{reviewCases.filter(c => c.status === "Needs review").length.toString().padStart(2, "0")}</strong><small><Clock3 size={13} /> Illustrative status</small></div>
      <div className="summary-card"><span>Waiting on customer</span><strong>{reviewCases.filter(c => c.status === "Waiting for customer").length.toString().padStart(2, "0")}</strong><small><ArrowDownRight size={13} /> Illustrative status</small></div>
    </div>
    <div className="ops-layout">
      <section className="panel case-list-panel"><div className="panel-heading case-list-heading"><div><span className="eyebrow">APPLICATION WORKSPACE</span><h2>Recent cases</h2></div><span className="quiet-tag">{cases.length} results</span></div><label className="search-box"><Search size={16} /><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search name, reference or product" aria-label="Search cases" /></label><div className="filter-row"><Filter size={14} /><select value={filter} onChange={e => setFilter(e.target.value as "All" | CaseStatus)} aria-label="Filter cases"><option value="All">All statuses</option>{statuses.map(s => <option key={s} value={s}>{s}</option>)}</select></div><div className="case-list">{cases.map(item => <button key={item.id} className={selected.id === item.id ? "case-row case-selected" : "case-row"} onClick={() => setSelected(item)}><div className="case-row-top"><strong>{item.customer}</strong><StatusPill status={item.status} /></div><span>{item.product}</span><div className="case-row-bottom"><small>{item.reference}</small><small>{item.updated}</small></div></button>)}{cases.length === 0 && <div className="empty-state"><Search size={22} /><strong>No matching cases</strong><span>Try another name, reference or status.</span></div>}</div></section>
      <section className="panel case-detail-panel"><div className="detail-top"><div><span className="eyebrow">CASE DETAIL</span><h2>{selected.customer}</h2><span className="detail-reference">{selected.reference}</span></div><StatusPill status={selected.status} /></div><p className="case-summary">{selected.summary}</p><div className="detail-facts"><div><span>Product</span><strong>{selected.product}</strong></div><div><span>Current stage</span><strong>{selected.stage}</strong></div><div><span>Assigned to</span><strong>{selected.owner}</strong></div><div><span>Last updated</span><strong>{selected.updated}</strong></div></div><div className="detail-section"><div className="detail-section-heading"><h3>Case timeline</h3><span>Sample record</span></div><div className="mini-timeline"><div className="mini-step complete"><i /><div><strong>Application submitted</strong><small>Sample record created</small></div></div><div className="mini-step current"><i /><div><strong>{selected.stage}</strong><small>Current illustrative stage</small></div></div><div className="mini-step"><i /><div><strong>Next review step</strong><small>Depends on configured workflow</small></div></div></div></div><div className="detail-section"><div className="detail-section-heading"><h3>Evidence checklist</h3><span>Illustrative only</span></div><div className="evidence-row"><FileCheck2 size={17} /><span><strong>Identity document</strong><small>Sample evidence item · not uploaded</small></span><span className="evidence-state">Not connected</span></div><div className="evidence-row"><FileText size={17} /><span><strong>Income or business evidence</strong><small>Sample evidence item · not uploaded</small></span><span className="evidence-state">Not connected</span></div></div><div className="detail-actions"><div><strong>Review controls</strong><small>Real decisions require authenticated staff, permissions and backend workflows.</small></div><button className="button-outline" onClick={() => onNotice("No decision was recorded. Approval and rejection controls will be enabled only after the protected underwriting API is implemented.")}>Decision controls unavailable</button></div></section>
    </div>
  </section>;
}

export default App;
