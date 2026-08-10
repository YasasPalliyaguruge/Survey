import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from './ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { getSurveyResponses } from '@/lib/supabase';
import type { SurveyResponse, SurveyQuestion } from '@/types/survey';
import { Loader2, Download } from 'lucide-react';

interface ResponsesDialogProps {
  survey: {
    id: string;
    title: string;
    questions: SurveyQuestion[];
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const FORMULA_PREFIX = /^[\t\r ]*[=+\-@]/;

const formatAnswer = (question: SurveyQuestion, answer: unknown): string => {
  if (answer === null || answer === undefined || answer === '') return '-';

  if (question.type === 'checkbox') {
    return Array.isArray(answer) ? answer.map(String).join(', ') : String(answer);
  }

  return String(answer);
};

const neutralizeSpreadsheetFormula = (value: string): string =>
  FORMULA_PREFIX.test(value) ? `'${value}` : value;

const escapeCsvCell = (value: string): string => {
  const safeValue = neutralizeSpreadsheetFormula(value);
  const escaped = safeValue.replace(/"/g, '""');
  return /[",\r\n]/.test(escaped) ? `"${escaped}"` : escaped;
};

const safeDownloadName = (value: string): string => {
  const cleaned = value.replace(/[<>:"/\\|?*\u0000-\u001F]/g, '_').trim();
  return cleaned || 'survey';
};

export function ResponsesDialog({ survey, open, onOpenChange }: ResponsesDialogProps) {
  const [responses, setResponses] = useState<SurveyResponse[]>([]);
  const [loading, setLoading] = useState(true);

  const loadResponses = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getSurveyResponses(survey.id);
      setResponses(data);
    } catch {
      toast.error('Failed to load responses');
    } finally {
      setLoading(false);
    }
  }, [survey.id]);

  useEffect(() => {
    if (open) {
      void loadResponses();
    }
  }, [loadResponses, open]);

  const prepareResponsesData = (): string[][] => {
    const headers = ['Timestamp', ...survey.questions.map((question) => question.text)];
    const rows = responses.map((response) => [
      new Date(response.created_at).toLocaleString(),
      ...survey.questions.map((question) =>
        formatAnswer(question, response.answers[question.id]),
      ),
    ]);

    return [headers, ...rows];
  };

  const downloadCSV = () => {
    try {
      const data = prepareResponsesData();
      const csvContent = data
        .map((row) => row.map(escapeCsvCell).join(','))
        .join('\r\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${safeDownloadName(survey.title)} - Responses.csv`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 0);
      toast.success('CSV downloaded successfully');
    } catch {
      toast.error('Failed to download CSV');
    }
  };

  const downloadExcel = async () => {
    try {
      const XLSX = await import('xlsx');
      const data = prepareResponsesData().map((row) =>
        row.map(neutralizeSpreadsheetFormula),
      );
      const ws = XLSX.utils.aoa_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Responses');
      XLSX.writeFile(wb, `${safeDownloadName(survey.title)} - Responses.xlsx`);
      toast.success('Excel file downloaded successfully');
    } catch {
      toast.error('Failed to download Excel file');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[80vh] max-w-4xl overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-between pr-8">
          <div>
            <DialogTitle>Survey Responses</DialogTitle>
            <DialogDescription>
              Viewing responses for "{survey.title}"
            </DialogDescription>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                disabled={loading || responses.length === 0}
                aria-label="Download survey responses"
              >
                <Download className="h-4 w-4" aria-hidden="true" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={downloadCSV}>
                Download as CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => void downloadExcel()}>
                Download as Excel
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : responses.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            No responses yet.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                {survey.questions.map((question) => (
                  <TableHead key={question.id}>{question.text}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {responses.map((response) => (
                <TableRow key={response.id}>
                  <TableCell className="whitespace-nowrap">
                    {format(new Date(response.created_at), 'MMM d, yyyy h:mm a')}
                  </TableCell>
                  {survey.questions.map((question) => (
                    <TableCell key={question.id}>
                      {formatAnswer(question, response.answers[question.id])}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </DialogContent>
    </Dialog>
  );
}
