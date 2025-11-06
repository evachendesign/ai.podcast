"use client";

import { useState, FormEvent, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

const DRAFT_KEY = "create-channel-draft";

export function CreateChannelForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [link, setLink] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Load draft from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (!raw) return;
      const draft = JSON.parse(raw) as {
        name?: string;
        description?: string;
        link?: string;
      };
      if (typeof draft.name === "string") setName(draft.name);
      if (typeof draft.description === "string") setDescription(draft.description);
      if (typeof draft.link === "string") setLink(draft.link);
    } catch {}
  }, []);

  // Persist draft on change
  useEffect(() => {
    try {
      const payload = JSON.stringify({ name, description, link });
      localStorage.setItem(DRAFT_KEY, payload);
    } catch {}
  }, [name, description, link]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      setSubmitting(true);
      const res = await fetch("/api/channels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          topic: description.trim() || "",
          news_url: link.trim() || "",
        }),
      });
      if (!res.ok) throw new Error("Failed to create channel");
      // After successful creation, clear draft and return to dashboard
      try { localStorage.removeItem(DRAFT_KEY); } catch {}
      router.push("/");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">Channel name</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. AI Daily"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Topic prompt</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What should this channel cover?"
          rows={4}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="link">Links (optional)</Label>
        <Input
          id="link"
          value={link}
          onChange={(e) => setLink(e.target.value)}
          placeholder="https://example.com/rss or article URL"
          type="url"
        />
        <p className="text-xs text-muted-foreground">
          The channel will read content from this link.
        </p>
      </div>

      <div className="flex items-center gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            try { localStorage.removeItem(DRAFT_KEY); } catch {}
            router.push("/");
          }}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={submitting}>
          {submitting ? "Creating..." : "Create"}
        </Button>
      </div>
    </form>
  );
}


