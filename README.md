# RFP Analysis Tool

A modern web application for analyzing Request for Proposal (RFP) documents using AI-powered insights and natural language processing.

![RFP Analysis Tool](https://via.placeholder.com/800x400?text=RFP+Analysis+Tool)

## Overview

The RFP Analysis Tool is designed to help organizations efficiently process, analyze, and respond to Request for Proposal documents. It leverages AI to extract key information, generate responses, and provide insights from uploaded RFP documents.

### Key Features

- **Project Management**: Create and manage multiple RFP projects
- **Document Upload**: Upload and manage PDF documents for analysis
- **AI-Powered Analysis**: Generate intelligent responses to RFP questions
- **RAG Chat**: Retrieval-Augmented Generation chat interface for document-specific queries
- **Knowledge Base**: Build and maintain a vector database of reference materials
- **Chat History**: Track and review previous conversations and responses

## Technology Stack

- **Frontend**: Next.js 15, React 19, TailwindCSS
- **State Management**: React Context API, TanStack Query (React Query)
- **UI Components**: Radix UI, shadcn/ui
- **Markdown Rendering**: React Markdown with syntax highlighting
- **API Communication**: Axios

## Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- Backend API server running (see Backend Setup section)

### Installation

1. Clone the repository

```bash
git clone <repository-url>
cd RFP_ANALYSIS_FE
```

2. Install dependencies

```bash
npm install
# or
yarn install
```

3. Start the development server

```bash
npm run dev
# or
yarn dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Backend Setup

This frontend application requires a backend API server running at `http://localhost:8000`. The backend handles:

- PDF document processing and storage
- Vector database management
- AI model integration for document analysis
- Chat history and project management

Refer to the backend repository for setup instructions.

## Usage Guide

### Creating a Project

1. Click the "+" button in the sidebar to create a new project
2. Enter a project name and submit
3. Upload RFP documents to your project

### Analyzing Documents

1. Select a project from the sidebar
2. Enter your query or question about the RFP documents
3. View AI-generated responses with insights from your documents

### Using RAG Chat

1. Navigate to the RAG Chat section
2. Start a new conversation or continue an existing one
3. Ask questions about your documents to receive contextually relevant answers

## Development

### Project Structure

```
RFP_ANALYSIS_FE/
├── app/               # Next.js app directory
│   ├── page.tsx       # Main RFP analysis page
│   ├── ragChat/       # RAG chat interface
│   ├── chatHistory/   # Chat history page
│   └── ...
├── components/        # Reusable UI components
├── lib/               # Utility functions and API services
└── public/            # Static assets
```

### API Integration

The application communicates with the backend API using services defined in `lib/APIservice.ts`. Key endpoints include:

- Project management: create, list, and delete projects
- File operations: upload, list, and delete PDF files
- AI interactions: generate responses, RAG chat, and knowledge base management
