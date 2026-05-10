import { ProductForm } from "@/components/admin/ProductForm";

export default function NewProductPage() {
    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold text-white mb-8">Add New Product</h1>
            <ProductForm />
        </div>
    );
}
