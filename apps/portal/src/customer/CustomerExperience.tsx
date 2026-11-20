import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  ArrowRight, ArrowUpRight, BellRing, BookOpen, Check, CheckCircle2,
  ChevronDown, CircleHelp, FileCheck2, FileLock2, FileText,
  FolderCheck, Headphones, HeartHandshake, Info, LockKeyhole, MessageCircle,
  Search, ShieldCheck, Sparkles, UploadCloud, UserRound, WalletCards, X, CalendarDays, CircleDollarSign, ClipboardList, ReceiptText
} from "lucide-react";
import {
  applicationSteps, documentGuidance, financeCategories, supportQuestions, totalProductTypes, customerNotifications,
  type CustomerNotificationKind,
  type CustomerSection, type FinanceCategory
} from "./customer-data";
import type { CustomerApplication, CustomerApplicationApi, CustomerApplicationStatus } from "./customer-api";

type CustomerExperienceProps = {
  section: CustomerSection;
  onSectionChange: (section: CustomerSection) => void;
  onNotice: (message: string) => void;
  applicationApi?: CustomerApplicationApi;
};

function Eyebrow({ children }: { children: ReactNode }) {
  return <span className="eyebrow">{children}</span>;
}

function SampleBanner({ compact = false }: { compact?: boolean }) {
  return <div className={compact ? "customer-sample-banner compact" : "customer-sample-banner"} role="note">
    <span className="sample-banner-icon"><Info size={17} /></span>
    <div><strong>Illustrative preview — not a live account</strong><p>All names, application states and activity shown here are fictional sample data. No personal information is collected or financial service is provided.</p></div>
    <span className="sample-banner-label">SAMPLE DATA</span>
  </div>;
}

