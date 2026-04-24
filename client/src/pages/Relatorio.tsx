import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useState, useRef } from "react";
import {
  FileText, Download, Loader2, BarChart3, AlertTriangle,
  CheckCircle2, Clock, TrendingUp, Printer, BrainCircuit,
} from "lucide-react";
import { Streamdown } from "streamdown";

export default function Relatorio() {
  const { data: obras } = trpc.obras.list.useQuery();
  const [selectedObraId, setSelectedObraId] = useState<string>("all");
  const [incluirAnalise, setIncluirAnalise] = useState(true);
  const obraIdNum = selectedObraId === "all" ? undefined : parseInt(selectedObraId);
  const reportRef = useRef<HTMLDivElement>(null);

  const generateMutation = trpc.relatorio.generate.useMutation();

  const handleGenerate = () => {
    generateMutation.mutate({ obraId: obraIdNum, incluirAnalise });
  };

  const handlePrint = () => {
    if (!reportRef.current) return;
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Relatório QualiControl</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Inter', -apple-system, sans-serif; color: #1e293b; padding: 40px; font-size: 12px; line-height: 1.5; }
          .header { text-align: center; border-bottom: 3px solid #10b981; padding-bottom: 20px; margin-bottom: 30px; }
          .header h1 { font-size: 24px; color: #0f172a; font-weight: 700; }
          .header p { color: #64748b; font-size: 13px; margin-top: 4px; }
          .section { margin-bottom: 24px; }
          .section h2 { font-size: 16px; font-weight: 600; color: #0f172a; margin-bottom: 12px; padding-bottom: 6px; border-bottom: 1px solid #e2e8f0; }
          .kpi-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 20px; }
          .kpi-card { border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; text-align: center; }
          .kpi-card .value { font-size: 24px; font-weight: 700; }
          .kpi-card .label { font-size: 11px; color: #64748b; text-transform: uppercase; }
          table { width: 100%; border-collapse: collapse; font-size: 11px; }
          th { background: #f1f5f9; padding: 8px 10px; text-align: left; font-weight: 600; border-bottom: 2px solid #e2e8f0; }
          td { padding: 7px 10px; border-bottom: 1px solid #f1f5f9; }
          tr:nth-child(even) { background: #fafafa; }
          .badge { display: inline-block; padding: 2px 8px; border-radius: 12px; font-size: 10px; font-weight: 600; }
          .badge-grave { background: #fef2f2; color: #dc2626; }
          .badge-moderado { background: #fffbeb; color: #d97706; }
          .badge-leve { background: #f0fdf4; color: #16a34a; }
          .badge-aberto { background: #fffbeb; color: #d97706; }
          .badge-em_andamento { background: #eff6ff; color: #2563eb; }
          .analise { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin-top: 12px; }
          .analise p { margin-bottom: 8px; }
          .footer { text-align: center; color: #94a3b8; font-size: 10px; margin-top: 40px; padding-top: 16px; border-top: 1px solid #e2e8f0; }
          @media print { body { padding: 20px; } .no-print { display: none; } }
        </style>
      </head>
      <body>${reportRef.current.innerHTML}
        <div class="footer">
          <p>Relatório gerado automaticamente pelo QualiControl &mdash; ${new Date().toLocaleDateString("pt-BR")} às ${new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</p>
        </div>
      </body>
      </html>
    `);
    printWindow.document.close();
    setTimeout(() => { printWindow.print(); }, 500);
  };

  const data = generateMutation.data;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <FileText className="h-6 w-6 text-primary" /> Relatório Consolidado
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Gere relatórios consolidados com KPIs, análise IA e lista de desvios
          </p>
        </div>
      </div>

      {/* Config */}
      <Card className="shadow-sm border-0 bg-card">
        <CardContent className="p-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex-1">
              <Label className="text-sm font-medium mb-1.5 block">Obra</Label>
              <Select value={selectedObraId} onValueChange={setSelectedObraId}>
                <SelectTrigger className="w-full sm:w-[260px] bg-background">
                  <SelectValue placeholder="Selecione a obra" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as obras</SelectItem>
                  {obras?.map((o) => (
                    <SelectItem key={o.id} value={String(o.id)}>{o.codigo} - {o.nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={incluirAnalise} onCheckedChange={setIncluirAnalise} id="analise" />
              <Label htmlFor="analise" className="text-sm flex items-center gap-1.5">
                <BrainCircuit className="h-3.5 w-3.5 text-primary" /> Incluir análise IA
              </Label>
            </div>
            <Button onClick={handleGenerate} disabled={generateMutation.isPending}>
              {generateMutation.isPending ? (
                <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Gerando...</>
              ) : (
                <><FileText className="h-4 w-4 mr-2" /> Gerar Relatório</>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Report Preview */}
      {data && (
        <>
          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={handlePrint}>
              <Printer className="h-4 w-4 mr-1.5" /> Imprimir / PDF
            </Button>
          </div>

          <Card className="shadow-sm border-0 bg-card">
            <CardContent className="p-8" ref={reportRef}>
              {/* Header */}
              <div className="header text-center border-b-2 border-primary pb-5 mb-6">
                <h1 className="text-2xl font-bold text-foreground">QualiControl</h1>
                <p className="text-sm text-muted-foreground mt-1">
                  Relatório Consolidado de Qualidade
                  {data.obraInfo ? ` — ${data.obraInfo.codigo} ${data.obraInfo.nome}` : " — Todas as Obras"}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Gerado em {new Date(data.dataGeracao).toLocaleDateString("pt-BR")} às {new Date(data.dataGeracao).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>

              {/* KPIs */}
              {data.kpis && (
                <div className="section mb-6">
                  <h2 className="text-base font-semibold mb-4 flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-primary" /> Indicadores de Qualidade
                  </h2>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                    {[
                      { label: "Total", value: data.kpis.total, color: "text-foreground" },
                      { label: "Abertos", value: data.kpis.abertos, color: "text-amber-600" },
                      { label: "Em Andamento", value: data.kpis.emAndamento, color: "text-blue-600" },
                      { label: "Fechados", value: data.kpis.fechados, color: "text-emerald-600" },
                      { label: "Atrasados", value: data.kpis.atrasados, color: "text-red-600" },
                      { label: "Taxa Fech.", value: `${data.kpis.taxaFechamento}%`, color: "text-primary" },
                    ].map((kpi) => (
                      <div key={kpi.label} className="kpi-card border rounded-lg p-3 text-center">
                        <div className={`text-xl font-bold ${kpi.color}`}>{kpi.value}</div>
                        <div className="text-[10px] text-muted-foreground uppercase tracking-wide mt-0.5">{kpi.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <Separator className="my-6" />

              {/* Performance Fornecedores */}
              {data.performance && data.performance.length > 0 && (
                <div className="section mb-6">
                  <h2 className="text-base font-semibold mb-4 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-primary" /> Performance de Fornecedores
                  </h2>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="bg-muted/50">
                          <th className="text-left py-2 px-3 font-semibold">Fornecedor</th>
                          <th className="text-center py-2 px-3 font-semibold">Total</th>
                          <th className="text-center py-2 px-3 font-semibold">Abertos</th>
                          <th className="text-center py-2 px-3 font-semibold">Graves</th>
                          <th className="text-center py-2 px-3 font-semibold">Taxa Fech.</th>
                          <th className="text-center py-2 px-3 font-semibold">Avaliação</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.performance.map((f) => (
                          <tr key={f.nome} className="border-b border-muted/30">
                            <td className="py-2 px-3 font-medium">{f.nome}</td>
                            <td className="py-2 px-3 text-center">{f.totalDesvios}</td>
                            <td className="py-2 px-3 text-center">{f.abertos}</td>
                            <td className="py-2 px-3 text-center">{f.graves}</td>
                            <td className="py-2 px-3 text-center">{f.taxaFechamento}%</td>
                            <td className="py-2 px-3 text-center">
                              <span className={`badge inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                                f.avaliacao === "BOM" ? "badge-leve bg-emerald-100 text-emerald-700" :
                                f.avaliacao === "CRÍTICO" ? "badge-grave bg-red-100 text-red-700" :
                                "badge-moderado bg-amber-100 text-amber-700"
                              }`}>
                                {f.avaliacao}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              <Separator className="my-6" />

              {/* Desvios Abertos */}
              {data.desviosAbertos && data.desviosAbertos.length > 0 && (
                <div className="section mb-6">
                  <h2 className="text-base font-semibold mb-4 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-amber-500" /> Desvios em Aberto ({data.desviosAbertos.length})
                  </h2>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="bg-muted/50">
                          <th className="text-left py-2 px-2 font-semibold">#</th>
                          <th className="text-left py-2 px-2 font-semibold">Disciplina</th>
                          <th className="text-left py-2 px-2 font-semibold">Fornecedor</th>
                          <th className="text-left py-2 px-2 font-semibold">Descrição</th>
                          <th className="text-center py-2 px-2 font-semibold">Severidade</th>
                          <th className="text-center py-2 px-2 font-semibold">Status</th>
                          <th className="text-center py-2 px-2 font-semibold">Data</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.desviosAbertos.map((d) => (
                          <tr key={d.id} className="border-b border-muted/30">
                            <td className="py-1.5 px-2 font-mono text-muted-foreground">{d.id}</td>
                            <td className="py-1.5 px-2">{d.disciplina}</td>
                            <td className="py-1.5 px-2">{d.fornecedor || "—"}</td>
                            <td className="py-1.5 px-2 max-w-[200px] truncate">{d.descricao}</td>
                            <td className="py-1.5 px-2 text-center">
                              <span className={`badge inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                                d.severidade === "grave" ? "badge-grave bg-red-100 text-red-700" :
                                d.severidade === "moderado" ? "badge-moderado bg-amber-100 text-amber-700" :
                                "badge-leve bg-emerald-100 text-emerald-700"
                              }`}>
                                {d.severidade}
                              </span>
                            </td>
                            <td className="py-1.5 px-2 text-center">
                              <span className={`badge inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                                d.status === "aberto" ? "badge-aberto bg-amber-100 text-amber-700" : "bg-blue-100 text-blue-700"
                              }`}>
                                {d.status === "em_andamento" ? "Em And." : "Aberto"}
                              </span>
                            </td>
                            <td className="py-1.5 px-2 text-center text-muted-foreground">
                              {new Date(d.dataIdentificacao).toLocaleDateString("pt-BR")}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Análise IA */}
              {data.analise && (
                <>
                  <Separator className="my-6" />
                  <div className="section">
                    <h2 className="text-base font-semibold mb-4 flex items-center gap-2">
                      <BrainCircuit className="h-4 w-4 text-primary" /> Análise Executiva (IA)
                    </h2>
                    <div className="analise bg-muted/30 border rounded-lg p-4">
                      <div className="prose prose-sm max-w-none text-foreground">
                        <Streamdown>{data.analise}</Streamdown>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {/* Empty State */}
      {!data && !generateMutation.isPending && (
        <Card className="shadow-sm border-0 bg-card">
          <CardContent className="p-12 text-center">
            <FileText className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-muted-foreground">
              Configure as opções acima e clique em "Gerar Relatório" para criar um relatório consolidado.
            </p>
            <p className="text-xs text-muted-foreground/60 mt-2">
              O relatório incluirá KPIs, performance de fornecedores, lista de desvios abertos e análise IA.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
