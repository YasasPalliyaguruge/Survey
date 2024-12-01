import { useEffect, useState } from 'react'
import { useSurveyStore } from '../lib/survey-store'
import { SurveyQuestion } from '../types/survey'
import { getSurveyUrl } from '../utils/url'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Textarea } from './ui/textarea'
import { Label } from './ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Switch } from './ui/switch'

interface NewQuestion extends Partial<SurveyQuestion> {
  optionsText: string;
}

export function SurveyDashboard() {
  const { surveys, createSurvey, deleteSurvey, fetchSurveys, loading, error } = useSurveyStore()
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [newQuestion, setNewQuestion] = useState<NewQuestion>({
    type: 'text',
    text: '',
    required: false,
    optionsText: '',
  })
  const [questions, setQuestions] = useState<SurveyQuestion[]>([])

  // Debug: Log surveys whenever they change
  useEffect(() => {
    console.log('Current surveys:', surveys)
  }, [surveys])

  // Fetch surveys on mount
  useEffect(() => {
    console.log('Fetching surveys...')
    fetchSurveys()
  }, [fetchSurveys])

  const handleCreateSurvey = async () => {
    if (!title.trim()) {
      alert('Please enter a title')
      return
    }

    if (questions.length === 0) {
      alert('Please add at least one question')
      return
    }

    try {
      console.log('Creating survey with:', {
        title: title.trim(),
        description: description.trim(),
        questions,
      })

      await createSurvey({
        title: title.trim(),
        description: description.trim(),
        questions,
      })

      console.log('Survey created successfully')

      // Reset form
      setIsCreateDialogOpen(false)
      setTitle('')
      setDescription('')
      setQuestions([])
    } catch (error) {
      console.error('Error creating survey:', error)
      alert(error instanceof Error ? error.message : 'Failed to create survey')
    }
  }

  const handleAddQuestion = () => {
    if (!newQuestion.text) {
      alert('Please enter question text')
      return
    }

    if (
      (newQuestion.type === 'radio' || newQuestion.type === 'checkbox') &&
      (!newQuestion.optionsText || newQuestion.optionsText.trim() === '')
    ) {
      alert('Please enter options for radio/checkbox question')
      return
    }

    const question: SurveyQuestion = {
      id: Math.random().toString(),
      text: newQuestion.text,
      type: newQuestion.type as 'text' | 'textarea' | 'radio' | 'checkbox',
      required: newQuestion.required || false,
      options:
        newQuestion.type === 'radio' || newQuestion.type === 'checkbox'
          ? newQuestion.optionsText.split(',').map((o) => o.trim())
          : undefined,
    }

    console.log('Adding question:', question)
    setQuestions([...questions, question])
    setNewQuestion({
      type: 'text',
      text: '',
      required: false,
      optionsText: '',
    })
  }

  const handleDeleteSurvey = async (id: string) => {
    try {
      console.log('Deleting survey:', id)
      await deleteSurvey(id)
      console.log('Survey deleted successfully')
    } catch (error) {
      console.error('Error deleting survey:', error)
      alert(error instanceof Error ? error.message : 'Failed to delete survey')
    }
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Surveys</h1>
        <Button onClick={() => setIsCreateDialogOpen(true)}>Create Survey</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full text-center py-8">Loading surveys...</div>
        ) : error ? (
          <div className="col-span-full text-center py-8 text-red-500">{error}</div>
        ) : surveys.length === 0 ? (
          <div className="col-span-full text-center py-8">No surveys yet. Create one to get started!</div>
        ) : (
          surveys.map((survey) => (
            <div
              key={survey.id}
              className="border rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <h2 className="text-xl font-semibold mb-2">{survey.title}</h2>
              {survey.description && (
                <p className="text-gray-600 mb-4">{survey.description}</p>
              )}
              <div className="flex justify-between items-center">
                <Button variant="outline" onClick={() => {
                  const url = getSurveyUrl(survey.id);
                  navigator.clipboard.writeText(url);
                  alert('Survey link copied to clipboard!');
                }}>
                  Copy Link
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleDeleteSurvey(survey.id)}
                >
                  Delete
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Create Survey</DialogTitle>
            <DialogDescription>
              Create a new survey with custom questions
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Survey Title"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Survey Description"
              />
            </div>
            <div className="space-y-4">
              <h4 className="font-medium">Questions</h4>
              {questions.map((question, index) => (
                <div key={question.id} className="flex items-center gap-2">
                  <span className="font-medium">{index + 1}.</span>
                  <span>{question.text}</span>
                  <span className="text-gray-500">({question.type})</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      setQuestions(questions.filter((q) => q.id !== question.id))
                    }
                  >
                    Remove
                  </Button>
                </div>
              ))}
              <div className="space-y-2">
                <div className="grid gap-2">
                  <Label>Question Type</Label>
                  <Select
                    value={newQuestion.type}
                    onValueChange={(value: any) =>
                      setNewQuestion({ ...newQuestion, type: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="text">Text</SelectItem>
                      <SelectItem value="textarea">Text Area</SelectItem>
                      <SelectItem value="radio">Radio</SelectItem>
                      <SelectItem value="checkbox">Checkbox</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Question Text</Label>
                  <Input
                    value={newQuestion.text}
                    onChange={(e) =>
                      setNewQuestion({ ...newQuestion, text: e.target.value })
                    }
                    placeholder="Enter your question"
                  />
                </div>
                {(newQuestion.type === 'radio' ||
                  newQuestion.type === 'checkbox') && (
                  <div className="grid gap-2">
                    <Label>Options (comma-separated)</Label>
                    <Input
                      value={newQuestion.optionsText}
                      onChange={(e) =>
                        setNewQuestion({
                          ...newQuestion,
                          optionsText: e.target.value,
                        })
                      }
                      placeholder="Option 1, Option 2, Option 3"
                    />
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Switch
                    checked={newQuestion.required}
                    onCheckedChange={(checked) =>
                      setNewQuestion({ ...newQuestion, required: checked })
                    }
                  />
                  <Label>Required</Label>
                </div>
                <Button onClick={handleAddQuestion}>Add Question</Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateSurvey}>Create Survey</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
