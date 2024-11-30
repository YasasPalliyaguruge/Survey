import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSurveyStore } from '../lib/survey-store';
import { Survey, SurveyResponse } from '../types/survey';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from 'sonner';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { format } from 'date-fns';
import { supabase } from '../lib/supabase';
import { SurveyResponses } from './SurveyResponses';

export const SurveyResponses: React.FC = () => {
    const { surveyId } = useParams<{ surveyId: string }>();
    const navigate = useNavigate();
    const { surveys } = useSurveyStore();
    const [responses, setResponses] = useState<SurveyResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState(false);

    const survey = surveys.find(s => s.id === surveyId);

    useEffect(() => {
        const fetchResponses = async () => {
            if (!surveyId) return;
            
            try {
                setLoading(true);
                const { data, error } = await supabase
                    .from('responses')
                    .select('*')
                    .eq('survey_id', surveyId)
                    .order('created_at', { ascending: false });

                if (error) {
                    throw error;
                }

                setResponses(data || []);
            } catch (error) {
                console.error('Error fetching responses:', error);
                toast.error('Failed to load responses');
            } finally {
                setLoading(false);
            }
        };

        fetchResponses();

        // Set up real-time subscription
        const subscription = supabase
            .channel('responses_channel')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'responses',
                    filter: `survey_id=eq.${surveyId}`
                },
                async (payload) => {
                    console.log('Real-time update received:', payload);
                    // Refresh the responses
                    const { data, error } = await supabase
                        .from('responses')
                        .select('*')
                        .eq('survey_id', surveyId)
                        .order('created_at', { ascending: false });

                    if (!error && data) {
                        setResponses(data);
                    }
                }
            )
            .subscribe();

        // Cleanup subscription
        return () => {
            subscription.unsubscribe();
        };
    }, [surveyId]);

    if (!survey) {
        return (
            <div className="max-w-4xl mx-auto mt-8">
                <Card>
                    <CardContent className="p-6">
                        <div className="text-center">Survey not found</div>
                        <Button
                            onClick={() => navigate('/dashboard')}
                            className="mt-4 mx-auto block"
                        >
                            Return to Dashboard
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="max-w-4xl mx-auto mt-8">
                <Card>
                    <CardContent className="p-6">
                        <div className="text-center">Loading responses...</div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const formatAnswer = (answer: string | string[] | null | undefined) => {
        if (!answer) return 'No answer';
        if (Array.isArray(answer)) {
            return answer.join(', ');
        }
        return answer;
    };

    return (
        <div className="max-w-6xl mx-auto mt-8 mb-16 px-4">
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle>{survey.title}</CardTitle>
                            <CardDescription>{survey.description}</CardDescription>
                        </div>
                        <Button
                            variant="outline"
                            onClick={() => navigate('/dashboard')}
                        >
                            Back to Dashboard
                        </Button>
                        <Button
                            onClick={() => setOpen(true)}
                        >
                            View Responses
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h3 className="text-lg font-medium">
                                Responses ({responses.length})
                            </h3>
                        </div>

                        {responses.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                No responses yet
                            </div>
                        ) : (
                            <div className="border rounded-lg overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="whitespace-nowrap">Response #</TableHead>
                                            {survey.questions.map((question, index) => (
                                                <TableHead 
                                                    key={question.id}
                                                    className="whitespace-nowrap min-w-[200px]"
                                                >
                                                    {index + 1}. {question.text}
                                                    {question.required && <span className="text-red-500 ml-1">*</span>}
                                                </TableHead>
                                            ))}
                                            <TableHead className="whitespace-nowrap">Submitted At</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {responses.map((response, responseIndex) => (
                                            <TableRow key={response.id}>
                                                <TableCell className="font-medium">
                                                    {responses.length - responseIndex}
                                                </TableCell>
                                                {survey.questions.map(question => (
                                                    <TableCell 
                                                        key={question.id}
                                                        className="max-w-[300px] break-words"
                                                    >
                                                        {formatAnswer(response.answers[question.id])}
                                                    </TableCell>
                                                ))}
                                                <TableCell className="whitespace-nowrap">
                                                    {response.created_at ? 
                                                        format(new Date(response.created_at), 'MMM d, yyyy h:mm a')
                                                        : 'N/A'
                                                    }
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
            <SurveyResponses 
                survey={survey} 
                open={open} 
                onOpenChange={setOpen} 
            />
        </div>
    );
};
