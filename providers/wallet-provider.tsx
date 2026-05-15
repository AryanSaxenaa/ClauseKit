"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import {
  StellarWalletsKit,
  Networks,
} from "@creit.tech/stellar-wallets-kit";
import { FreighterModule } from "@creit.tech/stellar-wallets-kit/modules/freighter";
import { xBullModule } from "@creit.tech/stellar-wallets-kit/modules/xbull";
import { AlbedoModule } from "@creit.tech/stellar-wallets-kit/modules/albedo";

interface WalletContextType {
  address: string | null;
  isConnecting: boolean;
  isTestnet: boolean;
  connect: () => Promise<string>;
  disconnect: () => Promise<void>;
  signTransaction: (xdr: string) => Promise<string>;
}

const WalletContext = createContext<WalletContextType | null>(null);

const TESTNET_PASSPHRASE = Networks.TESTNET;

let kitInitialized = false;

function initKit() {
  if (!kitInitialized) {
    StellarWalletsKit.init({
      modules: [
        new FreighterModule(),
        new xBullModule(),
        new AlbedoModule(),
      ],
      network: TESTNET_PASSPHRASE,
    });
    kitInitialized = true;
  }
}

export function WalletProvider({ children }: { children: ReactNode }) {
  const [address, setAddress] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isTestnet, setIsTestnet] = useState(true);

  const connect = useCallback(async () => {
    setIsConnecting(true);
    try {
      initKit();
      const result = await StellarWalletsKit.authModal();
      setAddress(result.address);

      // Verify wallet is on testnet
      try {
        const net = await StellarWalletsKit.getNetwork();
        setIsTestnet(net.networkPassphrase === TESTNET_PASSPHRASE);
      } catch {
        setIsTestnet(true);
      }

      return result.address;
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const disconnect = useCallback(async () => {
    try {
      await StellarWalletsKit.disconnect();
    } catch {
      // ignore disconnect errors
    }
    setAddress(null);
    kitInitialized = false;
  }, []);

  const signTransaction = useCallback(
    async (xdr: string): Promise<string> => {
      initKit();
      const result = await StellarWalletsKit.signTransaction(xdr, {
        networkPassphrase: TESTNET_PASSPHRASE,
      });
      return result.signedTxXdr;
    },
    []
  );

  useEffect(() => {
    initKit();
    return () => {
      kitInitialized = false;
    };
  }, []);

  return (
    <WalletContext.Provider
      value={{
        address,
        isConnecting,
        isTestnet,
        connect,
        disconnect,
        signTransaction,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error("useWallet must be used within WalletProvider");
  return ctx;
}
