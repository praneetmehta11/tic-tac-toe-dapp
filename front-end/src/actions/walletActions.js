import { WALLET_ADDRESS, WALLET_STATUS } from "./types";

export const changeWalletStatus = (status) => (dispatch) => {
  dispatch({
    type: WALLET_STATUS,
    payload: status,
  });
};

export const changeAccount = (account) => (dispatch) => {
  dispatch({
    type: WALLET_ADDRESS,
    payload: account,
  });
};
