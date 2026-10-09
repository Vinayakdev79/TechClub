import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Check,
  Filter,
  MessageSquareText,
  Pencil,
  Send,
  Trash2,
  TriangleAlert,
  X,
} from "lucide-react";
import { DOMAIN_ICONS } from "@/components/ui/icons";
import { Btn, Chip, DataLabel, EmptyState, Panel } from "@/components/ui/primitives";
import { DOMAIN_MAP, DOMAINS } from "@/data/domains";
import { useClubStore } from "@/store/useClubStore";
import type { DomainId, Idea, SortKey } from "@/types";
import { cn } from "@/utils/cn";

const ACTIVITY_MAX = 140;
const ACTIVITY_MIN = 4;
const NOTE_MAX = 400;

type FormValues = {
  domain: DomainId | "general";
  activity: string;
  note: string;
};

type FormErrors = Partial<Record<keyof FormValues, string>>;

const EMPTY: FormValues = { domain: "general", activity: "", note: "" };

function validate(values: FormValues): FormErrors {
  const errors: FormErrors = {};
  const activity = values.activity.trim();
  if (activity.length === 0) errors.activity = "Describe the activity or project you are proposing.";
  else if (activity.length < ACTIVITY_MIN)
    errors.activity = `Use at least ${ACTIVITY_MIN} characters so the idea is clear.`;
  else if (activity.length > ACTIVITY_MAX)
    errors.activity = `Keep it under ${ACTIVITY_MAX} characters.`;
  if (values.note.length > NOTE_MAX) errors.note = `Keep the explanation under ${NOTE_MAX} characters.`;
  return errors;
}

