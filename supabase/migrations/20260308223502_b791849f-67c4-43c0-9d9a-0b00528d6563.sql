
-- Drop the restrictive SELECT policy and recreate as permissive for public access
DROP POLICY IF EXISTS "Alumni details viewable by authenticated users" ON public.alumni_details;

CREATE POLICY "Alumni details publicly readable"
  ON public.alumni_details
  FOR SELECT
  TO anon, authenticated
  USING (true);
