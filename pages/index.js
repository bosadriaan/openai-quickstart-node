import Head from "next/head";
import { useState } from "react";
import styles from "./index.module.css";

export default function Home() {
  const [position, setPosition] = useState({ x: 100, y: 130 });
  const [previousPosition, setpreviousPosition] = useState({ px: 95, py: 125 });
  const fieldSize = { width: 200, height: 200 };
  const logoSize = { width: 50, height: 50 };
  const [aiResponse, setAiResponse] = useState("");

  async function onSubmit(event) {
    event.preventDefault();
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          position,
          previousPosition,
          fieldSize,
          logoSize,
        }),
      });

      const data = await response.json();
      console.log("Response data:", data); // Log the response data

      if (response.status !== 200) {
        throw data.error || new Error(`Request failed with status ${response.status}`);
      }

      // Parse the AI's response
      setAiResponse(data.result);
      const resultString = data.result;

      
      const px = position.x;
      const py = position.y;
      
      const x = Number(resultString.match(/(?<=x: )\d+/)[0]);
      const y = Number(resultString.match(/(?<=y: )\d+/)[0]);


      console.log(x, y, px, py);

      // Update the state
      setpreviousPosition({ px, py });
      setPosition({ x, y });
      
    } catch (error) {
      console.error(error);
      alert(error.message);
    }
  }

  // Render the DVD logo at the current position
  const logoStyle = {
    position: "absolute",
    left: `${position.x}px`,
    top: `${position.y}px`,
  };

  // CSS styles for the field container
  const fieldStyle = {
    width: `${fieldSize.width}px`,
    height: `${fieldSize.height}px`,
    border: "4px solid black",
    margin: "auto",
    position: "relative",
  };

  return (
    <div>
      <Head>
        <title>AI DVD Logo</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1>DVD Logo Bouncing with AI</h1>
        <button onClick={onSubmit}>Move Logo</button>
        <div className={styles.field} style={fieldStyle}>
          <img src="/logo.png" style={logoStyle} />
        </div>
        <div className={styles.aiResponse}>
          <p>AI Response:</p>
          <p>{aiResponse}</p>
        </div>
      </main>
    </div>
  );
}
