"use client";
import React, { useEffect, useState } from "react";
import { PublicKey, Keypair, Transaction, TransactionInstruction, SystemProgram, sendAndConfirmTransaction } from "@solana/web3.js";
import { getAssociatedTokenAddress, getMint, getAccount, createAssociatedTokenAccountInstruction, createTransferInstruction } from "@solana/spl-token";
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Claim() {
  const { publicKey } = useWallet(); // Phantom wallet context
  const [tipLink, setTipLink] = useState(null);
  const [isClaimed, setIsClaimed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pubKey, setPubKey] = useState('');
  const [secKey, setSecKey] = useState('');
  const [amount, setAmount] = useState(0); // Amount of tokens received
  const [tokenAddress, setTokenAddress] = useState(''); // Token address (SPL token)
  const [tokenName, setTokenName] = useState(''); // Token name
  const { connection } = useConnection();

  const LAMPORTS_PER_SOL = 1_000_000_000;

  const fetchTipLink = async () => {
    setLoading(true);
    setError('');

    try {
      const currentLink = window.location.href;
      const response = await fetch(`https://frens-api-production.up.railway.app/freslink/fromURL?link=${encodeURIComponent(currentLink)}`);
      const data = await response.json();
      
      if (response.ok) {
        setTipLink(data.tipLink);
        const url = data.tipLink.url;
        const hash = url.split('#')[1];
        const tipLinkResponse = await fetch(`https://frens-api-production.up.railway.app/frenslink/fromLink?link=${hash}`);
        const tipLinkData = await tipLinkResponse.json();
        
        const publicKeyObj = tipLinkData.data.keypair._keypair.publicKey;
        const privateKeyObj = tipLinkData.data.keypair._keypair.secretKey;
        
        const publicKeyArray = Uint8Array.from(Object.values(publicKeyObj));
        const privateKeyArray = Uint8Array.from(Object.values(privateKeyObj));
        const publicKey = new PublicKey(publicKeyArray);
        const privateKey = Buffer.from(privateKeyArray).toString('hex');
        setPubKey(publicKey.toString());
        setSecKey(privateKey);
        
        // Token and amount received
        setAmount(data.tipLink.amount);
        setTokenAddress(data.token); // Set the SPL token address
        setTokenName(data.symbol);
      } else {
        setError(data.message || 'Error fetching tip link');
      }
    } catch (err) {
      setError('Error fetching tip link');
    } finally {
      setLoading(false);
    }
  };

  // Claim the TipLink by transferring the tokens
  const claimTipLink = async () => {
    if (!tipLink || !publicKey || !secKey) {
      toast.error('Connect wallet');
      return;
    };

    setLoading(true);
    setError('');
    
    try {
      const fromKeypair = Keypair.fromSecretKey(Uint8Array.from(Buffer.from(secKey, 'hex'))); // Create Keypair from private key
      const instructions: TransactionInstruction[] = [];

      if(tokenAddress == 'So11111111111111111111111111111111111111112') {
        const fromPublicKey = new PublicKey(pubKey);
        instructions.push(
          SystemProgram.transfer({
            fromPubkey: fromPublicKey,
            toPubkey: publicKey,
            lamports: Math.floor(amount * LAMPORTS_PER_SOL),
          })
        );
      } else {
        const fromPublicKey = new PublicKey(pubKey); // Sender's public key
        const mintPublicKey = new PublicKey(tokenAddress); // Token mint address

        // Fetch mint info (e.g., decimals)
        const mintInfo = await getMint(connection, mintPublicKey);
        const decimals = mintInfo.decimals;

        // Get associated token accounts (sender's and recipient's)
        const associatedTokenTo = await getAssociatedTokenAddress(mintPublicKey, publicKey); // Recipient's associated token account
        const associatedTokenFrom = await getAssociatedTokenAddress(mintPublicKey, fromPublicKey); // Sender's associated token account

        // Check if the recipient's associated token account exists
        if (!(await connection.getAccountInfo(associatedTokenTo))) {
          // If the recipient's account doesn't exist, create it
          instructions.push(
            createAssociatedTokenAccountInstruction(
              fromPublicKey,        // Payer of the creation
              associatedTokenTo,     // Recipient's associated token account
              publicKey,       // Owner of the new account
              mintPublicKey          // Token mint
            )
          );
        }

        // Check if the sender's associated token account has sufficient balance
        const fromAccount = await getAccount(connection, associatedTokenFrom);
        if (fromAccount.amount < BigInt(Math.floor(amount * Math.pow(10, decimals)))) {
          throw new Error('Insufficient balance in the sender’s account');
        }

        // Add transfer instruction
        instructions.push(
          createTransferInstruction(
            associatedTokenFrom,                                   // Sender's associated token account
            associatedTokenTo,                                     // Recipient's associated token account
            fromPublicKey,                                         // Signer (sender's public key)
            Math.floor(amount * Math.pow(10, decimals))            // Amount (with decimals)
          )
        );
      }
      
      const transaction = new Transaction()
        .add(...instructions);

      // const {
      //   value: { blockhash, lastValidBlockHeight }
      // } = await connection.getLatestBlockhashAndContext();
      const signature = await sendAndConfirmTransaction(
        connection,        // Solana connection object
        transaction,       // Transaction object
        [fromKeypair]      // Array of signers (just the fromKeypair in this case)
      );
      const currentLink = window.location.href;
      const response = await fetch(`https://frens-api-production.up.railway.app/frenslink/claim?link=${encodeURIComponent(currentLink)}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tipLinkUrl: (tipLink as any).url,
        }),
      });
  
      const data = await response.json();
      
      if (response.ok) {
        setIsClaimed(true);
        toast.success('Tokens claimed successfully!');
      } else {
        toast.error('Claim error');
        setError(data.message || 'Error claiming token');
      }

      
    } catch (err) {
      console.log(err)
      setError('Error claiming tokens: ' + (err as any).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTipLink();
  }, []);

  return (
    <div className="flex items-center justify-center">
      <div className="mt-10 p-8 text-center">
        {loading ? (
          <span>Loading...</span>
        ) : (
          <>
            {error === '' ? (
              <>
                <h1 className="text-2xl font-bold mb-4">Congratulations!</h1>
                <p className="text-gray-300 mb-6">You received {amount} {tokenName}.</p>
                <br />
                {isClaimed ? (
                  <p className="text-green-500">Tokens have been successfully claimed!</p>
                ) : (
                  <button
                    className="w-full h-full p-2 rounded-3xl h-[71px] bg-inherit flex mx-auto justify-center items-center gap-4"
                    style={{
                      background:
                        "linear-gradient(90deg, rgb(253, 247, 94) 0%, rgb(235, 171, 171) 33.33%, rgb(99, 224, 242) 66.66%, rgb(162, 112, 248) 100%)",
                    }}
                    onClick={claimTipLink}
                    disabled={loading || isClaimed}
                  >
                    <p className="text-base font-bold text-black">{loading ? 'Claiming...' : 'Claim'}</p>
                  </button>
                )}
              </>
            ) : (
              <p>{error}</p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
