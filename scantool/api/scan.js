export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Metodo non consentito" });
  }

  const { nome, citta, email } = req.body;

  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${nome}+${citta}&key=${process.env.GOOGLE_API_KEY}`
    );

    const data = await response.json();
    const place = data.results[0];

    const rating = place?.rating || 0;
    const reviews = place?.user_ratings_total || 0;

    let score = 0;

    if (reviews > 50) score += 40;
    else if (reviews > 10) score += 25;
    else score += 10;

    if (rating >= 4.5) score += 30;
    else if (rating >= 4) score += 20;
    else score += 10;

    if (place?.formatted_address) score += 20;

    return res.status(200).json({
      nome,
      rating,
      reviews,
      score,
    });

  } catch (error) {
    return res.status(500).json({ error: "Errore analisi" });
  }
}