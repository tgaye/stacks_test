import './App.css';
import { useState, useEffect } from 'react';
import Client from "@walletconnect/sign-client";
import QRCodeModal from "@walletconnect/qrcode-modal";

const chains = [
  "bip122:000000000019d6689c085ae165831e93",
  "bip122:000000000933ea01ad0ee984209779ba",
];

function App() {
  const [client, setClient] = useState(undefined);
  const [session, setSession] = useState(undefined);
  const [chain, setChain] = useState(undefined);

  const handleConnect = async (chain) => {
    setChain(undefined);
    if (chain.includes("stacks")) {
      const { uri, approval } = await client.connect({
        pairingTopic: undefined,
        requiredNamespaces: {
          stacks: {
            methods: [
              "stacks_signMessage",
              "stacks_stxTransfer",
              "stacks_contractCall",
              "stacks_contractDeploy",
            ],
            chains: [chain],
            events: [],
          },
        },
      });

      if (uri) {
        QRCodeModal.open(uri, () => {
          console.log("QR Code Modal closed");
        });
      }

      const sessn = await approval();
      setSession(sessn);
      setChain(chain);
      // saveToLocalStorage("session", sessn);
      // saveToLocalStorage("chain", chain);
      QRCodeModal.close();
    } else {
      const { uri, approval } = await client.connect({
        pairingTopic: undefined,
        requiredNamespaces: {
          bip122: {
            methods: ["bitcoin_btcTransfer"],
            chains: [chain],
            events: [],
          },
        },
      });

      if (uri) {
        QRCodeModal.open(uri, () => {
          console.log("QR Code Modal closed");
        });
      }

      const sessn = await approval();
      setSession(sessn);
      setChain(chain);
      // saveToLocalStorage("session", sessn);
      // saveToLocalStorage("chain", chain);
      QRCodeModal.close();
    }
  };

  useEffect(() => {
    const initClient = async () => {
      const c = await Client.init({
        logger: 'debug',
        relayUrl: 'wss://relay.walletconnect.com',
        projectId: 'aa16324ae2a2e968fa85fd7987f4ba27',
        metadata: {
          name: "My Bitcoin WalletConnect App",
          description: "Awesome application",
          icons: ["https://avatars.githubusercontent.com/u/37784886"],
        },
      });

      setClient(c);
    }

    if (client === undefined) {
      initClient();
    }
  }, [client]);

  return (
    <div className="main">
      <h1>Wallet Connect with Bitcoin</h1>
      {
        !session && (
          <div className="box">
            <h3>Select chain:</h3>
            {chains.map((c, idx) => {
              return (<div key={`chain-${idx}`}>{c} <button disabled={!client} onClick={async () => await handleConnect(c)}>connect</button></div>);
            })}
          </div>
        )
      }
    </div>
  );
}

export default App;