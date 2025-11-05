import React, { useMemo, useState } from "react";

// NukMed QuickRef – stabile, fehlerfreie Single‑File App.jsx
// Features:
//  • Tabs: Übersicht / Zerfallsrechner
//  • Suche + Filter (Modalität, Organ)
//  • Sortierung (A–Z / Halbwertszeit)
//  • Favoriten (lokal im State)
//  • Datensätze: FDG, PSMA (Ga‑68/F‑18), DOTATATE, FET, Rubidium‑82, DPD/Teceos (Skelett), u. a.
// Hinweis: Spickzettel; verbindlich sind lokale SOPs/Ärzt:innen.

// ================== Daten ==================
// Schema: { id, radionuclide, prep, modality, organ, indications[], halfLife_h, emissions, adultDoseMBq, notes }
const DATA = [
  // --- SPECT Standard ---
  { id: "tc99m-dpd", radionuclide: "Tc-99m", prep: "DPD (Teceos) – Skelett", modality: "SPECT", organ: "Skelett", indications: ["Skelettszintigraphie (Metastasen/Rheuma/Infekt)", "SPECT/CT"], halfLife_h: 6.02, emissions: "γ 140 keV", adultDoseMBq: "500–800 MBq", notes: "Gute Hydrierung; Miktion fördern; Wartezeit je nach Protokoll.", explanation: "99mTc-DPD (Teceos) bindet an Hydroxylapatit in aktivem Knochenumbau – hohe Aufnahme bei osteoblastischer Aktivität (Metastasen, Frakturen, Entzündung)." },
  { id: "tc99m-maa", radionuclide: "Tc-99m", prep: "MAA (Lungenperfusion)", modality: "SPECT", organ: "Lunge", indications: ["V/Q-Diagnostik", "Shunt/TARE-Planung"], halfLife_h: 6.02, emissions: "γ 140 keV", adultDoseMBq: "100–200 MBq", notes: "Partikelzahl anpassen (Shunt, Schwangerschaft).", explanation: "Makroaggregierte Albuminpartikel bleiben in den Lungenkapillaren hängen – so entsteht eine Karte der Lungenperfusion." },
  { id: "tc99m-hida", radionuclide: "Tc-99m", prep: "HIDA/Mebrofenin (Hepatobiliär)", modality: "SPECT", organ: "Leber/Galle", indications: ["Cholezystitis/GB-Funktion", "Leberfunktion (cMUR)"], halfLife_h: 6.02, emissions: "γ 140 keV", adultDoseMBq: "100–200 MBq", notes: "Nüchternstatus nach Protokoll; ggf. Morphin-Provokation.", explanation: "Hepatobiliäre Tracer werden von Hepatozyten aufgenommen und biliär ausgeschieden – Darstellung von Aufnahme, GB-Füllung und Abfluss." },

  // --- PET Standard ---
  { id: "f18-fdg", radionuclide: "F-18", prep: "FDG (Glukoseanalogon)", modality: "PET", organ: "Onkologie/Entzündung", indications: ["Staging/Restaging", "Infekt/Entzündung"], halfLife_h: 1.83, emissions: "β+ (511 keV)", adultDoseMBq: "150–300 MBq", notes: "Nüchtern 4–6 h; Glukose/Insulin prüfen; Aktivität vor Injektion reduzieren.", explanation: "FDG ist ein Glukoseanalogon: Aufnahme via GLUT, Phosphorylierung zu FDG-6-P und intrazelluläre Trapping – hohe Anreicherung in hochmetabolischen Zellen (Tumor, Entzündung, Gehirn)." },
  { id: "ga68-psma11", radionuclide: "Ga-68", prep: "PSMA-11", modality: "PET", organ: "Prostata", indications: ["PSMA-PET (Primär/Rezidiv)", "Staging/Restaging"], halfLife_h: 1.13, emissions: "β+ (511 keV)", adultDoseMBq: "100–200 MBq", notes: "Hydrierung; renale Exkretion.", explanation: "Bindet an PSMA, das auf Prostatakarzinomzellen überexprimiert ist – hoher Tumor-Hintergrund-Kontrast für kleine Läsionen." },
  { id: "f18-psma1007", radionuclide: "F-18", prep: "PSMA-1007", modality: "PET", organ: "Prostata", indications: ["PSMA-PET (Primär/Rezidiv)"], halfLife_h: 1.83, emissions: "β+ (511 keV)", adultDoseMBq: "150–300 MBq", notes: "Hepatobiliäre Exkretion; Becken-Aufnahme beachten.", explanation: "PSMA-Ligand mit geringer renaler Exkretion → weniger Blasenaktivität; teils vorteilhaft für Beckenbefunde." },
  { id: "ga68-dotatate", radionuclide: "Ga-68", prep: "DOTATATE (SSTR)", modality: "PET", organ: "Neuroendokrine Tumoren", indications: ["SSTR-PET", "Theranostik-Planung"], halfLife_h: 1.13, emissions: "β+ (511 keV)", adultDoseMBq: "100–200 MBq", notes: "Somatostatin-Analoga ggf. pausieren (kurz/lang wirksam).", explanation: "Peptid bindet an Somatostatin-Rezeptoren (v. a. SSTR2) – ideale NET-Detektion und Theranostik-Partner (177Lu-PRRT)." },
  { id: "f18-fet", radionuclide: "F-18", prep: "FET (Tyrosin)", modality: "PET", organ: "Neuro", indications: ["Gliome/Rezidiv vs. Strahlennekrose"], halfLife_h: 1.83, emissions: "β+ (511 keV)", adultDoseMBq: "150–200 MBq", notes: "Ruhige Umgebung; Protokoll zentrumsabhängig.", explanation: "Aminosäure-Tracer; LAT1-vermittelter Transport spiegelt gesteigerten Aminosäureumsatz von Gliomen wider." },
  { id: "rb82-rubidium", radionuclide: "Rb-82", prep: "Rubidium (Herz-Perfusion)", modality: "PET", organ: "Herz", indications: ["Myokardperfusions-PET (Ruhe/Stress)"], halfLife_h: 0.0187, emissions: "β+ (511 keV)", adultDoseMBq: "1100–1500 MBq", notes: "82Sr/82Rb-Generator; sofortige Akquisition.", explanation: "Kalium-Analogon – schnelle Aufnahme in Kardiomyozyten proportional zur Durchblutung; ideal für dynamische Perfusions-PET." },
  { id: "lu177-psma617", radionuclide: "Lu-177", prep: "PSMA-617 (RLT)", modality: "Therapie", organ: "Prostata", indications: ["Radioligandentherapie mCRPC"], halfLife_h: 159.6, emissions: "β- + γ (208/113 keV)", adultDoseMBq: "7.4 GBq/Zyklus (typ. ×4)", notes: "Aminosäure-Renoprotektion/Blutbild/Niere beachten; Strahlenschutz.", explanation: "Theranostik: PSMA-gerichtetes Ligand trägt 177Lu – β-Strahlung zerstört Tumorzellen; γ erlaubt Dosimetrie/Planung." },

  // --- SPECT Niere/Endokrin/Leber ---
  { id: "tc99m-mag3", radionuclide: "Tc-99m", prep: "MAG3 (Niere/Drainage)", modality: "SPECT", organ: "Niere", indications: ["Diurese-Szinti", "Abflussstörung"], halfLife_h: 6.02, emissions: "γ 140 keV", adultDoseMBq: "50–120 MBq", notes: "Furosemid/Diurese nach Protokoll", explanation: "Sekretion über Tubulus (effektive renale Plasma-Clearance)." },
  { id: "tc99m-dtpa", radionuclide: "Tc-99m", prep: "DTPA (GFR)", modality: "SPECT", organ: "Niere", indications: ["GFR-Bestimmung", "Renographie"], halfLife_h: 6.02, emissions: "γ 140 keV", adultDoseMBq: "50–150 MBq", notes: "Plasmaclearance/Patlak möglich", explanation: "Glomeruläre Filtration ohne tubuläre Rückresorption." },
  { id: "tc99m-dmsa", radionuclide: "Tc-99m", prep: "DMSA (Kortikal)", modality: "SPECT", organ: "Niere", indications: ["Narben/Relativfunktion"], halfLife_h: 6.02, emissions: "γ 140 keV", adultDoseMBq: "80–120 MBq", notes: "Spätaufnahmen", explanation: "Kortikale Bindung in proximalen Tubuli – Nierenkortex-Abbildung." },
  { id: "tc99m-pertechnetat", radionuclide: "Tc-99m", prep: "Pertechnetat (Schilddrüse/Meckel)", modality: "SPECT", organ: "Schilddrüse", indications: ["Thyreoidea-Szinti", "Meckel-Divertikel"], halfLife_h: 6.02, emissions: "γ 140 keV", adultDoseMBq: "70–150 MBq", notes: "Perchlorat-Block prüfen", explanation: "Aufnahme über NIS (wie Iodid), keine Organifikation." },
  { id: "i123-iodid", radionuclide: "I-123", prep: "Iodid (Schilddrüse)", modality: "SPECT", organ: "Schilddrüse", indications: ["Uptake/Diagnostik"], halfLife_h: 13.2, emissions: "γ 159 keV", adultDoseMBq: "10–20 MBq", notes: "Jodexposition/Block prüfen", explanation: "Aufnahme über NIS; diagnostische Jod-Tracer ohne hohe β-Komponente." },
  { id: "i131-iodid", radionuclide: "I-131", prep: "Iodid Therapie", modality: "Therapie", organ: "Schilddrüse", indications: ["Hyperthyreose", "Ablation/Metastasen"], halfLife_h: 192.5, emissions: "β- + γ", adultDoseMBq: "je nach Indikation", notes: "Strahlenschutz/Isolation", explanation: "β-Zerfall zerstört Schilddrüsengewebe; γ für Imaging." },

  // --- SPECT Herz/Neuro/RES ---
  { id: "tc99m-mibi", radionuclide: "Tc-99m", prep: "Sestamibi (MIBI)", modality: "SPECT", organ: "Parathyreoidea/Myokard", indications: ["Nebenschilddrüse", "Myokardperfusions-SPECT"], halfLife_h: 6.02, emissions: "γ 140 keV", adultDoseMBq: "600–900 MBq (Myokard)", notes: "Dual-Phase Parathyreoidea", explanation: "Lipophiles Kationen-Tracer – mitochondriale Aufnahme im Myokard/Parathyreoidea." },
  { id: "tc99m-tetrofosmin", radionuclide: "Tc-99m", prep: "Tetrofosmin (Myokard)", modality: "SPECT", organ: "Herz", indications: ["Myokardperfusions-SPECT"], halfLife_h: 6.02, emissions: "γ 140 keV", adultDoseMBq: "600–900 MBq", notes: "Stress/Rest Protokoll", explanation: "Membranpotentialgetrieben in Myokardzellen." },
  { id: "tl201", radionuclide: "Tl-201", prep: "Chlorid (Myokard)", modality: "SPECT", organ: "Herz", indications: ["Myokardperfusions-SPECT (historisch)"], halfLife_h: 73.1, emissions: "γ/X-Ray", adultDoseMBq: "80–110 MBq", notes: "Heutzutage meist Tc-Tracer", explanation: "Kalium-Analogon, zelluläre Aufnahme über Na⁺/K⁺-ATPase." },
  { id: "tc99m-hmpao", radionuclide: "Tc-99m", prep: "HMPAO (Gehirn)", modality: "SPECT", organ: "Neuro", indications: ["Perfusion (Demenz, Epilepsie)"] , halfLife_h: 6.02, emissions: "γ 140 keV", adultDoseMBq: "600–800 MBq", notes: "Rasche Injektion bei Anfallssuspekt", explanation: "Passage durch Blut-Hirn-Schranke, zelluläres Trapping." },
  { id: "tc99m-ecd", radionuclide: "Tc-99m", prep: "ECD (Gehirn)", modality: "SPECT", organ: "Neuro", indications: ["Gehirnperfusion"], halfLife_h: 6.02, emissions: "γ 140 keV", adultDoseMBq: "600–800 MBq", notes: "Standard Neuro-Perfusion", explanation: "Lipophil, BBB-Durchtritt → neuronales Trapping." },
  { id: "tc99m-colloid", radionuclide: "Tc-99m", prep: "(Nano)Kolloid (Leber/Milz/Sentinel)", modality: "SPECT", organ: "Leber/Lymph", indications: ["Leber-Milz", "Sentinel-Lymphknoten"], halfLife_h: 6.02, emissions: "γ 140 keV", adultDoseMBq: "80–200 MBq", notes: "Partikelgröße je Indikation", explanation: "Phagozytose durch RES (Leber/Milz); Lymphdrainage für Sentinel." },
  { id: "in111-octreotide", radionuclide: "In-111", prep: "Octreotide (SSTR-SPECT)", modality: "SPECT", organ: "NET", indications: ["SSTR-Bildgebung (historisch)"] , halfLife_h: 67.3, emissions: "γ 173/247 keV", adultDoseMBq: "120–220 MBq", notes: "Lange Protokolle", explanation: "SSTR-Bindung, aber schlechtere Auflösung als PET." },
  { id: "in111-wbc", radionuclide: "In-111", prep: "markierte Leukozyten", modality: "SPECT", organ: "Infekt", indications: ["Okulte Infektsuche"], halfLife_h: 67.3, emissions: "γ 173/247 keV", adultDoseMBq: "10–20 MBq", notes: "In-vitro Markierung", explanation: "Autologe Leukozyten werden radioaktiv markiert und re-injiziert – Migration zum Infektfokus." },
  { id: "i123-fpcit", radionuclide: "I-123", prep: "FP-CIT (DaTSCAN)", modality: "SPECT", organ: "Neuro", indications: ["Dopamintransporter"], halfLife_h: 13.2, emissions: "γ 159 keV", adultDoseMBq: "110–185 MBq", notes: "Jodblock (Perchlorat/Jodid)", explanation: "Bindet an Dopamintransporter im Striatum – Differenzierung essentieller Tremor vs. Parkinson." },

  // --- PET Zusatz (Neuro/Onko/Knoch) ---
  { id: "f18-naf", radionuclide: "F-18", prep: "NaF (Knochen-PET)", modality: "PET", organ: "Skelett", indications: ["Knochenmetastasen"], halfLife_h: 1.83, emissions: "β+", adultDoseMBq: "150–250 MBq", notes: "Schnelle Kinetik", explanation: "Fluorid tauscht mit Hydroxylapatit – Knochenumbau." },
  { id: "f18-fdopa", radionuclide: "F-18", prep: "FDOPA", modality: "PET", organ: "Neuro/NET", indications: ["Parkinson/NET"], halfLife_h: 1.83, emissions: "β+", adultDoseMBq: "150–250 MBq", notes: "Carbidopa ggf.", explanation: "Vorläufer der Dopaminsynthese; AADC-abhängige Aufnahme." },
  { id: "f18-florbetaben", radionuclide: "F-18", prep: "Florbetaben (Amyloid)", modality: "PET", organ: "Neuro", indications: ["Amyloid-PET"], halfLife_h: 1.83, emissions: "β+", adultDoseMBq: "300 MBq", notes: "Standard-Auswertung", explanation: "Bindet an β-Amyloid-Plaques im Kortex." },
  { id: "f18-flortaucipir", radionuclide: "F-18", prep: "Flortaucipir (Tau)", modality: "PET", organ: "Neuro", indications: ["Tau-PET"], halfLife_h: 1.83, emissions: "β+", adultDoseMBq: "370 MBq", notes: "Kontraindikationen beachten", explanation: "Bindet an aggregiertes Tau-Protein (AD/FTLD)." },
  { id: "ga68-fapi", radionuclide: "Ga-68", prep: "FAPI-46", modality: "PET", organ: "Onko/Entzündung", indications: ["CAF/FAP-Ziel", "breites Tumorspektrum"], halfLife_h: 1.13, emissions: "β+", adultDoseMBq: "100–200 MBq", notes: "Niedriger Hintergrund", explanation: "Bindet Fibroblast Activation Protein in Tumorstroma." },
  { id: "f18-fapi", radionuclide: "F-18", prep: "FAPI (div.)", modality: "PET", organ: "Onko/Entzündung", indications: ["FAPI-PET"], halfLife_h: 1.83, emissions: "β+", adultDoseMBq: "200–300 MBq", notes: "späte Bildgebung möglich", explanation: "FAP-gerichtet, lange Halbwertszeit erleichtert Logistik." },
  { id: "cu64-dotatate", radionuclide: "Cu-64", prep: "DOTATATE (SSTR)", modality: "PET", organ: "NET", indications: ["SSTR-PET (lange HWZ)"], halfLife_h: 12.7, emissions: "β+", adultDoseMBq: "150–250 MBq", notes: "Späte Aufnahmen", explanation: "SSTR2-Bindung; längere HWZ als Ga-68." },
  { id: "zr89-immunopet", radionuclide: "Zr-89", prep: "Immuno-PET (z. B. Trastuzumab)", modality: "PET", organ: "Onko", indications: ["Antikörper-Zielbildgebung"], halfLife_h: 78.4, emissions: "β+", adultDoseMBq: "variabel", notes: "Very late imaging", explanation: "Antikörper-getragene Zielbildgebung, lange Kinetik." },
  { id: "c11-choline", radionuclide: "C-11", prep: "Cholin", modality: "PET", organ: "Prostata", indications: ["Cholin-PET (historisch/zentrenabhängig)"], halfLife_h: 0.334, emissions: "β+", adultDoseMBq: "400–800 MBq", notes: "Cyclotron vor Ort nötig", explanation: "Membranphospholipid-Synthese; kurze HWZ." },
  { id: "n13-ammonia", radionuclide: "N-13", prep: "Ammoniak (Herz)", modality: "PET", organ: "Herz", indications: ["Myokard-Perfusion"], halfLife_h: 0.167, emissions: "β+", adultDoseMBq: "700–1300 MBq", notes: "Cyclotron/On-site", explanation: "Diffusion/Metabolisierung im Myokard proportional zur Durchblutung." },
  { id: "o15-water", radionuclide: "O-15", prep: "Wasser (Herz/Gehirn)", modality: "PET", organ: "Herz/Neuro", indications: ["Goldstandard-Perfusion"], halfLife_h: 0.033, emissions: "β+", adultDoseMBq: "hoch, on-site", notes: "Sehr kurze HWZ", explanation: "Freies Diffusionswasser – quant. Perfusion." },

  // --- Therapie ---
  { id: "y90-tare", radionuclide: "Y-90", prep: "TARE (Mikrosphären)", modality: "Therapie", organ: "Leber", indications: ["HCC/Metastasen"], halfLife_h: 64.1, emissions: "β-", adultDoseMBq: "patientenspezifisch", notes: "Dosimetrie/Partition Model", explanation: "β-Emitter in Mikrosphären für intraarterielle Leber-Bestrahlung." },
  { id: "ho166-tare", radionuclide: "Ho-166", prep: "TARE (Holmium)", modality: "Therapie", organ: "Leber", indications: ["TARE"], halfLife_h: 26.8, emissions: "β- + γ", adultDoseMBq: "patientenspezifisch", notes: "MRI-sichtbar", explanation: "Therapie ähnlich Y-90, zusätzlich γ/MR-sichtbar." },
  { id: "sm153-lexidronam", radionuclide: "Sm-153", prep: "Lexidronam (Schmerztherapie)", modality: "Therapie", organ: "Skelett", indications: ["Ossäre Metastasen"], halfLife_h: 46.3, emissions: "β- + γ", adultDoseMBq: "37 MBq/kg", notes: "Myelosuppression beachten", explanation: "Osteotropes Phosphonat – β-Therapie an Knochenmetastasen." },
  { id: "sr89", radionuclide: "Sr-89", prep: "Chlorid (Schmerztherapie)", modality: "Therapie", organ: "Skelett", indications: ["Ossäre Metastasen"], halfLife_h: 1216, emissions: "β-", adultDoseMBq: "148 MBq", notes: "Myelosuppression", explanation: "Kalzium-Analogon – Einbau in Knochenumbau." },
  { id: "re186-hedp", radionuclide: "Re-186", prep: "HEDP (Schmerztherapie)", modality: "Therapie", organ: "Skelett", indications: ["Ossäre Metastasen"], halfLife_h: 90.6, emissions: "β- + γ", adultDoseMBq: "1295 MBq", notes: "Dosimetrie möglich", explanation: "Osteotropes Bisphosphonat – β-Therapie." },
  { id: "re188-hddp", radionuclide: "Re-188", prep: "HDDP (Schmerztherapie)", modality: "Therapie", organ: "Skelett", indications: ["Ossäre Metastasen"], halfLife_h: 17, emissions: "β- + γ", adultDoseMBq: "3400 MBq", notes: "Generator-Isotop", explanation: "Ähnlich Re-186, kürzere HWZ." },
  { id: "i131-mibg", radionuclide: "I-131", prep: "MIBG Therapie", modality: "Therapie", organ: "Phäochromo/NET", indications: ["MIBG-Therapie"], halfLife_h: 192.5, emissions: "β- + γ", adultDoseMBq: "patientenspezifisch", notes: "Isolation/Strahlenschutz", explanation: "Aufnahme über NET (Norepinephrin-Transporter) in Chromaffinzellen." }
];

