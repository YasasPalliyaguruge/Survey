import { createContext, useContext, useState, ReactNode } from 'react';
import { toast } from 'sonner';
import { getSurveyById as getSurveyByIdApi, submitResponse as submitResponseApi } from './supabase';
import type { Survey, SurveyResponse, SurveyResponseInput } from '../types/survey';

interface SurveyContextType {
  loading: boolean;
  submitting: boolean;
  error: Error | null;
  getSurvey: (id: string) => Promise<Survey | null>;
  submitSurveyResponse: (response: SurveyResponseInput) => Promise<SurveyResponse | null>;
}

const SurveyContext = createContext<SurveyContextType | undefined>(undefined);

export function SurveyProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const getSurvey = async (id: string): Promise<Survey | null> => {
    setLoading(true);
    setError(null);
    try {
      const survey = await getSurveyByIdApi(id);
      if (!survey) {
        toast.error('Survey not found');
        return null;
      }
      return survey;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch survey');
      setError(error);
      toast.error(error.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const submitSurveyResponse = async (response: SurveyResponseInput): Promise<SurveyResponse | null> => {
    setSubmitting(true);
    setError(null);
    try {
      const result = await submitResponseApi(response);
      toast.success('Response submitted successfully');
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to submit response');
      setError(error);
      toast.error(error.message);
      return null;
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SurveyContext.Provider
      value={{
        loading,
        submitting,
        error,
        getSurvey,
        submitSurveyResponse,
      }}
    >
      {children}
    </SurveyContext.Provider>
  );
}

export function useSurvey() {
  const context = useContext(SurveyContext);
  if (context === undefined) {
    throw new Error('useSurvey must be used within a SurveyProvider');
  }
  return context;
}
