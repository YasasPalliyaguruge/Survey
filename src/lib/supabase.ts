import { createClient } from '@supabase/supabase-js';
import type { Survey, SurveyResponse, SurveyResponseInput } from '../types/survey';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function getSurveyById(id: string): Promise<Survey | null> {
  try {
    const { data, error } = await supabase
      .from('surveys')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching survey:', error);
    return null;
  }
}

export async function submitResponse(response: SurveyResponseInput): Promise<SurveyResponse | null> {
  try {
    const { data, error } = await supabase
      .from('responses')
      .insert([response])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error submitting response:', error);
    return null;
  }
}

export async function getAllSurveys(): Promise<Survey[]> {
  try {
    const { data, error } = await supabase
      .from('surveys')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching surveys:', error);
    return [];
  }
}

export async function createSurvey(survey: Omit<Survey, 'id' | 'created_at' | 'updated_at'>): Promise<Survey | null> {
  try {
    const { data, error } = await supabase
      .from('surveys')
      .insert([survey])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating survey:', error);
    return null;
  }
}

export async function getSurveyResponses(surveyId: string): Promise<SurveyResponse[]> {
  try {
    const { data, error } = await supabase
      .from('responses')
      .select('*')
      .eq('survey_id', surveyId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching survey responses:', error);
    return [];
  }
}

export async function updateSurvey(id: string, survey: Partial<Survey>): Promise<Survey | null> {
  try {
    const { data, error } = await supabase
      .from('surveys')
      .update(survey)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating survey:', error);
    return null;
  }
}

export async function deleteSurvey(id: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('surveys')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting survey:', error);
    return false;
  }
}
