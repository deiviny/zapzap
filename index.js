const express = require('express');
const venom = require('venom-bot');
const dotenv = require('dotenv');
const mysql = require('mysql2/promise');
// Carrega as variáveis de ambiente do arquivo .env
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
const sessions = {};
const sessionsTemp = {};
const qrTemp = {};
// Configura a conexão com o banco de dados
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });
  

app.use(express.json());

async function verificarServicos() {
    try {
        listarAtendimentoCadastrar();
        const [rows] = await pool.query('SELECT * FROM whatssapp_servicos WHERE status = ?', ['1']);
        return rows;
    } catch (err) {
        console.error('Erro ao buscar serviços:', err);
        throw err;
    }
}
async function listarAtendimentoCadastrar(){
    // rodar api post https://solus.solussistema.com.br/api/atendimentos/listaratendimentocadastrar
    // bearer token env.BEARER_TOKEN

    const bearerToken = process.env.TOKEN_SOLUS;
    const url = process.env.URL_SOLUS + '/api/atendimentos/listaratendimentocadastrar';
    const axios = require('axios');
    const config = {
        headers: { Authorization: `Bearer ${bearerToken}` }
    };
    try {
        const response = await axios.post(url, {}, config);
    } catch (error) {
        console.error('Erro ao buscar atendimentos:', error);
    }

}
async function createSession(sessionName, id_servico = null) {
  var sessionAtual = sessionName;
  await venom
    .create(
      sessionName,
      (base64Qrimg, asciiQR, attempts, urlCode) => {
        // console.log('Number of attempts to read the qrcode: ', attempts);
        // console.log('Terminal qrcode: ', asciiQR);
        // console.log('base64 image string qrcode: ', base64Qrimg);
        // console.log('urlCode (data-ref): ', urlCode);
        let json_dados = {
          base64Qrimg: base64Qrimg,
          asciiQR: asciiQR,
          attempts: attempts,
          urlCode: urlCode
        }
        // console.log(json_dados);
        qrTemp[sessionAtual] = json_dados;        
      },
      (statusSession, session) => {
        console.log('Status da sessão:', statusSession); // Mostra o status da sessão
        console.log('Sessão:', session); // Mostra a sessão
      },
      {
        multidevice: true, // Habilita o suporte a múltiplos dispositivos
      }
    )
    .then((client) => start(client, sessionName))
    .catch((error) => {
      console.log(error);
    });
}

 

function statusSession(sessionName) {
    const client = sessions[sessionName];
    if (!client) {
        return 'Sessão não encontrada';
    }
    return client.getState();
}

function getQrCode64(sessionName) {
    const client = sessions[sessionName];
    if (!client) {
        return 'Sessão não encontrada';
    }
    return client.getQrCode();
}

function qrCodeTemp(sessionName) {
    const client = qrTemp[sessionName];
    if (!client) {
        return 'Sessão não encontrada';
    }
    return client;
}

function removeSession(sessionName) {
    const client = sessions[sessionName];
    if (client) {
        client.close();
        delete sessions[sessionName];
    }
}

function start(client, sessionName) {
  sessions[sessionName] = client;
  client.onMessage((message) => {
    // if (message.body === 'Oi' && message.isGroupMsg === false) {
    //   client
    //     .sendText(message.from, 'Olá! Como posso ajudar?')
    //     .then((result) => {
    //       console.log('Mensagem enviada:', result);
    //     })
    //     .catch((error) => {
    //       console.error('Erro ao enviar mensagem:', error);
    //     });
    // }
  });
}

async function cadastrarServico(dados) {
    try {
        const [result] = await pool.query('INSERT INTO whatssapp_servicos (id_usuario, id_empresa, servico, payload) VALUES (?, ?, ?, ?)', [dados.id_usuario, dados.id_empresa, dados.servico, JSON.stringify(dados.payload)]);
        return result.insertId;
    } catch (err) {
        console.error('Erro ao cadastrar serviço:', err);
        throw err;
    }
}

