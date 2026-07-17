"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Users, Mail, Smartphone, Monitor, Clock, Download,
  CheckCircle, Calendar, X, ChevronDown, RefreshCw,
  Plus, Trash2, ArrowLeft,
} from "lucide-react";

type Status = "new" | "contacted" | "scheduled" | "completed" | "declined";

interface Participant {
  id: string;
  name: string;
  email: string;
  available: string;
  device: string;
  status: Status;
  notes: string | null;
  contactedAt: string | null;
  scheduledAt: string | null;
  createdAt: string;
}

const STATUS_CONFIG: Record<Status, { label: string; color: string }> = {
  new:       { label: "New",       color: "bg-blue-100 text-blue-800" },
  contacted: { label: "Contacted", color: "bg-yellow-100 text-yellow-800" },
  scheduled: { label: "Scheduled", color: "bg-green-100 text-green-800" },
  completed: { label: "Completed", color: "bg-gray-100 text-gray-800" },
  declined:  { label: "Declined",  color: "bg-red-100 text-red-800" },
};

function DeviceIcon({ device }: { device: string }) {
  if (device === "mobile") return <Smartphone className="w-4 h-4 text-indigo-500" />;
  if (device === "desktop") return <Monitor className="w-4 h-4 text-slate-500" />;
  return (
    <span className="flex gap-0.5">
      <Smartphone className="w-3 h-3 text-indigo-500" />
      <Monitor className="w-3 h-3 text-slate-500" />
    </span>
  );
}

