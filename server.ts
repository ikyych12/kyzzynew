import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { Telegraf } from "telegraf";
import admin from "firebase-admin";
import { fileURLToPath } from 'url';
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Firebase Admin
const configPath = path.join(__dirname, "firebase-applet-config.json");
const firebaseConfig = JSON.parse(fs.readFileSync(configPath, "utf-8"));

admin.initializeApp({
  projectId: firebaseConfig.projectId,
});

const getDB = () => {
    if (firebaseConfig.firestoreDatabaseId) {
        // @ts-ignore
        return admin.firestore(firebaseConfig.firestoreDatabaseId);
    }
    return admin.firestore();
}

const fdb = getDB();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Bot Setup
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    console.warn("TELEGRAM_BOT_TOKEN not found in env. Bot functionality will be disabled.");
  } else {
    const bot = new Telegraf(token);

    // Helper: Get user by Telegram ID
    const getLinkedUser = async (tgId: number) => {
        const snap = await fdb.collection('telegram_links').doc(String(tgId)).get();
        if (!snap.exists) return null;
        const { username } = snap.data() as { username: string };
        const userSnap = await fdb.collection('users').doc(username).get();
        if (!userSnap.exists) return null;
        return { ...userSnap.data(), id: userSnap.id };
    };

    bot.start((ctx) => {
        ctx.reply("KYZZY PROTOCOL - TELEGRAM HUB\n\nCommands:\n/login <recoveryKey> - Link account\n/status - Check profile\n\nAdmin Commands:\n/reg <user> <pass> <role> <tier> [hours]\n/gen <days> <role> [target]\n/ban <user> [reason]\n/unban <user>\n/delete <user>");
    });

    bot.command('login', async (ctx) => {
        try {
            const parts = ctx.message.text.split(' ');
            if (parts.length < 2) return ctx.reply("Usage: /login <recoveryKey>");
            const key = parts[1].trim().toUpperCase();

            // Find user with this recovery key
            const q = await fdb.collection('users').where('recoveryKey', '==', key).limit(1).get();
            if (q.empty) return ctx.reply("Invalid Recovery Key.");

            const user = q.docs[0];
            const username = user.id;

            await fdb.collection('telegram_links').doc(String(ctx.from.id)).set({
                username: username,
                linkedAt: admin.firestore.FieldValue.serverTimestamp()
            });

            ctx.reply(`SUCCESS! Protocol linked to: ${username.toUpperCase()}.`);
        } catch (e: any) {
            ctx.reply(`LOGIN ERROR: ${e.message}`);
        }
    });

    bot.command('status', async (ctx) => {
        try {
            const user = await getLinkedUser(ctx.from.id);
            if (!user) return ctx.reply("No linked identity. Use /login <recoveryKey>");

            const expiry = user.expiry ? new Date(user.expiry).toLocaleString() : 'LIFETIME';
            ctx.reply(`SUBJECT IDENTIFICATION:\n\nUser: ${user.username.toUpperCase()}\nRole: ${user.role}\nTier: ${user.tier}\nExpiry: ${expiry}\nBanned: ${user.isBanned ? '⚠️ YES' : '✅ NO'}`);
        } catch (e: any) {
            ctx.reply(`STATUS ERROR: ${e.message}`);
        }
    });

    bot.command('reg', async (ctx) => {
        try {
            const adminUser = await getLinkedUser(ctx.from.id);
            if (!adminUser || !['OWNER', 'ADMIN', 'RESELLER'].includes(adminUser.role)) return ctx.reply("Unauthorized.");

            const parts = ctx.message.text.split(' ');
            if (parts.length < 5) return ctx.reply("Usage: /reg <username> <password> <role> <tier> [hours]");

            const username = parts[1].toLowerCase().trim();
            const password = parts[2];
            const role = parts[3].toUpperCase();
            const tier = parts[4];
            const hours = parts[5] || "24";

            const durationHours = parseInt(hours);
            const expiry = tier === 'Lifetime' ? null : new Date(Date.now() + durationHours * 60 * 60 * 1000).toISOString();

            const docRef = fdb.collection('users').doc(username);
            const existing = await docRef.get();
            if (existing.exists) return ctx.reply("Identity already exists.");

            const recoveryKey = `REC-${Math.random().toString(36).substring(2, 10).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

            const newUser = {
                username,
                password,
                role,
                tier,
                expiry,
                recoveryKey,
                createdAt: admin.firestore.FieldValue.serverTimestamp()
            };

            await docRef.set(newUser);
            await fdb.collection('recoveryKeys').doc(recoveryKey).set({
                username,
                createdAt: admin.firestore.FieldValue.serverTimestamp()
            });

            ctx.reply(`PROTOCOL REGISTERED:\nUser: ${username.toUpperCase()}\nRole: ${role}\nTier: ${tier}\nKey: ${recoveryKey}`);
        } catch (e: any) {
            ctx.reply(`REGISTRY ERROR: ${e.message}`);
        }
    });

    bot.command('gen', async (ctx) => {
        try {
            const adminUser = await getLinkedUser(ctx.from.id);
            if (!adminUser || !['OWNER', 'ADMIN', 'RESELLER'].includes(adminUser.role)) return ctx.reply("Unauthorized.");

            const parts = ctx.message.text.split(' ');
            if (parts.length < 3) return ctx.reply("Usage: /gen <days> <role> [target]");
            
            const days = parts[1];
            const role = parts[2].toUpperCase();
            const target = parts[3] || null;

            const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase();
            const keyString = `TMK-${randomPart}`;

            await fdb.collection('premiumKeys').doc(keyString).set({
                key: keyString,
                durationDays: parseInt(days),
                targetRole: role,
                targetUser: target ? target.toLowerCase() : null,
                status: 'unused',
                createdAt: admin.firestore.FieldValue.serverTimestamp()
            });
            ctx.reply(`PROTOCOL KEY GENERATED:\nKey: ${keyString}\nDuration: ${days}D\nRole: ${role}`);
        } catch (e: any) {
            ctx.reply(`GENERATION ERROR: ${e.message}`);
        }
    });

    bot.command('ban', async (ctx) => {
        try {
            const adminUser = await getLinkedUser(ctx.from.id);
            if (!adminUser || !['OWNER', 'ADMIN'].includes(adminUser.role)) return ctx.reply("Unauthorized.");

            const parts = ctx.message.text.split(' ');
            if (parts.length < 2) return ctx.reply("Usage: /ban <username> [reason]");
            const target = parts[1].toLowerCase().trim();
            const reason = parts.slice(2).join(' ') || 'Protocol Violation';

            await fdb.collection('users').doc(target).update({
                isBanned: true,
                bannedReason: reason
            });
            ctx.reply(`SUBJECT ${target.toUpperCase()} TERMINATED (BANNED).`);
        } catch (e: any) {
            ctx.reply(`TERMINATION ERROR: ${e.message}`);
        }
    });

    bot.command('unban', async (ctx) => {
        try {
            const adminUser = await getLinkedUser(ctx.from.id);
            if (!adminUser || !['OWNER', 'ADMIN'].includes(adminUser.role)) return ctx.reply("Unauthorized.");

            const parts = ctx.message.text.split(' ');
            if (parts.length < 2) return ctx.reply("Usage: /unban <username>");
            const target = parts[1].toLowerCase().trim();

            await fdb.collection('users').doc(target).update({
                isBanned: false,
                bannedReason: ""
            });
            ctx.reply(`SUBJECT ${target.toUpperCase()} RESTORED (UNBANNED).`);
        } catch (e: any) {
            ctx.reply(`RESTORATION ERROR: ${e.message}`);
        }
    });

    bot.command('delete', async (ctx) => {
        try {
            const adminUser = await getLinkedUser(ctx.from.id);
            if (!adminUser || !['OWNER', 'ADMIN'].includes(adminUser.role)) return ctx.reply("Unauthorized.");

            const parts = ctx.message.text.split(' ');
            if (parts.length < 2) return ctx.reply("Usage: /delete <username>");
            const target = parts[1].toLowerCase().trim();

            if (['iky', 'kyzzy'].includes(target)) return ctx.reply("PROTECTED IDENTITY.");

            // Delete recovery key if exists
            const userSnap = await fdb.collection('users').doc(target).get();
            if (userSnap.exists) {
                const { recoveryKey } = userSnap.data() as { recoveryKey?: string };
                if (recoveryKey) await fdb.collection('recoveryKeys').doc(recoveryKey).delete();
            }

            await fdb.collection('users').doc(target).delete();
            ctx.reply(`SUBJECT ${target.toUpperCase()} PURGED FROM DATABASE.`);
        } catch (e: any) {
            ctx.reply(`PURGE ERROR: ${e.message}`);
        }
    });

    bot.launch().then(() => console.log("Telegram Bot operational"));
    
    process.once('SIGINT', () => bot.stop('SIGINT'));
    process.once('SIGTERM', () => bot.stop('SIGTERM'));
  }

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
