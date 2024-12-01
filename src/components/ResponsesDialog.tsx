import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';
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
} from "@/components/ui/dropdown-menu"
import { Button } from '@/components/ui/button';
import { getSurveyResponses } from '@/lib/supabase';
import type { SurveyResponse, SurveyQuestion } from '@/types/survey';
import { Loader2, Download } from 'lucide-react';

interface ResponsesDialogProps {
  survey: {
    id: string
    title: string
    questions: SurveyQuestion[]
  }
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ResponsesDialog({ survey, open, onOpenChange }: ResponsesDialogProps) {
  const [responses, setResponses] = useState<SurveyResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (open) {
      loadResponses();
    }
  }, [open, survey.id]);

  const loadResponses = async () => {
    try {
      const data = await getSurveyResponses(survey.id);
      setResponses(data);
    } catch (error) {
      toast.error('Failed to load responses');
    } finally {
      setLoading(false);
    }
  };

  const formatAnswer = (question: SurveyQuestion, answer: any) => {
    if (!answer) return '-'

    switch (question.type) {
      case 'checkbox':
        return Array.isArray(answer) ? answer.join(', ') : answer
      default:
        return answer.toString()
    }
  };

  const prepareResponsesData = () => {
    // Prepare headers
    const headers = ['Timestamp', ...survey.questions.map(q => q.text)];
    
    // Prepare rows
    const rows = responses.map(response => {
      return [
        new Date(response.created_at).toLocaleString(),
        ...survey.questions.map(question => formatAnswer(question, response.answers[question.id]))
      ];
    });

    return [headers, ...rows];
  };

  const downloadCSV = () => {
    try {
      const data = prepareResponsesData();
      const csvContent = data.map(row => row.map(cell => 
        typeof cell === 'string' && cell.includes(',') ? `"${cell}"` : cell
      ).join(',')).join('\\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `${survey.title} - Responses.csv`;
      link.click();
      toast.success('CSV downloaded successfully');
    } catch (error) {
      toast.error('Failed to download CSV');
    }
  };

  const downloadExcel = () => {
    try {
      const data = prepareResponsesData();
      const ws = XLSX.utils.aoa_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Responses');
      XLSX.writeFile(wb, `${survey.title} - Responses.xlsx`);
      toast.success('Excel file downloaded successfully');
    } catch (error) {
      toast.error('Failed to download Excel file');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-between pr-8">
          <div>
            <DialogTitle>Survey Responses</DialogTitle>
            <DialogDescription>
              Viewing responses for "{survey.title}"
            </DialogDescription>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" disabled={loading || responses.length === 0}>
                <Download className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={downloadCSV}>
                Download as CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={downloadExcel}>
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
          <div className="text-center py-8 text-muted-foreground">
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
