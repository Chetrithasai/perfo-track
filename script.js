import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
} from "recharts";
import { Download, Upload, Plus, Trash2, RefreshCw, TrendingUp, Target, Database } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";

/**
 * Cricket Performance Tracker – Single-File React Component
 * --------------------------------------------------------
 * Features
 * - Add match entries: date/time, format, match type, venue.
 * - Batting: runs, balls, scoring breakdown (1s/2s/3s/4s/6s/dots), dismissal type, notes.
 * - Bowling: overs, balls, runs conceded, wickets, maidens, wides, no-balls, notes.
 * - Fielding: catches, run-outs, drops, misfields, notes.
 * - Progress tracker with trends (average, SR, economy, wickets) and auto-insights.
 * - Visuals: Runs over time, Strike rate, Dismissal type pie, Scoring breakdown, Skill radar.
 * - Local persistence (localStorage), JSON import/export, quick reset.
 * - Clean Tailwind UI + shadcn/ui components + Recharts + Framer Motion.
 */

// ------------ Types & Utilities ------------ //
const DEFAULT_FORMATS = ["T20", "ODI", "Test", "T10", "Street/Box", "Practice"];
const MATCH_TYPES = ["League", "Friendly", "Net Session", "Tournament", "Practice Match"];
const DISMISSALS = [
  "Not Out",
  "Bowled",
  "LBW",
  "Caught",
  "Run Out",
  "Stumped",
  "Hit Wicket",
  "Retired Hurt",
];

const STORAGE_KEY = "cricket_tracker_entries_v1";

function toInt(v, d = 0) {
  const n = parseInt(v, 10);
  return Number.isFinite(n) ? n : d;
}

function oversToBalls(overs) {
  // e.g., 3.2 overs => 20 balls
  if (overs == null || overs === "") return 0;
  const parts = String(overs).split(".");
  const whole = toInt(parts[0]);
  const balls = parts[1] ? toInt(parts[1]) : 0;
  return whole * 6 + balls;
}

function ballsToOvers(balls) {
  const o = Math.floor(balls / 6);
  const r = balls % 6;
  return `${o}.${r}`;
}

function calcStrikeRate(runs, balls) {
  if (!balls) return 0;
  return +( (runs / balls) * 100 ).toFixed(1);
}

function calcEconomy(runsConceded, overs) {
  const o = Number(overs);
  if (!o) return 0;
  return +((runsConceded / o)).toFixed(2);
}

function fmtDate(d) {
  try { return new Date(d).toLocaleDateString(); } catch { return d; }
}

// Quick color palette for Pie slices (use Recharts defaults if not enough slices)
const PIE_COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#8dd1e1", "#a4de6c", "#d0ed57", "#ffc0cb", "#ff8042"];

