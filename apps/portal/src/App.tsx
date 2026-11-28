import { useEffect, useMemo, useState } from "react";
import {
  Activity, ArrowDownRight, ArrowRight, Banknote, Bell, BriefcaseBusiness, CheckCircle2, KeyRound,
  ChevronDown, CircleHelp, Clock3, FileCheck2, FileSearch, FileText, Filter,
  Globe2, HandCoins, Home, Landmark, LayoutDashboard, Menu, Search, Settings, ShieldCheck,
  SlidersHorizontal, UserRound, Users, WalletCards, Workflow, X
} from "lucide-react";
import { reviewCases, type CaseStatus, type ReviewCase } from "./data/fixtures";
import { CustomerExperience } from "./customer/CustomerExperience";
import type { CustomerSection } from "./customer/customer-data";
import type { CustomerApplicationApi } from "./customer/customer-api";

type Mode = "customer" | "operations";

function sectionFromPath(path: string): CustomerSection {
  const candidate = path.split("/")[2] as CustomerSection | undefined;
  return candidate && ["explore", "applications", "loans", "documents", "notifications", "help", "security"].includes(candidate) ? candidate : "overview";
}

const customerSectionLabels: Record<CustomerSection, string> = {
  overview: "Your overview",
  explore: "Explore loans",
  applications: "My applications",
  loans: "My loans",
  documents: "Documents",
  notifications: "Notifications",
  help: "Help centre",
  security: "Security & profile"
};

const statuses: CaseStatus[] = ["Needs review", "In progress", "Waiting for customer", "Completed"];

function StatusPill({ status }: { status: CaseStatus }) {
  const cls = status === "Needs review" ? "amber" : status === "Completed" ? "green" : status === "In progress" ? "blue" : "slate";
  return <span className={"status-pill " + cls}><span className="status-dot" />{status}</span>;
}

function Brand() {
  return <div className="brand-lockup"><div className="brand"><span className="brand-mark"><Landmark size={19} strokeWidth={1.8} /></span><span>northline<span className="brand-period">.</span></span></div><span className="brand-caption">FINANCIAL WORKSPACE</span></div>;
}

type AppProps = { applicationApi?: CustomerApplicationApi };

