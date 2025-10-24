import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

interface ExtractedReceiptData {
  merchantName: string;
  amount: number;
  currency: string;
  expenseDate: string;
  category: string;
  description: string;
}

export async function extractReceiptData(imageBase64: string): Promise<ExtractedReceiptData> {
  try {
    console.log('🤖 Calling OpenAI GPT-4o for receipt extraction...');

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `Extract the following information from this receipt image and return ONLY a JSON object with these exact fields:
              - merchantName: The name of the business/vendor
              - amount: The total amount (number only, no currency symbols)
              - currency: The currency code (NGN, USD, EUR, GBP, etc.)
              - expenseDate: The date in YYYY-MM-DD format
              - category: One of: Transport, Food, Equipment, Software, Marketing, Travel, Office, Other
              - description: A brief description of the purchase

              Return only valid JSON, no markdown, no explanations.`
            },
            {
              type: 'image_url',
              image_url: {
                url: imageBase64
              }
            }
          ]
        }
      ],
      max_tokens: 500,
      temperature: 0.2
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response from AI');
    }

    console.log('✅ OpenAI response received:', content.substring(0, 200));

    // Parse JSON response
    let jsonContent = content.trim();

    // Remove markdown code blocks if present
    if (jsonContent.startsWith('```json')) {
      jsonContent = jsonContent.replace(/```json\n?/g, '').replace(/```\n?$/g, '');
    } else if (jsonContent.startsWith('```')) {
      jsonContent = jsonContent.replace(/```\n?/g, '').replace(/```\n?$/g, '');
    }

    const extractedData = JSON.parse(jsonContent);

    console.log('📊 Parsed data:', extractedData);

    // Validate and set defaults
    const result = {
      merchantName: extractedData.merchantName || 'Unknown Merchant',
      amount: parseFloat(extractedData.amount) || 0,
      currency: extractedData.currency || 'NGN',
      expenseDate: extractedData.expenseDate || new Date().toISOString().split('T')[0],
      category: extractedData.category || 'Other',
      description: extractedData.description || ''
    };

    console.log('✨ Final extracted data:', result);
    return result;
  } catch (error: any) {
    console.error('❌ AI extraction error:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    throw new Error(`Failed to extract receipt data: ${error.message}`);
  }
}