function PageHeading({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return <header className="customer-page-heading"><div><Eyebrow>{eyebrow}</Eyebrow><h1>{title}</h1><p>{description}</p></div><span className="customer-heading-mark"><ShieldCheck size={22} /></span></header>;
}

function CustomerOverview({ onSectionChange }: Pick<CustomerExperienceProps, "onSectionChange">) {
  const stepsComplete = applicationSteps.filter((step) => step.state === "complete").length;

  return <div className="customer-experience overview-experience">
    <div className="customer-page-heading overview-heading"><div><Eyebrow>YOUR NORTHLINE SPACE</Eyebrow><h1>Good to see you.</h1><p>A calm, clear place to follow your journey and understand your options.</p></div><div className="overview-date"><span className="overview-date-icon"><Sparkles size={16} /></span><span>Made for clearer decisions</span></div></div>
    <section className="customer-hero" aria-label="Customer welcome">
      <div className="hero-copy"><span className="hero-kicker"><Sparkles size={14} /> A MORE THOUGHTFUL FINANCE EXPERIENCE</span><h2>Move forward<br />with confidence.</h2><p>Keep your application guidance, important information and support together in one simple space.</p><div className="hero-actions"><button className="button-primary" onClick={() => onSectionChange("explore")}>Explore finance options <ArrowRight size={16} /></button><button className="button-quiet-light" onClick={() => onSectionChange("applications")}>Follow an application</button></div><div className="hero-footnote"><ShieldCheck size={14} /> Clear information. No pressure to apply.</div></div>
      <div className="hero-visual"><img src="/images/customer-adviser.jpg" alt="A customer speaking with a financial adviser in a bright, welcoming office" /><div className="image-caption"><span className="caption-mark"><HeartHandshake size={17} /></span><div><strong>Guidance at every step</strong><small>Helpful information, when you need it</small></div></div><span className="hero-image-wash" /></div>
    </section>
    <SampleBanner />
    <section className="customer-snapshot-grid" aria-label="Account overview">
      <article className="customer-snapshot-card"><span className="snapshot-icon snapshot-blue"><FileCheck2 size={19} /></span><div><small>APPLICATION JOURNEY</small><strong>Sample in review</strong><span>Reference: SAMPLE-APP-001</span></div><button aria-label="View sample application" onClick={() => onSectionChange("applications")}><ArrowUpRight size={17} /></button></article>
      <article className="customer-snapshot-card"><span className="snapshot-icon snapshot-gold"><FolderCheck size={19} /></span><div><small>DOCUMENT GUIDANCE</small><strong>Secure sharing planned</strong><span>No files uploaded or stored</span></div><button aria-label="View document guidance" onClick={() => onSectionChange("documents")}><ArrowUpRight size={17} /></button></article>
      <article className="customer-snapshot-card"><span className="snapshot-icon snapshot-green"><Headphones size={19} /></span><div><small>HELP & SUPPORT</small><strong>Answers when you need them</strong><span>Explore common questions</span></div><button aria-label="Open help centre" onClick={() => onSectionChange("help")}><ArrowUpRight size={17} /></button></article>
    </section>
    <div className="customer-dashboard-grid">
      <section className="customer-surface journey-surface">
        <div className="customer-surface-heading"><div><Eyebrow>YOUR JOURNEY</Eyebrow><h2>Application progress</h2><p>See how a sample application journey can be explained clearly.</p></div><span className="customer-soft-pill">Demonstration</span></div>
        <div className="application-reference-card"><span className="application-reference-icon"><FileText size={20} /></span><div><strong>Personal finance enquiry</strong><small>Reference SAMPLE-APP-001 · No live assessment</small></div><span className="application-review-label"><i /> In review</span></div>
        <div className="customer-progress-meta"><span>Illustrative journey milestones</span><strong>{stepsComplete} of {applicationSteps.length} shown complete</strong></div>
        <div className="customer-progress-track"><span style={{ width: (stepsComplete / applicationSteps.length * 100) + "%" }} /></div>
        <div className="customer-step-list">{applicationSteps.slice(0, 3).map((step, index) => <div className={"customer-step " + step.state} key={step.title}><span className="customer-step-marker">{step.state === "complete" ? <Check size={14} /> : index + 1}</span><div><strong>{step.title}</strong><p>{step.detail}</p></div><time>{step.date}</time></div>)}</div>
        <button className="customer-text-link" onClick={() => onSectionChange("applications")}>View application journey <ArrowRight size={15} /></button>
      </section>
      <aside className="customer-dashboard-aside">
        <section className="customer-guidance-card"><div className="guidance-card-art"><span className="guidance-document"><FileCheck2 size={28} /><i /><i /><i /></span><span className="guidance-spark guidance-spark-one">✦</span><span className="guidance-spark guidance-spark-two">✧</span></div><Eyebrow>A HELPFUL NEXT STEP</Eyebrow><h2>Know what to compare.</h2><p>Understand total cost, payment timing and key conditions before considering any borrowing option.</p><button className="customer-outline-button" onClick={() => onSectionChange("explore")}>Explore finance basics <ArrowRight size={15} /></button></section>
        <section className="customer-privacy-card"><span><LockKeyhole size={19} /></span><div><strong>Your privacy matters</strong><p>Only share sensitive information through a verified, secure channel.</p><button onClick={() => onSectionChange("security")}>See privacy guidance <ArrowRight size={13} /></button></div></section>
      </aside>
    </div>
    <section className="overview-activity-grid" aria-label="Sample activity and suggested next steps">
      <div className="customer-surface overview-activity-surface">
        <div className="customer-surface-heading">
          <div><Eyebrow>ACTIVITY PREVIEW</Eyebrow><h2>A clearer view of what happened.</h2><p>An example of how important updates could be grouped in one place.</p></div>
          <span className="customer-soft-pill">Sample timeline</span>
        </div>
        <div className="overview-activity-list">
          <article className="overview-activity-item">
            <span className="overview-activity-icon activity-blue"><ClipboardList size={17} /></span>
            <div><strong>Application details received</strong><p>Illustrative milestone · Personal finance enquiry</p></div>
            <time>19 Nov</time>
          </article>
          <article className="overview-activity-item">
            <span className="overview-activity-icon activity-gold"><FileCheck2 size={17} /></span>
            <div><strong>Review stage displayed</strong><p>Example status · No assessment performed</p></div>
            <time>20 Nov</time>
          </article>
          <article className="overview-activity-item">
            <span className="overview-activity-icon activity-green"><BookOpen size={17} /></span>
            <div><strong>Finance comparison guide available</strong><p>Learning resource · No offer or rate shown</p></div>
            <time>Today</time>
          </article>
        </div>
        <p className="overview-activity-disclaimer"><Info size={13} /> These entries are fictional examples, not account events or notifications.</p>
      </div>
      <aside className="customer-surface overview-next-steps">
        <div className="next-steps-heading"><span className="next-steps-icon"><Sparkles size={17} /></span><div><Eyebrow>YOUR CHECKLIST</Eyebrow><h2>Take the next step at your pace.</h2></div></div>
        <div className="overview-checklist-item"><span>01</span><div><strong>Understand the full cost</strong><p>Look beyond a headline instalment or advertised rate.</p></div></div>
        <div className="overview-checklist-item"><span>02</span><div><strong>Review the key conditions</strong><p>Check fees, timing, flexibility and what happens if plans change.</p></div></div>
        <div className="overview-checklist-item"><span>03</span><div><strong>Use trusted support</strong><p>Ask questions through verified provider channels.</p></div></div>
        <button className="customer-text-link" onClick={() => onSectionChange("help")}>Visit the help centre <ArrowRight size={15} /></button>
      </aside>
    </section>
    <section className="customer-discovery-section"><div className="customer-section-heading"><div><Eyebrow>EXPLORE POSSIBILITIES</Eyebrow><h2>Finance for life's next chapter.</h2><p>Learn the differences between finance categories and the questions worth asking.</p></div><button className="customer-text-link" onClick={() => onSectionChange("explore")}>View all categories <ArrowRight size={15} /></button></div><div className="customer-category-grid">{financeCategories.slice(0, 4).map((category) => <CategoryCard key={category.id} category={category} onSelect={() => onSectionChange("explore")} />)}</div><p className="customer-disclaimer">Learning content only. Availability and terms depend on supported products, provider criteria and local laws. This preview does not show live offers or eligibility.</p></section>
    <section className="customer-bottom-banner"><span className="bottom-banner-icon"><MessageCircle size={22} /></span><div><strong>It's okay to ask questions before making a decision.</strong><p>Explore the help centre for plain-language information about documents, applications and responsible borrowing.</p></div><button onClick={() => onSectionChange("help")}>Visit help centre <ArrowRight size={15} /></button></section>
    <div className="customer-footer-note"><ShieldCheck size={14} /> A good borrowing decision starts with clear terms, realistic repayment planning and time to compare options.</div>
  </div>;
}

function CategoryCard({ category, onSelect }: { category: FinanceCategory; onSelect: () => void }) {
  const Icon = category.icon;
  return <article className="customer-category-card"><button className="category-card-button" onClick={onSelect} aria-label={"Learn about " + category.title}><div className="category-card-art"><img src={category.image} alt="" loading="lazy" /></div><div className="category-card-copy"><span className="category-card-label"><Icon size={14} /> {category.label.toUpperCase()}</span><h3>{category.title}</h3><p>{category.description}</p><span className="category-card-link">Learn the basics <ArrowRight size={14} /></span></div></button></article>;
}

function ExploreFinance({ onNotice }: Pick<CustomerExperienceProps, "onNotice">) {
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState<FinanceCategory | null>(null);
  const dialogRef = useRef<HTMLElement | null>(null);
  useEffect(() => {
    if (!selectedCategory) return;
    const dialog = dialogRef.current;
    dialog?.focus();
    const handleDialogKeys = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSelectedCategory(null);
        return;
      }
      if (event.key !== "Tab" || !dialog) return;
      const controls = Array.from(dialog.querySelectorAll<HTMLElement>('button:not([disabled]), a[href], input:not([disabled]), [tabindex]:not([tabindex="-1"])'));
      if (controls.length === 0) return;
      const first = controls[0];
      const last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", handleDialogKeys);
    return () => window.removeEventListener("keydown", handleDialogKeys);
  }, [selectedCategory]);
  const visibleCategories = useMemo(() => financeCategories.filter((category) => {
    const matchesCategory = categoryFilter === "all" || category.id === categoryFilter;
    const matchesQuery = [category.title, category.description, category.label, ...category.productTypes].join(" ").toLowerCase().includes(query.toLowerCase());
    return matchesCategory && matchesQuery;
  }), [categoryFilter, query]);

  return <div className="customer-experience">
    <PageHeading eyebrow="FINANCE EXPLORER" title="Understand your options." description="Explore common finance categories, learn how they work and see what to compare before you make a decision." />
    <SampleBanner compact />
    <section className="explore-feature-panel"><div><span className="explore-feature-kicker"><BookOpen size={15} /> A GUIDE, NOT AN OFFER</span><h2>Start with the questions<br />that protect your choices.</h2><p>Compare the complete cost, payment schedule, conditions and support available in your country. Do not rely on an instalment figure alone.</p></div><div className="explore-feature-art"><span className="explore-feature-orbit orbit-one" /><span className="explore-feature-orbit orbit-two" /><span className="explore-feature-book"><BookOpen size={34} /></span><span className="explore-feature-star star-a">✦</span><span className="explore-feature-star star-b">✧</span></div></section>
    <section className="explore-controls"><label className="explore-search"><Search size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search finance categories" aria-label="Search finance categories" />{query && <button onClick={() => setQuery("")} aria-label="Clear search"><X size={15} /></button>}</label><div className="explore-filter-list" aria-label="Filter finance categories">{[{id:"all",label:"All topics"},...financeCategories.map(({id,label}) => ({id,label}))].map((item) => <button key={item.id} className={categoryFilter === item.id ? "explore-filter active" : "explore-filter"} aria-pressed={categoryFilter === item.id} onClick={() => setCategoryFilter(item.id)}>{item.label}</button>)}</div></section>
    <div className="explore-results-heading"><div><Eyebrow>LEARNING LIBRARY</Eyebrow><h2>Browse finance categories</h2><p className="explore-catalogue-total">{financeCategories.length} categories · {totalProductTypes} planned product types</p></div><span>{visibleCategories.length} {visibleCategories.length === 1 ? "category" : "categories"} shown · {visibleCategories.reduce((sum, category) => sum + category.productTypes.length, 0)} types</span></div>
    <div className="customer-category-grid explore-category-grid">{visibleCategories.map((category) => <article className="customer-category-card explore-card" key={category.id}><div className="category-card-art"><img src={category.image} alt="" loading="lazy" /></div><div className="category-card-copy"><span className="category-card-label">{category.label.toUpperCase()}</span><span className="category-count-tag">{category.productTypes.length} product {category.productTypes.length === 1 ? "type" : "types"}</span><h3>{category.title}</h3><p>{category.description}</p><button className="category-card-link" onClick={() => setSelectedCategory(category)}>What should I compare? <ArrowRight size={14} /></button></div></article>)}</div>
    {visibleCategories.length === 0 && <div className="explore-empty"><Search size={25} /><strong>No categories match that search.</strong><span>Try a broader term or select All topics.</span><button onClick={() => { setQuery(""); setCategoryFilter("all"); }}>Clear filters</button></div>}
    <section className="responsible-borrowing-note"><span><ShieldCheck size={20} /></span><div><strong>Take time to understand the commitment.</strong><p>Only consider borrowing after reviewing the full local disclosure and assessing whether repayments remain manageable alongside essential expenses. Support and legal protections vary by jurisdiction.</p></div></section>
    {selectedCategory && <div className="customer-modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelectedCategory(null); }}><section ref={dialogRef} className="customer-category-dialog" role="dialog" aria-modal="true" aria-labelledby="category-dialog-title" tabIndex={-1}><button className="dialog-close" onClick={() => setSelectedCategory(null)} aria-label="Close category details"><X size={19} /></button><span className="dialog-kicker">FINANCE BASICS · {selectedCategory.label.toUpperCase()}</span><h2 id="category-dialog-title">{selectedCategory.title}</h2><p>{selectedCategory.overview}</p><h3>Product structures in this category</h3><div className="product-type-chip-list">{selectedCategory.productTypes.map((type) => <span className="product-type-chip" key={type}>{type}</span>)}</div><h3>Questions worth comparing</h3><ul>{selectedCategory.compare.map((item) => <li key={item}><CheckCircle2 size={16} />{item}</li>)}</ul><div className="dialog-disclaimer"><Info size={16} /> This guide is general education, not a product offer, eligibility result or personal financial recommendation.</div><button className="button-primary dialog-done" onClick={() => { setSelectedCategory(null); onNotice("Finance learning content is available in this preview. No product, rate or application has been selected."); }}>Close guide <Check size={15} /></button></section></div>}
  </div>;
}

function applicationStatusLabel(status: CustomerApplicationStatus): string {
  const labels: Record<CustomerApplicationStatus, string> = {
    draft: "Draft",
    submitted: "Submitted",
    under_review: "Under review",
    awaiting_documents: "Awaiting documents",
    approved_conditionally: "Conditional approval",
    declined: "Declined",
    withdrawn: "Withdrawn",
    cancelled: "Cancelled",
    funding_pending: "Funding pending",
    funded: "Funded",
  };
  return labels[status];
}

function canWithdrawApplication(status: CustomerApplicationStatus): boolean {
  return status === "draft" || status === "submitted" || status === "awaiting_documents";
}

function formatApplicationDate(value: string | null): string {
  if (!value) return "Not yet recorded";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Date unavailable" : new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function ApplicationJourney({
  onSectionChange,
  applicationApi,
}: Pick<CustomerExperienceProps, "onSectionChange"> & { applicationApi?: CustomerApplicationApi }) {
  const [applications, setApplications] = useState<CustomerApplication[] | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selected, setSelected] = useState<CustomerApplication | null>(null);
  const [loading, setLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [mutationLoading, setMutationLoading] = useState(false);
  const [error, setError] = useState("");
  const [actionMessage, setActionMessage] = useState("");

  useEffect(() => {
    if (!applicationApi) return;
    let current = true;
    setLoading(true);
    setError("");
    applicationApi.listApplications().then((records) => {
      if (!current) return;
      setApplications(records);
      setSelectedId((previous) => previous && records.some((record) => record.id === previous)
        ? previous
        : records[0]?.id ?? null);
    }).catch((reason: unknown) => {
      if (!current) return;
      setError(reason instanceof Error ? reason.message : "Applications could not be loaded.");
      setApplications([]);
    }).finally(() => {
      if (current) setLoading(false);
    });
    return () => { current = false; };
  }, [applicationApi]);

  useEffect(() => {
    if (!applicationApi || !selectedId) {
      setSelected(null);
      return;
    }
    let current = true;
    setDetailLoading(true);
    applicationApi.getApplication(selectedId).then((record) => {
      if (current) setSelected(record);
    }).catch((reason: unknown) => {
      if (current) {
        setSelected(null);
        setError(reason instanceof Error ? reason.message : "Application details could not be loaded.");
      }
    }).finally(() => {
      if (current) setDetailLoading(false);
    });
    return () => { current = false; };
  }, [applicationApi, selectedId]);

  async function refreshApplications(preferredId?: string) {
    if (!applicationApi) return;
    const records = await applicationApi.listApplications();
    setApplications(records);
    const nextId = preferredId && records.some((record) => record.id === preferredId)
      ? preferredId
      : records[0]?.id ?? null;
    setSelectedId(nextId);
  }

  async function withdrawSelected() {
    if (!applicationApi || !selected || !canWithdrawApplication(selected.status)) return;
    setMutationLoading(true);
    setError("");
    setActionMessage("");
    try {
      await applicationApi.withdrawApplication(selected.id);
      await refreshApplications(selected.id);
      const refreshed = await applicationApi.getApplication(selected.id);
      setSelected(refreshed);
      setActionMessage("Your withdrawal request was recorded. The latest application status is shown below.");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "The application could not be withdrawn.");
    } finally {
      setMutationLoading(false);
    }
  }

  if (!applicationApi) {
    return <div className="customer-experience">
      <PageHeading eyebrow="APPLICATION CENTRE" title="Follow your application." description="A clear explanation of the stages a real application may move through. The record below is illustrative only." />
      <SampleBanner compact />
      <section className="application-overview-card"><div className="application-overview-top"><div className="application-product-icon"><FileText size={22} /></div><div><span className="application-id-label">SAMPLE REFERENCE</span><h2>Personal finance enquiry</h2><p>SAMPLE-APP-001 · Created 19 November 2026</p></div><span className="application-review-label"><i /> In review</span></div><div className="application-overview-bottom"><div><span>Application status</span><strong>Illustrative review stage</strong></div><div><span>Next update</span><strong>Not available in preview</strong></div><div><span>Assigned team</span><strong>Not connected</strong></div></div></section>
      <section className="customer-surface application-timeline-surface"><div className="customer-surface-heading"><div><Eyebrow>PROCESS OVERVIEW</Eyebrow><h2>Understand each stage</h2><p>Real timelines depend on complete information, required checks and local processes.</p></div><span className="customer-soft-pill">4 stages</span></div><div className="application-long-timeline">{applicationSteps.map((step, index) => <article className={"application-long-step " + step.state} key={step.title}><span className="application-long-marker">{step.state === "complete" ? <Check size={16} /> : index + 1}</span><div className="application-long-copy"><div><h3>{step.title}</h3><span className={"application-stage-state " + step.state}>{step.state === "complete" ? "Shown complete" : step.state === "current" ? "Illustrative current step" : "Upcoming stage"}</span></div><p>{step.detail}</p></div><time>{step.date}</time></article>)}</div></section>
      <section className="application-help-strip"><span><CircleHelp size={20} /></span><div><strong>Need help understanding a request?</strong><p>Read the document guidance or visit the help centre for plain-language explanations.</p></div><button onClick={() => onSectionChange("help")}>Get guidance <ArrowRight size={15} /></button></section>
      <p className="application-note"><Info size={15} /> No assessment, verification or lending decision has taken place. A real application view must be supplied by the authenticated application service.</p>
    </div>;
  }

  return <div className="customer-experience">
    <PageHeading eyebrow="APPLICATION CENTRE" title="Your applications." description="Application records and status history retrieved from your authenticated customer account." />
    <section className="live-application-security-note"><ShieldCheck size={17} /><span>Private account data · Requests are scoped by your verified customer session.</span></section>
    {error && <div className="application-api-error" role="alert"><Info size={17} /><span>{error}</span><button onClick={() => { setError(""); void refreshApplications().catch((reason: unknown) => setError(reason instanceof Error ? reason.message : "Applications could not be refreshed.")); }}>Try again</button></div>}
    {actionMessage && <div className="application-api-success" role="status"><CheckCircle2 size={17} />{actionMessage}</div>}
    {loading ? <section className="application-live-empty" aria-live="polite"><span className="application-loading-mark" /><strong>Loading your applications</strong><p>Retrieving records linked to your authenticated account.</p></section>
      : applications?.length === 0 ? <section className="application-live-empty"><span className="application-empty-mark"><FileText size={25} /></span><h2>No applications found.</h2><p>There are no application records linked to this customer account yet. This does not mean an application has been approved or declined.</p><button className="customer-outline-button" onClick={() => onSectionChange("explore")}>Explore finance information <ArrowRight size={14} /></button></section>
      : <div className="application-live-layout">
        <section className="customer-surface application-record-list"><div className="customer-surface-heading"><div><Eyebrow>YOUR RECORDS</Eyebrow><h2>Application history</h2><p>{applications?.length ?? 0} record{applications?.length === 1 ? "" : "s"} · Most recent first</p></div><span className="customer-soft-pill">Live records</span></div>
          {(applications ?? []).map((application) => <button key={application.id} className={selectedId === application.id ? "application-record-item selected" : "application-record-item"} onClick={() => { setSelectedId(application.id); setActionMessage(""); setError(""); }}>
            <span className="application-record-icon"><FileText size={17} /></span><span className="application-record-copy"><strong>{application.product_terms_snapshot.productName}</strong><small>{application.id}</small><small>{formatApplicationDate(application.created_at)}</small></span><span className={"application-record-status status-" + application.status}>{applicationStatusLabel(application.status)}</span>
          </button>)}
        </section>
        <section className="customer-surface application-record-detail" aria-live="polite">
          {detailLoading ? <div className="application-detail-loading">Loading application details…</div> : selected ? <>
            <div className="customer-surface-heading"><div><Eyebrow>APPLICATION DETAILS</Eyebrow><h2>{selected.product_terms_snapshot.productName}</h2><p>Reference {selected.id}</p></div><span className={"application-record-status status-" + selected.status}>{applicationStatusLabel(selected.status)}</span></div>
            <div className="application-facts-grid"><div><span>Requested amount</span><strong>{selected.currency_code} {selected.requested_amount}</strong></div><div><span>Requested duration</span><strong>{selected.requested_duration_days} days</strong></div><div><span>Created</span><strong>{formatApplicationDate(selected.created_at)}</strong></div><div><span>Last updated</span><strong>{formatApplicationDate(selected.updated_at)}</strong></div></div>
            <div className="application-terms-note"><Info size={15} /><span>Product terms are shown from the version snapshot saved when this application was created. They are not a live offer or approval.</span></div>
            <div className="application-live-timeline"><div className="customer-surface-heading"><div><Eyebrow>RECORDED HISTORY</Eyebrow><h3>Status timeline</h3></div><span className="customer-soft-pill">{selected.timeline?.length ?? 0} events</span></div>
              {(selected.timeline ?? []).map((event, index) => <article className="application-live-event" key={event.event_type + event.created_at + index}><span className="application-event-marker"><Check size={13} /></span><div><strong>{event.to_status ? applicationStatusLabel(event.to_status) : event.event_type.replaceAll(".", " ")}</strong><p>{event.event_type.replaceAll(".", " ")}</p><time>{formatApplicationDate(event.created_at)}</time></div></article>)}
              {(!selected.timeline || selected.timeline.length === 0) && <p className="application-no-events">No timeline events have been returned for this record.</p>}
            </div>
            {canWithdrawApplication(selected.status) && <div className="application-live-actions"><div><strong>Need to stop this application?</strong><p>You can withdraw while the application remains in an eligible pre-review stage.</p></div><button className="button-outline" disabled={mutationLoading} onClick={() => void withdrawSelected()}>{mutationLoading ? "Submitting…" : "Withdraw application"}</button></div>}
          </> : <div className="application-detail-loading">Select an application to view its recorded history.</div>}
        </section>
      </div>}
    <p className="application-note"><Info size={15} /> Statuses reflect recorded workflow events only. This screen does not make credit decisions, create offers or promise funding.</p>
  </div>;
}

