export type CaseStatus = "Needs review" | "In progress" | "Waiting for customer" | "Completed";

export type ReviewCase = {
  id: string;
  customer: string;
  product: string;
  reference: string;
  status: CaseStatus;
  updated: string;
  owner: string;
  stage: string;
  summary: string;
};

export const reviewCases: ReviewCase[] = [
  {
    id: "case-1048",
    customer: "Amara Okafor",
    product: "Personal loan",
    reference: "LN-SAMPLE-1048",
    status: "Needs review",
    updated: "Today, 09:42",
    owner: "Unassigned",
    stage: "Document review",
    summary: "Identity and income documents have been submitted for an initial completeness review."
  },
  {
    id: "case-1042",
    customer: "Daniel Mensah",
    product: "Small business loan",
    reference: "LN-SAMPLE-1042",
    status: "Waiting for customer",
    updated: "Today, 08:16",
    owner: "Operations team",
    stage: "Additional information",
    summary: "The customer has been asked to provide a missing business registration document."
  },
  {
    id: "case-1037",
    customer: "Nadia Bello",
    product: "Education loan",
    reference: "LN-SAMPLE-1037",
    status: "In progress",
    updated: "Yesterday, 16:30",
    owner: "Verification team",
    stage: "Verification",
    summary: "The application is in a sample verification queue. No external identity provider is connected."
  },
  {
    id: "case-1029",
    customer: "Samuel Adeyemi",
    product: "Vehicle finance",
    reference: "LN-SAMPLE-1029",
    status: "Completed",
    updated: "Yesterday, 11:05",
    owner: "Operations team",
    stage: "Initial review complete",
    summary: "This illustrative case demonstrates a completed review state only; it is not a credit decision."
  }
];

export const customerTimeline = [
  { title: "Application received", detail: "Your information was received in this sample workspace.", time: "19 Nov · 09:10", done: true },
  { title: "Initial review", detail: "The application is awaiting a first review.", time: "In progress", done: false },
  { title: "Decision and next steps", detail: "Any decision will be communicated through your secure inbox.", time: "Upcoming", done: false }
];
