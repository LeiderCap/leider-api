import * as fs from 'fs';
import * as path from 'path';

// Must mock NEXT_PUBLIC_APP_URL if not set since we're running outside Next.js
if (!process.env.NEXT_PUBLIC_APP_URL) {
  process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000';
}

import { callLensEngineV5 } from '../lib/lens-ai-v5';

async function main() {
  const ticker = process.argv[2];
  if (!ticker) {
    console.error('Usage: npx tsx scripts/eval-lens-v5.ts <TICKER> [COMPANY_NAME]');
    process.exit(1);
  }
  const companyName = process.argv[3] || ticker.toUpperCase();

  console.log(`\n[eval] Starting v5.0 eval for ${ticker.toUpperCase()} (${companyName})...`);
  
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  
  // 1. Retrieve
  console.log(`[eval] 1. Running retrieval pipeline...`);
  let retrievalResult: any = null;
  try {
    const retrieveRes = await fetch(`${baseUrl}/api/lens/retrieve`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ ticker: ticker.toUpperCase(), companyName }),
    });
    if (retrieveRes.ok) {
      retrievalResult = await retrieveRes.json();
      console.log(`[eval]    Retrieved ${retrievalResult.retrievedDocuments?.length || 0} documents`);
    } else {
      console.error(`[eval]    Retrieval failed: ${retrieveRes.status} ${await retrieveRes.text()}`);
      process.exit(1);
    }
  } catch (err) {
    console.error(`[eval]    Retrieval error:`, err);
    process.exit(1);
  }

  // 2. Identity (Mocked for Eval)
  console.log(`[eval] 2. Bypassing identity resolution for eval...`);
  const fmpProfile = retrievalResult.fmpProfile || {};
  const identityCard = {
    ticker: ticker.toUpperCase(),
    legal_name: fmpProfile.companyName || companyName,
    exchange: fmpProfile.exchange || 'N/A',
    business_description: fmpProfile.description || 'N/A',
    products: [],
    customer_segments: [],
    revenue_model: [],
    markets_served: [fmpProfile.industry || 'N/A'],
    strategic_priorities: [],
    primary_risks: [],
    identity_status: 'PASS'
  };

  // 3. Ground Truth
  console.log(`[eval] 3. Assembling Ground Truth Object™...`);
  let groundTruthContext = '';
  try {
    const gtRes = await fetch(`${baseUrl}/api/lens/ground-truth`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        ticker: ticker.toUpperCase(),
        companyName,
        retrievalResult,
        identityCard,
      }),
    });
    if (gtRes.ok) {
      const gtData = await gtRes.json();
      groundTruthContext = gtData.promptContext;
      console.log(`[eval]    Ground truth assembled (${groundTruthContext?.length || 0} chars)`);
    } else {
      console.error(`[eval]    Ground truth failed: ${gtRes.status}`);
      process.exit(1);
    }
  } catch (err) {
    console.error(`[eval]    Ground truth error:`, err);
    process.exit(1);
  }

  // 4. Generation
  console.log(`[eval] 4. Generating Lens Snapshot v5.0 (calling Anthropic)...`);
  try {
    const rawOutput = await callLensEngineV5(ticker.toUpperCase(), groundTruthContext);
    
    if (!rawOutput) {
      console.error(`[eval]    Generation returned null`);
      process.exit(1);
    }

    // Try to extract and format JSON
    let jsonOutput = rawOutput;
    try {
      const trimmed = rawOutput.trim();
      const match = trimmed.match(/\{[\s\S]*\}/);
      if (match) {
        const parsed = JSON.parse(match[0]);
        jsonOutput = JSON.stringify(parsed, null, 2);
        console.log(`[eval]    Valid JSON generated`);
      } else {
        console.warn(`[eval]    Warning: Output does not appear to be valid JSON`);
      }
    } catch (e) {
      console.warn(`[eval]    Warning: Failed to parse output as JSON`, e);
    }

    // 5. Save output
    const outDir = path.resolve(__dirname, 'eval-output');
    if (!fs.existsSync(outDir)) {
      fs.mkdirSync(outDir, { recursive: true });
    }
    const outFile = path.join(outDir, `${ticker.toUpperCase()}-v5-eval.json`);
    fs.writeFileSync(outFile, jsonOutput, 'utf-8');
    
    console.log(`\n[eval] ✅ Success! Output saved to: ${outFile}`);
    
  } catch (err) {
    console.error(`[eval]    Generation error:`, err);
    process.exit(1);
  }
}

main().catch(console.error);