function MyLoansCentre({ onSectionChange }: Pick<CustomerExperienceProps, "onSectionChange">) {
  return <div className="customer-experience">
    <PageHeading eyebrow="LOAN CENTRE" title="Your loan accounts, in one place." description="A clear home for account information, repayment schedules, statements and support." />
    <SampleBanner compact />
    <section className="loan-centre-hero">
      <div className="loan-centre-hero-copy">
        <span className="loan-centre-kicker"><ShieldCheck size={14} /> ACCOUNT INFORMATION, CLEARLY PRESENTED</span>
        <h2>Stay informed.<br />Know where you stand.</h2>
        <p>A live loan centre should give you an accurate, up-to-date view of each account and its next steps, based on verified servicing records.</p>
      </div>
      <div className="loan-centre-hero-art" aria-hidden="true">
        <span className="loan-centre-orbit loan-orbit-one" />
        <span className="loan-centre-orbit loan-orbit-two" />
        <span className="loan-centre-wallet"><WalletCards size={39} /></span>
        <span className="loan-centre-art-chip chip-one"><CalendarDays size={16} /></span>
        <span className="loan-centre-art-chip chip-two"><ReceiptText size={16} /></span>
      </div>
    </section>
    <section className="loan-readiness-grid" aria-label="Loan account data availability">
      <article className="loan-readiness-card"><span className="loan-readiness-icon"><WalletCards size={18} /></span><div><small>ACCOUNT RECORDS</small><strong>No connected accounts</strong><p>Verified servicing data will appear here.</p></div><span className="loan-readiness-status">Not connected</span></article>
      <article className="loan-readiness-card"><span className="loan-readiness-icon"><CalendarDays size={18} /></span><div><small>REPAYMENT INFORMATION</small><strong>No schedule available</strong><p>Due dates must come from the servicing ledger.</p></div><span className="loan-readiness-status">Unavailable</span></article>
      <article className="loan-readiness-card"><span className="loan-readiness-icon"><ReceiptText size={18} /></span><div><small>STATEMENTS & RECEIPTS</small><strong>No records available</strong><p>Documents appear after verified account activity.</p></div><span className="loan-readiness-status">Unavailable</span></article>
    </section>
    <section className="loan-empty-state">
      <div className="loan-empty-illustration"><span><WalletCards size={35} /></span><i /><i /></div>
      <div className="loan-empty-copy">
        <Eyebrow>ACCOUNT CONNECTION</Eyebrow>
        <h2>No loan accounts are connected.</h2>
        <p>When an authenticated loan-servicing service is connected, verified account details and repayment information will appear here. This preview does not hold or display real loans, balances, due dates or repayment obligations.</p>
        <div className="loan-empty-actions"><button className="button-primary" onClick={() => onSectionChange("explore")}>Explore finance basics <ArrowRight size={15} /></button><button className="customer-outline-button" onClick={() => onSectionChange("applications")}>View application journey <ArrowRight size={15} /></button></div>
      </div>
    </section>
    <section className="loan-account-tools">
      <div className="customer-section-heading"><div><Eyebrow>YOUR ACCOUNT TOOLS</Eyebrow><h2>Everything organised in one place.</h2><p>These areas will use verified servicing data when the relevant backend services are implemented.</p></div></div>
      <div className="loan-tools-grid">
        <article className="loan-tool-card"><span className="loan-tool-icon loan-tool-blue"><CircleDollarSign size={20} /></span><div><strong>Account overview</strong><p>Principal, outstanding amounts and account status will appear after reconciliation.</p><span className="loan-tool-state">Not connected</span></div></article>
        <article className="loan-tool-card"><span className="loan-tool-icon loan-tool-gold"><CalendarDays size={20} /></span><div><strong>Repayment schedule</strong><p>Verified due dates, instalments and payment status from the servicing ledger.</p><span className="loan-tool-state">Not connected</span></div></article>
        <article className="loan-tool-card"><span className="loan-tool-icon loan-tool-green"><ReceiptText size={20} /></span><div><strong>Statements & receipts</strong><p>Downloadable statements and transaction receipts from recorded account activity.</p><span className="loan-tool-state">Not connected</span></div></article>
        <article className="loan-tool-card"><span className="loan-tool-icon loan-tool-violet"><ClipboardList size={20} /></span><div><strong>Account support</strong><p>Ask questions, raise a dispute or request hardship guidance through secure support.</p><button className="loan-tool-link" onClick={() => onSectionChange("help")}>Visit help centre <ArrowRight size={13} /></button></div></article>
      </div>
    </section>
    <section className="loan-integrity-note"><ShieldCheck size={19} /><div><strong>Accuracy comes before account figures.</strong><p>Balances and repayments must come from posted, reconciled ledger entries—not from a display estimate or a manual status change. No financial amount is fabricated in this preview.</p></div></section>
  </div>;
}

