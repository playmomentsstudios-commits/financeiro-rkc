"use client";

type Linha = {
  categoria: string;
  valor_planejado: number;
  valor_executado: number;
  saldo: number;
  execucao_percentual: number | null;
};

function moeda(v: number) {
  return (v ?? 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function TabelaCategorias({ data }: { data: Linha[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-separate border-spacing-0">
        <thead>
          <tr className="text-left text-xs opacity-80">
            <th className="py-2">Categoria</th>
            <th className="py-2">Planejado</th>
            <th className="py-2">Executado</th>
            <th className="py-2">Saldo</th>
            <th className="py-2">% Execução</th>
          </tr>
        </thead>
        <tbody>
          {data.map((r) => (
            <tr key={r.categoria} className="border-t border-white/10 text-sm">
              <td className="py-2">{r.categoria}</td>
              <td className="py-2">{moeda(Number(r.valor_planejado ?? 0))}</td>
              <td className="py-2">{moeda(Number(r.valor_executado ?? 0))}</td>
              <td className="py-2">{moeda(Number(r.saldo ?? 0))}</td>
              <td className="py-2">
                {r.execucao_percentual == null ? "-" : `${Number(r.execucao_percentual).toFixed(1)}%`}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {data.length === 0 && (
        <p className="mt-2 text-sm opacity-70">
          Sem dados por categoria para este projeto.
        </p>
      )}
    </div>
  );
}
