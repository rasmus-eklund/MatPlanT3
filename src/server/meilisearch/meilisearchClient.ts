import MeiliSearch from "meilisearch";
import { env } from "~/env.mjs";


const msClient = new MeiliSearch({
  host: env.MEILISEARCH_HOST,
  apiKey: env.MEILISEARCH_KEY,
});

export default msClient;