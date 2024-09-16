"use client";

import React from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { SolanaTokenProps, MultiLinkProps } from "@/types";
import { ClipLoader } from "react-spinners";

interface MultiLinkButtonGroupProps {
  countClaim: number;
  setCountClaim: (e: number) => void;
  isWalletConnected: Boolean;
  selectedToken: SolanaTokenProps | null;
  payAmount: number;
  multiLink: MultiLinkProps[];
  setMultiLink: (e: MultiLinkProps[]) => void;
  setIsLinkGenerated: (e: Boolean) => void;
  sendToken: (multiLink: MultiLinkProps[]) => void;
  isClaimCreating: Boolean;
  isRandomize: Boolean;
}

function generateRandomValues(amount: number, count: number): number[] {
  // Helper function to generate random value with specified precision
  const generateRandom = (max: number): number =>
    parseFloat((Math.random() * max).toFixed(10));

  let parts: number[] = [];
  let total: number = 0;

  // Generate random parts
  for (let i = 0; i < count - 1; i++) {
    const max: number = amount - total;
    const part: number = generateRandom(max);
    parts.push(part);
    total += part;
  }

  // Add the last part to ensure the sum is exactly the amount
  const lastPart: number = parseFloat((amount - total).toFixed(10));
  parts.push(lastPart);

  // Shuffle the array to randomize the order
  return parts;
}

export default function MultiLinkButtonGroup(props: MultiLinkButtonGroupProps) {
  async function generateMultiLinks(
    countClaim: number,
    payAmount: number,
    isRandomize: Boolean
  ): Promise<MultiLinkProps[]> {
    console.log("randomize", isRandomize);
    // Validate input
    if (countClaim <= 0) {
      toast.error("Count must be greater than 0", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
      });
      return [];
    }
    if (payAmount <= 0) {
      toast.error("Amount must be greater than 0", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
      });
      return [];
    }
    if (payAmount < countClaim * 1e-10) {
      toast.error("Amount is too small for the given count", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
      });
      return [];
    }
    // Fetch URLs
    const urlPromises = Array.from({ length: countClaim }, () =>
      fetch("http://localhost:3001/tiplink/create").then((res) => res.json())
    );

    // Await all URL fetches
    const urlResponses = await Promise.all(urlPromises);
    const urlList = urlResponses
      .filter((response) => response.message === "TipLink created")
      .map((response) => response.data.url);

    // Generate random values
    const balances = generateRandomValues(payAmount, countClaim);

    // Combine URLs and balances into MultiLinkProps
    return urlList.slice(0, countClaim).map((address, index) => ({
      address,
      //balance: balances[index],
      balance: isRandomize ? balances[index] : payAmount / countClaim,
      status: false,
    }));
  }

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(event.target.value); // Convert string to number
    if (!isNaN(value)) {
      props.setCountClaim(value); // Pass the number to setCountClaim
    }
  };

  const handleClick = async () => {
    if (!props.isWalletConnected) {
      alert("ddd");
      toast.error("Please connect wallet!", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        draggable: true,
        theme: "dark",
      });
      return;
    }
    if (props.isRandomize) {
      if (
        props.payAmount * props.countClaim >
        (props.selectedToken?.balance ?? 0)
      ) {
        toast.error("Payment balance exceeds wallet balance!", {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          draggable: true,
          theme: "dark",
        });
        return;
      }
    }
    {
      if (props.payAmount > (props.selectedToken?.balance ?? 0)) {
        toast.error("Payment balance exceeds wallet balance!", {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          draggable: true,
          theme: "dark",
        });
        return;
      }

      generateMultiLinks(
        props.countClaim,
        props.payAmount,
        props.isRandomize ? true : false
      ).then((res: MultiLinkProps[]) => {
        console.log(res);
        if (res.length > 0) {
          console.log("multilinks", res);
          props.setMultiLink(res);
          props.setIsLinkGenerated(true);
          props.sendToken(res);
        }
      });
    }
  };

  return (
    <div className="mt-5 grid grid-cols-2 gap-5 max-w-md mx-auto">
      <div className="w-full flex justify-center border-4 border-[#cbd5e0] p-2 rounded-3xl h-[71px] bg-inherit">
        <input
          inputMode="decimal"
          placeholder="Number of times link can be claimed"
          min="0"
          className="bg-inherit focus:border-0 focus:outline-none min-w-4 max-w-10"
          pattern="^\d*([.,]\d*)?$"
          type="tel"
          value={props.countClaim}
          onChange={handleChange}
        />
        <p className="my-auto">Claims</p>
      </div>
      <div>
        <button
          className="w-full h-full p-2 rounded-3xl h-[71px] bg-inherit flex mx-auto justify-center items-center gap-4"
          style={{
            background:
              "linear-gradient(90deg, rgb(253, 247, 94) 0%, rgb(235, 171, 171) 33.33%, rgb(99, 224, 242) 66.66%, rgb(162, 112, 248) 100%)",
          }}
          onClick={handleClick}
        >
          {props.isClaimCreating ? (
            <div className="flex items-center">
              <ClipLoader size={20} color="#fff" />
            </div>
          ) : null}
          <p className="text-base font-bold text-black">Create Link</p>
        </button>
      </div>
    </div>
  );
}
