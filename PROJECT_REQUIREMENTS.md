# Telegram Formal Photo Bot - Project Requirements Document

## 1. Project Overview

Bot Telegram untuk mengubah foto casual menjadi foto profil formal menggunakan AI image generation dengan preservasi wajah maksimal dan hasil yang natural.

**Tujuan Utama**: Menghasilkan foto formal berkualitas tinggi yang tidak terlihat AI-generated, dengan wajah 100% identik aslinya.

---

## 2. Tech Stack

### Core Dependencies
```json
{
  "node-telegram-bot-api": "^0.64.0",
  "replicate": "^0.25.0",
  "sharp": "^0.33.0",
  "axios": "^1.6.0",
  "dotenv": "^16.3.0"
}
```

### Recommended AI Models
- **Primary**: Flux-dev (Replicate) - terbaik untuk face preservation
- **Alternative**: SDXL + ControlNet (IP-Adapter Face)
- **Fallback**: Stable Diffusion 1.5 + ControlNet Canny

---

## 3. Core Features & Requirements

### 3.1 Photo Processing Pipeline

#### Input Requirements
- Format: JPG, PNG, WEBP
- Min resolution: 512x512px
- Max file size: 10MB
- Orientasi: Portrait (3:4 ratio preferred)

#### Output Specifications
- Format: JPG (quality 95%)
- Resolution: Sama dengan input (min 1024x1536px)
- Aspect ratio: 3:4 (standar pas foto)
- Komposisi: Half-body shot (1/2 badan)

### 3.2 AI Fine-Tuning Configuration

#### Critical Parameters untuk Face Preservation
```javascript
const AI_CONFIG = {
  // Model Settings
  model: "flux-dev",
  
  // Core Parameters - TIDAK BOLEH DIUBAH
  temperature: 0.05,              // Minimal hallucination
  guidance_scale: 7.5,            // Strong prompt adherence
  num_inference_steps: 50,        // Quality vs speed balance
  
  // ControlNet/IP-Adapter Settings
  controlnet_conditioning_scale: 0.95,  // Maximum face preservation
  ip_adapter_scale: 0.9,                // Face identity strength
  
  // Image-to-Image Settings
  strength: 0.35,                 // Denoising strength (low = preserve more)
  
  // Advanced
  seed: null,                     // Random seed per request
  scheduler: "DPMSolverMultistep" // Consistent quality
}
```

#### Prompt Engineering Strategy

**Base Prompt Template**:
```
professional ID photo, half-body portrait, {clothing_type} {clothing_color}, 
{background_color} solid background, studio lighting, natural skin tone, 
sharp focus on face, photorealistic, high quality, corporate headshot style
```

**Negative Prompt (WAJIB)**:
```
cartoon, illustration, painting, drawing, art, sketch, anime, 3d render, 
distorted face, deformed, ugly, blurry, duplicate, multiple people, 
watermark, text, cropped, low quality, jpeg artifacts, mutation, 
extra limbs, missing limbs, floating limbs, disconnected limbs, 
malformed hands, long neck, cross-eyed, mutated, bad anatomy, 
bad proportions, cloned face, disfigured, gross proportions, 
malformed, pattern background, patterned clothing
```

**Constraint Prompts**:
- Face preservation: `exact same face, preserve facial features, identical face structure`
- Body proportion: `maintain body proportions, realistic body size, natural physique`
- Lighting: `professional studio lighting, soft shadows, even illumination`

### 3.3 Validation Rules

#### Pre-Processing Validation
```javascript
const VALIDATION_RULES = {
  background: {
    check: "solid_color_only",
    reject_if: ["pattern", "texture", "gradient", "objects"],
    error_message: "❌ Background harus warna polos (merah, biru, putih, dll)"
  },
  
  clothing: {
    check: "solid_color_only",
    reject_if: ["pattern", "stripes", "logo", "text"],
    error_message: "❌ Baju harus polos tanpa motif"
  },
  
  face_detection: {
    min_faces: 1,
    max_faces: 1,
    error_message: "❌ Harus ada tepat 1 wajah dalam foto"
  }
}
```

---

## 4. User Flow & State Management