function App({ applicationApi }: AppProps = {}) {
  const [mode, setMode] = useState<Mode>(() => window.location.pathname === "/operations" ? "operations" : "customer");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"All" | CaseStatus>("All");
  const [selected, setSelected] = useState<ReviewCase>(reviewCases[0]);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notice, setNotice] = useState("");
  const [adminSettingsOpen, setAdminSettingsOpen] = useState(false);
  const [customerSection, setCustomerSection] = useState<CustomerSection>(() => sectionFromPath(window.location.pathname));

  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      setMode(path === "/operations" ? "operations" : "customer");
      setCustomerSection(sectionFromPath(path));
      setMobileOpen(false);
      setNotice("");
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const filteredCases = useMemo(() => reviewCases.filter((item) => {
    const matchesText = [item.customer, item.product, item.reference, item.stage].join(" ").toLowerCase().includes(query.toLowerCase());
    return matchesText && (filter === "All" || item.status === filter);
  }), [query, filter]);

  function changeMode(next: Mode) {
    setMode(next);
    setMobileOpen(false);
    setNotice("");
    setAdminSettingsOpen(false);
    if (next === "customer") setCustomerSection("overview");
    window.history.pushState({}, "", next === "operations" ? "/operations" : "/");
  }

  function changeCustomerSection(next: CustomerSection) {
    setCustomerSection(next);
    setMobileOpen(false);
    setNotice("");
    window.history.pushState({}, "", next === "overview" ? "/" : "/customer/" + next);
  }

  const navNotice = (message: string) => { setNotice(message); setMobileOpen(false); };

  return (
    <div className="app-frame">
      <aside className={mobileOpen ? "sidebar sidebar-open" : "sidebar"}>
        <div className="sidebar-top"><Brand /><button className="icon-button mobile-close" aria-label="Close navigation" onClick={() => setMobileOpen(false)}><X size={19} /></button></div>
        <div className="workspace-label">WORKSPACE</div>
        <button className={mode === "customer" ? "workspace-switch selected" : "workspace-switch"} onClick={() => changeMode("customer")}><span className="nav-icon"><UserRound size={17} /></span><span>Customer space</span><span className="workspace-preview-tag">DEMO</span><ChevronDown size={15} /></button>
        <nav className="side-nav" aria-label="Primary navigation">
          {mode === "customer" ? <>
            <span className="nav-section">YOUR ACCOUNT</span>
            <button className={customerSection === "overview" ? "nav-item active" : "nav-item"} aria-current={customerSection === "overview" ? "page" : undefined} onClick={() => changeCustomerSection("overview")}><Home size={17} />Overview</button>
            <button className={customerSection === "explore" ? "nav-item active" : "nav-item"} aria-current={customerSection === "explore" ? "page" : undefined} onClick={() => changeCustomerSection("explore")}><Landmark size={17} />Explore loans</button>
            <button className={customerSection === "applications" ? "nav-item active" : "nav-item"} aria-current={customerSection === "applications" ? "page" : undefined} onClick={() => changeCustomerSection("applications")}><FileText size={17} />My applications</button>
            <button className={customerSection === "loans" ? "nav-item active" : "nav-item"} aria-current={customerSection === "loans" ? "page" : undefined} onClick={() => changeCustomerSection("loans")}><WalletCards size={17} />My loans</button>
            <button className={customerSection === "documents" ? "nav-item active" : "nav-item"} aria-current={customerSection === "documents" ? "page" : undefined} onClick={() => changeCustomerSection("documents")}><FileCheck2 size={17} />Documents</button>
            <button className={customerSection === "notifications" ? "nav-item active" : "nav-item"} aria-current={customerSection === "notifications" ? "page" : undefined} onClick={() => changeCustomerSection("notifications")}><Bell size={17} />Notifications</button>
            <span className="nav-section nav-section-spaced">HELP & SETTINGS</span>
            <button className={customerSection === "help" ? "nav-item active" : "nav-item"} aria-current={customerSection === "help" ? "page" : undefined} onClick={() => changeCustomerSection("help")}><CircleHelp size={17} />Help centre</button>
            <button className={customerSection === "security" ? "nav-item active" : "nav-item"} aria-current={customerSection === "security" ? "page" : undefined} onClick={() => changeCustomerSection("security")}><ShieldCheck size={17} />Security & profile</button>
          </> : <>
            <span className="nav-section">OPERATIONS</span>
            <button className="nav-item active" aria-current="page"><LayoutDashboard size={17} />Case overview</button>
            <button className="nav-item" onClick={() => navNotice("Application management is mapped in the operations menu. Live records, assignment and decision controls are not connected in this preview.")}><FileText size={17} />Applications</button>
            <button className="nav-item" onClick={() => navNotice("Customer directory is a planned operations area. Customer records and personal information are not available in this preview.")}><Users size={17} />Customers</button>
            <button className="nav-item" onClick={() => navNotice("Loan account servicing is a planned area. No live loan balances, statements or account changes are available.")}><WalletCards size={17} />Loan accounts</button>
            <button className="nav-item" onClick={() => navNotice("Repayment monitoring is a planned area. No collections, payment processing or repayment status changes are available.")}><HandCoins size={17} />Repayments</button>

            <span className="nav-section nav-section-spaced">PRODUCT & WORKFLOWS</span>
            <button className="nav-item" onClick={() => navNotice("Loan product management is mapped here. Product publishing and customer-facing offer configuration are not connected.")}><BriefcaseBusiness size={17} />Loan products</button>
            <button className="nav-item" onClick={() => navNotice("Pricing and eligibility configuration is a planned control area. No rates, fees or eligibility decisions are configured by this preview.")}><SlidersHorizontal size={17} />Pricing & eligibility</button>
            <button className="nav-item" onClick={() => navNotice("Workflow and stage configuration is planned. Stage templates, customer-specific stages and task assignment are not yet active.")}><Workflow size={17} />Workflow & stages</button>

            <span className="nav-section nav-section-spaced">DOCUMENTS & COMPLIANCE</span>
            <button className="nav-item" onClick={() => navNotice("Document review is a planned area. Upload, storage, scanning and verification are disabled in this preview.")}><FileSearch size={17} />Document review</button>
            <button className="nav-item" onClick={() => navNotice("Identity and KYC verification are not active. Do not enter or upload identity information in this preview.")}><ShieldCheck size={17} />KYC & verification</button>
            <button className="nav-item" onClick={() => navNotice("Compliance case management is a planned area and is not connected to regulatory or customer records.")}><FileCheck2 size={17} />Compliance cases</button>

            <span className="nav-section nav-section-spaced">FINANCIAL OPERATIONS</span>
            <button className="nav-item" onClick={() => navNotice("Disbursement controls are not implemented. No funds can be transferred or released from this preview.")}><Banknote size={17} />Disbursements</button>
            <button className="nav-item" onClick={() => navNotice("Collections management is not implemented. No payment requests or collection actions can be performed.")}><Activity size={17} />Collections</button>
            <button className="nav-item" onClick={() => navNotice("Reconciliation is a planned finance control. No bank feeds, ledger entries or settlement records are connected.")}><Landmark size={17} />Reconciliation</button>

            <span className="nav-section nav-section-spaced">PEOPLE, INSIGHTS & SETTINGS</span>
            <button className="nav-item" onClick={() => navNotice("Staff management and role assignment are planned. Access is not controlled by this demonstration menu.")}><Users size={17} />Staff & roles</button>
            <button className="nav-item" onClick={() => navNotice("Reports and analytics are mapped here. All dashboard data remains illustrative until approved data services are connected.")}><Activity size={17} />Reports & analytics</button>
            <button className="nav-item" onClick={() => navNotice("Country, currency and banking configuration is a planned area. No bank account details or live bank connections are supported.")}><Globe2 size={17} />Country & banking setup</button>
            <button className={adminSettingsOpen ? "nav-item active" : "nav-item"} onClick={() => { setAdminSettingsOpen(true); setMobileOpen(false); setNotice(""); }}><Settings size={17} />Platform settings</button>
            <button className={adminSettingsOpen ? "nav-item active" : "nav-item"} onClick={() => { setAdminSettingsOpen(true); setMobileOpen(false); setNotice(""); }}><KeyRound size={17} />Secrets & API keys</button>
            <button className="nav-item" onClick={() => navNotice("Access and immutable audit controls require the production identity, authorization and audit services before activation.")}><ShieldCheck size={17} />Access & audit</button>
          </>}
        </nav>
        <div className="sidebar-bottom">
          <div className="sidebar-environment"><span className="environment-icon"><ShieldCheck size={15} /></span><span><strong>Preview environment</strong><small>Sample data · no live services</small></span><i /></div>
          <button type="button" className="help-card" aria-label="Open Help Centre" onClick={() => changeCustomerSection("help")}><span className="help-icon"><CircleHelp size={17} /></span><span className="help-card-copy"><strong>Here when you need us</strong><small>Guidance and support</small></span><ArrowRight size={15} /></button>
          <div className="profile-mini"><div className="avatar">{mode === "customer" ? "SC" : "SO"}</div><div className="profile-copy"><strong>{mode === "customer" ? "Sample customer" : "Sample operator"}</strong><small>{mode === "customer" ? "Customer preview" : "Operations preview"}</small></div><ChevronDown size={15} /></div>
        </div>
      </aside>
      {mobileOpen && <button className="scrim" aria-label="Close navigation overlay" onClick={() => setMobileOpen(false)} />}
      <main className="main-area">
        <header className="topbar">
          <button className="icon-button mobile-menu" aria-label="Open navigation" onClick={() => setMobileOpen(true)}><Menu size={20} /></button>
          <div className="breadcrumb"><span className="breadcrumb-brand">Northline</span><span className="crumb-separator">/</span><span className="breadcrumb-workspace">{mode === "customer" ? "Customer space" : "Operations"}</span><span className="crumb-separator">/</span><strong>{mode === "customer" ? customerSectionLabels[customerSection] : adminSettingsOpen ? "Secrets & API keys" : "Case overview"}</strong></div>
          <div className="topbar-actions"><span className="preview-label"><span />Illustrative preview</span><button className={mode === "customer" && customerSection === "notifications" ? "icon-button notification-button top-notification-active" : "icon-button notification-button"} aria-label="Open notifications" aria-current={mode === "customer" && customerSection === "notifications" ? "page" : undefined} onClick={() => mode === "customer" ? changeCustomerSection("notifications") : navNotice("Operations notifications are not connected in this preview.")}><Bell size={18} /></button><div className="top-avatar">{mode === "customer" ? "SC" : "SO"}</div></div>
        </header>
        <div className="content-wrap">
          <div className="mode-switch" role="group" aria-label="Preview workspace"><button className={mode === "customer" ? "mode-active" : ""} onClick={() => changeMode("customer")}>Customer view</button><button className={mode === "operations" ? "mode-active" : ""} onClick={() => changeMode("operations")}>Operations view</button></div>
          {notice && <div className="notice-banner" role="status"><span>{notice}</span><button aria-label="Dismiss notice" onClick={() => setNotice("")}><X size={16} /></button></div>}
          {mode === "customer" ? <CustomerExperience section={customerSection} onSectionChange={changeCustomerSection} onNotice={setNotice} applicationApi={applicationApi} /> : adminSettingsOpen ? <SecretsSettings /> : <OperationsView query={query} setQuery={setQuery} filter={filter} setFilter={setFilter} cases={filteredCases} selected={selected} setSelected={setSelected} onNotice={setNotice} />}
          <footer className="page-footer"><span>Northline is a product concept for a lending platform.</span><span>Illustrative interface · No live financial services</span></footer>
        </div>
        {mode === "customer" && <nav className="mobile-quick-nav" aria-label="Quick customer navigation">
          <button className={customerSection === "overview" ? "quick-nav-item active" : "quick-nav-item"} aria-current={customerSection === "overview" ? "page" : undefined} onClick={() => changeCustomerSection("overview")}><Home size={18} /><span>Home</span></button>
          <button className={customerSection === "explore" ? "quick-nav-item active" : "quick-nav-item"} aria-current={customerSection === "explore" ? "page" : undefined} onClick={() => changeCustomerSection("explore")}><Landmark size={18} /><span>Explore</span></button>
          <button className={customerSection === "applications" ? "quick-nav-item active" : "quick-nav-item"} aria-current={customerSection === "applications" ? "page" : undefined} onClick={() => changeCustomerSection("applications")}><FileText size={18} /><span>Applications</span></button>
          <button className={customerSection === "loans" ? "quick-nav-item active" : "quick-nav-item"} aria-current={customerSection === "loans" ? "page" : undefined} onClick={() => changeCustomerSection("loans")}><WalletCards size={18} /><span>My loans</span></button>
          <button className="quick-nav-item quick-nav-more" aria-label="Open full navigation" onClick={() => setMobileOpen(true)}><Menu size={18} /><span>More</span></button>
        </nav>}
      </main>
    </div>
  );
}


