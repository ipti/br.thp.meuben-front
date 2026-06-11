export interface CreateMeeting {
  name: string;
  theme?: string;
  meeting_date?: Date;
  profiles?: Array<number>;
  classroom?: number;
  workload?: string;
}

export interface EditMeeting {
  name?: string;
  description?: string;
  status?: { id: string; name: string };
  meeting_date?: Date;
}

export interface EditMeetingUser {
  profiles: number[]
  id: number
}


export interface CreateFouls {
  meeting: number;
  registration?: Array<number>;
}

export interface CreateMeetingType {
  CreateMeeting: (data: CreateMeeting) => void;
}
