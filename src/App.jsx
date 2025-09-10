import React, { useMemo, useState } from "react";
import Papa from "papaparse";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ReferenceLine } from "recharts";

// --- Pre-selected biomarker list ---
const BIOMARKERS = [
  "Acetyl-Ornithine",
  "Adhesion G protein-coupled receptor F5",
  "Adipocyte plasma membrane-associated protein",
  "Afamin",
  "Alanine",
  "Alpha-1-acid glycoprotein 1",
  "Alpha-1-antichymotrypsin",
  "Alpha-1-antitrypsin",
  "Alpha-1B-glycoprotein",
  "Alpha-2-antiplasmin",
  "Alpha-2-HS-glycoprotein",
  "Alpha-2-macroglobulin",
  "Alpha-amino-N-butyric acid",
  "alpha-Aminoadipic acid",
  "Angiogenin",
  "Angiotensinogen",
  "Antithrombin-III",
  "Apolipoprotein A-I",
  "Apolipoprotein A-II",
  "Apolipoprotein A-IV",
  "Apolipoprotein B-100",
  "Apolipoprotein C-I",
  "Apolipoprotein C-II",
  "Apolipoprotein C-III",
  "Apolipoprotein C-IV",
  "Apolipoprotein D",
  "Apolipoprotein E",
  "Apolipoprotein L1",
  "Apolipoprotein M",
  "Arginine",
  "Asparagine",
  "Aspartic acid",
  "Asymmetric dimethylarginine",
  "Attractin",
  "Beta-2-glycoprotein 1",
  "Beta-2-microglobulin",
  "Beta-Ala-His dipeptidase",
  "Beta-alanine",
  "Betaine",
  "Biotinidase",
  "C-reactive protein",
  "C4b-binding protein alpha chain",
  "Cadherin-5",
  "Carbonic anhydrase 1",
  "Carboxypeptidase B2",
  "Carboxypeptidase N catalytic chain",
  "Cartilage acidic protein 1",
  "CD5 antigen-like",
  "Ceruloplasmin",
  "Choline",
  "Cholinesterase",
  "Citrulline",
  "Clusterin",
  "Coagulation factor IX",
  "Coagulation factor X",
  "Coagulation factor XI",
  "Coagulation factor XII",
  "Coagulation factor XIII A chain",
  "Coagulation factor XIII B chain",
  "Complement C1q subcomponent subunit B",
  "Complement C1r subcomponent",
  "Complement C1r subcomponent-like protein",
  "Complement C1s subcomponent",
  "Complement C2",
  "Complement C3",
  "Complement C4-B",
  "Complement C5",
  "Complement component C6",
  "Complement component C7",
  "Complement component C8 alpha chain",
  "Complement component C8 beta chain",
  "Complement component C9",
  "Complement factor B",
  "Complement factor D",
  "Complement factor H",
  "Complement factor I",
  "Corticosteroid-binding globulin",
  "Cotinine",
  "Creatine",
  "Creatinine",
  "Cystatin-C",
  "Extracellular matrix protein 1",
  "Fetuin-B",
  "Fibrinogen alpha chain",
  "Fibrinogen beta chain",
  "Fibrinogen gamma chain",
  "Fibronectin",
  "Fibulin-1",
  "Ficolin-3",
  "Gamma-aminobutyric acid",
  "Gelsolin",
  "Glucose",
  "Glutamic acid",
  "Glutamine",
  "Glutathione peroxidase 3",
  "Glycine",
  "Haptoglobin",
  "Hemoglobin subunit alpha 1",
  "Hemopexin",
  "Heparin cofactor 2",
  "Histidine",
  "Ig mu chain C region",
  "IgGFc-binding protein",
  "Insulin-like growth factor-binding protein 2",
  "Insulin-like growth factor-binding protein 3",
  "Insulin-like growth factor-binding protein complex acid labile subunit",
  "Inter-alpha-trypsin inhibitor heavy chain H2",
  "Intercellular adhesion molecule 1",
  "Isoleucine",
  "Kallistatin",
  "Kininogen-1",
  "Kynurenine",
  "L-selectin",
  "Leucine",
  "Leucine-rich alpha-2-glycoprotein 1",
  "Lipopolysaccharide-binding protein",
  "Lumican",
  "Lysine",
  "Lysozyme C",
  "Mannose-binding protein C",
  "Methionine",
  "Methionine-Sulfoxide",
  "Methylhistidine",
  "Ornithine",
  "Peroxiredoxin-2",
  "Phenylalanine",
  "Phosphatidylinositol-glycan-specific phospholipase D",
  "Phospholipid transfer protein",
  "Pigment epithelium-derived factor",
  "Plasma protease C1 inhibitor",
  "Plasma serine protease inhibitor",
  "Plasminogen",
  "Proline",
  "Proline-Betaine",
  "Protein AMBP",
  "Protein S100-A9",
  "Protein Z-dependent protease inhibitor",
  "Proteoglycan 4",
  "Prothrombin",
  "Putrescine",
  "Retinol-binding protein 4",
  "Sarcosine",
  "Serine",
  "Serotonin",
  "Serotransferrin",
  "Serum albumin",
  "Serum amyloid A-4 protein",
  "Serum amyloid P-component",
  "Sex hormone-binding globulin",
  "Spermidine",
  "Taurine",
  "Tetranectin",
  "Threonine",
  "Thrombospondin-1",
  "Thyroxine-binding globulin",
  "trans-OH-Proline",
  "Transthyretin",
  "Trigonelline",
  "Trimethylamine N-oxide",
  "Tryptophan",
  "Tyrosine",
  "Valine",
  "Vasorin",
  "Vitamin D-binding protein",
  "Vitamin K-dependent protein S",
  "Vitamin K-dependent protein Z",
  "Vitronectin",
  "von Willebrand Factor",
  "Xaa-Pro dipeptidase",
  "Zinc-alpha-2-glycoprotein",
];

