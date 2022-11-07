import express, { Request, Response } from "express";
import Sender from "./sender";

const sender = new Sender();

const app = express();

app.use(express.json())
app.use(express.urlencoded({ extended: false }))

app.get('/newsession',async (req: Request, res: Response) => {  
    const { session } = req.body;  
    sender.setNameSession = session        
    try {                      
        if(sender.qrCode !== undefined){
            return res.send({ 
                qr_code: sender.qrCode,
                connected: sender.isConnected,
                name_session: sender.nameSession
            })
        } else {
            await sender.newsession();             
            return res.send({ 
                qr_code: sender.qrCode,
                connected: sender.isConnected,
                name_session: sender.nameSession
            })
        }
             
        
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: "error", message: error });
    }    
})

app.get('/status', (req: Request, res: Response) => {    
    const { session } = req.body;
    sender.setNameSession = session  
    let status = sender.isConnected ?? 'Disconnected'
    return res.send({ 
        qr_code: sender.qrCode,
        connected: sender.isConnected,
        status: status
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

app.get('/close', (req: Request, res: Response) => {    
    const { session } = req.body;
    sender.setNameSession = session 
    sender.close();
    return res.send({         
        status: "success"
    })
})

app.get('/sessionoff', (req: Request, res: Response) => {   
    try {
        const { session } = req.body;
        sender.setNameSession = session  
        sender.logout()   
        const fs = require('fs');
        fs.rm( './tokens/'+session, { recursive:true }, (err:any) => {
            if(err){
                // File deletion failed
                console.error(err.message);
                return;
            }
            console.log("File deleted successfully");
        })    
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: "error", message: error });
    }
})

app.get("/ativar-sessions", (req: Request, res: Response) => {   
    try {
        const fs = require('fs');

        fs.readdir('./tokens', { withFileTypes: true }, (error:any, files:any) => {
            if (error) throw error;
            const directoriesInDIrectory = files
                .filter((item:any) => item.isDirectory())
                .map((item:any) => item.name);

            console.log(directoriesInDIrectory);
        });
        

    } catch (error) {
        console.error(error);
        res.status(500).json({ status: "error", message: error });
    }
})

app.get('/send-msg-api', async (req: Request, res: Response) => {
    const { number, message, session } = req.body;
    await sender.enviarMsgApiSimpled(session, number, message)
    
    return res.send({ 
        status: sender.status,
        msg: sender.message,
    })
})

app.listen(3333, () => {
    console.log(' Server started')
})