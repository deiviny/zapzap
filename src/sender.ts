import parsePhoneNumber, { isValidPhoneNumber } from "libphonenumber-js";
import { create, Whatsapp, Message, SocketState } from "venom-bot"

export type QRCode = {
    base64Qr: string
    attempt: number
}

export type QRCodeSession = {
    [index: string]: QRCode
}



export type ClientSession = {
    [index: string]: Whatsapp
}

export type ConnectedType = {
    [key: string]: boolean
}

class Sender {
    private client: ClientSession = {};
    private connectedSession: ConnectedType = {};
    private qrSession: QRCodeSession = {};
    private connected: boolean = false;
    private qr: QRCode;
    private sessions: Object;
    nameSession: string = "first-session";
    
    get isConnected(): boolean {
        return this.connectedSession[this.nameSession];
    }

    set setNameSession(session: string) {
        this.nameSession = session;
    }

    get getNameSession(): string {
        return this.nameSession
    }

    get qrCode(): QRCode {
        return this.qrSession[this.nameSession];
    }

    get sessionQr(): Object {
        return this.sessions
    }

    constructor() {
        this.initialize()
    }

    async sendText(to: string, body: string, sessao: string) {        
        if (!isValidPhoneNumber(to, "BR")) {
            throw new Error("Thisnumber is not valid")
        }

        let phoneNumber = parsePhoneNumber(to, "BR")?.format("E.164").replace("+", "") as string

        phoneNumber = phoneNumber.includes("@c.us")
            ? phoneNumber
            : `${phoneNumber}@c.us`       
             
        await this.client[sessao].sendText(phoneNumber, body)
    }

    private async initialize() {
        const fs = require('fs');

        fs.readdir('./tokens', { withFileTypes: true }, (error:any, files:any) => {
            if (error) throw error;
            const directoriesInDIrectory = files
                .filter((item:any) => item.isDirectory())
                .map((item:any) => item.name);            
            const qtdSession = directoriesInDIrectory.length            
            for(let i = 0; i < qtdSession; i++){
                let nameTemp: string = directoriesInDIrectory[i]
                this.nameSession = nameTemp
                this.newsession()
            }
        });
    }

    async newsession() {

        const status = (statusSession: string) => {
            this.connectedSession[this.nameSession] = ["isLogged", "qrReadSuccess", "chatsAvailable"].includes(
                statusSession
            )
        }
        const start = (client: Whatsapp) => {
            this.client[this.nameSession] = client;
            this.client[this.nameSession].onStateChange((state) => {
                this.connectedSession[this.nameSession] = state === SocketState.CONNECTED
            })
            this.client[this.nameSession].onAnyMessage(message => {
                console.log("Nova msg na sessao: "+this.nameSession)  
            })
        }
        
        await create(
            this.nameSession,
            (base64Qr: string, asciiQr: string, attempt: number) => {
                this.qrSession[this.nameSession] = { base64Qr, attempt }                
            }
        )
            .then((client) => start(client))
            .catch((error) => console.error(error));
    }

    async listChats(){
        return await this.client[this.nameSession].getAllChats();
    }

    async newMsg(){
        return await this.client[this.nameSession].getChatContactNewMsg();
    }

    async getMsg(contact: string, uncludeMe: boolean = true){
        if (!isValidPhoneNumber(contact, "BR")) {
            throw new Error("Thisnumber is not valid")
        }

        let phoneNumber = parsePhoneNumber(contact, "BR")?.format("E.164").replace("+", "") as string

        phoneNumber = phoneNumber.includes("@c.us")
            ? phoneNumber
            : `${phoneNumber}@c.us` 

        return await this.client[this.nameSession].loadAndGetAllMessagesInChat(phoneNumber);
    }

    logout() {
        this.client[this.nameSession].close()
    }
}

export default Sender;