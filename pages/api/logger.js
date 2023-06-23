// File path: /api/logger.js

export default async (req, res) => {
    // Ensure we only accept POST requests
    if (req.method !== 'POST') {
      return res.status(405).json({ message: 'Method Not Allowed' });
    }
  
    // Log the message
    console.log(req.body.message);
  
    // Respond with a success status
    res.status(200).json({ message: 'Logged successfully' });
  }
  