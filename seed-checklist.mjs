import mysql from "mysql2/promise";
import dotenv from "dotenv";
dotenv.config();

const conn = await mysql.createConnection(process.env.DATABASE_URL);

// ── Faixas de Classificação ──
const faixas = [
  { nome: "ÓTIMA",    minimo: 80, maximo: 100, cor: "#10b981", ordem: 1 },
  { nome: "REGULAR",  minimo: 75, maximo: 79,  cor: "#f59e0b", ordem: 2 },
  { nome: "RUIM",     minimo: 50, maximo: 74,  cor: "#ef4444", ordem: 3 },
  { nome: "CRÍTICO",  minimo: 0,  maximo: 49,  cor: "#991b1b", ordem: 4 },
];

for (const f of faixas) {
  await conn.execute(
    "INSERT INTO config_faixas (nome, minimo, maximo, cor, ordem) VALUES (?, ?, ?, ?, ?)",
    [f.nome, f.minimo, f.maximo, f.cor, f.ordem]
  );
}
console.log("✅ Faixas de classificação inseridas");

// ── Seções do Checklist ──
const secoes = [
  { numero: 1, titulo: "Acompanhamento",     peso: 0,  reincidencia: 5,  ordem: 1 },
  { numero: 2, titulo: "Condição de Obra",   peso: 10, reincidencia: 0,  ordem: 2 },
  { numero: 3, titulo: "Qualidade de Obra",  peso: 10, reincidencia: 10, ordem: 3 },
  { numero: 4, titulo: "Cronograma",         peso: 10, reincidencia: 0,  ordem: 4 },
];

const secaoIds = {};
for (const s of secoes) {
  const [result] = await conn.execute(
    "INSERT INTO checklist_secoes (numero, titulo, peso, reincidencia, ordem) VALUES (?, ?, ?, ?, ?)",
    [s.numero, s.titulo, s.peso, s.reincidencia, s.ordem]
  );
  secaoIds[s.numero] = result.insertId;
}
console.log("✅ Seções inseridas:", secaoIds);

// ── Itens do Checklist ──
const itens = [
  // Seção 1 - Acompanhamento
  { secao: 1, codigo: "1.1", descricao: "A inspeção e preenchimento do Check List foram acompanhados pelo Responsável da Obra?", ordem: 1 },

  // Seção 2 - Condição de Obra
  { secao: 2, codigo: "2.1",  descricao: "A obra possui painel de controle de produção: GO fazendo controle diário das disciplinas controladas?", ordem: 1 },
  { secao: 2, codigo: "2.2",  descricao: "Existe relatório de visita do engenheiro de instalações?", ordem: 2 },
  { secao: 2, codigo: "2.3",  descricao: "A obra está finalizando os registros apontados no AWCHECK? Existem desvios abertos a mais de 7 dias sem tratamento?", ordem: 3 },
  { secao: 2, codigo: "2.4",  descricao: "As principais plantas da obra estão coladas na parede?", ordem: 4 },
  { secao: 2, codigo: "2.5",  descricao: "Histograma do respectivo andar está atualizado diariamente?", ordem: 5 },
  { secao: 2, codigo: "2.6",  descricao: "Cronograma da obra está visível e disponível?", ordem: 6 },
  { secao: 2, codigo: "2.7",  descricao: "Estão sendo realizadas reuniões com os fornecedores semanalmente?", ordem: 7 },
  { secao: 2, codigo: "2.8",  descricao: "A obra possui índice de plantas atualizado e disposto no local correto? (verificar se o mesmo está na placa da obra)", ordem: 8 },
  { secao: 2, codigo: "2.9",  descricao: "A obra está conferindo as principais disciplinas e registrando nas FVS específicas? Os registros estão corretos?", ordem: 9 },
  { secao: 2, codigo: "2.10", descricao: "Os fornecedores possuem ferramentas adequadas para realização dos serviços?", ordem: 10 },
  { secao: 2, codigo: "2.11", descricao: "Existe proteção dos serviços executados? Estão executadas corretamente? (proteção de piso, carpete, caixilhos e demais)", ordem: 11 },
  { secao: 2, codigo: "2.12", descricao: "Os materiais e/ou equipamentos do cliente estão estocados e/ou guardados em local seguro, sendo preservado contra avarias, perda ou furto?", ordem: 12 },
  { secao: 2, codigo: "2.13", descricao: "A obra possui empresa para limpeza? A quantidade de colaboradores atende a necessidade atual da obra?", ordem: 13 },
  { secao: 2, codigo: "2.14", descricao: "A obra encontra-se limpa e organizada, com remoção sistemática de resíduos, acessos desobstruídos, de modo a não comprometer a qualidade dos serviços executados?", ordem: 14 },

  // Seção 3 - Qualidade de Obra
  { secao: 3, codigo: "3.1",  descricao: "Existem desvios críticos de qualidade na disciplina de CARPETE?", ordem: 1 },
  { secao: 3, codigo: "3.2",  descricao: "Existem desvios críticos de qualidade na disciplina de FORROS DE DRYWALL?", ordem: 2 },
  { secao: 3, codigo: "3.3",  descricao: "Existem desvios críticos de qualidade na disciplina de FORROS MODULARES?", ordem: 3 },
  { secao: 3, codigo: "3.4",  descricao: "Existem desvios críticos de qualidade na disciplina de PAREDES DE DRYWALL?", ordem: 4 },
  { secao: 3, codigo: "3.5",  descricao: "Existem desvios críticos de qualidade na disciplina de PINTURA?", ordem: 5 },
  { secao: 3, codigo: "3.6",  descricao: "Existem desvios críticos de qualidade na disciplina de PISO ELEVADO?", ordem: 6 },
  { secao: 3, codigo: "3.7",  descricao: "Existem desvios críticos de qualidade na disciplina de PISO VINÍLICO?", ordem: 7 },
  { secao: 3, codigo: "3.8",  descricao: "Existem desvios críticos de qualidade na disciplina de IMPERMEABILIZAÇÃO?", ordem: 8 },
  { secao: 3, codigo: "3.9",  descricao: "Existem desvios críticos de qualidade na disciplina de ALVENARIA?", ordem: 9 },
  { secao: 3, codigo: "3.10", descricao: "Existem desvios críticos relacionados à vedação e estanqueidade ACÚSTICA do septo de entreforro, paredes e pisos?", ordem: 10 },
  { secao: 3, codigo: "3.11", descricao: "Existem desvios críticos de qualidade na disciplina de REVESTIMENTO CERÂMICO?", ordem: 11 },
  { secao: 3, codigo: "3.12", descricao: "Existem desvios críticos de qualidade EM DISCIPLINAS ESPECÍFICAS DO ESCOPO, que podem afetar a qualidade final do produto?", ordem: 12 },
  { secao: 3, codigo: "3.13", descricao: "Os materiais utilizados e que serão utilizados estão com a validade dentro do prazo?", ordem: 13 },

  // Seção 4 - Cronograma
  { secao: 4, codigo: "4.1", descricao: "O cronograma de execução da obra está sendo cumprido? A obra apresenta evidências de que está cumprindo o planejamento?", ordem: 1 },
  { secao: 4, codigo: "4.2", descricao: "Os fornecedores de serviço de caminho crítico estão todos contratados? A quantidade de colaboradores atende a necessidade atual da obra?", ordem: 2 },
];

