const mongoose = require('mongoose');

// Use the new simple credentials
const username = 'testuser';
const password = 'testpass123';
const uri = `mongodb+srv://${username}:${password}@cluster0.aganzmv.mongodb.net/taskDB?retryWrites=true&w=majority`;

console.log('Attempting to connect with URI:', uri.replace(password, '***'));

mongoose.connect(uri)
  .then(() => {
    console.log('✅ MongoDB connected successfully');
    mongoose.connection.close();
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });
