export interface MemberInput {
  name: string;
  branch: string;
  year: string;
  universityId: string;
  gender: 'Male' | 'Female' | 'Other' | '';
  email: string;
  phone: string;
  isLeader?: boolean;
}

export interface RegistrationPayload {
  teamName: string;
  domain: string;
  problemStatementId: string;
  problemStatementTitle: string;
  ideaSummary: string;
  mentorName: string;
  mentorDept: string;
  pptUrl?: string;
  pptFileName?: string;
  members: MemberInput[];
}

export interface MemberRecord extends MemberInput {
  id: string;
  teamId: string;
  isLeader: boolean;
}

export interface TeamRecord {
  id: string;
  teamId: string;
  teamName: string;
  domain: string;
  problemStatementId: string;
  problemStatementTitle: string;
  ideaSummary: string;
  mentorName: string;
  mentorDept: string;
  pptUrl?: string | null;
  pptFileName?: string | null;
  createdAt: string;
  members: MemberRecord[];
}

export interface CheckStatusResponse {
  registered: boolean;
  message?: string;
  teamName?: string;
  teamId?: string;
  domain?: string;
  problemStatementId?: string;
}
