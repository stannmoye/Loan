import {
  BriefcaseBusiness,
  CarFront,
  GraduationCap,
  HeartPulse,
  House,
  Landmark,
  WalletCards,
  type LucideIcon
} from "lucide-react";

export type CustomerSection = "overview" | "explore" | "applications" | "documents" | "help" | "security";

export type FinanceCategory = {
  id: string;
  label: string;
  title: string;
  description: string;
  image: string;
  icon: LucideIcon;
  overview: string;
  productTypes: string[];
  compare: string[];
};

export const financeCategories: FinanceCategory[] = [
  {
    id: "personal",
    label: "Personal & consumer",
    title: "Personal finance",
    description: "Understand common borrowing structures for personal plans and everyday expenses.",
    image: "/images/personal-finance.svg",
    icon: WalletCards,
    overview: "Personal finance products can differ in how funds are provided, how interest is calculated and how repayments are scheduled. Compare the full cost and obligations before considering an application.",
    productTypes: ["Personal loan", "Debt repayment loan", "Credit builder loan", "Payday loan"],
    compare: ["The total amount repayable and how it is calculated", "The interest rate type, fees and any applicable annualised cost disclosure", "Repayment dates, late-payment consequences and early-repayment rules", "Whether a guarantor, security or other condition is required"]
  },
  {
    id: "education",
    label: "Education",
    title: "Education finance",
    description: "Learn how study funding can vary by course, institution, location and provider.",
    image: "/images/education-finance.svg",
    icon: GraduationCap,
    overview: "Education finance may be structured around tuition periods, study status or a co-borrower. Publicly supported schemes and private products can have very different eligibility and repayment rules.",
    productTypes: ["Educational loan", "Federal student loan", "Private student loan", "Parent loan", "Student loan refinance"],
    compare: ["Whether the institution and course are supported", "When funds are paid and whether living costs are included", "When repayment begins and whether study-related deferment applies", "Co-borrower duties, fees and country-specific protections"]
  },
  {
    id: "medical",
    label: "Medical & healthcare",
    title: "Medical finance",
    description: "Review important considerations for planned healthcare and treatment costs.",
    image: "/images/medical-finance.svg",
    icon: HeartPulse,
    overview: "Medical finance can involve time-sensitive treatment costs and provider-specific arrangements. Check whether the facility pays the provider directly, what happens if treatment changes and whether other support options exist.",
    productTypes: ["Medical loan", "Dental or cosmetic financing", "Medical equipment financing"],
    compare: ["The exact service or provider covered by the arrangement", "Total cost, fees, cancellation and refund terms", "Repayment affordability after essential living costs", "Privacy protections for sensitive health-related information"]
  },
  {
    id: "vehicle",
    label: "Vehicle & transport",
    title: "Vehicle finance",
    description: "Understand secured and unsecured vehicle-funding arrangements.",
    image: "/images/vehicle-finance.svg",
    icon: CarFront,
    overview: "Vehicle finance may be secured against the vehicle or use another repayment structure. Ownership, insurance, maintenance and repossession conditions can differ materially.",
    productTypes: ["Auto loan", "Motorcycle loan", "Boat or RV loan", "Fleet financing"],
    compare: ["Whether the vehicle is collateral and when ownership transfers", "Deposit, fees, insurance and total repayment cost", "Mileage, maintenance and permitted-use obligations", "What happens after missed payments or early settlement"]
  },
  {
    id: "home",
    label: "Home & mortgage",
    title: "Home finance",
    description: "Explore the concepts behind home purchases, renovation and property funding.",
    image: "/images/home-finance.svg",
    icon: House,
    overview: "Home and mortgage finance is generally a long-term commitment with legal, valuation and security requirements. Products such as government-backed mortgage programmes are only available in jurisdictions and circumstances where the relevant scheme applies.",
    productTypes: ["Mortgage", "Home equity loan", "Home equity line of credit (HELOC)", "Mortgage refinance", "FHA or VA mortgage programmes"],
    compare: ["Fixed or variable rate terms and the full repayment schedule", "Valuation, legal, insurance and other transaction costs", "Deposit, collateral, ownership and registration requirements", "Default, refinancing and early-repayment provisions"]
  },
  {
    id: "real-estate",
    label: "Real estate & property",
    title: "Real estate finance",
    description: "Learn about property acquisition, rental investment, land and renovation funding.",
    image: "/images/home-finance.svg",
    icon: House,
    overview: "Property finance can depend on the asset, title status, projected income and intended use. Investment and development structures may carry different risk, valuation and cash-flow requirements.",
    productTypes: ["Real estate loan", "Rental property loan", "Land loan", "Fix-and-flip loan"],
    compare: ["Property valuation, title and legal due diligence", "Deposit, security, fees and exit assumptions", "Rental or resale income assumptions and vacancy risk", "Construction, planning and completion conditions"]
  },
  {
    id: "construction",
    label: "Construction & development",
    title: "Construction finance",
    description: "Understand staged funding for building, renovation and development projects.",
    image: "/images/home-finance.svg",
    icon: House,
    overview: "Construction facilities may release funds in stages after approved milestones. Budget controls, contractor due diligence, permits and cost-overrun arrangements are important parts of the structure.",
    productTypes: ["Construction loan", "Renovation loan", "Developer loan"],
    compare: ["Drawdown milestones and independent progress inspections", "Approved project budget, contingency and overruns", "Permits, contractors, insurance and completion deadlines", "Conversion or repayment arrangements after completion"]
  },
  {
    id: "bridge",
    label: "Short-term & bridge",
    title: "Short-term and bridge finance",
    description: "Learn how temporary financing is structured and where repayment pressure can arise.",
    image: "/images/personal-finance.svg",
    icon: Landmark,
    overview: "Short-term facilities are designed around a defined repayment or exit event. The exit plan should be realistic and independently assessed; refinancing or asset-sale assumptions may not happen as expected.",
    productTypes: ["Bridge loan", "Hard money loan", "Short-term loan"],
    compare: ["The full cost over the expected and delayed term", "The credible repayment or exit source", "Collateral valuation and enforcement rights", "Extension fees, default interest and what happens if the exit fails"]
  },
  {
    id: "business",
    label: "General business",
    title: "Business finance",
    description: "Learn about working capital, startup funding and other business borrowing concepts.",
    image: "/images/business-finance.svg",
    icon: BriefcaseBusiness,
    overview: "Business finance may be assessed using cash flow, trading history, assets or contracts. Owners should understand whether obligations are limited to the business or include personal guarantees.",
    productTypes: ["Business loan", "Startup loan", "Working capital loan", "Business term loan"],
    compare: ["Repayment fit with realistic business cash flow", "Fees, interest, covenants and reporting obligations", "Personal guarantees, collateral and director responsibilities", "Early settlement, arrears and hardship arrangements"]
  },
  {
    id: "commercial",
    label: "Commercial",
    title: "Commercial finance",
    description: "Explore funding concepts for commercial property and larger business facilities.",
    image: "/images/business-finance.svg",
    icon: Landmark,
    overview: "Commercial facilities may involve complex security, valuation, lease, covenant and entity structures. Borrowers should review all obligations with appropriately qualified local advisers.",
    productTypes: ["Commercial loan", "Commercial real estate loan", "Commercial mortgage"],
    compare: ["Borrower entity, guarantors and security ranking", "Valuation basis, rental coverage and covenant tests", "Rate resets, fees, refinancing and maturity obligations", "Enforcement, cross-default and reporting provisions"]
  },
  {
    id: "government-backed",
    label: "Government-backed",
    title: "Government-backed finance",
    description: "Learn about public programmes that may support eligible borrowers or businesses.",
    image: "/images/business-finance.svg",
    icon: Landmark,
    overview: "Government-backed programmes are jurisdiction-specific and may be delivered by participating lenders. Programme names, eligibility and funding are not universal and must be checked with official sources in the relevant country.",
    productTypes: ["SBA loan", "USDA business loan", "Disaster relief loan"],
    compare: ["Whether the programme exists in the applicant's jurisdiction", "Official eligibility, purpose and application requirements", "Participating lender and any guarantee limitations", "Current programme status, fees and borrower responsibilities"]
  },
  {
    id: "equipment",
    label: "Equipment & asset financing",
    title: "Equipment finance",
    description: "Understand funding and leasing structures for business equipment and machinery.",
    image: "/images/business-finance.svg",
    icon: BriefcaseBusiness,
    overview: "Asset finance may be structured as a loan, lease or another secured arrangement. Ownership, maintenance, asset replacement and end-of-term obligations can vary significantly.",
    productTypes: ["Equipment financing", "Equipment leasing", "Machinery financing"],
    compare: ["Who owns the asset during and after the agreement", "Deposit, rental, fees and residual or balloon amounts", "Maintenance, insurance and replacement obligations", "Default, repossession and early termination conditions"]
  },
  {
    id: "revolving-credit",
    label: "Revolving & flexible credit",
    title: "Flexible credit",
    description: "Learn how revolving limits, credit cards and overdraft facilities work.",
    image: "/images/personal-finance.svg",
    icon: WalletCards,
    overview: "Revolving facilities allow borrowing and repayment within an agreed limit. Flexible access can make total cost less predictable when balances are repeatedly carried or limits are reused.",
    productTypes: ["Line of credit", "Business credit card", "Overdraft facility"],
    compare: ["Variable interest, annual fees and transaction charges", "Minimum payment rules and how balances accrue interest", "Limit review, reduction, suspension and renewal terms", "How repeated use affects affordability and total cost"]
  },
  {
    id: "trade-finance",
    label: "Receivables & trade finance",
    title: "Trade and receivables finance",
    description: "Understand funding linked to invoices, purchase orders and trade transactions.",
    image: "/images/business-finance.svg",
    icon: BriefcaseBusiness,
    overview: "Trade and receivables products depend on contract terms, debtor quality, delivery evidence and the underlying transaction. Recourse and non-recourse arrangements carry different risks.",
    productTypes: ["Invoice financing", "Invoice factoring", "Purchase order financing", "Letter of credit"],
    compare: ["Eligible invoices, counterparties and required evidence", "Recourse terms, reserves, fees and payment timing", "Dispute, dilution, delivery and concentration risk", "Obligations under the underlying purchase or trade contract"]
  },
  {
    id: "agriculture",
    label: "Agricultural",
    title: "Agricultural finance",
    description: "Explore funding concepts for farms, farmland, machinery and livestock.",
    image: "/images/business-finance.svg",
    icon: BriefcaseBusiness,
    overview: "Agricultural finance may be seasonal and exposed to weather, market, input-cost and commodity risks. Repayment schedules should be designed around realistic production and revenue cycles.",
    productTypes: ["Agricultural loan", "Farmland loan", "Farm equipment loan", "Livestock loan"],
    compare: ["Seasonal cash flow and realistic production assumptions", "Weather, disease, commodity and market risks", "Collateral, insurance and land-use conditions", "Repayment timing and support after a disrupted season"]
  },
  {
    id: "energy",
    label: "Energy & natural resources",
    title: "Energy and natural resources finance",
    description: "Understand project, equipment and working-capital structures for energy sectors.",
    image: "/images/business-finance.svg",
    icon: Landmark,
    overview: "Energy and natural-resource projects can involve long development periods, significant technical, environmental and commodity risks, and extensive local permitting requirements.",
    productTypes: ["Oil and gas loan", "Mining loan", "Solar and renewable energy loan"],
    compare: ["Technical feasibility and independent project diligence", "Licences, permits and environmental obligations", "Commodity, construction and offtake assumptions", "Long-term funding, decommissioning and contingency needs"]
  },
  {
    id: "community",
    label: "Community & microfinance",
    title: "Community and microfinance",
    description: "Learn about small-scale lending and group-based community finance models.",
    image: "/images/personal-finance.svg",
    icon: HeartPulse,
    overview: "Community and microfinance models vary by provider, group structure and local regulatory framework. Group members should understand individual and shared obligations before joining.",
    productTypes: ["Microloan", "Group lending", "Nonprofit or church loan"],
    compare: ["Individual versus shared repayment responsibility", "Total cost, fees and any group guarantees", "Provider status and consumer protection arrangements", "Fair treatment, complaints and hardship procedures"]
  },
  {
    id: "collateral",
    label: "Collateral-based",
    title: "Collateral-based finance",
    description: "Understand the risks of borrowing secured by assets or financial interests.",
    image: "/images/personal-finance.svg",
    icon: WalletCards,
    overview: "Collateral-based borrowing can put an asset or financial interest at risk if obligations are not met. Some structures are highly regulated or unsuitable for many borrowers; terms and protections differ by jurisdiction.",
    productTypes: ["Title loan", "Pawn loan", "Margin loan", "Life insurance policy loan"],
    compare: ["What asset or financial interest secures the facility", "Valuation, fees, interest and total cost", "When and how collateral can be taken or sold", "Special risks, tax effects and product-specific local protections"]
  },
  {
    id: "special-condition",
    label: "Special condition",
    title: "Special-condition finance",
    description: "A placeholder for carefully governed products with additional eligibility conditions.",
    image: "/images/education-finance.svg",
    icon: Landmark,
    overview: "Special-condition products require product-specific policies and enhanced review. They should only be introduced after a documented legal, compliance, suitability and operational assessment.",
    productTypes: ["Special-condition loan"],
    compare: ["The precise purpose and eligibility conditions", "Any additional risks, exclusions and protections", "Evidence requirements and privacy impact", "The approval, review and complaints process"]
  }
];

