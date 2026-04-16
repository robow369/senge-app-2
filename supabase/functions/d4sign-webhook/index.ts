import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const payload = await req.json();
    const { uuid_document, type_post } = payload;

    if (!uuid_document) {
      return new Response("missing uuid_document", { status: 400, headers: corsHeaders });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: submission, error: fetchError } = await supabase
      .from("registration_submissions")
      .select("*")
      .eq("d4sign_document_uuid", uuid_document)
      .maybeSingle();

    if (fetchError || !submission) {
      return new Response("submission not found", { status: 404, headers: corsHeaders });
    }

    if (type_post === "signed") {
      const apiResponse = {
        success: true,
        message: "Cadastro atualizado com sucesso!",
        data: {
          id: submission.id,
          updatedAt: new Date().toISOString(),
        },
      };

      await supabase
        .from("registration_submissions")
        .update({ status: "signed" })
        .eq("id", submission.id);

      await supabase
        .from("registration_submissions")
        .update({ status: "submitted", api_response: apiResponse })
        .eq("id", submission.id);
    } else {
      const reason = type_post ?? "unknown";
      await supabase
        .from("registration_submissions")
        .update({
          status: "failed",
          error_message: `Documento não assinado. Evento D4Sign: ${reason}`,
        })
        .eq("id", submission.id);
    }

    return new Response("ok", { status: 200, headers: corsHeaders });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro interno";
    return new Response(message, { status: 500, headers: corsHeaders });
  }
});
