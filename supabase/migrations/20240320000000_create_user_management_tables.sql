BEGIN;

-- Create a new roles table with TEXT id
CREATE TABLE IF NOT EXISTS roles_new (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  permissions JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Insert default roles into the new table
INSERT INTO roles_new (id, name, permissions) VALUES
  ('admin', 'Admin', '{
    "content": {
      "create": true,
      "edit": true,
      "delete": true,
      "publish": true
    },
    "users": {
      "create": true,
      "edit": true,
      "delete": true,
      "assign_roles": true
    },
    "settings": {
      "view": true,
      "edit": true
    }
  }'),
  ('editor', 'Editor', '{
    "content": {
      "create": true,
      "edit": true,
      "delete": true,
      "publish": true
    },
    "users": {
      "view": true
    },
    "settings": {
      "view": true
    }
  }'),
  ('author', 'Author', '{
    "content": {
      "create": true,
      "edit": true,
      "delete": true
    },
    "users": {
      "view": true
    }
  }')
ON CONFLICT (id) DO NOTHING;

-- Create the profiles table with reference to the new roles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT NOT NULL,
  email TEXT NOT NULL,
  name TEXT,
  avatar_url TEXT,
  role_id TEXT REFERENCES roles_new(id),
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Add username column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'profiles'
    AND column_name = 'username'
  ) THEN
    ALTER TABLE profiles ADD COLUMN username TEXT NOT NULL;
  END IF;
END $$;

-- Add email column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'profiles'
    AND column_name = 'email'
  ) THEN
    ALTER TABLE profiles ADD COLUMN email TEXT NOT NULL;
  END IF;
END $$;

-- Add role_id column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'profiles'
    AND column_name = 'role_id'
  ) THEN
    ALTER TABLE profiles ADD COLUMN role_id TEXT REFERENCES roles_new(id);
  END IF;
END $$;

-- Add status column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'profiles'
    AND column_name = 'status'
  ) THEN
    ALTER TABLE profiles ADD COLUMN status TEXT NOT NULL DEFAULT 'pending';
  END IF;
END $$;

-- Create the user_roles table with reference to the new roles table
CREATE TABLE IF NOT EXISTS user_roles (
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  role_id TEXT REFERENCES roles_new(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  PRIMARY KEY (user_id, role_id)
);

-- Enable RLS on all tables
ALTER TABLE roles_new ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Create a temporary bypass for initial setup
CREATE POLICY "Allow all operations during setup"
  ON roles_new FOR ALL
  USING (true);

CREATE POLICY "Allow all operations during setup"
  ON profiles FOR ALL
  USING (true);

CREATE POLICY "Allow all operations during setup"
  ON user_roles FOR ALL
  USING (true);

-- Create the first admin user
DO $$
DECLARE
  admin_user_id UUID;
  admin_email TEXT;
  admin_username TEXT;
BEGIN
  -- Get the first user from auth.users
  SELECT id, email, raw_user_meta_data->>'username' INTO admin_user_id, admin_email, admin_username 
  FROM auth.users LIMIT 1;
  
  IF admin_user_id IS NOT NULL THEN
    -- First, ensure the user has a profile
    INSERT INTO profiles (id, username, email, role_id, status)
    VALUES (admin_user_id, COALESCE(admin_username, 'admin'), admin_email, 'author', 'pending')
    ON CONFLICT (id) DO UPDATE
    SET role_id = 'admin',
        status = 'active';
  END IF;
END $$;

-- Create function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, email, role_id, status)
  VALUES (
    new.id, 
    COALESCE(new.raw_user_meta_data->>'username', 'user_' || substr(new.id::text, 1, 8)),
    new.email, 
    'author', 
    'pending'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user creation
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Drop the temporary bypass policies
DROP POLICY IF EXISTS "Allow all operations during setup" ON roles_new;
DROP POLICY IF EXISTS "Allow all operations during setup" ON profiles;
DROP POLICY IF EXISTS "Allow all operations during setup" ON user_roles;

-- Create the final RLS policies
CREATE POLICY "Roles are viewable by everyone"
  ON roles_new FOR SELECT
  USING (true);

CREATE POLICY "Only admins can modify roles"
  ON roles_new FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role_id = 'admin'
    )
  );

CREATE POLICY "Profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Only admins can create profiles"
  ON profiles FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role_id = 'admin'
    )
  );

CREATE POLICY "Only admins can delete profiles"
  ON profiles FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role_id = 'admin'
    )
  );

CREATE POLICY "User roles are viewable by everyone"
  ON user_roles FOR SELECT
  USING (true);

CREATE POLICY "Only admins can modify user roles"
  ON user_roles FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role_id = 'admin'
    )
  );

-- Handle dependencies before dropping the old roles table
DO $$
BEGIN
  -- Drop policies that depend on the old roles table
  DROP POLICY IF EXISTS "Admins can manage categories" ON categories;
  
  -- Drop foreign key constraints that depend on the old roles table
  ALTER TABLE IF EXISTS user_roles DROP CONSTRAINT IF EXISTS user_roles_role_id_fkey;
  
  -- Drop the old roles table
  DROP TABLE IF EXISTS roles;
END $$;

-- Rename the new roles table to the original name
ALTER TABLE roles_new RENAME TO roles;

COMMIT; 