import { useEffect, useMemo, useState } from "react";
import {
  Activity, ArrowDownRight, ArrowRight, Bell, BriefcaseBusiness,
  ChevronDown, CircleHelp, Clock3, FileCheck2, FileText, Filter,
  Home, Landmark, LayoutDashboard, Menu, Search,
  ShieldCheck, UserRound, WalletCards, X
} from "lucide-react";
import { reviewCases, type CaseStatus, type ReviewCase } from "./data/fixtures";
import { CustomerExperience } from "./customer/CustomerExperience";
import type { CustomerSection } from "./customer/customer-data";

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
  return <div className="brand"><span className="brand-mark"><Landmark size={19} strokeWidth={1.8} /></span><span>northline<span className="brand-period">.</span></span></div>;
}

function App() {
  const [mode, setMode] = useState<Mode>(() => window.location.pathname === "/operations" ? "operations" : "customer");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"All" | CaseStatus>("All");
  const [selected, setSelected] = useState<ReviewCase>(reviewCases[0]);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notice, setNotice] = useState("");
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
        <button className={mode === "customer" ? "workspace-switch selected" : "workspace-switch"} onClick={() => changeMode("customer")}><span className="nav-icon"><UserRound size={17} /></span><span>Customer space</span><ChevronDown size={15} /></button>
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
          <div className="breadcrumb"><span>Northline</span><span className="crumb-separator">/</span><strong>{mode === "customer" ? customerSectionLabels[customerSection] : "Case overview"}</strong></div>
          <div className="topbar-actions"><span className="preview-label"><span />Illustrative preview</span><button className="icon-button notification-button" aria-label="Open notifications" onClick={() => mode === "customer" ? changeCustomerSection("notifications") : navNotice("Operations notifications are not connected in this preview.")}><Bell size={18} /></button><div className="top-avatar">{mode === "customer" ? "SC" : "SO"}</div></div>
        </header>
        <div className="content-wrap">
          <div className="mode-switch" role="group" aria-label="Preview workspace"><button className={mode === "customer" ? "mode-active" : ""} onClick={() => changeMode("customer")}>Customer view</button><button className={mode === "operations" ? "mode-active" : ""} onClick={() => changeMode("operations")}>Operations view</button></div>
          {notice && <div className="notice-banner" role="status"><span>{notice}</span><button aria-label="Dismiss notice" onClick={() => setNotice("")}><X size={16} /></button></div>}
          {mode === "customer" ? <CustomerExperience section={customerSection} onSectionChange={changeCustomerSection} onNotice={setNotice} /> : <OperationsView query={query} setQuery={setQuery} filter={filter} setFilter={setFilter} cases={filteredCases} selected={selected} setSelected={setSelected} onNotice={setNotice} />}
          <footer className="page-footer"><span>Northline is a product concept for a lending platform.</span><span>Illustrative interface · No live financial services</span></footer>
        </div>
      </main>
    </div>
  );
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
