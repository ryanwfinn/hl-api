export default async function handler(req, res) {
  try {
    const ghl = await fetch(
      "https://services.leadconnectorhq.com/opportunities/search",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.HIGHLEVEL_PRIVATE_TOKEN}`,
          Version: "2021-07-28",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          locationId: process.env.HIGHLEVEL_LOCATION_ID,
          limit: 100
        })
      }
    );

    const data = await ghl.json();

  const opportunities = data.opportunities || [];

const totalRevenue = opportunities.reduce((sum, opp) => {
  return sum + (opp.monetaryValue || 0);
}, 0);

const totalDeals = opportunities.length;

res.status(200).json({
  totalRevenue,
  totalDeals,
}); 
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
