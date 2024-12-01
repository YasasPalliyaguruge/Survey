import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useSurveyStore } from '../lib/survey-store';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ResponsesDialog } from './ResponsesDialog';

export const SurveyResponses: React.FC = () => {
    const { surveyId } = useParams<{ surveyId: string }>();
    const { surveys } = useSurveyStore();
    const [open, setOpen] = useState(false);

    const survey = surveys.find(s => s.id === surveyId);
    if (!survey) return null;

    return (
        <div>
            <Card>
                <CardContent className="pt-6">
                    <div className="flex flex-col gap-4">
                        <Button onClick={() => setOpen(true)}>
                            View Responses
                        </Button>
                    </div>
                </CardContent>
            </Card>
            <ResponsesDialog
                survey={survey}
                open={open}
                onOpenChange={setOpen}
            />
        </div>
    );
}
