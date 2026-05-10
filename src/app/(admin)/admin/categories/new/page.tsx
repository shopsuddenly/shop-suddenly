import { CategoryForm } from "@/components/admin/CategoryForm";

export default function NewCategoryPage() {
    return (
        <div className="p-6 md:p-8">
            <h1 className="font-serif text-3xl md:text-4xl text-foreground mb-8">Add New Category</h1>
            <CategoryForm />
        </div>
    );
}
