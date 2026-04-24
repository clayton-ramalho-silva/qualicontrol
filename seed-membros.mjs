import mysql from "mysql2/promise";
import dotenv from "dotenv";
dotenv.config();

const conn = await mysql.createConnection(process.env.DATABASE_URL);

// Buscar IDs das obras
const [obrasRows] = await conn.execute("SELECT id, nome FROM obras");
const obraMap = {};
for (const o of obrasRows) obraMap[o.nome] = o.id;

const frecId = obraMap["FRECFUNCHAL"] || 1;
const torreId = obraMap["TORRE ALPHA"] || 2;
const fariaId = obraMap["FARIA LIMA 500"] || 3;

const membros = [
  // FRECFUNCHAL - dados do relatório
  { nome: "Avaliador FRECFUNCHAL", email: "avaliador.frec@athiewohnrath.com.br", telefone: "(11) 99999-0001", cargo: "avaliador", obraIds: [frecId] },
  { nome: "Gerente de Obra FRECFUNCHAL", email: "go.frec@athiewohnrath.com.br", telefone: "(11) 99999-0002", cargo: "gerente_obra", obraIds: [frecId] },
  { nome: "Gerente de Contrato FRECFUNCHAL", email: "gc.frec@athiewohnrath.com.br", telefone: "(11) 99999-0003", cargo: "gerente_contrato", obraIds: [frecId] },
  { nome: "Núcleo Qualidade", email: "nucleo@athiewohnrath.com.br", telefone: "(11) 99999-0004", cargo: "nucleo", obraIds: [frecId, torreId, fariaId] },
  // TORRE ALPHA
  { nome: "Avaliador TORRE ALPHA", email: "avaliador.torre@athiewohnrath.com.br", telefone: "(11) 99999-0005", cargo: "avaliador", obraIds: [torreId] },
  { nome: "Gerente de Obra TORRE ALPHA", email: "go.torre@athiewohnrath.com.br", telefone: "(11) 99999-0006", cargo: "gerente_obra", obraIds: [torreId] },
  { nome: "Gerente de Contrato TORRE ALPHA", email: "gc.torre@athiewohnrath.com.br", telefone: "(11) 99999-0007", cargo: "gerente_contrato", obraIds: [torreId] },
  // FARIA LIMA
  { nome: "Avaliador FARIA LIMA", email: "avaliador.fl@athiewohnrath.com.br", telefone: "(11) 99999-0008", cargo: "avaliador", obraIds: [fariaId] },
  { nome: "Gerente de Obra FARIA LIMA", email: "go.fl@athiewohnrath.com.br", telefone: "(11) 99999-0009", cargo: "gerente_obra", obraIds: [fariaId] },
  // Diretoria e Coordenação (multi-obra)
  { nome: "Diretor de Operações", email: "diretoria@athiewohnrath.com.br", telefone: "(11) 99999-0010", cargo: "diretoria", obraIds: [frecId, torreId, fariaId] },
  { nome: "Coordenador de Qualidade", email: "coord.qualidade@athiewohnrath.com.br", telefone: "(11) 99999-0011", cargo: "coordenador", obraIds: [frecId, torreId, fariaId] },
  { nome: "Técnico de Campo", email: "tecnico@athiewohnrath.com.br", telefone: "(11) 99999-0012", cargo: "tecnico", obraIds: [frecId, torreId] },
];

for (const m of membros) {
  await conn.execute(
    "INSERT INTO membros_equipe (nome, email, telefone, cargo, obraIds, ativo) VALUES (?, ?, ?, ?, ?, 1)",
    [m.nome, m.email, m.telefone, m.cargo, JSON.stringify(m.obraIds)]
  );
  console.log(`✓ Membro criado: ${m.nome} (${m.cargo})`);
}

console.log(`\n✅ ${membros.length} membros inseridos com sucesso!`);
await conn.end();
