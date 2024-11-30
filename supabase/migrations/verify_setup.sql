-- Check if tables exist and their structure
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'surveys'
) as surveys_table_exists;

SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'responses'
) as responses_table_exists;

-- Check table columns
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'surveys';

-- Check RLS policies
SELECT tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN ('surveys', 'responses');

-- Check if any records exist
SELECT COUNT(*) as survey_count FROM surveys;
SELECT COUNT(*) as response_count FROM responses;
