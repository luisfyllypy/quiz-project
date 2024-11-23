const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const http = require('http');
const { Server } = require('socket.io');

// Configurar o aplicativo Express e Socket.IO
const app = express();
const server = http.createServer(app);
const io = new Server(server);
const port = 3000;

// Configurar middleware para lidar com JSON
app.use(bodyParser.json());

// Conectar ao banco de dados SQLite
const db = new sqlite3.Database('./quiz_project.db', (err) => {
  if (err) {
    console.error('Erro ao conectar ao banco de dados:', err.message);
  } else {
    console.log('Conectado ao banco de dados SQLite.');
  }
});

// Eventos do Socket.IO
io.on('connection', (socket) => {
  console.log('Cliente conectado:', socket.id);

  // Entrar em uma sala
  socket.on('joinRoom', (roomCode) => {
    socket.join(roomCode);
    console.log(`Cliente ${socket.id} entrou na sala ${roomCode}`);
  });

  // Avançar para a próxima pergunta
  socket.on('nextQuestion', (data) => {
    const { roomCode, question } = data;
    io.to(roomCode).emit('updateQuestion', question);
    console.log(`Nova pergunta enviada para a sala ${roomCode}`);
  });

  // Enviar resposta
  socket.on('submitAnswer', (data) => {
    const { roomCode, participantId, answer } = data;
    io.to(roomCode).emit('answerReceived', { participantId, answer });
    console.log(`Resposta recebida de ${participantId} na sala ${roomCode}`);
  });

  // Finalizar o jogo
  socket.on('endGame', (roomCode) => {
    io.to(roomCode).emit('gameEnded');
    console.log(`Sala ${roomCode} foi encerrada.`);
  });

  socket.on('disconnect', () => {
    console.log('Cliente desconectado:', socket.id);
  });
});

// Rota básica de teste
/*
app.get('/', (req, res) => {
  res.send('Servidor está funcionando!');
});
*/

// Iniciar o servidor
server.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});

app.use(express.static('public'));

// Rota para cadastro de usuário
app.post('/api/register', (req, res) => {
  const { nome, email, senha } = req.body;

  if (!nome || !email || !senha) {
    return res.status(400).json({ error: 'Todos os campos são obrigatórios.' });
  }

  const query = `INSERT INTO usuarios (nome, email, senha) VALUES (?, ?, ?)`;
  db.run(query, [nome, email, senha], function (err) {
    if (err) {
      console.error(err.message);
      res.status(500).json({ error: 'Erro ao cadastrar usuário.' });
    } else {
      res.status(201).json({ message: 'Usuário cadastrado com sucesso!', id: this.lastID });
    }
  });
});

// Rota para login de usuário
app.post('/api/login', (req, res) => {
  const { email, senha } = req.body;

  if (!email || !senha) {
    return res.status(400).json({ error: 'Email e senha são obrigatórios.' });
  }

  const query = `SELECT * FROM usuarios WHERE email = ? AND senha = ?`;
  db.get(query, [email, senha], (err, row) => {
    if (err) {
      console.error(err.message);
      res.status(500).json({ error: 'Erro ao realizar login.' });
    } else if (!row) {
      res.status(401).json({ error: 'Credenciais inválidas.' });
    } else {
      res.status(200).json({ message: 'Login bem-sucedido!', usuario: row });
    }
  });
});

// Rota para criar um grupo de perguntas
app.post('/api/groups', (req, res) => {
  const { id_usuario, titulo, descricao, ordem_fixa } = req.body;

  if (!id_usuario || !titulo) {
    return res.status(400).json({ error: 'ID do usuário e título são obrigatórios.' });
  }

  const query = `INSERT INTO grupos_perguntas (id_usuario, titulo, descricao, ordem_fixa) VALUES (?, ?, ?, ?)`;
  db.run(query, [id_usuario, titulo, descricao, ordem_fixa || false], function (err) {
    if (err) {
      console.error(err.message);
      res.status(500).json({ error: 'Erro ao criar grupo de perguntas.' });
    } else {
      res.status(201).json({ message: 'Grupo de perguntas criado com sucesso!', id: this.lastID });
    }
  });
});

