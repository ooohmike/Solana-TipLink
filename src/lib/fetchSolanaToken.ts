// lib/fetchSolanaToken.ts
import axios from "axios";

interface SolanaToken {
  address: string;
  chainId: number;
  name: string;
  symbol: string;
  logoURI: string;
  decimals: number;
}

const SOLANA_TOKEN_LIST_URL =
  "https://raw.githubusercontent.com/solana-labs/token-list/main/src/tokens/solana.tokenlist.json";

// List of token symbols we want to display
const TOKEN_SYMBOLS = ["USDT", "USDC", "BTC", "ETH", "SOL", "BNB", "COPE"];

export const fetchSolanaTokenList = async (): Promise<SolanaToken[]> => {
  try {
    const response = await axios.get(SOLANA_TOKEN_LIST_URL);
    const tokens = response.data.tokens as SolanaToken[];
    // Filter the tokens based on the specific symbols
    const filteredTokens = tokens.filter((token) =>
      TOKEN_SYMBOLS.includes(token.symbol)
    );

    return filteredTokens;
  } catch (error) {
    console.error("Error fetching Solana tokens:", error);
    throw new Error("Failed to fetch Solana token data");
  }
};
