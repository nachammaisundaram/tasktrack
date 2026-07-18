import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  CheckCircle2, Clock, ListTodo, Activity, Flame, Search, Tag,
  TrendingUp, Plus, LogOut, X
} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import API from "../api/axiosConfig";
import TaskItem from "./TaskItem";

const CATEGORIES = ["Work", "Study", "Personal"];
const PRIORITIES = ["High", "Medium", "Low"];

function decodeUsername(token) {
  try {
    const payload = JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
    return payload.sub || "there";
  } catch {
    return "there";
  }
}

function heatColor(count) {
  if (count === null || count === undefined) return "transparent";
  if (count === 0) return "#262626";
  if (count === 1) return "#7c2d12";
  if (count === 2) return "#c2410c";
  if (count <= 4) return "#f97316";
  return "#fdba74";
}
const cellStyle = { width: 14, height: 14, borderRadius: 3 };

function buildHeatmapWeeks(tasks) {
  const counts = {};
  tasks.forEach((t) => {
    if (t.completed_at) {
      const day = t.completed_at.slice(0, 10);
      counts[day] = (counts[day] || 0) + 1;
    }
  });
  const today = new Date();
  const totalDays = 13 * 7;
  const days = [];
  for (let i = totalDays - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    days.push({ date: key, count: counts[key] || 0, dow: d.getDay() });
  }
  const pad = days[0].dow;
  const padded = Array(pad).fill(null).concat(days);
  const weeks = [];
  for (let i = 0; i < padded.length; i += 7) weeks.push(padded.slice(i, i + 7));
  return weeks;
}

function buildWeeklyTrend(tasks) {
  const today = new Date();
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    const dayName = d.toLocaleDateString("en-US", { weekday: "short" });
    const completedThatDay = tasks.filter((t) => t.completed_at && t.completed_at.slice(0, 10) === key);
    const onTime = completedThatDay.filter((t) => t.due_date && t.completed_at.slice(0, 10) <= t.due_date.slice(0, 10));
    days.push({ day: dayName, completed: completedThatDay.length, onTime: onTime.length });
  }
  return days;
}

const emptyForm = { title: "", description: "", category: "Personal", priority: "Medium", due_date: "" };

