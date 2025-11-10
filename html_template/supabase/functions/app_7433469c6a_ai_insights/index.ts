import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

Deno.serve(async (req) => {
  const requestId = crypto.randomUUID();
  console.log(`[${requestId}] ${req.method} ${req.url}`);

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get request body
    let requestBody;
    try {
      requestBody = await req.json();
    } catch (error) {
      console.log(`[${requestId}] Invalid JSON body:`, error);
      return new Response(
        JSON.stringify({ error: 'Invalid JSON body' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { user_id, expenses_data } = requestBody;

    if (!user_id || !expenses_data) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: user_id, expenses_data' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[${requestId}] Generating AI insights for user: ${user_id}`);

    // Verify user exists
    const { data: user, error: userError } = await supabase.auth.admin.getUserById(user_id);
    if (userError || !user) {
      console.log(`[${requestId}] User verification failed:`, userError);
      return new Response(
        JSON.stringify({ error: 'Invalid user' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate AI insights based on expense data
    const insights = generateInsights(expenses_data);

    // Save insights to database
    const { error: insertError } = await supabase
      .from('app_7433469c6a_ai_insights')
      .insert([
        {
          user_id: user_id,
          insight_text: JSON.stringify(insights),
          insight_type: 'financial_analysis',
        }
      ]);

    if (insertError) {
      console.log(`[${requestId}] Error saving insights:`, insertError);
    }

    console.log(`[${requestId}] AI insights generated successfully`);

    return new Response(
      JSON.stringify({ insights }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error(`[${requestId}] Error:`, error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function generateInsights(expensesData) {
  const { totalSpent, categories, transactionCount, averageTransaction } = expensesData;

  // Find top spending category
  const topCategory = Object.keys(categories).reduce((a, b) => 
    categories[a] > categories[b] ? a : b, 'Food'
  );

  const topCategoryAmount = categories[topCategory] || 0;
  const topCategoryPercentage = totalSpent > 0 ? ((topCategoryAmount / totalSpent) * 100).toFixed(1) : 0;

  // Generate insights
  const insights = {
    spendingPattern: `Your highest spending category this month is ${topCategory}, accounting for ${topCategoryPercentage}% of your total expenses ($${topCategoryAmount.toFixed(2)}). Consider tracking this category more closely to identify potential savings opportunities.`,
    
    budgetRecommendation: `Based on your current monthly spending of $${totalSpent.toFixed(2)} across ${transactionCount} transactions, I recommend setting a monthly budget of $${(totalSpent * 1.15).toFixed(2)} to allow for unexpected expenses while maintaining financial discipline.`,
    
    savingsTip: transactionCount > 0 
      ? `Your average transaction is $${averageTransaction.toFixed(2)}. Try implementing the 24-hour rule for purchases over $50 to reduce impulse spending. You could potentially save $${(totalSpent * 0.15).toFixed(2)} per month by cutting discretionary spending by 15%.`
      : `Start tracking your expenses regularly to build better financial habits. Even small daily expenses can add up significantly over time.`,
    
    categoryBreakdown: Object.entries(categories)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([category, amount]) => ({
        category,
        amount: amount.toFixed(2),
        percentage: totalSpent > 0 ? ((amount / totalSpent) * 100).toFixed(1) : 0
      })),
    
    recommendations: generateRecommendations(categories, totalSpent, transactionCount)
  };

  return insights;
}

function generateRecommendations(categories, totalSpent, transactionCount) {
  const recommendations = [];

  // Food spending recommendations
  if (categories.Food && categories.Food > totalSpent * 0.3) {
    recommendations.push("Consider meal planning and cooking at home more often to reduce food expenses.");
  }

  // Transportation recommendations
  if (categories.Transportation && categories.Transportation > totalSpent * 0.2) {
    recommendations.push("Look into carpooling, public transportation, or remote work options to reduce transportation costs.");
  }

  // Entertainment recommendations
  if (categories.Entertainment && categories.Entertainment > totalSpent * 0.15) {
    recommendations.push("Explore free or low-cost entertainment alternatives like parks, libraries, or community events.");
  }

  // Shopping recommendations
  if (categories.Shopping && categories.Shopping > totalSpent * 0.25) {
    recommendations.push("Create a shopping list and stick to it. Wait 24 hours before making non-essential purchases.");
  }

  // General recommendations
  if (transactionCount > 50) {
    recommendations.push("You have many small transactions. Consider consolidating purchases to reduce impulse spending.");
  }

  if (recommendations.length === 0) {
    recommendations.push("Your spending patterns look balanced. Keep tracking your expenses to maintain good financial habits.");
  }

  return recommendations;
}