function SecretsSettings() {
  const groups = [
    { title: "Authentication", items: ["Admin JWT public key", "Customer JWT public key", "JWT issuer and audience"] },
    { title: "Database & encryption", items: ["Database connection string", "Customer profile encryption key", "Secrets-vault encryption key"] },
    { title: "External services", items: ["Email and SMS providers", "Document storage", "Identity verification", "Banking and payment providers"] },
  ];
  return <section className="operations-page secrets-page">
    <div className="page-heading"><div><div className="eyebrow">PLATFORM SETTINGS / SECURITY</div><h1>Secrets & API keys</h1><p>A central inventory for credentials, integrations and secure key rotation.</p></div></div>
    <div className="sample-notice"><span className="sample-mark"><ShieldCheck size={16} /></span><div><strong>Secure vault connection not configured</strong><p>This preview does not store secrets. No key values are collected or saved here. Connect a server-side secrets vault and authenticated administrator permissions before enabling credential changes.</p></div></div>
    <div className="secrets-grid">{groups.map(group => <section className="panel secrets-card" key={group.title}><div className="panel-heading"><div><span className="eyebrow">CREDENTIAL GROUP</span><h2>{group.title}</h2></div><KeyRound size={19}/></div>{group.items.map(item => <div className="secret-row" key={item}><span><strong>{item}</strong><small>Not connected · configure in secure deployment environment</small></span><span className="evidence-state">Not configured</span></div>)}</section>)}</div>
    <div className="panel secrets-guidance"><h2>How credential management will work</h2><ul><li>Only authorized administrators can add or rotate credentials.</li><li>Saved values remain masked; existing secrets cannot be retrieved through the browser.</li><li>Secret values are encrypted and stored server-side in a managed vault.</li><li>Every change records the administrator, timestamp and affected integration without recording the secret value.</li><li>Production signing keys and vault master keys remain outside the application database.</li></ul><p>For this Blitz frontend preview, no JWT key is required. The backend will reject protected operations until its issuer, audience and matching RS256 public key are configured.</p></div>
  </section>;
}