// -------- Utilities (pure JS) --------
const uid = () => Math.random().toString(36).slice(2, 9);
const norm = (s) => (s || "").trim().toLowerCase();
const slugForKey = (s) =>
  "bm-" + String(s || "")
    .normalize("NFKD")
    .replace(/[^\w-]+/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "");

// Histogram bin width in score points (0–100)
const HIST_BIN_SIZE = 5;

// Color → weight per spec
function colorWeight(color) {
  const c = (color || "").toLowerCase();
  if (c === "red") return 4;
  if (c === "yellow") return 2;
  if (c === "green" || c === "blue") return 1;
  return 1;
}

// Map biomarker color to hex
function colorHexFromName(name) {
  const c = (name || "").toLowerCase();
  if (c === "green") return "#3fb6dc";
  if (c === "yellow") return "#ffc800";
  if (c === "red") return "#cf3616";
  return "#e5e7eb";
}

// Map area score to chip color
function scoreBandColor(score) {
  const s = Number(score);
  if (!Number.isFinite(s)) return "#9ca3af"; // gray for null/NaN
  if (s <= 69) return "#cf3616";
  if (s <= 90) return "#ffc800";
  return "#3fb6dc";
}

function idealTextColor(hex) {
  const h = (hex || "#ffffff").replace("#", "");
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 140 ? "#000000" : "#ffffff";
}

// Coerce score cell to number or null
function coerceScore(x) {
  const n = Number(x);
  return Number.isFinite(n) ? n : null;
}

// Apply score rounding based on selected method
function applyScoreRounding(score, method) {
  if (score === null || !Number.isFinite(score)) return score;
  
  switch (method) {
    case "down":
      return Math.floor(score);
    case "nearest":
      return Math.round(score);
    case "up":
      return Math.ceil(score);
    case "none":
    default:
      return score;
  }
}

// Helpers for NR detection
function isBlank(v) {
  return v === null || v === undefined || (typeof v === "string" && v.trim() === "");
}

// Skip-NR helper: treat 'NR' (Not Reported) OR missing score/color as non-contributing in aggregate calculations
function isNR(row) {
  const s = row?.SCORE;
  const c = row?.COLOR;

  // If SCORE or COLOR is missing/blank, treat as NR
  if (isBlank(s) || isBlank(c)) return true;

  if (typeof s === "string") {
    const t = s.trim().toLowerCase();
    if (t === "nr" || t === "n/r" || t === "not reported") return true;
  }
  const lc = row?.LAB_CONCENTRATION;
  if (typeof lc === "string") {
    const t = lc.trim().toLowerCase();
    if (t === "nr" || t === "n/r" || t === "not reported") return true;
  }
  if (typeof c === "string" && c.trim().toLowerCase() === "nr") return true;
  return false;
}

// Aggregate weighted score for a set of rows; returns number in [0,100] with 2 decimals, or null
function aggregateWeightedScore(rows) {
  let num = 0;
  let den = 0;
  for (const r of rows || []) {
    if (isNR(r)) continue; // exclude NR rows entirely
    const s = coerceScore(r.SCORE);
    if (s === null) continue;
    const w = colorWeight(r.COLOR);
    num += s * w;
    den += 100 * w;
  }
  if (den === 0) return null;
  const value = (num / den) * 100;
  return Math.round(value * 100) / 100;
}

// Small helper to group rows by TEST_ID for a given set of biomarker names
function groupRowsByTestId(selectedNames, csvRows) {
  const selected = new Set([...selectedNames].map(norm));
  const displayNameByNorm = new Map();
  for (const name of selectedNames) displayNameByNorm.set(norm(name), name);

  const groups = new Map();
  for (const row of csvRows || []) {
    const key = norm(row.MEASURE_NAME);
    if (!selected.has(key)) continue;
    const testId = String(row.TEST_ID ?? "");
    const arr = groups.get(testId) || [];
    arr.push({
      ...row,
      __BIOMARKER__: displayNameByNorm.get(key) || row.MEASURE_NAME,
    });
    groups.set(testId, arr);
  }

  const out = [...groups.entries()].map(([testId, rows]) => ({ testId, rows }));
  out.sort((a, b) => a.testId.localeCompare(b.testId, undefined, { numeric: true }));
  for (const g of out) {
    g.rows.sort(
      (r1, r2) =>
        String(r1.__BIOMARKER__).localeCompare(String(r2.__BIOMARKER__)) ||
        String(r1.LAB_CONCENTRATION ?? "").localeCompare(String(r2.LAB_CONCENTRATION ?? ""), undefined, { numeric: true })
    );
  }
  return out;
}

// Summarize per-TestID area scores (drop nulls)
function summarizeAreaScores(groups) {
  const pts = [];
  for (const g of groups || []) {
    const s = aggregateWeightedScore(g.rows);
    if (s === null) continue;
    pts.push({ testId: g.testId, score: s });
  }
  return pts;
}

