
import { storage } from "@/lib/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export const StorageService = {
    async uploadFile(file: File, path: string = "uploads"): Promise<string> {
        try {
            // Create a unique filename
            const timestamp = Date.now();
            const safeName = file.name.replace(/[^a-zA-Z0-9.]/g, "_");
            const filename = `${timestamp}_${safeName}`;

            // Create a reference
            const storageRef = ref(storage, `${path}/${filename}`);

            // Upload the file
            const snapshot = await uploadBytes(storageRef, file);

            // Get the download URL
            const downloadURL = await getDownloadURL(snapshot.ref);

            return downloadURL;
        } catch (error) {
            console.error("Error uploading file:", error);
            throw new Error("Failed to upload file");
        }
    }
};
