"use client";

import { useEffect, useState, useTransition, useRef } from "react";
import { Header } from "@/components/shell/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  User, Lock, Globe, Chrome, Sliders,
  Plus, Trash2, Loader2, Check, AlertTriangle,
  ToggleLeft, ToggleRight, ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";
import {
  updateProfile,
  updatePassword,
  deleteAccount,
  updatePreferences,
  addTrackedSite,
  removeTrackedSite,
  toggleTrackedSite,
} from "@/app/actions/settings";

// ─── Types ────────────────────────────────────────────────────────────────────

interface SettingsData {
  email: string;
  profile: { username: string; bio: string | null; avatarUrl: string | null } | null;
  prefs: { theme: string; defaultMediaType: string; autoProgress: boolean; notifications: boolean };
  sites: { id: string; domain: string; label: string | null; enabled: boolean }[];
}

// ─── Shared section wrapper ────────────────────────────────────────────────────

function Section({
  icon: Icon, title, description, children,
}: {
  icon: React.ElementType; title: string; description?: string; children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="px-5 py-4 border-b border-border">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <Icon className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h2 className="text-sm font-semibold">{title}</h2>
            {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
          </div>
        </div>
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}

// ─── Inline feedback ──────────────────────────────────────────────────────────

function Feedback({ result }: { result: { success?: boolean; error?: string } | null }) {
  if (!result) return null;
  return (
    <p className={cn(
      "text-sm rounded-lg px-3 py-2 mt-3",
      result.success
        ? "bg-green-500/10 text-green-600 dark:text-green-400"
        : "bg-destructive/10 text-destructive"
    )}>
      {result.success ? "✓ Saved successfully." : result.error}
    </p>
  );
}

// ─── Profile section ──────────────────────────────────────────────────────────

function ProfileSection({ profile }: { profile: SettingsData["profile"] }) {
  const [result, setResult] = useState<{ success?: boolean; error?: string } | null>(null);
  const [isPending, start]  = useTransition();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setResult(null);
    const fd = new FormData(e.currentTarget);
    start(async () => { setResult(await updateProfile(fd)); });
  }

  return (
    <Section icon={User} title="Profile" description="Your public identity on Chroniq">
      <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
        <div className="space-y-1.5">
          <Label htmlFor="username">Username</Label>
          <Input
            id="username" name="username"
            defaultValue={profile?.username ?? ""}
            placeholder="yourname" minLength={3} maxLength={30} required
            disabled={isPending}
          />
          <p className="text-xs text-muted-foreground">Letters, numbers and underscores only.</p>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="bio">Bio</Label>
          <textarea
            id="bio" name="bio"
            defaultValue={profile?.bio ?? ""}
            placeholder="Tell people a little about yourself..."
            rows={3}
            maxLength={200}
            disabled={isPending}
            className="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none disabled:opacity-50 transition-colors"
          />
        </div>
        <Button type="submit" size="sm" disabled={isPending}>
          {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
          Save Profile
        </Button>
        <Feedback result={result} />
      </form>
    </Section>
  );
}

// ─── Account section ──────────────────────────────────────────────────────────

function AccountSection({ email }: { email: string }) {
  const [pwResult, setPwResult] = useState<{ success?: boolean; error?: string } | null>(null);
  const [isPending, start]      = useTransition();
  const [showDelete, setShowDelete] = useState(false);
  const [deleting, startDelete]    = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  async function handlePassword(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPwResult(null);
    const fd = new FormData(e.currentTarget);
    start(async () => {
      const r = await updatePassword(fd);
      setPwResult(r);
      if (r.success) formRef.current?.reset();
    });
  }

  return (
    <Section icon={Lock} title="Account" description="Manage your login credentials">
      <div className="space-y-6 max-w-md">
        {/* Email (read-only) */}
        <div className="space-y-1.5">
          <Label>Email</Label>
          <Input value={email} disabled readOnly className="bg-muted/30 cursor-not-allowed" />
          <p className="text-xs text-muted-foreground">Email changes are not yet supported.</p>
        </div>

        {/* Change password */}
        <form ref={formRef} onSubmit={handlePassword} className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="newPassword">New Password</Label>
            <Input
              id="newPassword" name="newPassword" type="password"
              placeholder="Min. 8 characters" minLength={8} required
              disabled={isPending}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword" name="confirmPassword" type="password"
              placeholder="Repeat new password" required
              disabled={isPending}
            />
          </div>
          <Button type="submit" size="sm" variant="outline" disabled={isPending}>
            {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            Change Password
          </Button>
          <Feedback result={pwResult} />
        </form>

        {/* Delete account */}
        <div className="pt-2 border-t border-border">
          <p className="text-sm font-medium text-destructive mb-2">Danger Zone</p>
          {!showDelete ? (
            <Button
              variant="outline"
              size="sm"
              className="border-destructive/40 text-destructive hover:bg-destructive/10 hover:border-destructive"
              onClick={() => setShowDelete(true)}
            >
              <AlertTriangle className="h-3.5 w-3.5" />
              Delete Account
            </Button>
          ) : (
            <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 space-y-3">
              <p className="text-sm text-destructive font-medium">
                This will permanently delete your account and all data. This cannot be undone.
              </p>
              <div className="flex gap-2">
                <Button
                  variant="destructive"
                  size="sm"
                  disabled={deleting}
                  onClick={() => startDelete(async () => { await deleteAccount(); })}
                >
                  {deleting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  Yes, delete everything
                </Button>
                <Button variant="outline" size="sm" onClick={() => setShowDelete(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Section>
  );
}

// ─── Tracked Sites section ────────────────────────────────────────────────────

function TrackedSitesSection({
  sites: initialSites,
}: {
  sites: SettingsData["sites"];
}) {
  const [sites, setSites]   = useState(initialSites);
  const [addResult, setAddResult] = useState<{ success?: boolean; error?: string } | null>(null);
  const [isPending, start]  = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setAddResult(null);
    const fd = new FormData(e.currentTarget);
    start(async () => {
      const r = await addTrackedSite(fd);
      setAddResult(r);
      if (r.success) {
        // Re-fetch sites list
        const res  = await fetch("/api/settings");
        const data = await res.json();
        setSites(data.sites ?? []);
        if (inputRef.current) inputRef.current.value = "";
      }
    });
  }

  async function handleRemove(id: string) {
    start(async () => {
      await removeTrackedSite(id);
      setSites((prev) => prev.filter((s) => s.id !== id));
    });
  }

  async function handleToggle(id: string, enabled: boolean) {
    setSites((prev) => prev.map((s) => (s.id === id ? { ...s, enabled } : s)));
    start(async () => { await toggleTrackedSite(id, enabled); });
  }

  return (
    <Section
      icon={Globe}
      title="Tracked Sites"
      description="The browser extension only logs activity on these sites"
    >
      <div className="space-y-4">
        {/* Site list */}
        <div className="rounded-lg border border-border divide-y divide-border overflow-hidden">
          {sites.length === 0 && (
            <p className="px-4 py-3 text-sm text-muted-foreground">No sites tracked yet.</p>
          )}
          {sites.map((site) => (
            <div key={site.id} className="flex items-center gap-3 px-4 py-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{site.domain}</p>
                {site.label && site.label !== site.domain && (
                  <p className="text-xs text-muted-foreground">{site.label}</p>
                )}
              </div>
              {/* Toggle */}
              <button
                onClick={() => handleToggle(site.id, !site.enabled)}
                className={cn(
                  "shrink-0 transition-colors",
                  site.enabled ? "text-primary" : "text-muted-foreground"
                )}
                aria-label={site.enabled ? "Disable tracking" : "Enable tracking"}
              >
                {site.enabled
                  ? <ToggleRight className="h-5 w-5" />
                  : <ToggleLeft  className="h-5 w-5" />}
              </button>
              {/* Remove */}
              <button
                onClick={() => handleRemove(site.id)}
                className="shrink-0 h-7 w-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                aria-label="Remove site"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>

        {/* Add site form */}
        <form onSubmit={handleAdd} className="flex gap-2">
          <Input
            ref={inputRef}
            name="domain"
            placeholder="e.g. crunchyroll.com"
            className="h-9 text-sm"
            disabled={isPending}
          />
          <Button type="submit" size="sm" disabled={isPending} className="shrink-0">
            {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
            Add Site
          </Button>
        </form>
        <Feedback result={addResult} />
      </div>
    </Section>
  );
}

// ─── Extension section ────────────────────────────────────────────────────────

function ExtensionSection() {
  return (
    <Section icon={Chrome} title="Browser Extension" description="Sync your watch activity automatically">
      <div className="space-y-4 max-w-md">
        <div className="rounded-lg border border-border bg-muted/30 p-4 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium">Connection Status</p>
            <p className="text-xs text-muted-foreground mt-0.5">Extension not installed</p>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="h-2 w-2 rounded-full bg-muted-foreground" />
            <span className="text-xs text-muted-foreground">Not connected</span>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-sm text-muted-foreground leading-relaxed">
            Install the Chroniq browser extension to automatically log episodes
            from whitelisted streaming sites.
          </p>
          <Button variant="outline" size="sm" asChild>
            <a href="#" target="_blank" rel="noopener noreferrer">
              <Chrome className="h-3.5 w-3.5" />
              Install for Chrome
              <ExternalLink className="h-3 w-3 opacity-60" />
            </a>
          </Button>
        </div>

        <div className="rounded-lg border border-border p-3 space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Last synced</span>
            <span>Never</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Extension version</span>
            <span>—</span>
          </div>
        </div>
      </div>
    </Section>
  );
}

// ─── Preferences section ──────────────────────────────────────────────────────

function PreferencesSection({ prefs }: { prefs: SettingsData["prefs"] }) {
  const { setTheme } = useTheme();
  const [result, setResult]   = useState<{ success?: boolean; error?: string } | null>(null);
  const [isPending, start]    = useTransition();
  const [localTheme, setLocalTheme]       = useState(prefs.theme);
  const [localMedia, setLocalMedia]       = useState(prefs.defaultMediaType);
  const [localAuto, setLocalAuto]         = useState(prefs.autoProgress);
  const [localNotifs, setLocalNotifs]     = useState(prefs.notifications);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setResult(null);
    const fd = new FormData(e.currentTarget);
    start(async () => {
      const r = await updatePreferences(fd);
      setResult(r);
      if (r.success) setTheme(localTheme);
    });
  }

  const themeOptions = [
    { value: "light",  label: "Light" },
    { value: "dark",   label: "Dark" },
    { value: "system", label: "System" },
  ];

  const mediaOptions = [
    { value: "anime",  label: "Anime" },
    { value: "movies", label: "Movies" },
    { value: "manga",  label: "Manga" },
  ];

  return (
    <Section icon={Sliders} title="Preferences" description="Customize your Chroniq experience">
      <form onSubmit={handleSubmit} className="space-y-5 max-w-md">
        {/* Theme */}
        <div className="space-y-2">
          <Label>Theme</Label>
          <div className="flex gap-2">
            {themeOptions.map(({ value, label }) => (
              <button
                key={value}
                type="button"
                onClick={() => setLocalTheme(value)}
                className={cn(
                  "flex-1 rounded-lg border py-2 text-sm font-medium transition-colors",
                  localTheme === value
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-card text-muted-foreground hover:text-foreground"
                )}
              >
                {label}
              </button>
            ))}
          </div>
          <input type="hidden" name="theme" value={localTheme} />
        </div>

        {/* Default media type */}
        <div className="space-y-2">
          <Label>Default Media Type</Label>
          <div className="flex gap-2">
            {mediaOptions.map(({ value, label }) => (
              <button
                key={value}
                type="button"
                onClick={() => setLocalMedia(value)}
                className={cn(
                  "flex-1 rounded-lg border py-2 text-sm font-medium transition-colors",
                  localMedia === value
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-card text-muted-foreground hover:text-foreground"
                )}
              >
                {label}
              </button>
            ))}
          </div>
          <input type="hidden" name="defaultMediaType" value={localMedia} />
        </div>

        {/* Toggles */}
        <div className="space-y-3">
          {[
            {
              id: "autoProgress", label: "Auto Progress",
              desc: "Automatically increment progress when you log an episode",
              value: localAuto, setter: setLocalAuto,
            },
            {
              id: "notifications", label: "Notifications",
              desc: "Get notified when airing anime you follow release new episodes",
              value: localNotifs, setter: setLocalNotifs,
            },
          ].map(({ id, label, desc, value, setter }) => (
            <div key={id} className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium">{label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
              </div>
              <button
                type="button"
                onClick={() => setter(!value)}
                className={cn("shrink-0 mt-0.5 transition-colors", value ? "text-primary" : "text-muted-foreground")}
                aria-pressed={value}
                aria-label={label}
              >
                {value ? <ToggleRight className="h-6 w-6" /> : <ToggleLeft className="h-6 w-6" />}
              </button>
              <input type="hidden" name={id} value={String(value)} />
            </div>
          ))}
        </div>

        <Button type="submit" size="sm" disabled={isPending}>
          {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
          Save Preferences
        </Button>
        <Feedback result={result} />
      </form>
    </Section>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const [data, setData]     = useState<SettingsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="flex flex-col min-h-full">
      <Header title="Settings" />

      <main className="flex-1 pb-24 md:pb-8">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-5">
          {loading ? (
            <div className="flex items-center justify-center py-32">
              <Loader2 className="h-7 w-7 animate-spin text-muted-foreground" />
            </div>
          ) : !data ? (
            <p className="text-center text-muted-foreground py-16">Failed to load settings.</p>
          ) : (
            <>
              <ProfileSection    profile={data.profile} />
              <AccountSection    email={data.email ?? ""} />
              <TrackedSitesSection sites={data.sites} />
              <ExtensionSection />
              <PreferencesSection prefs={data.prefs} />
            </>
          )}
        </div>
      </main>
    </div>
  );
}
