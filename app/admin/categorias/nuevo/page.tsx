import CategoryForm from "../_components/CategoryForm";

export default function NewCategoryPage() {
  return (
    <div className="p-6 md:p-10">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-white">Nueva Categoría</h1>
        <p className="text-gray-400 mt-1">Agrega una nueva clasificación para tus cursos.</p>
      </div>
      
      <CategoryForm mode="create" />
    </div>
  );
}
