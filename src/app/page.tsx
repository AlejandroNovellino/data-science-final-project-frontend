'use client'

import React, { useRef, useState, FormEvent, ChangeEvent, DragEvent } from "react";

// Feather icons as React SVGs (replacing the CDN)
const FeatherBarChart: React.FC = () => (
  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
    strokeLinejoin="round" viewBox="0 0 24 24">
    <rect x="3" y="12" width="4" height="8" /><rect x="17" y="4" width="4" height="16" />
    <rect x="10" y="9" width="4" height="11" />
  </svg>
);
const FeatherUser: React.FC = () => (
  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
    strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="M20 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M4 21v-2a4 4 0 0 1 3-3.87" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);
const FeatherFileText: React.FC = () => (
  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
    strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <polyline points="10 9 9 9 8 9" />
  </svg>
);
const FeatherUpload: React.FC = () => (
  <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
    strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </svg>
);
const FeatherRefresh: React.FC = () => (
  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
    strokeLinejoin="round" viewBox="0 0 24 24">
    <polyline points="23 4 23 10 17 10" />
    <polyline points="1 20 1 14 7 14" />
    <path d="M3.51 9a9 9 0 0 1 14.13-3.36L23 10" />
    <path d="M20.49 15A9 9 0 0 1 5.34 18.36L1 14" />
  </svg>
);

type TabType = "single" | "batch";
type SingleResultType = {
  prediction: number[];
  proba_1: number;
  proba_0: number;
};
type BatchResultType = {
  predictions: number[];
  total_predictions: number;
  file_name: string;
};

