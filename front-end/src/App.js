import { Provider } from "react-redux";
import "./App.css";
import MetaMask from "./components/MetaMask/MetaMask";
import store from "./store";
import { useDispatch, useSelector } from "react-redux";
import Home from "./components/Home/Home";
import Game from "./components/Game/Game";

function App() {
  return (
    <Provider store={store}>
      <div style={{ height: "100vh", width: "100vw" }}>
        <Game></Game>
      </div>
    </Provider>
  );
}

export default App;
