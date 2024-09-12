import { fetchSolanaTokenList } from "../../lib/fetchSolanaToken";

export default async function handler(req, res) {
  try {
    const tokens = await fetchSolanaTokenList();
    res.status(200).json(tokens);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch token data" });
  }
}
