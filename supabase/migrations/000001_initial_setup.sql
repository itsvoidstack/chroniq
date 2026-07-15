
-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    display_name VARCHAR(100),
    avatar_url TEXT,
    bio TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles RLS policies
CREATE POLICY "Users can view their own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

-- Create a trigger to automatically create a profile when a user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, display_name)
    VALUES (NEW.id, NEW.email);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create content table (only stores provider IDs and type)
CREATE TABLE IF NOT EXISTS public.content (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type VARCHAR(50) NOT NULL CHECK (type IN ('anime', 'movie', 'tv', 'book', 'game')),
    anilist_id INTEGER,
    tmdb_id INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(anilist_id, tmdb_id)
);

-- Enable RLS on content
ALTER TABLE public.content ENABLE ROW LEVEL SECURITY;

-- Content RLS policies
CREATE POLICY "Content is viewable by everyone"
    ON public.content FOR SELECT
    USING (true);

-- Create user_content table (watch history/progress/ratings)
CREATE TABLE IF NOT EXISTS public.user_content (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    content_id UUID NOT NULL REFERENCES public.content(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL CHECK (status IN ('plan_to_watch', 'watching', 'completed', 'dropped', 'on_hold')),
    progress INTEGER DEFAULT 0,
    season_progress INTEGER DEFAULT 0,
    rating INTEGER CHECK (rating BETWEEN 1 AND 10),
    notes TEXT,
    start_date DATE,
    finish_date DATE,
    rewatch_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(user_id, content_id)
);

-- Enable RLS on user_content
ALTER TABLE public.user_content ENABLE ROW LEVEL SECURITY;

-- User Content RLS policies
CREATE POLICY "Users can view their own user_content"
    ON public.user_content FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own user_content"
    ON public.user_content FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own user_content"
    ON public.user_content FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own user_content"
    ON public.user_content FOR DELETE
    USING (auth.uid() = user_id);

-- Create lists table
CREATE TABLE IF NOT EXISTS public.lists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    is_public BOOLEAN DEFAULT false,
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable RLS on lists
ALTER TABLE public.lists ENABLE ROW LEVEL SECURITY;

-- Lists RLS policies
CREATE POLICY "Users can view their own lists and public lists"
    ON public.lists FOR SELECT
    USING (auth.uid() = user_id OR is_public = true);

CREATE POLICY "Users can insert their own lists"
    ON public.lists FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own lists"
    ON public.lists FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own lists"
    ON public.lists FOR DELETE
    USING (auth.uid() = user_id);

-- Create list_items table
CREATE TABLE IF NOT EXISTS public.list_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    list_id UUID NOT NULL REFERENCES public.lists(id) ON DELETE CASCADE,
    content_id UUID NOT NULL REFERENCES public.content(id) ON DELETE CASCADE,
    position INTEGER NOT NULL,
    notes TEXT,
    added_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(list_id, content_id)
);

-- Enable RLS on list_items
ALTER TABLE public.list_items ENABLE ROW LEVEL SECURITY;

-- List Items RLS policies
CREATE POLICY "Users can view items from their own lists or public lists"
    ON public.list_items FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.lists
            WHERE public.lists.id = public.list_items.list_id
            AND (public.lists.user_id = auth.uid() OR public.lists.is_public = true)
        )
    );

CREATE POLICY "Users can insert items into their own lists"
    ON public.list_items FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.lists
            WHERE public.lists.id = public.list_items.list_id
            AND public.lists.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update items in their own lists"
    ON public.list_items FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.lists
            WHERE public.lists.id = public.list_items.list_id
            AND public.lists.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete items from their own lists"
    ON public.list_items FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.lists
            WHERE public.lists.id = public.list_items.list_id
            AND public.lists.user_id = auth.uid()
        )
    );

-- Create indexes
CREATE INDEX idx_profiles_id ON public.profiles(id);
CREATE INDEX idx_content_type ON public.content(type);
CREATE INDEX idx_content_anilist_id ON public.content(anilist_id);
CREATE INDEX idx_content_tmdb_id ON public.content(tmdb_id);
CREATE INDEX idx_user_content_user_id ON public.user_content(user_id);
CREATE INDEX idx_user_content_content_id ON public.user_content(content_id);
CREATE INDEX idx_user_content_status ON public.user_content(status);
CREATE INDEX idx_lists_user_id ON public.lists(user_id);
CREATE INDEX idx_list_items_list_id ON public.list_items(list_id);
CREATE INDEX idx_list_items_content_id ON public.list_items(content_id);
