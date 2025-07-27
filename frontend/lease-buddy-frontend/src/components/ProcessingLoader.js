"use client"

import { useState, useEffect } from "react"
import "./ProcessingLoader.css"

const ProcessingLoader = ({ currentStep, onReset }) => {
  const [progress, setProgress] = useState(0)

  const processingSteps = [
    "Uploading document...",
    "Extracting text content...",
    "Running NER analysis...",
    "Identifying named entities...",
    "Finalizing results...",
    "Processing complete!",
  ]

  useEffect(() => {
    const stepIndex = processingSteps.indexOf(currentStep)
    if (stepIndex !== -1) {
      setProgress((stepIndex / (processingSteps.length - 1)) * 100)
    }
  }, [currentStep, processingSteps])

  return (
    <div className="processing-container">
      <div className="processing-card">
        <div className="processing-spinner"></div>

        <h2 className="processing-title">Processing Your Document</h2>

        <p className="processing-description">
          Please wait while we analyze your document and extract named entities...
        </p>

        <div className="processing-status">
          <p className="processing-step">{currentStep}</p>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress}%` }}></div>
          </div>
        </div>

        <p className="processing-note">This may take a few moments depending on document size</p>

        <button className="reset-button" onClick={onReset}>
          🔄 Cancel & Upload New Document
        </button>
      </div>
    </div>
  )
}

export default ProcessingLoader
