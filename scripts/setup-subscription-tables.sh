#!/bin/bash

# Setup script for Paystack Multi-App Subscription Tables
# This script creates the necessary Supabase tables for tracking subscriptions

echo "🚀 Setting up Paystack Multi-App Subscription Tables..."
echo ""

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "⚠️  Supabase CLI not found. Installing..."
    npm install -g supabase
fi

# Check if .env file exists
if [ ! -f .env ] && [ ! -f .env.local ]; then
    echo "❌ Error: .env or .env.local file not found"
    echo "Please create a .env file with your Supabase credentials"
    exit 1
fi

# Load environment variables
if [ -f .env.local ]; then
    export $(cat .env.local | grep -v '^#' | xargs)
elif [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

# Verify Supabase URL is set
if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ]; then
    echo "❌ Error: NEXT_PUBLIC_SUPABASE_URL not set in .env"
    exit 1
fi

echo "📊 Supabase URL: $NEXT_PUBLIC_SUPABASE_URL"
echo ""

# Option 1: Using Supabase CLI (if linked)
echo "Option 1: Run migration using Supabase CLI"
echo "Command: supabase db push"
echo ""

# Option 2: Manual SQL execution
echo "Option 2: Run migration manually"
echo "1. Open your Supabase Dashboard: https://app.supabase.com"
echo "2. Go to SQL Editor"
echo "3. Copy and paste the contents of: supabase/migrations/create_subscription_tables.sql"
echo "4. Click 'Run' to execute the migration"
echo ""

# Ask user which method they prefer
read -p "Do you want to run the migration now using Supabase CLI? (y/n): " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🔄 Running migration..."

    # Check if Supabase is linked
    if [ ! -f .supabase/config.toml ]; then
        echo "⚠️  Supabase project not linked. Please link your project first:"
        echo "   supabase link --project-ref YOUR_PROJECT_REF"
        echo ""
        echo "Or run the migration manually using the SQL Editor (Option 2 above)"
        exit 1
    fi

    # Run the migration
    supabase db push

    if [ $? -eq 0 ]; then
        echo "✅ Migration completed successfully!"
        echo ""
        echo "Next steps:"
        echo "1. Visit /dashboard/subscriptions to view the admin dashboard"
        echo "2. Configure your Paystack webhook URL in the Paystack dashboard"
        echo "3. Test the integration with a test payment"
        echo ""
        echo "For more details, see: PAYSTACK_MULTI_APP_SETUP.md"
    else
        echo "❌ Migration failed. Please check the error above or run manually."
        exit 1
    fi
else
    echo "ℹ️  Please run the migration manually using Option 2 above"
    echo ""
    echo "Migration file location: supabase/migrations/create_subscription_tables.sql"
fi

echo ""
echo "📚 Documentation: See PAYSTACK_MULTI_APP_SETUP.md for complete setup instructions"
echo "✨ Setup complete!"
