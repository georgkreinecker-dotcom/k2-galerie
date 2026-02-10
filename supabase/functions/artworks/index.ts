/**
 * Supabase Edge Function: Artworks API
 * Professionelle REST API für Werke-Verwaltung
 * 
 * Endpoints:
 * - GET /artworks - Alle Werke laden
 * - POST /artworks - Werke speichern (Bulk oder Single)
 * - PUT /artworks - Werk aktualisieren
 * - DELETE /artworks - Werk löschen
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
}

serve(async (req) => {
  // CORS Preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Supabase Client erstellen
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase Umgebungsvariablen fehlen')
    }

    const supabase = createClient(supabaseUrl, supabaseKey)
    const method = req.method

    // GET: Alle Werke laden
    if (method === 'GET') {
      const { data, error } = await supabase
        .from('artworks')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('GET Error:', error)
        throw error
      }

      return new Response(
        JSON.stringify({ 
          artworks: data || [],
          count: data?.length || 0,
          timestamp: new Date().toISOString()
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    }

    // POST: Neues Werk erstellen oder mehrere speichern
    if (method === 'POST') {
      const body = await req.json()
      
      if (!body) {
        throw new Error('Request Body fehlt')
      }
      
      // Wenn Array: Bulk Insert/Upsert
      if (Array.isArray(body.artworks)) {
        if (body.artworks.length === 0) {
          return new Response(
            JSON.stringify({ artworks: [], count: 0 }),
            {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 200,
            }
          )
        }

        // Validierung
        const validArtworks = body.artworks.filter((a: any) => {
          if (!a.number && !a.id) {
            console.warn('Werk ohne number/id übersprungen:', a)
            return false
          }
          return true
        }).map((a: any) => ({
          number: a.number || a.id,
          title: a.title || '',
          category: a.category || 'malerei',
          image_url: a.image_url || a.imageUrl || null,
          preview_url: a.preview_url || a.previewUrl || null,
          price: a.price ? parseFloat(String(a.price)) : null,
          description: a.description || null,
          location: a.location || null,
          in_shop: a.in_shop || a.inShop || false,
          created_at: a.created_at || a.createdAt || new Date().toISOString(),
          updated_at: a.updated_at || a.updatedAt || new Date().toISOString(),
          created_on_mobile: a.created_on_mobile || a.createdOnMobile || false,
          updated_on_mobile: a.updated_on_mobile || a.updatedOnMobile || false,
        }))

        const { data, error } = await supabase
          .from('artworks')
          .upsert(validArtworks, { onConflict: 'number' })
          .select()

        if (error) {
          console.error('POST Bulk Error:', error)
          throw error
        }

        return new Response(
          JSON.stringify({ 
            artworks: data || [],
            count: data?.length || 0,
            timestamp: new Date().toISOString()
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
          }
        )
      }

      // Einzelnes Werk
      if (!body.number && !body.id) {
        throw new Error('number oder id ist erforderlich')
      }

      const artwork = {
        number: body.number || body.id,
        title: body.title || '',
        category: body.category || 'malerei',
        image_url: body.image_url || body.imageUrl || null,
        preview_url: body.preview_url || body.previewUrl || null,
        price: body.price ? parseFloat(String(body.price)) : null,
        description: body.description || null,
        location: body.location || null,
        in_shop: body.in_shop || body.inShop || false,
        created_at: body.created_at || body.createdAt || new Date().toISOString(),
        updated_at: body.updated_at || body.updatedAt || new Date().toISOString(),
        created_on_mobile: body.created_on_mobile || body.createdOnMobile || false,
        updated_on_mobile: body.updated_on_mobile || body.updatedOnMobile || false,
      }

      const { data, error } = await supabase
        .from('artworks')
        .upsert(artwork, { onConflict: 'number' })
        .select()
        .single()

      if (error) {
        console.error('POST Single Error:', error)
        throw error
      }

      return new Response(
        JSON.stringify({ 
          artwork: data,
          timestamp: new Date().toISOString()
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 201,
        }
      )
    }

    // PUT: Werk aktualisieren
    if (method === 'PUT') {
      const body = await req.json()
      const { number, id, ...updates } = body

      const identifier = number || id
      if (!identifier) {
        throw new Error('number oder id ist erforderlich')
      }

      const updateData = {
        ...updates,
        updated_at: new Date().toISOString(),
      }

      // Konvertiere App-Format zu DB-Format
      if (updateData.imageUrl) {
        updateData.image_url = updateData.imageUrl
        delete updateData.imageUrl
      }
      if (updateData.previewUrl) {
        updateData.preview_url = updateData.previewUrl
        delete updateData.previewUrl
      }
      if (updateData.inShop !== undefined) {
        updateData.in_shop = updateData.inShop
        delete updateData.inShop
      }
      if (updateData.createdOnMobile !== undefined) {
        updateData.created_on_mobile = updateData.createdOnMobile
        delete updateData.createdOnMobile
      }
      if (updateData.updatedOnMobile !== undefined) {
        updateData.updated_on_mobile = updateData.updatedOnMobile
        delete updateData.updatedOnMobile
      }

      const { data, error } = await supabase
        .from('artworks')
        .update(updateData)
        .eq('number', identifier)
        .select()
        .single()

      if (error) {
        console.error('PUT Error:', error)
        throw error
      }

      return new Response(
        JSON.stringify({ 
          artwork: data,
          timestamp: new Date().toISOString()
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    }

    // DELETE: Werk löschen
    if (method === 'DELETE') {
      const body = await req.json()
      const { number, id } = body || {}

      const identifier = number || id
      if (!identifier) {
        throw new Error('number oder id ist erforderlich')
      }

      const { error } = await supabase
        .from('artworks')
        .delete()
        .eq('number', identifier)

      if (error) {
        console.error('DELETE Error:', error)
        throw error
      }

      return new Response(
        JSON.stringify({ 
          success: true,
          timestamp: new Date().toISOString()
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    }

    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 405,
      }
    )
  } catch (error: any) {
    console.error('Edge Function Error:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Unbekannter Fehler',
        details: error.details || null,
        code: error.code || null
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: error.status || 400,
      }
    )
  }
})
