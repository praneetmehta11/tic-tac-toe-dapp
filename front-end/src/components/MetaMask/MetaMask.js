import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { changeAccount, changeWalletStatus } from "../../actions/walletActions";
import { initEthers } from "../../services/CustomEthers.service";
import "./MetaMask.css";

const MetaMask = (props) => {
  const isConnected = useSelector((state) => state.wallet.isConnected);
  const address = useSelector((state) => state.wallet.walletAddress);
  const dispatch = useDispatch();
  const [hasMetamask, setHasMetamask] = useState(false);

  useEffect(() => {
    const { ethereum } = window;
    const checkMetamaskAvailability = async () => {
      if (!ethereum) {
        setHasMetamask(false);
      } else {
        setHasMetamask(true);
      }
    };
    checkMetamaskAvailability();
  }, []);

  const connectWallet = async () => {
    try {
      const { ethereum } = window;
      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });
      dispatch(changeWalletStatus(true));
      dispatch(changeAccount(accounts[0]));
      ethereum.on("accountsChanged", function (accounts) {
        dispatch(changeAccount(accounts[0]));
      });
      ethereum.on("chainChanged", function (chainId) {});
      await initEthers();
      console.log(accounts);
    } catch (error) {}
  };

  return (
    <div className="metamask-container">
      {hasMetamask && address === "" && (
        <button className="connect-button" onClick={connectWallet}>
          Connect Metamask
        </button>
      )}
    </div>
  );
};

export default MetaMask;
