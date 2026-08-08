import { useEffect, useState } from 'react';
import { useSurveyStore } from '../lib/survey-store';
import type { QuestionType, SurveyQuestion } from '../types/survey';
import { getSurveyUrl } from '../utils/url';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Switch } from './ui/switch';

interface NewQuestion extends Partial<SurveyQuestion> {
  optionsText: string;
}

const isQuestionType = (value: string): value is QuestionType =>
  value === 'text' || value === 'textarea' || value === 'radio' || value === 'checkbox';

export function SurveyDashboard() {
  const { surveys, createSurvey, deleteSurvey, fetchSurveys, loading, error } = useSurveyStore();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [newQuestion, setNewQuestion] = useState<NewQuestion>({
    type: 'text',
    text: '',
    required: false,
    optionsText: '',
  });
  const [questions, setQuestions] = useState<SurveyQuestion[]>([]);

  useEffect(() => {
    void fetchSurveys();
  }, [fetchSurveys]);

  const handleCreateSurvey = async () => {
    if (!title.trim()) {
      alert('Please enter a title');
      return;
    }

    if (questions.length === 0) {
      alert('Please add at least one question');
      return;
    }

    try {
      await createSurvey({
        title: title.trim(),
        description: description.trim(),
        questions,
      });

      setIsCreateDialogOpen(false);
      setTitle('');
      setDescription('');
      setQuestions([]);
    } catch (createError) {
      alert(createError instanceof Error ? createError.message : 'Failed to create survey');
    }
  };

  const handleAddQuestion = () => {
    if (!newQuestion.text) {
      alert('Please enter question text');
      return;
    }

    if (
      (newQuestion.type === 'radio' || newQuestion.type === 'checkbox') &&
      (!newQuestion.optionsText || newQuestion.optionsText.trim() === '')
    ) {
      alert('Please enter options for radio/checkbox question');
      return;
    }

    const question: SurveyQuestion = {
      id: crypto.randomUUID(),
      text: newQuestion.text,
      type: newQuestion.type ?? 'text',
      required: newQuestion.required || false,
      options:
        newQuestion.type === 'radio' || newQuestion.type === 'checkbox'
          ? newQuestion.optionsText.split(',').map((option) => option.trim()).filter(Boolean)
          : undefined,
    };

    setQuestions((current) => [...current, question]);
    setNewQuestion({
      type: 'text',
      text: '',
      required: false,
      optionsText: '',
    });
  };

  const handleDeleteSurvey = async (id: string) => {
    try {
      await deleteSurvey(id);
    } catch (deleteError) {
      alert(deleteError instanceof Error ? deleteError.message : 'Failed to delete survey');
    }
  };

  const handleCopyLink = async (id: string) => {
    try {
      await navigator.clipboard.writeText(getSurveyUrl(id));
      alert('Survey link copied to clipboard!');
    } catch {
      alert('Could not copy the survey link.');
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Surveys</h1>
        <Button onClick={() => setIsCreateDialogOpen(true)}>Create Survey</Button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <div className="col-span-full py-8 text-center">Loading surveys...</div>
        ) : error ? (
          <div className="col-span-full py-8 text-center text-red-500">{error}</div>
        ) : surveys.length === 0 ? (
          <div className="col-span-full py-8 text-center">No surveys yet. Create one to get started!</div>
        ) : (
          surveys.map((survey) => (
            <div
              key={survey.id}
              className="rounded-lg border p-4 transition-shadow hover:shadow-md"
            >
              <h2 className="mb-2 text-xl font-semibold">{survey.title}</h2>
              {survey.description && (
                <p className="mb-4 text-gray-600">{survey.description}</p>
              )}
              <div className="flex items-center justify-between">
                <Button variant="outline" onClick={() => void handleCopyLink(survey.id)}>
                  Copy Link
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => void handleDeleteSurvey(survey.id)}
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
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Survey Title"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
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
                      setQuestions((current) => current.filter((item) => item.id !== question.id))
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
                    onValueChange={(value) => {
                      if (isQuestionType(value)) {
                        setNewQuestion((current) => ({ ...current, type: value }));
                      }
                    }}
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
                    onChange={(event) =>
                      setNewQuestion((current) => ({ ...current, text: event.target.value }))
                    }
                    placeholder="Enter your question"
                  />
                </div>
                {(newQuestion.type === 'radio' || newQuestion.type === 'checkbox') && (
                  <div className="grid gap-2">
                    <Label>Options (comma-separated)</Label>
                    <Input
                      value={newQuestion.optionsText}
                      onChange={(event) =>
                        setNewQuestion((current) => ({
                          ...current,
                          optionsText: event.target.value,
                        }))
                      }
                      placeholder="Option 1, Option 2, Option 3"
                    />
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Switch
                    checked={newQuestion.required}
                    onCheckedChange={(checked) =>
                      setNewQuestion((current) => ({ ...current, required: checked }))
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
            <Button onClick={() => void handleCreateSurvey()}>Create Survey</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