function DocumentsCentre() {
  return <div className="customer-experience">
    <PageHeading eyebrow="DOCUMENT CENTRE" title="Know what may be needed." description="Understand common document categories and how a secure request process should work." />
    <SampleBanner compact />
    <section className="document-security-hero"><span className="document-security-icon"><FileLock2 size={26} /></span><div><Eyebrow>SECURE DOCUMENT HANDLING</Eyebrow><h2>Your documents deserve careful handling.</h2><p>This preview does not accept, upload or store files. A live document service must verify access, explain the purpose of each request and protect information throughout its lifecycle.</p></div><span className="document-lock-watermark"><LockKeyhole size={74} /></span></section>
    <section className="document-principles-section" aria-label="Safe document sharing principles">
      <div className="document-principles-heading"><Eyebrow>BEFORE YOU SHARE</Eyebrow><h2>A safer document journey has clear steps.</h2><p>These are design principles for a future secure service, not active upload controls.</p></div>
      <div className="document-principles-grid">
        <article className="document-principle-card"><span className="document-principle-number">01</span><span className="document-principle-icon"><Info size={18} /></span><strong>Understand the request</strong><p>Know why the information is needed and which organisation is asking.</p></article>
        <article className="document-principle-card"><span className="document-principle-number">02</span><span className="document-principle-icon"><ShieldCheck size={18} /></span><strong>Verify the channel</strong><p>Use an independently verified provider channel before sharing anything.</p></article>
        <article className="document-principle-card"><span className="document-principle-number">03</span><span className="document-principle-icon"><LockKeyhole size={18} /></span><strong>Check access and retention</strong><p>Understand who can view the file and how long it may be kept.</p></article>
      </div>
    </section>
    <div className="document-centre-grid"><section className="customer-surface document-list-surface"><div className="customer-surface-heading"><div><Eyebrow>DOCUMENT GUIDANCE</Eyebrow><h2>Common evidence categories</h2><p>What a provider may ask for depends on the product and applicable law.</p></div><span className="customer-soft-pill">Guide only</span></div>{documentGuidance.map((item,index) => <article className="document-guidance-row" key={item.title}><span className="document-guidance-icon">{index === 0 ? <UserRound size={18} /> : index === 1 ? <FileCheck2 size={18} /> : index === 2 ? <WalletCards size={18} /> : <FolderCheck size={18} />}</span><div><strong>{item.title}</strong><p>{item.detail}</p></div><span className="document-guidance-status">Not requested</span></article>)}</section>
      <aside className="customer-surface document-upload-surface"><div className="upload-empty-art"><span><UploadCloud size={28} /></span><i /><i /></div><h2>Secure sharing is not connected yet.</h2><p>There is no file upload, identity collection or document storage in this demonstration. Do not enter or attach personal information.</p><button disabled className="disabled-upload-button"><UploadCloud size={16} /> Upload unavailable</button><small>Enabled only after secure storage, access controls, malware scanning, retention and audit are implemented.</small></aside></div>
    <section className="document-privacy-note"><ShieldCheck size={19} /><p><strong>Share only what is requested.</strong> A responsible process should explain why a document is needed, who can access it, how long it is retained and how to ask for correction or deletion where permitted.</p></section>
  </div>;
}


