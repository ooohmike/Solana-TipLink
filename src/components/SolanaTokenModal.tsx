"use client";

import React from "react";
import Image from "next/image";
import Modal from "react-responsive-modal";
import "react-responsive-modal/styles.css";
import { SolanaTokenProps } from "@/types";
import close from "/public/close.svg";

interface SolanaTokenModalProps {
  isOpen: boolean;
  tokens: SolanaTokenProps[];
  selectedToken: SolanaTokenProps | null;
  setModalIsOpen: (isOpen: boolean) => void;
  setPaymentAmount: (e: number) => void;
  setSelectedToken: (token: SolanaTokenProps) => void;
}

const customStyles = {
  top: "50%",
  left: "50%",
  right: "auto",
  bottom: "auto",
  marginRight: "-50%",
  transform: "translate(-50%, -50%)",
  width: "30%",
  height: "50%",
  backgroundColor: "lavender",
};

export default function SolanaTokenModal(props: SolanaTokenModalProps) {
  const customCloseButton = () => {
    return (
      <div className="text-white mr-3 mt-3">
        <Image src={close} alt="close" />
      </div>
    );
  };

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
    <Modal
      open={props.isOpen}
      onClose={closeModal}
      classNames={{ modal: "tokenModal", overlay: "tokenModalOverlay" }}
      closeIcon={customCloseButton()}
    >
      <div className="h-[70vh] w-[400px] bg-gradient-to-r from-yellow-400 via-pink-300 via-cyan-300 to-purple-500 p-1 rounded-[44px] m-0 overflow-hidden">
        <div className="h-full w-full bg-[#131313] rounded-[44px] flex flex-col pt-12 px-4 gap-8">
          <div className="flex flex-col gap-5">
            <p className="text-xs text-bold">Selected Token</p>
            <div className="flex justify-between px-4 cursor-pointer">
              <div className="flex gap-3">
                <Image
                  src={props.selectedToken?.info.image || ""}
                  alt="slected Token"
                  width={24}
                  height={24}
                />
                <p className="text-sm">{props.selectedToken?.info.name}</p>
              </div>
              <p className="text-sm">{props.selectedToken?.balance}</p>
            </div>
          </div>
          <hr className="w-[109%] mx-[-16px]"></hr>
          <div className="flex flex-col gap-5">
            <p className="text-xs text-bold">Your Tokens</p>
            <div
              className={`flex flex-col gap-5 ${
                props.tokens.length >= 10
                  ? "overflow-scroll"
                  : "overflow-hidden"
              }`}
            >
              <ul className="flex flex-col gap-4">
                {props.tokens &&
                  props.tokens.map((token) => (
                    <li
                      key={token.address}
                      className="flex justify-between px-4 cursor-pointer"
                      onClick={() => handleChange(token)}
                    >
                      <div className="flex gap-3">
                        <Image
                          src={token.info.image || ""}
                          alt="slected Token"
                          width={24}
                          height={24}
                        />
                        <p className="text-sm">
                          {token.info.name + "  (" + token.info.symbol + ")"}
                        </p>
                      </div>
                      <p className="text-sm">{token.balance}</p>
                    </li>
                  ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
