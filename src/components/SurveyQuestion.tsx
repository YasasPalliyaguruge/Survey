import type { SurveyAnswer, SurveyQuestion as SurveyQuestionType } from '../types/survey';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Checkbox } from './ui/checkbox';

interface SurveyQuestionProps {
  question: SurveyQuestionType;
  value?: SurveyAnswer;
  onChange: (value: SurveyAnswer) => void;
}

export function SurveyQuestion({ question, value, onChange }: SurveyQuestionProps) {
  const textValue = typeof value === 'string' ? value : '';
  const selectedValues = Array.isArray(value) ? value : [];

  switch (question.type) {
    case 'text':
      return (
        <div className="space-y-2">
          <Label>
            {question.text}
            {question.required && <span className="ml-1 text-red-500">*</span>}
          </Label>
          <Input
            value={textValue}
            onChange={(event) => onChange(event.target.value)}
            placeholder="Your answer"
          />
        </div>
      );

    case 'textarea':
      return (
        <div className="space-y-2">
          <Label>
            {question.text}
            {question.required && <span className="ml-1 text-red-500">*</span>}
          </Label>
          <Textarea
            value={textValue}
            onChange={(event) => onChange(event.target.value)}
            placeholder="Your answer"
          />
        </div>
      );

    case 'radio':
      return (
        <div className="space-y-2">
          <Label>
            {question.text}
            {question.required && <span className="ml-1 text-red-500">*</span>}
          </Label>
          {question.options && (
            <RadioGroup value={textValue} onValueChange={onChange}>
              {question.options.map((option) => (
                <div key={option} className="flex items-center space-x-2">
                  <RadioGroupItem value={option} id={`${question.id}-${option}`} />
                  <Label htmlFor={`${question.id}-${option}`}>{option}</Label>
                </div>
              ))}
            </RadioGroup>
          )}
        </div>
      );

    case 'checkbox':
      return (
        <div className="space-y-2">
          <Label>
            {question.text}
            {question.required && <span className="ml-1 text-red-500">*</span>}
          </Label>
          {question.options && (
            <div className="space-y-2">
              {question.options.map((option) => (
                <div key={option} className="flex items-center space-x-2">
                  <Checkbox
                    id={`${question.id}-${option}`}
                    checked={selectedValues.includes(option)}
                    onCheckedChange={(checked) => {
                      const newValues = checked
                        ? [...selectedValues, option]
                        : selectedValues.filter((selected) => selected !== option);
                      onChange(newValues);
                    }}
                  />
                  <Label htmlFor={`${question.id}-${option}`}>{option}</Label>
                </div>
              ))}
            </div>
          )}
        </div>
      );

    default:
      return null;
  }
}
