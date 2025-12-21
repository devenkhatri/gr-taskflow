# TaskFlow

TaskFlow is a modern, real-time analytics and task management dashboard designed to streamline content workflows. It integrates task tracking with AI-powered insights, offering a comprehensive view of fact-checking, title generation, and team productivity.

## ✨ Features

### 📊 Analytics Dashboard
- **Real-time Statistics**: Instant overview of total tasks, pending items, works in progress, and completed actions.
- **AI Metrics**: Dedicated tracking for AI Fact Checks and Title Generations.
- **Visualizations**: Interactive bar charts and pie charts powered by `recharts` to monitor workload distribution.

### 📋 Task Management
- **Kanban Board**: Drag-and-drop style visualization of task states (Todo, In Progress, Done).
- **Task Matrix**: a tabular view of all tasks with status, priority, and assignees.
- **Filtering**: robust filtering by Channel, Date Range, and Search terms.

### 🤖 AI Insights
- **AI Master Log**: A consolidated view merging task details with their respective AI outcomes.
    - **Smart Alerts**: Automatically highlights "Fake" fact-check verdicts in red for immediate attention.
    - **Expandable Details**: Drill down into full text outputs for Fact Checks and Title Generations.
- **Fact Check Analysis**: Dedicated view for monitoring verification accuracy and results.
- **Title Generation**: Track and review AI-generated headlines.

### 👥 Management & Logs
- **Activity Logs**: Complete audit trail of all system actions with timestamps and user attribution.
- **Channel Management**: Master view of active channels with feature toggles (Task Mgmt, FactCheck, AI).
- **User Management**: Directory of team members and their roles.

## 🛠️ Tech Stack

- **Framework**: [React](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Charts**: [Recharts](https://recharts.org/)
- **Data Source**: Google Sheets Integration

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/devenkhatri/gr-taskflow.git
   cd gr-taskflow
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   ```

4. **Build for production**
   ```bash
   npm run build
   ```

## 📝 Configuration

The application is configured to fetch data dynamically from specific Google Sheets. Ensure your environment or `App.tsx` configuration points to the correct Sheet ID and follows the expected schema for:
- Tasks
- Activity Logs
- Active Channels
- Users

## 📄 License

This project is private and proprietary.
