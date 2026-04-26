export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "https://dwellscores.vibepreview.com");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }
  try {
    const ghl = await fetch(
      "https://services.leadconnectorhq.com/opportunities/search",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.HIGHLEVEL_PRIVATE_TOKEN}`,
          Version: "2021-07-28",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          locationId: process.env.HIGHLEVEL_LOCATION_ID,
          limit: 100,
        }),
      }
    );

    const data = await ghl.json();
    const opportunities = data.opportunities || [];

    const totalRevenue = opportunities.reduce((sum, opp) => {
      return sum + Number(opp.monetaryValue || 0);
    }, 0);

    const totalDeals = opportunities.length;

    const byStatus = {};
    const bySource = {};
    const byAssignedTo = {};
    const byStage = {};

    opportunities.forEach((opp) => {
      const status = opp.status || "unknown";
      byStatus[status] = (byStatus[status] || 0) + 1;

      const source = opp.source || "unknown";
      bySource[source] = (bySource[source] || 0) + 1;

      const assignedTo = opp.assignedTo || "unassigned";
      byAssignedTo[assignedTo] = (byAssignedTo[assignedTo] || 0) + 1;

      const stage = opp.pipelineStageId || "unknown";
      byStage[stage] = (byStage[stage] || 0) + 1;
    });

    res.status(200).json({
      meta: {
        source: "highlevel",
        resource: "opportunities",
        count: opportunities.length,
      },
      records: opportunities,
      summary: {
        totalRevenue: Number(totalRevenue.toFixed(2)),
        totalDeals,
      },
      breakdowns: {
        byStatus,
        bySource,
        byAssignedTo,
        byStage,
      },
    });
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
}
