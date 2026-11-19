import { useMemo, useState, type ReactNode } from "react";
import {
  ArrowRight, ArrowUpRight, BellRing, BookOpen, Check, CheckCircle2,
  ChevronDown, CircleHelp, FileCheck2, FileLock2, FileText,
  FolderCheck, Headphones, HeartHandshake, Info, LockKeyhole, MessageCircle,
  Search, ShieldCheck, Sparkles, UploadCloud, UserRound, WalletCards, X
} from "lucide-react";
import {
  applicationSteps, documentGuidance, financeCategories, supportQuestions,
  type CustomerSection, type FinanceCategory
} from "./customer-data";

type CustomerExperienceProps = {
  section: CustomerSection;
  onSectionChange: (section: CustomerSection) => void;
  onNotice: (message: string) => void;
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

function CustomerOverview({ onSectionChange, onNotice }: Pick<CustomerExperienceProps, "onSectionChange" | "onNotice">) {
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
    <section className="customer-discovery-section"><div className="customer-section-heading"><div><Eyebrow>EXPLORE POSSIBILITIES</Eyebrow><h2>Finance for life's next chapter.</h2><p>Learn the differences between finance categories and the questions worth asking.</p></div><button className="customer-text-link" onClick={() => onSectionChange("explore")}>View all categories <ArrowRight size={15} /></button></div><div className="customer-category-grid">{financeCategories.slice(0, 4).map((category) => <CategoryCard key={category.id} category={category} onSelect={() => onSectionChange("explore")} />)}</div><p className="customer-disclaimer">Learning content only. Availability and terms depend on supported products, provider criteria and local laws. This preview does not show live offers or eligibility.</p></section>
    <section className="customer-bottom-banner"><span className="bottom-banner-icon"><MessageCircle size={22} /></span><div><strong>It's okay to ask questions before making a decision.</strong><p>Explore the help centre for plain-language information about documents, applications and responsible borrowing.</p></div><button onClick={() => onSectionChange("help")}>Visit help centre <ArrowRight size={15} /></button></section>
    <div className="customer-footer-note"><ShieldCheck size={14} /> A good borrowing decision starts with clear terms, realistic repayment planning and time to compare options.</div>
    <button className="visually-hidden" onClick={() => onNotice("This is a sample-only customer environment.")}>Preview information</button>
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
  const visibleCategories = useMemo(() => financeCategories.filter((category) => {
    const matchesCategory = categoryFilter === "all" || category.id === categoryFilter;
    const matchesQuery = [category.title, category.description, category.label].join(" ").toLowerCase().includes(query.toLowerCase());
    return matchesCategory && matchesQuery;
  }), [categoryFilter, query]);

  return <div className="customer-experience">
    <PageHeading eyebrow="FINANCE EXPLORER" title="Understand your options." description="Explore common finance categories, learn how they work and see what to compare before you make a decision." />
    <SampleBanner compact />
    <section className="explore-feature-panel"><div><span className="explore-feature-kicker"><BookOpen size={15} /> A GUIDE, NOT AN OFFER</span><h2>Start with the questions<br />that protect your choices.</h2><p>Compare the complete cost, payment schedule, conditions and support available in your country. Do not rely on an instalment figure alone.</p></div><div className="explore-feature-art"><span className="explore-feature-orbit orbit-one" /><span className="explore-feature-orbit orbit-two" /><span className="explore-feature-book"><BookOpen size={34} /></span><span className="explore-feature-star star-a">✦</span><span className="explore-feature-star star-b">✧</span></div></section>
    <section className="explore-controls"><label className="explore-search"><Search size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search finance categories" aria-label="Search finance categories" />{query && <button onClick={() => setQuery("")} aria-label="Clear search"><X size={15} /></button>}</label><div className="explore-filter-list" aria-label="Filter finance categories">{[{id:"all",label:"All topics"},...financeCategories.map(({id,label}) => ({id,label}))].map((item) => <button key={item.id} className={categoryFilter === item.id ? "explore-filter active" : "explore-filter"} aria-pressed={categoryFilter === item.id} onClick={() => setCategoryFilter(item.id)}>{item.label}</button>)}</div></section>
    <div className="explore-results-heading"><div><Eyebrow>LEARNING LIBRARY</Eyebrow><h2>Browse finance categories</h2></div><span>{visibleCategories.length} {visibleCategories.length === 1 ? "category" : "categories"}</span></div>
    <div className="customer-category-grid explore-category-grid">{visibleCategories.map((category) => <article className="customer-category-card explore-card" key={category.id}><div className="category-card-art"><img src={category.image} alt="" loading="lazy" /></div><div className="category-card-copy"><span className="category-card-label">{category.label.toUpperCase()}</span><h3>{category.title}</h3><p>{category.description}</p><button className="category-card-link" onClick={() => setSelectedCategory(category)}>What should I compare? <ArrowRight size={14} /></button></div></article>)}</div>
    {visibleCategories.length === 0 && <div className="explore-empty"><Search size={25} /><strong>No categories match that search.</strong><span>Try a broader term or select All topics.</span><button onClick={() => { setQuery(""); setCategoryFilter("all"); }}>Clear filters</button></div>}
    <section className="responsible-borrowing-note"><span><ShieldCheck size={20} /></span><div><strong>Take time to understand the commitment.</strong><p>Only consider borrowing after reviewing the full local disclosure and assessing whether repayments remain manageable alongside essential expenses. Support and legal protections vary by jurisdiction.</p></div></section>
    {selectedCategory && <div className="customer-modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelectedCategory(null); }}><section className="customer-category-dialog" role="dialog" aria-modal="true" aria-labelledby="category-dialog-title"><button className="dialog-close" onClick={() => setSelectedCategory(null)} aria-label="Close category details"><X size={19} /></button><span className="dialog-kicker">FINANCE BASICS · {selectedCategory.label.toUpperCase()}</span><h2 id="category-dialog-title">{selectedCategory.title}</h2><p>{selectedCategory.overview}</p><h3>Questions worth comparing</h3><ul>{selectedCategory.compare.map((item) => <li key={item}><CheckCircle2 size={16} />{item}</li>)}</ul><div className="dialog-disclaimer"><Info size={16} /> This guide is general education, not a product offer, eligibility result or personal financial recommendation.</div><button className="button-primary dialog-done" onClick={() => { setSelectedCategory(null); onNotice("Finance learning content is available in this preview. No product, rate or application has been selected."); }}>Close guide <Check size={15} /></button></section></div>}
  </div>;
}

function ApplicationJourney({ onSectionChange }: Pick<CustomerExperienceProps, "onSectionChange">) {
  return <div className="customer-experience">
    <PageHeading eyebrow="APPLICATION CENTRE" title="Follow your application." description="A clear explanation of the stages a real application may move through. The record below is illustrative only." />
    <SampleBanner compact />
    <section className="application-overview-card"><div className="application-overview-top"><div className="application-product-icon"><FileText size={22} /></div><div><span className="application-id-label">SAMPLE REFERENCE</span><h2>Personal finance enquiry</h2><p>SAMPLE-APP-001 · Created 19 November 2026</p></div><span className="application-review-label"><i /> In review</span></div><div className="application-overview-bottom"><div><span>Application status</span><strong>Illustrative review stage</strong></div><div><span>Next update</span><strong>Not available in preview</strong></div><div><span>Assigned team</span><strong>Not connected</strong></div></div></section>
    <section className="customer-surface application-timeline-surface"><div className="customer-surface-heading"><div><Eyebrow>PROCESS OVERVIEW</Eyebrow><h2>Understand each stage</h2><p>Real timelines depend on complete information, required checks and local processes.</p></div><span className="customer-soft-pill">4 stages</span></div><div className="application-long-timeline">{applicationSteps.map((step, index) => <article className={"application-long-step " + step.state} key={step.title}><span className="application-long-marker">{step.state === "complete" ? <Check size={16} /> : index + 1}</span><div className="application-long-copy"><div><h3>{step.title}</h3><span className={"application-stage-state " + step.state}>{step.state === "complete" ? "Shown complete" : step.state === "current" ? "Illustrative current step" : "Upcoming stage"}</span></div><p>{step.detail}</p></div><time>{step.date}</time></article>)}</div></section>
    <section className="application-help-strip"><span><CircleHelp size={20} /></span><div><strong>Need help understanding a request?</strong><p>Read the document guidance or visit the help centre for plain-language explanations.</p></div><button onClick={() => onSectionChange("help")}>Get guidance <ArrowRight size={15} /></button></section>
    <p className="application-note"><Info size={15} /> No assessment, verification or lending decision has taken place. A real application view must be supplied by the authenticated application service.</p>
  </div>;
}

function DocumentsCentre() {
  return <div className="customer-experience">
    <PageHeading eyebrow="DOCUMENT CENTRE" title="Know what may be needed." description="Understand common document categories and how a secure request process should work." />
    <SampleBanner compact />
    <section className="document-security-hero"><span className="document-security-icon"><FileLock2 size={26} /></span><div><Eyebrow>SECURE DOCUMENT HANDLING</Eyebrow><h2>Your documents deserve careful handling.</h2><p>This preview does not accept, upload or store files. A live document service must verify access, explain the purpose of each request and protect information throughout its lifecycle.</p></div><span className="document-lock-watermark"><LockKeyhole size={74} /></span></section>
    <div className="document-centre-grid"><section className="customer-surface document-list-surface"><div className="customer-surface-heading"><div><Eyebrow>DOCUMENT GUIDANCE</Eyebrow><h2>Common evidence categories</h2><p>What a provider may ask for depends on the product and applicable law.</p></div><span className="customer-soft-pill">Guide only</span></div>{documentGuidance.map((item,index) => <article className="document-guidance-row" key={item.title}><span className="document-guidance-icon">{index === 0 ? <UserRound size={18} /> : index === 1 ? <FileCheck2 size={18} /> : index === 2 ? <WalletCards size={18} /> : <FolderCheck size={18} />}</span><div><strong>{item.title}</strong><p>{item.detail}</p></div><span className="document-guidance-status">Not requested</span></article>)}</section>
      <aside className="customer-surface document-upload-surface"><div className="upload-empty-art"><span><UploadCloud size={28} /></span><i /><i /></div><h2>Secure sharing is not connected yet.</h2><p>There is no file upload, identity collection or document storage in this demonstration. Do not enter or attach personal information.</p><button disabled className="disabled-upload-button"><UploadCloud size={16} /> Upload unavailable</button><small>Enabled only after secure storage, access controls, malware scanning, retention and audit are implemented.</small></aside></div>
    <section className="document-privacy-note"><ShieldCheck size={19} /><p><strong>Share only what is requested.</strong> A responsible process should explain why a document is needed, who can access it, how long it is retained and how to ask for correction or deletion where permitted.</p></section>
  </div>;
}

function HelpCentre({ onNotice }: Pick<CustomerExperienceProps, "onNotice">) {
  const [expanded, setExpanded] = useState<number | null>(0);
  return <div className="customer-experience">
    <PageHeading eyebrow="CUSTOMER CARE" title="Clear answers. Considered support." description="Find plain-language guidance for applications, documents and responsible borrowing." />
    <SampleBanner compact />
    <section className="help-centre-hero"><div><span className="help-centre-icon"><HeartHandshake size={24} /></span><Eyebrow>HERE WHEN YOU NEED US</Eyebrow><h2>Every good decision<br />starts with a question.</h2><p>Explore common topics and learn how a secure support experience should work.</p></div><div className="help-centre-illustration"><span className="help-chat-bubble bubble-one"><MessageCircle size={20} /></span><span className="help-chat-bubble bubble-two"><CircleHelp size={23} /></span><span className="help-chat-bubble bubble-three"><HeartHandshake size={24} /></span><i className="help-illustration-star">✦</i></div></section>
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
    <div className="security-dashboard-grid"><section className="customer-surface security-controls-surface"><div className="customer-surface-heading"><div><Eyebrow>SECURITY PRINCIPLES</Eyebrow><h2>Designed for safer access</h2><p>These controls describe the intended product, not active account settings.</p></div><span className="customer-soft-pill">Planned controls</span></div><article className="security-control-row"><span className="security-control-icon"><LockKeyhole size={19} /></span><div><strong>Multi-factor authentication</strong><p>Use a second verification step to help protect account access.</p></div><span className="security-planned-pill">Not connected</span></article><article className="security-control-row"><span className="security-control-icon"><BellRing size={19} /></span><div><strong>Sign-in and activity alerts</strong><p>Receive clear notices about important account activity.</p></div><span className="security-planned-pill">Not connected</span></article><article className="security-control-row"><span className="security-control-icon"><FileLock2 size={19} /></span><div><strong>Privacy and consent history</strong><p>Review what information is used, why it is needed and the choices recorded.</p></div><span className="security-planned-pill">Not connected</span></article><article className="security-control-row"><span className="security-control-icon"><UserRound size={19} /></span><div><strong>Profile and access management</strong><p>Manage verified contact details and active sessions through a secure process.</p></div><span className="security-planned-pill">Not connected</span></article></section>
      <aside className="security-right-column"><section className="security-assurance-card"><span><ShieldCheck size={24} /></span><h2>Security is built into the journey.</h2><p>Before live onboarding, the platform needs tested identity controls, encryption, least-privilege access, audit history, incident response and privacy governance.</p><button onClick={() => onNotice("The security programme is tracked in the implementation plan. No account settings can be changed in this preview.")}>Security programme status <ArrowRight size={14} /></button></section><section className="security-warning-card"><Info size={18} /><div><strong>Keep sensitive details private.</strong><p>Do not enter identity numbers, passwords, one-time codes or banking information into this sample portal.</p></div></section></aside></div>
  </div>;
}

export function CustomerExperience({ section, onSectionChange, onNotice }: CustomerExperienceProps) {
  switch (section) {
    case "explore": return <ExploreFinance onNotice={onNotice} />;
    case "applications": return <ApplicationJourney onSectionChange={onSectionChange} />;
    case "documents": return <DocumentsCentre />;
    case "help": return <HelpCentre onNotice={onNotice} />;
    case "security": return <SecurityProfile onNotice={onNotice} />;
    case "overview":
    default: return <CustomerOverview onSectionChange={onSectionChange} onNotice={onNotice} />;
  }
}
