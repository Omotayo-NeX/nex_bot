-- Run this in Supabase to verify the table exists
SELECT
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'OrganizationProfile'
ORDER BY ordinal_position;

-- If you see NO results, the table doesn't exist!
-- If you see results, copy the output and send it to me

-- Also check if the table exists at all:
SELECT EXISTS (
    SELECT FROM information_schema.tables
    WHERE table_name = 'OrganizationProfile'
) as table_exists;
