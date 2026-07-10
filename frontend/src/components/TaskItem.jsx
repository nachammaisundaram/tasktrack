function TaskItem({ task, onToggleStatus, onDelete, onEdit }) {
  return (
    <div
      style={{
        border: "1px solid #ccc",
        borderRadius: "6px",
        padding: "12px",
        marginBottom: "10px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: task.status === "Done" ? "#e6ffe6" : "#fff",
      }}
    >
      <div>
        <h4 style={{ margin: 0, textDecoration: task.status === "Done" ? "line-through" : "none" }}>
          {task.title}
        </h4>
        <p style={{ margin: "4px 0", color: "#666" }}>{task.description}</p>
        <small>Status: {task.status}</small>
      </div>
      <div style={{ display: "flex", gap: "8px" }}>
        <button onClick={() => onToggleStatus(task)}>
          {task.status === "Done" ? "Mark Pending" : "Mark Done"}
        </button>
        <button onClick={() => onEdit(task)}>Edit</button>
        <button onClick={() => onDelete(task.id)} style={{ color: "red" }}>
          Delete
        </button>
      </div>
    </div>
  );
}

export default TaskItem;