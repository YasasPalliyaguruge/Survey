import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useSurveyStore } from '../lib/survey-store'
import { Survey, SurveyQuestion } from '../types/survey'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Textarea } from './ui/textarea'
import { Label } from './ui/label'
import { RadioGroup, RadioGroupItem } from './ui/radio-group'
import { Checkbox } from './ui/checkbox'

interface FormData {
  [key: string]: string | string[]
}

export function ResponseManager() {
  const { surveyId } = useParams<{ surveyId: string }>()
  const { surveys } = useSurveyStore()
  const survey = surveys.find((s: Survey) => s.id === surveyId)
  const [formData, setFormData] = useState<FormData>({})
  const [submitted, setSubmitted] = useState(false)
  const [errors, setErrors] = useState<string[]>([])

  useEffect(() => {
    if (survey) {
      const initialData: FormData = {}
      survey.questions.forEach((q) => {
        if (q.type === 'checkbox') {
          initialData[q.id] = []
        } else {
          initialData[q.id] = ''
        }
      })
      setFormData(initialData)
    }
  }, [survey])

  if (!survey) {
    return <div>Survey not found</div>
  }

  const validateForm = () => {
    const newErrors: string[] = []
    survey.questions.forEach((q: SurveyQuestion) => {
      if (q.required && (!formData[q.id] || (Array.isArray(formData[q.id]) && formData[q.id].length === 0))) {
        newErrors.push(`${q.text} is required`)
      }
    })
    setErrors(newErrors)
    return newErrors.length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) {
      return
    }

    try {
      // TODO: Implement submission to backend
      console.log('Form data:', formData)
      setSubmitted(true)
    } catch (error) {
      console.error('Error submitting response:', error)
    }
  }

  const handleInputChange = (questionId: string, value: string | string[]) => {
    setFormData((prev) => ({
      ...prev,
      [questionId]: value,
    }))
  }

  if (submitted) {
    return (
      <div className="container mx-auto py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Thank you for your response!</h1>
        <p className="text-gray-600 mb-4">Your response has been recorded.</p>
        <Button onClick={() => window.location.reload()}>Submit Another Response</Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-2">{survey.title}</h1>
        {survey.description && <p className="text-gray-600 mb-6">{survey.description}</p>}

        {errors.length > 0 && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md mb-6">
            <p className="font-medium">Please fix the following errors:</p>
            <ul className="list-disc list-inside">
              {errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {survey.questions.map((question: SurveyQuestion) => (
            <div key={question.id} className="space-y-2">
              <Label>
                {question.text}
                {question.required && <span className="text-red-500 ml-1">*</span>}
              </Label>

              {question.type === 'text' && (
                <Input
                  value={formData[question.id] as string}
                  onChange={(e) => handleInputChange(question.id, e.target.value)}
                  placeholder="Your answer"
                />
              )}

              {question.type === 'textarea' && (
                <Textarea
                  value={formData[question.id] as string}
                  onChange={(e) => handleInputChange(question.id, e.target.value)}
                  placeholder="Your answer"
                />
              )}

              {question.type === 'radio' && question.options && (
                <RadioGroup
                  value={formData[question.id] as string}
                  onValueChange={(value) => handleInputChange(question.id, value)}
                >
                  {question.options.map((option: string, i: number) => (
                    <div key={i} className="flex items-center space-x-2">
                      <RadioGroupItem value={option} id={`${question.id}-${i}`} />
                      <Label htmlFor={`${question.id}-${i}`}>{option}</Label>
                    </div>
                  ))}
                </RadioGroup>
              )}

              {question.type === 'checkbox' && question.options && (
                <div className="space-y-2">
                  {question.options.map((option: string, i: number) => (
                    <div key={i} className="flex items-center space-x-2">
                      <Checkbox
                        id={`${question.id}-${i}`}
                        checked={(formData[question.id] as string[]).includes(option)}
                        onCheckedChange={(checked) => {
                          const currentValues = formData[question.id] as string[]
                          const newValues = checked
                            ? [...currentValues, option]
                            : currentValues.filter((v) => v !== option)
                          handleInputChange(question.id, newValues)
                        }}
                      />
                      <Label htmlFor={`${question.id}-${i}`}>{option}</Label>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}

          <Button type="submit" className="w-full">Submit</Button>
        </form>
      </div>
    </div>
  )
}