function NotificationsCentre({ onSectionChange }: Pick<CustomerExperienceProps, "onSectionChange">) {
  const [filter, setFilter] = useState<"All" | "Application" | "Documents" | "Security" | "Learning">("All");
  const visible = customerNotifications.filter((item) => filter === "All" || item.kind === filter);
  const filters: ("All" | "Application" | "Documents" | "Security" | "Learning")[] = ["All", "Application", "Documents", "Security", "Learning"];
  const iconFor = (kind: CustomerNotificationKind) => {
    switch (kind) {
      case "Application": return <FileCheck2 size={18} />;
      case "Documents": return <FileText size={18} />;
      case "Security": return <ShieldCheck size={18} />;
      case "Learning": return <BookOpen size={18} />;
    }
  };
  return <div className="customer-experience">
    <PageHeading eyebrow="CUSTOMER INBOX" title="Your updates, organised." description="A place for important account notices and helpful information, with clear links to the next step." />
    <SampleBanner compact />
    <section className="notifications-hero">
      <div><span className="notifications-kicker"><BellRing size={15} /> YOUR INFORMATION, IN ONE PLACE</span><h2>Stay informed<br />without the noise.</h2><p>A real inbox should show verified messages from your provider, with clear dates, secure links and an auditable history.</p><span className="notifications-count"><strong>{customerNotifications.length}</strong> illustrative examples · No live messages</span></div>
      <div className="notifications-hero-art" aria-hidden="true"><span className="notifications-orbit notify-orbit-one" /><span className="notifications-orbit notify-orbit-two" /><span className="notifications-paper"><BellRing size={26} /><i /><i /><i /></span><span className="notifications-star notify-star-one">✦</span><span className="notifications-star notify-star-two">✧</span></div>
    </section>
    <section className="notification-status-grid" aria-label="Notification preview status">
      <article className="notification-status-card"><span className="notification-status-icon"><BellRing size={18} /></span><div><small>PREVIEW ITEMS</small><strong>{customerNotifications.length}</strong><p>Fictional examples</p></div></article>
      <article className="notification-status-card"><span className="notification-status-icon"><BookOpen size={18} /></span><div><small>TOPIC GROUPS</small><strong>{new Set(customerNotifications.map((item) => item.kind)).size}</strong><p>Illustrative categories</p></div></article>
      <article className="notification-status-card"><span className="notification-status-icon"><MessageCircle size={18} /></span><div><small>LIVE DELIVERY</small><strong>Not connected</strong><p>No messages are sent</p></div></article>
      <article className="notification-status-card"><span className="notification-status-icon"><ShieldCheck size={18} /></span><div><small>DELIVERY RECEIPTS</small><strong>Unavailable</strong><p>No delivery tracking</p></div></article>
    </section>
    <section className="customer-surface notifications-list-surface">
      <div className="customer-surface-heading"><div><Eyebrow>PREVIEW INBOX</Eyebrow><h2>Information and reminders</h2><p>Every item below is a fictional example, not a sent or received message.</p></div><span className="customer-soft-pill">Sample only</span></div>
      <div className="notifications-filter-list" role="group" aria-label="Filter notifications">
        {filters.map((item) => <button key={item} className={filter === item ? "notifications-filter active" : "notifications-filter"} aria-pressed={filter === item} onClick={() => setFilter(item)}>{item === "All" ? "All updates" : item}</button>)}
      </div>
      <div className="notifications-list" aria-live="polite">
        {visible.map((item) => <article className="notification-entry" key={item.id}>
          <span className={"notification-kind-icon notification-kind-" + item.kind.toLowerCase()}>{iconFor(item.kind)}</span>
          <div className="notification-entry-copy"><div className="notification-entry-meta"><span>{item.kind}</span><span>Sample</span></div><h3>{item.title}</h3><p>{item.message}</p><time>{item.time}</time></div>
          <button className="notification-entry-action" onClick={() => onSectionChange(item.target)}>View details <ArrowRight size={14} /></button>
        </article>)}
        {visible.length === 0 && <div className="notifications-empty"><BellRing size={22} /><strong>No examples in this category.</strong><span>Select All updates to see the sample inbox.</span></div>}
      </div>
    </section>
    <section className="notifications-privacy-note"><ShieldCheck size={19} /><div><strong>Important messages should be verifiable.</strong><p>A live notification service must authenticate message origins, avoid exposing sensitive information in previews, record delivery status and let customers control permitted notification preferences.</p></div></section>
  </div>;
}