// ------------ Main Component ------------ //
export default function CricketTrackerApp() {
  const [entries, setEntries] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  const [form, setForm] = useState({
    id: null,
    date: new Date().toISOString().slice(0, 10),
    time: "",
    format: "T20",
    matchType: "Friendly",
    venue: "",
    // Batting
    runs: "",
    balls: "",
    singles: "",
    doubles: "",
    triples: "",
    fours: "",
    sixes: "",
    dots: "",
    dismissal: "Not Out",
    battingNotes: "",
    // Bowling
    overs: "",
    bowlBalls: "",
    runsConceded: "",
    wickets: "",
    maidens: "",
    wides: "",
    noBalls: "",
    bowlingNotes: "",
    // Fielding
    catches: "",
    runOuts: "",
    drops: "",
    misfields: "",
    fieldingNotes: "",
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  }, [entries]);

  const resetForm = () => {
    setForm((f) => ({
      ...f,
      id: null,
      date: new Date().toISOString().slice(0, 10),
      time: "",
      format: "T20",
      matchType: "Friendly",
      venue: "",
      runs: "",
      balls: "",
      singles: "",
      doubles: "",
      triples: "",
      fours: "",
      sixes: "",
      dots: "",
      dismissal: "Not Out",
      battingNotes: "",
      overs: "",
      bowlBalls: "",
      runsConceded: "",
      wickets: "",
      maidens: "",
      wides: "",
      noBalls: "",
      bowlingNotes: "",
      catches: "",
      runOuts: "",
      drops: "",
      misfields: "",
      fieldingNotes: "",
    }));
  };

  const addOrUpdateEntry = () => {
    const payload = {
      ...form,
      id: form.id ?? crypto.randomUUID(),
      runs: toInt(form.runs),
      balls: toInt(form.balls),
      singles: toInt(form.singles),
      doubles: toInt(form.doubles),
      triples: toInt(form.triples),
      fours: toInt(form.fours),
      sixes: toInt(form.sixes),
      dots: toInt(form.dots),
      overs: form.overs === "" ? "" : String(form.overs),
      bowlBalls: toInt(form.bowlBalls),
      runsConceded: toInt(form.runsConceded),
      wickets: toInt(form.wickets),
      maidens: toInt(form.maidens),
      wides: toInt(form.wides),
      noBalls: toInt(form.noBalls),
      catches: toInt(form.catches),
      runOuts: toInt(form.runOuts),
      drops: toInt(form.drops),
      misfields: toInt(form.misfields),
    };

    setEntries((prev) => {
      const idx = prev.findIndex((e) => e.id === payload.id);
      if (idx >= 0) {
        const cp = [...prev];
        cp[idx] = payload;
        return cp;
      }
      return [payload, ...prev];
    });
    resetForm();
  };

  const deleteEntry = (id) => setEntries((prev) => prev.filter((e) => e.id !== id));

  const clearAll = () => {
    if (confirm("Delete ALL entries? This cannot be undone.")) {
      setEntries([]);
      resetForm();
    }
  };

  const exportJSON = () => {
    const blob = new Blob([JSON.stringify(entries, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `cricket_tracker_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importJSON = (file) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result);
        if (Array.isArray(data)) {
          setEntries(data);
        } else {
          alert("Invalid file: expected an array of entries.");
        }
      } catch (e) {
        alert("Could not parse JSON file.");
      }
    };
    reader.readAsText(file);
  };

  // ------------ Derived Metrics & Insights ------------ //
  const sorted = useMemo(() => {
    return [...entries].sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [entries]);

  const totals = useMemo(() => {
    const t = {
      matches: entries.length,
      runs: 0,
      balls: 0,
      outs: 0,
      fours: 0,
      sixes: 0,
      dots: 0,
      wickets: 0,
      bowlBalls: 0,
      runsConceded: 0,
      maidens: 0,
      catches: 0,
      runOuts: 0,
      drops: 0,
      misfields: 0,
    };
    for (const e of entries) {
      t.runs += e.runs || 0;
      t.balls += e.balls || 0;
      t.outs += e.dismissal && e.dismissal !== "Not Out" ? 1 : 0;
      t.fours += e.fours || 0;
      t.sixes += e.sixes || 0;
      t.dots += e.dots || 0;
      t.wickets += e.wickets || 0;
      t.bowlBalls += e.bowlBalls || oversToBalls(e.overs);
      t.runsConceded += e.runsConceded || 0;
      t.maidens += e.maidens || 0;
      t.catches += e.catches || 0;
      t.runOuts += e.runOuts || 0;
      t.drops += e.drops || 0;
      t.misfields += e.misfields || 0;
    }
    return t;
  }, [entries]);

  const battingAverage = useMemo(() => {
    return totals.outs ? +(totals.runs / totals.outs).toFixed(2) : totals.runs;
  }, [totals]);

  const battingSR = useMemo(() => calcStrikeRate(totals.runs, totals.balls), [totals]);

  const bowlingEconomy = useMemo(() => {
    const overs = totals.bowlBalls ? totals.bowlBalls / 6 : 0;
    return overs ? +((totals.runsConceded) / overs).toFixed(2) : 0;
  }, [totals]);

  const boundaryPct = useMemo(() => {
    const boundaryRuns = totals.fours * 4 + totals.sixes * 6;
    return totals.runs ? +((boundaryRuns / totals.runs) * 100).toFixed(1) : 0;
  }, [totals]);

  const dotPct = useMemo(() => {
    return totals.balls ? +((totals.dots / totals.balls) * 100).toFixed(1) : 0;
  }, [totals]);

  const dismissalCounts = useMemo(() => {
    const map = {};
    for (const e of entries) {
      const key = e.dismissal || "Unknown";
      map[key] = (map[key] || 0) + 1;
    }
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [entries]);

  const runTrend = useMemo(() => sorted.map((e, i) => ({
    idx: i + 1,
    date: fmtDate(e.date),
    runs: e.runs || 0,
    sr: calcStrikeRate(e.runs || 0, e.balls || 0),
  })), [sorted]);

  const scoringBreakdown = useMemo(() => {
    const sums = { ones: 0, twos: 0, threes: 0, fours: 0, sixes: 0, dots: 0 };
    for (const e of entries) {
      sums.ones += e.singles || 0;
      sums.twos += e.doubles || 0;
      sums.threes += e.triples || 0;
      sums.fours += e.fours || 0;
      sums.sixes += e.sixes || 0;
      sums.dots += e.dots || 0;
    }
    return [
      { name: "1s", value: sums.ones },
      { name: "2s", value: sums.twos },
      { name: "3s", value: sums.threes },
      { name: "4s", value: sums.fours },
      { name: "6s", value: sums.sixes },
      { name: "Dots", value: sums.dots },
    ];
  }, [entries]);

  // Simple skill scores out of 100 (heuristics)
  const skillScores = useMemo(() => {
    const batVolume = Math.min(100, Math.round((totals.runs / Math.max(1, entries.length)) * 2)); // avg runs *2
    const batSR = Math.min(100, Math.round(battingSR));
    const rotation = Math.max(0, Math.min(100, Math.round(100 - dotPct)));
    const power = Math.min(100, Math.round(boundaryPct * 1.2));

    const bowlStrike = (() => {
      const totalW = totals.wickets;
      const balls = totals.bowlBalls;
      if (!balls) return 0;
      const sr = balls / Math.max(1, totalW);
      return Math.min(100, Math.round(100 - Math.min(100, (sr / 30) * 100))); // better when lower SR
    })();
    const economy = Math.max(0, Math.min(100, Math.round(100 - (bowlingEconomy * 8))));

    const fielding = Math.max(0, Math.min(100, (totals.catches + totals.runOuts) * 10 - (totals.drops + totals.misfields) * 5));

    return { batVolume, batSR, rotation, power, bowlStrike, economy, fielding };
  }, [totals, battingSR, dotPct, boundaryPct, bowlingEconomy, entries.length]);

  // Auto-Insights & Suggestions
  const insights = useMemo(() => {
    const list = [];

    // Batting
    if (entries.length >= 3) {
      const last3 = sorted.slice(-3);
      const avg = last3.reduce((a, e) => a + (e.runs || 0), 0) / 3;
      list.push({ area: "Batting", msg: `Last 3 innings avg: ${avg.toFixed(1)}` });
    }
    if (battingSR < 100 && (form.format === "T20" || entries.some(e => e.format === "T20"))) {
      list.push({ area: "Batting", msg: "Strike rate is below T20 benchmark (100). Focus on rotating strike and boundary options early." });
    }
    if (dotPct > 45) list.push({ area: "Batting", msg: `High dot ball percentage (${dotPct}%). Work on singles placement & quick calls.` });
    if (boundaryPct < 35 && entries.some(e => e.format === "T20")) list.push({ area: "Batting", msg: `Boundary % is ${boundaryPct}%. Add power-hitting drills (range-hitting, strong base).` });

    const caughtShare = dismissalCounts.find(d => d.name === "Caught")?.value || 0;
    if (entries.length && caughtShare / Math.max(1, entries.length) > 0.4) {
      list.push({ area: "Shot Selection", msg: "Many dismissals are caught. Reassess lofted shots & play later under the eyes." });
    }
    const straightShare = (dismissalCounts.find(d => d.name === "LBW")?.value || 0) + (dismissalCounts.find(d => d.name === "Bowled")?.value || 0);
    if (entries.length && straightShare / Math.max(1, entries.length) > 0.3) {
      list.push({ area: "Technique", msg: "LBW/Bowled frequency suggests gap between bat & pad. Drill: straight-bat, shadow practice, front-foot defense." });
    }

    // Bowling
    const hasT20 = entries.some(e => e.format === "T20");
    if (hasT20 && bowlingEconomy > 8.5) list.push({ area: "Bowling", msg: `Economy ${bowlingEconomy} in T20. Work on yorkers, wide yorkers, and change-ups at the death.` });
    const widesNb = totals.wides + totals.noBalls;
    if (widesNb > 0 && widesNb / Math.max(1, totals.bowlBalls) > 0.05) list.push({ area: "Discipline", msg: "High extras rate. Groove run-up, release point; target cone drills." });
    if (totals.wickets === 0 && totals.bowlBalls > 24) list.push({ area: "Bowling", msg: "Low wicket-taking. Try attacking fields early; vary length & pace more." });

    // Fielding
    if (totals.drops > totals.catches) list.push({ area: "Fielding", msg: "Drops exceed catches. Practice high catches and reaction drills." });

    if (list.length === 0) list.push({ area: "Overall", msg: "Good balance so far. Keep logging matches for sharper insights." });
    return list;
  }, [entries, sorted, battingSR, dotPct, boundaryPct, dismissalCounts, bowlingEconomy, totals, form.format]);

  // ------------ UI Helpers ------------ //
  const Stat = ({ icon: Icon, label, value, hint }) => (
    <Card className="rounded-2xl">
      <CardContent className="p-4 flex items-center gap-3">
        <div className="p-3 rounded-2xl shadow bg-white">
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <div className="text-sm text-gray-500">{label}</div>
          <div className="text-xl font-semibold">{value}</div>
          {hint && <div className="text-xs text-gray-400">{hint}</div>}
        </div>
      </CardContent>
    </Card>
  );

  const Section = ({ title, children, right }) => (
    <Card className="rounded-2xl">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{title}</CardTitle>
          {right}
        </div>
      </CardHeader>
      <CardContent className="pt-0">{children}</CardContent>
    </Card>
  );

  const Field = ({ label, children }) => (
    <div className="flex flex-col gap-1">
      <Label className="text-sm text-gray-600">{label}</Label>
      {children}
    </div>
  );

  // ------------ Render ------------ //
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white text-gray-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto grid gap-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Cricket Performance Tracker</h1>
            <p className="text-gray-500 text-sm">Log matches, analyze trends, and spot improvement areas.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={exportJSON}><Download className="w-4 h-4 mr-2"/>Export</Button>
            <label className="inline-flex items-center">
              <input type="file" accept="application/json" className="hidden" onChange={(e) => e.target.files?.[0] && importJSON(e.target.files[0])} />
              <span className="inline-flex">
                <Button variant="outline"><Upload className="w-4 h-4 mr-2"/>Import</Button>
              </span>
            </label>
            <Button variant="destructive" onClick={clearAll}><Trash2 className="w-4 h-4 mr-2"/>Reset</Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid md:grid-cols-4 gap-4">
          <Stat icon={Database} label="Matches" value={totals.matches} />
          <Stat icon={TrendingUp} label="Bat Avg" value={battingAverage} hint={`${totals.runs} runs / ${totals.outs || 0} outs`} />
          <Stat icon={TrendingUp} label="Strike Rate" value={battingSR} hint={`${totals.runs} runs, ${totals.balls} balls`} />
          <Stat icon={Target} label="Economy" value={bowlingEconomy} hint={`${totals.runsConceded} runs / ${Math.round(totals.bowlBalls/6)} ov`} />
        </div>

        {/* Form */}
        <Section title="Add / Edit Match" right={<Button onClick={addOrUpdateEntry}><Plus className="w-4 h-4 mr-2"/>Save Entry</Button>}>
          <div className="grid md:grid-cols-4 gap-4">
            <Field label="Date"><Input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} /></Field>
            <Field label="Time"><Input type="time" value={form.time} onChange={e => setForm({ ...form, time: e.target.value })} /></Field>
            <Field label="Format">
              <Select value={form.format} onValueChange={(v) => setForm({ ...form, format: v })}>
                <SelectTrigger><SelectValue placeholder="Select format"/></SelectTrigger>
                <SelectContent>{DEFAULT_FORMATS.map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
            <Field label="Match Type">
              <Select value={form.matchType} onValueChange={(v) => setForm({ ...form, matchType: v })}>
                <SelectTrigger><SelectValue placeholder="Match type"/></SelectTrigger>
                <SelectContent>{MATCH_TYPES.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
            <Field label="Venue / Notes"><Input placeholder="Ground / indoor nets / city" value={form.venue} onChange={e => setForm({ ...form, venue: e.target.value })} /></Field>
          </div>

          {/* Batting */}
          <div className="mt-6 grid gap-3">
            <h3 className="font-semibold">Batting</h3>
            <div className="grid md:grid-cols-6 gap-3">
              <Field label="Runs"><Input inputMode="numeric" value={form.runs} onChange={e => setForm({ ...form, runs: e.target.value })} /></Field>
              <Field label="Balls"><Input inputMode="numeric" value={form.balls} onChange={e => setForm({ ...form, balls: e.target.value })} /></Field>
              <Field label="1s"><Input inputMode="numeric" value={form.singles} onChange={e => setForm({ ...form, singles: e.target.value })} /></Field>
              <Field label="2s"><Input inputMode="numeric" value={form.doubles} onChange={e => setForm({ ...form, doubles: e.target.value })} /></Field>
              <Field label="3s"><Input inputMode="numeric" value={form.triples} onChange={e => setForm({ ...form, triples: e.target.value })} /></Field>
              <Field label="4s"><Input inputMode="numeric" value={form.fours} onChange={e => setForm({ ...form, fours: e.target.value })} /></Field>
              <Field label="6s"><Input inputMode="numeric" value={form.sixes} onChange={e => setForm({ ...form, sixes: e.target.value })} /></Field>
              <Field label="Dots"><Input inputMode="numeric" value={form.dots} onChange={e => setForm({ ...form, dots: e.target.value })} /></Field>
              <Field label="Dismissal">
                <Select value={form.dismissal} onValueChange={(v) => setForm({ ...form, dismissal: v })}>
                  <SelectTrigger><SelectValue placeholder="Dismissal type"/></SelectTrigger>
                  <SelectContent>{DISMISSALS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                </Select>
              </Field>
              <Field label={`Strike Rate: ${calcStrikeRate(toInt(form.runs), toInt(form.balls))}`}><div className="text-xs text-gray-500">Calculated automatically</div></Field>
            </div>
            <Field label="Key Takeaways (Batting)"><Textarea rows={3} value={form.battingNotes} onChange={e => setForm({ ...form, battingNotes: e.target.value })} placeholder="What went well? What to improve?"/></Field>
          </div>

          {/* Bowling */}
          <div className="mt-6 grid gap-3">
            <h3 className="font-semibold">Bowling</h3>
            <div className="grid md:grid-cols-7 gap-3">
              <Field label="Overs (e.g., 3.2)"><Input value={form.overs} onChange={e => setForm({ ...form, overs: e.target.value })} /></Field>
              <Field label="Balls (alt to Overs)"><Input inputMode="numeric" value={form.bowlBalls} onChange={e => setForm({ ...form, bowlBalls: e.target.value })} /></Field>
              <Field label="Runs Conceded"><Input inputMode="numeric" value={form.runsConceded} onChange={e => setForm({ ...form, runsConceded: e.target.value })} /></Field>
              <Field label="Wickets"><Input inputMode="numeric" value={form.wickets} onChange={e => setForm({ ...form, wickets: e.target.value })} /></Field>
              <Field label="Maidens"><Input inputMode="numeric" value={form.maidens} onChange={e => setForm({ ...form, maidens: e.target.value })} /></Field>
              <Field label="Wides"><Input inputMode="numeric" value={form.wides} onChange={e => setForm({ ...form, wides: e.target.value })} /></Field>
              <Field label="No-Balls"><Input inputMode="numeric" value={form.noBalls} onChange={e => setForm({ ...form, noBalls: e.target.value })} /></Field>
            </div>
            <div className="text-xs text-gray-500">Economy auto: {calcEconomy(toInt(form.runsConceded), form.overs || (form.bowlBalls ? ballsToOvers(toInt(form.bowlBalls)) : 0))}</div>
            <Field label="Key Takeaways (Bowling)"><Textarea rows={3} value={form.bowlingNotes} onChange={e => setForm({ ...form, bowlingNotes: e.target.value })} placeholder="Plans, lengths, what worked, what to adjust"/></Field>
          </div>

          {/* Fielding */}
          <div className="mt-6 grid gap-3">
            <h3 className="font-semibold">Fielding</h3>
            <div className="grid md:grid-cols-6 gap-3">
              <Field label="Catches"><Input inputMode="numeric" value={form.catches} onChange={e => setForm({ ...form, catches: e.target.value })} /></Field>
              <Field label="Run-Outs"><Input inputMode="numeric" value={form.runOuts} onChange={e => setForm({ ...form, runOuts: e.target.value })} /></Field>
              <Field label="Drops"><Input inputMode="numeric" value={form.drops} onChange={e => setForm({ ...form, drops: e.target.value })} /></Field>
              <Field label="Misfields"><Input inputMode="numeric" value={form.misfields} onChange={e => setForm({ ...form, misfields: e.target.value })} /></Field>
            </div>
            <Field label="Key Takeaways (Fielding)"><Textarea rows={3} value={form.fieldingNotes} onChange={e => setForm({ ...form, fieldingNotes: e.target.value })} placeholder="Positioning, reactions, throws"/></Field>
          </div>
        </Section>

        {/* Visualizations */}
        <div className="grid lg:grid-cols-2 gap-6">
          <Section title="Runs Over Time">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={runTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="runs" name="Runs" />
                  <Line type="monotone" dataKey="sr" name="Strike Rate" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Section>

          <Section title="Strike Rate by Innings">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={runTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="sr" name="Strike Rate" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Section>

          <Section title="Dismissal Types">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={dismissalCounts} dataKey="value" nameKey="name" label>
                    {dismissalCounts.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Section>

          <Section title="Scoring Breakdown (Totals)">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={scoringBreakdown}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" name="Count" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Section>

          <Section title="Skill Radar">
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={[
                  { key: "Run Volume", val: skillScores.batVolume },
                  { key: "Strike Rate", val: skillScores.batSR },
                  { key: "Rotation", val: skillScores.rotation },
                  { key: "Power", val: skillScores.power },
                  { key: "Wkt Threat", val: skillScores.bowlStrike },
                  { key: "Economy", val: skillScores.economy },
                  { key: "Fielding", val: skillScores.fielding },
                ]}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="key" />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} />
                  <Radar dataKey="val" name="Score" />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </Section>
        </div>

        {/* Insights */}
        <Section title="Auto Insights & Suggestions" right={<Button variant="outline" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}><RefreshCw className="w-4 h-4 mr-2"/>Log More</Button>}>
          <div className="grid md:grid-cols-2 gap-3">
            {insights.map((it, idx) => (
              <motion.div key={idx} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.03 }} className="p-3 rounded-2xl border bg-white">
                <div className="text-xs text-gray-500 mb-1">{it.area}</div>
                <div className="text-sm font-medium">{it.msg}</div>
              </motion.div>
            ))}
          </div>
        </Section>

        {/* Data Table */}
        <Section title="All Entries">
          {entries.length === 0 ? (
            <div className="text-sm text-gray-500">No entries yet. Add your first match above.</div>
          ) : (
            <div className="overflow-auto rounded-2xl border">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="p-2 text-left">Date</th>
                    <th className="p-2 text-left">Format</th>
                    <th className="p-2 text-left">Type</th>
                    <th className="p-2 text-left">Runs (Balls)</th>
                    <th className="p-2 text-left">4s/6s</th>
                    <th className="p-2 text-left">Dismissal</th>
                    <th className="p-2 text-left">Overs</th>
                    <th className="p-2 text-left">R</th>
                    <th className="p-2 text-left">W</th>
                    <th className="p-2 text-left">Md</th>
                    <th className="p-2 text-left">C/RO</th>
                    <th className="p-2 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sorted.map((e) => (
                    <tr key={e.id} className="border-t">
                      <td className="p-2 whitespace-nowrap">{fmtDate(e.date)} {e.time ? `• ${e.time}` : ""}</td>
                      <td className="p-2">{e.format}</td>
                      <td className="p-2">{e.matchType}</td>
                      <td className="p-2">{e.runs || 0} ({e.balls || 0})</td>
                      <td className="p-2">{e.fours || 0}/{e.sixes || 0}</td>
                      <td className="p-2">{e.dismissal}</td>
                      <td className="p-2">{e.overs || (e.bowlBalls ? ballsToOvers(e.bowlBalls) : "-")}</td>
                      <td className="p-2">{e.runsConceded || 0}</td>
                      <td className="p-2">{e.wickets || 0}</td>
                      <td className="p-2">{e.maidens || 0}</td>
                      <td className="p-2">{(e.catches || 0)}/{(e.runOuts || 0)}</td>
                      <td className="p-2 flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => setForm({ ...e })}>Edit</Button>
                        <Button size="sm" variant="destructive" onClick={() => deleteEntry(e.id)}>Delete</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Section>

        {/* Footer */}
        <div className="text-center text-xs text-gray-400 py-6">Your data is stored locally in your browser. Export regularly for backup.</div>
      </div>
    </div>
  );
}
