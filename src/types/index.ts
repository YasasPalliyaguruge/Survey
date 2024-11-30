export type Student = {
  id: string;
  name: string;
  email: string;
  grade: string;
  status: 'Active' | 'Inactive';
  subjects: {
    subjectId: string;
    marks: number;
  }[];
  attendance: Attendance[];
};

export type Subject = {
  id: string;
  name: string;
  description: string;
  teacher: string;
};

export type GradeScale = {
  id: string;
  name: string;
  isDefault: boolean;
  scales: {
    grade: string;
    minScore: number;
    maxScore: number;
    description?: string;
  }[];
};

export type Attendance = {
  date: string;
  status: 'present' | 'absent' | 'late';
  notes?: string;
};

export type Resource = {
  id: string;
  title: string;
  description: string;
  type: 'document' | 'link' | 'video';
  url: string;
  subjectId?: string;
  dateAdded: string;
}; 