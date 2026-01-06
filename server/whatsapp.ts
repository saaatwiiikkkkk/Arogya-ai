
import * as wppconnect from '@wppconnect-team/wppconnect';
import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';

const PYTHON_API_URL = 'http://127.0.0.1:8000';

// Session state management
interface SessionData {
  state: 'INITIAL' | 'MENU_SELECTION' | 'UPLOAD_GET_PATIENT_ID' | 'UPLOAD_WAIT_FILE' | 'CHAT_GET_PATIENT_ID' | 'CHAT_MODE';
  patientId?: string;
  tempData?: any;
}

const sessions = new Map<string, SessionData>();

export function startWhatsappBot() {
  wppconnect
    .create({
      session: 'arogya-bot',
      headless: true,
      logQR: true,
      autoClose: false,
    })
    .then((client) => start(client))
    .catch((error) => console.log('[WhatsApp] Error starting client:', error));
}

function start(client: wppconnect.Whatsapp) {
  console.log('[WhatsApp] Client started!');

  client.onMessage(async (message) => {
    try {
      if (message.isGroupMsg) return;
      
      const from = message.from;
      let session = sessions.get(from);

      // Global Exit
      if (message.body?.toLowerCase() === 'exit' || message.body?.toLowerCase() === 'quit') {
        sessions.delete(from);
        await client.sendText(from, 'Chat session ended. Thank you for using Arogya AI. Send any message to start again.');
        return;
      }

      // Initialize session if new
      if (!session) {
        session = { state: 'INITIAL' };
        sessions.set(from, session);
      }

      const text = message.body?.trim() || '';

      switch (session.state) {
        case 'INITIAL':
          await sendMenu(client, from);
          session.state = 'MENU_SELECTION';
          break;

        case 'MENU_SELECTION':
          if (text === '1') {
            await client.sendText(from, 'Please enter your Patient ID for file upload:');
            session.state = 'UPLOAD_GET_PATIENT_ID';
          } else if (text === '2') {
            await client.sendText(from, 'Please enter your Patient ID to access medical records:');
            session.state = 'CHAT_GET_PATIENT_ID';
          } else {
            await client.sendText(from, 'Invalid option. Please type 1 or 2.');
            await sendMenu(client, from);
          }
          break;

        case 'UPLOAD_GET_PATIENT_ID':
          session.patientId = text;
          // Simple validation could go here
          await client.sendText(from, `Patient ID set to "${text}".\nPlease upload your medical record (PDF or Image).`);
          session.state = 'UPLOAD_WAIT_FILE';
          break;

        case 'UPLOAD_WAIT_FILE':
          if (message.isMedia || message.type === 'document' || message.type === 'image') {
            await client.sendText(from, 'Uploading file...');
            
            try {
              const buffer = await client.downloadMedia(message);
              if (!buffer) throw new Error('Failed to download media');

              const formData = new FormData();
              // Determine filename
              const ext = message.mimetype?.split('/')[1]?.split(';')[0] || 'bin';
              const filename = `whatsapp_upload_${Date.now()}.${ext}`;
              
              formData.append('file', buffer, { filename: filename, contentType: message.mimetype });

              // Upload to backend
              await axios.post(`${PYTHON_API_URL}/patients/${session.patientId}/documents`, formData, {
                headers: { ...formData.getHeaders() },
              });

              await client.sendText(from, '✅ File uploaded successfully to your documents.');
              await client.sendText(from, 'Type "exit" to quit or use the menu below.');
              await sendMenu(client, from);
              session.state = 'MENU_SELECTION';
            } catch (err: any) {
              console.error('Upload error:', err.message);
              await client.sendText(from, '❌ Failed to upload file. Please try again or check the Patient ID.');
            }
          } else {
            await client.sendText(from, 'Please send a file or image.');
          }
          break;

        case 'CHAT_GET_PATIENT_ID':
          session.patientId = text;
          // We assume valid ID or backend will return error later
          await client.sendText(from, 'Chat mode active. You can:\n- Ask questions about your records\n- Upload images of tablets/scans for analysis\n- Type "exit" to quit');
          session.state = 'CHAT_MODE';
          break;

        case 'CHAT_MODE':
          if (message.isMedia || message.type === 'image') {
            // Image analysis question
            await client.sendText(from, 'Analyzing image...');
            try {
              const buffer = await client.downloadMedia(message);
              const formData = new FormData();
              const ext = message.mimetype?.split('/')[1]?.split(';')[0] || 'jpg';
              formData.append('file', buffer, { filename: `vision_query.${ext}`, contentType: message.mimetype });
              // Check if user sent a caption as question
              const question = message.caption || 'Analyze this medical image or tablet and explain what it is.';
              formData.append('question', question);

              const response = await axios.post(`${PYTHON_API_URL}/api/chat/vision`, formData, {
                headers: { ...formData.getHeaders() },
              });
              
              await client.sendText(from, response.data.answer);

            } catch (err: any) {
              console.error('Vision API Error:', err);
              await client.sendText(from, 'Unable to analyze image at the moment.');
            }
          } else if (text) {
             // Text RAG Question
             try {
               // await client.simulateTyping(from, true);
               const response = await axios.post(`${PYTHON_API_URL}/patients/${session.patientId}/qa`, {
                 question: text
               });
               // await client.simulateTyping(from, false);
               
               const answer = response.data.answer;
               // citations could be handled too
               await client.sendText(from, answer);
             } catch (err: any) {
                console.error('QA API Error:', err);
                await client.sendText(from, 'Sorry, I encountered an error accessing your records.');
             }
          }
          break;
      }

      // Update session
      if(sessions.has(from)) {
          // ensure the updated object is what's in the map
          sessions.set(from, session);
      }

    } catch (e) {
      console.error('[WhatsApp] Message handler error:', e);
    }
  });
}

async function sendMenu(client: wppconnect.Whatsapp, to: string) {
  const menu = `
👋 *Welcome to Arogya AI Bot*

Please select an option:
1️⃣ *Upload Medical Record*
2️⃣ *Chat with AI Assistant* (Ask questions or analyze images)

Type *exit* to end session anytime.
`;
  await client.sendText(to, menu);
}
