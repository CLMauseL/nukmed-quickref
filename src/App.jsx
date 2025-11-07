import React, { useEffect, useMemo, useState } from "react";

// ======================================================
// NukMed QuickRef – App.jsx
// Quelle der Daten: /public/radiopharmaka.json (relativ)
// ======================================================

const DATA_URL = "/radiopharmaka.json";

// ---------- Zerfalls-Rechner (unverändert von dir) ----------
function decay(A0, t_hours, T12_h) {
  if (!A0 || !T12_h) return 0;
  const frac = Math.pow(0.5, t_hours / T12_h);
  return A0 * frac;
}
function timeToTarget(A0, At, T12_h) {
  if (!A0 || !At || !T12_h || At <= 0 || A0 <= 0 || At >= A0) return null;
  const nHalf = Math.log(At / A0) / Math.log(0.5);
  return Math.abs(nHalf) * T12_h;
}

function DecayCalc({ dataset }) {
  const radionuclides = useMemo(
    () => Array.from(new Set((dataset || []).map((d) => d.radionuclide))),
    [dataset]
  );

  const HL = {
    "Tc-99m": 6.02,
    "F-18": 1.83,
    "Ga-68": 1.13,
    "Rb-82": 0.0187,
    "Lu-177": 159.6,
    "I-123": 13.2,
    "I-131": 192.5,
    "In-111": 67.3,
    "Tl-201": 73.1,
    "Sm-153": 46.3,
    "Sr-89": 1216,
    "Re-186": 90.6,
    "Re-188": 17,
    "Y-90": 64.1,
    "Ho-166": 26.8,
    "Cu-64": 12.7,
    "Zr-89": 78.4,
    "C-11": 0.334,
    "N-13": 0.167,
    "O-15": 0.033,
    "Xe-133": 120,
    "Kr-81m": 0.0036,
    "I-124": 100.2,
    "Ga-67": 78.3,
  };

  const [nuclide, setNuclide] = useState(radionuclides[0] ?? "");
  const [A0, setA0] = useState(1000);
  const [tH, setTH] = useState(1);
  const [tMin, setTMin] = useState(0);
  const [target, setTarget] = useState(0);
  const [unit, setUnit] = useState("MBq");

  useEffect(() => {
    if (radionuclides.length && !radionuclides.includes(nuclide)) {
      setNuclide(radionuclides[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [radionuclides]);

  const T12 =
    HL[nuclide] ??
    Number(dataset.find((d) => d.radionuclide === nuclide)?.halfLife_h || 1);

  const tHours = Number(tH) + Number(tMin) / 60;
  const convIn = (v) => (unit === "mCi" ? v * 37 : v);
  const convOut = (v) => (unit === "mCi" ? v / 37 : v);

  const A0_MBq = convIn(Number(A0) || 0);
  const At_MBq = decay(A0_MBq, tHours, T12);
  const At_disp = convOut(At_MBq);

  const tgt_MBq = convIn(Number(target) || 0);
  const tToTgt_h = target > 0 ? timeToTarget(A0_MBq, tgt_MBq, T12) : null;

  return (
    <section className="mt-8 rounded-2xl border p-4 bg-white/70 dark:bg-neutral-900/60">
      <h3 className="text-lg font-bold">Zerfallsrechner</h3>
      <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4 items-end">
        <div>
          <label className="text-sm font-semibold">Nuklid</label>
          <select
            className="mt-1 w-full rounded-xl border px-3 py-2 bg-white/80 dark:bg-neutral-800/60"
            value={nuclide}
            onChange={(e) => setNuclide(e.target.value)}
          >
            {radionuclides.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
          <div className="text-xs opacity-70 mt-1">T½ = {T12} h</div>
        </div>
        <div>
          <label className="text-sm font-semibold">Ausgangsaktivität ({unit})</label>
          <input
            className="mt-1 w-full rounded-xl border px-3 py-2 bg-white/80 dark:bg-neutral-800/60"
            type="number"
            value={A0}
            onChange={(e) => setA0(e.target.value)}
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-sm font-semibold">Zeit (h)</label>
            <input
              className="mt-1 w-full rounded-xl border px-3 py-2 bg-white/80 dark:bg-neutral-800/60"
              type="number"
              value={tH}
              onChange={(e) => setTH(e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm font-semibold">Zeit (min)</label>
            <input
              className="mt-1 w-full rounded-xl border px-3 py-2 bg-white/80 dark:bg-neutral-800/60"
              type="number"
              value={tMin}
              onChange={(e) => setTMin(e.target.value)}
            />
          </div>
        </div>
        <div>
          <label className="text-sm font-semibold">Einheit</label>
          <select
            className="mt-1 w-full rounded-xl border px-3 py-2 bg-white/80 dark:bg-neutral-800/60"
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
          >
            <option>MBq</option>
            <option>mCi</option>
          </select>
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-xl border p-3">
          <div className="text-sm opacity-70">Aktivität nach t</div>
          <div className="text-2xl font-bold">
            {Number.isFinite(At_disp) ? At_disp.toFixed(2) : "–"} {unit}
          </div>
          <div className="text-xs opacity-70">
            nach {tH} h {tMin > 0 ? `${tMin} min` : ""}
          </div>
        </div>
        <div className="rounded-xl border p-3">
          <div className="text-sm opacity-70">Halbwertszeiten verstrichen</div>
          <div className="text-xl font-semibold">{(tHours / T12).toFixed(3)} × T½</div>
        </div>
        <div className="rounded-xl border p-3">
          <div className="text-sm opacity-70">Zerfallskonstante (λ)</div>
          <div className="text-xl font-semibold">
            {(Math.log(2) / T12).toFixed(5)} h⁻¹
          </div>
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 items-end">
        <div className="sm:col-span-2">
          <label className="text-sm font-semibold">Zeit bis Zielaktivität ({unit})</label>
          <div className="grid grid-cols-[1fr_auto] gap-2">
            <input
              className="mt-1 w-full rounded-xl border px-3 py-2 bg-white/80 dark:bg-neutral-800/60"
              type="number"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              placeholder="z. B. 370"
            />
            <button onClick={() => setTarget(0)} className="rounded-xl border px-3 py-2">
              Reset
            </button>
          </div>
          {tToTgt_h != null && (
            <div className="text-sm mt-2">
              ≈ <b>{tToTgt_h.toFixed(2)}</b> h • {(tToTgt_h / 24).toFixed(2)} d •{" "}
              {(tToTgt_h * 60).toFixed(0)} min
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

// ---------- UI ----------
function Pill({ text }) {
  return (
    <span className="inline-block rounded-full border px-2 py-0.5 text-xs font-medium">
      {text}
    </span>
  );
}
function Header({ tab, setTab }) {
  const base = "px-3 py-2 rounded-xl border text-sm font-medium";
  const active =
    "bg-black text-white dark:bg-white dark:text-black border-black dark:border-white";
  const idle = "bg-white/70 dark:bg-neutral-900/60 hover:bg-white border";
  return (
    <header className="sticky top-0 z-10 backdrop-blur bg-white/70 dark:bg-neutral-900/70 border-b">
      <div className="max-w-6xl mx-auto px-4 py-3">
        <div className="flex flex-col gap-2">
          <div className="flex items-baseline justify-between">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight">NukMed QuickRef</h1>
            <div className="text-xs opacity-70">Spick • ohne Gewähr</div>
          </div>
          <div className="flex gap-2">
            <button
              className={`${base} ${tab === "overview" ? active : idle}`}
              onClick={() => setTab("overview")}
            >
              📘 Übersicht
            </button>
            <button
              className={`${base} ${tab === "decay" ? active : idle}`}
              onClick={() => setTab("decay")}
            >
              ⚛️ Zerfallsrechner
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

// ---------- App ----------
export default function App() {
  // Daten laden
  const [items, setItems] = useState([]);
  const [loadErr, setLoadErr] = useState("");

  useEffect(() => {
    const url = `${DATA_URL}?v=${Date.now()}`; // Cache-Busting gegen SW/Browser-Cache
    fetch(url, { cache: "no-store" })
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((data) => setItems(Array.isArray(data) ? data : []))
      .catch((e) => setLoadErr(`Daten-Laden fehlgeschlagen: ${e.message}`));
  }, []);

  // UI-States
  const [q, setQ] = useState("");
  const [mod, setMod] = useState("Alle");
  const [org, setOrg] = useState("Alle");
  const [sort, setSort] = useState("alpha");
  const [favs, setFavs] = useState(new Set());
  const [tab, setTab] = useState("overview");

  // Ableitungen
  const ORGANS = useMemo(
    () => ["Alle", ...Array.from(new Set(items.map((d) => d.organ))).sort()],
    [items]
  );
  const MODALITIES = useMemo(
    () => ["Alle", ...Array.from(new Set(items.map((d) => d.modality))).sort()],
    [items]
  );

  const filtered = useMemo(() => {
    const qLower = q.trim().toLowerCase();
    let arr = (items || []).filter((d) => {
      const hay = [d.radionuclide, d.prep, d.organ, d.emissions, ...(d.indications || [])]
        .join(" ")
        .toLowerCase();
      const hitQ = !qLower || hay.includes(qLower);
      const hitMod = mod === "Alle" || d.modality === mod;
      const hitOrg = org === "Alle" || d.organ === org;
      return hitQ && hitMod && hitOrg;
    });

    if (sort === "alpha") arr.sort((a, b) => (a.prep || "").localeCompare(b.prep || ""));
    if (sort === "halfLife") {
      const hl = (x) => Number(x.halfLife_h ?? parseFloat(x.halfLife)) || Number.POSITIVE_INFINITY;
      arr.sort((a, b) => hl(a) - hl(b));
    }
    return arr;
  }, [items, q, mod, org, sort]);

  function toggleFav(id) {
    setFavs((prev) => {
      const n = new Set(prev);
      const key = id || Math.random().toString(36).slice(2);
      if (n.has(key)) n.delete(key);
      else n.add(key);
      return n;
    });
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-neutral-50 dark:from-neutral-900 dark:to-black text-neutral-900 dark:text-neutral-100">
      <Header tab={tab} setTab={setTab} />
      <main className="max-w-6xl mx-auto px-4 py-6">

        {/* Lade-/Fehlerstatus */}
        {loadErr && (
          <div className="mb-4 rounded-xl border border-red-300 bg-red-50 text-red-800 p-3 text-sm">
            {loadErr}
          </div>
        )}
        {!loadErr && items.length === 0 && (
          <div className="mb-4 text-sm opacity-70">Lade Daten…</div>
        )}

        {/* Controls */}
        {tab === "overview" && (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 items-end">
            <div className="sm:col-span-2">
              <label className="text-sm font-semibold">Suche</label>
              <input
                className="mt-1 w-full rounded-xl border px-3 py-2 bg-white/80 dark:bg-neutral-800/60 outline-none focus:ring-2"
                placeholder="z. B. FDG, PSMA, DOTATATE, Schilddrüse, NET…"
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-semibold">Modalität</label>
              <select
                className="mt-1 w-full rounded-xl border px-3 py-2 bg-white/80 dark:bg-neutral-800/60"
                value={mod}
                onChange={(e) => setMod(e.target.value)}
              >
                {MODALITIES.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-semibold">Organ-System</label>
              <select
                className="mt-1 w-full rounded-xl border px-3 py-2 bg-white/80 dark:bg-neutral-800/60"
                value={org}
                onChange={(e) => setOrg(e.target.value)}
              >
                {ORGANS.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
            </div>
            <div className="lg:col-span-4 flex gap-2 items-center">
              <label className="text-sm font-semibold">Sortierung</label>
              <select
                className="mt-1 rounded-xl border px-3 py-2 bg-white/80 dark:bg-neutral-800/60"
                value={sort}
                onChange={(e) => setSort(e.target.value)}
              >
                <option value="alpha">A–Z (Präparat)</option>
                <option value="halfLife">Halbwertszeit</option>
              </select>
              <div className="text-xs opacity-70 ml-auto">Favoriten: {favs.size}</div>
            </div>
          </div>
        )}

        {/* Overview */}
        {tab === "overview" && (
          <>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {filtered.map((d) => (
                <article
                  key={d.id || d.prep}
                  className="rounded-2xl border p-4 shadow-sm bg-white/70 dark:bg-neutral-900/60"
                >
                  <div className="flex items-start gap-3">
                    <div className="grow">
                      <h2 className="text-lg font-bold tracking-tight">
                        {d.prep} <span className="opacity-70 font-normal">({d.radionuclide})</span>
                      </h2>
                      <div className="mt-1 flex flex-wrap gap-1">
                        <Pill text={d.modality} />
                        <Pill text={d.organ} />
                      </div>
                    </div>
                    <button
                      onClick={() => toggleFav(d.id || d.prep)}
                      title="Favorit umschalten"
                      className={`rounded-full border px-3 py-1 text-xs font-medium ${
                        favs.has(d.id || d.prep)
                          ? "bg-yellow-300/70"
                          : "bg-white/50 dark:bg-neutral-800/60"
                      }`}
                    >
                      {favs.has(d.id || d.prep) ? "★" : "☆"}
                    </button>
                  </div>

                  <dl className="mt-3 text-sm leading-6">
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <dt className="font-semibold">Halbwertszeit</dt>
                        <dd>
                          {(() => {
                            const v = d.halfLife_h ?? d.halfLife;
                            return v ? `${v} h` : "–";
                          })()}
                        </dd>
                      </div>
                      <div>
                        <dt className="font-semibold">Emissionen</dt>
                        <dd>{d.emissions}</dd>
                      </div>
                      <div>
                        <dt className="font-semibold">Erwachsenen-Dosis</dt>
                        <dd>{d.adultDoseMBq}</dd>
                      </div>
                    </div>
                    <div className="mt-2">
                      <dt className="font-semibold">Indikationen</dt>
                      <dd className="opacity-90">{(d.indications || []).join(" • ")}</dd>
                    </div>
                    {d.notes && (
                      <div className="mt-2">
                        <dt className="font-semibold">Hinweise</dt>
                        <dd className="opacity-90">{d.notes}</dd>
                      </div>
                    )}
                    {d.explanation && (
                      <div className="mt-2">
                        <dt className="font-semibold">Erklärung</dt>
                        <dd className="opacity-90">{d.explanation}</dd>
                      </div>
                    )}
                  </dl>
                </article>
              ))}
            </div>

            {filtered.length === 0 && items.length > 0 && (
              <div className="mt-10 text-center opacity-70">
                Keine Einträge gefunden. Suchbegriff oder Filter anpassen.
              </div>
            )}
          </>
        )}

        {/* Decay Tab */}
        {tab === "decay" && <DecayCalc dataset={items} />}

        <footer className="mt-10 text-xs opacity-70 leading-relaxed">
          <p>
            ✋ Achtung: Diese Übersicht ist ein vereinfachter Spickzettel. Dosisangaben und
            Vorbereitung können je nach Hausstandard variieren. Massgebend sind lokale SOPs und
            ärztliche Anordnung.
          </p>
        </footer>
      </main>
    </div>
  );
}
