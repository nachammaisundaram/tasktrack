import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axiosConfig";
import TaskItem from "./TaskItem";

function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [filter, setFilter] = useState("All");
  const [editingTask, setEditingTask] = useState(null);
  const navigate = useNavigate();

  // Page load aana udane tasks fetch pannurathukku
  useEffect(() => {
    fetchTasks();
  }, [filter]);

  const fetchTasks = async () => {
    try {
      const params = filter !== "All" ? { status: filter } : {};
      const response = await API.get("/tasks", { params });
      setTasks(response.data);
    } catch (err) {
      if (err.response?.status === 401) {
        navigate("/login");
      }
    }
  };

  const handleAddOrUpdate = async (e) => {
    e.preventDefault();
    try {
      if (editingTask) {
        // Update existing task
        await API.put(`/tasks/${editingTask.id}`, { title, description });
        setEditingTask(null);
      } else {
        // Create new task
        await API.post("/tasks", { title, description, status: "Pending" });
      }
      setTitle("");
      setDescription("");
      fetchTasks();
    } catch (err) {
      alert("Something went wrong");
    }
  };

  const handleToggleStatus = async (task) => {
    const newStatus = task.status === "Done" ? "Pending" : "Done";
    await API.put(`/tasks/${task.id}`, { status: newStatus });
    fetchTasks();
  };

  const handleDelete = async (taskId) => {
    if (window.confirm("Delete this task?")) {
      await API.delete(`/tasks/${taskId}`);
      fetchTasks();
    }
  };

  const handleEdit = (task) => {
    setEditingTask(task);
    setTitle(task.title);
    setDescription(task.description || "");
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div style={{ maxWidth: "600px", margin: "30px auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <h2>TaskTrack Dashboard</h2>
        <button onClick={handleLogout}>Logout</button>
      </div>

      {/* Add / Edit Task Form */}
      <form onSubmit={handleAddOrUpdate} style={{ marginBottom: "20px" }}>
        <input
          type="text"
          placeholder="Task title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          style={{ width: "100%", padding: "8px", marginBottom: "8px" }}
        />
        <input
          type="text"
          placeholder="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          style={{ width: "100%", padding: "8px", marginBottom: "8px" }}
        />
        <button type="submit" style={{ width: "100%", padding: "10px" }}>
          {editingTask ? "Update Task" : "Add Task"}
        </button>
      </form>

      {/* Filter Buttons */}
      <div style={{ marginBottom: "15px" }}>
        {["All", "Pending", "Done"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              marginRight: "8px",
              fontWeight: filter === f ? "bold" : "normal",
            }}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Task List */}
      {tasks.length === 0 ? (
        <p>No tasks found.</p>
      ) : (
        tasks.map((task) => (
          <TaskItem
            key={task.id}
            task={task}
            onToggleStatus={handleToggleStatus}
            onDelete={handleDelete}
            onEdit={handleEdit}
          />
        ))
      )}
    </div>
  );
}

export default Dashboard;