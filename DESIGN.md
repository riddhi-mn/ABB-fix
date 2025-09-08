# IntelliInspect System Design Document

## Overview

IntelliInspect is a full-stack AI-powered application for real-time predictive quality control using Kaggle Production Line sensor data. The system enables users to upload datasets, configure training parameters, train machine learning models, and simulate real-time predictions.

## System Architecture

### High-Level Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Angular       │    │   .NET Core     │    │   Python        │
│   Frontend      │◄──►│   Backend API   │◄──►│   ML Service    │
│   (Port 4200)   │    │   (Port 5000)   │    │   (Port 8000)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Docker Compose                              │
│                    Orchestration                               │
└─────────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

#### Frontend (Angular 18+)
- **Upload Dataset Screen**: File upload with drag-and-drop, metadata display
- **Date Ranges Screen**: Training/testing/simulation period configuration
- **Model Training Screen**: Training trigger, metrics visualization
- **Simulation Screen**: Real-time prediction streaming with live charts

#### Backend (.NET Core 8)
- **Dataset Management**: CSV parsing, timestamp augmentation, data validation
- **Date Range Validation**: Ensures non-overlapping, sequential periods
- **Model Coordination**: Communicates with ML service for training
- **Simulation Management**: Handles real-time data streaming

#### ML Service (Python 3.13 + FastAPI)
- **Model Training**: XGBoost/LightGBM implementation
- **Prediction Engine**: Real-time inference on sensor data
- **Metrics Calculation**: Accuracy, precision, recall, F1-score
- **Visualization**: Training charts, confusion matrices

## Data Flow

### 1. Dataset Upload Flow
```
User Upload → Frontend → Backend API → CSV Parser → Timestamp Augmentation → Database Storage → Metadata Response
```

### 2. Model Training Flow
```
Date Range Selection → Backend Validation → ML Service Training → Model Persistence → Metrics Response → Frontend Visualization
```

### 3. Real-Time Simulation Flow
```
Simulation Start → Backend Data Retrieval → ML Service Prediction → Real-Time Streaming → Frontend Live Updates
```

## API Design

### Backend API Endpoints

#### Dataset Management
- `POST /api/dataset/upload` - Upload and process CSV dataset
- `POST /api/dataset/validate-ranges` - Validate date ranges

#### Model Management
- `POST /api/model/train` - Train ML model
- `GET /api/model/health` - Check ML service health

#### Simulation Management
- `GET /api/simulation/start` - Start simulation
- `GET /api/simulation/stream` - Stream simulation data
- `GET /api/simulation/stats` - Get simulation statistics

### ML Service Endpoints

#### Training & Prediction
- `POST /train` - Train model with date ranges
- `POST /predict` - Single prediction
- `GET /health` - Health check
- `GET /model/info` - Model information

## Database Schema

### Dataset Records
```sql
CREATE TABLE DatasetRecords (
    Id INTEGER PRIMARY KEY,
    SyntheticTimestamp DATETIME NOT NULL,
    Response INTEGER NOT NULL,
    Temperature REAL NOT NULL,
    Pressure REAL NOT NULL,
    Humidity REAL NOT NULL,
    AdditionalFeatures TEXT
);
```

### Model Training History
```sql
CREATE TABLE ModelTrainings (
    Id INTEGER PRIMARY KEY,
    CreatedAt DATETIME NOT NULL,
    TrainStart DATETIME NOT NULL,
    TrainEnd DATETIME NOT NULL,
    TestStart DATETIME NOT NULL,
    TestEnd DATETIME NOT NULL,
    Accuracy REAL NOT NULL,
    Precision REAL NOT NULL,
    Recall REAL NOT NULL,
    F1Score REAL NOT NULL,
    ModelPath TEXT NOT NULL
);
```

## Security Considerations

### Data Protection
- File upload validation (CSV format only)
- Input sanitization for date ranges
- SQL injection prevention via Entity Framework
- CORS configuration for cross-origin requests

### Error Handling
- Graceful degradation for ML service failures
- Comprehensive error logging
- User-friendly error messages
- Retry mechanisms for transient failures

## Performance Optimizations

### Frontend
- Lazy loading of components
- Chart.js for efficient data visualization
- Responsive design for mobile compatibility
- Optimized bundle size with Angular CLI

### Backend
- Entity Framework for efficient database operations
- Async/await patterns for non-blocking I/O
- HTTP client connection pooling
- Memory-efficient CSV processing

### ML Service
- Model caching and persistence
- Batch processing for training
- Efficient feature engineering
- Optimized prediction pipeline

## Scalability Considerations

### Horizontal Scaling
- Stateless backend design
- Containerized deployment
- Load balancer ready
- Database connection pooling

### Performance Monitoring
- Health check endpoints
- Metrics collection
- Error tracking
- Performance profiling

## Deployment Architecture

### Docker Compose Services
```yaml
services:
  frontend:    # Angular app with Nginx
  backend:     # .NET Core API
  ml-service:  # Python FastAPI service
```

### Environment Configuration
- Development: Local Docker containers
- Production: Cloud-ready with environment variables
- Staging: Isolated testing environment

## Technology Stack

### Frontend
- **Framework**: Angular 18+
- **Styling**: Bootstrap 5 + Custom SCSS
- **Charts**: Chart.js + ng2-charts
- **Icons**: Font Awesome
- **Build**: Angular CLI

### Backend
- **Framework**: ASP.NET Core 8
- **Database**: SQLite with Entity Framework
- **HTTP Client**: Built-in HttpClient
- **Serialization**: System.Text.Json
- **CSV Processing**: CsvHelper

### ML Service
- **Framework**: FastAPI
- **ML Libraries**: XGBoost, LightGBM, scikit-learn
- **Visualization**: Matplotlib, Seaborn
- **Data Processing**: Pandas, NumPy
- **Model Persistence**: Joblib

### Infrastructure
- **Containerization**: Docker + Docker Compose
- **Web Server**: Nginx (frontend)
- **Process Management**: Uvicorn (ML service)
- **Development**: Hot reload for all services

## Future Enhancements

### Planned Features
- Model versioning and A/B testing
- Advanced feature engineering
- Real-time alerting system
- Historical data analysis
- Multi-user support with authentication

### Performance Improvements
- Redis caching layer
- Database indexing optimization
- CDN for static assets
- Microservices architecture
- Kubernetes deployment

## Monitoring and Logging

### Application Monitoring
- Health check endpoints
- Performance metrics
- Error rate tracking
- User activity analytics

### Logging Strategy
- Structured logging with correlation IDs
- Centralized log aggregation
- Error alerting
- Performance profiling

This design document provides a comprehensive overview of the IntelliInspect system architecture, ensuring maintainability, scalability, and performance for the hackathon submission.
