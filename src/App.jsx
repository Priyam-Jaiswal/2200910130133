import React, { useEffect, useState } from "react";

const API = "http://localhost:5000"; // your backend API

export default function App() {
  const [longUrl, setLongUrl] = useState("");
  const [customCode, setCustomCode] = useState("");
  const [result, setResult] = useState(null);
  const [list, setList] = useState([]);
  const [error, setError] = useState(null);
  const [pending, setPending] = useState(0);

  useEffect(() => {
    fetchList();
  }, []);

  async function fetchList() {
    try {
      const res = await fetch(`${API}/api/list`);
      const data = await res.json();
      setList(data.slice(0, 20));
    } catch (e) {
      console.error(e);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (pending >= 5) {
      setError("You can only shorten 5 URLs at once.");
      return;
    }

    setError(null);
    setResult(null);
    setPending((p) => p + 1);

    try {
      const res = await fetch(`${API}/api/shorten`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ longUrl, customCode }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");

      setResult(data);
      setLongUrl("");
      setCustomCode("");
      fetchList();
    } catch (err) {
      setError(err.message);
    } finally {
      setPending((p) => Math.max(0, p - 1));
    }
  }

  return (
    <div style={{ maxWidth: 800, margin: "40px auto", fontFamily: "Arial, sans-serif" }}>
      <h1>URL Shortener</h1>
      <form onSubmit={handleSubmit} style={{ display: "grid", gap: 8 }}>
        <input
          value={longUrl}
          onChange={(e) => setLongUrl(e.target.value)}
          placeholder="https://example.com/very/long/link"
          style={{ padding: 8 }}
        />
        <input
          value={customCode}
          onChange={(e) => setCustomCode(e.target.value)}
          placeholder="custom code (optional)"
          style={{ padding: 8 }}
        />
        <div>
          <button type="submit" style={{ padding: "8px 12px" }}>
            Shorten
          </button>
        </div>
      </form>

      {error && <div style={{ color: "red", marginTop: 12 }}>{error}</div>}

      {result && (
        <div style={{ marginTop: 12, padding: 12, border: "1px solid #ddd" }}>
          <div>
            <strong>Short URL:</strong>{" "}
            <a href={result.shortUrl} target="_blank" rel="noreferrer">
              {result.shortUrl}
            </a>
          </div>
          <div>
            <strong>Code:</strong> {result.code}
          </div>
          <div>
            <strong>Original:</strong> {result.longUrl}
          </div>
        </div>
      )}

      <h2 style={{ marginTop: 28 }}>Recent links</h2>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={{ textAlign: "left", padding: 8 }}>Short</th>
            <th style={{ textAlign: "left", padding: 8 }}>Original</th>
            <th style={{ textAlign: "left", padding: 8 }}>Clicks</th>
          </tr>
        </thead>
        <tbody>
          {list.map((item) => (
            <tr key={item.code}>
              <td style={{ padding: 8 }}>
                <a
                  href={`${API.replace(/:\d+$/, ":3000")}/${item.code}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  {window.location.origin}/{item.code}
                </a>
              </td>
              <td style={{ padding: 8 }}>{item.longUrl}</td>
              <td style={{ padding: 8 }}>{item.clicks || 0}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