export const totalProductTypes = financeCategories.reduce((sum, category) => sum + category.productTypes.length, 0);

export const applicationSteps = [
  { title: "Application received", detail: "A sample application reference was created in this demonstration.", state: "complete" as const, date: "19 Nov · 09:10" },
  { title: "Initial review", detail: "A reviewer would check the submitted information for completeness.", state: "current" as const, date: "Illustrative" },
  { title: "Verification and assessment", detail: "Any required checks would follow approved policies and human oversight.", state: "upcoming" as const, date: "Not started" },
  { title: "Outcome and next steps", detail: "Any outcome and available options would be communicated securely.", state: "upcoming" as const, date: "Not started" }
];

export const documentGuidance = [
  { title: "Identity evidence", detail: "A valid identity document may be requested where required by local rules.", icon: "identity" },
  { title: "Address information", detail: "A recent accepted address record may be needed for some applications.", icon: "address" },
  { title: "Income or business evidence", detail: "The appropriate evidence depends on employment and product type.", icon: "income" },
  { title: "Additional supporting records", detail: "Only records relevant to the application should be requested.", icon: "additional" }
];

export const supportQuestions = [
  {
    question: "How do I know if a finance option is suitable?",
    answer: "Start with the total amount repayable, the timing of every payment and whether payments remain affordable after essential expenses. Read the full local disclosure and compare alternatives. Do not borrow based only on an advertised instalment."
  },
  {
    question: "Why might an application need more information?",
    answer: "A reviewer may need to clarify information or request a relevant record. A real platform should explain what is needed, why it is needed, how it will be used and how to submit it securely."
  },
  {
    question: "Can an application be declined?",
    answer: "A real provider may decline an application under its published, lawful assessment policy. Customers should receive any notices and review rights required by the applicable jurisdiction. This demonstration does not assess applications."
  },
  {
    question: "How should I share identity or banking information?",
    answer: "Only use a verified, secure channel provided by the organisation. Do not send passwords, one-time codes, full card details or identity documents through an unverified message or public form."
  },
  {
    question: "What if repayments become difficult?",
    answer: "Contact the lender through its verified support channel as early as possible and ask about available hardship or support arrangements. Options and legal rights differ by country."
  }
];