function OperationsView({ query, setQuery, filter, setFilter, cases, selected, setSelected, onNotice }: {
  query: string; setQuery: (value: string) => void; filter: "All" | CaseStatus;
  setFilter: (value: "All" | CaseStatus) => void; cases: ReviewCase[];
  selected: ReviewCase; setSelected: (value: ReviewCase) => void; onNotice: (message: string) => void;
}) {
  const totalCases = reviewCases.length;
  const needsReview = reviewCases.filter(c => c.status === "Needs review").length;
  const inProgress = reviewCases.filter(c => c.status === "In progress").length;
  const waitingOnCustomer = reviewCases.filter(c => c.status === "Waiting for customer").length;
  const completed = reviewCases.filter(c => c.status === "Completed").length;
  const percent = (count: number) => totalCases ? Math.round(count / totalCases * 100) : 0;
  return <section className="operations-page">
    <div className="page-heading operations-heading"><div><div className="eyebrow">OPERATIONS / CASE MANAGEMENT</div><h1>Review the evidence<br className="mobile-break" /> before you decide.</h1><p>A focused workspace for reviewing application cases and tracking the next action.</p></div><div className="heading-meta"><span className="meta-dot" /><span>Illustrative case queue</span></div></div>
    <div className="sample-notice"><span className="sample-mark"><ShieldCheck size={16} /></span><div><strong>Demonstration data only</strong><p>All names, references and statuses below are fictional. No approval, credit decision or financial transaction can be performed here.</p></div></div>
    <div className="ops-overview-grid">
      <div className="ops-summary">
        <div className="summary-card summary-total"><span className="summary-icon"><BriefcaseBusiness size={17} /></span><span className="summary-label">Cases in this preview</span><strong>{totalCases.toString().padStart(2, "0")}</strong><small><Activity size={13} /> Illustrative queue size</small></div>
        <div className="summary-card summary-review"><span className="summary-icon"><Clock3 size={17} /></span><span className="summary-label">Needs review</span><strong>{needsReview.toString().padStart(2, "0")}</strong><small>Awaiting a sample review</small></div>
        <div className="summary-card summary-waiting"><span className="summary-icon"><ArrowDownRight size={17} /></span><span className="summary-label">Waiting on customer</span><strong>{waitingOnCustomer.toString().padStart(2, "0")}</strong><small>Sample information requests</small></div>
        <div className="summary-card summary-complete"><span className="summary-icon"><CheckCircle2 size={17} /></span><span className="summary-label">Completed</span><strong>{completed.toString().padStart(2, "0")}</strong><small>Illustrative closed cases</small></div>
      </div>
      <aside className="queue-insight-card">
        <div className="queue-insight-heading"><div><span className="eyebrow">QUEUE COMPOSITION</span><h2>Status overview</h2></div><span className="queue-insight-mark"><Activity size={17} /></span></div>
        <div className="queue-stack" role="img" aria-label={`Sample queue composition: ${needsReview} needs review, ${inProgress} in progress, ${waitingOnCustomer} waiting for customer and ${completed} completed.`}>
          <span className="queue-segment review-segment" style={{width: percent(needsReview)+"%"}} />
          <span className="queue-segment progress-segment" style={{width: percent(inProgress)+"%"}} />
          <span className="queue-segment waiting-segment" style={{width: percent(waitingOnCustomer)+"%"}} />
          <span className="queue-segment complete-segment" style={{width: percent(completed)+"%"}} />
        </div>
        <div className="queue-legend">
          <span><i className="legend-review" />Needs review <strong>{needsReview}</strong></span>
          <span><i className="legend-progress" />In progress <strong>{inProgress}</strong></span>
          <span><i className="legend-waiting" />Waiting <strong>{waitingOnCustomer}</strong></span>
          <span><i className="legend-complete" />Completed <strong>{completed}</strong></span>
        </div>
        <p>Illustrative distribution only. This preview does not represent a live operational workload.</p>
      </aside>
    </div>
    <section className="admin-control-suite" aria-label="Operations control suite">
      <div className="admin-suite-heading"><div><span className="eyebrow">WORKSPACE SHORTCUTS</span><h2>Operational control suite</h2><p>Explore the key work areas that will connect to protected operational services.</p></div><span className="admin-suite-badge"><ShieldCheck size={14}/> Preview mode</span></div>
      <div className="admin-suite-grid">
        <button className="admin-suite-card suite-blue" onClick={() => onNotice("Application management is a design preview. Live application records, assignment and decisions are not connected.")}><span className="admin-suite-icon"><FileText size={19}/></span><span className="admin-suite-copy"><strong>Application review</strong><small>Intake, evidence and review queues</small></span><ArrowRight size={17}/></button>
        <button className="admin-suite-card suite-violet" onClick={() => onNotice("Customer management is a design preview. No live customer profiles or personal information are available.")}><span className="admin-suite-icon"><Users size={19}/></span><span className="admin-suite-copy"><strong>Customer workspace</strong><small>Profiles, service history and ownership</small></span><ArrowRight size={17}/></button>
        <button className="admin-suite-card suite-gold" onClick={() => onNotice("Workflow controls are not active. Stage templates, rules and customer-specific tasks require protected workflow services.")}><span className="admin-suite-icon"><Workflow size={19}/></span><span className="admin-suite-copy"><strong>Workflow designer</strong><small>Stages, milestones and next actions</small></span><ArrowRight size={17}/></button>
        <button className="admin-suite-card suite-green" onClick={() => onNotice("Document oversight is not active. Secure upload, malware scanning, storage and verification are not connected.")}><span className="admin-suite-icon"><FileSearch size={19}/></span><span className="admin-suite-copy"><strong>Evidence oversight</strong><small>Document requests and review controls</small></span><ArrowRight size={17}/></button>
      </div>
    </section>
    <div className="ops-layout">
      <section className="panel case-list-panel"><div className="panel-heading case-list-heading"><div><span className="eyebrow">APPLICATION WORKSPACE</span><h2>Recent cases</h2></div><span className="quiet-tag">{cases.length} results</span></div><label className="search-box"><Search size={16} /><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search name, reference or product" aria-label="Search cases" /></label><div className="filter-row"><Filter size={14} /><select value={filter} onChange={e => setFilter(e.target.value as "All" | CaseStatus)} aria-label="Filter cases"><option value="All">All statuses</option>{statuses.map(s => <option key={s} value={s}>{s}</option>)}</select></div><div className="case-list">{cases.map(item => <button key={item.id} className={selected.id === item.id ? "case-row case-selected" : "case-row"} onClick={() => setSelected(item)}><div className="case-row-top"><span className="case-customer-identity"><i>{item.customer.split(" ").map(part => part[0]).slice(0,2).join("").toUpperCase()}</i><strong>{item.customer}</strong></span><StatusPill status={item.status} /></div><span className="case-product-label">{item.product}</span><div className="case-row-bottom"><small>{item.reference}</small><small>{item.updated}</small></div></button>)}{cases.length === 0 && <div className="empty-state"><Search size={22} /><strong>No matching cases</strong><span>Try another name, reference or status.</span></div>}</div></section>
      <section className="panel case-detail-panel"><div className="detail-top"><div><span className="eyebrow">CASE DETAIL</span><h2>{selected.customer}</h2><span className="detail-reference">{selected.reference}</span></div><StatusPill status={selected.status} /></div><p className="case-summary">{selected.summary}</p><div className="detail-facts"><div><span>Product</span><strong>{selected.product}</strong></div><div><span>Current stage</span><strong>{selected.stage}</strong></div><div><span>Assigned to</span><strong>{selected.owner}</strong></div><div><span>Last updated</span><strong>{selected.updated}</strong></div></div><div className="detail-section"><div className="detail-section-heading"><h3>Case timeline</h3><span>Sample record</span></div><div className="mini-timeline"><div className="mini-step complete"><i /><div><strong>Application submitted</strong><small>Sample record created</small></div></div><div className="mini-step current"><i /><div><strong>{selected.stage}</strong><small>Current illustrative stage</small></div></div><div className="mini-step"><i /><div><strong>Next review step</strong><small>Depends on configured workflow</small></div></div></div></div><div className="detail-section"><div className="detail-section-heading"><h3>Evidence checklist</h3><span>Illustrative only</span></div><div className="evidence-row"><FileCheck2 size={17} /><span><strong>Identity document</strong><small>Sample evidence item · not uploaded</small></span><span className="evidence-state">Not connected</span></div><div className="evidence-row"><FileText size={17} /><span><strong>Income or business evidence</strong><small>Sample evidence item · not uploaded</small></span><span className="evidence-state">Not connected</span></div></div><div className="review-preparation-panel">
        <div className="review-preparation-heading"><div><span className="eyebrow">REVIEW PREPARATION</span><h3>Decision readiness</h3></div><span className="review-preparation-tag"><ShieldCheck size={14}/> Not assessed</span></div>
        <p>Use this workspace to organise evidence and outstanding questions. It does not calculate eligibility, risk or a lending decision.</p>
        <div className="review-readiness-grid">
          <div className="review-readiness-item"><span className="review-readiness-icon review-icon-blue"><FileSearch size={17}/></span><span><strong>Evidence review</strong><small>Secure document service not connected</small></span><b>Pending</b></div>
          <div className="review-readiness-item"><span className="review-readiness-icon review-icon-gold"><SlidersHorizontal size={17}/></span><span><strong>Policy checks</strong><small>Rules engine not configured</small></span><b>Pending</b></div>
          <div className="review-readiness-item"><span className="review-readiness-icon review-icon-violet"><Users size={17}/></span><span><strong>Second-person review</strong><small>Staff permissions not connected</small></span><b>Pending</b></div>
        </div>
      </div>
      <div className="workflow-preview-panel">
        <div className="detail-section-heading"><div><span className="eyebrow">WORKFLOW MAP</span><h3>Application journey</h3></div><span>Template preview</span></div>
        <div className="workflow-preview-rail">
          <div className="workflow-preview-step step-done"><i><CheckCircle2 size={13}/></i><span><strong>Submitted</strong><small>Application received</small></span></div>
          <div className="workflow-preview-step step-active"><i><Clock3 size={13}/></i><span><strong>{selected.stage}</strong><small>Selected case stage</small></span></div>
          <div className="workflow-preview-step"><i><FileCheck2 size={13}/></i><span><strong>Evidence review</strong><small>Requires secure workflow</small></span></div>
          <div className="workflow-preview-step"><i><CheckCircle2 size={13}/></i><span><strong>Outcome</strong><small>Protected decision process</small></span></div>
        </div>
        <div className="workflow-preview-foot"><ShieldCheck size={15}/><span>Stage order and completion remain illustrative until the workflow service is connected.</span></div>
      </div>
      <section className="customer-relationship-panel">
        <div className="customer-relationship-heading">
          <div><span className="eyebrow">CUSTOMER RELATIONSHIP</span><h3>Customer workspace</h3><p>A consolidated view of this sample customer's case context and service touchpoints.</p></div>
          <span className="customer-preview-chip"><Users size={13}/> Sample profile</span>
        </div>
        <div className="customer-profile-strip">
          <div className="customer-profile-avatar">{selected.customer.split(" ").map(part => part[0]).slice(0,2).join("").toUpperCase()}</div>
          <div className="customer-profile-main"><strong>{selected.customer}</strong><span>Customer reference · {selected.reference}</span><small>Illustrative account · no live identity record</small></div>
          <div className="customer-account-state"><span className="customer-state-dot"/><strong>Preview only</strong><small>Account status not verified</small></div>
        </div>
        <div className="customer-relationship-grid">
          <article className="customer-relationship-card">
            <span className="customer-card-icon customer-card-blue"><FileText size={17}/></span>
            <div><small>APPLICATION HISTORY</small><strong>1 sample application</strong><span>{selected.product} · {selected.reference}</span></div>
            <StatusPill status={selected.status}/>
          </article>
          <article className="customer-relationship-card">
            <span className="customer-card-icon customer-card-violet"><UserRound size={17}/></span>
            <div><small>CASE OWNERSHIP</small><strong>{selected.owner}</strong><span>Assignment service not connected</span></div>
            <span className="customer-mini-state">Illustrative</span>
          </article>
          <article className="customer-relationship-card">
            <span className="customer-card-icon customer-card-gold"><Workflow size={17}/></span>
            <div><small>CUSTOMER WORKFLOW</small><strong>{selected.stage}</strong><span>Current sample milestone</span></div>
            <span className="customer-mini-state">Not live</span>
          </article>
        </div>
        <div className="customer-history-grid">
          <section className="customer-history-block">
            <div className="customer-history-title"><div><span className="eyebrow">CASE ACTIVITY</span><h4>Application history</h4></div><span>Sample timeline</span></div>
            <div className="customer-activity-list">
              <div className="customer-activity-item"><i className="activity-complete"><CheckCircle2 size={13}/></i><span><strong>Application received</strong><small>{selected.updated} · Sample case created</small></span><b>Recorded</b></div>
              <div className="customer-activity-item"><i className="activity-current"><Clock3 size={13}/></i><span><strong>{selected.stage}</strong><small>Current stage shown in the case fixture</small></span><b>Current</b></div>
              <div className="customer-activity-item"><i><ArrowRight size={13}/></i><span><strong>Next workflow milestone</strong><small>To be defined by an authorized workflow service</small></span><b>Upcoming</b></div>
            </div>
          </section>
          <section className="customer-history-block">
            <div className="customer-history-title"><div><span className="eyebrow">SERVICE TOUCHPOINTS</span><h4>Communication history</h4></div><span>Illustrative</span></div>
            <div className="customer-communication-list">
              <div className="customer-communication-item"><span className="communication-icon"><Bell size={15}/></span><span><strong>Application status update</strong><small>Sample notification · no message was sent</small></span><time>—</time></div>
              <div className="customer-communication-item"><span className="communication-icon communication-gold"><FileText size={15}/></span><span><strong>Information request</strong><small>Example service event · delivery not connected</small></span><time>—</time></div>
              <div className="customer-communication-note"><ShieldCheck size={14}/> No email, SMS or in-app communication is sent from this preview.</div>
            </div>
          </section>
        </div>
      </section>
      <div className="detail-actions"><div><strong>Review controls</strong><small>Real decisions require authenticated staff, permissions and backend workflows.</small></div><button className="button-outline" onClick={() => onNotice("No decision was recorded. Approval and rejection controls will be enabled only after the protected underwriting API is implemented.")}>Decision controls unavailable</button></div></section>
    </div>
  </section>;
}

export default App;