### 4.1 Bot States
```javascript
const BOT_STATES = {
  IDLE: "idle",                    // Menunggu foto baru
  PROCESSING: "processing",        // AI sedang generate
  WAITING_REVISION: "waiting_revision", // Menunggu revisi (60s timeout)
  ERROR: "error"                   // Error state
}
```

### 4.2 User Session Schema
```javascript
const UserSession = {
  userId: Number,
  state: String,
  originalPhoto: String,           // File path foto original
  processedPhoto: String,          // File path hasil AI
  currentPrompt: {
    clothing_type: "shirt",        // Default: kemeja
    clothing_color: "white",       // Default: putih
    background_color: "blue"       // Default: biru
  },
  revisionTimeout: null,           // setTimeout reference
  createdAt: Date,
  lastActivity: Date
}
```

### 4.3 Interaction Flow

```
[1] User kirim foto
    ↓
[2] Validasi (background polos? baju polos? 1 wajah?)
    ↓
[3a] VALID → Proses AI dengan default settings
    |         (baju putih, background biru)
    ↓
[4] Kirim hasil ke user + instruksi revisi
    ↓
[5] Set state: WAITING_REVISION + timeout 60s
    ↓
[6a] User kirim pesan teks → Parse sebagai revisi
     → Proses ulang AI dengan parameter baru
     → Loop ke [4]
    |
[6b] Timeout 60s → Reset state ke IDLE
    |
[6c] User kirim foto baru → Cancel revisi
     → Loop ke [2]

[3b] INVALID → Kirim error message
     → Reset state ke IDLE
```

---

## 5. Revision System

### 5.1 Revision Commands Parser

User dapat mengirim pesan natural language untuk revisi:

**Contoh Input**:
- "Ganti background merah"
- "Ubah baju jadi kemeja hitam"
- "Background putih baju biru"
- "Pake kaos abu-abu"

**Parser Logic**:
```javascript
const parseRevision = (text) => {
  const updates = {};
  
  // Background detection
  const bgColors = ["merah", "biru", "putih", "abu", "hijau", "kuning"];
  const bgMatch = text.match(/background\s+(\w+)|bg\s+(\w+)|latar\s+(\w+)/i);
  if (bgMatch) {
    updates.background_color = normalizeColor(bgMatch[1] || bgMatch[2] || bgMatch[3]);
  }
  
  // Clothing type detection
  const clothingTypes = {
    "kemeja": "formal shirt",
    "hem": "formal shirt",
    "kaos": "t-shirt",
    "polo": "polo shirt",
    "jas": "suit jacket"
  };
  
  // Clothing color detection
  const colorMatch = text.match(/baju\s+(\w+)|kaos\s+(\w+)|kemeja\s+(\w+)/i);
  if (colorMatch) {
    updates.clothing_color = normalizeColor(colorMatch[1] || colorMatch[2] || colorMatch[3]);
  }
  
  return updates;
}
```

### 5.2 Timeout Management
```javascript
const REVISION_TIMEOUT = 60000; // 60 seconds

const setRevisionTimeout = (userId) => {
  const session = getUserSession(userId);
  
  // Clear existing timeout
  if (session.revisionTimeout) {
    clearTimeout(session.revisionTimeout);
  }
  
  // Set new timeout
  session.revisionTimeout = setTimeout(() => {
    resetUserSession(userId);
    bot.sendMessage(userId, "⏱ Waktu revisi habis. Silakan kirim foto baru.");
  }, REVISION_TIMEOUT);
}
```

---

## 6. Error Handling

### 6.1 Photo Conflict Resolution

**Scenario**: User kirim multiple photos bersamaan

**Solution**:
```javascript
const photoQueue = new Map(); // userId -> [photos]

bot.on('photo', async (msg) => {
  const userId = msg.from.id;
  const session = getUserSession(userId);
  
  // Jika sedang dalam revisi
  if (session.state === 'WAITING_REVISION') {
    // Cancel revisi, ambil foto baru
    clearTimeout(session.revisionTimeout);
    resetUserSession(userId);
  }
  
  // Jika ada queue, ambil foto pertama saja
  if (!photoQueue.has(userId)) {
    photoQueue.set(userId, []);
  }
  
  const queue = photoQueue.get(userId);
  
  if (queue.length === 0) {
    // Process foto pertama
    queue.push(msg.photo);
    await processPhoto(userId, msg.photo[msg.photo.length - 1]);
    queue.shift();
    photoQueue.delete(userId);
  }
  // Foto kedua dst diabaikan
});
```

