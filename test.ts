const ENDPOINT = "http://localhost:3000/csp-report";

async function sendLegacyCSP() {
  const payload = {
    "csp-report": {
      "document-uri": "https://example.com",
      "referrer": "",
      "violated-directive": "script-src-elem",
      "effective-directive": "script-src-elem",
      "original-policy": "default-src 'self'; report-uri /csp-report;",
      "blocked-uri": "https://evil.com/script.js",
      "line-number": 42,
      "column-number": 13,
      "source-file": "https://example.com/index.js",
      "status-code": 200
    }
  };

  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/csp-report"
    },
    body: JSON.stringify(payload)
  });

  console.log("Legacy status:", res.status);
}

async function sendModernCSP() {
  const payload = [
    {
      type: "csp-violation",
      age: 0,
      url: "https://example.com",
      user_agent: navigator.userAgent,
      body: {
        documentURL: "https://example.com",
        violatedDirective: "script-src-elem",
        effectiveDirective: "script-src-elem",
        originalPolicy: "default-src 'self'; report-to csp-endpoint;",
        blockedURL: "https://evil.com/script.js",
        lineNumber: 42,
        columnNumber: 13,
        sourceFile: "https://example.com/index.js",
        statusCode: 200
      }
    }
  ];

  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/reports+json"
    },
    body: JSON.stringify(payload)
  });

  console.log("Modern status:", res.status);
}

sendLegacyCSP()