import express, { Request, Response } from "express";
import Sender from "./sender";

const sender = new Sender();

const app = express();

app.use(express.json())
app.use(express.urlencoded({ extended: false }))

app.get('/newsession',(req: Request, res: Response) => {  
    const { session } = req.body;  
    sender.setNameSession = session    
    
    try {              
        sender.newsession().then((dados) => {
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

app.listen(3333, () => {
    console.log(' Server started')
})