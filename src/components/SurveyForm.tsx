import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { getSurveyById, submitResponse } from '@/lib/supabase';
import type { Survey, SurveyAnswer } from '@/types/survey';
import { Loader2 } from 'lucide-react';

const hasAnswer = (answer: SurveyAnswer | undefined): boolean => {
  if (Array.isArray(answer)) return answer.length > 0;
  return typeof answer === 'string' && answer.trim().length > 0;
};

export default function SurveyForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [survey, setSurvey] = useState<Survey | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [answers, setAnswers] = useState<Record<string, SurveyAnswer>>({});
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    let active = true;

    const loadSurvey = async () => {
      try {
        const data = await getSurveyById(id);
        if (!active) return;

        if (!data) {
          toast.error('Survey not found');
          navigate('/');
          return;
        }

        setSurvey(data);
        const initialAnswers: Record<string, SurveyAnswer> = {};
        data.questions.forEach((question) => {
          if (question.type === 'checkbox') {
            initialAnswers[question.id] = [];
          }
        });
        setAnswers(initialAnswers);
      } catch {
        if (!active) return;
        toast.error('Failed to load survey');
        navigate('/');
      } finally {
        if (active) setLoading(false);
      }
    };

    void loadSurvey();
    return () => {
      active = false;
    };
  }, [id, navigate]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!survey || !id) return;

    const missingRequired = survey.questions.some(
      (question) => question.required && !hasAnswer(answers[question.id]),
    );
    if (missingRequired) {
      toast.error('Please fill in all required fields');
      return;
    }

    setSubmitting(true);
    try {
      await submitResponse({
        survey_id: id,
        respondent_id: crypto.randomUUID(),
        answers,
      });
      setSubmitted(true);
      toast.success('Thank you for your response!');
    } catch {
      toast.error('Failed to submit survey');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAnswerChange = (questionId: string, value: SurveyAnswer) => {
    setAnswers((previous) => ({ ...previous, [questionId]: value }));
  };

  const handleCheckboxChange = (questionId: string, option: string) => {
    setAnswers((previous) => {
      const existing = previous[questionId];
      const currentAnswers = Array.isArray(existing) ? existing : [];
      const newAnswers = currentAnswers.includes(option)
        ? currentAnswers.filter((answer) => answer !== option)
        : [...currentAnswers, option];
      return { ...previous, [questionId]: newAnswers };
    });
  };

  if (loading) {
    return (
      <div className="flex h-[450px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="mx-auto max-w-2xl">
        <Card className="text-center">
          <CardHeader>
            <CardTitle className="text-2xl">Thank You!</CardTitle>
            <CardDescription>
              Your response has been successfully recorded.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Thank you for taking the time to complete this survey. Your feedback is valuable to us.
            </p>
            <p className="text-sm text-muted-foreground">
              You can now close this window.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!survey) return null;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{survey.title}</CardTitle>
          {survey.description && <CardDescription>{survey.description}</CardDescription>}
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {survey.questions.map((question) => {
              const answer = answers[question.id];
              const textAnswer = typeof answer === 'string' ? answer : '';
              const checkboxAnswers = Array.isArray(answer) ? answer : [];

              return (
                <div key={question.id} className="space-y-2">
                  <Label>
                    {question.text}
                    {question.required && <span className="ml-1 text-red-500">*</span>}
                  </Label>

                  {question.type === 'text' && (
                    <Input
                      type="text"
                      required={question.required}
                      value={textAnswer}
                      onChange={(event) => handleAnswerChange(question.id, event.target.value)}
                    />
                  )}

                  {question.type === 'textarea' && (
                    <Textarea
                      required={question.required}
                      value={textAnswer}
                      onChange={(event) => handleAnswerChange(question.id, event.target.value)}
                    />
                  )}

                  {question.type === 'radio' && question.options && (
                    <RadioGroup
                      value={textAnswer}
                      onValueChange={(value) => handleAnswerChange(question.id, value)}
                    >
                      {question.options.map((option) => (
                        <div key={option} className="flex items-center space-x-2">
                          <RadioGroupItem value={option} id={`${question.id}-${option}`} />
                          <Label htmlFor={`${question.id}-${option}`}>{option}</Label>
                        </div>
                      ))}
                    </RadioGroup>
                  )}

                  {question.type === 'checkbox' && question.options && (
                    <div className="space-y-2">
                      {question.options.map((option) => (
                        <div key={option} className="flex items-center space-x-2">
                          <Checkbox
                            id={`${question.id}-${option}`}
                            checked={checkboxAnswers.includes(option)}
                            onCheckedChange={() => handleCheckboxChange(question.id, option)}
                          />
                          <Label htmlFor={`${question.id}-${option}`}>{option}</Label>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            <Button type="submit" disabled={submitting} className="w-full">
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Submit Survey
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
