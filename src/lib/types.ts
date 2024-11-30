export type Subject = {
  id: string;
  name: string;
  maxMarks: number;
};

export type Attendance = {
  date: string;
  status: 'present' | 'absent' | 'late';
};

export type Student = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  avatar?: string;
  subjects: {
    subjectId: string;
    marks: number;
  }[];
  attendance: Attendance[];
  status: 'Active' | 'Inactive';
  createdAt: string;
};

export type GradeScale = {
  id: string;
  name: string;
  scales: {
    grade: string;
    minScore: number;
    maxScore: number;
    description?: string;
  }[];
  isDefault?: boolean;
};

export type ResourceType = 'document' | 'link' | 'video' | 'other';

export type Resource = {
  id: string;
  title: string;
  description: string;
  type: ResourceType;
  url: string;
  subjectId?: string;
  createdAt: string;
  updatedAt: string;
};