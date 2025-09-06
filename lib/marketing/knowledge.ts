// Marketing Knowledge Base
// This file contains curated marketing knowledge for NeX AI

export interface MarketingStrategy {
  budget: string;
  duration: string;
  industry: string;
  strategy: {
    overview: string;
    channels: Array<{
      platform: string;
      budget_allocation: string;
      tactics: string[];
      kpis: string[];
    }>;
    timeline: Array<{
      phase: string;
      duration: string;
      activities: string[];
    }>;
  };
}

export interface ContentCalendar {
  platform: string;
  duration: string;
  niche: string;
  calendar: Array<{
    day: string;
    content_type: string;
    content_idea: string;
    hashtags: string[];
    posting_time: string;
    engagement_strategy: string;
  }>;
}

export interface AutomationWorkflow {
  business_type: string;
  workflow_name: string;
  description: string;
  tools_needed: string[];
  setup_steps: string[];
  time_saved: string;
  roi_potential: string;
}

// Marketing Strategies Database
export const marketingStrategies: MarketingStrategy[] = [
  {
    budget: "$500/month",
    duration: "3 months",
    industry: "e-commerce",
    strategy: {
      overview: "Focus on social media advertising, email marketing, and content creation to drive traffic and conversions for small e-commerce businesses.",
      channels: [
        {
          platform: "Meta Ads (Facebook/Instagram)",
          budget_allocation: "60% ($300)",
          tactics: [
            "Product catalog ads",
            "Retargeting website visitors",
            "Lookalike audiences based on purchasers",
            "Video content showcasing products"
          ],
          kpis: ["ROAS 3:1+", "CPC < $0.50", "CTR > 2%", "Conversion rate > 2.5%"]
        },
        {
          platform: "Email Marketing",
          budget_allocation: "15% ($75)",
          tactics: [
            "Abandoned cart recovery sequences",
            "Welcome series for new subscribers",
            "Product recommendation emails",
            "Seasonal promotional campaigns"
          ],
          kpis: ["Open rate > 25%", "Click rate > 3%", "Revenue per email > $0.50"]
        },
        {
          platform: "Content Marketing",
          budget_allocation: "25% ($125)",
          tactics: [
            "Product demonstration videos",
            "Customer testimonial content",
            "Behind-the-scenes stories",
            "Educational content related to products"
          ],
          kpis: ["Organic reach growth 20%", "Engagement rate > 4%", "Website traffic from social +30%"]
        }
      ],
      timeline: [
        {
          phase: "Setup & Launch (Month 1)",
          duration: "4 weeks",
          activities: [
            "Set up Meta Business Manager and ad accounts",
            "Install Meta Pixel and configure conversion tracking",
            "Create initial ad creative and copy variations",
            "Launch abandoned cart email sequence",
            "Set up Google Analytics and conversion goals"
          ]
        },
        {
          phase: "Optimize & Scale (Month 2)",
          duration: "4 weeks",
          activities: [
            "Analyze ad performance and optimize targeting",
            "A/B test ad creative and landing pages",
            "Expand successful ad sets",
            "Launch customer retention email campaigns",
            "Create user-generated content campaigns"
          ]
        },
        {
          phase: "Expand & Refine (Month 3)",
          duration: "4 weeks",
          activities: [
            "Test new ad formats (Reels, Stories)",
            "Implement advanced retargeting strategies",
            "Launch referral and loyalty programs",
            "Optimize email automation workflows",
            "Plan for holiday season campaigns"
          ]
        }
      ]
    }
  }
];

