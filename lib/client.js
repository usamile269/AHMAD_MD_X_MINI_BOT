import makeWASocket, {
    useMultiFileAuthState,
    DisconnectReason,
    fetchLatestBaileysVersion
} from "@whiskeysockets/baileys";

import pino from "pino";

export async function startBot() {

    const { state, saveCreds } = await useMultiFileAuthState("./session");

    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
        version,
        auth: state,
        logger: pino({ level: "silent" }),
        browser: ["Ahmed Mini Bot", "Chrome", "1.0.0"]
    });

    sock.ev.on("creds.update", saveCreds);

    sock.ev.on("connection.update", async (update) => {

        const { connection, lastDisconnect } = update;

        if (connection === "open") {
            console.log("✅ Ahmed Mini Bot Connected");
        }

        if (connection === "close") {

            const shouldReconnect =
                lastDisconnect?.error?.output?.statusCode !==
                DisconnectReason.loggedOut;

            console.log("❌ Connection Closed");

            if (shouldReconnect) {
                startBot();
            }
        }

    });

    return sock;
}