function Home() {
  const [tab, setTab] = useState<TabType>("single");
  const [singleResult, setSingleResult] = useState<SingleResultType | null>(null);
  const [loadingSingle, setLoadingSingle] = useState(false);
  const predictionFormRef = useRef<HTMLFormElement | null>(null);

  const [batchResult, setBatchResult] = useState<BatchResultType | null>(null);
  const [batchProgress, setBatchProgress] = useState(0);
  const [batchLoading, setBatchLoading] = useState(false);
  const [batchFileName, setBatchFileName] = useState("");
  const [dragOver, setDragOver] = useState(false);

  // Options
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  const roomTypes = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"];
  const customerTypes = [
    "Transient", "Contract", "Transient-Party", "Group"
  ];
  const depositTypes = [
    "No Deposit", "Refundable", "Non Refund"
  ];
  const distributionChannels = [
    "Direct", "Corporate", "TA/TO", "GDS"
  ];
  const marketSegments = [
    "Aviation", "Complementary", "Corporate", "Direct", "Groups", "Offline TA/TO", "Online TA", "Undefined"
  ];
  const mealPlans = [
    "BB", "FB", "HB", "SC", "Undefined"
  ];
  const hotelTypes = ["Resort Hotel", "City Hotel"];

  function switchTab(tabName: TabType) {
    setTab(tabName);
    setSingleResult(null);
    setBatchResult(null);
  }

  // --- SINGLE PREDICTION FORM
  async function handleSingleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    if (!form.checkValidity()) {
      alert("Por favor verifique los datos e ingréselos correctamente.");
      return;
    }
    setLoadingSingle(true);
    setSingleResult(null);

    const formData = new FormData(form);
    const data: Record<string, any> = Object.fromEntries(formData.entries());
    [
      "lead_time", "arrival_date_year", "arrival_date_week_number", "arrival_date_day_of_month",
      "stays_in_weekend_nights", "stays_in_week_nights", "adults", "children", "babies",
      "is_repeated_guest", "previous_cancellations", "previous_bookings_not_canceled",
      "booking_changes", "days_in_waiting_list", "adr", "required_car_parking_spaces", "total_of_special_requests"
    ].forEach(f => { if (data[f]) data[f] = parseFloat(data[f]); });

    try {
      const response = await fetch(process.env.NEXT_PUBLIC_BACKEND_URL + "/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      const result = await response.json();
      if (response.ok) {
        setSingleResult(result);
      } else {
        throw new Error(result.detail || "Prediction failed");
      }
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setLoadingSingle(false);
    }
  }

  function clearForm() {
    predictionFormRef.current?.reset();
    setSingleResult(null);
  }

  // --- BATCH TAB
  function onDragOver(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragOver(true);
  }

  function onDragLeave(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragOver(false);
  }

  function onDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) uploadFile(file);
  }
  function onFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
  }

  async function uploadFile(file: File) {
    if (file.size > 5 * 1024 * 1024) {
      alert(
        `El tamaño del dataset es de ${(file.size / 1024 / 1024).toFixed(
          2
        )} MB. El procesamiento puede tardar varios minutos según la complejidad de los datos.`
      );
    }
    setBatchLoading(true);
    setBatchResult(null);
    setBatchFileName(file.name);
    setBatchProgress(0);

    // Simulate progress
    let pct = 0;
    const progressInterval = setInterval(() => {
      if (pct < 90) {
        pct += 10;
        setBatchProgress(pct);
      }
    }, 500);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(process.env.NEXT_PUBLIC_BACKEND_URL + "/predict-from-file", {
        method: "POST",
        body: formData
      });
      const result = await response.json();
      if (response.ok) {
        setBatchResult({ ...result, file_name: file.name });
        setBatchProgress(100);
      } else {
        throw new Error(result.detail || "Batch prediction failed");
      }
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      clearInterval(progressInterval);
      setBatchProgress(100);
      setBatchLoading(false);
      setTimeout(() => setBatchProgress(0), 1000);
    }
  }

  function renderSingleResult() {
    if (!singleResult) return null;
    const pred = singleResult.prediction[0];
    const pc = singleResult.proba_1;
    const pnc = singleResult.proba_0;
    return (
      <div className="result-card" style={{ marginTop: "2rem" }}>
        <div className="result-title">
          <FeatherBarChart />
          Prediction Result
        </div>
        <div className="prediction-value">
          {pred === 1 ? "Likely to Cancel" : "Not Likely to Cancel"}
        </div>
        <div className="probability-bars">
          <div className="probability-bar">
            <h4>Probability of Cancellation</h4>
            <div className="probability-value cancel">
              {(pc * 100).toFixed(1)}%
            </div>
          </div>
          <div className="probability-bar">
            <h4>Probability of No Cancellation</h4>
            <div className="probability-value no-cancel">
              {(pnc * 100).toFixed(1)}%
            </div>
          </div>
        </div>
      </div>
    );
  }

  function renderBatchResult() {
    if (!batchResult) return null;
    const preds = batchResult.predictions;
    const cancelCount = preds.filter((p) => p === 1).length;
    const total = batchResult.total_predictions;
    return (
      <div className="result-card">
        <div className="result-title">
          <FeatherFileText /> Batch Prediction Results
        </div>
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div style={{ fontSize: "1.25rem", color: "#6b5b4f" }}>
            File: {batchResult.file_name}
          </div>
          <div
            style={{
              fontSize: "2rem",
              fontWeight: 700,
              color: "#2d241d"
            }}
          >
            {total} Total Bookings
          </div>
        </div>
        <div className="probability-bars">
          <div className="probability-bar">
            <h4>Likely to Cancel</h4>
            <div className="probability-value cancel">
              {cancelCount} ({((cancelCount / total) * 100).toFixed(1)}%)
            </div>
          </div>
          <div className="probability-bar">
            <h4>Not Likely to Cancel</h4>
            <div className="probability-value no-cancel">
              {total - cancelCount} (
              {(((total - cancelCount) / total) * 100).toFixed(1)}%)
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <header className="header">
        <nav className="nav container">
          <div className="logo">
            <div className="logo-icon">
              {/* Hotel Bell SVG */}
              <svg width="20" height="20" fill="white" viewBox="0 0 24 24">
                <path d="M12 2a2 2 0 012 2c0 .74-.4 1.39-1 1.73v.54a8 8 0 018 8v1a2 2 0 01-2 2h-3.27a4 4 0 01-7.46 0H5a2 2 0 01-2-2v-1a8 8 0 018-8v-.54c-.6-.34-1-.99-1-1.73a2 2 0 012-2z" />
                <circle cx="9" cy="14" r="1" />
                <circle cx="15" cy="14" r="1" />
                <circle cx="12" cy="17" r="1" />
              </svg>
            </div>
            Hotel Booking Predictor
          </div>
        </nav>
      </header>
      <main className="main container">
        <div className="hero">
          <h1>Predict Hotel Booking Cancellations</h1>
          <p>
            Use our advanced machine learning model to predict the likelihood of
            booking cancellations and optimize your revenue management.
          </p>
        </div>
        <div className="tabs">
          <button
            className={`tab-btn${tab === "single" ? " active" : ""}`}
            onClick={() => switchTab("single")}
          >
            <FeatherUser /> Single Prediction
          </button>
          <button
            className={`tab-btn${tab === "batch" ? " active" : ""}`}
            onClick={() => switchTab("batch")}
          >
            <FeatherFileText /> Batch Processing
          </button>
        </div>
        {/* SINGLE PREDICTION TAB */}
        {tab === "single" && (
          <div id="single-tab" className="card">
            <form
              id="prediction-form"
              ref={predictionFormRef}
              onSubmit={handleSingleSubmit}
              autoComplete="off"
              noValidate
            >
              <div className="form-grid">
                {/* Alphabetically ordered inputs */}
                <div className="form-group">
                  <label className="form-label">ADR (Average Daily Rate)</label>
                  <input
                    type="number"
                    className="form-input"
                    name="adr"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Adults</label>
                  <input
                    type="number"
                    className="form-input"
                    name="adults"
                    min="1"
                    defaultValue="2"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Assigned Room Type</label>
                  <select
                    className="form-select"
                    name="assigned_room_type"
                    required
                  >
                    {roomTypes.map((x) => (
                      <option value={x} key={x}>
                        {x}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">
                    Arrival Day of Month
                  </label>
                  <input
                    type="number"
                    className="form-input"
                    name="arrival_date_day_of_month"
                    min="1"
                    max="31"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Arrival Month</label>
                  <select
                    className="form-select"
                    name="arrival_date_month"
                    required
                  >
                    {months.map((m) => (
                      <option value={m} key={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Arrival Week Number</label>
                  <input
                    type="number"
                    className="form-input"
                    name="arrival_date_week_number"
                    min="1"
                    max="53"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Arrival Year</label>
                  <input
                    type="number"
                    className="form-input"
                    name="arrival_date_year"
                    min="2024"
                    max="2030"
                    defaultValue="2025"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Babies</label>
                  <input
                    type="number"
                    className="form-input"
                    name="babies"
                    min="0"
                    defaultValue="0"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Booking Changes</label>
                  <input
                    type="number"
                    className="form-input"
                    name="booking_changes"
                    min="0"
                    defaultValue="0"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Children</label>
                  <input
                    type="number"
                    className="form-input"
                    name="children"
                    min="0"
                    defaultValue="0"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Country</label>
                  <input
                    type="text"
                    className="form-input"
                    name="country"
                    placeholder="e.g., PRT, ESP"
                    maxLength={3}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Customer Type</label>
                  <select
                    className="form-select"
                    name="customer_type"
                    required
                  >
                    {customerTypes.map((x) => (
                      <option value={x} key={x}>
                        {x}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Days in Waiting List</label>
                  <input
                    type="number"
                    className="form-input"
                    name="days_in_waiting_list"
                    min="0"
                    defaultValue="0"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Deposit Type</label>
                  <select className="form-select" name="deposit_type" required>
                    {depositTypes.map((x) => (
                      <option value={x} key={x}>
                        {x}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Distribution Channel</label>
                  <select
                    className="form-select"
                    name="distribution_channel"
                    required
                  >
                    {distributionChannels.map((x) => (
                      <option value={x} key={x}>
                        {x}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Hotel Type</label>
                  <select className="form-select" name="hotel" required>
                    {hotelTypes.map((x) => (
                      <option value={x} key={x}>
                        {x}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Is Repeated Guest</label>
                  <select
                    className="form-select"
                    name="is_repeated_guest"
                    required
                  >
                    <option value="0">No</option>
                    <option value="1">Yes</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Lead Time</label>
                  <input
                    type="number"
                    className="form-input"
                    name="lead_time"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Market Segment</label>
                  <select className="form-select" name="market_segment" required>
                    {marketSegments.map((x) => (
                      <option value={x} key={x}>
                        {x}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Meal Plan</label>
                  <select className="form-select" name="meal" required>
                    {mealPlans.map((x) => (
                      <option value={x} key={x}>
                        {x}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">
                    Previous Bookings Not Canceled
                  </label>
                  <input
                    type="number"
                    className="form-input"
                    name="previous_bookings_not_canceled"
                    min="0"
                    defaultValue="0"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Previous Cancellations</label>
                  <input
                    type="number"
                    className="form-input"
                    name="previous_cancellations"
                    min="0"
                    defaultValue="0"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">
                    Required Car Parking Spaces
                  </label>
                  <input
                    type="number"
                    className="form-input"
                    name="required_car_parking_spaces"
                    min="0"
                    defaultValue="0"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Reserved Room Type</label>
                  <select
                    className="form-select"
                    name="reserved_room_type"
                    required
                  >
                    {roomTypes.map((x) => (
                      <option value={x} key={x}>
                        {x}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Stays in Week Nights</label>
                  <input
                    type="number"
                    className="form-input"
                    name="stays_in_week_nights"
                    min="0"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Stays in Weekend Nights</label>
                  <input
                    type="number"
                    className="form-input"
                    name="stays_in_weekend_nights"
                    min="0"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Total Special Requests</label>
                  <input
                    type="number"
                    className="form-input"
                    name="total_of_special_requests"
                    min="0"
                    defaultValue="0"
                    required
                  />
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  gap: "1rem",
                  marginTop: "2rem",
                  alignItems: "center"
                }}
              >
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loadingSingle}
                >
                  <span style={{ display: loadingSingle ? "none" : "inline" }}>
                    Make Prediction
                  </span>
                  {loadingSingle && <span className="loading"></span>}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={clearForm}
                >
                  <FeatherRefresh /> Clear Form
                </button>
              </div>
            </form>
            {renderSingleResult()}
          </div>
        )}
        {/* BATCH TAB */}
        {tab === "batch" && (
          <div id="batch-tab" className="card">
            <div
              className={`file-upload${dragOver ? " dragover" : ""}`}
              onClick={() =>
                (document.getElementById("file-input") as HTMLInputElement)?.click()
              }
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
              style={{ cursor: batchLoading ? "not-allowed" : "pointer" }}
            >
              <div className="file-icon">
                <FeatherUpload />
              </div>
              <h3>Upload CSV File</h3>
              <p>Drop your CSV file here or click to browse</p>
              <input
                type="file"
                id="file-input"
                accept=".csv"
                style={{ display: "none" }}
                onChange={onFileChange}
                disabled={batchLoading}
              />
            </div>
            {batchLoading || batchProgress > 0 ? (
              <progress
                value={batchProgress}
                max={100}
                style={{
                  width: "100%",
                  marginTop: "1rem",
                  display: batchProgress === 0 ? "none" : "block"
                }}
              />
            ) : null}
            {renderBatchResult()}
          </div>
        )}
      </main>
    </>
  );
}

export default Home;