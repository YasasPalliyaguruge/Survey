import { create } from 'zustand'
import { Survey } from '../types/survey'
import { createSurvey as createSurveyApi, getAllSurveys, updateSurvey as updateSurveyApi, deleteSurvey as deleteSurveyApi } from './supabase'

interface SurveyStore {
  surveys: Survey[]
  loading: boolean
  error: string | null
  createSurvey: (survey: Omit<Survey, 'id' | 'created_at' | 'updated_at' | 'responses'>) => Promise<void>
  updateSurvey: (id: string, survey: Partial<Survey>) => Promise<void>
  deleteSurvey: (id: string) => Promise<void>
  fetchSurveys: () => Promise<void>
}

// Initialize store
export const useSurveyStore = create<SurveyStore>((set, get) => ({
  surveys: [],
  loading: false,
  error: null,

  fetchSurveys: async () => {
    try {
      set({ loading: true, error: null })
      const surveys = await getAllSurveys()
      set({ surveys, loading: false })
    } catch (error) {
      console.error('Error fetching surveys:', error)
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch surveys',
        loading: false 
      })
    }
  },

  createSurvey: async (survey) => {
    try {
      set({ loading: true, error: null })

      // Validate required fields
      if (!survey.title) {
        throw new Error('Survey title is required')
      }
      if (!survey.questions || survey.questions.length === 0) {
        throw new Error('Survey must have at least one question')
      }

      // Create survey in Supabase
      const newSurvey = await createSurveyApi(survey)
      if (!newSurvey) {
        throw new Error('Failed to create survey')
      }

      // Update local state
      set(state => ({ 
        surveys: [newSurvey, ...state.surveys],
        loading: false,
        error: null
      }))

      console.log('Survey created successfully:', newSurvey)
    } catch (error) {
      console.error('Error creating survey:', error)
      set({ 
        error: error instanceof Error ? error.message : 'Failed to create survey',
        loading: false 
      })
      throw error
    }
  },

  updateSurvey: async (id, surveyUpdate) => {
    try {
      set({ loading: true, error: null })
      
      const currentSurveys = get().surveys
      const survey = currentSurveys.find(s => s.id === id)
      if (!survey) {
        throw new Error('Survey not found')
      }

      console.log('Updating survey:', id, surveyUpdate)

      // Update in Supabase
      const updatedSurvey = await updateSurveyApi(id, surveyUpdate)
      if (!updatedSurvey) {
        throw new Error('Failed to update survey')
      }

      // Update local state
      const updatedSurveys = currentSurveys.map((s) =>
        s.id === id ? updatedSurvey : s
      )

      set({ 
        surveys: updatedSurveys,
        loading: false,
        error: null
      })

      console.log('Survey updated successfully')
    } catch (error) {
      console.error('Error updating survey:', error)
      set({ 
        error: error instanceof Error ? error.message : 'Failed to update survey',
        loading: false 
      })
      throw error
    }
  },

  deleteSurvey: async (id) => {
    try {
      set({ loading: true, error: null })
      console.log('Deleting survey:', id)

      // Delete from Supabase
      const success = await deleteSurveyApi(id)
      if (!success) {
        throw new Error('Failed to delete survey')
      }

      // Update local state
      const currentSurveys = get().surveys
      const updatedSurveys = currentSurveys.filter((s) => s.id !== id)

      set({ 
        surveys: updatedSurveys,
        loading: false,
        error: null
      })

      console.log('Survey deleted successfully')
    } catch (error) {
      console.error('Error deleting survey:', error)
      set({ 
        error: error instanceof Error ? error.message : 'Failed to delete survey',
        loading: false 
      })
      throw error
    }
  }
}))
