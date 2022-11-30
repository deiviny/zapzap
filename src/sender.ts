import parsePhoneNumber, { isValidPhoneNumber } from "libphonenumber-js";
import { create, Whatsapp, Message, SocketState } from "venom-bot"
import fetch from 'node-fetch';

export type QRCode = {
    base64Qr: string
    attempt: number
}

const apiUrl: string = "https://crm.crmsimpled.com.br"


export type QRCodeSession = {
    [index: string]: QRCode
}



export type ClientSession = {
    [index: string]: Whatsapp
}

export type ConnectedType = {
    [key: string]: any
}

class Sender {
    private client: ClientSession = {};
    private connectedSession: ConnectedType = {};
    private qrSession: QRCodeSession = {};
    private connected: boolean = false;
    private qr: QRCode;
    private sessions: Object;
    public status: string;
    public message: string;    
    nameSession: string = "first-session";
    
    get isConnected(): string {
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
        
        await this.client[this.nameSession]
                .sendText(phoneNumber, body)
                .then((result) => {
                // console.log('Result: ', result); //return object success
                })
                .catch((erro) => {
                console.error('Error when sending: ', erro); //return object error
                });
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
    close(){
        this.client[this.nameSession].close()
    }
    newsession() {
        
        const start = (client: Whatsapp) => {
            this.client[this.nameSession] = client;
            this.client[this.nameSession].onStateChange((state) => {                
                this.connectedSession[this.nameSession] = state                                                
            })
            this.client[this.nameSession].onMessage((message) => {
                console.log("chegou msg")
                if (message.body === 'Hi' && message.isGroupMsg === false) {
                    this.client[this.nameSession]
                    .sendText(message.from, 'Welcome Venom 🕷')
                    .then((result) => {
                        console.log('Result: ', result); //return object success
                    })
                    .catch((erro) => {
                        console.error('Error when sending: ', erro); //return object error
                    });
                }
            })            
        }
        const qr = (base64Qr: string, asciiQr: string, attempt: number) => {
            this.qrSession[this.nameSession] = { base64Qr, attempt }                                
        }

        const status = (statusSession: string, sessionName: string) => {            
            this.connectedSession[this.nameSession] = statusSession
        }
                
        create(
            this.nameSession,
            qr
        )
        .then((client) => {            
            start(client)
        })
        .catch((error) => console.error(error));
    }

    async setStatusMessage(_status: string, _message: string) {
        this.status = _status;
        this.message = _message;
    }

    async enviarMsgApiSimpled(sessao: string, numero: string, msg: string){
        var requestOptions: any = {
            method: 'GET',
            redirect: 'follow'
            };             
        try{ 
            const response = await fetch(apiUrl + `/api/whatsapp/received?sessao_whats=${sessao}&numero=${numero}&msg=${msg}`, requestOptions)            
            const data = await response.json()            
            this.setStatusMessage(data.status, data.message)
        } catch (err) {
            console.log(err);
        }

    }

    async listChats(){
        return await this.client[this.nameSession].getAllChatsContacts();
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