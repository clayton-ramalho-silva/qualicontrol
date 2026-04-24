import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import { toast } from "sonner";
import { Building2, PlusCircle, MapPin, User, Loader2 } from "lucide-react";

const STATUS_COLORS: Record<string, string> = {
  ativa: "bg-emerald-100 text-emerald-700 border-emerald-200",
  concluida: "bg-blue-100 text-blue-700 border-blue-200",
  pausada: "bg-amber-100 text-amber-700 border-amber-200",
};

export default function Obras() {
  const utils = trpc.useUtils();
  const { data: obras, isLoading } = trpc.obras.list.useQuery();
  const [showDialog, setShowDialog] = useState(false);
  const [codigo, setCodigo] = useState("");
  const [nome, setNome] = useState("");
  const [cliente, setCliente] = useState("");
  const [endereco, setEndereco] = useState("");

  const createObra = trpc.obras.create.useMutation({
    onSuccess: () => {
      utils.obras.list.invalidate();
      setShowDialog(false);
      setCodigo(""); setNome(""); setCliente(""); setEndereco("");
      toast.success("Obra cadastrada com sucesso!");
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Building2 className="h-6 w-6 text-primary" /> Obras
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Gerencie as obras monitoradas pelo sistema de qualidade
          </p>
        </div>
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogTrigger asChild>
            <Button size="sm">
              <PlusCircle className="h-4 w-4 mr-1.5" /> Nova Obra
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Cadastrar Nova Obra</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-2">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm">Código *</Label>
                  <Input value={codigo} onChange={(e) => setCodigo(e.target.value)} placeholder="Ex: 4787/25" className="mt-1" />
                </div>
                <div>
                  <Label className="text-sm">Nome *</Label>
                  <Input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Nome da obra" className="mt-1" />
                </div>
              </div>
              <div>
                <Label className="text-sm">Cliente</Label>
                <Input value={cliente} onChange={(e) => setCliente(e.target.value)} placeholder="Nome do cliente" className="mt-1" />
              </div>
              <div>
                <Label className="text-sm">Endereço</Label>
                <Input value={endereco} onChange={(e) => setEndereco(e.target.value)} placeholder="Endereço da obra" className="mt-1" />
              </div>
              <Button className="w-full" disabled={!codigo || !nome || createObra.isPending}
                onClick={() => createObra.mutate({ codigo, nome, cliente: cliente || undefined, endereco: endereco || undefined })}>
                {createObra.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Cadastrar Obra
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-40 rounded-xl" />)}
        </div>
      ) : !obras || obras.length === 0 ? (
        <Card className="shadow-sm border-0">
          <CardContent className="p-12 text-center">
            <Building2 className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-muted-foreground">Nenhuma obra cadastrada. Comece adicionando sua primeira obra.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {obras.map((obra) => (
            <Card key={obra.id} className="shadow-sm border-0 bg-card hover:shadow-md transition-all">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <span className="text-xs font-mono text-muted-foreground">{obra.codigo}</span>
                    <h3 className="text-base font-semibold mt-0.5">{obra.nome}</h3>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full border ${STATUS_COLORS[obra.status] || STATUS_COLORS.ativa}`}>
                    {obra.status.charAt(0).toUpperCase() + obra.status.slice(1)}
                  </span>
                </div>
                {obra.cliente && (
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-2">
                    <User className="h-3 w-3" /> {obra.cliente}
                  </div>
                )}
                {obra.endereco && (
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
                    <MapPin className="h-3 w-3" /> {obra.endereco}
                  </div>
                )}
                <div className="text-[11px] text-muted-foreground/60 mt-3">
                  Criada em {new Date(obra.createdAt).toLocaleDateString("pt-BR")}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