async function processarServicos() {
    const servicos = await verificarServicos();
    for (const servico of servicos) {
        let sessionName = "";
        switch (servico.servico) {
            case 'create-session':
                sessionName = servico.payload;
                if(sessionName == null || sessionName == "") {
                    console.error('Nome da sessão não informado');
                    atualizarServico(servico.id, '2'); 
                    break;
                }
                // sessionName é um texto gostaria de passar para json
                sessionName = JSON.parse(sessionName).sessionName;                
                createSession(sessionName);
                atualizarServico(servico.id, '2');          
                let json = {"sessionName": sessionName}
                // json = JSON.stringify(json);
                let newService = {
                    'id_usuario': servico.id_usuario,
                    'id_empresa': servico.id_empresa,
                    'servico': 'qr-code-temp',
                    'payload': json
                };
                // cadastrarServico(newService); 
                
                break;
            case 'qr-code-temp':
                sessionName = servico.payload;
                // sessionName é um texto gostaria de passar para json
                sessionName = JSON.parse(sessionName).sessionName;   
                
                let qrCodeTempJson = qrTemp[sessionName];         
                if (qrTemp[sessionName]) {
                    await salvarQrCodeTemp(servico.id, qrCodeTempJson);
                    await atualizarServico(servico.id, '2');
                }
                break;
            case 'status-session':
                sessionName = servico.payload;
                // sessionName é um texto gostaria de passar para json
                sessionName = JSON.parse(sessionName).sessionName;
                let status = statusSession(sessionName);
                if (status) {
                    await atualizarStatusWhatsapp(servico.id, status);
                    await atualizarServico(servico.id, '2');
                }
                break;
            case "send-message":
                let payload = JSON.parse(servico.payload);
                let session = payload.sessionName;
                let to = payload.to;
                let message = payload.message;
                const client = sessions[session];
                if (!client) {
                    let status = statusSession(sessionName);
                    console.error('Sessão não encontrada:', session);
                    console.error('Status Session:', status);
                    createSession(session)
                    break;
                }
                // verificar parmetro to se é maior ou igual a 10
                if(to.length < 10){
                    console.error('Número de telefone inválido:', to);
                    atualizarServico(servico.id, '2');
                    break;
                }
                client
                    .sendText(to, message)
                    .then((result) => {
                        atualizarStatusWhatsapp(servico.id, result);
                        atualizarServico(servico.id, '2');
                    })
                    .catch((error) => {
                        console.error('Erro ao enviar mensagem:', error);
                        atualizarServico(servico.id, '2');
                    });
                break;
            default:
                console.error('Serviço não encontrado:', servico.servico);
        }
        // Aqui você pode adicionar o código para processar cada serviço
    }
}
async function atualizarStatusWhatsapp(id, response) {
    try {
        await pool.query('UPDATE whatssapp_servicos SET response = ? WHERE id = ?', [response, id]);
    } catch (err) {
        console.error('Erro ao atualizar serviço:', err);
        throw err;
    }
}
async function atualizarServico(id, status) {
    try {
        await pool.query('UPDATE whatssapp_servicos SET status = ? WHERE id = ?', [status, id]);
    } catch (err) {
        console.error('Erro ao atualizar serviço:', err);
        throw err;
    }
}

async function salvarQrCodeTemp(id, response) {
    try {
        base64Qrimg = response.base64Qrimg;
        await pool.query('UPDATE whatssapp_servicos SET response = ? WHERE id = ?', [base64Qrimg, id]);
    } catch (err) {
        console.error('Erro ao salvar QR Code Temp:', err);
        throw err;
    }
}
async function verificarPeriodicamente() {
    await processarServicos();
    setTimeout(verificarPeriodicamente, 5000);
}

app.post('/create-session', (req, res) => {
    const { sessionName } = req.body;
    if (sessions[sessionName]) {
        return res.status(400).send('Sessão já existe');
    }
    createSession(sessionName);
    res.status(200).send('Sessão criada');
});

app.post('/send-message', (req, res) => {
    const { sessionName, to, message } = req.body;
    const client = sessions[sessionName];
    if (!client) {
        return res.status(400).send('Sessão não encontrada');
    }
    client
        .sendText(to, message)
        .then((result) => {
            res.status(200).send('Mensagem enviada');
        })
        .catch((error) => {
            res.status(500).send('Erro ao enviar mensagem');
        });
});

app.get('/qr-code-temp/:sessionName', (req, res) => {
    const { sessionName } = req.params;
    res.status(200).send(sessionsTemp[sessionName]);
});
app.get('/qr-code/:sessionName', (req, res) => {
    const { sessionName } = req.params;
    res.status(200).send(getQrCode64(sessionName));
});

app.get('/sessions', (req, res) => {
    res.status(200).json(Object.keys(sessions));
});

app.get('/status-session/:sessionName', (req, res) => {
    const { sessionName } = req.params;
    res.status(200).send(statusSession(sessionName));
});

app.delete('/remove-session/:sessionName', (req, res) => {
    const { sessionName } = req.params;
    removeSession(sessionName);
    res.status(200).send('Sessão removida');
});

app.get('/qr-temp/:sessionName', (req, res) => {
    const { sessionName } = req.params;
    res.status(200).send(qrCodeTemp(sessionName));
});

app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);   
    verificarPeriodicamente();
});