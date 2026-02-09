import { createClient } from "@/lib/supabase/server";
import LearningForm from "./LearningForm";

export default async function LearningPage() {
  const supabase = await createClient();
  const { data: items, error } = await supabase
    .from("learning_progress")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-6">Learning progress</h1>
        <p className="text-red-600">Error loading learning items: {error.message}</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Learning progress</h1>
      <LearningForm />
      {!items?.length ? (
        <p className="text-gray-600">No learning items yet. Add courses or learning paths.</p>
      ) : (
        <ul className="space-y-3">
          {items.map((item) => (
            <li key={item.id} className="border rounded-lg p-4">
              <p className="font-medium">{item.title}</p>
              <p className="text-sm text-gray-600">{item.source}</p>
              <div className="mt-2 flex items-center gap-2">
                <div className="flex-1 h-2 bg-gray-200 rounded overflow-hidden">
                  <div
                    className="h-full bg-blue-600"
                    style={{ width: `${item.progress_percent}%` }}
                  />
                </div>
                <span className="text-sm">{item.progress_percent}%</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
