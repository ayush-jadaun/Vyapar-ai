import mongoose from 'mongoose';

const ContactSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  amount: { type: Number, required: true },
  callStatus: { type: String, enum: ['pending', 'calling', 'completed', 'failed'], default: 'pending' },
  callResult: { type: String },
  transcript: { type: String },
  summary: { type: String },
  callId: { type: String },
  callDuration: { type: Number },
  lastCalled: { type: Date },
  retryCount: { type: Number, default: 0 }
});

const CampaignSchema = new mongoose.Schema({
  name: { type: String, required: true },
  vapiCampaignId: { type: String },
  status: { type: String, enum: ['draft', 'active', 'paused', 'completed'], default: 'draft' },
  contacts: [ContactSchema],
  assistantConfig: {
    voice: { type: String, default: 'jennifer' },
    model: { type: String, default: 'gpt-3.5-turbo' },
    temperature: { type: Number, default: 0.7 },
    firstMessage: { type: String, default: 'Hi {{name}}, you have an outstanding balance of ₹{{amount}}. Can you confirm when you\'ll be able to make the payment?' }
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export default mongoose.models.Campaign || mongoose.model('Campaign', CampaignSchema);
