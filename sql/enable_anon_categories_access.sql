
-- Enable RLS on the categories table
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Create a policy to allow anonymous read access to categories
CREATE POLICY "Allow anonymous read access to categories" 
ON public.categories 
FOR SELECT 
TO anon
USING (true);

-- Create a policy to allow authenticated users to manage categories
CREATE POLICY "Allow authenticated users to manage categories" 
ON public.categories 
FOR ALL 
TO authenticated
USING (true)
WITH CHECK (true);
