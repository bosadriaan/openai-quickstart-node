import Head from "next/head";
import { useState, useEffect } from "react";
import styles from "./index.module.css";

export default function Home() {
  const [position, setPosition] = useState({ x: 100, y: 130 });
  const [previousPosition, setPreviousPosition] = useState({ x: 90, y: 120 });
  const fieldSize = { width: 300, height: 200 };
  const logoSize = { width: 50, height: 50 };
  const [aiResponse, setAiResponse] = useState("");
  const [userExplanation, setUserExplanation] = useState("");
  const [gameState, setGameState] = useState("");

  useEffect(() => {
    setGameState(
  `Here are the current details: 
    current position       x: ${position.x}, y: ${position.y}
    previous position    x: ${previousPosition.x}, y: ${previousPosition.y}
    screen size                  width: ${fieldSize.width}, height: ${fieldSize.height}
    logo size                       width: ${logoSize.width}, height: ${logoSize.height}
  
0, 0 is the top left of the screen. Determine the new position as: 'x:##, y:##'.`
    );
  }, [position, previousPosition, fieldSize, logoSize]);

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
          userPrompt: userExplanation + gameState,
        }),
      });

      const data = await response.json();

      if (response.status !== 200) {
        throw data.error || new Error(`Request failed with status ${response.status}`);
      }

      // Parse the AI's response
      setAiResponse(data.result);
      const resultString = data.result;
      
      let matches = [...resultString.matchAll(/\bx:\s*(\d+),\s*y:\s*(\d+)\b/g)];
      let lastMatch = matches[matches.length - 1];
      if (lastMatch) {
        let [newX, newY] = lastMatch.slice(1).map(Number);
        
        // Update the state
        setPreviousPosition(position);
        setPosition({
          x: newX !== undefined ? newX : position.x,
          y: newY !== undefined ? newY : position.y,
        });
      }
      
    } catch (error) {
      console.error(error);
      alert(error.message);
    }
  }

  // Render the DVD logo at the current and previous positions
  const logoStyle = {
    position: "absolute",
    width: `${logoSize.width}px`,
    height: `${logoSize.height}px`,
  };

  const previousLogoStyle = {
    ...logoStyle,
    left: `${previousPosition.x}px`,
    top: `${previousPosition.y}px`,
    opacity: 0.5, // Adjust the opacity for the faded effect
    border: "1px solid black",
  };

  const currentLogoStyle = {
    ...logoStyle,
    left: `${position.x}px`,
    top: `${position.y}px`,
    zIndex: 1, // Ensure the current logo is on top
    border: "1px solid black",
  };

  // CSS styles for the field container
  const fieldStyle = {
    width: `${fieldSize.width}px`,
    height: `${fieldSize.height}px`,
    border: "2px solid black",
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
        <h1>DVD screensaver by AI</h1>
        <textarea 
          value={userExplanation} 
          onChange={e => setUserExplanation(e.target.value)} 
          placeholder="Enter additional explanation for the AI here"
        />
        <textarea 
          value={gameState} 
          readOnly
        />
        <button onClick={onSubmit}>Move Logo</button>
        <div className={styles.field} style={fieldStyle}>
          <img src="/logo.png" style={previousLogoStyle} />
          <img src="/logo.png" style={currentLogoStyle} />
        </div>
        <div className={styles.aiResponse}>
          <p>AI Response:</p>
          <p>{aiResponse}</p>
        </div>
      </main>
    </div>
  );
}
