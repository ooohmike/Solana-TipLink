"use client";

import React from "react";
import Modal from "react-modal";
import { SolanaTokenProps } from "@/types";

interface SolanaTokenModalProps {
  isOpen: boolean;
  setModalIsOpen: (isOpen: boolean) => void;
  setPaymentAmount: (e: number) => void;
  tokens: SolanaTokenProps[];
  setSelectedToken: (token: SolanaTokenProps) => void;
}

const customStyles = {
  content: {
    top: "50%",
    left: "50%",
    right: "auto",
    bottom: "auto",
    marginRight: "-50%",
    transform: "translate(-50%, -50%)",
    width: "30%",
    height: "50%",
    backgroundColor: "lavender",
  },
};

export default function SolanaTokenModal(props: SolanaTokenModalProps) {
  const closeModal = () => {
    props.setModalIsOpen(false);
  };

  const handleChange = (clickedToken: SolanaTokenProps) => {
    if (clickedToken) {
      props.setSelectedToken(clickedToken);
      props.setPaymentAmount(clickedToken.balance);
      closeModal();
    }
  };

  return (
    <div className="text-black relative">
      <Modal
        isOpen={props.isOpen}
        contentLabel="Select Token"
        style={customStyles}
      >
        <h2 className="text-lg text-blue-500 text-center">
          Please Select Token
        </h2>
        <button
          onClick={closeModal}
          className="text-black absolute right-5 top-2"
        >
          X
        </button>
        <div className="m-3 border-2 border-amber-700 h-[85%] p-5 rounded-lg">
          <ul className="flex flex-col gap-2">
            {props.tokens.map((token) => (
              <li
                key={token.address}
                className="flex gap-2 cursor-pointer border-1 bg-slate-800 rounded-lg p-1"
                onClick={() => handleChange(token)}
              >
                <img
                  src={token.info.image}
                  alt={token.info.name}
                  width={50}
                  height={50}
                />
                <div className="flex flex-col gap-1">
                  <p className="text-cyan-200">{token.info.name}</p>
                  <p className="text-cyan-200">{token.info.symbol}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </Modal>
    </div>
  );
}
