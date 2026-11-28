import { useEffect, useMemo, useState } from "react";
import {
  Activity, ArrowDownRight, ArrowRight, Banknote, Bell, BriefcaseBusiness, CheckCircle2, KeyRound,
  ChevronDown, CircleHelp, Clock3, FileCheck2, FileSearch, FileText, Filter,
  Globe2, HandCoins, Home, Landmark, LayoutDashboard, Menu, Search, Settings, ShieldCheck,
  SlidersHorizontal, UserRound, Users, WalletCards, Workflow, X,
  Plus, ChevronUp, ChevronDown as ChevronDownIcon, ListChecks, Sparkles, Save
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
  const [adminWorkspace, setAdminWorkspace] = useState<"cases" | "workflow" | "documents">("cases");
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
    setAdminWorkspace("cases");
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
            <button className={adminWorkspace === "workflow" ? "nav-item active" : "nav-item"} aria-current={adminWorkspace === "workflow" ? "page" : undefined} onClick={() => { setAdminWorkspace("workflow"); setAdminSettingsOpen(false); setMobileOpen(false); setNotice(""); }}><Workflow size={17} />Workflow & stages</button>

            <span className="nav-section nav-section-spaced">DOCUMENTS & COMPLIANCE</span>
            <button className={adminWorkspace === "documents" ? "nav-item active" : "nav-item"} aria-current={adminWorkspace === "documents" ? "page" : undefined} onClick={() => { setAdminWorkspace("documents"); setAdminSettingsOpen(false); setMobileOpen(false); setNotice(""); }}><FileSearch size={17} />Document review</button>
            <button className={adminWorkspace === "documents" ? "nav-item active" : "nav-item"} onClick={() => { setAdminWorkspace("documents"); setAdminSettingsOpen(false); setMobileOpen(false); setNotice(""); }}><ShieldCheck size={17} />KYC & verification</button>
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
          <div className="breadcrumb"><span className="breadcrumb-brand">Northline</span><span className="crumb-separator">/</span><span className="breadcrumb-workspace">{mode === "customer" ? "Customer space" : "Operations"}</span><span className="crumb-separator">/</span><strong>{mode === "customer" ? customerSectionLabels[customerSection] : adminSettingsOpen ? "Secrets & API keys" : adminWorkspace === "workflow" ? "Workflow designer" : adminWorkspace === "documents" ? "Document oversight" : "Case overview"}</strong></div>
          <div className="topbar-actions"><span className="preview-label"><span />Illustrative preview</span><button className={mode === "customer" && customerSection === "notifications" ? "icon-button notification-button top-notification-active" : "icon-button notification-button"} aria-label="Open notifications" aria-current={mode === "customer" && customerSection === "notifications" ? "page" : undefined} onClick={() => mode === "customer" ? changeCustomerSection("notifications") : navNotice("Operations notifications are not connected in this preview.")}><Bell size={18} /></button><div className="top-avatar">{mode === "customer" ? "SC" : "SO"}</div></div>
        </header>
        <div className="content-wrap">
          <div className="mode-switch" role="group" aria-label="Preview workspace"><button className={mode === "customer" ? "mode-active" : ""} onClick={() => changeMode("customer")}>Customer view</button><button className={mode === "operations" ? "mode-active" : ""} onClick={() => changeMode("operations")}>Operations view</button></div>
          {notice && <div className="notice-banner" role="status"><span>{notice}</span><button aria-label="Dismiss notice" onClick={() => setNotice("")}><X size={16} /></button></div>}
          {mode === "customer" ? <CustomerExperience section={customerSection} onSectionChange={changeCustomerSection} onNotice={setNotice} applicationApi={applicationApi} /> : adminSettingsOpen ? <SecretsSettings /> : adminWorkspace === "workflow" ? <WorkflowDesigner onBack={() => setAdminWorkspace("cases")} onNotice={setNotice} /> : adminWorkspace === "documents" ? <DocumentOversight onBack={() => setAdminWorkspace("cases")} onNotice={setNotice} /> : <OperationsView query={query} setQuery={setQuery} filter={filter} setFilter={setFilter} cases={filteredCases} selected={selected} setSelected={setSelected} onNotice={setNotice} onOpenWorkflow={() => setAdminWorkspace("workflow")} />}
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

function OperationsView({ query, setQuery, filter, setFilter, cases, selected, setSelected, onNotice, onOpenWorkflow }: {
  query: string; setQuery: (value: string) => void; filter: "All" | CaseStatus;
  setFilter: (value: "All" | CaseStatus) => void; cases: ReviewCase[];
  selected: ReviewCase; setSelected: (value: ReviewCase) => void; onNotice: (message: string) => void; onOpenWorkflow: () => void;
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
        <button className="admin-suite-card suite-gold" onClick={onOpenWorkflow}><span className="admin-suite-icon"><Workflow size={19}/></span><span className="admin-suite-copy"><strong>Workflow designer</strong><small>Stages, milestones and next actions</small></span><ArrowRight size={17}/></button>
        <button className="admin-suite-card suite-green" onClick={() => { const event = new CustomEvent("open-document-oversight"); window.dispatchEvent(event); onNotice("Open Document review from the operations navigation to explore the evidence oversight workspace."); }}><span className="admin-suite-icon"><FileSearch size={19}/></span><span className="admin-suite-copy"><strong>Evidence oversight</strong><small>Document requests and review controls</small></span><ArrowRight size={17}/></button>
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



type WorkflowStage = { id: number; name: string; description: string; owner: string; customerAction: string; required: boolean; enabled: boolean };

function WorkflowDesigner({ onBack, onNotice }: { onBack: () => void; onNotice: (message: string) => void }) {
  const [template, setTemplate] = useState("standard");
  const [target, setTarget] = useState("global");
  const [selectedCustomer, setSelectedCustomer] = useState(reviewCases[0].id);
  const [newStage, setNewStage] = useState("");
  const [stages, setStages] = useState<WorkflowStage[]>([
    { id: 1, name: "Application submitted", description: "Capture the initial application and create a case record.", owner: "System", customerAction: "Review the application summary", required: true, enabled: true },
    { id: 2, name: "Initial completeness review", description: "Organise the submitted information and identify outstanding items.", owner: "Operations", customerAction: "No action currently required", required: true, enabled: true },
    { id: 3, name: "Document review", description: "Review requested evidence through an approved secure document service.", owner: "Verification team", customerAction: "Provide requested documents when securely enabled", required: true, enabled: true },
    { id: 4, name: "Verification", description: "Complete the configured identity and information verification process.", owner: "Verification team", customerAction: "Respond to any secure follow-up request", required: true, enabled: true },
    { id: 5, name: "Final review", description: "Route the case through the authorised review and approval process.", owner: "Authorised reviewer", customerAction: "Wait for a secure status update", required: true, enabled: true },
    { id: 6, name: "Outcome communicated", description: "Communicate the authorised outcome and next steps.", owner: "Operations", customerAction: "Read the secure notification", required: true, enabled: true }
  ]);
  const moveStage = (index: number, direction: -1 | 1) => setStages(current => {
    const next = [...current]; const destination = index + direction;
    if (destination < 0 || destination >= next.length) return current;
    [next[index], next[destination]] = [next[destination], next[index]];
    return next;
  });
  const updateStage = (id: number, patch: Partial<WorkflowStage>) => setStages(current => current.map(stage => stage.id === id ? { ...stage, ...patch } : stage));
  const addStage = () => {
    const name = newStage.trim();
    if (!name) return;
    setStages(current => [...current, { id: Math.max(0, ...current.map(stage => stage.id)) + 1, name, description: "Define the purpose and completion criteria for this stage.", owner: "Operations", customerAction: "Set the next customer action", required: false, enabled: true }]);
    setNewStage("");
  };
  const activeStages = stages.filter(stage => stage.enabled).length;
  const selectedRecord = reviewCases.find(item => item.id === selectedCustomer) ?? reviewCases[0];
  return <section className="operations-page workflow-designer-page">
    <div className="page-heading workflow-page-heading"><div><div className="eyebrow">OPERATIONS / PRODUCT & WORKFLOWS</div><h1>Design every step<br className="mobile-break"/> of the journey.</h1><p>Shape a clear, consistent application journey with configurable milestones and customer actions.</p></div><button className="workflow-back-button" onClick={onBack}><ArrowRight size={15}/> Back to case overview</button></div>
    <div className="sample-notice"><span className="sample-mark"><ShieldCheck size={16}/></span><div><strong>Local workflow preview</strong><p>Changes below exist only in this browser session. Publishing, assigning stages and changing real customer journeys require authenticated workflow services and an audit trail.</p></div></div>
    <div className="workflow-designer-hero">
      <div className="workflow-hero-copy"><span className="workflow-hero-kicker"><Sparkles size={13}/> WORKFLOW STUDIO</span><h2>One journey. Clear ownership.</h2><p>Build a transparent sequence for customers and operations teams, from application intake through the final communication.</p><div className="workflow-hero-stats"><span><strong>{stages.length}</strong><small>Total stages</small></span><span><strong>{activeStages}</strong><small>Enabled stages</small></span><span><strong>{stages.filter(stage => stage.required).length}</strong><small>Required stages</small></span></div></div>
      <div className="workflow-hero-art"><div className="workflow-orbit orbit-one"/><div className="workflow-orbit orbit-two"/><div className="workflow-hero-symbol"><Workflow size={42}/></div><span className="workflow-orbit-node node-one"><CheckCircle2 size={15}/></span><span className="workflow-orbit-node node-two"><Clock3 size={15}/></span><span className="workflow-orbit-node node-three"><Users size={15}/></span></div>
    </div>
    <div className="workflow-config-grid">
      <section className="panel workflow-config-card"><div className="workflow-card-heading"><div><span className="eyebrow">01 / TEMPLATE</span><h3>Journey configuration</h3><p>Choose the workflow blueprint and who it applies to.</p></div><span className="workflow-heading-icon"><SlidersHorizontal size={18}/></span></div>
        <label className="workflow-field-label" htmlFor="workflow-template">Workflow template</label><select id="workflow-template" className="workflow-select" value={template} onChange={event => setTemplate(event.target.value)}><option value="standard">Standard loan application</option><option value="business">Business finance journey</option><option value="property">Property finance journey</option><option value="vehicle">Vehicle finance journey</option></select>
        <label className="workflow-field-label" htmlFor="workflow-target">Apply configuration to</label><select id="workflow-target" className="workflow-select" value={target} onChange={event => setTarget(event.target.value)}><option value="global">Global template · future applications</option><option value="customer">One customer · sample override</option></select>
        {target === "customer" && <><label className="workflow-field-label" htmlFor="workflow-customer">Sample customer</label><select id="workflow-customer" className="workflow-select" value={selectedCustomer} onChange={event => setSelectedCustomer(event.target.value)}>{reviewCases.map(item => <option key={item.id} value={item.id}>{item.customer} · {item.reference}</option>)}</select><div className="workflow-customer-preview"><Users size={16}/><span><strong>{selectedRecord.customer}</strong><small>{selectedRecord.product} · {selectedRecord.stage}</small></span></div></>}
        <div className="workflow-config-note"><ShieldCheck size={15}/><span>{target === "global" ? "Global templates should be versioned and reviewed before future rollout." : "This selection is a visual customer override example. No customer record is modified."}</span></div>
      </section>
      <section className="panel workflow-config-card workflow-next-action-card"><div className="workflow-card-heading"><div><span className="eyebrow">02 / CUSTOMER EXPERIENCE</span><h3>Next-action principles</h3><p>Keep every milestone understandable and actionable.</p></div><span className="workflow-heading-icon workflow-heading-violet"><ListChecks size={18}/></span></div>
        <div className="workflow-principle-row"><span className="workflow-principle-icon principle-blue"><CheckCircle2 size={16}/></span><span><strong>Clear completion criteria</strong><small>Every stage needs an owner and a defined exit condition.</small></span></div>
        <div className="workflow-principle-row"><span className="workflow-principle-icon principle-gold"><Bell size={16}/></span><span><strong>One next action at a time</strong><small>Show customers the most important pending task, not a confusing checklist.</small></span></div>
        <div className="workflow-principle-row"><span className="workflow-principle-icon principle-green"><ShieldCheck size={16}/></span><span><strong>Controlled stage transitions</strong><small>Require authorised roles, evidence and an auditable event.</small></span></div>
      </section>
    </div>
    <section className="panel workflow-stage-editor">
      <div className="workflow-stage-editor-heading"><div><span className="eyebrow">03 / STAGE BUILDER</span><h3>Application journey stages</h3><p>Reorder milestones, define ownership and preview the customer-facing next action.</p></div><span className="workflow-stage-count">{activeStages} active / {stages.length}</span></div>
      <div className="workflow-stage-rail">{stages.filter(stage => stage.enabled).map((stage,index) => <span key={stage.id} className={index === 0 ? "workflow-rail-dot first" : "workflow-rail-dot"}>{index + 1}</span>)}</div>
      <div className="workflow-stage-list">{stages.map((stage,index) => <article className={stage.enabled ? "workflow-stage-card" : "workflow-stage-card stage-disabled"} key={stage.id}>
        <div className="workflow-stage-order"><span>{String(index + 1).padStart(2,"0")}</span><div><button aria-label={`Move ${stage.name} up`} disabled={index === 0} onClick={() => moveStage(index,-1)}><ChevronUp size={15}/></button><button aria-label={`Move ${stage.name} down`} disabled={index === stages.length - 1} onClick={() => moveStage(index,1)}><ChevronDownIcon size={15}/></button></div></div>
        <div className="workflow-stage-main"><div className="workflow-stage-title-row"><strong>{stage.name}</strong><span className={stage.required ? "workflow-required-tag" : "workflow-optional-tag"}>{stage.required ? "Required" : "Optional"}</span></div><p>{stage.description}</p><div className="workflow-stage-meta"><span><UserRound size={12}/> {stage.owner}</span><span><ListChecks size={12}/> Customer action defined</span></div><div className="workflow-stage-action"><small>NEXT CUSTOMER ACTION</small><strong>{stage.customerAction}</strong></div></div>
        <div className="workflow-stage-controls"><label className="workflow-toggle"><input type="checkbox" checked={stage.enabled} onChange={event => updateStage(stage.id,{enabled:event.target.checked})}/><span/>{stage.enabled ? "Enabled" : "Paused"}</label><button className="workflow-stage-option" onClick={() => updateStage(stage.id,{required:!stage.required})}>{stage.required ? "Make optional" : "Make required"}</button></div>
      </article>)}</div>
      <div className="workflow-add-stage-row"><div><strong>Add a milestone</strong><small>Create a custom step in this local preview.</small></div><div className="workflow-add-stage-control"><input value={newStage} onChange={event => setNewStage(event.target.value)} onKeyDown={event => { if (event.key === "Enter") addStage(); }} placeholder="e.g. Additional review" aria-label="New workflow stage name"/><button onClick={addStage} disabled={!newStage.trim()}><Plus size={15}/> Add stage</button></div></div>
    </section>
    <div className="workflow-footer-actions"><div><ShieldCheck size={16}/><span><strong>Draft preview only</strong><small>No workflow is published and no customer status is changed.</small></span></div><button onClick={() => onNotice("Workflow preview is ready for review. Publishing is disabled until authenticated permissions, versioning and audit services are implemented.")}><Save size={15}/> Review draft</button></div>
  </section>;
}



type EvidenceStatus = "Needs review" | "Requested" | "In review" | "Verified" | "Not provided";
type EvidenceRecord = { id: string; caseRef: string; customer: string; category: string; description: string; status: EvidenceStatus; priority: "Standard" | "Priority"; received: string; owner: string };

const evidenceFixtures: EvidenceRecord[] = [
  { id:"EV-2041",caseRef:reviewCases[0].reference,customer:reviewCases[0].customer,category:"Identity document",description:"Identity evidence placeholder · no file attached",status:"Needs review",priority:"Priority",received:"Sample queue",owner:"Verification team" },
  { id:"EV-2042",caseRef:reviewCases[0].reference,customer:reviewCases[0].customer,category:"Proof of address",description:"Address evidence placeholder · no file attached",status:"Requested",priority:"Standard",received:"Sample queue",owner:"Customer action" },
  { id:"EV-2043",caseRef:reviewCases[1].reference,customer:reviewCases[1].customer,category:"Income evidence",description:"Income evidence placeholder · no file attached",status:"In review",priority:"Standard",received:"Sample queue",owner:"Operations" },
  { id:"EV-2044",caseRef:reviewCases[2].reference,customer:reviewCases[2].customer,category:"Business registration",description:"Business registration placeholder · no file attached",status:"Needs review",priority:"Priority",received:"Sample queue",owner:"Verification team" },
  { id:"EV-2045",caseRef:reviewCases[3].reference,customer:reviewCases[3].customer,category:"Bank statement",description:"Financial evidence placeholder · no file attached",status:"Not provided",priority:"Standard",received:"Sample queue",owner:"Customer action" },
  { id:"EV-2046",caseRef:reviewCases[4].reference,customer:reviewCases[4].customer,category:"Property document",description:"Property evidence placeholder · no file attached",status:"Verified",priority:"Standard",received:"Sample queue",owner:"Operations" }
];

function DocumentOversight({ onBack, onNotice }: { onBack: () => void; onNotice: (message: string) => void }) {
  const [filter,setFilter] = useState<"All" | EvidenceStatus>("All");
  const [query,setQuery] = useState("");
  const [selectedId,setSelectedId] = useState(evidenceFixtures[0].id);
  const [activeTab,setActiveTab] = useState<"overview" | "checklist" | "security">("overview");
  const records = evidenceFixtures.filter(record => (filter === "All" || record.status === filter) && [record.id,record.customer,record.caseRef,record.category].join(" ").toLowerCase().includes(query.toLowerCase()));
  const selected = evidenceFixtures.find(record => record.id === selectedId) ?? evidenceFixtures[0];
  const count = (status: EvidenceStatus) => evidenceFixtures.filter(record => record.status === status).length;
  const chooseStatus = (status: EvidenceStatus) => onNotice("Evidence status changes are disabled in this preview. A live implementation must record reviewer identity, evidence version, reason and audit event.");
  return <section className="operations-page document-oversight-page">
    <div className="page-heading document-heading"><div><div className="eyebrow">OPERATIONS / DOCUMENTS & COMPLIANCE</div><h1>Evidence, organised<br className="mobile-break"/> with confidence.</h1><p>A central workspace for evidence requests, review readiness and verification controls.</p></div><button className="workflow-back-button" onClick={onBack}><ArrowRight size={15}/> Back to case overview</button></div>
    <div className="sample-notice"><span className="sample-mark"><ShieldCheck size={16}/></span><div><strong>Secure document services are not connected</strong><p>This is a visual demonstration using fictional metadata only. No document files can be uploaded, viewed, scanned, stored or verified here. Never enter real identity or financial documents.</p></div></div>
    <div className="evidence-overview-grid">
      <div className="evidence-metric-card evidence-metric-total"><span className="evidence-metric-icon"><FilesIcon/></span><small>Evidence items</small><strong>{evidenceFixtures.length.toString().padStart(2,"0")}</strong><span>Illustrative records</span></div>
      <div className="evidence-metric-card evidence-metric-review"><span className="evidence-metric-icon"><Clock3 size={17}/></span><small>Needs review</small><strong>{count("Needs review").toString().padStart(2,"0")}</strong><span>Sample review queue</span></div>
      <div className="evidence-metric-card evidence-metric-request"><span className="evidence-metric-icon"><Bell size={17}/></span><small>Requested</small><strong>{count("Requested").toString().padStart(2,"0")}</strong><span>Customer action pending</span></div>
      <div className="evidence-metric-card evidence-metric-verified"><span className="evidence-metric-icon"><ShieldCheck size={17}/></span><small>Verified</small><strong>{count("Verified").toString().padStart(2,"0")}</strong><span>Fixture status only</span></div>
    </div>
    <section className="evidence-security-banner"><div className="evidence-security-icon"><LockKeyholeIcon/></div><div><strong>Privacy-first evidence handling</strong><p>Production document handling requires encrypted storage, strict case-level permissions, malware scanning, retention controls, secure previews and tamper-evident audit logs.</p></div><span className="evidence-security-tag">Not configured</span></section>
    <div className="evidence-workspace">
      <section className="panel evidence-queue-panel">
        <div className="evidence-queue-heading"><div><span className="eyebrow">EVIDENCE INTAKE</span><h2>Review queue</h2></div><span className="quiet-tag">{records.length} items</span></div>
        <label className="search-box"><Search size={15}/><input value={query} onChange={event=>setQuery(event.target.value)} placeholder="Search case, customer or evidence" aria-label="Search evidence records"/></label>
        <div className="evidence-filter-row"><Filter size={14}/><select value={filter} onChange={event=>setFilter(event.target.value as "All" | EvidenceStatus)} aria-label="Filter evidence status"><option value="All">All statuses</option><option>Needs review</option><option>Requested</option><option>In review</option><option>Verified</option><option>Not provided</option></select></div>
        <div className="evidence-queue-list">{records.map(record=><button key={record.id} className={selectedId===record.id ? "evidence-queue-item evidence-queue-selected" : "evidence-queue-item"} onClick={()=>setSelectedId(record.id)}><span className="evidence-file-icon"><FileText size={17}/></span><span className="evidence-queue-copy"><strong>{record.category}</strong><small>{record.customer} · {record.caseRef}</small><em>{record.id} · {record.description}</em></span><span className={"evidence-status evidence-status-"+record.status.toLowerCase().replaceAll(" ","-")}>{record.status}</span></button>)}{records.length===0&&<div className="empty-state"><Search size={21}/><strong>No matching evidence</strong><span>Adjust the search or status filter.</span></div>}</div>
        <div className="evidence-queue-foot"><ShieldCheck size={14}/> Metadata-only sample queue. No files are present.</div>
      </section>
      <section className="panel evidence-detail-panel">
        <div className="evidence-detail-top"><div><span className="eyebrow">EVIDENCE RECORD</span><h2>{selected.category}</h2><span>{selected.id} · {selected.caseRef}</span></div><span className={"evidence-status evidence-status-"+selected.status.toLowerCase().replaceAll(" ","-")}>{selected.status}</span></div>
        <div className="evidence-tabs" role="tablist" aria-label="Evidence detail sections"><button role="tab" aria-selected={activeTab==="overview"} className={activeTab==="overview"?"active":""} onClick={()=>setActiveTab("overview")}>Overview</button><button role="tab" aria-selected={activeTab==="checklist"} className={activeTab==="checklist"?"active":""} onClick={()=>setActiveTab("checklist")}>Review checklist</button><button role="tab" aria-selected={activeTab==="security"} className={activeTab==="security"?"active":""} onClick={()=>setActiveTab("security")}>Security</button></div>
        {activeTab==="overview"&&<div className="evidence-detail-content"><div className="evidence-placeholder-preview"><div className="evidence-preview-glow"><FileSearch size={34}/></div><strong>No document attached</strong><span>This record contains sample metadata only.</span><small>Secure preview unavailable</small></div><div className="evidence-detail-facts"><div><small>CUSTOMER</small><strong>{selected.customer}</strong></div><div><small>CASE REFERENCE</small><strong>{selected.caseRef}</strong></div><div><small>ASSIGNED QUEUE</small><strong>{selected.owner}</strong></div><div><small>PRIORITY</small><strong>{selected.priority}</strong></div><div><small>RECEIVED</small><strong>{selected.received}</strong></div><div><small>FILE STATE</small><strong>No file attached</strong></div></div></div>}
        {activeTab==="checklist"&&<div className="evidence-checklist-content"><div className="evidence-checklist-intro"><ListChecks size={18}/><span><strong>Reviewer checklist</strong><small>Illustrative review controls. No verification is performed.</small></span></div>{["Confirm document category matches the request","Check image clarity and completeness","Compare key fields against the authorised case record","Confirm document validity and expiry where applicable","Record reviewer, reason and evidence version"].map((item,index)=><div className="evidence-check-item" key={item}><span>{String(index+1).padStart(2,"0")}</span><strong>{item}</strong><b>Not assessed</b></div>)}<div className="evidence-checklist-note"><ShieldCheck size={14}/> A real review requires authorised access to the original file and a documented verification standard.</div></div>}
        {activeTab==="security"&&<div className="evidence-security-content">{[{title:"Encrypted object storage",detail:"Private storage, encryption at rest and managed key rotation."},{title:"Malware and file validation",detail:"Quarantine, content-type validation and safe file processing."},{title:"Access and download controls",detail:"Case-scoped permissions, short-lived access and download audit."},{title:"Retention and deletion",detail:"Document-specific retention schedules and verified deletion."},{title:"Immutable audit trail",detail:"Record every view, export, status change and reviewer decision."}].map((item,index)=><div className="evidence-security-item" key={item.title}><span><ShieldCheck size={15}/></span><div><strong>{item.title}</strong><small>{item.detail}</small></div><b>Not configured</b></div>)}</div>}
        <div className="evidence-detail-actions"><div><strong>Review actions unavailable</strong><small>Live verification requires protected services and reviewer permissions.</small></div><button onClick={()=>chooseStatus("Verified")}><ShieldCheck size={14}/> Verification disabled</button></div>
      </section>
    </div>
    <section className="evidence-category-panel"><div><span className="eyebrow">SUPPORTED EVIDENCE CATEGORIES</span><h3>One organised evidence catalogue</h3><p>Document types can be configured by loan product, country and workflow policy.</p></div><div className="evidence-category-grid">{[{name:"Identity",detail:"Passport, national ID, driving licence",icon:<UserRound size={17}/>},{name:"Address",detail:"Utility or official address evidence",icon:<Home size={17}/>},{name:"Income",detail:"Income, employment or business evidence",icon:<Banknote size={17}/>},{name:"Business",detail:"Registration and ownership records",icon:<BriefcaseBusiness size={17}/>},{name:"Property",detail:"Title, valuation and insurance records",icon:<Landmark size={17}/>},{name:"Financial",detail:"Bank statements and financial records",icon:<WalletCards size={17}/>},{name:"Vehicle",detail:"Ownership and insurance records",icon:<FileCheck2 size={17}/>},{name:"Compliance",detail:"Additional clearance and review evidence",icon:<ShieldCheck size={17}/>}].map(item=><article className="evidence-category-tile" key={item.name}><span>{item.icon}</span><div><strong>{item.name}</strong><small>{item.detail}</small></div></article>)}</div></section>
  </section>;
}

function FilesIcon() { return <FileText size={17}/>; }
function LockKeyholeIcon() { return <ShieldCheck size={18}/>; }

export default App;
