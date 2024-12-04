const sqlite3 = require('sqlite3').verbose();

// Conectar ao banco de dados
const db = new sqlite3.Database('./quiz_project.db', (err) => {
  if (err) {
    console.error('Erro ao conectar ao banco de dados:', err.message);
  } else {
    console.log('Conectado ao banco de dados SQLite.');
  }
});

// Função para inserir dados de teste
const insertTestData = async () => {
  try {
    // Inserir usuário de teste
    const userId = await new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO usuarios (nome, email, senha) VALUES ('Teste', 'teste@email.com', '123456')`,
        function (err) {
          if (err) reject(err);
          else resolve(this.lastID);
        }
      );
    });
    console.log('Usuário de teste inserido com sucesso! ID:', userId);

    // Inserir grupos de perguntas
    const groups = [
      { titulo: 'Conhecimento Gerais 10', descricao: '10 perguntas de conhecimento gerais.' },
      { titulo: 'Conhecimento Gerais 20', descricao: '20 perguntas de conhecimento gerais.' }
    ];

    for (const [index, group] of groups.entries()) {
      const groupId = await new Promise((resolve, reject) => {
        db.run(
          `INSERT INTO grupos_perguntas (id_usuario, titulo, descricao, ordem_fixa) VALUES (?, ?, ?, 1)`,
          [userId, group.titulo, group.descricao],
          function (err) {
            if (err) reject(err);
            else resolve(this.lastID);
          }
        );
      });
      console.log(`Grupo "${group.titulo}" inserido com sucesso! ID:`, groupId);

      // Inserir perguntas
      const questions = index === 0 ? [
        {
            texto_pergunta: 'Qual é o maior país do mundo em extensão territorial?',
            alternativa_a: 'Brasil',
            alternativa_b: 'Estados Unidos',
            alternativa_c: 'Rússia',
            alternativa_d: 'China',
            alternativa_correta: 'C'
          },
          {
            texto_pergunta: 'Qual é o elemento químico representado pelo símbolo "O"?',
            alternativa_a: 'Ouro',
            alternativa_b: 'Oxigênio',
            alternativa_c: 'Ozônio',
            alternativa_d: 'Osmium',
            alternativa_correta: 'B'
          },
          {
            texto_pergunta: 'Quem foi o autor de "Dom Quixote"?',
            alternativa_a: 'William Shakespeare',
            alternativa_b: 'Miguel de Cervantes',
            alternativa_c: 'Machado de Assis',
            alternativa_d: 'Dante Alighieri',
            alternativa_correta: 'B'
          },
          {
            texto_pergunta: 'Em que ano ocorreu a independência do Brasil?',
            alternativa_a: '1808',
            alternativa_b: '1822',
            alternativa_c: '1889',
            alternativa_d: '1945',
            alternativa_correta: 'B'
          },
          {
            texto_pergunta: 'Qual é a capital do Canadá?',
            alternativa_a: 'Toronto',
            alternativa_b: 'Vancouver',
            alternativa_c: 'Ottawa',
            alternativa_d: 'Montreal',
            alternativa_correta: 'C'
          },
          {
            texto_pergunta: 'Quantos continentes existem no planeta Terra?',
            alternativa_a: '5',
            alternativa_b: '6',
            alternativa_c: '7',
            alternativa_d: '8',
            alternativa_correta: 'C'
          },
          {
            texto_pergunta: 'Qual é o idioma mais falado no mundo?',
            alternativa_a: 'Inglês',
            alternativa_b: 'Mandarim',
            alternativa_c: 'Espanhol',
            alternativa_d: 'Hindi',
            alternativa_correta: 'B'
          },
          {
            texto_pergunta: 'Qual foi o primeiro homem a pisar na Lua?',
            alternativa_a: 'Yuri Gagarin',
            alternativa_b: 'Buzz Aldrin',
            alternativa_c: 'Neil Armstrong',
            alternativa_d: 'John Glenn',
            alternativa_correta: 'C'
          },
          {
            texto_pergunta: 'Quem pintou a obra "Mona Lisa"?',
            alternativa_a: 'Michelangelo',
            alternativa_b: 'Leonardo da Vinci',
            alternativa_c: 'Rafael',
            alternativa_d: 'Vincent van Gogh',
            alternativa_correta: 'B'
          },
          {
            texto_pergunta: 'Qual é o maior oceano do mundo?',
            alternativa_a: 'Atlântico',
            alternativa_b: 'Índico',
            alternativa_c: 'Ártico',
            alternativa_d: 'Pacífico',
            alternativa_correta: 'D'
          },        
      ] : [
        // Perguntas do Grupo 2
            {
                texto_pergunta: 'Qual é o planeta mais próximo do Sol?',
                alternativa_a: 'Terra',
                alternativa_b: 'Vênus',
                alternativa_c: 'Mercúrio',
                alternativa_d: 'Marte',
                alternativa_correta: 'C'
            },
            {
                texto_pergunta: 'Em que continente fica o Egito?',
                alternativa_a: 'Ásia',
                alternativa_b: 'África',
                alternativa_c: 'Europa',
                alternativa_d: 'América',
                alternativa_correta: 'B'
            },
            {
                texto_pergunta: 'Qual foi a invenção de Johannes Gutenberg?',
                alternativa_a: 'Telefone',
                alternativa_b: 'Imprensa',
                alternativa_c: 'Relógio',
                alternativa_d: 'Rádio',
                alternativa_correta: 'B'
            },
            {
                texto_pergunta: 'Quantos lados tem um hexágono?',
                alternativa_a: '5',
                alternativa_b: '6',
                alternativa_c: '7',
                alternativa_d: '8',
                alternativa_correta: 'B'
            },
            {
                texto_pergunta: 'Quem foi o descobridor do Brasil?',
                alternativa_a: 'Cristóvão Colombo',
                alternativa_b: 'Vasco da Gama',
                alternativa_c: 'Pedro Álvares Cabral',
                alternativa_d: 'Fernão de Magalhães',
                alternativa_correta: 'C'
            },
            {
                texto_pergunta: 'Qual é o maior órgão do corpo humano?',
                alternativa_a: 'Fígado',
                alternativa_b: 'Pele',
                alternativa_c: 'Pulmão',
                alternativa_d: 'Coração',
                alternativa_correta: 'B'
            },
            {
                texto_pergunta: 'Em que país se originou o balé?',
                alternativa_a: 'Itália',
                alternativa_b: 'França',
                alternativa_c: 'Rússia',
                alternativa_d: 'Espanha',
                alternativa_correta: 'A'
            },
            {
                texto_pergunta: 'Qual é o animal mais rápido do mundo?',
                alternativa_a: 'Guepardo',
                alternativa_b: 'Falcão-peregrino',
                alternativa_c: 'Cavalo',
                alternativa_d: 'Leopardo',
                alternativa_correta: 'B'
            },
            {
                texto_pergunta: 'Quantos estados existem no Brasil?',
                alternativa_a: '24',
                alternativa_b: '25',
                alternativa_c: '26',
                alternativa_d: '27',
                alternativa_correta: 'C'
            },
            {
                texto_pergunta: 'Qual é o menor país do mundo?',
                alternativa_a: 'Vaticano',
                alternativa_b: 'Mônaco',
                alternativa_c: 'Nauru',
                alternativa_d: 'Malta',
                alternativa_correta: 'A'
            },
            {
                texto_pergunta: 'Qual é a fórmula química da água?',
                alternativa_a: 'CO₂',
                alternativa_b: 'O₂',
                alternativa_c: 'H₂O',
                alternativa_d: 'CH₄',
                alternativa_correta: 'C'
            },
            {
                texto_pergunta: 'Qual é o maior deserto do mundo?',
                alternativa_a: 'Deserto do Saara',
                alternativa_b: 'Deserto de Gobi',
                alternativa_c: 'Deserto da Antártida',
                alternativa_d: 'Deserto da Arábia',
                alternativa_correta: 'C'
            },
            {
                texto_pergunta: 'Em que ano começou a Segunda Guerra Mundial?',
                alternativa_a: '1935',
                alternativa_b: '1939',
                alternativa_c: '1941',
                alternativa_d: '1945',
                alternativa_correta: 'B'
            },
            {
                texto_pergunta: 'Quem escreveu "Romeu e Julieta"?',
                alternativa_a: 'Charles Dickens',
                alternativa_b: 'William Shakespeare',
                alternativa_c: 'Victor Hugo',
                alternativa_d: 'Oscar Wilde',
                alternativa_correta: 'B'
            },
            {
                texto_pergunta: 'Qual é o maior rio do mundo em volume de água?',
                alternativa_a: 'Nilo',
                alternativa_b: 'Amazonas',
                alternativa_c: 'Yangtzé',
                alternativa_d: 'Mississipi',
                alternativa_correta: 'B'
            },
            {
                texto_pergunta: 'Quem pintou o teto da Capela Sistina?',
                alternativa_a: 'Leonardo da Vinci',
                alternativa_b: 'Michelangelo',
                alternativa_c: 'Rafael',
                alternativa_d: 'Donatello',
                alternativa_correta: 'B'
            },
            {
                texto_pergunta: 'Qual é a moeda oficial do Japão?',
                alternativa_a: 'Yuan',
                alternativa_b: 'Won',
                alternativa_c: 'Iene',
                alternativa_d: 'Baht',
                alternativa_correta: 'C'
            },
            {
                texto_pergunta: 'Quem é conhecido como o "Pai da Matemática"?',
                alternativa_a: 'Pitágoras',
                alternativa_b: 'Arquimedes',
                alternativa_c: 'Euclides',
                alternativa_d: 'Tales de Mileto',
                alternativa_correta: 'A'
            },
            {
                texto_pergunta: 'Qual é o símbolo químico do ouro?',
                alternativa_a: 'Au',
                alternativa_b: 'Ag',
                alternativa_c: 'Fe',
                alternativa_d: 'Hg',
                alternativa_correta: 'A'
            },
            {
                texto_pergunta: 'Quem foi o primeiro presidente dos Estados Unidos?',
                alternativa_a: 'Abraham Lincoln',
                alternativa_b: 'George Washington',
                alternativa_c: 'Thomas Jefferson',
                alternativa_d: 'John Adams',
                alternativa_correta: 'B'
            }
        ];

      for (const [index, question] of questions.entries()) {
        await new Promise((resolve, reject) => {
          db.run(
            `INSERT INTO perguntas (id_grupo, texto_pergunta, alternativa_a, alternativa_b, alternativa_c, alternativa_d, alternativa_correta, ordem)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              groupId,
              question.texto_pergunta,
              question.alternativa_a,
              question.alternativa_b,
              question.alternativa_c,
              question.alternativa_d,
              question.alternativa_correta,
              index + 1
            ],
            function (err) {
              if (err) reject(err);
              else resolve();
            }
          );
        });
        console.log('Pergunta inserida com sucesso!');
      }
    }

    console.log('Dados de teste inseridos com sucesso!');
  } catch (error) {
    console.error('Erro ao inserir dados de teste:', error.message);
  } finally {
    // Fechar a conexão com o banco de dados
    db.close((err) => {
      if (err) {
        console.error('Erro ao fechar a conexão:', err.message);
      } else {
        console.log('Conexão com o banco de dados fechada.');
      }
    });
  }
};

// Executar a inserção de dados de teste
insertTestData();
