const sqlite3 = require('sqlite3').verbose();

// Conectar ao banco de dados (arquivo local chamado quiz_project.db)
const db = new sqlite3.Database('./quiz_project.db', (err) => {
  if (err) {
    console.error('Erro ao conectar ao banco de dados:', err.message);
  } else {
    console.log('Conectado ao banco de dados SQLite.');
  }
});

// Criar ou alterar as tabelas
const createOrUpdateTables = () => {
  db.serialize(() => {
    db.run(`
      CREATE TABLE IF NOT EXISTS usuarios (
        id_usuario INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        senha TEXT NOT NULL,
        data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS grupos_perguntas (
        id_grupo INTEGER PRIMARY KEY AUTOINCREMENT,
        id_usuario INTEGER,
        titulo TEXT NOT NULL,
        descricao TEXT,
        ordem_fixa BOOLEAN DEFAULT FALSE,
        data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario)
      );
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS perguntas (
        id_pergunta INTEGER PRIMARY KEY AUTOINCREMENT,
        id_grupo INTEGER,
        texto_pergunta TEXT NOT NULL,
        alternativa_a TEXT NOT NULL,
        alternativa_b TEXT NOT NULL,
        alternativa_c TEXT NOT NULL,
        alternativa_d TEXT NOT NULL,
        alternativa_correta CHAR(1) NOT NULL,
        ordem INTEGER DEFAULT 0,
        tempo_resposta INTEGER DEFAULT 60,
        FOREIGN KEY (id_grupo) REFERENCES grupos_perguntas(id_grupo)
      );
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS salas (
        id_sala INTEGER PRIMARY KEY AUTOINCREMENT,
        id_usuario INTEGER,
        codigo_sala TEXT UNIQUE NOT NULL,
        id_grupo INTEGER,
        nome_sala TEXT, -- Adicionada a coluna "nome_sala"
        status TEXT DEFAULT 'ativa',
        current_question INTEGER DEFAULT 0, -- Adicionada a coluna "current_question"
        data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario),
        FOREIGN KEY (id_grupo) REFERENCES grupos_perguntas(id_grupo)
      );
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS participantes (
        id_participante INTEGER PRIMARY KEY AUTOINCREMENT,
        id_sala INTEGER,
        nome TEXT NOT NULL,
        pontuacao INTEGER DEFAULT 0,
        tempo_total_respostas INTEGER DEFAULT 0,
        FOREIGN KEY (id_sala) REFERENCES salas(id_sala)
      );
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS respostas (
        id_resposta INTEGER PRIMARY KEY AUTOINCREMENT,
        id_sala INTEGER,
        id_participante INTEGER,
        id_pergunta INTEGER,
        resposta CHAR(1),
        correta BOOLEAN,
        tempo_resposta INTEGER,
        pontos INTEGER DEFAULT 0, -- Adicionada a coluna "pontos"
        FOREIGN KEY (id_sala) REFERENCES salas(id_sala),
        FOREIGN KEY (id_participante) REFERENCES participantes(id_participante),
        FOREIGN KEY (id_pergunta) REFERENCES perguntas(id_pergunta)
      );
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS ranking (
        id_ranking INTEGER PRIMARY KEY AUTOINCREMENT,
        id_sala INTEGER,
        id_participante INTEGER,
        pontuacao_final INTEGER,
        posicao INTEGER,
        FOREIGN KEY (id_sala) REFERENCES salas(id_sala),
        FOREIGN KEY (id_participante) REFERENCES participantes(id_participante)
      );
    `);

    // Adicionar colunas caso não existam
    const alterTableQueries = [
      `ALTER TABLE salas ADD COLUMN nome_sala TEXT`,
      `ALTER TABLE salas ADD COLUMN current_question INTEGER DEFAULT 0`,
      `ALTER TABLE respostas ADD COLUMN pontos INTEGER DEFAULT 0`
    ];

    alterTableQueries.forEach((query) => {
      db.run(query, (err) => {
        if (err) {
          if (err.message.includes('duplicate column name')) {
            console.log(`A coluna já existe: ${query}`);
          } else {
            console.error(`Erro ao executar query: ${query}`, err.message);
          }
        } else {
          console.log(`Query executada com sucesso: ${query}`);
        }
      });
    });

    console.log('Tabelas criadas ou atualizadas com sucesso!');
  });
};

// Executar a criação ou atualização das tabelas
createOrUpdateTables();

// Fechar a conexão com o banco de dados
db.close((err) => {
  if (err) {
    console.error('Erro ao fechar a conexão:', err.message);
  } else {
    console.log('Conexão com o banco de dados fechada.');
  }
});