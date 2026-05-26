export default async (req, context) => {
  // CORS configuration
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers
    });
  }

  // GET Route
  if (req.method === 'GET') {
    return new Response(
      JSON.stringify({ operation_code: 1 }), 
      { status: 200, headers }
    );
  }

  // POST Route
  if (req.method === 'POST') {
    try {
      let body;
      try {
        body = await req.json();
      } catch (err) {
        return new Response(
          JSON.stringify({ is_success: false, error: 'Invalid JSON request body' }),
          { status: 400, headers }
        );
      }

      const { data, file_b64 } = body || {};

      if (!data || !Array.isArray(data)) {
        return new Response(
          JSON.stringify({ is_success: false, error: 'Missing or invalid "data" field (must be an array)' }),
          { status: 400, headers }
        );
      }

      const numbers = [];
      const alphabets = [];
      let isPrimeFound = false;

      // Robust Prime Number Checker
      const isPrime = (numStr) => {
        const n = parseInt(numStr, 10);
        if (isNaN(n) || n <= 1) return false;
        if (n === 2 || n === 3) return true;
        if (n % 2 === 0 || n % 3 === 0) return false;
        for (let i = 5; i * i <= n; i += 6) {
          if (n % i === 0 || n % (i + 2) === 0) return false;
        }
        return true;
      };

      // Classify items
      for (const item of data) {
        const strItem = String(item).trim();
        if (/^-?\d+$/.test(strItem)) {
          numbers.push(strItem);
          if (isPrime(strItem)) {
            isPrimeFound = true;
          }
        } else if (/^[A-Za-z]$/.test(strItem)) {
          alphabets.push(strItem);
        }
      }

      // Filter and find highest lowercase alphabet
      const lowercaseAlphabets = alphabets.filter(char => /^[a-z]$/.test(char));
      const highestLowercaseAlphabet = lowercaseAlphabets.length > 0 
        ? [lowercaseAlphabets.reduce((max, char) => char > max ? char : max)] 
        : [];

      // File validation logic
      let fileValid = false;
      let fileMimeType = null;
      let fileSizeKb = null;

      if (file_b64) {
        try {
          let b64Data = file_b64;
          let mimeType = null;
          
          // Match standard Data URL prefix: data:mime/type;base64,DATA
          const matches = file_b64.match(/^data:([^;]+);base64,(.*)$/);
          if (matches) {
            mimeType = matches[1];
            b64Data = matches[2];
          }
          
          const buffer = Buffer.from(b64Data, 'base64');
          if (buffer.length > 0) {
            fileValid = true;
            
            // If MIME type wasn't parsed from the Data URL, read magic bytes
            if (!mimeType) {
              const hex = buffer.toString('hex', 0, 4).toUpperCase();
              if (hex.startsWith('89504E47')) {
                mimeType = 'image/png';
              } else if (hex.startsWith('FFD8FF')) {
                mimeType = 'image/jpeg';
              } else if (hex.startsWith('25504446')) {
                mimeType = 'application/pdf';
              } else if (hex.startsWith('47494638')) {
                mimeType = 'image/gif';
              } else {
                mimeType = 'application/octet-stream';
              }
            }
            
            fileMimeType = mimeType;
            fileSizeKb = (buffer.length / 1024).toFixed(2);
          }
        } catch (e) {
          fileValid = false;
        }
      }

      const response = {
        is_success: true,
        user_id: 'mayank_babariya_10022006',
        email: 'mayankbabariya230570@acropolis.in',
        roll_number: '0827IT231084',
        numbers,
        alphabets,
        highest_lowercase_alphabet: highestLowercaseAlphabet,
        is_prime_found: isPrimeFound,
        file_valid: fileValid
      };

      if (fileValid) {
        response.file_mime_type = fileMimeType;
        response.file_size_kb = fileSizeKb;
      }

      return new Response(JSON.stringify(response), {
        status: 200,
        headers
      });

    } catch (error) {
      return new Response(
        JSON.stringify({ is_success: false, error: error.message || 'Internal Server Error' }),
        { status: 500, headers }
      );
    }
  }

  return new Response("Method not allowed", { status: 405, headers });
};

// Map this function directly to the "/bfhl" route
export const config = {
  path: "/bfhl"
};