### 6.2 Error Messages

```javascript
const ERROR_MESSAGES = {
  VALIDATION_FAILED_BG: "❌ Background harus warna polos (merah, biru, putih, dll). Coba lagi dengan foto yang backgroundnya polos.",
  
  VALIDATION_FAILED_CLOTHING: "❌ Baju harus polos tanpa motif atau logo. Coba lagi dengan foto yang bajunya polos.",
  
  NO_FACE_DETECTED: "❌ Tidak terdeteksi wajah dalam foto. Pastikan wajah terlihat jelas.",
  
  MULTIPLE_FACES: "❌ Terdeteksi lebih dari 1 wajah. Gunakan foto dengan 1 orang saja.",
  
  AI_PROCESSING_ERROR: "❌ Terjadi kesalahan saat memproses foto. Silakan coba lagi.",
  
  FILE_TOO_LARGE: "❌ Ukuran file terlalu besar (max 10MB). Kompres foto terlebih dahulu.",
  
  UNSUPPORTED_FORMAT: "❌ Format file tidak didukung. Gunakan JPG, PNG, atau WEBP."
};
```

---

## 7. Quality Assurance Checklist

### 7.1 Face Preservation Validation
- [ ] Wajah 100% identik dengan original (gunakan face similarity score > 0.95)
- [ ] Tidak ada perubahan struktur wajah
- [ ] Skin tone tetap natural
- [ ] Ekspresi wajah tidak berubah
- [ ] Rambut dirapikan minimal (tidak drastis)

### 7.2 Body Proportion Validation
- [ ] Ukuran tubuh proporsional dengan wajah
- [ ] Tidak ada perubahan size (lebih besar/kecil)
- [ ] Postur natural dan realistis

### 7.3 Technical Quality
- [ ] Resolusi output = resolusi input
- [ ] Tidak ada artifacts atau noise
- [ ] Lighting natural dan merata
- [ ] Background benar-benar polos sesuai request
- [ ] Clothing color akurat

### 7.4 Naturalness Check
- [ ] Tidak terlihat AI-generated
- [ ] Transisi clothing-skin natural
- [ ] Shadows realistis
- [ ] Grain/texture konsisten dengan foto asli

---

## 8. File Structure

```
telegram-formal-photo-bot/
├── src/
│   ├── index.js                 # Entry point
│   ├── bot/
│   │   ├── handlers/
│   │   │   ├── photoHandler.js  # Handle foto input
│   │   │   ├── textHandler.js   # Handle revisi text
│   │   │   └── commandHandler.js # Handle /start, /help
│   │   └── middleware/
│   │       ├── validation.js    # Validasi foto
│   │       └── session.js       # Session management
│   ├── ai/
│   │   ├── replicate.js         # Replicate API integration
│   │   ├── prompts.js           # Prompt templates
│   │   └── config.js            # AI parameters
│   ├── utils/
│   │   ├── imageProcessor.js    # Sharp image processing
│   │   ├── faceDetection.js     # Face detection (optional)
│   │   ├── colorDetection.js    # Background/clothing validation
│   │   └── revisionParser.js    # Parse user revision text
│   └── storage/
│       ├── sessionManager.js    # In-memory session storage
│       └── tempFiles.js         # Temporary file management
├── .env                          # Environment variables
├── package.json
└── README.md
```

---

## 9. Environment Variables

```env
# Telegram Bot
TELEGRAM_BOT_TOKEN=your_telegram_bot_token

# AI Service
REPLICATE_API_TOKEN=your_replicate_api_token
AI_MODEL=flux-dev

# App Config
REVISION_TIMEOUT=60000
MAX_FILE_SIZE=10485760
TEMP_DIR=/tmp/telegram-bot

# Optional: Face Detection
FACE_DETECTION_ENABLED=false
FACE_API_KEY=your_face_api_key
```

---

## 10. API Integration Pseudocode

