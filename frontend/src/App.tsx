import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import axios, { AxiosError } from "axios";

// ---------- Axios instance with auth ----------
const api = axios.create({ baseURL: "/api" });
api.interceptors.request.use((config) => {
  const t = localStorage.getItem("token");
  if (t) {
    config.headers = config.headers ?? {};
    (config.headers as any).Authorization = `Bearer ${t}`;
  }
  return config;
});

// ---------- Types ----------
interface Job {
  id: string | number;
  title: string;
  company: string;
  url: string;
}
interface User { name: string; }
interface Profile {
  name: string;
  resume: string;          // maps to backend resumeText
  coverLetter: string;     // local-only (not sent to backend)
  email: string;
  phone: string;
  location: string;
  links: string[];         // backend expects array; we edit as textarea/CSV
}
type ProfileId = number | null;

// ---------- Tiny UI ----------
const box: React.CSSProperties = { padding: 16, borderRadius: 12, border: "1px solid #e5e7eb", background: "#ffffff" };
const btn: React.CSSProperties = { padding: "8px 12px", borderRadius: 8, border: "1px solid #e5e7eb", background: "#111827", color: "#fff", cursor: "pointer" };
const btnSecondary: React.CSSProperties = { ...btn, background: "#f9fafb", color: "#111827" };
const input: React.CSSProperties = { width: "100%", padding: 10, borderRadius: 8, border: "1px solid #e5e7eb", fontSize: 14 };
const labelStyle: React.CSSProperties = { display: "block", fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 6 };
const stackY = (gap = 12): React.CSSProperties => ({ display: "grid", gap });

function Loader({ label = "Loading…" }: { label?: string }) {
  return <div role="status" aria-live="polite" style={{ padding: 24 }}>{label}</div>;
}
function ErrorBox({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div role="alert" style={{ ...box, borderColor: "#fecaca", background: "#fef2f2" }}>
      <div style={{ color: "#991b1b", marginBottom: 8, fontWeight: 600 }}>Something went wrong</div>
      <div style={{ color: "#7f1d1d", marginBottom: 12 }}>{message}</div>
      {onRetry && <button style={btn} onClick={onRetry} aria-label="Retry">Retry</button>}
    </div>
  );
}

// ---------- Auth Panel (/api/auth/login + /api/auth/register) ----------
function AuthPanel({ onAuthed }: { onAuthed: (user: User, token: string) => void }) {
  const [username, setUsername] = useState(""); const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false); const [msg, setMsg] = useState<string | null>(null);

  const handle = async (mode: "login" | "register") => {
    try {
      setBusy(true); setMsg(null);
      const { data } = await api.post<{ token?: string; error?: string }>(`/auth/${mode}`, { username, password });
      if (data.error || !data.token) { setMsg(data.error || "Unknown error"); return; }
      localStorage.setItem("token", data.token); localStorage.setItem("username", username);
      onAuthed({ name: username }, data.token);
    } catch (e) {
      const m = (e as AxiosError)?.response?.data || (e as AxiosError)?.message || "Request failed";
      setMsg(typeof m === "string" ? m : "Request failed");
    } finally { setBusy(false); }
  };

  return (
    <section style={box} aria-labelledby="auth-heading">
      <h3 id="auth-heading" style={{ margin: 0, marginBottom: 12 }}>Sign in or Create an account</h3>
      <div style={stackY(12)}>
        <label style={labelStyle} htmlFor="username">Username</label>
        <input id="username" style={input} value={username} onChange={(e) => setUsername(e.target.value)} placeholder="e.g. rlitton" autoComplete="username" />
        <label style={labelStyle} htmlFor="password">Password</label>
        <input id="password" type="password" style={input} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" autoComplete="current-password" />
        {msg ? <div style={{ color: "#991b1b" }}>{msg}</div> : null}
        <div style={{ display: "flex", gap: 8 }}>
          <button style={btn} onClick={() => handle("login")} disabled={busy}>{busy ? "Please wait…" : "Login"}</button>
          <button style={btnSecondary} onClick={() => handle("register")} disabled={busy}>{busy ? "Please wait…" : "Register"}</button>
        </div>
      </div>
    </section>
  );
}

