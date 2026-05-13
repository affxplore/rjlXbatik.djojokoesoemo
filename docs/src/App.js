import { useEffect } from "react";
import "@/App.css";

const Home = () => {
  useEffect(() => {
    // Redirect to the static RJL Group website
    window.location.href = "/rjl-index.html";
  }, []);

  return (
    <div>
      <header className="App-header">
        <p>Redirecting to RJL Group website...</p>
      </header>
    </div>
  );
};

function App() {
  return (
    <div className="App">
      <Home />
    </div>
  );
}

export default App;
