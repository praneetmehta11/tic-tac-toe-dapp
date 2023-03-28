import { WALLET_ADDRESS, WALLET_STATUS } from "../actions/types";

const initialState = {
  isConnected: false,
  walletAddress: "",
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case WALLET_ADDRESS:
      return {
        ...state,
        walletAddress: action.payload,
      };
    case WALLET_STATUS:
      return {
        ...state,
        isConnected: action.payload,
      };

    default:
      return state;
  }
};

export default reducer;
