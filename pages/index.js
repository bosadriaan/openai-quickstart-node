import Head from "next/head";
import { useState, useEffect } from "react";
import styles from "./index.module.css";

export default function Home() {
  const [position, setPosition] = useState({ x: 190, y: 130 });
  const [previousPosition, setPreviousPosition] = useState({ x: 180, y: 120 });
  const fieldSize = { width: 300, height: 200 };
  const logoSize = { width: 50, height: 50 };
  const [aiResponse, setAiResponse] = useState("");
  const [userExplanation, setUserExplanation] = useState("");
  const [gameState, setGameState] = useState("");
  const [highlightResponse, setHighlightResponse] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Function to reset the values to the initial state
  const resetValues = () => {
    setPosition({ x: 190, y: 130 });
    setPreviousPosition({ x: 180, y: 120 });
  };

  useEffect(() => {
    setGameState(
      `0, 0 is the top left of the screen. Determine the Next logo position as: 'x:##, y:##'.

  Current position   x: ${position.x}, y: ${position.y}
  Previous position   x: ${previousPosition.x}, y: ${previousPosition.y}
  Screen size   x: ${fieldSize.width}, y: ${fieldSize.height}
  Logo size   x: ${logoSize.width}, y: ${logoSize.height}`
    );
  }, [position, previousPosition, fieldSize, logoSize]);

  async function onSubmit(event) {
    event.preventDefault();
    try {
      setIsProcessing(true); // Start the loading indication
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
          userPrompt:  gameState + userExplanation,
        }),
      });

      const data = await response.json();

      if (response.status !== 200) {
        throw (
          data.error ||
          new Error(`Request failed with status ${response.status}`)
        );
      }

      // Parse the AI's response
      setAiResponse(data.result);
      setIsError(false);

      const resultString = data.result;

      let matches = [
        ...resultString.matchAll(/\bx:\s*(-?\d+),\s*y:\s*(-?\d+)\b/g),
      ];
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

      // Trigger the highlighting effect after a new response is rendered
      if (data.result) {
        setHighlightResponse(true);
        setTimeout(() => setHighlightResponse(false), 1000); // Adjust the timeout duration 
      }
    } catch (error) {
      console.error(error);
      // alert(error.message);
      setIsError(true);
    } finally {
      setIsProcessing(false); // End the loading indication
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
    border: "1px solid black",
    margin: "auto",
    position: "relative",
    backgroundColor: "#FFF7FE",
  };

  return (
    <div style={{ maxWidth: "600px", margin: "0 auto" }}>
      <Head>
        <title>AI DVD Logo</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <div style={{ display: "flex", alignItems: "baseline" }}>
          <h2>DVD screensaver by AI </h2>
          <span style={{ marginLeft: "10px" }}>AB 0.40</span>
        </div>
        <textarea value={gameState} readOnly />
        <textarea
          value={userExplanation}
          onChange={(e) => setUserExplanation(e.target.value)}
          placeholder="Enter additional instructions for the AI here. Make the logo bounce off the walls."
        />

        <div style={{ display: "flex", gap: "10px" }}>
          <button onClick={onSubmit}>Move Logo</button>
          <button onClick={resetValues}>Reset Logo</button>
        </div>

        <div className={styles.field} style={fieldStyle}>
          <img src="/logo.png" style={previousLogoStyle} />
          <img src="/logo.png" style={currentLogoStyle} />
        </div>
        <div className={styles.aiResponse}>
          <h3
            className={`${highlightResponse ? styles.highlight : ""} ${
              isError ? styles.errorHighlight : ""
            } ${isProcessing ? styles['isProcessing'] : ""}
            ${styles.title}`}
          >
            AI Response:
          </h3>

          <p>
            {aiResponse}
            <br />
            <br />
            <br />
          </p>
        </div>
      </main>
    </div>
  );
}