// Content Calendar Templates
export const contentCalendarTemplates: ContentCalendar[] = [
  {
    platform: "Instagram",
    duration: "7 days",
    niche: "bakery",
    calendar: [
      {
        day: "Monday",
        content_type: "Behind-the-scenes video",
        content_idea: "Morning prep - show bakers starting early, mixing dough, prepping ingredients",
        hashtags: ["#BehindTheScenes", "#FreshBaked", "#MorningPrep", "#LocalBakery", "#Handmade"],
        posting_time: "7:00 AM",
        engagement_strategy: "Ask followers what their favorite morning pastry is"
      },
      {
        day: "Tuesday",
        content_type: "Product showcase photo",
        content_idea: "Feature Tuesday's special - artisan bread with close-up shots showing texture",
        hashtags: ["#TuesdaySpecial", "#ArtisanBread", "#FreshBaked", "#LocalBakery", "#Organic"],
        posting_time: "11:00 AM",
        engagement_strategy: "Share the story of this bread recipe - family tradition, ingredients source"
      },
      {
        day: "Wednesday",
        content_type: "Customer feature",
        content_idea: "Share customer photo/testimonial enjoying your products with their permission",
        hashtags: ["#HappyCustomers", "#CustomerLove", "#CommunitySupport", "#LocalBakery"],
        posting_time: "2:00 PM",
        engagement_strategy: "Tag the customer, encourage others to share their bakery moments"
      },
      {
        day: "Thursday",
        content_type: "Recipe tip/educational",
        content_idea: "Quick tip: How to keep bread fresh longer, or simple recipe using your products",
        hashtags: ["#BakingTips", "#FoodHacks", "#RecipeThursday", "#BreadLovers", "#Foodie"],
        posting_time: "10:00 AM",
        engagement_strategy: "Ask followers to share their own bread storage tips"
      },
      {
        day: "Friday",
        content_type: "Weekend specials announcement",
        content_idea: "Preview weekend treats - croissants, pastries, special cakes available",
        hashtags: ["#WeekendTreats", "#SpecialOrders", "#WeekendReady", "#LocalBakery", "#PreOrder"],
        posting_time: "4:00 PM",
        engagement_strategy: "Encourage pre-orders, ask what they're planning to celebrate this weekend"
      },
      {
        day: "Saturday",
        content_type: "Live moment/Story highlight",
        content_idea: "Busy Saturday morning - customers enjoying fresh pastries, bustling atmosphere",
        hashtags: ["#SaturdayRush", "#CommunityGathering", "#FreshPastries", "#LocalBakery", "#WeekendVibes"],
        posting_time: "9:00 AM",
        engagement_strategy: "Go live briefly showing the Saturday morning energy"
      },
      {
        day: "Sunday",
        content_type: "Community/values post",
        content_idea: "Thank the community for support, highlight local partnerships or values",
        hashtags: ["#CommunitySupport", "#LocalBusiness", "#Grateful", "#SundayReflection", "#LocalPartners"],
        posting_time: "12:00 PM",
        engagement_strategy: "Ask followers what makes their Sunday special, encourage community connection"
      }
    ]
  }
];

// Automation Workflows Database
export const automationWorkflows: AutomationWorkflow[] = [
  {
    business_type: "freelancer",
    workflow_name: "Client Onboarding Automation",
    description: "Automate the entire client onboarding process from contract signing to project kickoff",
    tools_needed: ["Zapier/n8n", "Google Forms/Typeform", "CRM (HubSpot/Pipedrive)", "Email platform", "Calendly"],
    setup_steps: [
      "Create intake form with project requirements and client info",
      "Set up automated welcome email sequence with onboarding materials",
      "Configure CRM to create new project and assign tags",
      "Auto-generate and send contract using HelloSign/DocuSign integration",
      "Schedule kickoff meeting automatically when contract is signed",
      "Create project folder in Google Drive/Dropbox and share access",
      "Send project timeline and milestone document automatically"
    ],
    time_saved: "8-10 hours per client",
    roi_potential: "300% - allows handling 3x more clients with same time investment"
  },
  {
    business_type: "freelancer",
    workflow_name: "Social Media Content Automation",
    description: "Automatically create, schedule, and optimize social media content across platforms",
    tools_needed: ["Buffer/Later/Hootsuite", "Canva API", "ChatGPT API", "Google Sheets", "IFTTT/Zapier"],
    setup_steps: [
      "Set up content calendar in Google Sheets with topics and posting schedule",
      "Configure AI content generation using ChatGPT API for captions",
      "Automate image creation using Canva templates and dynamic data",
      "Set up cross-platform posting schedule in Buffer/Later",
      "Configure automatic hashtag research and optimization",
      "Set up engagement monitoring and response triggers",
      "Create weekly performance reports automated via email"
    ],
    time_saved: "15-20 hours per week",
    roi_potential: "500% - consistent posting increases followers and leads by 200%"
  }
];

// Function to get marketing strategy by budget and industry
export function getMarketingStrategy(budget: string, industry: string): MarketingStrategy | null {
  return marketingStrategies.find(
    strategy => strategy.budget === budget && strategy.industry === industry
  ) || null;
}

// Function to get content calendar by platform and niche
export function getContentCalendar(platform: string, niche: string): ContentCalendar | null {
  return contentCalendarTemplates.find(
    template => template.platform.toLowerCase() === platform.toLowerCase() && 
                template.niche.toLowerCase() === niche.toLowerCase()
  ) || null;
}

// Function to get automation workflows by business type
export function getAutomationWorkflows(businessType: string): AutomationWorkflow[] {
  return automationWorkflows.filter(
    workflow => workflow.business_type.toLowerCase() === businessType.toLowerCase()
  );
}