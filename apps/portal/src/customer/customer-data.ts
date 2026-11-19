import {
  BriefcaseBusiness,
  CarFront,
  GraduationCap,
  HeartPulse,
  House,
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
  compare: string[];
};

export const financeCategories: FinanceCategory[] = [
  {
    id: "personal",
    label: "Personal",
    title: "Personal finance",
    description: "Understand common borrowing structures for personal plans and everyday expenses.",
    image: "/images/personal-finance.svg",
    icon: WalletCards,
    overview: "Personal finance products can differ in how funds are provided, how interest is calculated and how repayments are scheduled. Compare the full cost and obligations before considering an application.",
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
    compare: ["Whether the institution and course are supported", "When funds are paid and whether living costs are included", "When repayment begins and whether study-related deferment applies", "Co-borrower duties, fees and country-specific protections"]
  },
  {
    id: "medical",
    label: "Medical",
    title: "Medical finance",
    description: "Review important considerations for planned healthcare and treatment costs.",
    image: "/images/medical-finance.svg",
    icon: HeartPulse,
    overview: "Medical finance can involve time-sensitive treatment costs and provider-specific arrangements. Check whether the facility pays the provider directly, what happens if treatment changes and whether other support options exist.",
    compare: ["The exact service or provider covered by the arrangement", "Total cost, fees, cancellation and refund terms", "Repayment affordability after essential living costs", "Privacy protections for sensitive health-related information"]
  },
  {
    id: "vehicle",
    label: "Vehicle",
    title: "Vehicle finance",
    description: "Understand secured and unsecured vehicle-funding arrangements.",
    image: "/images/vehicle-finance.svg",
    icon: CarFront,
    overview: "Vehicle finance may be secured against the vehicle or use another repayment structure. Ownership, insurance, maintenance and repossession conditions can differ materially.",
    compare: ["Whether the vehicle is collateral and when ownership transfers", "Deposit, fees, insurance and total repayment cost", "Mileage, maintenance and permitted-use obligations", "What happens after missed payments or early settlement"]
  },
  {
    id: "home",
    label: "Home & property",
    title: "Home finance",
    description: "Explore the concepts behind home purchases, renovation and property funding.",
    image: "/images/home-finance.svg",
    icon: House,
    overview: "Home and property finance is usually a long-term commitment with legal, valuation and security requirements. The structure and protections depend on the property and local rules.",
    compare: ["Fixed or variable rate terms and the full repayment schedule", "Valuation, legal, insurance and other transaction costs", "Deposit, collateral, ownership and registration requirements", "Default, refinancing and early-repayment provisions"]
  },
  {
    id: "business",
    label: "Business",
    title: "Business finance",
    description: "Learn about working capital, equipment and other business funding concepts.",
    image: "/images/business-finance.svg",
    icon: BriefcaseBusiness,
    overview: "Business finance may be assessed using cash flow, trading history, assets or contracts. Directors and owners should understand whether obligations are limited to the business or include personal guarantees.",
    compare: ["Repayment fit with realistic business cash flow", "Fees, interest, covenants and reporting obligations", "Personal guarantees, collateral and director responsibilities", "Early settlement, arrears and hardship arrangements"]
  }
];

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