// ---------- Profile Form ----------
function ProfileForm({
  profile, onChange, onSave, saving,
}:{
  profile: Profile; onChange: (p: Profile) => void; onSave: () => Promise<void> | void; saving: boolean;
}) {
  const onField = useCallback(
    (key: keyof Omit<Profile, "links">) =>
      (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
        onChange({ ...profile, [key]: e.target.value }),
    [onChange, profile]
  );

  // Links edited as textarea: one per line or comma separated
  const linksText = profile.links.join("\n");
  const onLinksChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const raw = e.target.value;
    const parts = raw.split(/\r?\n|,/).map(s => s.trim()).filter(Boolean);
    onChange({ ...profile, links: parts });
  };

  const clearAll = () =>
    onChange({ name: "", resume: "", coverLetter: "", email: "", phone: "", location: "", links: [] });

  return (
    <section aria-labelledby="profile-heading" style={box}>
      <h3 id="profile-heading" style={{ marginTop: 0, marginBottom: 12 }}>Edit Profile</h3>
      <div style={stackY(12)}>
        <label style={labelStyle} htmlFor="full-name">Full name</label>
        <input id="full-name" style={input} placeholder="Full name" value={profile.name} onChange={onField("name")} />

        <label style={labelStyle} htmlFor="email">Email</label>
        <input id="email" style={input} placeholder="Email" value={profile.email} onChange={onField("email")} />

        <label style={labelStyle} htmlFor="phone">Phone</label>
        <input id="phone" style={input} placeholder="Phone number" value={profile.phone} onChange={onField("phone")} />

        <label style={labelStyle} htmlFor="location">Location</label>
        <input id="location" style={input} placeholder="City, Country" value={profile.location} onChange={onField("location")} />

        <label style={labelStyle} htmlFor="links">Links (one per line or comma-separated)</label>
        <textarea id="links" style={{ ...input, minHeight: 96, resize: "vertical" }} value={linksText} onChange={onLinksChange} />

        <label style={labelStyle} htmlFor="resume">Resume</label>
        <textarea id="resume" style={{ ...input, minHeight: 120, resize: "vertical" }} placeholder="Paste your resume text" value={profile.resume} onChange={onField("resume")} />

        <label style={labelStyle} htmlFor="cover-letter">Cover letter (local only)</label>
        <textarea id="cover-letter" style={{ ...input, minHeight: 120, resize: "vertical" }} placeholder="Not stored on server" value={profile.coverLetter} onChange={onField("coverLetter")} />

        <div style={{ display: "flex", gap: 8 }}>
          <button style={btn} onClick={onSave} disabled={saving} aria-disabled={saving}>{saving ? "Saving…" : "Save Profile"}</button>
          <button type="button" style={btnSecondary} onClick={clearAll} disabled={saving}>Clear</button>
        </div>
      </div>
    </section>
  );
}

// ---------- Jobs ----------
function JobList({ jobs }: { jobs: Job[] }) {
  if (!jobs.length) return <p style={{ color: "#6b7280" }}>No jobs available right now.</p>;
  return (
    <ul style={stackY(8)}>
      {jobs.map((j) => (
        <li key={j.id} style={{ ...box, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontWeight: 700 }}>{j.title}</div>
            <div style={{ color: "#6b7280" }}>{j.company}</div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <a href={j.url} target="_blank" rel="noreferrer" style={{ ...btnSecondary, display: "inline-block", textDecoration: "none" }}>Open</a>
          </div>
        </li>
      ))}
    </ul>
  );
}