// ============== Zerfallsrechner =============
function decay(A0, t_hours, T12_h) {
  if (!A0 || !T12_h) return 0;
  const frac = Math.pow(0.5, t_hours / T12_h);
  return A0 * frac;
}
function timeToTarget(A0, At, T12_h) {
  if (!A0 || !At || !T12_h || At <= 0 || A0 <= 0 || At >= A0) return null;
  const nHalf = Math.log(At / A0) / Math.log(0.5); // negativ
  return Math.abs(nHalf) * T12_h; // h
}

function DecayCalc({ dataset }) {
  // einzigartige Nuklide aus dem Datensatz
  const radionuclides = Array.from(new Set(dataset.map(d => d.radionuclide)));
  // Halbwertszeiten-Map (h). Falls unbekannt, fallback: erster Datensatz mit gleichem Nuklid
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
    "Ga-67": 78.3
  };

  const [nuclide, setNuclide] = useState(radionuclides[0] ?? "");
  const [A0, setA0] = useState(1000);
  const [tH, setTH] = useState(1);
  const [tMin, setTMin] = useState(0);
  const [target, setTarget] = useState(0);
  const [unit, setUnit] = useState("MBq");

  const T12 = HL[nuclide] ?? (dataset.find(d=>d.radionuclide===nuclide)?.halfLife_h || 1);
  const tHours = Number(tH) + Number(tMin)/60;

  const convIn = (v) => unit === "mCi" ? v * 37 : v;   // mCi → MBq
  const convOut = (v) => unit === "mCi" ? v / 37 : v;  // MBq → mCi

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
          <select className="mt-1 w-full rounded-xl border px-3 py-2 bg-white/80 dark:bg-neutral-800/60" value={nuclide} onChange={e=>setNuclide(e.target.value)}>
            {radionuclides.map(r => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
          <div className="text-xs opacity-70 mt-1">T½ = {T12} h</div>
        </div>
        <div>
          <label className="text-sm font-semibold">Ausgangsaktivität ({unit})</label>
          <input className="mt-1 w-full rounded-xl border px-3 py-2 bg-white/80 dark:bg-neutral-800/60" type="number" value={A0} onChange={e=>setA0(e.target.value)} />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-sm font-semibold">Zeit (h)</label>
            <input className="mt-1 w-full rounded-xl border px-3 py-2 bg-white/80 dark:bg-neutral-800/60" type="number" value={tH} onChange={e=>setTH(e.target.value)} />
          </div>
          <div>
            <label className="text-sm font-semibold">Zeit (min)</label>
            <input className="mt-1 w-full rounded-xl border px-3 py-2 bg-white/80 dark:bg-neutral-800/60" type="number" value={tMin} onChange={e=>setTMin(e.target.value)} />
          </div>
        </div>
        <div>
          <label className="text-sm font-semibold">Einheit</label>
          <select className="mt-1 w-full rounded-xl border px-3 py-2 bg-white/80 dark:bg-neutral-800/60" value={unit} onChange={e=>setUnit(e.target.value)}>
            <option>MBq</option>
            <option>mCi</option>
          </select>
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-xl border p-3">
          <div className="text-sm opacity-70">Aktivität nach t</div>
          <div className="text-2xl font-bold">{Number.isFinite(At_disp) ? At_disp.toFixed(2) : "–"} {unit}</div>
          <div className="text-xs opacity-70">nach {tH} h {tMin>0?`${tMin} min`:''}</div>
        </div>
        <div className="rounded-xl border p-3">
          <div className="text-sm opacity-70">Halbwertszeiten verstrichen</div>
          <div className="text-xl font-semibold">{(tHours / T12).toFixed(3)} × T½</div>
        </div>
        <div className="rounded-xl border p-3">
          <div className="text-sm opacity-70">Zerfallskonstante (λ)</div>
          <div className="text-xl font-semibold">{(Math.log(2)/T12).toFixed(5)} h⁻¹</div>
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 items-end">
        <div className="sm:col-span-2">
          <label className="text-sm font-semibold">Zeit bis Zielaktivität ({unit})</label>
          <div className="grid grid-cols-[1fr_auto] gap-2">
            <input className="mt-1 w-full rounded-xl border px-3 py-2 bg-white/80 dark:bg-neutral-800/60" type="number" value={target} onChange={e=>setTarget(e.target.value)} placeholder="z. B. 370" />
            <button onClick={()=>setTarget(0)} className="rounded-xl border px-3 py-2">Reset</button>
          </div>
          {tToTgt_h!=null && (
            <div className="text-sm mt-2">≈ <b>{tToTgt_h.toFixed(2)}</b> h  •  {(tToTgt_h/24).toFixed(2)} d  •  {(tToTgt_h*60).toFixed(0)} min</div>
          )}
        </div>
      </div>
    </section>
  );
}