### 10.1 Replicate Integration
```javascript
const Replicate = require('replicate');
const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN });

async function generateFormalPhoto(inputImagePath, params) {
  const prompt = buildPrompt(params);
  const negativePrompt = getNegativePrompt();
  
  const output = await replicate.run(
    "black-forest-labs/flux-dev",
    {
      input: {
        prompt: prompt,
        negative_prompt: negativePrompt,
        image: fs.createReadStream(inputImagePath),
        
        // Critical parameters
        guidance_scale: 7.5,
        num_inference_steps: 50,
        strength: 0.35,
        
        // Quality
        width: 768,
        height: 1024,
        output_format: "jpg",
        output_quality: 95
      }
    }
  );
  
  return output;
}
```

---

## 11. Testing Strategy

### 11.1 Test Cases

**TC-01: Basic Photo Processing**
- Input: Foto casual dengan background polos biru, baju polos
- Expected: Foto formal dengan baju putih, background biru, wajah identik

**TC-02: Revision - Background Color**
- Action: Kirim "background merah"
- Expected: Foto baru dengan background merah, elemen lain sama

**TC-03: Revision - Clothing**
- Action: Kirim "kemeja hitam"
- Expected: Foto baru dengan kemeja hitam, wajah tetap identik

**TC-04: Timeout**
- Action: Tunggu 60 detik tanpa revisi
- Expected: Bot reset, siap terima foto baru

**TC-05: Photo Conflict**
- Action: Kirim 3 foto bersamaan
- Expected: Hanya foto pertama diproses

**TC-06: Validation - Patterned Background**
- Input: Foto dengan background bermotif
- Expected: Reject dengan error message

**TC-07: Multiple Faces**
- Input: Foto dengan 2 orang
- Expected: Reject dengan error message

### 11.2 Quality Metrics
- Face similarity score: > 0.95 (gunakan face recognition library)
- Processing time: < 30 detik
- Success rate: > 90%
- User satisfaction: Collect feedback via inline buttons

---

## 12. Performance Optimization

### 12.1 Caching Strategy
- Cache prompt templates
- Reuse session data
- Cleanup temp files setiap 1 jam

### 12.2 Rate Limiting
```javascript
const RATE_LIMIT = {
  maxRequestsPerUser: 10,      // Max 10 foto per user per jam
  windowMs: 3600000            // 1 hour
};
```

### 12.3 Resource Management
- Auto-delete temp files setelah 2 jam
- Limit concurrent AI processing: 3 requests
- Monitor memory usage

---

## 13. Deployment Checklist

- [ ] Setup Telegram Bot via @BotFather
- [ ] Dapatkan Replicate API token
- [ ] Configure environment variables
- [ ] Test di development mode
- [ ] Setup error logging (Winston/Pino)
- [ ] Deploy ke server (VPS/Heroku/Railway)
- [ ] Setup monitoring (PM2/Docker health check)
- [ ] Test end-to-end dengan real users
- [ ] Setup backup strategy untuk session data

---

## 14. Future Enhancements

### Phase 2 Features
- [ ] Multiple clothing styles (jas, batik, dll)
- [ ] Gender-specific optimization
- [ ] Batch processing (upload multiple photos)
- [ ] History: Simpan 5 hasil terakhir
- [ ] Premium features: HD quality, faster processing

### Phase 3 Features
- [ ] Web dashboard untuk manage bot
- [ ] Analytics: Track usage statistics
- [ ] Payment integration untuk premium
- [ ] API endpoint untuk third-party integration

---

## 15. Support & Maintenance

### Monitoring Metrics
- Total photos processed
- Average processing time
- Error rate by type
- User retention rate
- Peak usage hours

### Maintenance Tasks
- Weekly: Review error logs
- Monthly: Update AI model jika ada versi baru
- Quarterly: User survey untuk feedback

---

## 16. Contact & Resources

**Developer Notes**: 
- Prioritaskan face preservation di atas segala fitur lain
- Test dengan berbagai jenis wajah (berbeda etnisitas, usia, gender)
- Iterasi parameter AI berdasarkan hasil real-world testing
- Dokumentasikan setiap perubahan parameter dan impact-nya

**Key Success Metric**: 
> "User tidak bisa membedakan mana hasil AI dan mana foto studio asli"

---

**Document Version**: 1.0  
**Last Updated**: 2025-02-01  
**Status**: Ready for Development
