import { Connection, PublicKey, Transaction, TransactionInstruction } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID, getOrCreateAssociatedTokenAccount, createAssociatedTokenAccountInstruction, createTransferInstruction, getAssociatedTokenAddress } from "@solana/spl-token";
import { Wallet } from "@project-serum/anchor";

export async function transfer(
  tokenMintAddress: string,
  wallet: Wallet,
  to: string,
  connection: Connection,
  amount: number
) {
  const mintPublicKey = new PublicKey(tokenMintAddress);
  const destPublicKey = new PublicKey(to);

  // Get or create the associated token account for the sender
  const fromTokenAccount = await getOrCreateAssociatedTokenAccount(
    connection,
    wallet.payer,
    mintPublicKey,
    wallet.publicKey
  );

  // Get the associated token address for the recipient
  const associatedDestinationTokenAddr = await getAssociatedTokenAddress(
    mintPublicKey,
    destPublicKey
  );

  // Check if the recipient's associated token account exists
  const receiverAccount = await connection.getAccountInfo(associatedDestinationTokenAddr);

  const instructions: TransactionInstruction[] = [];

  // If the recipient's associated token account does not exist, create it
  if (receiverAccount === null) {
    instructions.push(
      createAssociatedTokenAccountInstruction(
        wallet.publicKey,
        associatedDestinationTokenAddr,
        destPublicKey,
        mintPublicKey
      )
    );
  }

  // Add the transfer instruction
  instructions.push(
    createTransferInstruction(
      fromTokenAccount.address,
      associatedDestinationTokenAddr,
      wallet.publicKey,
      amount
    )
  );

  // Create and sign the transaction
  const transaction = new Transaction().add(...instructions);
  transaction.feePayer = wallet.publicKey;
  transaction.recentBlockhash = (await connection.getRecentBlockhash()).blockhash;

  // Send the transaction
  const transactionSignature = await connection.sendTransaction(transaction, [wallet.payer], {
    skipPreflight: false,
    preflightCommitment: "singleGossip"
  });

  // Confirm the transaction
  await connection.confirmTransaction(transactionSignature, "singleGossip");
}
