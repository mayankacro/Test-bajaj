import React, { useState } from 'react';

function App() {
  const [jsonInput, setJsonInput] = useState(JSON.stringify({
    data: ["M", "1", "334", "4", "B", "Z", "a", "7"]
  }, null, 2));
  const [error, setError] = useState(null);
  const [fileBase64, setFileBase64] = useState('');
  const [fileName, setFileName] = useState('');
  const [fileSize, setFileSize] = useState('');
  const [loading, setLoading] = useState(false);
  const [apiResponse, setApiResponse] = useState(null);
  const [selectedFilters, setSelectedFilters] = useState(['Alphabets', 'Numbers', 'Highest lowercase alphabet']);

  // Handle file select and convert to base64
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) {
      setFileBase64('');
      setFileName('');
      setFileSize('');
      return;
    }
    setFileName(file.name);
    setFileSize((file.size / 1024).toFixed(1) + ' KB');

    const reader = new FileReader();
    reader.onloadend = () => {
      setFileBase64(reader.result);
    };
    reader.readAsDataURL(file);
  };

  // Toggle multi-select checkboxes
  const handleFilterChange = (filter) => {
    if (selectedFilters.includes(filter)) {
      setSelectedFilters(selectedFilters.filter(f => f !== filter));
    } else {
      setSelectedFilters([...selectedFilters, filter]);
    }
  };

  // Submit to API
  const handleSubmit = async () => {
    setError(null);
    setApiResponse(null);
    
    // Parse & Validate JSON
    let parsedJson;
    try {
      parsedJson = JSON.parse(jsonInput);
      if (!parsedJson.data || !Array.isArray(parsedJson.data)) {
        setError('JSON must contain a "data" array field.');
        return;
      }
    } catch (err) {
      setError(`Invalid JSON format: ${err.message}`);
      return;
    }

    setLoading(true);
    try {
      const payload = {
        data: parsedJson.data
      };

      if (fileBase64) {
        payload.file_b64 = fileBase64;
      }

      const response = await fetch('/bfhl', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || `Error ${response.status}`);
      }

      const data = await response.json();
      setApiResponse(data);
    } catch (err) {
      setError(err.message || 'Error communicating with API');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <header className="header">
        <h1>0827IT231084</h1>
        <p className="subtitle">Bajaj Finserv Health Dev Challenge</p>
      </header>

      <main className="card">
        {/* JSON Input */}
        <div className="input-group">
          <label className="label">API JSON Input</label>
          <textarea
            className="textarea"
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
            rows={5}
          />
        </div>

        {/* File Input */}
        <div className="input-group">
          <label className="label">File Upload (Base64 - Optional)</label>
          <input
            type="file"
            className="file-input"
            onChange={handleFileChange}
          />
          {fileName && (
            <div className="file-meta">
              Selected: <strong>{fileName}</strong> ({fileSize})
            </div>
          )}
        </div>

        {/* Action Button */}
        <button
          className="button"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? 'Processing...' : 'Submit Payload'}
        </button>

        {/* Error Message */}
        {error && <div className="error-box">{error}</div>}

        {/* Response and Filtering Section */}
        {apiResponse && (
          <div className="response-section">
            <label className="label">Filter Display Results</label>
            <div className="checkbox-grid">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={selectedFilters.includes('Alphabets')}
                  onChange={() => handleFilterChange('Alphabets')}
                />
                <span>Alphabets</span>
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={selectedFilters.includes('Numbers')}
                  onChange={() => handleFilterChange('Numbers')}
                />
                <span>Numbers</span>
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={selectedFilters.includes('Highest lowercase alphabet')}
                  onChange={() => handleFilterChange('Highest lowercase alphabet')}
                />
                <span>Highest Lowercase Alphabet</span>
              </label>
            </div>

            <div className="results-box">
              <h3>Response Output</h3>
              
              {selectedFilters.includes('Alphabets') && (
                <div className="result-row">
                  <span className="result-key">Alphabets:</span>
                  <span className="result-val">
                    {apiResponse.alphabets && apiResponse.alphabets.length > 0
                      ? apiResponse.alphabets.join(', ')
                      : 'None'}
                  </span>
                </div>
              )}

              {selectedFilters.includes('Numbers') && (
                <div className="result-row">
                  <span className="result-key">Numbers:</span>
                  <span className="result-val">
                    {apiResponse.numbers && apiResponse.numbers.length > 0
                      ? apiResponse.numbers.join(', ')
                      : 'None'}
                  </span>
                </div>
              )}

              {selectedFilters.includes('Highest lowercase alphabet') && (
                <div className="result-row">
                  <span className="result-key">Highest Lowercase Alphabet:</span>
                  <span className="result-val">
                    {apiResponse.highest_lowercase_alphabet && apiResponse.highest_lowercase_alphabet.length > 0
                      ? apiResponse.highest_lowercase_alphabet.join(', ')
                      : 'None'}
                  </span>
                </div>
              )}

              {/* Display File Validation Details if a file was valid */}
              {apiResponse.file_valid && (
                <div className="result-row file-valid-row">
                  <span className="result-key">File Details:</span>
                  <span className="result-val">
                    Valid ({apiResponse.file_mime_type}, {apiResponse.file_size_kb} KB)
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      <footer className="footer">
        <p>Mayank Babariya | mayankbabariya230570@acropolis.in</p>
      </footer>
    </div>
  );
}

export default App;
