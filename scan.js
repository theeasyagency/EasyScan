// api/scan.js
import { analyzeSeo } from "../lib/analyzeSeo.js";
import { analyzeSpeed } from "../lib/analyzeSpeed.js";

export default async function handler(req, res) {
  // 🔹 CORS per Elementor
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Metodo non consentito" });
  }

  try {
    // Elementor manda i dati dentro fields
    const body = req.body.fields || req.body;
    let website = body.website;
    let email = body.email;
    let name = body.name;

    if (!website) {
      return res.status(400).json({ error: "Inserisci un sito valido" });
    }

    // 🔧 Normalizza URL
    if (!website.startsWith("http")) {
      website = "https://" + website;
    }

    // 🔍 Analisi
    const seo = await analyzeSeo(website);
    const speed = await analyzeSpeed(website);

    // 🧠 Calcolo punteggio totale
    const totalScore = Math.round(
      seo.score * 0.5 +
      speed.score * 0.5
    );

    // 📊 Output finale
    const result = {
      website,
      score: totalScore,
      status: getStatus(totalScore),
      seo,
      speed
    };

    return res.status(200).json(result);

  } catch (error) {
    return res.status(500).json({
      error: "Errore nell'analisi",
      details: error.message
    });
  }
}

// Funzione per descrizione punteggio
function getStatus(score) {
  if (score < 40) return "scarso";
  if (score < 70) return "migliorabile";
  return "buono";
}
