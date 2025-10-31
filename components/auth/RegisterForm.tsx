"use client";
import { useState } from "react";

export default function RegisterForm() {
  const [form, setForm] = useState({ name: "", email: "", password: "", phone: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error desconocido");
      setSuccess(true);
      setForm({ name: "", email: "", password: "", phone: "" });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto">
      <input
        type="text"
        placeholder="Nombre"
        value={form.name}
        onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
        required
        className="w-full border px-3 py-2 rounded"
      />
      <input
        type="email"
        placeholder="Email"
        value={form.email}
        onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
        required
        className="w-full border px-3 py-2 rounded"
      />
      <input
        type="password"
        placeholder="Contraseña"
        value={form.password}
        onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
        required
        className="w-full border px-3 py-2 rounded"
      />
      <input
        type="text"
        placeholder="Teléfono (opcional)"
        value={form.phone}
        onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
        className="w-full border px-3 py-2 rounded"
      />
      <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-2 rounded">
        {loading ? "Registrando..." : "Registrarse"}
      </button>
      {error && <div className="text-red-600">{error}</div>}
  {success && <div className="text-green-600">¡Registro exitoso!</div>}
    </form>
  );
}