for (const item of itens) {
  await conn.execute(
    "INSERT INTO checklist_itens (secaoId, codigo, descricao, ordem) VALUES (?, ?, ?, ?)",
    [secaoIds[item.secao], item.codigo, item.descricao, item.ordem]
  );
}
console.log(`✅ ${itens.length} itens do checklist inseridos`);

// ── Verificação de exemplo para FRECFUNCHAL ──
const [obrasResult] = await conn.execute("SELECT id FROM obras WHERE codigo = 'FREC-4787' LIMIT 1");
if (obrasResult.length > 0) {
  const obraId = obrasResult[0].id;
  const dataVistoria = new Date("2025-03-27").getTime();
  
  const [verResult] = await conn.execute(
    `INSERT INTO verificacoes (obraId, avaliador, dataVistoria, go, gc, nucleo, diretoria, 
     scoreGeral, scoreCondicao, scoreCronograma, scoreQualidade,
     statusGeral, statusCondicao, statusCronograma, statusQualidade, observacoes) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [obraId, "Equipe Qualidade AW", dataVistoria, "GO Responsável", "GC Responsável", 
     "Núcleo Interiores", "Diretoria Operações",
     85, 82, 90, 83,
     "ÓTIMA", "ÓTIMA", "ÓTIMA", "ÓTIMA",
     "4ª Verificação semanal - Interiores. Condição geral da obra considerada ótima, com pontos de atenção em marcenaria e pintura."]
  );
  
  const verificacaoId = verResult.insertId;
  
  // Buscar todos os itens
  const [allItens] = await conn.execute("SELECT id, codigo FROM checklist_itens ORDER BY id");
  
  // Respostas baseadas no relatório real do FRECFUNCHAL
  const respostasMap = {
    "1.1": "AT",
    "2.1": "AT", "2.2": "NAT", "2.3": "AT", "2.4": "AT", "2.5": "AT",
    "2.6": "AT", "2.7": "NAT", "2.8": "AT", "2.9": "AT", "2.10": "AT",
    "2.11": "AT", "2.12": "AT", "2.13": "AT", "2.14": "AT",
    "3.1": "NA", "3.2": "AT", "3.3": "NA", "3.4": "AT", "3.5": "GR",
    "3.6": "AT", "3.7": "NA", "3.8": "NA", "3.9": "AT", "3.10": "AT",
    "3.11": "NA", "3.12": "NAT", "3.13": "AT",
    "4.1": "AT", "4.2": "AT",
  };
  
  const observacoesMap = {
    "2.2": "Ausência de relatório do engenheiro de instalações - ponto crítico identificado",
    "2.7": "Reuniões com fornecedores não estão sendo realizadas semanalmente conforme padrão",
    "3.5": "Desvios graves na disciplina de Pintura - RC Serviços com problemas recorrentes",
    "3.12": "Marcenaria (Artesanale) com desvio de recuo de 3cm - requer atenção imediata",
  };
  
  for (const item of allItens) {
    const resposta = respostasMap[item.codigo] || "AT";
    const obs = observacoesMap[item.codigo] || null;
    await conn.execute(
      "INSERT INTO verificacao_respostas (verificacaoId, itemId, resposta, observacao) VALUES (?, ?, ?, ?)",
      [verificacaoId, item.id, resposta, obs]
    );
  }
  console.log(`✅ Verificação de exemplo criada para FRECFUNCHAL com ${allItens.length} respostas`);
}

await conn.end();
console.log("✅ Seed do checklist concluído!");
