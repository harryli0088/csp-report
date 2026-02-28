import express, { Request, Response } from "express";

const app = express();

// Parse both legacy and modern CSP report formats
app.use(
  express.json({
    type: [
      "application/json",
      "application/csp-report",
      "application/reports+json"
    ]
  })
);

/**
 * POST /csp-report
 * Receives Content Security Policy violation reports
 */
app.post("/csp-report", (req: Request, res: Response) => {
  const body = req.body;

  if (!body) {
    return res.status(400).send("No report body received");
  }

  // Legacy format: { "csp-report": { ... } }
  if (body["csp-report"]) {
    console.log("Legacy CSP Report:");
    console.dir(body["csp-report"], { depth: null });
  }

  // Modern Reporting API format: [ { type, body, ... } ]
  else if (Array.isArray(body)) {
    console.log("Modern CSP Report(s):");
    body.forEach((report, i) => {
      console.log(`Report ${i + 1}:`);
      console.dir(report, { depth: null });
    });
  }

  // Fallback
  else {
    console.log("Unknown report format:");
    console.dir(body, { depth: null });
  }

  // CSP endpoints should return 204 No Content
  res.status(204).end();
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`CSP report server running on port ${PORT}`);
});