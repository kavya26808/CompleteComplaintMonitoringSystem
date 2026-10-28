import type {
  Activity,
  AppData,
  Bureau,
  Complaint,
  Priority,
  Status,
  User,
} from "./types"

export const categories = [
  "Scholarship-related issues",
  "Academic issues",
  "Institution approval and compliance",
  "Infrastructure and facilities",
  "Fee-related grievances",
  "Examination-related issues",
  "Other grievances",
]

export const statuses: Status[] = [
  "Submitted",
  "Under Admin Review",
  "Assigned",
  "In Progress",
  "Awaiting User Information",
  "Awaiting AICTE Verification",
  "Returned for Further Action",
  "Resolution Rejected",
  "Resolved",
  "User Feedback Submitted",
  "Reopened / Review Requested",
]

export const bureaus: Bureau[] = [
  {
    id: "b-scholarship",
    name: "Student Support Cell",
    description: "Scholarships, student welfare and grievance support.",
    active: true,
  },
  {
    id: "b-academic",
    name: "Academic Standards Bureau",
    description: "Academic quality, examinations and curriculum matters.",
    active: true,
  },
  {
    id: "b-approval",
    name: "Approval & Compliance Bureau",
    description: "Institution approvals and regulatory compliance.",
    active: true,
  },
  {
    id: "b-infra",
    name: "Infrastructure Review Cell",
    description: "Campus facilities, accessibility and infrastructure.",
    active: true,
  },
  {
    id: "b-finance",
    name: "Fee & Finance Grievance Cell",
    description: "Fee disputes, refunds and financial grievances.",
    active: true,
  },
]

const isoDays = (offset: number) =>
  new Date(Date.now() + offset * 86400000).toISOString()
const id = () => crypto.randomUUID()

export function makeActivity(
  actorId: string,
  actorRole: User["role"],
  action: string,
  status: Status,
  note: string,
  visibility: Activity["visibility"] = "public",
  timestamp = new Date().toISOString(),
): Activity {
  return {
    id: id(),
    actorId,
    actorRole,
    action,
    newStatus: status,
    note,
    visibility,
    timestamp,
  }
}

const users: User[] = [
  {
    id: "usr-demo",
    fullName: "Aarav Sharma",
    email: "citizen@demo.in",
    phone: "9876501001",
    password: "Demo@123",
    role: "user",
    accountStatus: "active",
    institution: "Saraswati Institute of Technology",
    state: "Rajasthan",
    createdAt: isoDays(-150),
  },
  {
    id: "usr-meera",
    fullName: "Meera Nair",
    email: "meera@demo.in",
    phone: "9876501002",
    password: "Demo@123",
    role: "user",
    accountStatus: "active",
    institution: "Malabar College of Engineering",
    state: "Kerala",
    createdAt: isoDays(-140),
  },
  {
    id: "usr-kabir",
    fullName: "Kabir Das",
    email: "kabir@demo.in",
    phone: "9876501003",
    password: "Demo@123",
    role: "user",
    accountStatus: "active",
    institution: "Eastern Technical University",
    state: "West Bengal",
    createdAt: isoDays(-130),
  },
  {
    id: "adm-demo",
    fullName: "SIH Demo Administrator",
    email: "admin@aicte.demo",
    phone: "01120001000",
    password: "Admin@123",
    role: "admin",
    accountStatus: "active",
    designation: "Central Grievance Administrator",
    createdAt: isoDays(-300),
  },
  {
    id: "off-ananya",
    fullName: "Ananya Rao",
    email: "ananya.rao@aicte.demo",
    phone: "9876510001",
    password: "Officer@123",
    role: "officer",
    accountStatus: "active",
    bureauId: "b-scholarship",
    designation: "Assistant Director",
    createdAt: isoDays(-200),
  },
  {
    id: "off-vikram",
    fullName: "Vikram Singh",
    email: "vikram.singh@aicte.demo",
    phone: "9876510002",
    password: "Officer@123",
    role: "officer",
    accountStatus: "active",
    bureauId: "b-academic",
    designation: "Academic Officer",
    createdAt: isoDays(-190),
  },
  {
    id: "off-farah",
    fullName: "Farah Khan",
    email: "farah.khan@aicte.demo",
    phone: "9876510003",
    password: "Officer@123",
    role: "officer",
    accountStatus: "active",
    bureauId: "b-approval",
    designation: "Compliance Officer",
    createdAt: isoDays(-180),
  },
  {
    id: "off-rohan",
    fullName: "Rohan Patel",
    email: "rohan.patel@aicte.demo",
    phone: "9876510004",
    password: "Officer@123",
    role: "officer",
    accountStatus: "active",
    bureauId: "b-infra",
    designation: "Technical Officer",
    createdAt: isoDays(-170),
  },
  {
    id: "off-pending",
    fullName: "Devika Iyer",
    email: "devika.iyer@aicte.demo",
    phone: "9876510005",
    password: "Officer@123",
    role: "officer",
    accountStatus: "pending",
    bureauId: "b-finance",
    designation: "Finance Officer",
    createdAt: isoDays(-2),
  },
]

