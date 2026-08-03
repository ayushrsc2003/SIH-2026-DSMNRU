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
  ideaSummary: string;
  mentorName: string;
  mentorDept: string;
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
  ideaSummary: string;
  mentorName: string;
  mentorDept: string;
  createdAt: string;
  members: MemberRecord[];
}

export interface CheckStatusResponse {
  registered: boolean;
  message?: string;
  teamName?: string;
  teamId?: string;
}
