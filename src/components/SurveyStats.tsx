import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Chart } from './ui/charts';
import type { Survey, SurveyResponse } from '@/types/survey';

interface SurveyStatsProps {
  survey: Survey;
  responses: SurveyResponse[];
}

export function SurveyStats({ survey, responses }: SurveyStatsProps) {
  const stats = useMemo(() => {
    const calculated: Record<string, Record<string, number>> = {};

    survey.questions.forEach((question) => {
      if (question.type !== 'radio' && question.type !== 'checkbox') return;

      const answerCounts: Record<string, number> = {};
      responses.forEach((response) => {
        const answer = response.answers[question.id];
        if (Array.isArray(answer)) {
          answer.forEach((option) => {
            answerCounts[option] = (answerCounts[option] || 0) + 1;
          });
        } else if (typeof answer === 'string' && answer) {
          answerCounts[answer] = (answerCounts[answer] || 0) + 1;
        }
      });

      if (Object.keys(answerCounts).length > 0) {
        calculated[question.id] = answerCounts;
      }
    });

    return calculated;
  }, [responses, survey.questions]);

  const getChartData = (questionId: string) => {
    const data = stats[questionId] || {};
    return {
      labels: Object.keys(data),
      datasets: [
        {
          data: Object.values(data),
          backgroundColor: [
            'rgba(255, 99, 132, 0.5)',
            'rgba(54, 162, 235, 0.5)',
            'rgba(255, 206, 86, 0.5)',
            'rgba(75, 192, 192, 0.5)',
            'rgba(153, 102, 255, 0.5)',
          ],
          borderColor: [
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(153, 102, 255, 1)',
          ],
          borderWidth: 1,
        },
      ],
    };
  };

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      {survey.questions.map((question) => {
        if (question.type !== 'radio' && question.type !== 'checkbox') return null;
        if (!stats[question.id]) return null;

        return (
          <Card key={question.id}>
            <CardHeader>
              <CardTitle className="text-sm">{question.text}</CardTitle>
            </CardHeader>
            <CardContent>
              <Chart
                type="pie"
                data={getChartData(question.id)}
                options={{
                  plugins: {
                    legend: {
                      position: 'bottom',
                    },
                  },
                }}
              />
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
