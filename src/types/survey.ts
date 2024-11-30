export type QuestionType = 'text' | 'textarea' | 'radio' | 'checkbox';

export interface SurveyQuestion {
  id: string;
  type: QuestionType;
  text: string;
  required: boolean;
  options?: string[];
}

export interface Survey {
  id: string;
  title: string;
  description?: string;
  questions: SurveyQuestion[];
  created_at: string;
  updated_at: string;
  responses?: SurveyResponse[];
}

export interface SurveyResponse {
  id: string;
  survey_id: string;
  respondent_id: string;
  answers: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface SurveyResponseInput {
  survey_id: string;
  respondent_id: string;
  answers: Record<string, any>;
}
