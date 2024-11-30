import { SurveyQuestion as SurveyQuestionType } from '../types/survey'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Textarea } from './ui/textarea'
import { RadioGroup, RadioGroupItem } from './ui/radio-group'
import { Checkbox } from './ui/checkbox'

interface SurveyQuestionProps {
  question: SurveyQuestionType
  value: any
  onChange: (value: any) => void
}

export function SurveyQuestion({ question, value, onChange }: SurveyQuestionProps) {
  switch (question.type) {
    case 'text':
      return (
        <div className="space-y-2">
          <Label>
            {question.text}
            {question.required && <span className="text-red-500 ml-1">*</span>}
          </Label>
          <Input
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Your answer"
          />
        </div>
      )

    case 'textarea':
      return (
        <div className="space-y-2">
          <Label>
            {question.text}
            {question.required && <span className="text-red-500 ml-1">*</span>}
          </Label>
          <Textarea
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Your answer"
          />
        </div>
      )

    case 'radio':
      return (
        <div className="space-y-2">
          <Label>
            {question.text}
            {question.required && <span className="text-red-500 ml-1">*</span>}
          </Label>
          {question.options && (
            <RadioGroup value={value || ''} onValueChange={onChange}>
              {question.options.map((option, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <RadioGroupItem value={option} id={`${question.id}-${index}`} />
                  <Label htmlFor={`${question.id}-${index}`}>{option}</Label>
                </div>
              ))}
            </RadioGroup>
          )}
        </div>
      )

    case 'checkbox':
      return (
        <div className="space-y-2">
          <Label>
            {question.text}
            {question.required && <span className="text-red-500 ml-1">*</span>}
          </Label>
          {question.options && (
            <div className="space-y-2">
              {question.options.map((option, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <Checkbox
                    id={`${question.id}-${index}`}
                    checked={(value || []).includes(option)}
                    onCheckedChange={(checked) => {
                      const currentValues = value || []
                      const newValues = checked
                        ? [...currentValues, option]
                        : currentValues.filter((v: string) => v !== option)
                      onChange(newValues)
                    }}
                  />
                  <Label htmlFor={`${question.id}-${index}`}>{option}</Label>
                </div>
              ))}
            </div>
          )}
        </div>
      )

    default:
      return null
  }
}