// Rota para listar grupos de perguntas de um usuário
app.get('/api/groups/:id_usuario', (req, res) => {
  const { id_usuario } = req.params;

  const query = `SELECT * FROM grupos_perguntas WHERE id_usuario = ?`;
  db.all(query, [id_usuario], (err, rows) => {
    if (err) {
      console.error(err.message);
      res.status(500).json({ error: 'Erro ao listar grupos de perguntas.' });
    } else {
      res.status(200).json(rows);
    }
  });
});

// Rota para excluir grupos de perguntas de um usuário
app.delete('/api/groups/:id_grupo', (req, res) => {
  const { id_grupo } = req.params;

  const query = `DELETE FROM grupos_perguntas WHERE id_grupo = ?`;
  db.run(query, [id_grupo], function (err) {
    if (err) {
      console.error(err.message);
      res.status(500).json({ error: 'Erro ao excluir grupo.' });
    } else {
      res.status(200).json({ message: 'Grupo excluído com sucesso!' });
    }
  });
});

// Rota para buscar um grupo de perguntas de um usuário
app.get('/api/groups/single/:id_grupo', (req, res) => {
  const { id_grupo } = req.params;

  const query = `SELECT * FROM grupos_perguntas WHERE id_grupo = ?`;
  db.get(query, [id_grupo], (err, row) => {
    if (err) {
      console.error(err.message);
      res.status(500).json({ error: 'Erro ao buscar grupo.' });
    } else if (!row) {
      res.status(404).json({ error: 'Grupo não encontrado.' });
    } else {
      res.status(200).json(row);
    }
  });
});

// Rota para atualizar um grupo de perguntas de um usuário
app.put('/api/groups/:id_grupo', (req, res) => {
  const { id_grupo } = req.params;
  const { titulo, descricao, ordem_fixa } = req.body;

  const query = `
    UPDATE grupos_perguntas
    SET titulo = ?, descricao = ?, ordem_fixa = ?
    WHERE id_grupo = ?
  `;
  db.run(query, [titulo, descricao, ordem_fixa, id_grupo], function (err) {
    if (err) {
      console.error(err.message);
      res.status(500).json({ error: 'Erro ao atualizar grupo.' });
    } else {
      res.status(200).json({ message: 'Grupo atualizado com sucesso!' });
    }
  });
});