// ---------- Main App ----------
export default function App() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile>({
    name: "", resume: "", coverLetter: "", email: "", phone: "", location: "", links: []
  });
  const [profileId, setProfileId] = useState<ProfileId>(null);
  const [savingProfile, setSavingProfile] = useState(false);

  // Hydrate user from storage (no fetch yet)
  useEffect(() => {
    const token = localStorage.getItem("token");
    const username = localStorage.getItem("username");
    if (token && username) setUser({ name: username });
  }, []);

  // After login, load profile and jobs
  useEffect(() => {
    if (!user) return;
    const controller = new AbortController();
    let mounted = true;

    (async () => {
      try {
        setLoading(true);
        setError(null);

        // Current profile
        try {
          const { data } = await api.get<any>("/profiles/current", { signal: controller.signal });
          if (mounted && data && !data.error) {
            setProfile({
              name: data.name ?? "",
              resume: data.resumeText ?? "",
              coverLetter: "",
              email: data.email ?? "",
              phone: data.phone ?? "",
              location: data.location ?? "",
              links: Array.isArray(data.links) ? data.links.filter((s: any) => typeof s === "string") : [],
            });
            if (typeof data.id === "number") setProfileId(data.id);
          }
        } catch { /* no current profile yet */ }

        // Jobs
        const jobsRes = await api.get<Job[]>("/jobs", { signal: controller.signal });
        if (mounted) setJobs(Array.isArray(jobsRes.data) ? jobsRes.data : []);
      } catch (err) {
        if (!mounted) return;
        const msg = (err as AxiosError)?.message || "Failed to load data";
        setError(msg);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => { mounted = false; controller.abort(); };
  }, [user]);

  // Save profile -> POST or PUT
  const handleProfileSave = useCallback(async () => {
    try {
      setSavingProfile(true);
      const payload = {
        name: profile.name,
        resumeText: profile.resume,
        email: profile.email,
        phone: profile.phone,
        location: profile.location,
        links: profile.links, // array of strings
      };

      if (profileId == null) {
        await api.post("/profiles", payload);
        const { data } = await api.get<any>("/profiles/current");
        if (data && typeof data.id === "number") setProfileId(data.id);
      } else {
        await api.put(`/profiles/${profileId}`, payload);
      }

      alert("Profile saved.");
    } catch (err) {
      const msg = (err as AxiosError)?.response?.data || (err as AxiosError)?.message || "Failed to save profile.";
      alert(typeof msg === "string" ? msg : "Failed to save profile.");
    } finally {
      setSavingProfile(false);
    }
  }, [profile, profileId]);

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    setUser(null);
    setJobs([]);
    setProfile({ name: "", resume: "", coverLetter: "", email: "", phone: "", location: "", links: [] });
    setProfileId(null);
  }, []);

  const header = useMemo(() => (
    <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
      <h1 style={{ margin: 0 }}>JobBot</h1>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        {user ? <span style={{ color: "#6b7280" }}>Welcome, {user.name}</span> : null}
        {user ? <button style={btnSecondary} onClick={logout}>Logout</button> : null}
      </div>
    </header>
  ), [user, logout]);

  if (loading) return <Loader />;
  if (error) return <ErrorBox message={error} onRetry={() => window.location.reload()} />;

  return (
    <div style={{ padding: 24, background: "#f9fafb", minHeight: "100vh" }}>
      {header}

      {!user && (
        <div style={{ marginBottom: 24 }}>
          <AuthPanel onAuthed={(u) => setUser(u)} />
        </div>
      )}

      <main style={stackY(24)}>
        {user ? (
          <>
            <ProfileForm profile={profile} onChange={setProfile} onSave={handleProfileSave} saving={savingProfile} />
            <section aria-labelledby="jobs-heading" style={stackY(12)}>
              <h3 id="jobs-heading" style={{ margin: 0 }}>Available Jobs</h3>
              <JobList jobs={jobs} />
            </section>
          </>
        ) : (
          <p>Please log in to edit your profile and view jobs.</p>
        )}
      </main>
    </div>
  );
}