// ============== UI & Layout =================
function Pill({ text }) {
  return (
    <span className="inline-block rounded-full border px-2 py-0.5 text-xs font-medium">
      {text}
    </span>
  );
}

function Header({tab, setTab}) {
  const base = "px-3 py-2 rounded-xl border text-sm font-medium";
  const active = "bg-black text-white dark:bg-white dark:text-black border-black dark:border-white";
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
            <button className={`${base} ${tab==='overview'?active:idle}`} onClick={()=>setTab('overview')}>📘 Übersicht</button>
            <button className={`${base} ${tab==='decay'?active:idle}`} onClick={()=>setTab('decay')}>⚛️ Zerfallsrechner</button>
          </div>
        </div>
      </div>
    </header>
  );
}

const ORGANS = ["Alle", ...Array.from(new Set(DATA.map(d => d.organ))).sort()];
const MODALITIES = ["Alle", ...Array.from(new Set(DATA.map(d => d.modality))).sort()];
const SORTS = [
  { key: "alpha", label: "A–Z (Präparat)" },
  { key: "halfLife", label: "Halbwertszeit" },
];

// ================== App =====================
export default function App() {
  const [q, setQ] = useState("");
  const [mod, setMod] = useState("Alle");
  const [org, setOrg] = useState("Alle");
  const [sort, setSort] = useState("alpha");
  const [favs, setFavs] = useState(new Set());
  const [tab, setTab] = useState('overview');

  const filtered = useMemo(() => {
    const qLower = q.trim().toLowerCase();
    let arr = DATA.filter((d) => {
      const hay = [d.radionuclide, d.prep, d.organ, d.emissions, ...(d.indications||[])].join(" ").toLowerCase();
      const hitQ = !qLower || hay.includes(qLower);
      const hitMod = mod === "Alle" || d.modality === mod;
      const hitOrg = org === "Alle" || d.organ === org;
      return hitQ && hitMod && hitOrg;
    });

    if (sort === "alpha") arr.sort((a, b) => a.prep.localeCompare(b.prep));
    if (sort === "halfLife") arr.sort((a, b) => (a.halfLife_h ?? 9e9) - (b.halfLife_h ?? 9e9));
    return arr;
  }, [q, mod, org, sort]);

  function toggleFav(id) {
    setFavs((prev) => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id); else n.add(id);
      return n;
    });
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-neutral-50 dark:from-neutral-900 dark:to-black text-neutral-900 dark:text-neutral-100">
      <Header tab={tab} setTab={setTab} />
      <main className="max-w-6xl mx-auto px-4 py-6">
        {/* Controls */}
        {tab==='overview' && (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 items-end">
            <div className="sm:col-span-2">
              <label className="text-sm font-semibold">Suche</label>
              <input
                className="mt-1 w-full rounded-xl border px-3 py-2 bg-white/80 dark:bg-neutral-800/60 outline-none focus:ring-2"
                placeholder="z. B. FDG, PSMA, DOTATATE, Schilddrüse, NET…"
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-semibold">Modalität</label>
              <select className="mt-1 w-full rounded-xl border px-3 py-2 bg-white/80 dark:bg-neutral-800/60" value={mod} onChange={(e)=>setMod(e.target.value)}>
                {MODALITIES.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-semibold">Organ‑System</label>
              <select className="mt-1 w-full rounded-xl border px-3 py-2 bg-white/80 dark:bg-neutral-800/60" value={org} onChange={(e)=>setOrg(e.target.value)}>
                {ORGANS.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
            <div className="lg:col-span-4 flex gap-2 items-center">
              <label className="text-sm font-semibold">Sortierung</label>
              <select className="mt-1 rounded-xl border px-3 py-2 bg-white/80 dark:bg-neutral-800/60" value={sort} onChange={(e)=>setSort(e.target.value)}>
                {SORTS.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
              </select>
              <div className="text-xs opacity-70 ml-auto">Favoriten: {favs.size}</div>
            </div>
          </div>
        )}

        {/* Overview */}
        {tab==='overview' && (
          <>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {filtered.map((d) => (
                <article key={d.id} className="rounded-2xl border p-4 shadow-sm bg-white/70 dark:bg-neutral-900/60">
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
                      onClick={() => toggleFav(d.id)}
                      title="Favorit umschalten"
                      className={`rounded-full border px-3 py-1 text-xs font-medium ${favs.has(d.id) ? "bg-yellow-300/70" : "bg-white/50 dark:bg-neutral-800/60"}`}
                    >
                      {favs.has(d.id) ? "★" : "☆"}
                    </button>
                  </div>

                  <dl className="mt-3 text-sm leading-6">
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <dt className="font-semibold">Halbwertszeit</dt>
                        <dd>{d.halfLife_h ? `${d.halfLife_h} h` : "–"}</dd>
                      </div>
                      <div>
                        <dt className="font-semibold">Emissionen</dt>
                        <dd>{d.emissions}</dd>
                      </div>
                      <div>
                        <dt className="font-semibold">Erwachsenen‑Dosis</dt>
                        <dd>{d.adultDoseMBq}</dd>
                      </div>
                    </div>
                    <div className="mt-2">
                      <dt className="font-semibold">Indikationen</dt>
                      <dd className="opacity-90">{(d.indications||[]).join(" • ")}</dd>
                    </div>
                    <div className="mt-2">
                  <dt className="font-semibold">Hinweise</dt>
                  <dd className="opacity-90">{d.notes}</dd>
                </div>
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

            {filtered.length === 0 && (
              <div className="mt-10 text-center opacity-70">Keine Einträge gefunden. Suchbegriff oder Filter anpassen.</div>
            )}
          </>
        )}

        {/* Decay Tab */}
        {tab==='decay' && (
          <DecayCalc dataset={DATA} />
        )}

        <footer className="mt-10 text-xs opacity-70 leading-relaxed">
          <p>
            ✋ Achtung: Diese Übersicht ist ein vereinfachter Spickzettel. Dosisangaben und Vorbereitung können je nach Hausstandard,
            Patient:in und aktueller Leitlinie variieren. Massgebend sind lokale SOPs und ärztliche Anordnung.
          </p>
        </footer>
      </main>
    </div>
  );
}
