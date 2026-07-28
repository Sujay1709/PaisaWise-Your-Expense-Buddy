import { useCallback, useState } from "react";
import { LogOut, Settings } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  changePassword,
  updateProfile,
  type AuthUser,
} from "@/lib/api";

export function UserMenu({
  user,
  onUserChange,
  onSignOut,
}: {
  user: AuthUser;
  onUserChange: (u: AuthUser) => void;
  onSignOut: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const initials = user.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <>
      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="flex items-center gap-2 rounded-full pr-1 transition-colors hover:bg-accent"
        >
          <div
            className="flex size-8 items-center justify-center rounded-full text-xs font-bold text-white"
            style={{ backgroundColor: user.avatarColor }}
          >
            {initials}
          </div>
          <span className="hidden pr-2 text-sm font-medium text-foreground sm:block">
            {user.name}
          </span>
        </button>

        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <div className="absolute right-0 top-full z-50 mt-2 w-56 rounded-xl border bg-card p-1.5 shadow-warm">
              <div className="mb-1 border-b px-3 py-2">
                <p className="text-sm font-semibold text-foreground">{user.name}</p>
                <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                {user.bio && (
                  <p className="mt-1 text-xs italic text-muted-foreground">{user.bio}</p>
                )}
              </div>

              <button
                type="button"
                onClick={() => { setOpen(false); setShowSettings(true); }}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-foreground transition-colors hover:bg-accent"
              >
                <Settings className="size-4" />
                Profile &amp; Settings
              </button>

              <button
                type="button"
                onClick={() => { setOpen(false); onSignOut(); }}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-destructive transition-colors hover:bg-destructive/10"
              >
                <LogOut className="size-4" />
                Sign out
              </button>
            </div>
          </>
        )}
      </div>

      {showSettings && (
        <ProfileSettings
          user={user}
          onClose={() => setShowSettings(false)}
          onUpdated={onUserChange}
        />
      )}
    </>
  );
}

function ProfileSettings({
  user,
  onClose,
  onUpdated,
}: {
  user: AuthUser;
  onClose: () => void;
  onUpdated: (u: AuthUser) => void;
}) {
  const [name, setName] = useState(user.name);
  const [bio, setBio] = useState(user.bio);
  const [gender, setGender] = useState(user.gender);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  const [oldPw, setOldPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [pwMsg, setPwMsg] = useState("");
  const [pwSaving, setPwSaving] = useState(false);

  const handleSaveProfile = useCallback(async () => {
    setSaving(true);
    setMsg("");
    const result = await updateProfile({ name: name.trim(), bio, gender });
    setSaving(false);

    if (!result.ok) {
      setMsg(result.error);
      return;
    }
    onUpdated(result.data.user);
    setMsg("Saved!");
    setTimeout(() => setMsg(""), 2000);
  }, [name, bio, gender, onUpdated]);

  const handleChangePassword = useCallback(async () => {
    setPwSaving(true);
    setPwMsg("");
    const result = await changePassword(oldPw, newPw);
    setPwSaving(false);

    if (!result.ok) {
      setPwMsg(result.error);
      return;
    }
    setPwMsg("Password changed! Other devices signed out.");
    setOldPw("");
    setNewPw("");
    setTimeout(() => setPwMsg(""), 3000);
  }, [oldPw, newPw]);

  const initials = (name || user.name)
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl border bg-card p-6 shadow-warm">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-display text-xl font-extrabold">Profile &amp; Settings</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-accent"
          >
            ✕
          </button>
        </div>

        <div className="mb-6 flex items-center gap-4">
          <div
            className="flex size-16 items-center justify-center rounded-full text-xl font-bold text-white"
            style={{ backgroundColor: user.avatarColor }}
          >
            {initials}
          </div>
          <div>
            <p className="font-semibold text-foreground">{name || user.name}</p>
            <p className="text-sm text-muted-foreground">{user.email}</p>
            <p className="text-xs text-muted-foreground">
              Member since{" "}
              {new Date(user.createdAt).toLocaleDateString("en-IN", {
                month: "short",
                year: "numeric",
              })}
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={80}
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">Bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="CS student at ASU, budgeting my way through college..."
              maxLength={200}
              rows={2}
              className="w-full resize-none rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
            />
            <p className="mt-0.5 text-xs text-muted-foreground">{bio.length}/200</p>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">Gender</label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
            >
              <option value="">Prefer not to say</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="non-binary">Non-binary</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <Button onClick={handleSaveProfile} disabled={saving} size="sm">
              {saving ? "Saving..." : "Save profile"}
            </Button>
            {msg && (
              <span className={`text-sm ${msg === "Saved!" ? "text-mint" : "text-destructive"}`}>
                {msg}
              </span>
            )}
          </div>
        </div>

        <div className="mt-6 space-y-4 border-t pt-6">
          <h3 className="font-display text-sm font-bold uppercase tracking-widest text-muted-foreground">
            Change Password
          </h3>
          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">
              Current password
            </label>
            <input
              type="password"
              value={oldPw}
              onChange={(e) => setOldPw(e.target.value)}
              autoComplete="current-password"
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">
              New password
            </label>
            <input
              type="password"
              value={newPw}
              onChange={(e) => setNewPw(e.target.value)}
              placeholder="At least 8 characters"
              autoComplete="new-password"
              minLength={8}
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
            />
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={handleChangePassword}
              disabled={pwSaving || !oldPw || newPw.length < 8}
              size="sm"
              variant="outline"
            >
              {pwSaving ? "Changing..." : "Change password"}
            </Button>
            {pwMsg && (
              <span
                className={`text-sm ${pwMsg.startsWith("Password changed") ? "text-mint" : "text-destructive"}`}
              >
                {pwMsg}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
