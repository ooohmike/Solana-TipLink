import React, { useEffect, useState } from "react";
import { useRouter } from 'next/router';
import { PublicKey, Keypair } from "@solana/web3.js";

export default function Claim() {
  const [tipLink, setTipLink] = useState(null);
  const [isClaimed, setIsClaimed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pubKey, setPubKey] = useState('');
  const [secKey, setSecKey] = useState('');

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
        const response = await fetch(
            `https://frens-api-production.up.railway.app/frenslink/fromLink?link=${
                hash
            }`
        );
        const res = await response.json();
        const publicKeyObj = res.data.keypair._keypair.publicKey;
        const privateKeyObj = res.data.keypair._keypair.secretKey;
        
        const publicKeyArray = Uint8Array.from(Object.values(publicKeyObj));
        const privateKeyArray = Uint8Array.from(Object.values(privateKeyObj));
        const publicKey = new PublicKey(publicKeyArray);
        const privateKey = Buffer.from(privateKeyArray).toString('hex')
        setPubKey(publicKey.toString());
        setSecKey(privateKey);
      } else {
        setError(data.message || 'Error fetching tip link');
      }
    } catch (err) {
      setError('Error fetching tip link');
    } finally {
      setLoading(false);
    }
  };

  // Claim the TipLink by setting isClaimed to true
  const claimTipLink = async () => {
    if (!tipLink) return;

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/tiplink/claim', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tipLink }), // Pass the tipLink to the claim API
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setIsClaimed(true);
      } else {
        setError(data.message || 'Error claiming tip link');
      }
    } catch (err) {
      setError('Error claiming tip link');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTipLink();
  }, [])

  return (
    <div className="flex items-center justify-center">
      <div className="mt-10 p-8 text-center">
        {loading ? <>
          <span>Loading...</span>
        </>:<>
          {error == '' ? <>
            <h1 className="text-2xl font-bold mb-4">Congratulations!</h1>
            <p className="text-gray-300 mb-6">You received link.</p>
            <br></br>
            <p>Public Key: {pubKey}</p>
            <p>Private Key: {secKey}</p>
          </>:<>
            <p>{error}</p>
          </>}
        </>}
        {/* <button
          className="w-full h-full p-2 rounded-3xl h-[71px] bg-inherit flex mx-auto justify-center items-center gap-4"
          style={{
            background:
              "linear-gradient(90deg, rgb(253, 247, 94) 0%, rgb(235, 171, 171) 33.33%, rgb(99, 224, 242) 66.66%, rgb(162, 112, 248) 100%)",
          }}
          onClick={() => claim()}
        >
          <p className="text-base font-bold text-black">Claim</p>
        </button> */}
      </div>
    </div>
  );
}
