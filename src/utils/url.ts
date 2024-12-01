export function getSurveyUrl(surveyId: string): string {
  // Check if we're in development or production
  const isDev = import.meta.env.DEV;
  const path = `/survey/${surveyId}`;
  
  if (isDev) {
    // In development, use the local URL without base path
    return `${window.location.origin}${path}`;
  } else {
    // In production (GitHub Pages), include the base path
    return `${window.location.origin}/Survey${path}`;
  }
}
