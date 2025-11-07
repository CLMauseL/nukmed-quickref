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
{ id: "tc99m-dpd", radionuclide: "Tc-99m", prep: "DPD (Teceos) – Skelett", modality: "SPECT", organ: "Skelett", indications: ["Rheumatologische", "Enzündliche und Infektiologische Knochenerkrankungen"], halfLife: "6.02", emissions: "γ 140 keV", adultDoseMBq: "500–700 MBq", notes: "", explanation: "", contraindication: "Schwangerschaft, Stillzeit (Stillunterbruch empfohlen), schwere Überempfindlichkeit gegen DPD oder Bestandteile des Präparats." },
  { id: "tc99m-maa", radionuclide: "Tc-99m", prep: "markiertes Makroaggregat-Albumin", modality: "SPECT", organ: "Lunge", indications: ["Lungenembolie", "Arterio-venöse Shunts"], halfLife: "6.02", emissions: "γ 140 keV", adultDoseMBq: "100–200 MBq", notes: "Vor der Injektion die Spritze vorsichtig Schwenken, nicht aspirieren beim Applizieren um Clotbildung zu vermeiden.", explanation: "Mikroembolisationen in den Kapillaren der Lunge proportional zum Blutfluss.", contraindication: "Schwangerschaft, Stillzeit (Stillunterbruch empfohlen), pulmonaler Hypertonus mit Rechtsherzversagen, schwere Überempfindlichkeit gegen menschliches Albumin oder Bestandteile des Präparats." },
  { id: "tc99m-mag3", radionuclide: "Tc-99m", prep: "Mercapto-acetyltriglycerin", modality: "SPECT", organ: "Niere", indications: ["Seitengetrennte Nierenfunktion", "Harnabflussstörungen", "Obstruktion"], halfLife: "6.02", emissions: "γ 140 keV", adultDoseMBq: "80–120 MBq", notes: "Vor der Untersuchung auf die Toilette schicken, um die Blase leer darzustellen. Injektion als rascher Bolus.", explanation: "MAG3 wird aktiv über Transportproteine in proximalen Tubuluszellen sezerniert → direkte Abbildung der Tubulusfunktion, schnelle Elimination.", contraindication: "Schwangerschaft, Stillzeit (Stillunterbruch empfohlen), bekannte Überempfindlichkeit gegen MAG3 oder Bestandteile des Präparats." },
  { id: "tc99m-dtpa", radionuclide: "Tc-99m", prep: "Diethylentriaminpentaessigsäure", modality: "SPECT", organ: "Niere", indications: ["Beurteilung der glomerulären Filtration", "Nierenfunktion", "Abflussstörungen"], halfLife: "6.02", emissions: "γ 140 keV", adultDoseMBq: "80–120 MBq", notes: "Gute Hydrierung, Blase vor Akquisition entleeren; rascher Bolus für korrekte Funktionskurve.", explanation: "Glomeruläre Filtration ohne relevante tubuläre Sekretion oder Rückresorption → geeignet für GFR-Beurteilung.", contraindication: "Schwangerschaft, Stillzeit (Stillunterbruch empfohlen)." },
  { id: "tc99m-dmsa", radionuclide: "Tc-99m", prep: "Dimercaptobernsteinsäure", modality: "SPECT", organ: "Niere", indications: ["Beurteilung der Nierenparenchymfunktion", "Narben", "Missbildungen", "akute Pyelonephritis"], halfLife: "6.02", emissions: "γ 140 keV", adultDoseMBq: "80 MBq", notes: "Aufnahme erfolgt ca. 2–3 h nach Injektion; Patient soll vor der Untersuchung gut hydriert sein und Blase vor der Aufnahme entleeren.", explanation: "Tc-99m-DMSA bindet an das funktionsfähige Tubulusepithel der Nierenrinde und erlaubt die morphologische sowie funktionelle Beurteilung des Nierenkortex.", contraindication: "Schwangerschaft, Stillzeit (Stillunterbruch empfohlen), bekannte Überempfindlichkeit gegen DMSA oder Bestandteile des Präparats." },
  { id: "i123-datscan", radionuclide: "I-123", prep: "Ioflupan (DaTSCAN)", modality: "SPECT", organ: "Gehirn (Striatum, dopaminerge Synapsen)", indications: ["Differenzialdiagnose zwischen essentiellem Tremor und Parkinson-Syndrom", "Abklärung dopaminerger Degeneration bei unklaren extrapyramidalen Bewegungsstörungen"], halfLife: "13.2 h", emissions: "159 keV (γ)", adultDoseMBq: "ca. 185 MBq", notes: "Schilddrüsenblockade mit Kaliumiodid mindestens 1 h vor Injektion; Bildaufnahme ca. 3–6 h nach Injektion.", explanation: "I-123-Ioflupan bindet selektiv an Dopamin-Transporter (DAT) im Striatum, wodurch der präsynaptische dopaminerge Funktionszustand sichtbar wird.", contraindication: "Schwangerschaft, Stillzeit, bekannte Überempfindlichkeit gegen Ioflupan oder Jod, fehlende Schilddrüsenblockade." },
  { id: "tc99m-pertechnetat", radionuclide: "Tc-99m", prep: "Natrium-Pertechnetat", modality: "SPECT", organ: "Schilddrüse, Speicheldrüsen, Magen (Meckel)", indications: ["Schilddrüsenfunktion", "Speicheldrüsenfunktionsprüfung", "Nachweis ektoper Magenschleimhaut"], halfLife: "6.02", emissions: "γ 140 keV", adultDoseMBq: "80–150 MBq", notes: "Vor der Schilddrüsenaufnahme Jodhaltige Medikamente und Kontrastmittel vermeiden (mind. 1–2 Wochen Abstand); Patient soll nüchtern sein.", explanation: "Tc-99m-Pertechnetat wird analog zu Jod über den Natrium-Iodid-Symporter aufgenommen, jedoch nicht organifiziert, wodurch die momentane Jodidaufnahmefunktion beurteilt werden kann.", contraindication: "Schwangerschaft, Stillzeit (Stillunterbruch > 24 h), Überempfindlichkeit gegen Pertechnetat oder Präparatbestandteile." },
  { id: "tc99m-mibi", radionuclide: "Tc-99m", prep: "Methoxy-Isobutyl-Isonitril (Sestamibi)", modality: "SPECT", organ: "Herz, Nebenschilddrüsen, Brust (Mamma)", indications: ["Abklärung einer Myokardischämie oder -infarktnarbe", "Nachweis vitalen Myokards", "Lokalisation hormonaktiver Nebenschilddrüsenadenome"], halfLife: "6 h", emissions: "140 keV (γ)", adultDoseMBq: "600–900 MBq (abhängig von 1- oder 2-Tages-Protokoll)", notes: "Patient soll vor Myokarduntersuchung körperlich belastet oder pharmakologisch stimuliert werden; nach Injektion fetthaltige Mahlzeit zur Gallensekretion empfohlen.", explanation: "Tc-99m-Sestamibi reichert sich in den Mitochondrien stoffwechselaktiver Zellen an, da das lipophile Kation vom negativen Membranpotenzial angezogen wird; so zeigt die Aufnahme Vitalität und Perfusion.", contraindication: "Schwangerschaft, Stillzeit (Stillunterbruch ≥ 24 h), bekannte Überempfindlichkeit gegen Sestamibi oder Hilfsstoffe." }
  { id: "tc99m-colloid", radionuclide: "Tc-99m", prep: "Technetium-99m-markiertes Nanokolloid", modality: "SPECT", organ: "Lymphsystem (Sentinel-Lymphknoten)", indications: ["Lymphabflussdarstellung und Identifikation des Sentinel-Lymphknotens (z. B. Mamma, Melanom)"], halfLife: "6 h", emissions: "140 keV (γ)", adultDoseMBq: "40–150 MBq", notes: "Injektion streng peritumoral bzw. intradermal; vor der OP ggf. SPECT/CT zur exakten Lokalisation.", explanation: "Tc-99m-Nanokolloid wird lymphatisch abtransportiert und im ersten drainierenden Lymphknoten phagozytiert, wodurch dieser gezielt detektiert werden kann.", contraindication: "Schwangerschaft, Stillzeit, lokale Entzündungen/Infektionen an der Injektionsstelle, Überempfindlichkeit gegen Kolloidbestandteile." },
  { id: "tc99m-pyp-blutung", radionuclide: "Tc-99m", prep: "Technescan PYP (Natriumpyrophosphat; RBC-Markierung)", modality: "SPECT", organ: "Gastrointestinaltrakt", indications: ["Nachweis und Lokalisation aktiver gastrointestinaler Blutungen"], halfLife: "6 h", emissions: "140 keV (γ)", adultDoseMBq: "≈ 740 MBq", notes: "In vivo Erythrozytenmarkierung; während der Untersuchung Bewegung/Ortswechsel der Aktivität beachten; Patient ruhig lagern.", explanation: "Tc-99m-markierte Erythrozyten bleiben intravasal; Tracer-Austritt bei aktiver Blutung sichtbar, Quelle lokalisierbar.", contraindication: "Schwangerschaft, Stillzeit, schwere Anämie, Überempfindlichkeit gegen Bestandteile." },
  { id: "tc99m-scintimun", radionuclide: "Tc-99m", prep: "Sulesomab (Scintimun®)", modality: "SPECT", organ: "Ganzkörper (Entzündungsherde)", indications: ["Osteomyelitis", "Weichteilinfektionen (Prothesen)"], halfLife: "6 h", emissions: "140 keV (γ)", adultDoseMBq: "450–800 MBq", notes: "Bildaufnahme 3–6 h (früh) und 20–24 h (spät) p.i.; keine spezielle Vorbereitung nötig.", explanation: "Sulesomab bindet an Granulozyten (CD15) und reichert sich in Entzündungsherden an.", contraindication: "Schwangerschaft, Stillzeit, Überempfindlichkeit gegen murine Antikörper/Bestandteile." },
  { id: "f18-fdg", radionuclide: "F-18", prep: "Fluordesoxyglukose (FDG)", modality: "PET / PET-CT", organ: "Ganzkörper", indications: ["Tumordiagnostik", "Therapie-/Rezidivkontrolle", "entzündliche Prozesse", "Myokardvitalität", "Hirnstoffwechselstörungen"], halfLife: "110 min", emissions: "511 keV (Positronen)", adultDoseMBq: "200–400 MBq", notes: "Nüchtern ≥ 6 h, nur Wasser; Blutzucker < 7 mmol/l; nach Injektion Ruhephase; keine körperliche Aktivität.", explanation: "FDG wird über GLUT aufgenommen und zu FDG-6-P phosphoryliert; es wird nicht weiter metabolisiert → Abbildung des Glukosemetabolismus.", contraindication: "Schwangerschaft, Stillzeit, unkontrollierter Diabetes." },
  { id: "f18-psma1007", radionuclide: "F-18", prep: "PSMA-1007", modality: "PET / PET-CT", organ: "Prostata, Lymphknoten, Knochen, Weichteil", indications: ["Primärdiagnostik/Staging", "Rezidivsuche (auch bei niedrigem PSA)"], halfLife: "110 min", emissions: "511 keV (Positronen)", adultDoseMBq: "250–300 MBq", notes: "Gute Hydratation; Blase vor Akquisition entleeren; geringe renale Exkretion → wenig Blasenaktivität.", explanation: "Bindet spezifisch an PSMA; hohe Affinität und geringe renale Ausscheidung erleichtern Lymphknoten-/Knochenmetastasen-Nachweis.", contraindication: "Schwangerschaft, Stillzeit, Überempfindlichkeit." },
  { id: "f18-fet", radionuclide: "F-18", prep: "Fluorethyltyrosin (FET)", modality: "PET / PET-CT", organ: "Gehirn", indications: ["Gliome: Diagnostik/Verlaufsbeurteilung", "Abgrenzung Rezidiv vs. Strahlennekrose"], halfLife: "110 min", emissions: "511 keV (Positronen)", adultDoseMBq: "180–250 MBq", notes: "Nüchtern ≥ 4 h; keine Blutzuckerkontrolle nötig.", explanation: "Aminosäureanalogon; Aufnahme über LAT1; erhöhte Aufnahme spiegelt gesteigerten Aminosäuretransport/Zellproliferation.", contraindication: "Schwangerschaft, Stillzeit, Überempfindlichkeit." },
  { id: "f18-fdopa", radionuclide: "F-18", prep: "Fluor-Dihydroxyphenylalanin (FDOPA)", modality: "PET / PET-CT", organ: "Gehirn, NEN", indications: ["Parkinson-Diagnostik (präsynaptisch)", "Nachweis neuroendokriner Tumoren"], halfLife: "110 min", emissions: "511 keV (Positronen)", adultDoseMBq: "150–250 MBq", notes: "Nüchtern ≥ 4 h; Carbidopa 1 h vor Injektion optional zur peripheren Decarboxylase-Blockade.", explanation: "Wie L-DOPA transportiert und decarboxyliert → Darstellung dopaminerger Aktivität / katecholaminerger Stoffwechsel.", contraindication: "Schwangerschaft, Stillzeit, Überempfindlichkeit." },
  { id: "f18-choline", radionuclide: "F-18", prep: "Fluormethylcholin (Cholin)", modality: "PET / PET-CT", organ: "Prostata, Leber, Lymphknoten, Nebenschilddrüsen", indications: ["Staging/Restaging Prostatakarzinom (PSA-Anstieg)", "Lokalisation Nebenschilddrüsenadenom", "Lebermetastasen"], halfLife: "110 min", emissions: "511 keV (Positronen)", adultDoseMBq: "200–300 MBq", notes: "Nüchtern ≥ 4 h; körperliche Aktivität vor Untersuchung vermeiden; frühe Bildaufnahme (5–10 min p.i.).", explanation: "Aufnahme über Cholintransporter und Einbau in Phosphatidylcholin → spiegelt Zellmembran-Turnover.", contraindication: "Schwangerschaft, Stillzeit, Überempfindlichkeit." },
  { id: "f18-fapi", radionuclide: "F-18", prep: "Fibroblast Activation Protein Inhibitor (FAPI)", modality: "PET / PET-CT", organ: "Ganzkörper (Tumorstroma)", indications: ["Solide Tumoren", "Entzündungen/Fibrosen"], halfLife: "110 min", emissions: "511 keV (Positronen)", adultDoseMBq: "250–300 MBq", notes: "Keine spezielle Vorbereitung; frühe Bildaufnahme 10–20 min p.i.", explanation: "Bindet an FAP auf aktivierten Fibroblasten → hoher Tumor-zu-Hintergrund-Kontrast.", contraindication: "Schwangerschaft, Stillzeit, Überempfindlichkeit." },
  { id: "ga68-psma11", radionuclide: "Ga-68", prep: "PSMA-11", modality: "PET / PET-CT", organ: "Prostata, Lymphknoten, Knochen, Weichteil", indications: ["Primärstaging", "Restaging/Rezidivsuche (steigendes PSA)"], halfLife: "68 min", emissions: "511 keV (Positronen)", adultDoseMBq: "100–200 MBq", notes: "Hydrierung; Blase vor Akquisition entleeren; Aufnahme 45–60 min p.i.", explanation: "Hochspezifische Bindung an PSMA → Detektion kleiner Metastasen.", contraindication: "Schwangerschaft, Stillzeit, Überempfindlichkeit." }
  { id: "ga68-dotatate", radionuclide: "Ga-68", prep: "DOTA-(Tyr³)-Octreotat (DOTATATE)", modality: "PET / PET-CT", organ: "NET mit Somatostatinrezeptoren", indications: ["Nachweis, Staging, Verlaufskontrolle von NET"], halfLife: "68 min", emissions: "511 keV (Positronen)", adultDoseMBq: "100–200 MBq", notes: "Hydrierung; langwirksame Somatostatinanaloga ≥ 4 Wochen, kurzwirksame 24 h pausieren.", explanation: "Hohe Affinität zu SSTR2 → präzise Darstellung von NET-Läsionen.", contraindication: "Schwangerschaft, Stillzeit, Überempfindlichkeit." },
  { id: "ga68-fapi", radionuclide: "Ga-68", prep: "Fibroblast Activation Protein Inhibitor (FAPI)", modality: "PET / PET-CT", organ: "Ganzkörper (Tumorstroma)", indications: ["Solide Tumoren", "entzündliche/fibrotische Prozesse"], halfLife: "68 min", emissions: "511 keV (Positronen)", adultDoseMBq: "100–200 MBq", notes: "Sehr schnelle Tumoraufnahme; exzellenter Kontrast 10–20 min p.i.", explanation: "Bindung an FAP auf aktivierten Fibroblasten im Stroma.", contraindication: "Schwangerschaft, Stillzeit, Überempfindlichkeit." },
  { id: "i123-mibg", radionuclide: "I-123", prep: "Meta-Iodbenzylguanidin (MIBG)", modality: "SPECT", organ: "Nebennierenmark / sympathisches Nervensystem", indications: ["Phäochromozytom", "Paragangliom", "Neuroblastom"], halfLife: "13.2 h", emissions: "159 keV (γ)", adultDoseMBq: "200–400 MBq", notes: "Schilddrüsenblockade (KI/Perchlorat) vor Injektion; störende Medikation vorab pausieren.", explanation: "Noradrenalin-Analogon; NET-Transport und Speicherung in Vesikeln.", contraindication: "Schwangerschaft, Stillzeit, fehlende Schilddrüsenblockade, Überempfindlichkeit gegen Jod/Präparat." },
  { id: "i123-iodid", radionuclide: "I-123", prep: "Natriumiodid", modality: "SPECT", organ: "Schilddrüse", indications: ["Funktionsdiagnostik", "Bestimmung Jodaufnahmefähigkeit", "kalte/warme Knoten"], halfLife: "13.2 h", emissions: "159 keV (γ)", adultDoseMBq: "10–20 MBq", notes: "Jodhaltige Medikation und Kontrastmittel mind. 2 Wochen meiden; nüchtern 2–4 h empfohlen.", explanation: "Aktive Aufnahme via Natrium-Iodid-Symporter und Organifizierung → hormonbildende Aktivität.", contraindication: "Schwangerschaft, Stillzeit, jodhaltige Medikation/KM in den letzten Wochen, Jod-Überempfindlichkeit." },
  { id: "i131-mibg-therapie", radionuclide: "I-131", prep: "Meta-Iodbenzylguanidin (MIBG) – Therapie", modality: "Therapie (molekulare Radionuklidtherapie)", organ: "NEN (katecholaminproduzierend)", indications: ["Therapie metastasierten/inoperablen Tumoren mit MIBG-Aufnahme"], halfLife: "8 d", emissions: "364 keV (γ) + β⁻", adultDoseMBq: "3.7–11 GBq", notes: "Schilddrüsenblockade; gute Hydrierung; Strahlenschutz; Blutbild-/Kreislauf-Überwachung.", explanation: "Aufnahme via NET, Speicherung in Vesikeln; β⁻-Strahlung zerstört Tumorzellen.", contraindication: "Schwangerschaft, Stillzeit, schwere Knochenmarkinsuffizienz, fehlende Schilddrüsenblockade, Überempfindlichkeit gegen Jod/MIBG." },
  { id: "i131-iodid", radionuclide: "I-131", prep: "Natriumiodid", modality: "SPECT / Therapie", organ: "Schilddrüse", indications: ["Funktionsdiagnostik", "Radiojodtherapie bei Hyperthyreose oder differenziertem Schilddrüsenkarzinom"], halfLife: "8 d", emissions: "364 keV (γ) + β⁻", adultDoseMBq: "Diagnostisch 2–5 MBq; therapeutisch 200–7400 MBq", notes: "Jodarme Diät; jodhaltige Medikamente/KM absetzen; Strahlenschutz beachten.", explanation: "Aufnahme via NIS, Einbau in Thyreoglobulin; β⁻-Strahlung führt zur gezielten Zerstörung von Schilddrüsengewebe.", contraindication: "Schwangerschaft, Stillzeit, unbehandelte schwere Hyperthyreose, kürzliche Jodexposition, Jod-Überempfindlichkeit." },
  { id: "rb82-rubidium", radionuclide: "Rb-82", prep: "Rubidiumchlorid", modality: "PET / PET-CT", organ: "Herz (Myokard)", indications: ["Myokardperfusion zur KHK-Diagnostik"], halfLife: "75 s", emissions: "511 keV (Positronen)", adultDoseMBq: "1100–1500 MBq", notes: "Generator (Sr-82/Rb-82) erforderlich; meist pharmakologische Belastung (Adenosin/Regadenoson).", explanation: "Kalium-Analogon; Aufnahme via Na⁺/K⁺-ATPase in vitales Myokard → regionale Perfusion.", contraindication: "Schwangerschaft; Kontraindikationen der Belastungsmedikation; Überempfindlichkeit gegen Rubidiumchlorid." },
  { id: "lu177-psma617", radionuclide: "Lu-177", prep: "PSMA-617", modality: "Therapie / Theranostik", organ: "Prostata, Lymphknoten, Knochenmetastasen", indications: ["Therapie des metastasierten kastrationsresistenten Prostatakarzinoms mit PSMA-Expression"], halfLife: "6.7 d", emissions: "208 keV (γ) + β⁻ (max. 498 keV)", adultDoseMBq: "5.5–7.4 GBq", notes: "Hydrierung; häufiges Blasenentleeren; Strahlenschutz-/Kontaktregeln; Blutbildkontrolle.", explanation: "Hochspezifische PSMA-Bindung; β⁻-Strahlung zerstört Tumorzellen; γ-Anteil erlaubt Bildkontrolle.", contraindication: "Schwangerschaft, Stillzeit, schwere KM-Insuffizienz, eingeschränkte Nierenfunktion, Überempfindlichkeit." },
  { id: "n13-ammonia", radionuclide: "N-13", prep: "Ammoniak", modality: "PET / PET-CT", organ: "Herz (Myokard)", indications: ["Quantitative Myokardperfusion", "Myokardvitalität"], halfLife: "10 min", emissions: "511 keV (Positronen)", adultDoseMBq: "370–740 MBq", notes: "Sehr kurze HWZ, Zyklotron vor Ort; typ. pharmakologische Belastung.", explanation: "Diffusion ins Myokard und Metabolisierung zu Glutamin → Perfusion/Vitalität.", contraindication: "Schwangerschaft, Stillzeit; Hypotonie/Bronchospasmus (bei pharmakologischer Belastung)." },
  { id: "o15-water", radionuclide: "O-15", prep: "Wasser (H₂¹⁵O)", modality: "PET / PET-CT", organ: "Herz, Gehirn (Perfusion), Ganzkörper", indications: ["Quantitative Perfusionsmessung (CBF/Myokard)"], halfLife: "2 min", emissions: "511 keV (Positronen)", adultDoseMBq: "700–1200 MBq", notes: "Erzeugung direkt am Zyklotron; extrem kurze HWZ ermöglicht Wiederholmessungen; keine spezielle Vorbereitung.", explanation: "Freie Verteilung im Körperwasser, Diffusion proportional zur Durchblutung → direkte, quantifizierbare Perfusion ohne Metabolisierung.", contraindication: "Schwangerschaft, Stillzeit." },
  { id: "y90-tare", radionuclide: "Y-90", prep: "Yttrium-90-Mikrosphären (SIRT)", modality: "Radioembolisation", organ: "Leber (Tumorgewebe)", indications: ["Lokale Behandlung nicht resektabler, leberdominanter Tumoren"], halfLife: "64.1 h", emissions: "β⁻ (max. 2.28 MeV)", adultDoseMBq: "individuell (typ. 1–3 GBq)", notes: "Simulationsangiographie mit Tc-99m-MAA (pulmonale Shuntfraktion); Kontrolle via Bremsstrahl-SPECT oder PET.", explanation: "Selektive Einbringung in Tumorarteriolen; lokale β-Strahlung zerstört Tumorzellen bei Schonung des Leberparenchyms.", contraindication: "Schwangerschaft, Stillzeit, ausgeprägte Leberinsuffizienz, signifikanter hepato-pulmonaler Shunt oder Portalvenenverschluss." }
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