const subjects = [
  [
    "Scholarship payment delayed for two semesters",
    "Scholarship-related issues",
    "b-scholarship",
    "usr-demo",
  ],
  [
    "Examination result correction pending",
    "Examination-related issues",
    "b-academic",
    "usr-meera",
  ],
  [
    "Laboratory equipment does not meet stated standards",
    "Infrastructure and facilities",
    "b-infra",
    "usr-kabir",
  ],
  [
    "Institution charging unapproved development fee",
    "Fee-related grievances",
    "b-finance",
    "usr-demo",
  ],
  [
    "Approval status not reflected on student portal",
    "Institution approval and compliance",
    "b-approval",
    "usr-meera",
  ],
  [
    "Academic calendar changed without notice",
    "Academic issues",
    "b-academic",
    "usr-kabir",
  ],
  [
    "Hostel accessibility facilities unavailable",
    "Infrastructure and facilities",
    "b-infra",
    "usr-demo",
  ],
  [
    "Refund not received after admission withdrawal",
    "Fee-related grievances",
    "b-finance",
    "usr-meera",
  ],
  [
    "Merit scholarship application incorrectly rejected",
    "Scholarship-related issues",
    "b-scholarship",
    "usr-kabir",
  ],
  [
    "Internal assessment records missing",
    "Examination-related issues",
    "b-academic",
    "usr-demo",
  ],
  [
    "Mandatory disclosure information incomplete",
    "Institution approval and compliance",
    "b-approval",
    "usr-meera",
  ],
  [
    "Student grievance committee not responding",
    "Other grievances",
    "b-approval",
    "usr-kabir",
  ],
] as const

const seedStatuses: Status[] = [
  "Submitted",
  "Under Admin Review",
  "Assigned",
  "In Progress",
  "Awaiting AICTE Verification",
  "Returned for Further Action",
  "Resolved",
  "User Feedback Submitted",
  "Submitted",
  "In Progress",
  "Awaiting AICTE Verification",
  "Resolved",
]

const officerFor: Record<string, string> = {
  "b-scholarship": "off-ananya",
  "b-academic": "off-vikram",
  "b-approval": "off-farah",
  "b-infra": "off-rohan",
}