// Rota para adicionar uma pergunta a um grupo
app.post('/api/questions', (req, res) => {
  const { id_grupo, texto_pergunta, alternativa_a, alternativa_b, alternativa_c, alternativa_d, alternativa_correta, ordem, tempo_resposta } = req.body;

  if (!id_grupo || !texto_pergunta || !alternativa_a || !alternativa_b || !alternativa_c || !alternativa_d || !alternativa_correta) {
    return res.status(400).json({ error: 'Todos os campos obrigatórios devem ser preenchidos.' });
  }

  const query = `
    INSERT INTO perguntas (id_grupo, texto_pergunta, alternativa_a, alternativa_b, alternativa_c, alternativa_d, alternativa_correta, ordem, tempo_resposta)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  db.run(query, [id_grupo, texto_pergunta, alternativa_a, alternativa_b, alternativa_c, alternativa_d, alternativa_correta, ordem || 0, tempo_resposta || 60], function (err) {
    if (err) {
      console.error(err.message);
      res.status(500).json({ error: 'Erro ao adicionar pergunta.' });
    } else {
      res.status(201).json({ message: 'Pergunta adicionada com sucesso!', id: this.lastID });
    }
  });
});

// Rota para listar perguntas de um grupo
app.get('/api/questions/group/:id_grupo', (req, res) => {
  const { id_grupo } = req.params;

  const query = `SELECT * FROM perguntas WHERE id_grupo = ? ORDER BY ordem ASC`;
  db.all(query, [id_grupo], (err, rows) => {
    if (err) {
      console.error(err.message);
      res.status(500).json({ error: 'Erro ao listar perguntas.' });
    } else {
      res.status(200).json(rows);
    }
  });
});

// Rota para buscar uma pergunta
app.get('/api/questions/single/:id_pergunta', (req, res) => {
  const { id_pergunta } = req.params;
  
  console.log('Buscando pergunta com ID:', id_pergunta); // Verifica o ID recebido pelo servidor

  const query = `SELECT * FROM perguntas WHERE id_pergunta = ?`;
  db.get(query, [id_pergunta], (err, row) => {
    if (err) {
      console.error(err.message);
      res.status(500).json({ error: 'Erro ao buscar pergunta.' });
    } else if (!row) {
      res.status(404).json({ error: 'Pergunta não encontrada.' });
    } else {
      res.status(200).json(row);
    }
  });
});


// Rota para editar uma pergunta
app.put('/api/questions/:id_pergunta', (req, res) => {
  const { id_pergunta } = req.params;
  const { texto_pergunta, alternativa_a, alternativa_b, alternativa_c, alternativa_d, alternativa_correta, ordem, tempo_resposta } = req.body;

  const query = `
    UPDATE perguntas
    SET texto_pergunta = ?, alternativa_a = ?, alternativa_b = ?, alternativa_c = ?, alternativa_d = ?, alternativa_correta = ?, ordem = ?, tempo_resposta = ?
    WHERE id_pergunta = ?
  `;
  db.run(query, [texto_pergunta, alternativa_a, alternativa_b, alternativa_c, alternativa_d, alternativa_correta, ordem, tempo_resposta, id_pergunta], function (err) {
    if (err) {
      console.error(err.message);
      res.status(500).json({ error: 'Erro ao editar pergunta.' });
    } else {
      res.status(200).json({ message: 'Pergunta editada com sucesso!' });
    }
  });
});

// Rota para excluir uma pergunta
app.delete('/api/questions/:id_pergunta', (req, res) => {
  const { id_pergunta } = req.params;

  const query = `DELETE FROM perguntas WHERE id_pergunta = ?`;
  db.run(query, [id_pergunta], function (err) {
    if (err) {
      console.error(err.message);
      res.status(500).json({ error: 'Erro ao excluir pergunta.' });
    } else {
      res.status(200).json({ message: 'Pergunta excluída com sucesso!' });
    }
  });
});

// Rota para criar uma sala
app.post('/api/rooms', (req, res) => {
  const { id_usuario, id_grupo } = req.body;

  if (!id_usuario || !id_grupo) {
    return res.status(400).json({ error: 'ID do usuário e ID do grupo de perguntas são obrigatórios.' });
  }

  const codigo_sala = Math.random().toString(36).substr(2, 8).toUpperCase(); // Gera um código alfanumérico único

  const query = `
    INSERT INTO salas (id_usuario, codigo_sala, id_grupo)
    VALUES (?, ?, ?)
  `;
  db.run(query, [id_usuario, codigo_sala, id_grupo], function (err) {
    if (err) {
      console.error(err.message);
      res.status(500).json({ error: 'Erro ao criar sala.' });
    } else {
      res.status(201).json({ message: 'Sala criada com sucesso!', codigo_sala: codigo_sala, id: this.lastID });
    }
  });
});

// Rota para listar salas criadas por um usuário
app.get('/api/rooms/:id_usuario', (req, res) => {
  const { id_usuario } = req.params;

  const query = `SELECT * FROM salas WHERE id_usuario = ? AND status = 'ativa'`;
  db.all(query, [id_usuario], (err, rows) => {
    if (err) {
      console.error(err.message);
      res.status(500).json({ error: 'Erro ao listar salas.' });
    } else {
      res.status(200).json(rows);
    }
  });
});

// Rota para entrar em uma sala
app.post('/api/rooms/join', (req, res) => {
  const { codigo_sala, nome } = req.body;

  if (!codigo_sala || !nome) {
    return res.status(400).json({ error: 'Código da sala e nome são obrigatórios.' });
  }

  const query = `SELECT id_sala FROM salas WHERE codigo_sala = ? AND status = 'ativa'`;
  db.get(query, [codigo_sala], (err, row) => {
    if (err) {
      console.error(err.message);
      res.status(500).json({ error: 'Erro ao verificar a sala.' });
    } else if (!row) {
      res.status(404).json({ error: 'Sala não encontrada ou já finalizada.' });
    } else {
      const id_sala = row.id_sala;
      const insertQuery = `
        INSERT INTO participantes (id_sala, nome)
        VALUES (?, ?)
      `;
      db.run(insertQuery, [id_sala, nome], function (err) {
        if (err) {
          console.error(err.message);
          res.status(500).json({ error: 'Erro ao entrar na sala.' });
        } else {
          res.status(200).json({ message: 'Participante entrou na sala com sucesso!', id_sala: id_sala });
        }
      });
    }
  });
});

// Rota para finalizar uma sala
app.put('/api/rooms/:id_sala/finalize', (req, res) => {
  const { id_sala } = req.params;

  const query = `UPDATE salas SET status = 'finalizada' WHERE id_sala = ?`;
  db.run(query, [id_sala], function (err) {
    if (err) {
      console.error(err.message);
      res.status(500).json({ error: 'Erro ao finalizar a sala.' });
    } else {
      res.status(200).json({ message: 'Sala finalizada com sucesso!' });
    }
  });
});

// Rota para buscar participantes
app.get('/api/rooms/:id_sala/participants', (req, res) => {
  const { id_sala } = req.params;

  const query = `
    SELECT nome
    FROM participantes
    WHERE id_sala = ?
  `;
  db.all(query, [id_sala], (err, rows) => {
    if (err) {
      console.error(err.message);
      res.status(500).json({ error: 'Erro ao listar participantes.' });
    } else {
      res.status(200).json(rows);
    }
  });
});

// Rota para buscar perguntas de uma sala específica 
app.get('/api/rooms/:id_sala/quiz', (req, res) => {
  const { id_sala } = req.params;

  console.log('Carregando quiz para a sala com ID:', id_sala);

  const query = `
    SELECT salas.nome_sala AS name, perguntas.*
    FROM salas
    JOIN grupos_perguntas ON salas.id_grupo = grupos_perguntas.id_grupo
    JOIN perguntas ON grupos_perguntas.id_grupo = perguntas.id_grupo
    WHERE salas.id_sala = ?
    ORDER BY perguntas.ordem ASC
  `;

  db.all(query, [id_sala], (err, rows) => {
    if (err) {
      console.error(err.message);
      res.status(500).json({ error: 'Erro ao carregar o quiz.' });
    } else if (rows.length === 0) {
      res.status(404).json({ error: 'Nenhum quiz encontrado para esta sala.' });
    } else {
      res.status(200).json({ name: rows[0].name, questions: rows });
    }
  });
});

app.get('/api/rooms/:id_sala/status', (req, res) => {
  const { id_sala } = req.params;

  const query = `SELECT status FROM salas WHERE id_sala = ?`;
  db.get(query, [id_sala], (err, row) => {
    if (err) {
      console.error(err.message);
      res.status(500).json({ error: 'Erro ao verificar status do jogo.' });
    } else {
      res.status(200).json(row);
    }
  });
});

app.put('/api/rooms/:id_sala/start', (req, res) => {
  const { id_sala } = req.params;

  const query = `UPDATE salas SET status = 'started' WHERE id_sala = ?`;
  db.run(query, [id_sala], function (err) {
    if (err) {
      console.error(err.message);
      res.status(500).json({ error: 'Erro ao iniciar o jogo.' });
    } else {
      res.status(200).json({ message: 'Jogo iniciado com sucesso!' });
    }
  });
});

app.put('/api/rooms/:id_sala/start', (req, res) => {
  const { id_sala } = req.params;

  const query = `UPDATE salas SET status = 'started' WHERE id_sala = ?`;

  db.run(query, [id_sala], function (err) {
    if (err) {
      console.error(err.message);
      res.status(500).json({ error: 'Erro ao iniciar o jogo.' });
    } else {
      res.status(200).json({ message: 'Jogo iniciado com sucesso.' });
    }
  });
});

app.post('/api/rooms/:id_sala/answer', (req, res) => {
  const { id_sala } = req.params;
  const { questionIndex, answer } = req.body;

  // Aqui você pode salvar a resposta no banco de dados ou atualizar a lógica
  res.status(200).json({ message: 'Resposta registrada com sucesso.' });
});
