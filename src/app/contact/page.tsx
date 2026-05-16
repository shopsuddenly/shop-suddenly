"use client";

import { useState, useEffect } from "react";
import { Send, MapPin, Mail, Phone, Loader2 } from "lucide-react";
import { CMSService } from "@/services/cms.service";
import { ContactService } from "@/services/contact.service";
import { PageContent } from "@/types/cms";
import { toast } from "sonner"; // If sonner isn't installed, use alert or console, but project seems to have utils

export default function ContactPage() {
    const [status, setStatus] = useState<'idle' | 'sending' | 'sent'>('idle');
    const [content, setContent] = useState<PageContent | null>(null);
    const [loading, setLoading] = useState(true);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: 'General Inquiry',
        message: ''
    });

    useEffect(() => {
        const fetchContent = async () => {
            try {
                const data = await CMSService.getPage('contact');
                if (data) setContent(data);
            } catch (error) {
                console.error("Failed to load page content", error);
            } finally {
                setLoading(false);
            }
        };
        fetchContent();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('sending');

        try {
            await ContactService.sendMessage(formData);
            setStatus('sent');
            setFormData({ name: '', email: '', subject: 'General Inquiry', message: '' }); // Reset
        } catch (error) {
            console.error("Failed to send message", error);
            setStatus('idle');
            alert("Failed to send message. Please try again.");
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background pt-24 pb-12 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background pt-24 pb-12">
            <div className="luxury-container">
                <div className="grid lg:grid-cols-2 gap-16">
                    {/* Info */}
                    <div className="fade-in">
                        {content ? (
                            <>
                                <h1 className="font-serif text-4xl md:text-5xl mb-8">{content.title}</h1>
                                <div
                                    className="prose prose-neutral dark:prose-invert max-w-none font-sans text-muted-foreground leading-relaxed"
                                    dangerouslySetInnerHTML={{ __html: content.content }}
                                />
                            </>
                        ) : (
                            <>
                                <h1 className="font-serif text-4xl md:text-5xl mb-8">Get in Touch</h1>
                                <p className="text-muted-foreground font-sans leading-relaxed mb-12">
                                    Our dedicated team is here to assist you with any inquiries regarding your order, our collections, or our brand.
                                </p>

                                <div className="space-y-8">
                                    <div className="flex items-start gap-4">
                                        <div className="p-3 bg-secondary rounded-sm">
                                            <MapPin className="w-6 h-6 text-primary" />
                                        </div>
                                        <div>
                                            <h3 className="font-serif text-lg mb-1">Visit Us</h3>
                                            <p className="text-sm text-muted-foreground font-sans">
                                                123 Luxury Avenue<br />
                                                New York, NY 10012
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-4">
                                        <div className="p-3 bg-secondary rounded-sm">
                                            <Mail className="w-6 h-6 text-primary" />
                                        </div>
                                        <div>
                                            <h3 className="font-serif text-lg mb-1">Email Us</h3>
                                            <p className="text-sm text-muted-foreground font-sans">
                                                support@suddenly.com
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-4">
                                        <div className="p-3 bg-secondary rounded-sm">
                                            <Phone className="w-6 h-6 text-primary" />
                                        </div>
                                        <div>
                                            <h3 className="font-serif text-lg mb-1">Call Us</h3>
                                            <p className="text-sm text-muted-foreground font-sans">
                                                +91 81462 99924<br />
                                                Mon-Sat, 10am - 7pm IST
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Form */}
                    <div className="bg-card border border-border p-8 md:p-12 fade-in">
                        {status === 'sent' ? (
                            <div className="h-full flex flex-col items-center justify-center text-center">
                                <h3 className="font-serif text-2xl mb-4">Message Sent</h3>
                                <p className="text-muted-foreground">We will respond within 24 hours.</p>
                                <button onClick={() => setStatus('idle')} className="mt-8 text-primary hover:underline text-sm">Send another message</button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs uppercase tracking-luxury text-muted-foreground">Name</label>
                                        <input
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            required
                                            className="w-full bg-transparent border-b border-border py-2 focus:border-primary focus:outline-none transition-colors"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs uppercase tracking-luxury text-muted-foreground">Email</label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            required
                                            className="w-full bg-transparent border-b border-border py-2 focus:border-primary focus:outline-none transition-colors"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs uppercase tracking-luxury text-muted-foreground">Subject</label>
                                    <select
                                        name="subject"
                                        value={formData.subject}
                                        onChange={handleChange}
                                        className="w-full bg-transparent border-b border-border py-2 focus:border-primary focus:outline-none transition-colors"
                                    >
                                        <option value="General Inquiry">General Inquiry</option>
                                        <option value="Order Status">Order Status</option>
                                        <option value="Returns & Exchanges">Returns & Exchanges</option>
                                        <option value="Press">Press</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs uppercase tracking-luxury text-muted-foreground">Message</label>
                                    <textarea
                                        name="message"
                                        value={formData.message}
                                        onChange={handleChange}
                                        required
                                        rows={4}
                                        className="w-full bg-transparent border-b border-border py-2 focus:border-primary focus:outline-none transition-colors resize-none"
                                    />
                                </div>
                                <button type="submit" disabled={status === 'sending'} className="btn-luxury w-full flex items-center justify-center gap-2">
                                    <span>{status === 'sending' ? 'Sending...' : 'Send Message'}</span>
                                    {!status && <Send className="w-4 h-4" />}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
