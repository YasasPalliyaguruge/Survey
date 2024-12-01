export function getSurveyUrl(surveyId: string): string {
  // Check if we're in development or production
  const isDev = import.meta.env.DEV;
  
  if (isDev) {
    // In development, use the local URL with the base path
    return `${window.location.origin}/Survey/#/survey/${surveyId}`;
  } else {
    // In production (GitHub Pages), include the base path
    return `${window.location.origin}/Survey/#/survey/${surveyId}`;
  }
}
