const fetch = require('node-fetch');

const canvasInstance = 'k12.instructure.com';

const login = async (req, res) => {
  try {
    const response = await fetch(`https://${canvasInstance}/api/v1/users/self/enrollments`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${req.body.token}`
      }
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`);
    }

    const enrollments = await response.json();
    res.status(200).send(enrollments[0])
  } catch (error) {
    console.error('Failed to fetch courses:', error);
    res.status(401).send('Unauthorized')
  }
}


module.exports = {
  login
}
