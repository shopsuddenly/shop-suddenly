"use client";

import { Dialog, DialogContent, DialogTrigger, DialogTitle } from "@/components/ui/dialog";
import { ReviewForm } from "./ReviewForm";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface ReviewDialogProps {
    productId: string;
    userId: string;
    userName: string;
    productName: string; // Passed for display in dialog title
    trigger?: React.ReactNode;
}

export function ReviewDialog({ productId, userId, userName, productName, trigger }: ReviewDialogProps) {
    const [open, setOpen] = useState(false);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button variant="outline" size="sm">
                        Write Review
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden border-none shadow-none bg-transparent">
                <div className="bg-card rounded-lg shadow-xl overflow-hidden">
                    <div className="bg-muted/50 px-6 py-4 border-b border-border">
                        <DialogTitle className="font-serif text-lg text-foreground">Review: <span className="text-muted-foreground">{productName}</span></DialogTitle>
                    </div>
                    <div className="p-0">
                        {/* 
                            ReviewForm has its own styling (bg-slate-50 border etc). 
                            We might want to override or wrap it cleanly. 
                            Since ReviewForm has 'bg-slate-50 border...', we might want to strip that if inside dialog.
                            For now, let's just render it and see visual compatibility.
                        */}
                        <ReviewForm
                            productId={productId}
                            userId={userId}
                            userName={userName}
                            onSuccess={() => setOpen(false)}
                            onCancel={() => setOpen(false)}
                            className="border-0 bg-transparent shadow-none"
                        />
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
