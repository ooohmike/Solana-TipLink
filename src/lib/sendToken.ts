import { Connection, PublicKey, SystemProgram, Transaction, TransactionInstruction } from "@solana/web3.js";
import { getAccount, createAssociatedTokenAccountInstruction, createTransferInstruction, getAssociatedTokenAddress, getMint } from "@solana/spl-token";

export async function transfer(
  tokenMintAddress: string,
  wallet: any,
  connection: Connection,
  multiLinks: { address: string; amount: number; }[]
) {
  const LAMPORTS_PER_SOL = 1_000_000_000;
  const TIPLINK_MINIMUM_LAMPORTS = 4083560;
  const TIPLINK_SOL_ONLY_LINK_MINIMUM_LAMPORTS = 900000;

  const instructions: TransactionInstruction[] = [];

  if(tokenMintAddress == 'So11111111111111111111111111111111111111112') {
    for (const link of multiLinks) {
      const to = link.address;
      const destPublicKey = new PublicKey(to);
      
      instructions.push(
        SystemProgram.transfer({
          fromPubkey: wallet.publicKey,
          toPubkey: destPublicKey,
          lamports: Math.floor(link.amount * LAMPORTS_PER_SOL) + TIPLINK_SOL_ONLY_LINK_MINIMUM_LAMPORTS,
        })
      );
    }
  } else {
    const mintPublicKey = new PublicKey(tokenMintAddress);
    const mintInfo = await getMint(connection, mintPublicKey);
    const decimals = mintInfo.decimals;
    const associatedTokenFrom = await getAssociatedTokenAddress(
      mintPublicKey,
      wallet.publicKey
    );
    const fromAccount = await getAccount(connection, associatedTokenFrom);
  
    for(const link of multiLinks) {
      const to = link.address;
      const destPublicKey = new PublicKey(to);
      const associatedTokenTo = await getAssociatedTokenAddress(
        mintPublicKey,
        destPublicKey
      );
      
      if (!(await connection.getAccountInfo(associatedTokenTo))) {
        instructions.push(
          createAssociatedTokenAccountInstruction(
            wallet.publicKey,
            associatedTokenTo,
            destPublicKey,
            mintPublicKey
          )
        );
      }
      instructions.push(
        SystemProgram.transfer({
          fromPubkey: wallet.publicKey,
          toPubkey: destPublicKey,
          lamports: TIPLINK_MINIMUM_LAMPORTS,
        })
      );
      instructions.push(
        createTransferInstruction(
          fromAccount.address,
          associatedTokenTo,
          wallet.publicKey,
          Math.floor(link.amount * Math.pow(10, decimals)),
        )
      );
    }
  }
  
  const transaction = new Transaction()
    .add(...instructions);

  const {
    value: { blockhash, lastValidBlockHeight }
  } = await connection.getLatestBlockhashAndContext();
  
  const signature = await wallet.sendTransaction(transaction, connection);
  await connection.confirmTransaction({ blockhash, lastValidBlockHeight, signature });
}
