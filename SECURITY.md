# Security notes

This repository is a portfolio and learning project. The included Supabase migration is intentionally permissive so the complete create-share-respond-review workflow can be demonstrated without an authentication system.

## Important deployment limitation

The policies in `supabase/migrations/20240000000000_init.sql` allow public access to survey and response records, including write operations. They are not appropriate for a public production deployment.

Before deploying with real users or data:

1. Add authentication and an owner identifier to surveys.
2. Restrict survey updates and deletion to the owner.
3. Allow response insertion only for valid surveys.
4. Restrict response viewing to the survey owner or authorised staff.
5. Review whether anonymous submissions should be rate-limited or protected against abuse.
6. Keep the Supabase service-role key on a trusted server only. The browser should use only the anonymous key.

Do not store confidential, personally identifiable, or sensitive information using the demonstration policies.

## Reporting a vulnerability

Please open a private security advisory through GitHub rather than publishing credentials or exploit details in a public issue.
