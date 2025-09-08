# IntelliInspect: Real-Time Predictive Quality Control

A full-stack AI-powered application for real-time quality control prediction using Kaggle Production Line sensor data.


## Architecture

- **Frontend**: Angular 18+ with modern UI components
- **Backend**: ASP.NET Core 8 API
- **ML Service**: Python 3.13 + FastAPI with XGBoost/LightGBM
- **Deployment**: Docker + Docker Compose

## Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/CodeCraftr0/ABB-IntelliInspect
   cd ABB-IntelliInspect 
   ```

2. **Start the application**
   ```bash
   docker-compose up --build
   ```

3. **Access the application**
   - Frontend: http://localhost:4200
   - Backend API: http://localhost:5000
   - ML Service: http://localhost:8000

## Dataset

Download the Kaggle dataset from: https://www.kaggle.com/c/bosch-production-line-performance/data

The application will automatically augment the dataset with synthetic timestamps for time-based analysis.

## Features

### Screen 1: Upload Dataset
- Drag-and-drop CSV file upload
- Automatic timestamp augmentation
- Dataset metadata extraction
- Pass rate calculation

### Screen 2: Date Ranges
- Training, testing, and simulation period configuration
- Date range validation
- Timeline visualization

### Screen 3: Model Training
- XGBoost/LightGBM model training
- Performance metrics visualization
- Confusion matrix display

### Screen 4: Real-Time Simulation
- Second-level granularity streaming
- Live prediction updates
- Real-time charts and statistics

## Development

### Prerequisites
- Docker and Docker Compose
- Node.js 18+ (for local development)
- .NET 8 SDK (for local development)
- Python 3.13 (for local development)

### Local Development

#### Frontend
```bash
cd frontend
npm install
ng serve
```

#### Backend
```bash
cd backend
dotnet restore
dotnet run
```

#### ML Service
```bash
cd ml-service
pip install -r requirements.txt
uvicorn main:app --reload
```

## API Documentation

### Backend API Endpoints

- `POST /api/dataset/upload` - Upload and process CSV dataset
- `POST /api/dataset/validate-ranges` - Validate date ranges
- `POST /api/model/train` - Train ML model
- `GET /api/simulation/start` - Start real-time simulation
- `GET /api/simulation/stream` - Stream simulation data

### ML Service Endpoints

- `POST /train` - Train model with specified date ranges
- `POST /predict` - Single prediction
- `GET /health` - Health check

## Project Structure

```
├── frontend/          # Angular application
├── backend/           # .NET Core API
├── ml-service/        # Python FastAPI service
├── docker-compose.yml # Docker orchestration
└── README.md         # This file
```

## Troubleshooting

1. **Port conflicts**: Ensure ports 4200, 5000, and 8000 are available
2. **Docker issues**: Run `docker-compose down -v` to clean up volumes
3. **Dataset issues**: Ensure CSV has 'Response' column for binary classification

## License

This project is created for the IntelliInspect Hackathon.
