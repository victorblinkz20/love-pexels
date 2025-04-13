
// Re-export all supabase-related functions
import { supabase } from '@/integrations/supabase/client';

// Re-export types
export * from './types';

// Re-export auth functions
export * from './auth';

// Re-export blog functions
export * from './blogs';

// Re-export category functions
export * from './categories';

// Re-export media functions
export * from './media';

// Re-export user functions
export * from './users';

// Re-export analytics functions
export * from './analytics';

// Re-export comments functions
export * from './comments';

// Re-export the supabase client
export { supabase };
