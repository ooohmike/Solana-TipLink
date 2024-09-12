"use client";

import React from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { SolanaTokenProps, MultiLinkProps } from "@/types";

interface MultiLinkButtonGroupProps {
  countClaim: number;
  setCountClaim: (e: number) => void;
  isWalletConnected: Boolean;
  selectedToken: SolanaTokenProps | null;
  payAmount: number;
  multiLink: MultiLinkProps[];
  setMultiLink: (e: MultiLinkProps[]) => void;
  setIsLinkGenerated: (e: Boolean) => void;
}

function generateRandomValues(amount: number, count: number): number[] {
  // Helper function to generate random value with specified precision
  const generateRandom = (max: number): number =>
    parseFloat((Math.random() * max).toFixed(10));

  // Validate input
  if (count <= 0) throw new Error("Count must be greater than 0");
  if (amount <= 0) throw new Error("Amount must be greater than 0");
  if (amount < count * 1e-10)
    throw new Error("Amount is too small for the given count");

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
    payAmount: number
  ): Promise<MultiLinkProps[]> {
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
      balance: balances[index],
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
      toast.error("Please connect wallet!", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
      });
      return;
    }
    if (props.payAmount > (props.selectedToken?.balance ?? 0)) {
      console.log(props.payAmount + ">" + props.selectedToken?.balance);
      toast.error("Payment balance exceeds wallet balance!", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
      });
      return;
    }

    generateMultiLinks(props.countClaim, props.payAmount).then(
      (res: MultiLinkProps[]) => {
        console.log(res);
        props.setMultiLink(res);
        props.setIsLinkGenerated(true);
      }
    );
  };

  return (
    <div className="mt-5 grid grid-cols-2 gap-5 max-w-md mx-auto">
      <div className="w-full flex justify-center border-4 border-[#cbd5e0] p-2 rounded h-[71px] bg-inherit">
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
          className="w-full h-full border-4 border-[#cbd5e0] p-2 rounded h-[71px] bg-inherit"
          onClick={handleClick}
        >
          Create Link
        </button>
      </div>
      <ToastContainer />
    </div>
  );
}
