export type Role = "user" | "admin" | "officer"

export type Status = "Submitted" | "Under Admin Review" | "Assigned" | "In Progress" | "Awaiting User Information" | "Awaiting AICTE Verification" | "Returned for Further Action" | "Resolution Rejected" | "Resolved" | "User Feedback Submitted" | "Reopened / Review Requested"

export type Priority = "Low" | "Medium" | "High" | "Critical"

export interface User {
  id: string
  fullName: string
  email: string
  phone: string
  password: string
  role: Role
  accountStatus: "active" | "pending" | "inactive" | "rejected"
  bureauId?: string
  designation?: string
  institution?: string
  state?: string
  createdAt: string
}

export interface Bureau {
  id: string
  name: string
  description: string
  active: boolean
}

export interface Attachment {
  id: string
  fileName: string
  fileType: string
  fileSize: number
  description?: string
  uploadedBy: string
  uploadedAt: string
  visibility: "public" | "internal"
  verificationStatus?: "pending" | "approved" | "rejected"
}

export interface Activity {
  id: string
  actorId: string
  actorRole: Role
  action: string
  previousStatus?: Status
  newStatus?: Status
  note: string
  timestamp: string
  visibility: "public" | "internal"
}

export interface Assignment {
  previousBureauId?: string
  newBureauId: string
  previousOfficerId?: string
  newOfficerId: string
  assignedBy: string
  reason: string
  timestamp: string
}

export interface Report {
  id: string
  officerId: string
  actionSummary: string
  details: string
  actionDate: string
  evidence: Attachment[]
  exceptionReason?: string
  submittedAt: string
}

export interface Verification {
  id: string
  adminId: string
  decision: "approved" | "returned" | "rejected" | "information-requested"
  reason: string
  timestamp: string
}

export interface Feedback {
  userId: string
  rating: number
  satisfaction: string
  comments: string
  helpful: boolean
  unresolved: boolean
  createdAt: string
}

export interface Complaint {
  id: string
  complainantId: string
  subject: string
  description: string
  category: string
  institution: string
  location: string
  incidentDate?: string
  supportingAttachments: Attachment[]
  priority: Priority
  suggestedBureauId?: string
  assignedBureauId?: string
  assignedOfficerId?: string
  status: Status
  deadline?: string
  createdAt: string
  updatedAt: string
  summary: string
  activities: Activity[]
  assignments: Assignment[]
  reports: Report[]
  verifications: Verification[]
  verifiedResolution?: string
  verifiedAt?: string
  feedback?: Feedback
}

export interface Notification {
  id: string
  recipientId: string
  complaintId?: string
  message: string
  timestamp: string
  read: boolean
}

export interface AppData {
  version: number
  users: User[]
  bureaus: Bureau[]
  complaints: Complaint[]
  notifications: Notification[]
}
