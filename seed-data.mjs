import mysql from "mysql2/promise";
import dotenv from "dotenv";
dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) { console.error("DATABASE_URL not set"); process.exit(1); }

async function main() {
  const conn = await mysql.createConnection(DATABASE_URL);
  console.log("Connected to database");

  // Obras
  await conn.execute(`INSERT IGNORE INTO obras (id, codigo, nome, cliente, endereco, statusObra) VALUES
    (1, '4787/25', 'FRECFUNCHAL', 'FREC Funchal', 'Rua Funchal, São Paulo - SP', 'ativa'),
    (2, '4820/25', 'TORRE ALPHA', 'Alpha Incorporadora', 'Av. Paulista, 1000 - SP', 'ativa'),
    (3, '4835/25', 'CENTRO EMPRESARIAL FARIA LIMA', 'FL Empreendimentos', 'Av. Faria Lima, 3500 - SP', 'ativa')
  `);
  console.log("Obras inserted");

  // Fornecedores
  await conn.execute(`INSERT IGNORE INTO fornecedores (id, nome, disciplina, contato, telefone) VALUES
    (1, 'Artesanale', 'Marcenaria', 'Carlos Silva', '(11) 99999-1001'),
    (2, 'RC Serviços', 'Pintura', 'Roberto Costa', '(11) 99999-1002'),
    (3, 'Drywall Master', 'Drywall', 'Ana Santos', '(11) 99999-1003'),
    (4, 'Eletro Instalações', 'Elétrica', 'Pedro Lima', '(11) 99999-1004'),
    (5, 'Clima Control', 'HVAC', 'Maria Oliveira', '(11) 99999-1005'),
    (6, 'Hidro Tech', 'Hidráulica', 'João Mendes', '(11) 99999-1006'),
    (7, 'SPK Sistemas', 'SPK', 'Fernanda Souza', '(11) 99999-1007'),
    (8, 'Piso Premium', 'Piso Elevado', 'Lucas Ferreira', '(11) 99999-1008'),
    (9, 'Forro Modular SP', 'Forro Modular', 'Renata Alves', '(11) 99999-1009'),
    (10, 'Vidraçaria Elite', 'Vidraçaria', 'Marcos Ribeiro', '(11) 99999-1010')
  `);
  console.log("Fornecedores inserted");

  // Desvios FRECFUNCHAL - baseados no relatório real
  const desviosFrecfunchal = [
    // Marcenaria - Artesanale (muitos desvios conforme relatório)
    [1, 'Marcenaria', 1, 'Artesanale', 'Recuo de 3cm nas portas de marcenaria não conforme com projeto', '5º Andar - Sala de Reuniões', 'grave', '2025-03-15', '2025-03-25', 'aberto'],
    [1, 'Marcenaria', 1, 'Artesanale', 'Acabamento irregular nas bordas dos painéis de madeira', '5º Andar - Recepção', 'moderado', '2025-03-17', '2025-03-28', 'em_andamento'],
    [1, 'Marcenaria', 1, 'Artesanale', 'Tonalidade da madeira diferente do padrão aprovado', '5º Andar - Diretoria', 'moderado', '2025-03-18', '2025-03-30', 'aberto'],
    [1, 'Marcenaria', 1, 'Artesanale', 'Dobradiças com folga excessiva em armários', '5º Andar - Copa', 'leve', '2025-03-20', '2025-04-05', 'fechado'],
    [1, 'Marcenaria', 1, 'Artesanale', 'Gavetas não deslizam suavemente - trilho com defeito', '5º Andar - Estação de trabalho', 'moderado', '2025-03-22', '2025-04-02', 'aberto'],
    [1, 'Marcenaria', 1, 'Artesanale', 'Painel de marcenaria com empenamento visível', '4º Andar - Sala VIP', 'grave', '2025-03-24', '2025-04-01', 'aberto'],
    // Pintura - RC Serviços (desvios conforme relatório)
    [1, 'Pintura', 2, 'RC Serviços', 'Manchas visíveis na pintura da parede principal', '5º Andar - Hall de entrada', 'moderado', '2025-03-16', '2025-03-26', 'em_andamento'],
    [1, 'Pintura', 2, 'RC Serviços', 'Cor da pintura divergente do RAL especificado', '5º Andar - Corredor principal', 'grave', '2025-03-18', '2025-03-28', 'aberto'],
    [1, 'Pintura', 2, 'RC Serviços', 'Bolhas na pintura após aplicação de massa corrida', '4º Andar - Sala de treinamento', 'moderado', '2025-03-20', '2025-04-01', 'fechado'],
    [1, 'Pintura', 2, 'RC Serviços', 'Demarcação irregular entre cores diferentes', '5º Andar - Open space', 'leve', '2025-03-22', '2025-04-05', 'fechado'],
    // Drywall
    [1, 'Drywall', 3, 'Drywall Master', 'Junta de dilatação do drywall com trinca visível', '5º Andar - Sala de reuniões 02', 'moderado', '2025-03-17', '2025-03-29', 'em_andamento'],
    [1, 'Drywall', 3, 'Drywall Master', 'Nível do forro de drywall desalinhado em 2cm', '4º Andar - Corredor', 'grave', '2025-03-19', '2025-03-30', 'aberto'],
    // Elétrica
    [1, 'Elétrica', 4, 'Eletro Instalações', 'Tomada instalada fora da posição especificada no projeto', '5º Andar - Estação 15', 'leve', '2025-03-20', '2025-04-03', 'fechado'],
    [1, 'Elétrica', 4, 'Eletro Instalações', 'Fiação exposta na passagem de cabos do piso elevado', '5º Andar - Área técnica', 'grave', '2025-03-21', '2025-03-28', 'aberto'],
    // HVAC
    [1, 'HVAC', 5, 'Clima Control', 'Difusor de ar condicionado com ruído excessivo', '5º Andar - Sala de reuniões 01', 'moderado', '2025-03-19', '2025-04-02', 'em_andamento'],
    // Piso Elevado
    [1, 'Piso Elevado', 8, 'Piso Premium', 'Placa de piso elevado com desnível de 5mm', '5º Andar - Open space', 'moderado', '2025-03-21', '2025-04-01', 'aberto'],
    [1, 'Piso Elevado', 8, 'Piso Premium', 'Acabamento do piso vinílico com bolha de ar', '5º Andar - Recepção', 'leve', '2025-03-23', '2025-04-05', 'fechado'],
    // Forro
    [1, 'Forro Modular', 9, 'Forro Modular SP', 'Placa de forro modular com mancha de umidade', '4º Andar - Banheiro masculino', 'moderado', '2025-03-22', '2025-04-03', 'aberto'],
    // Vidraçaria
    [1, 'Vidraçaria', 10, 'Vidraçaria Elite', 'Vidro temperado com micro trinca na borda inferior', '5º Andar - Sala de reuniões 03', 'grave', '2025-03-24', '2025-03-31', 'aberto'],
  ];

  // Desvios TORRE ALPHA
  const desviosTorreAlpha = [
    [2, 'Marcenaria', 1, 'Artesanale', 'Marcenaria com dimensões fora do especificado', '10º Andar - Sala CEO', 'grave', '2025-03-10', '2025-03-20', 'fechado'],
    [2, 'Pintura', 2, 'RC Serviços', 'Pintura com cobertura insuficiente na segunda demão', '10º Andar - Hall', 'moderado', '2025-03-12', '2025-03-22', 'fechado'],
    [2, 'Drywall', 3, 'Drywall Master', 'Parede de drywall com ondulação visível', '9º Andar - Open space', 'moderado', '2025-03-14', '2025-03-25', 'em_andamento'],
    [2, 'Elétrica', 4, 'Eletro Instalações', 'Quadro elétrico sem identificação dos circuitos', '10º Andar - Área técnica', 'leve', '2025-03-16', '2025-03-30', 'fechado'],
    [2, 'HVAC', 5, 'Clima Control', 'Duto de ar condicionado com vazamento na junta', '9º Andar - Sala de reuniões', 'grave', '2025-03-18', '2025-03-28', 'aberto'],
    [2, 'Hidráulica', 6, 'Hidro Tech', 'Vazamento na conexão do registro do banheiro', '10º Andar - Banheiro feminino', 'grave', '2025-03-20', '2025-03-27', 'fechado'],
  ];

  // Desvios FARIA LIMA
  const desviosFariaLima = [
    [3, 'Marcenaria', 1, 'Artesanale', 'Bancada de marcenaria com laminado descolando', '15º Andar - Copa', 'moderado', '2025-03-08', '2025-03-18', 'fechado'],
    [3, 'Pintura', 2, 'RC Serviços', 'Pintura epóxi do piso com descascamento prematuro', '15º Andar - Garagem', 'grave', '2025-03-10', '2025-03-20', 'em_andamento'],
    [3, 'SPK', 7, 'SPK Sistemas', 'Sprinkler instalado com espaçamento incorreto', '15º Andar - Open space', 'grave', '2025-03-12', '2025-03-22', 'aberto'],
    [3, 'Piso Elevado', 8, 'Piso Premium', 'Pedestal do piso elevado com altura irregular', '14º Andar - Sala de TI', 'moderado', '2025-03-14', '2025-03-24', 'fechado'],
  ];

  const allDesvios = [...desviosFrecfunchal, ...desviosTorreAlpha, ...desviosFariaLima];

  for (const d of allDesvios) {
    const dataId = new Date(d[7]).getTime();
    const prazo = d[8] ? new Date(d[8]).getTime() : null;
    const dataFech = d[9] === 'fechado' ? dataId + 5 * 86400000 : null;

    await conn.execute(
      `INSERT INTO desvios (obraId, disciplina, fornecedorId, fornecedorNome, descricao, localizacao, severidade, statusDesvio, dataIdentificacao, prazoSugerido, dataFechamento, createdById, createdByName)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 'Sistema')`,
      [d[0], d[1], d[2], d[3], d[4], d[5], d[6], d[9], dataId, prazo, dataFech]
    );
  }
  console.log(`${allDesvios.length} desvios inserted`);

  // Histórico para cada desvio
  const [desviosRows] = await conn.execute("SELECT id, descricao, statusDesvio as status, createdAt FROM desvios");
  for (const d of desviosRows) {
    await conn.execute(
      `INSERT INTO historico (desvioId, tipo, descricao, userName, userId, createdAt)
       VALUES (?, 'criacao', ?, 'Sistema', 1, ?)`,
      [d.id, `Desvio criado: ${d.descricao.substring(0, 80)}`, d.createdAt]
    );
    if (d.status === 'em_andamento') {
      await conn.execute(
        `INSERT INTO historico (desvioId, tipo, descricao, de, para, userName, userId)
         VALUES (?, 'status', 'Status alterado de "aberto" para "em_andamento"', 'aberto', 'em_andamento', 'Equipe Qualidade', 1)`,
        [d.id]
      );
    }
    if (d.status === 'fechado') {
      await conn.execute(
        `INSERT INTO historico (desvioId, tipo, descricao, de, para, userName, userId)
         VALUES (?, 'status', 'Status alterado de "aberto" para "fechado"', 'aberto', 'fechado', 'Equipe Qualidade', 1)`,
        [d.id]
      );
    }
  }
  console.log("Historico inserted");

  // Planos de ação para alguns desvios
  const [desviosGraves] = await conn.execute("SELECT id, descricao FROM desvios WHERE severidade = 'grave' LIMIT 6");
  const responsaveis = ['Carlos Silva', 'Ana Santos', 'Roberto Costa', 'Pedro Lima', 'Maria Oliveira'];
  for (let i = 0; i < desviosGraves.length; i++) {
    const d = desviosGraves[i];
    const prazo = Date.now() + (7 + i * 3) * 86400000;
    await conn.execute(
      `INSERT INTO planos_acao (desvioId, acao, responsavel, prazo, statusPlano, observacoes)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        d.id,
        `Ação corretiva para: ${d.descricao.substring(0, 60)}`,
        responsaveis[i % responsaveis.length],
        prazo,
        i < 2 ? 'em_andamento' : 'pendente',
        'Acompanhar execução e validar correção em campo',
      ]
    );
  }
  console.log("Planos de ação inserted");

  await conn.end();
  console.log("Seed completed successfully!");
}

main().catch(console.error);
