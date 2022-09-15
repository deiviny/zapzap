import parsePhoneNumber, { isValidPhoneNumber } from "libphonenumber-js";
import { create, Whatsapp, Message, SocketState } from "venom-bot"

export type QRCode = {
    base64Qr: string
    attempt: number
}

export type SessionQr = {
    [key: string]: QRCode
}

export type ClientSession = {
    [key: string]: Whatsapp
}

class Sender {
    private client: Whatsapp;
    private connected: boolean = false;
    private qr: QRCode;
    private sessions: SessionQr;
    nameSession: string = "first-session";
    
    get isConnected(): boolean {
        return this.connected;
    }

    set setNameSession(session: string) {
        this.nameSession = session;
    }

    get getNameSession(): string {
        return this.nameSession
    }

    get qrCode(): QRCode {
        return this.qr
    }

    get sessionQr(): SessionQr {
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
        await this.client.sendText(phoneNumber, body)
    }

    private initialize() {
        const sessionFirst = this.nameSession
        const start = (client: Whatsapp) => {
            this.client = client;
            client.onStateChange((state) => {
                this.connected = state === SocketState.CONNECTED
            })
        }

        create({
            session: sessionFirst, //name of session
            multidevice: true
        })
        .then((client) => start(client))
        .catch((error) => console.error(error));
    }

    async newsession() {

        const status = (statusSession: string) => {
            this.connected = ["isLogged", "qrReadSuccess", "chatsAvailable"].includes(
                statusSession
            )
        }
        const start = (client: Whatsapp) => {
            this.client = client;
            client.onStateChange((state) => {
                this.connected = state === SocketState.CONNECTED
            })
        }
        
        create(
            this.nameSession,
            (base64Qr: string, asciiQr: string, attempt: number) => {
                this.qr = { base64Qr, attempt }
                this.sessions[this.nameSession] = { base64Qr, attempt }
            }
        )
            .then((client) => start(client))
            .catch((error) => console.error(error));
    }
}

export default Sender;