function HelpCentre({ onNotice, onSectionChange }: Pick<CustomerExperienceProps, "onNotice" | "onSectionChange">) {
  const [expanded, setExpanded] = useState<number | null>(0);
  return <div className="customer-experience">
    <PageHeading eyebrow="CUSTOMER CARE" title="Clear answers. Considered support." description="Find plain-language guidance for applications, documents and responsible borrowing." />
    <SampleBanner compact />
    <section className="help-centre-hero"><div><span className="help-centre-icon"><HeartHandshake size={24} /></span><Eyebrow>HERE WHEN YOU NEED US</Eyebrow><h2>Every good decision<br />starts with a question.</h2><p>Explore common topics and learn how a secure support experience should work.</p></div><div className="help-centre-illustration"><span className="help-chat-bubble bubble-one"><MessageCircle size={20} /></span><span className="help-chat-bubble bubble-two"><CircleHelp size={23} /></span><span className="help-chat-bubble bubble-three"><HeartHandshake size={24} /></span><i className="help-illustration-star">✦</i></div></section>
    <section className="help-pathways-section" aria-label="Customer help pathways">
      <div className="help-pathways-heading"><Eyebrow>QUICK PATHWAYS</Eyebrow><h2>Go straight to the information you need.</h2><p>Explore the sample guidance areas without sending a support request.</p></div>
      <div className="help-pathways-grid">
        <button className="help-pathway-card" onClick={() => onSectionChange("applications")}><span className="help-pathway-icon pathway-blue"><FileCheck2 size={19} /></span><span><strong>Application journey</strong><small>Understand stages and example status updates.</small></span><ArrowRight size={16} /></button>
        <button className="help-pathway-card" onClick={() => onSectionChange("documents")}><span className="help-pathway-icon pathway-gold"><FolderCheck size={19} /></span><span><strong>Document guidance</strong><small>Learn about evidence requests and secure sharing.</small></span><ArrowRight size={16} /></button>
        <button className="help-pathway-card" onClick={() => onSectionChange("security")}><span className="help-pathway-icon pathway-green"><ShieldCheck size={19} /></span><span><strong>Account safety</strong><small>Review privacy and account-protection principles.</small></span><ArrowRight size={16} /></button>
      </div>
    </section>
    <div className="help-centre-layout"><section className="customer-surface faq-surface"><div className="customer-surface-heading"><div><Eyebrow>HELP & GUIDANCE</Eyebrow><h2>Frequently asked questions</h2><p>General information only. Your legal rights depend on local rules.</p></div><span className="customer-soft-pill">{supportQuestions.length} topics</span></div><div className="faq-list">{supportQuestions.map((item,index) => <article className={expanded === index ? "faq-item expanded" : "faq-item"} key={item.question}><button className="faq-question" aria-expanded={expanded === index} onClick={() => setExpanded(expanded === index ? null : index)}><span>{item.question}</span><ChevronDown size={18} /></button>{expanded === index && <p className="faq-answer">{item.answer}</p>}</article>)}</div></section>
      <aside className="help-contact-column"><section className="help-contact-card"><span className="help-contact-icon"><MessageCircle size={20} /></span><Eyebrow>SECURE MESSAGING</Eyebrow><h2>Talk to the right team.</h2><p>Live support messaging will be connected after customer authentication, case routing and privacy controls are ready.</p><button onClick={() => onNotice("Secure support messaging is not active in this preview. No message or personal information was sent.")}>Messaging unavailable <ArrowRight size={14} /></button></section><section className="help-safety-card"><ShieldCheck size={19} /><div><strong>Stay alert to impersonation.</strong><p>Never share passwords, one-time codes or full payment credentials with someone who contacts you unexpectedly.</p></div></section></aside></div>
    <div className="help-hours-note"><Info size={15} /> This is a demonstration help centre, not a monitored support channel. No support request has been sent.</div>
  </div>;
}

