import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { getAllSurveys } from '@/lib/supabase';
import type { Survey } from '@/types/survey';
import { PlusCircle, Copy, Loader2, BarChart } from 'lucide-react';
import { ResponsesDialog } from '@/components/ResponsesDialog';

export default function Home() {
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSurvey, setSelectedSurvey] = useState<Survey | null>(null);
  const [showResponses, setShowResponses] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadSurveys();
  }, []);

  const loadSurveys = async () => {
    try {
      const data = await getAllSurveys();
      setSurveys(data);
    } catch (error) {
      toast.error('Failed to load surveys');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (id: string) => {
    const url = `${window.location.origin}/survey/${id}`;
    await navigator.clipboard.writeText(url);
    toast.success('Survey link copied to clipboard');
  };

  const handleViewResponses = (survey: Survey) => {
    setSelectedSurvey(survey);
    setShowResponses(true);
  };

  if (loading) {
    return (
      <div className="flex h-[450px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between space-x-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Surveys</h1>
          <p className="text-muted-foreground">Create and manage your surveys</p>
        </div>
        <Button onClick={() => navigate('/create')} size="default">
          <PlusCircle className="mr-2 h-4 w-4" />
          Create Survey
        </Button>
      </div>
      <ScrollArea className="h-[450px]">
        {surveys.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <p className="text-muted-foreground">No surveys found. Create one to get started!</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {surveys.map((survey) => (
              <Card key={survey.id} className="flex flex-col">
                <CardHeader className="space-y-1">
                  <CardTitle className="line-clamp-1">{survey.title}</CardTitle>
                  {survey.description && (
                    <CardDescription className="line-clamp-2">{survey.description}</CardDescription>
                  )}
                </CardHeader>
                <CardContent className="flex-1">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => navigate(`/survey/${survey.id}`)}
                    >
                      View Survey
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewResponses(survey)}
                    >
                      <BarChart className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-shrink-0"
                      onClick={() => copyToClipboard(survey.id)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </ScrollArea>
      {selectedSurvey && (
        <ResponsesDialog
          survey={selectedSurvey}
          open={showResponses}
          onOpenChange={setShowResponses}
        />
      )}
    </div>
  );
}