export default function UxParticipantsPage() {
  const router = useRouter();
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [editingNotes, setEditingNotes] = useState<string | null>(null);
  const [notesDraft, setNotesDraft] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [addForm, setAddForm] = useState({ name: "", email: "", available: "evenings", device: "mobile" });
  const [saving, setSaving] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/ux-participants?status=${filter}`);
      if (res.status === 401) { router.push("/admin"); return; }
      const data = await res.json();
      setParticipants(data.participants ?? []);
    } finally {
      setLoading(false);
    }
  }, [filter, router]);

  useEffect(() => { load(); }, [load]);

  async function updateStatus(id: string, status: Status) {
    setSaving(id);
    await fetch(`/api/admin/ux-participants/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setSaving(null);
    load();
  }

  async function saveNotes(id: string) {
    setSaving(id);
    await fetch(`/api/admin/ux-participants/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notes: notesDraft }),
    });
    setSaving(null);
    setEditingNotes(null);
    load();
  }

  async function deleteParticipant(id: string) {
    if (!confirm("Remove this participant?")) return;
    await fetch(`/api/admin/ux-participants/${id}`, { method: "DELETE" });
    load();
  }

  async function addParticipant() {
    if (!addForm.name || !addForm.email) return;
    setSaving("add");
    const res = await fetch("/api/admin/ux-participants", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(addForm),
    });
    setSaving(null);
    if (res.ok) {
      setAddOpen(false);
      setAddForm({ name: "", email: "", available: "evenings", device: "mobile" });
      load();
    }
  }

  function exportCsv() {
    const header = "Name,Email,Available,Device,Status,Signed Up,Contacted,Scheduled,Notes";
    const rows = participants.map(p =>
      [
        `"${p.name}"`,
        p.email,
        p.available,
        p.device,
        p.status,
        new Date(p.createdAt).toLocaleDateString(),
        p.contactedAt ? new Date(p.contactedAt).toLocaleDateString() : "",
        p.scheduledAt ? new Date(p.scheduledAt).toLocaleDateString() : "",
        `"${(p.notes ?? "").replace(/"/g, '""')}"`,
      ].join(",")
    );
    const csv = [header, ...rows].join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const a = document.createElement("a"); a.href = url; a.download = "ux-participants.csv"; a.click();
    URL.revokeObjectURL(url);
  }

  const counts = participants.reduce<Record<string, number>>((acc, p) => {
    acc[p.status] = (acc[p.status] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => router.push("/admin")}
            aria-label="Back to admin dashboard"
            className="p-2 rounded-lg hover:bg-gray-200 motion-safe:transition-colors"
          >
            <ArrowLeft aria-hidden="true" className="w-5 h-5 text-gray-600" />
          </button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">UX Study Participants</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Manage testers who signed up for usability sessions
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={load}
              className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-600 border rounded-lg hover:bg-gray-100 motion-safe:transition-colors"
            >
              <RefreshCw aria-hidden="true" className="w-4 h-4" />
              Refresh
            </button>
            <button
              onClick={exportCsv}
              className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-600 border rounded-lg hover:bg-gray-100 motion-safe:transition-colors"
            >
              <Download aria-hidden="true" className="w-4 h-4" />
              Export CSV
            </button>
            <button
              onClick={() => setAddOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 motion-safe:transition-colors"
            >
              <Plus aria-hidden="true" className="w-4 h-4" />
              Add manually
            </button>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-5 gap-3 mb-6">
          {(["all", "new", "contacted", "scheduled", "completed"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`rounded-xl p-4 text-left border motion-safe:transition-all ${
                filter === s ? "border-indigo-400 bg-indigo-50" : "border-gray-200 bg-white hover:border-gray-300"
              }`}
            >
              <div className="text-2xl font-bold text-gray-900">
                {s === "all" ? participants.length : (counts[s] ?? 0)}
              </div>
              <div className="text-xs text-gray-500 mt-0.5 capitalize">{s === "all" ? "Total" : s}</div>
            </button>
          ))}
        </div>

        {/* Add modal */}
        {addOpen && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
              <h2 className="text-lg font-semibold mb-4">Add participant manually</h2>
              <div className="space-y-3">
                <input
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  placeholder="Full name"
                  value={addForm.name}
                  onChange={e => setAddForm(f => ({ ...f, name: e.target.value }))}
                />
                <input
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  placeholder="Email address"
                  type="email"
                  value={addForm.email}
                  onChange={e => setAddForm(f => ({ ...f, email: e.target.value }))}
                />
                <select
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  value={addForm.available}
                  onChange={e => setAddForm(f => ({ ...f, available: e.target.value }))}
                >
                  <option value="mornings">Mornings</option>
                  <option value="evenings">Evenings</option>
                  <option value="weekends">Weekends</option>
                </select>
                <select
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  value={addForm.device}
                  onChange={e => setAddForm(f => ({ ...f, device: e.target.value }))}
                >
                  <option value="mobile">Mobile</option>
                  <option value="desktop">Desktop</option>
                  <option value="both">Both</option>
                </select>
              </div>
              <div className="flex gap-2 mt-5">
                <button
                  onClick={() => setAddOpen(false)}
                  className="flex-1 py-2 border rounded-lg text-sm text-gray-600 hover:bg-gray-50 motion-safe:transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={addParticipant}
                  disabled={saving === "add"}
                  className="flex-1 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 motion-safe:transition-colors disabled:opacity-50"
                >
                  {saving === "add" ? "Saving…" : "Add"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-gray-400 text-sm">Loading…</div>
          ) : participants.length === 0 ? (
            <div className="p-12 text-center">
              <Users aria-hidden="true" className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">No participants yet</p>
              <p className="text-gray-400 text-xs mt-1">
                Share <code className="bg-gray-100 px-1 rounded">/ux-study</code> to collect signups
              </p>
            </div>
          ) : (
            <table className="w-full text-sm" aria-label="UX study participants">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th scope="col" className="text-left px-4 py-3 font-medium text-gray-600">Participant</th>
                  <th scope="col" className="text-left px-4 py-3 font-medium text-gray-600">Available</th>
                  <th scope="col" className="text-left px-4 py-3 font-medium text-gray-600">Device</th>
                  <th scope="col" className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                  <th scope="col" className="text-left px-4 py-3 font-medium text-gray-600">Signed up</th>
                  <th scope="col" className="text-left px-4 py-3 font-medium text-gray-600">Notes</th>
                  <th scope="col" className="px-4 py-3"><span className="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {participants.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50 motion-safe:transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">{p.name}</div>
                      <a
                        href={`mailto:${p.email}`}
                        className="text-xs text-indigo-600 hover:underline flex items-center gap-1 mt-0.5"
                      >
                        <Mail className="w-3 h-3" />
                        {p.email}
                      </a>
                    </td>
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-1 text-gray-600">
                        <Clock className="w-3.5 h-3.5" />
                        <span className="capitalize">{p.available}</span>
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-1.5 text-gray-600 capitalize">
                        <DeviceIcon device={p.device} />
                        {p.device}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="relative">
                        <select
                          value={p.status}
                          disabled={saving === p.id}
                          onChange={e => updateStatus(p.id, e.target.value as Status)}
                          className={`appearance-none pl-2 pr-6 py-1 rounded-full text-xs font-medium border-0 cursor-pointer ${STATUS_CONFIG[p.status].color} focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-400`}
                        >
                          {(Object.keys(STATUS_CONFIG) as Status[]).map(s => (
                            <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none text-current opacity-60" />
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {new Date(p.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </td>
                    <td className="px-4 py-3 max-w-xs">
                      {editingNotes === p.id ? (
                        <div className="flex gap-1">
                          <input
                            autoFocus
                            className="flex-1 border rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-400"
                            value={notesDraft}
                            onChange={e => setNotesDraft(e.target.value)}
                            onKeyDown={e => { if (e.key === "Enter") saveNotes(p.id); if (e.key === "Escape") setEditingNotes(null); }}
                          />
                          <button onClick={() => saveNotes(p.id)} aria-label="Save note" className="text-green-600 hover:text-green-700">
                            <CheckCircle aria-hidden="true" className="w-4 h-4" />
                          </button>
                          <button onClick={() => setEditingNotes(null)} aria-label="Cancel editing" className="text-gray-400 hover:text-gray-600">
                            <X aria-hidden="true" className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => { setEditingNotes(p.id); setNotesDraft(p.notes ?? ""); }}
                          className="text-xs text-gray-500 hover:text-gray-900 truncate max-w-[160px] block text-left"
                        >
                          {p.notes || <span className="text-gray-300 italic">Add note…</span>}
                        </button>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <a
                          href={`mailto:${p.email}?subject=ReviewIQ%20UX%20Study%20Session&body=Hi%20${encodeURIComponent(p.name.split(" ")[0])}%2C%0A%0AThank%20you%20for%20signing%20up%20to%20test%20ReviewIQ!%20I%27d%20love%20to%20schedule%20a%2030-minute%20usability%20session%20with%20you.%0A%0AWhen%20works%20best%20for%20you%3F%0A%0ABest%2C%0ADaniel`}
                          onClick={() => p.status === "new" && updateStatus(p.id, "contacted")}
                          aria-label={`Send scheduling email to ${p.name}`}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 motion-safe:transition-colors"
                        >
                          <Calendar aria-hidden="true" className="w-4 h-4" />
                        </a>
                        <button
                          onClick={() => deleteParticipant(p.id)}
                          aria-label={`Remove ${p.name}`}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 motion-safe:transition-colors"
                        >
                          <Trash2 aria-hidden="true" className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <p className="mt-4 text-xs text-gray-400 text-center">
          Public signup form: <a href="/ux-study" className="underline hover:text-gray-600">/ux-study</a>
        </p>
      </div>
    </div>
  );
}
