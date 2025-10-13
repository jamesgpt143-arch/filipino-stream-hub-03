import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Input validation schema
const visitSchema = z.object({
  page_path: z.string().min(1).max(200).regex(/^\/[a-zA-Z0-9\-\/]*$/),
  visitor_id: z.string().uuid()
})

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Parse and validate input
    const body = await req.json()
    const validation = visitSchema.safeParse(body)
    
    if (!validation.success) {
      console.error('Validation error:', validation.error)
      return new Response(
        JSON.stringify({ error: 'Invalid input', details: validation.error.issues }),
        { 
          status: 400,
          headers: { 
            ...corsHeaders,
            'Content-Type': 'application/json' 
          } 
        }
      )
    }

    const { page_path, visitor_id } = validation.data
    
    // Get client IP and user agent
    const ip_address = req.headers.get('x-forwarded-for') || 'unknown'
    const user_agent = req.headers.get('user-agent') || 'unknown'

    // Track visit
    const { error } = await supabase
      .from('visits')
      .insert({
        page_path,
        visitor_id,
        ip_address,
        user_agent
      })

    if (error) {
      console.error('Error tracking visit:', error)
      throw error
    }

    return new Response(
      JSON.stringify({ success: true }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        } 
      }
    )
  } catch (error) {
    console.error('Error in track-visit function:', error)
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        } 
      }
    )
  }
})