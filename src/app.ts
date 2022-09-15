import express, { Request, Response } from "express";
import Sender from "./sender";

const sender = new Sender();

const app = express();

app.use(express.json())
app.use(express.urlencoded({ extended: false }))

app.get('/newsession', async (req: Request, res: Response) => {  
    const { session } = req.body;  
    sender.setNameSession = session    
    
    try {              
        await sender.newsession().then((dados) => {
            return res.send({ 
                qr_code: sender.qrCode,
                connected: sender.isConnected,
                name_session: sender.nameSession
            })
        });        
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: "error", message: error });
    }    
})

app.get('/status', (req: Request, res: Response) => {    
    const { session } = req.body;
    sender.setNameSession = session  
    return res.send({ 
        qr_code: sender.qrCode,
        connected: sender.isConnected
    })
})

app.get('/send', async (req: Request, res: Response) => {
    const { number, message, session } = req.body;
    try {
        await sender.sendText(number, message, session);
        return res.status(200).json({ status: "success", message: "Mensagem enviada com sucesso" })
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: "error", message: error });
    }
})

app.get('/listchats', async (req: Request, res: Response) => {
    const { session } = req.body;
    try {
        sender.setNameSession = session  
        await sender.listChats().then((dados) => {
            return res.status(200).json({ status: "success", list: dados })
        });
        
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: "error", message: error });
    }
})

app.get('/newmsg', async (req: Request, res: Response) => {
    const { session } = req.body;
    try {
        sender.setNameSession = session  
        await sender.newMsg().then((dados) => {
            return res.status(200).json({ status: "success", list: dados })
        });
        
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: "error", message: error });
    }
})

app.get('/getmsg', async (req: Request, res: Response) => {
    const { session, contact } = req.body;
    try {
        sender.setNameSession = session  
        await sender.getMsg(contact).then((dados) => {
            return res.status(200).json({ status: "success", list: dados })
        });
        
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: "error", message: error });
    }
})

app.get('/delete-session', (req: Request, res: Response) => {    
    const { session } = req.body;
    const files = './tokens/' + session + '.data.json';
    return res.send({ 
        qr_code: sender.qrCode,
        connected: sender.isConnected
    })
})

app.get('/sessionoff', (req: Request, res: Response) => {    
    const { session } = req.body;
    sender.setNameSession = session  
    sender.logout()
})

app.listen(3333, () => {
    console.log(' Server started')
})