# Family Tree Project

A modern, full-stack Family Tree application with a FastAPI backend and a React (Vite) frontend.

## 🚀 Features
- **Dynamic Ambassador Page**: Manage family ambassadors easily.
- **Archive Management**: Store and display family documents and stories.
- **Secure Authentication**: Branch-level editing permissions.
- **Auto-Deployment**: Integrated GitHub Actions for automatic server updates.

## 🛠 Tech Stack
- **Backend**: FastAPI (Python)
- **Frontend**: React + Vite + Tailwind CSS
- **Database**: SQLite (Development) / PostgreSQL (Production ready)
- **Deployment**: GitHub Actions + SSH

## 📁 Project Structure
- `/backend`: FastAPI server, models, and API routes.
- `/frontend`: React application using Vite.
- `/.github/workflows`: Auto-deployment configuration.

## 🚢 Deployment
Deployment is automated via GitHub Actions. Whenever you push to the `main` branch, the `deploy.yml` workflow:
1. Connects to the server via SSH.
2. Pulls the latest changes.
3. Restarts the `family-tree` service.

---
*Created by [heshamhussin961](https://github.com/heshamhussin961-design)*
