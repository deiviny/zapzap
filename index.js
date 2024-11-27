const express = require('express');
const venom = require('venom-bot');
const dotenv = require('dotenv');

// Carrega as variáveis de ambiente do arquivo .env
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
const sessions = {};
const sessionsTemp = {};

app.use(express.json());

function verificarServicos(){
    
}

function createSession(sessionName) {
  venom
    .create(
      sessionName,
      (base64Qrimg, asciiQR, attempts, urlCode) => {
        console.log('Number of attempts to read the qrcode: ', attempts);
        console.log('Terminal qrcode: ', asciiQR);
        console.log('base64 image string qrcode: ', base64Qrimg);
        console.log('urlCode (data-ref): ', urlCode);
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
        if (message.body === 'Oi' && message.isGroupMsg === false) {
            client
                .sendText(message.from, 'Olá! Como posso ajudar?')
                .then((result) => {
                    // console.log('Mensagem enviada:', result);
                })
                .catch((error) => {
                    // console.error('Erro ao enviar mensagem:', error);
                });
        }
    });
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

app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);    
});
