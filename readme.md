# People Tracking System

## 📌 Overview

This project implements a **real-time people tracking system** using YOLO for object detection and BoT-SORT for multi-object tracking. The system captures video from an **HLS CCTV stream**, processes it with deep learning models, and sends metadata and frames to the frontend for visualization. The goal is to track and count people within a **polygonal area**, monitoring entries and exits.

---

## 🚀 Features

### ✅ **Database Design** (✔️ Done)

- Designed and implemented relational tables for **People and Events**.
- Currently, the system supports a **single polygon (Area)**, but future improvements may introduce multiple dynamic areas.

### ✅ **Dataset Collection** (✔️ Done)

- Live video feed streamed from **HLS CCTV Yogyakarta**.
- Example source: [Malioboro CCTV](https://cctvjss.jogjakota.go.id/malioboro/Malioboro_2_Depan_Toko_Subur.stream/playlist.m3u8).

### ✅ **Object Detection & Tracking** (✔️ Done)

- **YOLO v11** for **object detection**.
- **BoT-SORT** for **multi-object tracking (MOT)**.

### ✅ **Counting & Polygon Area Processing** (✔️ Done)

- **Single polygon supported** (for now).
- Two key tracking features implemented:
  1. **Counting People Inside the Polygon**
     - A person is counted as "inside" if their bounding box **intersects** with the polygon.
     - Future improvement: Improve classification of people "inside" based on movement patterns.
  2. **Entry & Exit Counting Logic**
     - **Entry**: If a person was **never inside before** and moves inside, the **entry counter increases**.
     - **Exit**: If a person was **previously inside** and moves outside, the **exit counter increases**.

### ✅ **Prediction Model** (✔️ Done)

- Current best-performing model: **YOLO v11n** (optimized for real-time processing).
- Built-in tracker: **BoT-SORT** (default in YOLO v11).
- Future improvements:
  - Train a custom model to **better distinguish people** in crowded environments.
  - Enhance **multi-object tracking (MOT)** for more accurate ID persistence.

### ✅ **API & Frontend Integration** (✔️ Done)

- **Frontend**: Built with **Next.js**.
- **Backend**: Powered by **FastAPI**.
- **Communication Protocols**:
  - **HTTP** for API calls.
  - **WebSocket** for real-time streaming of frames & metadata.
- **Database**: Using **SQLite** for storage.
- **Live status API**:
  - Returns real-time metadata updates via **WebSocket**.
  - Provides **historical data** (last **5 minutes**) of people **inside and outside the area**.
- **Future Improvement**:
  - Support **multiple polygon areas** instead of a single area.

### ✅ **Deployment** (✔️ Done)

- Deployed using **Docker Compose**.
- Supports **both ARM64 and x86 architectures**:
  - `docker-compose.yaml` → for **ARM64**.
  - `docker-compose-86.yaml` → for **x86**.

---

## 📂 Tech Stack

| Component            | Technology     |
| -------------------- | -------------- |
| **Frontend**         | Next.js        |
| **Backend**          | FastAPI        |
| **Database**         | SQLite         |
| **Object Detection** | YOLO v11       |
| **Object Tracking**  | BoT-SORT       |
| **Streaming**        | WebSocket      |
| **Deployment**       | Docker Compose |

---

## ⚠️ Challenges & Potential Improvements

### ✅ **Challenges Resolved**

- Successfully **integrated API and WebSocket** for real-time data updates.
- Implemented a working **entry-exit tracking logic** with polygon intersection.

### 🛠 **Potential Improvements**

1. **Multi-Area Support**: Implement multiple polygon areas instead of a single predefined area.
2. **Improved Classification of People Inside an Area**: Define better logic for detecting people "inside" an area based on their movement.
3. **Enhanced Multi-Object Tracking (MOT)**: Improve tracking persistence across frames.
4. **Custom Model Training**: Train a YOLO model with **better person detection** for CCTV environments.
5. **Scalability**: Support multiple camera feeds dynamically.

---

## 🔧 How to Run

### 1️⃣ **Clone the Repository**

```bash
git clone https://github.com/your-repo/people-tracking.git
cd people-tracking
```

### 2️⃣ **Run with Docker Compose**

For **ARM64 architecture**:

```bash
docker-compose up --build
```

For **x86 architecture**:

```bash
docker-compose -f docker-compose-86.yaml up --build
```

### **2️⃣ Running Manually**

#### **Backend (FastAPI)**

1. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
2. Start the FastAPI server:
   ```bash
   uvicorn main:app --host 0.0.0.0 --port 8000 --reload
   ```

#### **Frontend (Next.js)**

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the frontend:
   ```bash
   npm run dev
   ```

### 3️⃣ **Access the Application**

- **API**: `http://localhost:8000`
- **API Docs**: `http://localhost:8000/docs`
- **Frontend**: `http://localhost:3000`
- **WebSocket**: `ws://localhost:8000/ws`

---

## 📬 Contact

For questions or contributions, feel free to reach out! 🚀

---