function makeComplaint(index: number): Complaint {
  const [subject, category, bureauId, complainantId] = subjects[index]
  const status = seedStatuses[index]
  const createdAt = isoDays(-95 + index * 7)
  const assigned =
    !["Submitted", "Under Admin Review"].includes(status) &&
    !!officerFor[bureauId]
  const resolved = ["Resolved", "User Feedback Submitted"].includes(status)
  const priority: Priority =
    index % 5 === 0 ? "High" : index % 3 === 0 ? "Medium" : "Low"
  const complaint: Complaint = {
    id: `CMP-2026-${String(index + 1).padStart(4, "0")}`,
    complainantId,
    subject,
    description: `${subject}. The institution was contacted through its internal grievance process, but a clear and timely outcome has not been provided. Supporting information is included for review.`,
    category,
    institution: [
      "Saraswati Institute of Technology",
      "Malabar College of Engineering",
      "Eastern Technical University",
      "Vindhya Polytechnic",
    ][index % 4],
    location: ["Rajasthan", "Kerala", "West Bengal", "Madhya Pradesh"][
      index % 4
    ],
    supportingAttachments:
      index % 2 === 0
        ? [
            {
              id: id(),
              fileName: `supporting-document-${index + 1}.pdf`,
              fileType: "application/pdf",
              fileSize: 284000,
              uploadedBy: complainantId,
              uploadedAt: createdAt,
              visibility: "public",
            },
          ]
        : [],
    priority,
    suggestedBureauId: bureauId,
    assignedBureauId: assigned ? bureauId : undefined,
    assignedOfficerId: assigned ? officerFor[bureauId] : undefined,
    status,
    deadline: assigned
      ? isoDays(index === 3 ? -4 : index === 9 ? 2 : 18)
      : undefined,
    createdAt,
    updatedAt: isoDays(-12 + index),
    summary: subject,
    activities: [
      makeActivity(
        complainantId,
        "user",
        "Complaint submitted",
        "Submitted",
        "Complaint registered successfully.",
        "public",
        createdAt,
      ),
    ],
    assignments: [],
    reports: [],
    verifications: [],
  }
  if (assigned && complaint.assignedOfficerId) {
    complaint.assignments.push({
      newBureauId: bureauId,
      newOfficerId: complaint.assignedOfficerId,
      assignedBy: "adm-demo",
      reason: "Assigned based on category and bureau workload.",
      timestamp: isoDays(-70 + index * 5),
    })
    complaint.activities.push(
      makeActivity(
        "adm-demo",
        "admin",
        "Case assigned",
        "Assigned",
        `Assigned to ${bureaus.find((b) => b.id === bureauId)?.name}.`,
        "public",
        isoDays(-70 + index * 5),
      ),
    )
  }
  if (
    [
      "In Progress",
      "Awaiting AICTE Verification",
      "Returned for Further Action",
      "Resolved",
      "User Feedback Submitted",
    ].includes(status)
  ) {
    complaint.activities.push(
      makeActivity(
        complaint.assignedOfficerId!,
        "officer",
        "Investigation started",
        "In Progress",
        "The assigned bureau has started its review.",
        "public",
        isoDays(-55 + index * 4),
      ),
    )
  }
  if (
    [
      "Awaiting AICTE Verification",
      "Returned for Further Action",
      "Resolved",
      "User Feedback Submitted",
    ].includes(status)
  ) {
    complaint.reports.push({
      id: id(),
      officerId: complaint.assignedOfficerId!,
      actionSummary:
        "Institution records reviewed and corrective action confirmed.",
      details:
        "The bureau reviewed the submitted records, contacted the institution and documented the corrective action taken.",
      actionDate: isoDays(-20).slice(0, 10),
      evidence: [
        {
          id: id(),
          fileName: `completion-evidence-${index + 1}.pdf`,
          fileType: "application/pdf",
          fileSize: 410000,
          uploadedBy: complaint.assignedOfficerId!,
          uploadedAt: isoDays(-18),
          visibility: "public",
          verificationStatus: resolved ? "approved" : "pending",
        },
      ],
      submittedAt: isoDays(-18),
    })
    complaint.activities.push(
      makeActivity(
        complaint.assignedOfficerId!,
        "officer",
        "Resolution submitted for verification",
        "Awaiting AICTE Verification",
        "Action report submitted to AICTE for verification.",
        "public",
        isoDays(-18),
      ),
    )
  }
  if (status === "Returned for Further Action") {
    complaint.verifications.push({
      id: id(),
      adminId: "adm-demo",
      decision: "returned",
      reason: "Please provide a dated acknowledgement from the institution.",
      timestamp: isoDays(-8),
    })
    complaint.activities.push(
      makeActivity(
        "adm-demo",
        "admin",
        "Returned for further action",
        status,
        "Additional evidence has been requested.",
        "public",
        isoDays(-8),
      ),
    )
  }
  if (resolved) {
    complaint.verifiedResolution =
      "AICTE reviewed the bureau report and supporting evidence. The institution completed the required corrective action and the complaint is verified as resolved."
    complaint.verifiedAt = isoDays(-5)
    complaint.verifications.push({
      id: id(),
      adminId: "adm-demo",
      decision: "approved",
      reason: complaint.verifiedResolution,
      timestamp: isoDays(-5),
    })
    complaint.activities.push(
      makeActivity(
        "adm-demo",
        "admin",
        "Resolution approved",
        "Resolved",
        "AICTE verified the resolution and closed the complaint.",
        "public",
        isoDays(-5),
      ),
    )
  }
  if (status === "User Feedback Submitted") {
    complaint.feedback = {
      userId: complainantId,
      rating: 4,
      satisfaction: "Satisfied",
      comments: "The final explanation was clear and helpful.",
      helpful: true,
      unresolved: false,
      createdAt: isoDays(-3),
    }
    complaint.activities.push(
      makeActivity(
        complainantId,
        "user",
        "Feedback submitted",
        status,
        "Citizen feedback received.",
        "internal",
        isoDays(-3),
      ),
    )
  }
  return complaint
}

