import mongoose from 'mongoose';

export const connectDB = async (): Promise<void> => {
  try {
    const mongoURI = process.env.MONGO_URI;
    
    if (!mongoURI) {
      throw new Error('MONGO_URI environment variable is not defined');
    }

    await mongoose.connect(mongoURI);
    
    console.log('✅ MongoDB Atlas connected successfully');
    console.log(`📍 Connected to database: ${mongoose.connection.name}`);
  } catch (err) {
    console.error('❌ Failed to connect to MongoDB Atlas:', err);
    process.exit(1);
  }
};

// Handle connection events
mongoose.connection.on('connected', () => {
  console.log('🔗 Mongoose connected to MongoDB Atlas');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('🔌 Mongoose disconnected from MongoDB Atlas');
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('📴 MongoDB Atlas connection closed due to app termination');
  process.exit(0);
});