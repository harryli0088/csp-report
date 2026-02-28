import 'dotenv/config'
import express, { Request, Response } from "express";
import { Logtail } from "@logtail/node";
if(!process.env.LOGTAIL_TOKEN) {
  throw new Error("You must configure LOGTAIL_TOKEN")
}
const logtail = new Logtail(process.env.LOGTAIL_TOKEN!);

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
 * GET /
 * Basic landing route
 */
app.get("/", (_req: Request, res: Response) => {
  res.status(200).json({
    service: "CSP Report Collector",
    status: "ok",
    endpoints: {
      report: "POST /csp-report"
    }
  });
});

/**
 * POST /csp-report
 */
app.post("/csp-report", async (req: Request, res: Response) => {
  const body = req.body;

  if (!body) {
    return res.status(400).send("No report body received");
  }

  try {
    let logPayload: any;

    // Legacy format
    if (body["csp-report"]) {
      logPayload = {
        type: "legacy",
        report: body["csp-report"]
      };
    }

    // Modern Reporting API format
    else if (Array.isArray(body)) {
      logPayload = {
        type: "modern",
        reports: body
      };
    }

    // Fallback
    else {
      logPayload = {
        type: "unknown",
        raw: body
      };
    }

    await logtail.info(process.env.NODE_ENV==="production" ? "CSP violation received" : "TEST CSP violation received", logPayload);

    // Flush logs before serverless function exits
    await logtail.flush();

  } catch (err) {
    console.error("Logtail error:", err);
  }

  // CSP endpoints should return 204
  res.status(204).end();
});


const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`CSP report server running on port ${PORT}`);
});