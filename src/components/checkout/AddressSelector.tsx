import { Address } from "@/types/user";
import { useAddress } from "@/hooks/useAddress";
import { AddressForm } from "./AddressForm";
import { useState, useEffect } from "react";
import { Plus, Trash2, CheckCircle2 } from "lucide-react";

interface AddressSelectorProps {
    selectedAddressId?: string;
    onSelect: (address: Address) => void;
}

export function AddressSelector({ selectedAddressId, onSelect }: AddressSelectorProps) {
    const { addresses, addAddress, deleteAddress, loading } = useAddress();
    const [isAdding, setIsAdding] = useState(false);

    const handleAdd = async (data: Omit<Address, "id" | "uid">) => {
        const newAddress = await addAddress(data);
        if (newAddress) {
            onSelect(newAddress);
            setIsAdding(false);
        }
    };

    // Auto-select effect
    useEffect(() => {
        if (!loading && addresses.length > 0 && !selectedAddressId) {
            // Prefer the default address, otherwise pick the first one
            const defaultAddress = addresses.find(addr => addr.isDefault) || addresses[0];
            onSelect(defaultAddress);
        }
    }, [addresses, loading, selectedAddressId, onSelect]);

    if (loading) return <div className="py-4 text-center text-muted-foreground">Loading addresses...</div>;

    return (
        <div className="space-y-6">
            <h3 className="font-serif text-xl border-b border-border pb-2">Shipping Address</h3>

            {/* List Addresses */}
            <div className="grid grid-cols-1 gap-4">
                {addresses.map((addr) => {
                    const isSelected = selectedAddressId === addr.id;
                    return (
                        <div
                            key={addr.id}
                            onClick={() => onSelect(addr)}
                            className={`
                                relative p-4 border cursor-pointer transition-all duration-300 rounded-md
                                ${isSelected ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}
                            `}
                        >
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="font-serif text-lg">{addr.name}</p>
                                    <p className="text-sm text-muted-foreground">{addr.addressLine1}</p>
                                    {addr.addressLine2 && <p className="text-sm text-muted-foreground">{addr.addressLine2}</p>}
                                    <p className="text-sm text-muted-foreground">
                                        {addr.city}, {addr.state} {addr.postalCode}
                                    </p>
                                    <p className="text-sm text-muted-foreground mt-1">{addr.phone}</p>
                                </div>
                                <div className="flex flex-col gap-2">
                                    {isSelected && <CheckCircle2 className="w-5 h-5 text-primary" />}
                                    <button
                                        onClick={(e) => { e.stopPropagation(); deleteAddress(addr.id); }}
                                        className="text-muted-foreground hover:text-destructive transition-colors mt-2"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Add New Section */}
            {isAdding ? (
                <AddressForm
                    onSubmit={handleAdd}
                    onCancel={() => setIsAdding(false)}
                />
            ) : (
                <button
                    onClick={() => setIsAdding(true)}
                    disabled={addresses.length >= 4}
                    className="w-full py-4 border border-dashed border-border hover:border-primary text-muted-foreground hover:text-primary transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-border disabled:hover:text-muted-foreground rounded-md"
                >
                    <Plus className="w-4 h-4" />
                    <span>
                        {addresses.length >= 4
                            ? "Address Limit Reached (Max 4)"
                            : "Add New Address"
                        }
                    </span>
                </button>
            )}
        </div>
    );
}
