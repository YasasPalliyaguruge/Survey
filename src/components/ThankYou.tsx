import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export function ThankYou() {
    const navigate = useNavigate();

    return (
        <div className="container mx-auto py-8 max-w-2xl">
            <Card>
                <CardHeader>
                    <CardTitle>Thank You!</CardTitle>
                    <CardDescription>
                        Your response has been submitted successfully.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">
                        Thank you for taking the time to complete this survey. Your feedback is valuable to us.
                    </p>
                </CardContent>
                <CardFooter>
                    <Button onClick={() => navigate('/')}>
                        Return to Home
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
};
