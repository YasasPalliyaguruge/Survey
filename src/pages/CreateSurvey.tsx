import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSurveyStore } from '../lib/survey-store'
import { SurveyQuestion } from '../types/survey'
import { Card, CardContent } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'
import { Switch } from '../components/ui/switch'
import { Textarea } from '../components/ui/textarea'

export function CreateSurvey() {
  const navigate = useNavigate()
  const { createSurvey } = useSurveyStore()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [questions, setQuestions] = useState<SurveyQuestion[]>([])
  const [newQuestion, setNewQuestion] = useState<Partial<SurveyQuestion>>({
    type: 'text',
    text: '',
    required: false,
    options: [],
  })
  const [optionsText, setOptionsText] = useState('')

  const handleAddQuestion = () => {
    if (!newQuestion.text) {
      alert('Please enter question text')
      return
    }

    if (
      (newQuestion.type === 'radio' || newQuestion.type === 'checkbox') &&
      (!optionsText || optionsText.trim() === '')
    ) {
      alert('Please enter options for radio/checkbox question')
      return
    }

    const question: SurveyQuestion = {
      id: Math.random().toString(),
      text: newQuestion.text,
      type: newQuestion.type || 'text',
      required: newQuestion.required || false,
      options:
        newQuestion.type === 'radio' || newQuestion.type === 'checkbox'
          ? optionsText.split(',').map((o) => o.trim())
          : undefined,
    }

    setQuestions([...questions, question])
    setNewQuestion({
      type: 'text',
      text: '',
      required: false,
      options: [],
    })
    setOptionsText('')
  }

  const handleCreateSurvey = () => {
    if (!title.trim()) {
      alert('Please enter a title')
      return
    }

    if (questions.length === 0) {
      alert('Please add at least one question')
      return
    }

    try {
      createSurvey({
        title: title.trim(),
        description: description.trim(),
        questions,
      })
      navigate('/')
    } catch (error) {
      console.error('Error creating survey:', error)
      alert('Failed to create survey. Please try again.')
    }
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Create Survey</h1>

      <Card>
        <CardContent className="space-y-6 pt-6">
          <div className="space-y-2">
            <Label htmlFor="title">Survey Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter survey title"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter survey description"
            />
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Questions</h2>

            {questions.map((question, index) => (
              <div key={question.id} className="flex items-center gap-2 p-4 border rounded-lg">
                <span className="font-medium">{index + 1}.</span>
                <span>{question.text}</span>
                <span className="text-gray-500">({question.type})</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setQuestions(questions.filter((q) => q.id !== question.id))}
                >
                  Remove
                </Button>
              </div>
            ))}

            <div className="space-y-4 p-4 border rounded-lg">
              <div className="space-y-2">
                <Label>Question Type</Label>
                <Select
                  value={newQuestion.type}
                  onValueChange={(value: 'text' | 'textarea' | 'radio' | 'checkbox') =>
                    setNewQuestion({ ...newQuestion, type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text">Short Answer</SelectItem>
                    <SelectItem value="textarea">Long Answer</SelectItem>
                    <SelectItem value="radio">Multiple Choice</SelectItem>
                    <SelectItem value="checkbox">Checkboxes</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Question Text</Label>
                <Input
                  value={newQuestion.text || ''}
                  onChange={(e) => setNewQuestion({ ...newQuestion, text: e.target.value })}
                  placeholder="Enter your question"
                />
              </div>

              {(newQuestion.type === 'radio' || newQuestion.type === 'checkbox') && (
                <div className="space-y-2">
                  <Label>Options (comma-separated)</Label>
                  <Input
                    value={optionsText}
                    onChange={(e) => setOptionsText(e.target.value)}
                    placeholder="Option 1, Option 2, Option 3"
                  />
                </div>
              )}

              <div className="flex items-center gap-2">
                <Switch
                  checked={newQuestion.required || false}
                  onCheckedChange={(checked) =>
                    setNewQuestion({ ...newQuestion, required: checked })
                  }
                />
                <Label>Required</Label>
              </div>

              <Button onClick={handleAddQuestion}>Add Question</Button>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => navigate('/')}>
              Cancel
            </Button>
            <Button onClick={handleCreateSurvey}>Create Survey</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
