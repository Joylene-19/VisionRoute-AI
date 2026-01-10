# 🚀 VisionRoute AI - Running the Application

## ✅ **Single Command to Start Everything**

Now you can start both frontend and backend with just ONE command:

```bash
npm run dev
```

This will start:

- ✅ **Backend** on `http://localhost:5000`
- ✅ **Frontend** on `http://localhost:5173`

---

## 📋 **Available Commands**

From the root directory (`VisionRoute-AI`):

| Command                | Description                                        |
| ---------------------- | -------------------------------------------------- |
| `npm run dev`          | Start both frontend & backend servers              |
| `npm run dev:backend`  | Start only backend server                          |
| `npm run dev:frontend` | Start only frontend server                         |
| `npm run install:all`  | Install all dependencies (root, backend, frontend) |
| `npm run build`        | Build frontend for production                      |

---

## ⚙️ **MongoDB Atlas IP Whitelist Setup**

If you see this error:

```
Could not connect to any servers in your MongoDB Atlas cluster...
```

**Fix it by whitelisting your IP:**

1. Go to https://cloud.mongodb.com/
2. Click **"Network Access"** (left sidebar)
3. Click **"Add IP Address"**
4. Choose **"Allow Access from Anywhere"** (0.0.0.0/0)
   - _For production, use specific IPs only_
5. Click **"Confirm"**

---

## 🌐 **Access Your Application**

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:5000
- **API Health Check:** http://localhost:5000/health
- **Admin Dashboard:** Open `admin-view.html` in your browser

---

## 📊 **View Your Database**

### Option 1: MongoDB Atlas Web Interface

1. Go to https://cloud.mongodb.com/
2. Click your cluster → **"Browse Collections"**
3. View `users`, `assessments`, and other collections

### Option 2: Admin Dashboard (HTML File)

- Double-click `admin-view.html` in the project root
- Shows all users and statistics in a nice UI

---

## 🛠️ **Troubleshooting**

### Port Already in Use

If you see "Port 5000 is already in use" or "Port 5173 is already in use":

```powershell
# Stop all node processes
Stop-Process -Name node -Force

# Then restart
npm run dev
```

### Backend Crashes on Start

- Check your MongoDB IP whitelist (see above)
- Verify all environment variables in `backend/.env`

### Frontend Can't Connect to Backend

- Make sure backend is running (you'll see `[BACKEND] Listening on port 5000`)
- Check `frontend/.env` has `VITE_API_URL=http://localhost:5000`

---

## 📝 **Environment Files**

Make sure you have:

- ✅ `backend/.env` - Backend configuration
- ✅ `frontend/.env` - Frontend configuration

---

## 🎯 **Next Steps**

Now that everything is running:

1. ✅ Open http://localhost:5173 in your browser
2. ✅ Test registration and login
3. ✅ View users in MongoDB Atlas or admin dashboard
4. ✅ Ready to build Module 2 (Assessment System)!

---

**Happy Coding! 🎉**
