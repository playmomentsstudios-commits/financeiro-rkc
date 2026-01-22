create extension if not exists pgcrypto;

create table if not exists public.materias (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  titulo text not null,
  resumo text,
  capa_url text,
  conteudo_md text not null,
  autor text,
  tags text[] default '{}'::text[],
  publicado boolean default false,
  publicado_em timestamptz,
  created_at timestamptz default now()
);

create table if not exists public.projetos_site (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  titulo text not null,
  resumo text,
  capa_url text,
  apresentacao text,
  objetivos text,
  realizado text,
  tags text[] default '{}'::text[],
  galeria jsonb default '[]'::jsonb,
  publicado boolean default true,
  ordem int default 0,
  created_at timestamptz default now()
);

create table if not exists public.newsletter_leads (
  id uuid primary key default gen_random_uuid(),
  nome text,
  email text not null,
  lgpd boolean not null default false,
  created_at timestamptz default now()
);

create table if not exists public.contato_msgs (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  email text not null,
  assunto text,
  mensagem text not null,
  created_at timestamptz default now()
);

alter table public.materias enable row level security;
alter table public.projetos_site enable row level security;
alter table public.newsletter_leads enable row level security;
alter table public.contato_msgs enable row level security;

create policy "materias_public_read"
  on public.materias
  for select
  to public
  using (publicado = true);

create policy "projetos_public_read"
  on public.projetos_site
  for select
  to public
  using (publicado = true);

create policy "materias_auth_all"
  on public.materias
  for all
  to authenticated
  using (true)
  with check (true);

create policy "projetos_auth_all"
  on public.projetos_site
  for all
  to authenticated
  using (true)
  with check (true);

create policy "newsletter_public_insert"
  on public.newsletter_leads
  for insert
  to public
  with check (lgpd = true);

create policy "contato_public_insert"
  on public.contato_msgs
  for insert
  to public
  with check (true);

create policy "newsletter_auth_read"
  on public.newsletter_leads
  for select
  to authenticated
  using (true);

create policy "contato_auth_read"
  on public.contato_msgs
  for select
  to authenticated
  using (true);

insert into public.projetos_site (
  slug,
  titulo,
  resumo,
  capa_url,
  apresentacao,
  objetivos,
  realizado,
  tags,
  publicado,
  ordem
) values
  (
    'oficina-de-comunicacao-kalunga',
    'Oficina de Comunicação Kalunga',
    'Formações comunitárias para fortalecer a produção de mídia no território.',
    'https://placehold.co/800x500/png',
    'Projeto voltado à formação de jovens quilombolas em comunicação comunitária.',
    'Capacitar participantes em jornalismo, audiovisual e mídias digitais.',
    'Oficinas presenciais e produção de conteúdos colaborativos.',
    '{Comunicação,Educação}',
    true,
    1
  ),
  (
    'jornal-kalunga',
    'Jornal Kalunga',
    'Publicação impressa e digital com notícias do território Kalunga.',
    'https://placehold.co/800x500/png',
    'Iniciativa jornalística para registrar histórias e acontecimentos locais.',
    'Ampliar a circulação de informações e fortalecer a memória comunitária.',
    'Edições especiais com reportagens e entrevistas.',
    '{Comunicação}',
    true,
    2
  ),
  (
    'podcast-a-voz-da-comunidade',
    'Podcast A Voz da Comunidade',
    'Conversas e relatos sobre cultura, território e identidade quilombola.',
    'https://placehold.co/800x500/png',
    'Série de entrevistas com lideranças e moradores do território.',
    'Dar visibilidade a narrativas locais e fortalecer a participação comunitária.',
    'Temporadas gravadas e distribuídas nas plataformas digitais.',
    '{Podcast,Comunicação}',
    true,
    3
  ),
  (
    'podcast-kalucast',
    'Podcast KaluCast',
    'Programa de áudio com foco em juventude, cultura e inovação quilombola.',
    'https://placehold.co/800x500/png',
    'Podcast produzido por jovens comunicadores Kalunga.',
    'Estimular debates sobre cultura, educação e futuro do território.',
    'Episódios especiais com convidados e cobertura de eventos.',
    '{Podcast,Cultura}',
    true,
    4
  )
on conflict (slug) do nothing;

insert into public.materias (
  slug,
  titulo,
  resumo,
  capa_url,
  conteudo_md,
  autor,
  tags,
  publicado,
  publicado_em
) values
  (
    'comunicacao-quilombola-e-territorio',
    'Comunicação quilombola e território vivo',
    'Como a comunicação comunitária fortalece identidades e mobilização no território Kalunga.',
    'https://placehold.co/800x500/png',
    '# Comunicação quilombola\n\nA comunicação comunitária é uma ferramenta de fortalecimento territorial.\n\n## Destaques\n- Participação da juventude\n- Produção audiovisual local\n- Defesa do território\n',
    'Equipe RKC',
    '{Comunicação,Território}',
    true,
    now()
  ),
  (
    'juventude-kalunga-e-podcasts',
    'Juventude Kalunga e podcasts comunitários',
    'A produção de podcasts como ferramenta de articulação e memória cultural.',
    'https://placehold.co/800x500/png',
    '# Podcast comunitário\n\nOs podcasts têm ampliado o alcance das histórias locais.\n\n## O que aprendemos\n- Técnicas de entrevista\n- Roteirização coletiva\n- Distribuição digital\n',
    'Equipe RKC',
    '{Podcast,Cultura}',
    true,
    now()
  )
on conflict (slug) do nothing;
