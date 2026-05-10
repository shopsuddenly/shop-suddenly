import { useState, useEffect, useCallback } from 'react';
import { AddressService } from '@/services/address.service';
import { Address } from '@/types/user';
import { useAuth } from './useAuth';

export function useAddress() {
    const { user } = useAuth();
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchAddresses = useCallback(async () => {
        if (!user) return;
        setLoading(true);
        try {
            const data = await AddressService.getAddresses(user.uid);
            setAddresses(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [user]);

    const addAddress = async (address: Omit<Address, 'id' | 'uid'>) => {
        if (!user) return;

        if (addresses.length >= 4) {
            throw new Error("You can only save up to 4 addresses. Please delete an existing one to add a new address.");
        }

        try {
            const newAddr = await AddressService.addAddress(user.uid, { ...address, uid: user.uid });
            setAddresses(prev => [...prev, newAddr]);
            return newAddr;
        } catch (err: any) {
            setError(err.message);
            throw err;
        }
    };

    const updateAddress = async (address: Address) => {
        if (!user) return;
        try {
            await AddressService.updateAddress(user.uid, address);
            setAddresses(prev => prev.map(a => a.id === address.id ? address : a));
        } catch (err: any) {
            setError(err.message);
            throw err;
        }
    };

    const deleteAddress = async (addressId: string) => {
        if (!user) return;
        try {
            await AddressService.deleteAddress(user.uid, addressId);
            setAddresses(prev => prev.filter(a => a.id !== addressId));
        } catch (err: any) {
            setError(err.message);
            throw err;
        }
    };

    useEffect(() => {
        fetchAddresses();
    }, [fetchAddresses]);

    return {
        addresses,
        loading,
        error,
        addAddress,
        updateAddress,
        deleteAddress,
        refresh: fetchAddresses
    };
}
