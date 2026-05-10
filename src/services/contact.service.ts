
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export interface ContactMessage {
    name: string;
    email: string;
    subject: string;
    message: string;
}

export const ContactService = {
    async sendMessage(data: ContactMessage) {
        try {
            // 1. Save to Firestore (Guaranteed delivery to system)
            await addDoc(collection(db, "messages"), {
                ...data,
                read: false,
                archived: false,
                createdAt: serverTimestamp(),
            });

            // 2. Try to send email (notification)
            // We don't block on this, or throw if it fails (e.g. valid submission but SMTP down)
            try {
                await fetch('/api/send-email', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        type: 'contact',
                        ...data
                    })
                });
            } catch (emailError) {
                console.error("Failed to send notification email", emailError);
                // We silently fail here because the message IS saved in Firestore
            }

            return true;
        } catch (error) {
            console.error("Error sending message:", error);
            throw error;
        }
    }
};
