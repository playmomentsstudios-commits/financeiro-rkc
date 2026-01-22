import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey, {
        auth: { persistSession: false },
      })
    : null;

function getClient() {
  if (!supabase) {
    console.warn(
      "Supabase não configurado. Defina NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    );
    return null;
  }
  return supabase;
}

export type Materia = {
  id: string;
  slug: string;
  titulo: string;
  resumo: string | null;
  capa_url: string | null;
  conteudo_md: string;
  autor: string | null;
  tags: string[];
  publicado: boolean;
  publicado_em: string | null;
  created_at: string;
};

export type ProjetoSite = {
  id: string;
  slug: string;
  titulo: string;
  resumo: string | null;
  capa_url: string | null;
  apresentacao: string | null;
  objetivos: string | null;
  realizado: string | null;
  tags: string[];
  galeria: Array<{ tipo: "imagem" | "video"; url: string; descricao?: string }>;
  publicado: boolean;
  ordem: number;
  created_at: string;
};

export async function getProjetosPublicados(tag?: string) {
  const client = getClient();
  if (!client) return [];

  let query = client
    .from("projetos_site")
    .select("id,slug,titulo,resumo,capa_url,tags,ordem")
    .eq("publicado", true)
    .order("ordem", { ascending: true })
    .order("created_at", { ascending: false });

  if (tag) {
    query = query.contains("tags", [tag]);
  }

  const { data, error } = await query;
  if (error) {
    console.error("Erro ao buscar projetos:", error.message);
    return [];
  }

  return data as ProjetoSite[];
}

export async function getProjetoPorSlug(slug: string) {
  const client = getClient();
  if (!client) return null;

  const { data, error } = await client
    .from("projetos_site")
    .select("*")
    .eq("slug", slug)
    .eq("publicado", true)
    .single();

  if (error) {
    console.error("Erro ao buscar projeto:", error.message);
    return null;
  }

  return data as ProjetoSite;
}

export async function getMateriasPublicadas(options?: {
  limit?: number;
  tags?: string[];
  search?: string;
}) {
  const { limit = 12, tags, search } = options ?? {};
  const client = getClient();
  if (!client) return [];

  let query = client
    .from("materias")
    .select("id,slug,titulo,resumo,capa_url,autor,tags,publicado_em")
    .eq("publicado", true)
    .order("publicado_em", { ascending: false })
    .limit(limit);

  if (tags && tags.length > 0) {
    query = query.contains("tags", tags);
  }

  if (search) {
    query = query.or(`titulo.ilike.%${search}%,resumo.ilike.%${search}%`);
  }

  const { data, error } = await query;
  if (error) {
    console.error("Erro ao buscar matérias:", error.message);
    return [];
  }

  return data as Materia[];
}

export async function getMateriaPorSlug(slug: string) {
  const client = getClient();
  if (!client) return null;

  const { data, error } = await client
    .from("materias")
    .select("*")
    .eq("slug", slug)
    .eq("publicado", true)
    .single();

  if (error) {
    console.error("Erro ao buscar matéria:", error.message);
    return null;
  }

  return data as Materia;
}

export async function getMateriasRelacionadas(tag?: string, slug?: string) {
  if (!tag) {
    return [] as Materia[];
  }

  const client = getClient();
  if (!client) return [];

  let query = client
    .from("materias")
    .select("id,slug,titulo,resumo,capa_url,autor,tags,publicado_em")
    .eq("publicado", true)
    .contains("tags", [tag])
    .order("publicado_em", { ascending: false })
    .limit(3);

  if (slug) {
    query = query.neq("slug", slug);
  }

  const { data, error } = await query;
  if (error) {
    console.error("Erro ao buscar matérias relacionadas:", error.message);
    return [];
  }

  return data as Materia[];
}
