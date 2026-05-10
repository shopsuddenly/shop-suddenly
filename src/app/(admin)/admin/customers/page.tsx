"use client";

import { useEffect, useState } from "react";
import { CustomerService, Customer } from "@/services/customer.service";
import { Loader2, Search, Users, Mail, Calendar } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function CustomersPage() {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchCustomers();
    }, []);

    useEffect(() => {
        filterCustomers();
    }, [customers, searchQuery]);

    const fetchCustomers = async () => {
        try {
            console.log('👥 [CUSTOMERS PAGE] Fetching customers...');
            const allCustomers = await CustomerService.getAllCustomers();
            setCustomers(allCustomers);
        } catch (error) {
            console.error('❌ [CUSTOMERS PAGE] Error fetching customers:', error);
        } finally {
            setLoading(false);
        }
    };

    const filterCustomers = () => {
        if (!searchQuery) {
            setFilteredCustomers(customers);
            return;
        }

        const filtered = customers.filter(customer =>
            customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (customer.displayName?.toLowerCase() || '').includes(searchQuery.toLowerCase())
        );

        setFilteredCustomers(filtered);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="p-6 md:p-8">
            <div className="flex items-center gap-3 mb-8">
                <Users className="w-8 h-8 text-primary" />
                <h1 className="font-serif text-3xl md:text-4xl">Customer Management</h1>
            </div>

            {/* Search Bar */}
            <div className="bg-card border border-border rounded-lg p-6 mb-6">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search by name or email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                </div>
            </div>

            {/* Customer Count */}
            <p className="text-sm text-muted-foreground mb-4">
                Showing {filteredCustomers.length} of {customers.length} customers
            </p>

            {/* Customers Table */}
            {filteredCustomers.length === 0 ? (
                <div className="bg-card border border-border rounded-lg p-12 text-center">
                    <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <p className="text-muted-foreground">No customers found</p>
                </div>
            ) : (
                <div className="bg-card border border-border rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-muted border-b border-border">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                        Customer
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                        Email
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                        Role
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                        Joined
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                        Action
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {filteredCustomers.map((customer) => (
                                    <tr key={customer.id} className="hover:bg-muted/50 transition-colors">
                                        <td className="px-4 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="relative w-10 h-10 rounded-full overflow-hidden bg-muted flex-shrink-0">
                                                    {customer.photoURL ? (
                                                        <Image
                                                            src={customer.photoURL}
                                                            alt={customer.displayName || 'User'}
                                                            fill
                                                            className="object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary font-medium">
                                                            {(customer.displayName || customer.email)?.[0]?.toUpperCase()}
                                                        </div>
                                                    )}
                                                </div>
                                                <span className="font-medium text-sm">
                                                    {customer.displayName || 'No name'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <Mail className="w-3 h-3" />
                                                {customer.email}
                                            </div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${customer.role === 'admin'
                                                    ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300'
                                                    : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                                                }`}>
                                                {customer.role}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <Calendar className="w-3 h-3" />
                                                {new Date(customer.createdAt).toLocaleDateString()}
                                            </div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <Link
                                                href={`/admin/customers/${customer.id}`}
                                                className="text-primary hover:underline text-sm"
                                            >
                                                View Details
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
