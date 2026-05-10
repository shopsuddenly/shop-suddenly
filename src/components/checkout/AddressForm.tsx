import { useForm } from "react-hook-form";
import { Address } from "@/types/user";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";

interface AddressFormProps {
    defaultValues?: Partial<Address>;
    onSubmit: (data: Omit<Address, "id" | "uid">) => Promise<void>;
    onCancel: () => void;
}

export function AddressForm({ defaultValues, onSubmit, onCancel }: AddressFormProps) {
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<Omit<Address, "id" | "uid">>({
        defaultValues: {
            name: "",
            addressLine1: "",
            addressLine2: "",
            city: "",
            state: "",
            postalCode: "",
            country: "India", // Default
            phone: "",
            type: "shipping",
            ...defaultValues
        }
    });

    const onFormSubmit = async (data: Omit<Address, "id" | "uid">) => {
        await onSubmit(data);
    };

    return (
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4 animate-fade-in p-4 border border-border bg-card">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input id="name" {...register("name", { required: "Name is required" })} />
                    {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input id="phone" {...register("phone", { required: "Phone is required" })} />
                    {errors.phone && <p className="text-xs text-red-500">{errors.phone.message}</p>}
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="addressLine1">Address Line 1</Label>
                <Input id="addressLine1" {...register("addressLine1", { required: "Address is required" })} />
                {errors.addressLine1 && <p className="text-xs text-red-500">{errors.addressLine1.message}</p>}
            </div>

            <div className="space-y-2">
                <Label htmlFor="addressLine2">Address Line 2 (Optional)</Label>
                <Input id="addressLine2" {...register("addressLine2")} />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input id="city" {...register("city", { required: "City is required" })} />
                    {errors.city && <p className="text-xs text-red-500">{errors.city.message}</p>}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="state">State</Label>
                    <Input id="state" {...register("state", { required: "State is required" })} />
                    {errors.state && <p className="text-xs text-red-500">{errors.state.message}</p>}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="postalCode">Zip Code</Label>
                    <Input id="postalCode" {...register("postalCode", { required: "Zip Code is required" })} />
                    {errors.postalCode && <p className="text-xs text-red-500">{errors.postalCode.message}</p>}
                </div>
            </div>

            <div className="flex gap-4 pt-4">
                <Button type="submit" className="btn-luxury flex-1" disabled={isSubmitting}>
                    {isSubmitting ? "Saving..." : "Save Address"}
                </Button>
                <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
                    Cancel
                </Button>
            </div>
        </form>
    );
}
