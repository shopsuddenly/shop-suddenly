"use client";

import { useErrorStore } from "@/store/useErrorStore";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

export function ErrorDialog() {
    const { isOpen, title, message, closeError } = useErrorStore();

    return (
        <Dialog open={isOpen} onOpenChange={closeError}>
            <DialogContent className="sm:max-w-[425px] bg-background border-border">
                <DialogHeader>
                    <div className="flex items-center gap-2 text-destructive mb-2">
                        <AlertCircle className="w-6 h-6" />
                        <DialogTitle className="text-xl">{title || "Error"}</DialogTitle>
                    </div>
                    <DialogDescription className="text-base text-muted-foreground pt-2">
                        {message}
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="mt-4">
                    <Button onClick={closeError} variant="outline" className="w-full sm:w-auto">
                        Dismiss
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
