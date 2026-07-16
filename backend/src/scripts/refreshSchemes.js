// Standalone CLI: node src/scripts/refreshSchemes.js
// Forces a live fetch from Government sources and prints a summary — useful for
// verifying your DATA_GOV_IN_API_KEY / DATA_GOV_IN_RESOURCE_IDS / network setup
// without starting the whole server.
import { refreshSchemes } from '../services/schemeSource.service.js';

const { meta } = await refreshSchemes();
console.log(JSON.stringify(meta, null, 2));
