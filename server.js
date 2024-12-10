const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const cors = require('cors');

//mongoose connection
const { connectDB, Request } = require('./module/db/db'); // Import the connection and model

// MongoDB connection
connectDB();

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Replace with your HelpCrunch API key
const HELPCRUNCH_API_KEY = 'ZjRhMGY4ZGQ2YzJjYjhlODlkZDk1NDMwIDS2aqwcz82rNdCdQE90dziodXJP3MOkS06WsXiUiMgXxoVpNQgElVUC4u/ik0Bwp94LNoCN8eHCZQ6rgHlJhtEGYo9fgXHtY+NYpWoqU3VtFJf1T3AuIycOsJd6tLnZhLdSkVLF2ZDLbHPaGl4wRS8bVHWMNmaOlZaUMTRJhATtTH5wG7c3drEUTI11qwcbgyj047AUERbrALrYrqMFIttwEaXjUUUnZFHfRliU0Wm5OGDl2JBUw4Hhvgg5fdIpZgRIia/tXMA0Kqcmig+SUt/+LJJsDQkrPQc=';

// Map categories to department IDs
const CATEGORY_TO_DEPARTMENT_ID = {
  generalqueries: 142156,
  productfeaturequeries: 142123,
  productpricing: 142157,
  productfeatureimplementation: 142158,
};

// Map categories to agent IDs
const CATEGORY_TO_AGENT_ID = {
  generalqueries: 1,
  productfeaturequeries: 5,
  productpricing: 4,
  productfeatureimplementation: 1,
};

// Route to handle customer service requests
app.post('/api/customer-service', async (req, res) => {
  const { category, comments } = req.body;

  if (!category || !comments) {
    return res.status(400).json({ error: 'Category and comments are required' });
  }

  const departmentId = CATEGORY_TO_DEPARTMENT_ID[category];
  const agentId = CATEGORY_TO_AGENT_ID[category];
  if (!departmentId || !agentId) {
    return res.status(400).json({ error: 'Invalid category' });
  }

  try {
    // Step 1: Assign department to the chat
    const departmentResponse = await axios.put(
      'https://api.helpcrunch.com/v1/chats/department',
      {
        id: 2, // Example chat ID, replace with the actual chat ID if needed
        department: departmentId,
      },
      {
        headers: {
          Authorization: `Bearer ${HELPCRUNCH_API_KEY}`,
        },
      }
    );

    const chatId = departmentResponse.data.chat || 2; // Replace with chatId from response if available

    // Step 2: Assign the chat to an agent
    await axios.put(
      'https://api.helpcrunch.com/v1/chats/assignee',
      {
        id: chatId,
        assignee: agentId,
      },
      {
        headers: {
          Authorization: `Bearer ${HELPCRUNCH_API_KEY}`,
        },
      }
    );

    // Step 3: Send the message with assigned agent
    const messageResponse = await axios.post(
      'https://api.helpcrunch.com/v1/messages',
      {
        chat: chatId,
        text: comments,
        type: 'message',
      },
      {
        headers: {
          Authorization: `Bearer ${HELPCRUNCH_API_KEY}`,
        },
      }
    );

    res.status(200).json({
      message: 'Request submitted successfully',
      data: messageResponse.data,
    });
  } catch (error) {
    console.error('Error submitting request:', error.response?.data || error.message);
    res.status(500).json({
      error: 'Failed to submit request',
      details: error.response?.data || error.message,
    });
  }
});

// Route to handle storing customer service requests
app.post('/api/customer-service/save', async (req, res) => {
  const { userId, username,email,category, comments } = req.body;

  // Validate input
  if (!userId || !category || !comments) {
    return res.status(400).json({ error: 'User ID, category, and description are required.' });
  }

  try {
    // Create a new request in the database
    const newRequest = new Request({
      userId,
      username,
      email,
      category,
      comments,

    });

    // Save the request to the database
    await newRequest.save();

    // Respond with success
    res.status(201).json({
      message: 'Request saved successfully.',
      data: newRequest,
    });
  } catch (error) {
    console.error('Error saving request:', error);
    res.status(500).json({ error: 'Failed to save request.' });
  }
});

// Route to fetch customer service requests for a user
app.get('/api/customer-service/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    const requests = await Request.find({ userId }, { category: 1, comments: 1 });
    res.status(200).json(requests);
  } catch (error) {
    console.error('Error fetching requests:', error);
    res.status(500).json({ error: 'Failed to fetch requests.' });
  }
});



// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