export function createSeedData(): AppData {
  const complaints = subjects.map((_, index) => makeComplaint(index))
  return {
    version: 1,
    users,
    bureaus,
    complaints,
    notifications: [
      {
        id: id(),
        recipientId: "usr-demo",
        complaintId: "CMP-2026-0007",
        message: "AICTE verified the resolution for your complaint.",
        timestamp: isoDays(-5),
        read: false,
      },
      {
        id: id(),
        recipientId: "adm-demo",
        complaintId: "CMP-2026-0005",
        message: "A resolution report is awaiting AICTE verification.",
        timestamp: isoDays(-2),
        read: false,
      },
      {
        id: id(),
        recipientId: "off-ananya",
        complaintId: "CMP-2026-0001",
        message: "A new case has been assigned to you.",
        timestamp: isoDays(-1),
        read: false,
      },
    ],
  }
}

export function classifyComplaint(text: string) {
  const value = text.toLowerCase()
  const rules = [
    {
      words: ["scholarship", "stipend"],
      category: categories[0],
      bureau: "b-scholarship",
    },
    {
      words: ["exam", "result", "marks", "assessment"],
      category: categories[5],
      bureau: "b-academic",
    },
    {
      words: ["fee", "refund", "payment"],
      category: categories[4],
      bureau: "b-finance",
    },
    {
      words: ["lab", "hostel", "facility", "infrastructure"],
      category: categories[3],
      bureau: "b-infra",
    },
    {
      words: ["approval", "compliance", "disclosure"],
      category: categories[2],
      bureau: "b-approval",
    },
    {
      words: ["academic", "faculty", "curriculum"],
      category: categories[1],
      bureau: "b-academic",
    },
  ]
  const match = rules.find((rule) =>
    rule.words.some((word) => value.includes(word)),
  )
  return match
    ? {
        category: match.category,
        bureauId: match.bureau,
        reason: `Matched keywords associated with ${match.category.toLowerCase()}.`,
      }
    : {
        category: categories[6],
        bureauId: "b-approval",
        reason:
          "No specialist keyword matched; central compliance review is suggested.",
      }
}

export function suggestPriority(
  text: string,
): { priority: Priority reason: string } {
  const value = text.toLowerCase()
  if (
    ["danger", "unsafe", "harassment", "fraud", "immediate"].some((word) =>
      value.includes(word),
    )
  )
    return {
      priority: "Critical",
      reason: "Safety, fraud or immediate-risk language detected.",
    }
  if (
    ["urgent", "deadline", "final notice", "two semesters"].some((word) =>
      value.includes(word),
    )
  )
    return {
      priority: "High",
      reason: "Time-sensitive or prolonged impact language detected.",
    }
  return {
    priority: "Medium",
    reason: "Standard review priority; no critical risk phrase detected.",
  }
}
