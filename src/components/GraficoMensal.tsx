"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";

type Linha = {
  mes: string;
  entradas: number;
  saidas: number;
};

function moeda(v: number) {
  return (v ?? 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function GraficoMensal({ data }: { data: Linha[] }) {
  return (
    <div className="h-[320px] w-full">
      <ResponsiveContainer>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
          <XAxis dataKey="mes" />
          <YAxis tickFormatter={(v) => moeda(Number(v))} />
          <Tooltip formatter={(v) => moeda(Number(v))} />
          <Legend />
          <Bar dataKey="entradas" name="Entradas" fill="#22c55e" radius={[6, 6, 0, 0]} />
          <Bar dataKey="saidas" name="Saídas" fill="#ef4444" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
