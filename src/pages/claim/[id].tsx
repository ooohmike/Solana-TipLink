import React, { useEffect, useState } from "react";
import { useRouter } from 'next/router';
import { PublicKey, Keypair } from "@solana/web3.js";

export default function Claim() {
  const router = useRouter();
  const { id } = router.query;
  const [hashValue, setHashValue] = useState('');
  const [pubKey, setPubKey] = useState('');
  const [secKey, setSecKey] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash;
      if (hash) {
        (async() => {
            setHashValue(hash.substring(1)); // Removes the '#' from the hash
            const response = await fetch(
                `https://tiplink-api-production.up.railway.app/tiplink/fromLink?link=${
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
            console.log(privateKey)
            setPubKey(publicKey.toString());
            setSecKey(privateKey);
        })();
      }
    }
  }, []);

//   const claim = async () => {
//     if(hashValue) {
        
//     }
    
//   }

  return (
    <div className="flex items-center justify-center">
      <div className="mt-10 p-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Congratulations!</h1>
        <p className="text-gray-300 mb-6">You received link.</p>
        
        <br></br>
        <p>Public Address: {pubKey}</p>
        <p>Secret Key: {secKey} </p>
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