export function IdeasPanel() {
  const ideas = useClubStore((s) => s.ideas);
  const addIdea = useClubStore((s) => s.addIdea);
  const updateIdea = useClubStore((s) => s.updateIdea);
  const removeIdea = useClubStore((s) => s.removeIdea);
  const clearIdeas = useClubStore((s) => s.clearIdeas);
  const editingId = useClubStore((s) => s.editingIdeaId);
  const setEditingId = useClubStore((s) => s.setEditingIdea);
  const domainFilter = useClubStore((s) => s.ideaDomainFilter);
  const setDomainFilter = useClubStore((s) => s.setIdeaDomainFilter);
  const sort = useClubStore((s) => s.ideaSort);
  const setSort = useClubStore((s) => s.setIdeaSort);
  const setActiveDomain = useClubStore((s) => s.setActiveDomain);
  const lastAction = useClubStore((s) => s.lastIdeaAction);

  const [values, setValues] = useState<FormValues>(EMPTY);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState(false);
  const [flash, setFlash] = useState<string | null>(null);

  const editing = ideas.find((i) => i.id === editingId) ?? null;

  /* load an idea into the form when "edit" is pressed */
  useEffect(() => {
    if (editing) {
      setValues({ domain: editing.domain, activity: editing.activity, note: editing.note });
      setErrors({});
      setTouched(false);
    }
  }, [editing]);

  /* transient confirmation message */
  useEffect(() => {
    if (!lastAction) return;
    const msg =
      lastAction.type === "saved"
        ? "Idea saved to this browser."
        : lastAction.type === "updated"
          ? "Idea updated."
          : "Idea removed.";
    setFlash(msg);
    const t = window.setTimeout(() => setFlash(null), 3200);
    return () => window.clearTimeout(t);
  }, [lastAction]);

  const visible = useMemo(() => {
    const filtered =
      domainFilter === "all" ? ideas : ideas.filter((i) => i.domain === domainFilter);
    return [...filtered].sort((a, b) => {
      if (sort === "newest") return b.createdAt - a.createdAt;
      if (sort === "oldest") return a.createdAt - b.createdAt;
      return a.domain.localeCompare(b.domain) || b.createdAt - a.createdAt;
    });
  }, [ideas, domainFilter, sort]);

  const counts = useMemo(() => {
    const map = new Map<string, number>();
    ideas.forEach((i) => map.set(i.domain, (map.get(i.domain) ?? 0) + 1));
    return map;
  }, [ideas]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const nextErrors = validate(values);
    setErrors(nextErrors);
    setTouched(true);
    if (Object.keys(nextErrors).length > 0) return;

    const payload = {
      domain: values.domain,
      activity: values.activity.trim(),
      note: values.note.trim(),
    };
    if (editing) updateIdea(editing.id, payload);
    else addIdea(payload);
    setValues(EMPTY);
    setTouched(false);
  }

  function startEdit(idea: Idea) {
    setEditingId(idea.id);
    document.getElementById("idea-form-top")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function cancelEdit() {
    setEditingId(null);
    setValues(EMPTY);
    setErrors({});
    setTouched(false);
  }

  return (
    <div className="space-y-3">
      <div className="flex items-start gap-2.5 border border-cyan/25 bg-cyan/6 p-3">
        <TriangleAlert size={15} className="mt-0.5 shrink-0 text-cyan" />
        <p className="text-[11.5px] leading-relaxed text-mute">
          <strong className="text-ice">Local demo console.</strong> Ideas are stored in this
          browser's localStorage only. Nothing is uploaded, shared with other students, or delivered
          to the candidate.
        </p>
      </div>

      <AnimatePresence>
        {flash && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="flex items-center gap-2 border border-mint/45 bg-mint/10 px-3 py-2 text-[12px] text-mint"
            role="status"
          >
            <Check size={14} /> {flash}
          </motion.div>
        )}
      </AnimatePresence>

      <span id="idea-form-top" />
      <Panel
        kicker="Module 05 — Idea Console"
        title={editing ? "Edit your saved idea" : "Propose an activity or project"}
        icon={<MessageSquareText size={16} />}
        accent="#2ce8ff"
        actions={
          editing ? (
            <Btn size="sm" variant="ghost" onClick={cancelEdit}>
              <X size={12} /> Cancel
            </Btn>
          ) : undefined
        }
      >
        <form onSubmit={submit} noValidate className="space-y-4">
          <fieldset>
            <legend className="mb-2 font-display text-[10px] tracking-[0.24em] text-mute uppercase">
              Technology domain
            </legend>
            <div className="flex flex-wrap gap-1.5">
              <Chip
                active={values.domain === "general"}
                onClick={() => setValues({ ...values, domain: "general" })}
              >
                General
              </Chip>
              {DOMAINS.map((d) => {
                const Icon = DOMAIN_ICONS[d.icon];
                return (
                  <Chip
                    key={d.id}
                    active={values.domain === d.id}
                    color={d.color}
                    onClick={() => setValues({ ...values, domain: d.id })}
                  >
                    <Icon size={12} /> {d.name}
                  </Chip>
                );
              })}
            </div>
          </fieldset>

          <div>
            <div className="mb-1.5 flex items-baseline justify-between">
              <label htmlFor="idea-activity" className="font-display text-[10px] tracking-[0.24em] text-mute uppercase">
                Suggested activity or project *
              </label>
              <span
                className={cn(
                  "font-display text-[10px]",
                  values.activity.length > ACTIVITY_MAX ? "text-rose-300" : "text-mute/70"
                )}
              >
                {values.activity.length}/{ACTIVITY_MAX}
              </span>
            </div>
            <textarea
              id="idea-activity"
              rows={3}
              value={values.activity}
              onChange={(e) => {
                setValues({ ...values, activity: e.target.value.slice(0, ACTIVITY_MAX + 20) });
                if (touched) setErrors(validate({ ...values, activity: e.target.value }));
              }}
              onBlur={() => {
                setTouched(true);
                setErrors(validate(values));
              }}
              aria-invalid={Boolean(errors.activity)}
              aria-describedby={errors.activity ? "idea-activity-error" : undefined}
              placeholder="e.g. A Friday soldering clinic where members repair their own boards"
              className={cn(
                "w-full resize-y border bg-hull/60 px-3 py-2 text-[12.5px] leading-relaxed text-ice placeholder:text-mute/45",
                errors.activity ? "border-rose-400/70" : "border-line focus:border-cyan/60"
              )}
            />
            {errors.activity && (
              <p id="idea-activity-error" role="alert" className="mt-1 text-[11px] text-rose-300">
                {errors.activity}
              </p>
            )}
          </div>

          <div>
            <div className="mb-1.5 flex items-baseline justify-between">
              <label htmlFor="idea-note" className="font-display text-[10px] tracking-[0.24em] text-mute uppercase">
                Explanation (optional)
              </label>
              <span
                className={cn(
                  "font-display text-[10px]",
                  values.note.length > NOTE_MAX ? "text-rose-300" : "text-mute/70"
                )}
              >
                {values.note.length}/{NOTE_MAX}
              </span>
            </div>
            <textarea
              id="idea-note"
              rows={3}
              value={values.note}
              onChange={(e) => {
                setValues({ ...values, note: e.target.value.slice(0, NOTE_MAX + 20) });
                if (touched) setErrors(validate({ ...values, note: e.target.value }));
              }}
              onBlur={() => {
                setTouched(true);
                setErrors(validate(values));
              }}
              aria-invalid={Boolean(errors.note)}
              aria-describedby={errors.note ? "idea-note-error" : undefined}
              placeholder="Why would members want this? What would they build or learn?"
              className={cn(
                "w-full resize-y border bg-hull/60 px-3 py-2 text-[12.5px] leading-relaxed text-ice placeholder:text-mute/45",
                errors.note ? "border-rose-400/70" : "border-line focus:border-cyan/60"
              )}
            />
            {errors.note && (
              <p id="idea-note-error" role="alert" className="mt-1 text-[11px] text-rose-300">
                {errors.note}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Btn type="submit" variant="primary">
              <Send size={13} /> {editing ? "Save changes" : "Save idea locally"}
            </Btn>
            <Btn
              type="button"
              variant="ghost"
              onClick={() => {
                setValues(EMPTY);
                setErrors({});
                setTouched(false);
              }}
              disabled={values.activity === "" && values.note === "" && !editing}
            >
              Clear fields
            </Btn>
          </div>
        </form>
      </Panel>

      <Panel
        kicker="Saved locally"
        title={`Your ideas (${ideas.length})`}
        icon={<Filter size={15} />}
        accent="#a06bff"
        actions={
          ideas.length > 0 ? (
            <Btn size="sm" variant="ghost" onClick={clearIdeas}>
              <Trash2 size={12} /> Delete all
            </Btn>
          ) : undefined
        }
      >
        <div className="mb-2 flex flex-wrap gap-1.5">
          <Chip active={domainFilter === "all"} onClick={() => setDomainFilter("all")}>
            All {ideas.length > 0 && `(${ideas.length})`}
          </Chip>
          <Chip
            active={domainFilter === "general"}
            onClick={() => setDomainFilter("general")}
          >
            General {counts.get("general") ? `(${counts.get("general")})` : ""}
          </Chip>
          {DOMAINS.map((d) => (
            <Chip
              key={d.id}
              active={domainFilter === d.id}
              color={d.color}
              onClick={() => setDomainFilter(d.id)}
            >
              {d.name.split(" ")[0]} {counts.get(d.id) ? `(${counts.get(d.id)})` : ""}
            </Chip>
          ))}
        </div>

        <div className="mb-3 flex items-center gap-2">
          <DataLabel>Sort</DataLabel>
          {(["newest", "oldest", "domain"] as SortKey[]).map((s) => (
            <Chip key={s} active={sort === s} onClick={() => setSort(s)}>
              {s === "newest" ? "Newest first" : s === "oldest" ? "Oldest first" : "By category"}
            </Chip>
          ))}
        </div>

        {ideas.length === 0 ? (
          <EmptyState
            icon={<MessageSquareText size={22} />}
            title="No ideas saved yet"
            hint="Use the form above. Entries stay in this browser and can be edited or deleted at any time."
          />
        ) : visible.length === 0 ? (
          <EmptyState
            title="Nothing matches this filter"
            hint="Another domain filter will show the rest of your saved ideas."
            action={
              <Btn size="sm" variant="outline" onClick={() => setDomainFilter("all")}>
                Show all
              </Btn>
            }
          />
        ) : (
          <ul className="space-y-2">
            <AnimatePresence initial={false}>
              {visible.map((idea) => {
                const domain = idea.domain === "general" ? null : DOMAIN_MAP[idea.domain];
                const color = domain?.color ?? "#8ba3c7";
                const Icon = domain ? DOMAIN_ICONS[domain.icon] : MessageSquareText;
                return (
                  <motion.li
                    key={idea.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -18 }}
                    transition={{ duration: 0.22 }}
                    className={cn(
                      "border bg-hull/50 p-2.5",
                      editingId === idea.id ? "border-cyan/60" : "border-line/80"
                    )}
                    style={{ borderLeft: `2px solid ${color}` }}
                  >
                    <div className="flex items-start gap-2">
                      <Icon size={14} className="mt-0.5 shrink-0" style={{ color }} />
                      <div className="min-w-0 flex-1">
                        <p className="text-[12.5px] leading-snug font-medium text-ice">
                          {idea.activity}
                        </p>
                        {idea.note && (
                          <p className="mt-1 text-[11.5px] leading-relaxed text-mute">{idea.note}</p>
                        )}
                        <p className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px] tracking-wide text-mute/70">
                          <span style={{ color }}>{domain?.name ?? "General"}</span>
                          <span>·</span>
                          <span>{new Date(idea.createdAt).toLocaleString()}</span>
                          {idea.updatedAt !== idea.createdAt && <span>· edited</span>}
                          {domain && (
                            <button
                              onClick={() => setActiveDomain(domain.id)}
                              className="border border-line px-1 py-px transition-colors hover:border-cyan/50 hover:text-cyan"
                            >
                              open domain
                            </button>
                          )}
                        </p>
                      </div>
                      <div className="flex shrink-0 gap-1">
                        <button
                          onClick={() => startEdit(idea)}
                          aria-label={`Edit idea: ${idea.activity}`}
                          className="border border-line p-1.5 text-mute transition-colors hover:border-cyan/50 hover:text-cyan"
                        >
                          <Pencil size={12} />
                        </button>
                        <button
                          onClick={() => removeIdea(idea.id)}
                          aria-label={`Delete idea: ${idea.activity}`}
                          className="border border-line p-1.5 text-mute transition-colors hover:border-rose-400/60 hover:text-rose-300"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  </motion.li>
                );
              })}
            </AnimatePresence>
          </ul>
        )}

        <p className="mt-3 border-t border-line/70 pt-3 text-[10.5px] leading-relaxed text-mute/75">
          Backend-ready: this component only talks to a typed store. Swapping localStorage for a
          real API means pointing a server route (configured with
          <code className="mx-1 px-1 text-cyan/80">VITE_API_URL</code>
          and secrets kept server-side) at the same actions and re-validating every submission on
          the server. No keys ever live in this bundle.
        </p>
      </Panel>
    </div>
  );
}
