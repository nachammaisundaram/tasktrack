import { CheckCircle2, Circle, Pencil, Trash2 } from "lucide-react";

const PRIORITY_BADGE = {
  High: "text-orange-400 bg-orange-500/10 border-orange-500/40",
  Medium: "text-amber-300 bg-amber-500/10 border-amber-500/30",
  Low: "text-neutral-400 bg-neutral-700/30 border-neutral-600/40",
};

const CATEGORY_ICON = { Work: "💼", Study: "📘", Personal: "🌱" };

function formatDate(iso) {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso; // plain "YYYY-MM-DD" due dates
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
}

function TaskItem({ task, onToggleStatus, onDelete, onEdit }) {
  const done = task.status === "Done";

  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-2xl border border-neutral-800 bg-neutral-950/60">
      <button onClick={() => onToggleStatus(task)} className="shrink-0">
        {done ? (
          <CheckCircle2 size={18} className="text-orange-400" />
        ) : (
          <Circle size={18} className="text-neutral-600" />
        )}
      </button>

      <span className="text-base">{CATEGORY_ICON[task.category] || "🌱"}</span>

      <div className="flex-1 min-w-0">
        <div className={`text-sm font-medium truncate ${done ? "text-neutral-500 line-through" : "text-neutral-100"}`}>
          {task.title}
        </div>
        {task.description && (
          <div className="text-xs text-neutral-600 truncate mt-0.5">{task.description}</div>
        )}
        <div className="flex flex-wrap items-center gap-2 mt-1 text-xs font-mono text-neutral-600">
          {task.due_date && <span>due {formatDate(task.due_date)}</span>}
          {done && task.completed_at && (
            <>
              {task.due_date && <span>•</span>}
              <span className="text-orange-500/70">done {formatDate(task.completed_at)}</span>
            </>
          )}
        </div>
      </div>

      <span className={`text-xs font-mono px-2.5 py-1 rounded-full border shrink-0 ${PRIORITY_BADGE[task.priority] || PRIORITY_BADGE.Medium}`}>
        {task.priority || "Medium"}
      </span>

      <div className="flex items-center gap-1 shrink-0">
        <button onClick={() => onEdit(task)} className="p-1.5 rounded-lg text-neutral-500 hover:text-orange-400 hover:bg-neutral-800/60">
          <Pencil size={14} />
        </button>
        <button onClick={() => onDelete(task.id)} className="p-1.5 rounded-lg text-neutral-500 hover:text-red-400 hover:bg-neutral-800/60">
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}

export default TaskItem;