// Build histogram bins from per-TestID points
function histogramBins(points, binSize = HIST_BIN_SIZE) {
  const bins = [];
  for (let start = 0; start < 100; start += binSize) {
    bins.push({ binStart: start, binCenter: start + binSize / 2, binEnd: start + binSize, count: 0 });
  }
  for (const p of points || []) {
    const s = Number(p.score);
    if (!Number.isFinite(s)) continue;
    const idx = Math.min(Math.floor(s / binSize), bins.length - 1); // 100 -> last bin
    bins[idx].count += 1;
  }
  return bins;
}

// Exact-score distribution helpers
function roundTo(x, digits = 2) {
  if (!Number.isFinite(Number(x))) return null;
  const f = Math.pow(10, digits);
  return Math.round(Number(x) * f) / f;
}

function exactScoreDistribution(points, precision = 2) {
  const map = new Map();
  let total = 0;
  for (const p of points || []) {
    const s = roundTo(p.score, precision);
    if (s === null) continue;
    total += 1;
    map.set(s, (map.get(s) || 0) + 1);
  }
  const rows = [...map.entries()]
    .map(([score, count]) => ({ score, count }))
    .sort((a, b) => a.score - b.score);
  let cum = 0;
  for (const r of rows) {
    r.percent = total ? (r.count / total) * 100 : 0;
    cum += r.count;
    r.cumPercent = total ? (cum / total) * 100 : 0;
  }
  return { rows, total };
}

function formatPct(x) {
  return `${(Math.round((x ?? 0) * 100) / 100).toFixed(2)}%`;
}

function downloadCsv(filename, rows, headers) {
  const headerLine = headers.join(",");
  const body = rows.map(r => headers.map(h => String(r[h] ?? "").replaceAll('"', '""')).join(",")).join("\n");
  const csv = headerLine + "\n" + body;
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// Bulk mapping helpers (areas <-> biomarkers)
const BIOMARKER_CANON = new Map(BIOMARKERS.map((b) => [norm(b), b]));
function canonicalizeBiomarker(name) {
  return BIOMARKER_CANON.get(norm(name)) || null;
}

// Parse pasted text containing pairs of "AREA<TAB or ,>BIOMARKER"
function parseAreaBiomarkerText(text) {
  const out = [];
  const lines = String(text || "").split("\n");
  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;
    let a = null, b = null;
    if (line.includes("\t")) {
      const parts = line.split("\t");
      if (parts.length >= 2) { a = parts[0]; b = parts.slice(1).join("\t"); }
    } else if (line.includes(",")) {
      const parts = line.split(",");
      if (parts.length >= 2) { a = parts[0]; b = parts.slice(1).join(","); }
    } else {
      const idx = line.indexOf("  "); // at least two spaces
      if (idx >= 0) { a = line.slice(0, idx); b = line.slice(idx).trimStart(); }
    }
    if (a !== null && b !== null) out.push([a.trim(), b.trim()]);
  }
  return out;
}

// Pure function: apply pairs to an areas array; returns { areas, unknowns, createdAreas, addedLinks }
function applyPairsPure(prevAreas, pairs) {
  const areas = prevAreas.map((a) => ({ ...a, biomarkers: new Set(a.biomarkers) }));
  const indexByNorm = new Map(areas.map((a, i) => [norm(a.name), i]));
  const unknowns = new Set();
  let createdAreas = 0, addedLinks = 0;

  function ensureArea(areaName) {
    const key = norm(areaName);
    if (indexByNorm.has(key)) return areas[indexByNorm.get(key)];
    const newArea = { id: uid(), name: areaName.trim(), biomarkers: new Set() };
    areas.push(newArea);
    indexByNorm.set(key, areas.length - 1);
    createdAreas += 1;
    return newArea;
  }

  for (const [areaName, biomarkerInput] of pairs) {
    const canon = canonicalizeBiomarker(biomarkerInput);
    if (!canon) { unknowns.add(biomarkerInput); continue; }
    const area = ensureArea(areaName);
    if (!area.biomarkers.has(canon)) { area.biomarkers.add(canon); addedLinks += 1; }
  }

  return { areas, unknowns, createdAreas, addedLinks };
}

// Self-tests
function runSelfTests() {
  const tests = [];
  const t = (name, fn) => {
    try {
      const v = fn();
      tests.push({ name, ok: !!v, got: v });
    } catch (e) {
      tests.push({ name, ok: false, err: String(e) });
    }
  };

  t("aggregateWeightedScore matches example (56.75)", () => {
    const rows = [
      { SCORE: 100, COLOR: "Green" },
      { SCORE: 90.93, COLOR: "Yellow" },
      { SCORE: 28.85, COLOR: "Red" },
    ];
    return aggregateWeightedScore(rows) === 56.75;
  });

  return tests;
}

