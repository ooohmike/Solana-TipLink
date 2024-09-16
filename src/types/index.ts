export interface SolanaTokenProps {
    address: string;
    balance: number;
    info: {
      decimals?: number;
      image: string;
      name: string;
      symbol: string;
    };
  }

export interface MultiLinkProps {
  address: string;
  balance: number;
  status: Boolean;
}

export interface SolanaToken {
  address: string;
  chainId: number;
  name: string;
  symbol: string;
  logoURI: string;
  decimals: number;
}