function SecurityProfile({ onNotice }: Pick<CustomerExperienceProps, "onNotice">) {
  return <div className="customer-experience">
    <PageHeading eyebrow="ACCOUNT & PRIVACY" title="Your information matters." description="Understand the controls a secure customer account should provide before sharing personal information." />
    <SampleBanner compact />
    <section className="profile-preview-card"><div className="profile-preview-avatar">SC</div><div><Eyebrow>DEMONSTRATION PROFILE</Eyebrow><h2>Sample customer</h2><p>Example profile · No verified identity or live account is connected</p></div><span className="profile-preview-status"><i /> Preview only</span></section>
    <section className="security-foundation-section" aria-label="Planned account security foundations">
      <div className="security-foundation-heading"><Eyebrow>ACCOUNT PROTECTION FRAMEWORK</Eyebrow><h2>Four foundations for a trusted account.</h2><p>Every item is a planned capability. None is enabled in this sample experience.</p></div>
      <div className="security-foundation-grid">
        <article className="security-foundation-card"><span className="security-foundation-step">01</span><span className="security-foundation-icon"><ShieldCheck size={18} /></span><strong>Verified identity</strong><small>Provider integration required</small></article>
        <article className="security-foundation-card"><span className="security-foundation-step">02</span><span className="security-foundation-icon"><LockKeyhole size={18} /></span><strong>Protected sessions</strong><small>Session controls required</small></article>
        <article className="security-foundation-card"><span className="security-foundation-step">03</span><span className="security-foundation-icon"><BellRing size={18} /></span><strong>Activity awareness</strong><small>Verified alerts required</small></article>
        <article className="security-foundation-card"><span className="security-foundation-step">04</span><span className="security-foundation-icon"><FileLock2 size={18} /></span><strong>Privacy governance</strong><small>Consent controls required</small></article>
      </div>
    </section>
    <div className="security-dashboard-grid"><section className="customer-surface security-controls-surface"><div className="customer-surface-heading"><div><Eyebrow>SECURITY PRINCIPLES</Eyebrow><h2>Designed for safer access</h2><p>These controls describe the intended product, not active account settings.</p></div><span className="customer-soft-pill">Planned controls</span></div><article className="security-control-row"><span className="security-control-icon"><LockKeyhole size={19} /></span><div><strong>Multi-factor authentication</strong><p>Use a second verification step to help protect account access.</p></div><span className="security-planned-pill">Not connected</span></article><article className="security-control-row"><span className="security-control-icon"><BellRing size={19} /></span><div><strong>Sign-in and activity alerts</strong><p>Receive clear notices about important account activity.</p></div><span className="security-planned-pill">Not connected</span></article><article className="security-control-row"><span className="security-control-icon"><FileLock2 size={19} /></span><div><strong>Privacy and consent history</strong><p>Review what information is used, why it is needed and the choices recorded.</p></div><span className="security-planned-pill">Not connected</span></article><article className="security-control-row"><span className="security-control-icon"><UserRound size={19} /></span><div><strong>Profile and access management</strong><p>Manage verified contact details and active sessions through a secure process.</p></div><span className="security-planned-pill">Not connected</span></article></section>
      <aside className="security-right-column"><section className="security-assurance-card"><span><ShieldCheck size={24} /></span><h2>Security is built into the journey.</h2><p>Before live onboarding, the platform needs tested identity controls, encryption, least-privilege access, audit history, incident response and privacy governance.</p><button onClick={() => onNotice("The security programme is tracked in the implementation plan. No account settings can be changed in this preview.")}>Security programme status <ArrowRight size={14} /></button></section><section className="security-warning-card"><Info size={18} /><div><strong>Keep sensitive details private.</strong><p>Do not enter identity numbers, passwords, one-time codes or banking information into this sample portal.</p></div></section></aside></div>
  </div>;
}

export function CustomerExperience({ section, onSectionChange, onNotice, applicationApi }: CustomerExperienceProps) {
  switch (section) {
    case "explore": return <ExploreFinance onNotice={onNotice} />;
    case "applications": return <ApplicationJourney onSectionChange={onSectionChange} applicationApi={applicationApi} />;
    case "loans": return <MyLoansCentre onSectionChange={onSectionChange} />;
    case "documents": return <DocumentsCentre />;
    case "notifications": return <NotificationsCentre onSectionChange={onSectionChange} />;
    case "help": return <HelpCentre onNotice={onNotice} onSectionChange={onSectionChange} />;
    case "security": return <SecurityProfile onNotice={onNotice} />;
    case "overview":
    default: return <CustomerOverview onSectionChange={onSectionChange} />;
  }
}