export default function App() {
  const [name, setName] = useState("");
  const [areas, setAreas] = useState([]);
  const [activeAreaId, setActiveAreaId] = useState(null);
  const [biomarkerQuery, setBiomarkerQuery] = useState("");
  const [csvRows, setCsvRows] = useState([]);
  const [csvMeta, setCsvMeta] = useState();
  const [bulkText, setBulkText] = useState("");
  const [mappingMeta, setMappingMeta] = useState(null);
  const [exactPrecision, setExactPrecision] = useState(2);
  const [scoreCutoffs, setScoreCutoffs] = useState([70, 85, 95]);
  const [newCutoff, setNewCutoff] = useState("");
  const [scoreRounding, setScoreRounding] = useState("none");

  const activeArea = useMemo(
    () => areas.find((a) => a.id === activeAreaId) || null,
    [areas, activeAreaId]
  );

  const visibleBiomarkerList = useMemo(() => {
    const q = biomarkerQuery.trim().toLowerCase();
    if (!q) return BIOMARKERS;
    return BIOMARKERS.filter((b) => b.toLowerCase().includes(q));
  }, [biomarkerQuery]);

  const activeAreaGroups = useMemo(() => {
    if (!activeArea || !csvRows.length) return [];
    return groupRowsByTestId(activeArea.biomarkers || new Set(), csvRows);
  }, [activeArea, csvRows]);

  const areaScorePoints = useMemo(() => summarizeAreaScores(activeAreaGroups), [activeAreaGroups]);
  const areaScoreHistogram = useMemo(() => histogramBins(areaScorePoints, HIST_BIN_SIZE), [areaScorePoints]);
  const exactDist = useMemo(() => exactScoreDistribution(areaScorePoints, exactPrecision), [areaScorePoints, exactPrecision]);
  const perfectCount = useMemo(() => exactDist.rows.find(r => r.score === 100)?.count || 0, [exactDist]);

  // Score cutoffs analysis with optional rounding
  const cutoffAnalysis = useMemo(() => {
    if (!areaScorePoints.length) return [];
    
    // Apply rounding only for cutoff analysis if requested
    const pointsForCutoffs = scoreRounding === "none" ? areaScorePoints : 
      areaScorePoints.map(p => ({ ...p, score: applyScoreRounding(p.score, scoreRounding) }));
    
    const sortedCutoffs = [...scoreCutoffs].sort((a, b) => a - b);
    const total = pointsForCutoffs.length;
    const results = [];
    
    for (let i = 0; i < sortedCutoffs.length; i++) {
      const cutoff = sortedCutoffs[i];
      const prevCutoff = i === 0 ? 0 : sortedCutoffs[i - 1];
      
      const count = pointsForCutoffs.filter(p => {
        const score = p.score;
        if (i === 0) {
          return score >= 0 && score <= cutoff;
        } else {
          return score > prevCutoff && score <= cutoff;
        }
      }).length;
      
      const percent = total ? (count / total) * 100 : 0;
      const cumCount = pointsForCutoffs.filter(p => p.score <= cutoff).length;
      const cumPercent = total ? (cumCount / total) * 100 : 0;
      
      results.push({
        cutoff,
        range: i === 0 ? `0-${cutoff}` : `${prevCutoff + 0.01}-${cutoff}`,
        count,
        percent,
        cumCount,
        cumPercent
      });
    }
    
    if (sortedCutoffs.length > 0) {
      const highestCutoff = sortedCutoffs[sortedCutoffs.length - 1];
      const count = pointsForCutoffs.filter(p => p.score > highestCutoff).length;
      const percent = total ? (count / total) * 100 : 0;
      
      results.push({
        cutoff: 100,
        range: `${highestCutoff + 0.01}-100`,
        count,
        percent,
        cumCount: total,
        cumPercent: 100
      });
    }
    
    return results;
  }, [areaScorePoints, scoreCutoffs, scoreRounding]);

  function addArea() {
    const cleaned = (name || "").trim();
    if (!cleaned) return;
    const exists = areas.some((a) => a.name.toLowerCase() === cleaned.toLowerCase());
    if (exists) {
      alert("That health area already exists.");
      return;
    }
    const id = uid();
    const newArea = { id, name: cleaned, biomarkers: new Set() };
    setAreas((prev) => [...prev, newArea]);
    setActiveAreaId(id);
    setName("");
  }

  function removeArea(id) {
    setAreas((prev) => prev.filter((a) => a.id !== id));
    if (activeAreaId === id) setActiveAreaId(null);
  }

  function toggleBiomarker(areaId, biomarker) {
    setAreas((prev) =>
      prev.map((a) => {
        if (a.id !== areaId) return a;
        const next = new Set(a.biomarkers);
        if (next.has(biomarker)) next.delete(biomarker);
        else next.add(biomarker);
        return { ...a, biomarkers: next };
      })
    );
  }

  function handleCsvUpload(file) {
    if (!file) return;
    setCsvMeta(undefined);
    Papa.parse(file, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: ({ data, errors }) => {
        if (errors && errors.length) {
          setCsvMeta({ loaded: false, rowCount: 0, error: errors[0]?.message || "Parse error" });
          return;
        }
        const rows = (data || [])
          .map((r) => ({
            MEASURE_NAME: String(r.MEASURE_NAME ?? r.measure_name ?? r.Measure ?? "").trim(),
            TEST_ID: r.TEST_ID ?? r.test_id ?? r.TestID ?? r.id,
            LAB_CONCENTRATION: r.LAB_CONCENTRATION ?? r.lab_concentration ?? r.Value ?? r.value ?? null,
            LOWER_REFERENCE_RANGE: r.LOWER_REFERENCE_RANGE ?? r.lower_reference_range ?? r.RefLow ?? null,
            UPPER_REFERENCE_RANGE: r.UPPER_REFERENCE_RANGE ?? r.upper_reference_range ?? r.RefHigh ?? null,
            SCORE: r.SCORE ?? r.score ?? null,
            COLOR: r.COLOR ?? r.color ?? null,
            ASSAY_NAME: r.ASSAY_NAME ?? r.assay_name ?? null,
          }))
          .filter((r) => r.MEASURE_NAME);
        setCsvRows(rows);
        setCsvMeta({ loaded: true, rowCount: rows.length });
      },
      error: (err) => setCsvMeta({ loaded: false, rowCount: 0, error: err?.message || "Parse error" }),
    });
  }

  function applyMappingPairs(pairs) {
    if (!Array.isArray(pairs) || pairs.length === 0) return;
    setAreas((prev) => {
      const { areas: nextAreas, unknowns, createdAreas, addedLinks } = applyPairsPure(prev, pairs);
      setMappingMeta({ unknowns: Array.from(unknowns), createdAreas, addedLinks });
      return nextAreas;
    });
  }

  function handleMappingUpload(file) {
    if (!file) return;
    Papa.parse(file, {
      header: false,
      dynamicTyping: false,
      skipEmptyLines: true,
      complete: ({ data }) => {
        const pairs = (data || [])
          .map((row) => [String(row[0] ?? "").trim(), String(row[1] ?? "").trim()])
          .filter(([a, b]) => a && b);
        applyMappingPairs(pairs);
      },
    });
  }

  function applyMappingFromText() {
    const pairs = parseAreaBiomarkerText(bulkText);
    applyMappingPairs(pairs);
  }

  function addCutoff() {
    const value = parseFloat(newCutoff);
    if (!isNaN(value) && value >= 0 && value <= 100 && !scoreCutoffs.includes(value)) {
      setScoreCutoffs(prev => [...prev, value].sort((a, b) => a - b));
      setNewCutoff("");
    }
  }

  function removeCutoff(cutoff) {
    setScoreCutoffs(prev => prev.filter(c => c !== cutoff));
  }

  const selfTests = useMemo(() => runSelfTests(), []);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 p-6">
      <div className="mx-auto max-w-6xl">
        <header className="mb-6">
          <h1 className="text-2xl font-semibold">Health Areas & Biomarkers</h1>
          <p className="text-sm text-gray-600">
            Add health areas, then attach biomarkers to each. A biomarker can appear in multiple health areas, but only once per area.
          </p>

          {/* CSV uploader */}
          <div className="mt-4 space-y-3">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <input
                id="csvInput"
                type="file"
                accept=".csv,text/csv"
                onChange={(e) => handleCsvUpload(e.target.files?.[0] || null)}
                className="hidden"
              />
              <label
                htmlFor="csvInput"
                className="inline-flex w-full sm:w-auto items-center justify-center rounded-2xl bg-blue-600 text-white px-4 py-2 font-medium shadow hover:bg-blue-700 cursor-pointer"
              >
                Upload biomarker CSV
              </label>
              {csvMeta?.loaded && <span className="text-xs text-gray-600">Loaded {csvMeta.rowCount} rows</span>}
              {csvMeta?.error && <span className="text-xs text-red-600">{csvMeta.error}</span>}
            </div>
            
            {/* Score rounding control */}
            {csvMeta?.loaded && (
              <div className="flex items-center gap-3 text-sm bg-blue-50 p-3 rounded-lg">
                <span className="text-gray-700 font-medium">Score rounding for cutoff analysis:</span>
                <select 
                  value={scoreRounding} 
                  onChange={(e) => setScoreRounding(e.target.value)}
                  className="rounded border border-gray-300 px-3 py-1 text-sm bg-white"
                >
                  <option value="none">Use original scores</option>
                  <option value="down">Round down (floor)</option>
                  <option value="nearest">Round to nearest</option>
                  <option value="up">Round up (ceil)</option>
                </select>
                <span className="text-xs text-gray-600">
                  (Data tables show original scores; cutoffs use {scoreRounding === "none" ? "original" : "rounded"} scores)
                </span>
              </div>
            )}
          </div>
        </header>

        {/* Add Area */}
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-end mb-6">
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1" htmlFor="areaName">
              Health area name
            </label>
            <input
              id="areaName"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") addArea(); }}
              placeholder="e.g., Cardiometabolic Health"
              className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={addArea}
            className="rounded-2xl bg-blue-600 text-white px-5 py-2 font-medium shadow hover:bg-blue-700 active:translate-y-px"
            aria-label="Add health area"
          >
            Add
          </button>
        </div>

        {/* Bulk add via CSV or paste */}
        <div className="mb-6 rounded-2xl border bg-white p-4 shadow-sm">
          <h2 className="text-lg font-medium mb-2">Bulk add areas & biomarkers</h2>
          <p className="text-sm text-gray-600 mb-3">Upload a two-column CSV (AREA, BIOMARKER) or paste text with a <strong>tab</strong> or <strong>comma</strong> between columns. Biomarker names must match the predefined list (case-insensitive).</p>
          <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1" htmlFor="bulkText">Paste pairs</label>
              <textarea id="bulkText" value={bulkText} onChange={(e) => setBulkText(e.target.value)} placeholder="Health Area\tBiomarker" className="w-full rounded-2xl border border-gray-300 bg-white px-3 py-2 h-28"></textarea>
            </div>
            <div className="flex gap-3">
              <button onClick={() => applyMappingFromText()} className="rounded-2xl bg-blue-600 text-white px-4 py-2 font-medium shadow hover:bg-blue-700">Apply pasted pairs</button>
              <div>
                <input id="mapCsvInput" type="file" accept=".csv,text/csv" onChange={(e) => handleMappingUpload(e.target.files?.[0] || null)} className="hidden" />
                <label htmlFor="mapCsvInput" className="inline-flex items-center justify-center rounded-2xl bg-blue-600 text-white px-4 py-2 font-medium shadow hover:bg-blue-700 cursor-pointer">Upload mapping CSV</label>
              </div>
            </div>
          </div>
          {mappingMeta && (
            <p className="mt-2 text-xs text-gray-600">Added <strong>{mappingMeta.addedLinks}</strong> biomarker links across <strong>{mappingMeta.createdAreas}</strong> new areas. {mappingMeta.unknowns?.length ? `Skipped ${mappingMeta.unknowns.length} unknown biomarker(s).` : ""}</p>
          )}
          {mappingMeta?.unknowns?.length ? (
            <details className="mt-1">
              <summary className="text-xs text-gray-600 cursor-pointer">Show unknown biomarkers</summary>
              <ul className="text-xs list-disc pl-6">
                {mappingMeta.unknowns.slice(0, 50).map((u, i) => (<li key={`unk-${i}`}>{u}</li>))}
              </ul>
            </details>
          ) : null}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Areas list */}
          <div className="lg:col-span-1">
            <div className="rounded-2xl border bg-white p-4 shadow-sm">
              <h2 className="text-lg font-medium mb-3">Health areas</h2>
              {areas.length === 0 ? (
                <p className="text-sm text-gray-600">No health areas yet – add one above.</p>
              ) : (
                <ul className="space-y-2">
                  {areas.map((a) => (
                    <li
                      key={"area-" + a.id}
                      className={`flex items-center justify-between gap-2 rounded-xl border px-3 py-2 ${activeAreaId === a.id ? "border-blue-500 bg-blue-50" : "border-gray-200"}`}
                    >
                      <button
                        className="text-left flex-1"
                        onClick={() => setActiveAreaId(a.id)}
                        aria-label={`Select ${a.name}`}
                      >
                        <div className="font-medium">{a.name}</div>
                        <div className="text-xs text-gray-600">{a.biomarkers.size} biomarker{a.biomarkers.size === 1 ? "" : "s"}</div>
                      </button>
                      <button
                        onClick={() => removeArea(a.id)}
                        className="rounded-xl border px-3 py-1 text-sm hover:bg-gray-50"
                        aria-label={`Remove ${a.name}`}
                      >
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Biomarker panel */}
          <div className="lg:col-span-2">
            <div className="rounded-2xl border bg-white p-4 shadow-sm min-h-[320px]">
              {!activeArea ? (
                <p className="text-sm text-gray-600">Select a health area to manage its biomarkers.</p>
              ) : (
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between gap-3">
                    <h2 className="text-lg font-medium">{activeArea.name} – Biomarkers</h2>
                    <div className="text-sm text-gray-600">{activeArea.biomarkers.size} selected</div>
                  </div>

                  {/* Selected chips */}
                  <div className="flex flex-wrap gap-2">
                    {[...activeArea.biomarkers].map((b, i) => (
                      <span key={`chip-${i}-${slugForKey(b)}`} className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm">
                        {b}
                        <button className="text-gray-600 hover:text-red-600" onClick={() => toggleBiomarker(activeArea.id, b)} aria-label={`Remove ${b}`}>
                          ×
                        </button>
                      </span>
                    ))}
                    {activeArea.biomarkers.size === 0 && <span className="text-sm text-gray-500">No biomarkers selected yet.</span>}
                  </div>

                  {/* Search & list */}
                  <div>
                    <label className="block text-sm font-medium mb-1" htmlFor="bmSearch">Search biomarkers</label>
                    <input
                      id="bmSearch"
                      type="text"
                      value={biomarkerQuery}
                      onChange={(e) => setBiomarkerQuery(e.target.value)}
                      placeholder="Type to filter the biomarker list"
                      className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="max-h-80 overflow-auto rounded-xl border">
                    <table className="w-full text-left text-sm">
                      <thead className="sticky top-0 bg-gray-50">
                        <tr>
                          <th className="px-3 py-2 w-[60%]">Biomarker</th>
                          <th className="px-3 py-2">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {visibleBiomarkerList.map((b, i) => {
                          const selected = activeArea.biomarkers.has(b);
                          return (
                            <tr key={`bm-${i}-${slugForKey(b)}`} className="border-t">
                              <td className="px-3 py-2 align-top">{b}</td>
                              <td className="px-3 py-2">
                                <button
                                  onClick={() => toggleBiomarker(activeArea.id, b)}
                                  className={`rounded-xl px-3 py-1 text-sm border ${selected ? "bg-green-50 border-green-600 text-green-700" : "hover:bg-gray-50"}`}
                                  aria-label={`${selected ? "Remove" : "Add"} ${b}`}
                                >
                                  {selected ? "Remove" : "Add"}
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Histogram */}
                  <div className="mt-4 rounded-2xl border bg-white p-4 shadow-sm">
                    <h3 className="text-base font-medium mb-2">Health area score histogram (per TestID)</h3>
                    {!csvMeta?.loaded || areaScoreHistogram.reduce((acc, b) => acc + b.count, 0) === 0 ? (
                      <p className="text-sm text-gray-600">Histogram appears after you upload a CSV and compute at least one non-NR score.</p>
                    ) : (
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={areaScoreHistogram} margin={{ top: 10, right: 20, bottom: 5, left: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis type="number" dataKey="binCenter" domain={[-HIST_BIN_SIZE / 2, 100 + HIST_BIN_SIZE / 2]} ticks={[0,10,20,30,40,50,60,70,80,90,100]} allowDecimals={false} />
                            <YAxis allowDecimals={false} />
                            <Tooltip labelFormatter={(x) => { const start = Math.max(0, Math.round(x - HIST_BIN_SIZE / 2)); const end = Math.min(100, Math.round(x + HIST_BIN_SIZE / 2)); return `Score ${start}-${end}`; }} formatter={(v) => [v, "TestIDs"]} />
                            <ReferenceLine x={70} stroke="#ffc800" strokeDasharray="3 3" />
                            <ReferenceLine x={91} stroke="#3fb6dc" strokeDasharray="3 3" />
                            <Bar dataKey="count" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                  </div>

                  {/* Exact score distribution */}
                  <div className="rounded-2xl border bg-white p-4 shadow-sm">
                    <div className="flex items-center justify-between">
                      <h3 className="text-base font-medium">Exact score distribution</h3>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-gray-600">Precision:</span>
                        {[0,1,2].map(d => (
                          <button key={`prec-${d}`} onClick={() => setExactPrecision(d)} className={`rounded-full border px-3 py-1 ${exactPrecision===d? 'bg-blue-600 text-white border-blue-700':'hover:bg-gray-50'}`}>{d} dec</button>
                        ))}
                        <button onClick={() => downloadCsv(`score_distribution_${exactPrecision}dec.csv`, exactDist.rows.map(r => ({ score: r.score, count: r.count, percent: (Math.round(r.percent*100)/100).toFixed(2), cumPercent: (Math.round(r.cumPercent*100)/100).toFixed(2) })), ['score','count','percent','cumPercent'])} className="ml-2 rounded-full border px-3 py-1 hover:bg-gray-50">Download CSV</button>
                      </div>
                    </div>

                    {!csvMeta?.loaded || exactDist.total === 0 ? (
                      <p className="text-sm text-gray-600 mt-2">Distribution appears after you upload a CSV and compute at least one non-NR score.</p>
                    ) : (
                      <>
                        <p className="text-sm text-gray-700 mt-2">
                          Perfect 100s: <strong>{perfectCount}</strong> / {exactDist.total} ({formatPct((perfectCount/exactDist.total)*100)})
                        </p>
                        <div className="mt-3 max-h-64 overflow-auto rounded border">
                          <table className="w-full text-left text-sm">
                            <thead className="sticky top-0 bg-gray-50">
                              <tr>
                                <th className="px-3 py-2">Score</th>
                                <th className="px-3 py-2">Count</th>
                                <th className="px-3 py-2">% of total</th>
                                <th className="px-3 py-2">Cumulative %</th>
                              </tr>
                            </thead>
                            <tbody>
                              {exactDist.rows.map((r, i) => (
                                <tr key={`dist-${i}`} className="border-t">
                                  <td className="px-3 py-2">{r.score.toFixed(exactPrecision)}</td>
                                  <td className="px-3 py-2">{r.count}</td>
                                  <td className="px-3 py-2">{formatPct(r.percent)}</td>
                                  <td className="px-3 py-2">{formatPct(r.cumPercent)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Score cutoffs analysis */}
                  <div className="rounded-2xl border bg-white p-4 shadow-sm">
                    <h3 className="text-base font-medium mb-2">Score cutoffs analysis</h3>
                    
                    <div className="mb-4">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className="text-sm text-gray-600">Current cutoffs:</span>
                        {scoreCutoffs.map(cutoff => (
                          <span key={`cutoff-${cutoff}`} className="inline-flex items-center gap-1 rounded-full border px-2 py-1 text-xs">
                            {cutoff}
                            <button 
                              onClick={() => removeCutoff(cutoff)} 
                              className="text-gray-600 hover:text-red-600"
                              aria-label={`Remove cutoff ${cutoff}`}
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                      
                      <div className="flex gap-2 items-end">
                        <div className="flex-1">
                          <label className="block text-xs text-gray-600 mb-1">Add cutoff (0-100)</label>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            step="0.01"
                            value={newCutoff}
                            onChange={(e) => setNewCutoff(e.target.value)}
                            onKeyDown={(e) => { if (e.key === "Enter") addCutoff(); }}
                            placeholder="e.g., 75"
                            className="w-full rounded border border-gray-300 px-2 py-1 text-sm"
                          />
                        </div>
                        <button
                          onClick={addCutoff}
                          className="rounded border px-3 py-1 text-sm hover:bg-gray-50"
                        >
                          Add
                        </button>
                      </div>
                    </div>

                    {!csvMeta?.loaded || cutoffAnalysis.length === 0 ? (
                      <p className="text-sm text-gray-600">Cutoff analysis appears after you upload a CSV and compute at least one non-NR score.</p>
                    ) : (
                      <>
                        <div className="mb-3">
                          <button 
                            onClick={() => downloadCsv(
                              'score_cutoffs_analysis.csv', 
                              cutoffAnalysis.map(r => ({ 
                                range: r.range, 
                                count: r.count, 
                                percent: (Math.round(r.percent*100)/100).toFixed(2), 
                                cumCount: r.cumCount,
                                cumPercent: (Math.round(r.cumPercent*100)/100).toFixed(2) 
                              })), 
                              ['range','count','percent','cumCount','cumPercent']
                            )} 
                            className="rounded border px-3 py-1 text-sm hover:bg-gray-50"
                          >
                            Download CSV
                          </button>
                        </div>
                        
                        <div className="max-h-48 overflow-auto rounded border">
                          <table className="w-full text-left text-sm">
                            <thead className="sticky top-0 bg-gray-50">
                              <tr>
                                <th className="px-3 py-2">Score Range</th>
                                <th className="px-3 py-2">Count</th>
                                <th className="px-3 py-2">% in Range</th>
                                <th className="px-3 py-2">Cum. Count</th>
                                <th className="px-3 py-2">Percentile</th>
                              </tr>
                            </thead>
                            <tbody>
                              {cutoffAnalysis.map((r, i) => (
                                <tr key={`cutoff-${i}`} className="border-t">
                                  <td className="px-3 py-2">{r.range}</td>
                                  <td className="px-3 py-2">{r.count}</td>
                                  <td className="px-3 py-2">{formatPct(r.percent)}</td>
                                  <td className="px-3 py-2">{r.cumCount}</td>
                                  <td className="px-3 py-2">{formatPct(r.cumPercent)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Grouped Data View */}
                  <div className="mt-6">
                    <h3 className="text-base font-medium mb-2">Data for selected biomarkers (from CSV)</h3>
                    {!csvMeta?.loaded ? (
                      <p className="text-sm text-gray-600">Upload a CSV to see data for selected biomarkers.</p>
                    ) : activeAreaGroups.length === 0 ? (
                      <p className="text-sm text-gray-600">No matching rows for the selected biomarkers in this health area.</p>
                    ) : (
                      <details className="rounded-2xl border bg-white">
                        <summary className="cursor-pointer select-none px-3 py-2 text-sm">Per-TestID details ({activeAreaGroups.length})</summary>
                        <div className="p-3 space-y-3">
                          {activeAreaGroups.map((group) => {
                            const agg = aggregateWeightedScore(group.rows);
                            const chipColor = scoreBandColor(agg);
                            return (
                              <div key={`tid-${group.testId}`} className="rounded-xl border bg-white">
                                <div className="px-3 py-2 text-sm flex items-center justify-between">
                                  <span>
                                    <span className="font-medium">TestID:</span> {group.testId}
                                    <span className="ml-2 text-gray-600">• {group.rows.length} row{group.rows.length === 1 ? "" : "s"}</span>
                                    <span className="ml-3 inline-flex items-center gap-2 rounded-full px-2 py-1 text-xs" style={{ backgroundColor: chipColor, color: idealTextColor(chipColor) }}>
                                      Area score: {agg === null ? "–" : `${agg.toFixed(2)}`}
                                    </span>
                                  </span>
                                </div>
                                <div className="px-3 pb-3 overflow-auto">
                                  <table className="w-full text-left text-sm">
                                    <thead className="sticky top-0 bg-gray-50">
                                      <tr>
                                        <th className="px-3 py-2">Biomarker</th>
                                        <th className="px-3 py-2">Lab Conc.</th>
                                        <th className="px-3 py-2">Ref Low</th>
                                        <th className="px-3 py-2">Ref High</th>
                                        <th className="px-3 py-2">Score</th>
                                        <th className="px-3 py-2">Color</th>
                                        <th className="px-3 py-2">Assay</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {group.rows.map((r, i) => (
                                        <tr key={`row-${group.testId}-${i}-${slugForKey(r.__BIOMARKER__)}`} className="border-t">
                                          <td className="px-3 py-2 align-top font-semibold rounded" style={{ backgroundColor: colorHexFromName(r.COLOR), color: idealTextColor(colorHexFromName(r.COLOR)) }}>{r.__BIOMARKER__}</td>
                                          <td className="px-3 py-2 align-top">{r.LAB_CONCENTRATION ?? ""}</td>
                                          <td className="px-3 py-2 align-top">{r.LOWER_REFERENCE_RANGE ?? ""}</td>
                                          <td className="px-3 py-2 align-top">{r.UPPER_REFERENCE_RANGE ?? ""}</td>
                                          <td className="px-3 py-2 align-top">{(r.SCORE ?? "") === "" ? (isNR(r) ? "NR" : "") : r.SCORE}</td>
                                          <td className="px-3 py-2 align-top">{(r.COLOR ?? "") === "" ? (isNR(r) ? "NR" : "") : r.COLOR}</td>
                                          <td className="px-3 py-2 align-top">{r.ASSAY_NAME ?? ""}</td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </details>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Debug / preview JSON */}
        <details className="mt-6">
          <summary className="cursor-pointer text-sm text-gray-600">Show current state (JSON)</summary>
          <pre className="mt-2 whitespace-pre-wrap rounded-xl bg-gray-900 text-gray-100 p-4 text-xs overflow-auto">{JSON.stringify(
  areas.map((a) => ({ id: a.id, name: a.name, biomarkers: [...a.biomarkers] })),
  null,
  2
)}</pre>
        </details>

        {/* Self-test results */}
        <details className="mt-3">
          <summary className="cursor-pointer text-sm text-gray-600">Show self-test results</summary>
          <ul className="mt-2 list-disc pl-6 text-sm">
            {selfTests.map((t, i) => (
              <li key={`test-${i}`} className={t.ok ? "text-green-700" : "text-red-700"}>
                {t.ok ? "✅" : "❌"} {t.name}{t.err ? ` — ${t.err}` : ""}{t.got !== undefined && t.err === undefined ? ` (got: ${t.got})` : ""}
              </li>
            ))}
          </ul>
        </details>
      </div>
    </div>
  );
}