function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [tab, setTab] = useState("All");
  const [query, setQuery] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [editingTask, setEditingTask] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const navigate = useNavigate();

  const username = decodeUsername(localStorage.getItem("token") || "");

  const fetchTasks = async () => {
    try {
      const response = await API.get("/tasks");
      setTasks(response.data);
    } catch (err) {
      if (err.response?.status === 401) navigate("/login");
    }
  };

  useEffect(() => {
    fetchTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAddOrUpdate = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        title: form.title,
        description: form.description || null,
        category: form.category,
        priority: form.priority,
        due_date: form.due_date || null,
      };
      if (editingTask) {
        await API.put(`/tasks/${editingTask.id}`, payload);
      } else {
        await API.post("/tasks", { ...payload, status: "Pending" });
      }
      setForm(emptyForm);
      setEditingTask(null);
      setShowForm(false);
      fetchTasks();
    } catch {
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
    setForm({
      title: task.title,
      description: task.description || "",
      category: task.category || "Personal",
      priority: task.priority || "Medium",
      due_date: task.due_date || "",
    });
    setShowForm(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const filtered = useMemo(() => {
    let list = tasks;
    if (tab === "Pending") list = list.filter((t) => t.status !== "Done");
    if (tab === "Completed") list = list.filter((t) => t.status === "Done");
    if (query) list = list.filter((t) => t.title.toLowerCase().includes(query.toLowerCase()));
    return list;
  }, [tasks, tab, query]);

  const total = tasks.length;
  const completed = tasks.filter((t) => t.status === "Done").length;
  const pending = total - completed;
  const rate = total ? Math.round((completed / total) * 100) : 0;

  const heatmapWeeks = useMemo(() => buildHeatmapWeeks(tasks), [tasks]);
  const weeklyTrend = useMemo(() => buildWeeklyTrend(tasks), [tasks]);

  const streak = useMemo(() => {
    const flat = heatmapWeeks.flat().filter(Boolean);
    let s = 0;
    for (let i = flat.length - 1; i >= 0; i--) {
      if (flat[i].count > 0) s++; else break;
    }
    return s;
  }, [heatmapWeeks]);

  const circumference = 2 * Math.PI * 54;
  const weekTotal = weeklyTrend.reduce((a, d) => a + d.completed, 0);

  return (
    <div className="min-h-screen bg-black text-neutral-200">
      <div className="max-w-3xl mx-auto px-5 py-8 space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between px-1">
          <div>
            <div className="font-bold text-2xl text-white">TaskTrack</div>
            <div className="text-xs text-neutral-500 font-mono mt-0.5">@{username}</div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => { setShowForm(true); setEditingTask(null); setForm(emptyForm); }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-black text-sm font-semibold"
            >
              <Plus size={15} /> New Task
            </button>
            <button onClick={handleLogout} className="p-2.5 rounded-xl border border-neutral-800 text-neutral-400 hover:text-orange-400">
              <LogOut size={16} />
            </button>
          </div>
        </div>

        {/* Add/Edit Task Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4">
            <div className="w-full max-w-md rounded-3xl border border-neutral-800 bg-neutral-900 shadow-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-semibold text-lg">{editingTask ? "Edit Task" : "New Task"}</h3>
                <button onClick={() => { setShowForm(false); setEditingTask(null); setForm(emptyForm); }} className="text-neutral-500 hover:text-white">
                  <X size={18} />
                </button>
              </div>
              <form onSubmit={handleAddOrUpdate} className="space-y-3">
                <input
                  type="text" placeholder="Task title" required
                  value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full bg-neutral-950/60 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-sm text-neutral-100 placeholder:text-neutral-600 outline-none focus:border-orange-500/50"
                />
                <textarea
                  placeholder="Description (optional)" rows={2}
                  value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full bg-neutral-950/60 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-sm text-neutral-100 placeholder:text-neutral-600 outline-none focus:border-orange-500/50"
                />
                <div className="grid grid-cols-2 gap-3">
                  <select
                    value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="bg-neutral-950/60 border border-neutral-800 rounded-xl px-3 py-2.5 text-sm text-neutral-100 outline-none"
                  >
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <select
                    value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}
                    className="bg-neutral-950/60 border border-neutral-800 rounded-xl px-3 py-2.5 text-sm text-neutral-100 outline-none"
                  >
                    {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <input
                  type="date"
                  value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })}
                  className="w-full bg-neutral-950/60 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-sm text-neutral-100 outline-none"
                />
                <button type="submit" className="w-full py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-black font-semibold text-sm">
                  {editingTask ? "Update Task" : "Create Task"}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Hero progress */}
        <div className="rounded-3xl border border-neutral-800 bg-neutral-900/60 shadow-2xl p-7">
          <div className="flex items-center gap-7 flex-wrap">
            <div className="relative w-28 h-28 shrink-0">
              <svg width="112" height="112" className="-rotate-90">
                <circle cx="56" cy="56" r="54" fill="none" stroke="#262626" strokeWidth="8" />
                <circle
                  cx="56" cy="56" r="54" fill="none" stroke="#f97316" strokeWidth="8"
                  strokeDasharray={circumference} strokeDashoffset={circumference * (1 - rate / 100)}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold text-white">{rate}%</span>
                <span className="text-xs text-neutral-500 font-mono">DONE</span>
              </div>
            </div>
            <div className="flex-1 min-w-[180px]">
              <div className="text-lg font-semibold text-white mb-1">Welcome back, {username}</div>
              <div className="text-sm text-neutral-500 mb-3">
                {total === 0 ? "No tasks yet — create your first one." : `You've completed ${completed} of ${total} tasks. Keep the streak alive.`}
              </div>
              <div className="flex items-center gap-1.5 text-orange-400 text-sm font-medium">
                <Flame size={15} /> {streak}-day streak
              </div>
            </div>
          </div>
        </div>

        {/* Weekly Completion Trend */}
        <div className="rounded-3xl border border-neutral-800 bg-neutral-900/60 shadow-2xl p-6">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-7 h-7 rounded-lg bg-orange-500/20 flex items-center justify-center">
              <TrendingUp size={14} className="text-orange-400" />
            </div>
            <span className="text-xs font-mono font-semibold tracking-widest text-neutral-400 uppercase">Weekly Completion Trend</span>
          </div>
          <div className="text-3xl font-bold text-white -mt-1 mb-4">
            {weekTotal}
            <span className="text-sm text-neutral-500 font-mono font-normal ml-2">tasks this week</span>
          </div>
          <div style={{ width: "100%", height: 160 }}>
            <ResponsiveContainer>
              <AreaChart data={weeklyTrend} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="fillCompleted" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f97316" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="#f97316" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" tick={{ fill: "#737373", fontSize: 11 }} axisLine={{ stroke: "#262626" }} tickLine={false} />
                <YAxis tick={{ fill: "#737373", fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ background: "#171717", border: "1px solid #404040", borderRadius: 10, fontSize: 12 }}
                  labelStyle={{ color: "#e5e5e5" }}
                  itemStyle={{ color: "#fb923c" }}
                />
                <Area type="monotone" dataKey="completed" name="Completed" stroke="#f97316" strokeWidth={2.5} fill="url(#fillCompleted)" dot={{ fill: "#f97316", r: 3 }} />
                <Area type="monotone" dataKey="onTime" name="On time" stroke="#fdba74" strokeWidth={1.5} fill="transparent" strokeDasharray="4 3" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Stats */}
        <div className="flex gap-3 flex-wrap">
          <div className="flex-1 min-w-[110px] rounded-2xl border border-neutral-800 bg-neutral-900/60 p-5">
            <ListTodo size={18} className="text-orange-400 mb-3" />
            <div className="text-3xl font-bold text-white">{total}</div>
            <div className="text-xs text-neutral-500 font-mono mt-1">TOTAL</div>
          </div>
          <div className="flex-1 min-w-[110px] rounded-2xl border border-neutral-800 bg-neutral-900/60 p-5">
            <CheckCircle2 size={18} className="text-orange-400 mb-3" />
            <div className="text-3xl font-bold text-white">{completed}</div>
            <div className="text-xs text-neutral-500 font-mono mt-1">COMPLETED</div>
          </div>
          <div className="flex-1 min-w-[110px] rounded-2xl border border-neutral-800 bg-neutral-900/60 p-5">
            <Clock size={18} className="text-orange-400 mb-3" />
            <div className="text-3xl font-bold text-white">{pending}</div>
            <div className="text-xs text-neutral-500 font-mono mt-1">PENDING</div>
          </div>
        </div>

        {/* Task list */}
        <div className="rounded-3xl border border-neutral-800 bg-neutral-900/60 shadow-2xl p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-7 h-7 rounded-lg bg-orange-500/20 flex items-center justify-center">
              <ListTodo size={14} className="text-orange-400" />
            </div>
            <span className="text-xs font-mono font-semibold tracking-widest text-neutral-400 uppercase">My Tasks</span>
          </div>

          <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
            <div className="flex gap-1 bg-neutral-950/60 p-1 rounded-xl border border-neutral-800">
              {["All", "Pending", "Completed"].map((t) => (
                <button
                  key={t} onClick={() => setTab(t)}
                  className={`px-3.5 py-1.5 text-xs font-mono rounded-lg transition-colors ${tab === t ? "bg-orange-500 text-black font-semibold" : "text-neutral-400"}`}
                >
                  {t}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2 bg-neutral-950/60 border border-neutral-800 rounded-xl px-3 py-2">
              <Search size={13} className="text-neutral-500 shrink-0" />
              <input
                value={query} onChange={(e) => setQuery(e.target.value)}
                placeholder="search..."
                className="bg-transparent text-xs outline-none w-28 font-mono text-neutral-200"
              />
            </div>
          </div>

          <div className="space-y-2">
            {filtered.length === 0 ? (
              <div className="text-center py-10 text-neutral-600 text-sm font-mono">no tasks found here.</div>
            ) : (
              filtered.map((t) => (
                <TaskItem key={t.id} task={t} onToggleStatus={handleToggleStatus} onDelete={handleDelete} onEdit={handleEdit} />
              ))
            )}
          </div>
        </div>

        {/* Commit graph */}
        <div className="rounded-3xl border border-neutral-800 bg-neutral-900/60 shadow-2xl p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-7 h-7 rounded-lg bg-orange-500/20 flex items-center justify-center">
              <Activity size={14} className="text-orange-400" />
            </div>
            <span className="text-xs font-mono font-semibold tracking-widest text-neutral-400 uppercase">Task Commit Graph</span>
          </div>

          <div className="flex gap-1 overflow-x-auto pb-1">
            <div className="flex flex-col gap-1 mr-1 shrink-0">
              {["", "Mon", "", "Wed", "", "Fri", ""].map((d, i) => (
                <div key={i} style={{ height: 14 }} className="text-[10px] font-mono text-neutral-600 leading-[14px]">{d}</div>
              ))}
            </div>
            {heatmapWeeks.map((week, wi) => (
              <div key={wi} className="flex flex-col gap-1 shrink-0">
                {week.map((d, di) => (
                  <div
                    key={di}
                    title={d ? `${d.date}: ${d.count} tasks` : ""}
                    style={{ ...cellStyle, backgroundColor: heatColor(d ? d.count : null) }}
                  />
                ))}
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2 mt-4 text-xs font-mono text-neutral-600">
            <span>Less</span>
            <div style={{ ...cellStyle, backgroundColor: "#262626" }} />
            <div style={{ ...cellStyle, backgroundColor: "#7c2d12" }} />
            <div style={{ ...cellStyle, backgroundColor: "#c2410c" }} />
            <div style={{ ...cellStyle, backgroundColor: "#f97316" }} />
            <div style={{ ...cellStyle, backgroundColor: "#fdba74" }} />
            <span>More</span>
          </div>
        </div>

        {/* Priority mix */}
        <div className="rounded-3xl border border-neutral-800 bg-neutral-900/60 shadow-2xl p-6">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-7 h-7 rounded-lg bg-orange-500/20 flex items-center justify-center">
              <Tag size={14} className="text-orange-400" />
            </div>
            <span className="text-xs font-mono font-semibold tracking-widest text-neutral-400 uppercase">Priority Mix</span>
          </div>
          <p className="text-xs text-neutral-500 mb-4 mt-1">How your tasks are split by urgency — spot overload at a glance.</p>
          <div className="space-y-4">
            {PRIORITIES.map((p) => {
              const count = tasks.filter((t) => t.priority === p).length;
              const pct = total ? Math.round((count / total) * 100) : 0;
              return (
                <div key={p}>
                  <div className="flex justify-between text-xs font-mono text-neutral-400 mb-1.5">
                    <span>{p}</span><span className="text-neutral-200 font-semibold">{count}</span>
                  </div>
                  <div className="h-2 bg-neutral-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${p === "High" ? "bg-gradient-to-r from-orange-600 to-orange-400" : p === "Medium" ? "bg-gradient-to-r from-amber-500 to-amber-300" : "bg-neutral-500"}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}

export default Dashboard;
