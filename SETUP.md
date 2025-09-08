# IntelliInspect Setup Guide

## Prerequisites

Before setting up IntelliInspect, ensure you have the following installed:

- **Docker** (version 20.10 or higher)
- **Docker Compose** (version 2.0 or higher)
- **Git** (for cloning the repository)

### System Requirements

- **RAM**: Minimum 4GB, Recommended 8GB
- **Storage**: At least 2GB free space
- **OS**: Windows 10/11, macOS 10.15+, or Linux (Ubuntu 18.04+)

## Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd abb1
```

### 2. Start the Application

```bash
docker-compose up --build
```

This command will:
- Build all three services (frontend, backend, ML service)
- Start the containers
- Set up networking between services
- Make the application available at http://localhost:4200

### 3. Access the Application

- **Frontend**: http://localhost:4200
- **Backend API**: http://localhost:5000
- **ML Service**: http://localhost:8000

## Detailed Setup Instructions

### Option 1: Docker Compose (Recommended)

#### Step 1: Verify Docker Installation

```bash
docker --version
docker-compose --version
```

#### Step 2: Build and Start Services

```bash
# Build and start all services
docker-compose up --build

# Or run in detached mode
docker-compose up --build -d
```

#### Step 3: Verify Services

```bash
# Check running containers
docker-compose ps

# View logs
docker-compose logs -f

# View logs for specific service
docker-compose logs -f frontend
docker-compose logs -f backend
docker-compose logs -f ml-service
```

### Option 2: Local Development Setup

If you prefer to run services locally for development:

#### Frontend Setup

```bash
cd frontend
npm install
ng serve
```

#### Backend Setup

```bash
cd backend
dotnet restore
dotnet run
```

#### ML Service Setup

```bash
cd ml-service
pip install -r requirements.txt
uvicorn main:app --reload
```

## Configuration

### Environment Variables

The application uses the following environment variables:

#### Frontend (.env)
```env
API_URL=http://localhost:5000
```

#### Backend (appsettings.json)
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Data Source=./data/database.db"
  },
  "ML_SERVICE_URL": "http://localhost:8000"
}
```

#### ML Service (.env)
```env
PYTHONUNBUFFERED=1
```

### Port Configuration

Default ports (can be changed in docker-compose.yml):

- **Frontend**: 4200
- **Backend**: 5000
- **ML Service**: 8000

## Dataset Preparation

### Kaggle Dataset

1. Download the dataset from: https://www.kaggle.com/c/bosch-production-line-performance/data
2. Ensure the CSV file contains a 'Response' column for binary classification
3. The application will automatically augment the dataset with synthetic timestamps

### Supported Formats

- **File Type**: CSV only
- **Encoding**: UTF-8
- **Required Column**: 'Response' (binary: 0 or 1)
- **Optional Columns**: Temperature, Pressure, Humidity, and other sensor data

## Usage Guide

### Step 1: Upload Dataset

1. Navigate to http://localhost:4200
2. Click "Choose File" or drag and drop your CSV file
3. Wait for processing to complete
4. Review the metadata summary
5. Click "Proceed to Date Ranges"

### Step 2: Configure Date Ranges

1. Set training period (start and end dates)
2. Set testing period (must be after training)
3. Set simulation period (must be after testing)
4. Click "Validate Ranges"
5. Review the summary and timeline
6. Click "Proceed to Model Training"

### Step 3: Train Model

1. Click "Train Model" to start training
2. Wait for training to complete (may take a few minutes)
3. Review performance metrics and charts
4. Click "Start Simulation"

### Step 4: Run Simulation

1. Click "Start Simulation" to begin real-time predictions
2. Watch live statistics and charts update
3. Monitor the prediction stream table
4. Simulation will complete automatically

## Troubleshooting

### Common Issues

#### Port Already in Use

```bash
# Check what's using the port
netstat -tulpn | grep :4200

# Kill the process or change ports in docker-compose.yml
```

#### Docker Build Failures

```bash
# Clean Docker cache
docker system prune -a

# Rebuild without cache
docker-compose build --no-cache
```

#### Service Connection Issues

```bash
# Check service health
curl http://localhost:5000/api/model/health
curl http://localhost:8000/health

# View service logs
docker-compose logs backend
docker-compose logs ml-service
```

#### Frontend Not Loading

```bash
# Check if frontend container is running
docker-compose ps frontend

# View frontend logs
docker-compose logs frontend

# Restart frontend service
docker-compose restart frontend
```

### Performance Issues

#### Slow Training

- Ensure sufficient RAM (8GB+ recommended)
- Close other applications
- Use SSD storage for better I/O performance

#### Memory Issues

```bash
# Increase Docker memory limit
# In Docker Desktop: Settings > Resources > Memory

# Monitor container resources
docker stats
```

### Database Issues

```bash
# Reset database
docker-compose down -v
docker-compose up --build

# Access database directly
docker-compose exec backend sqlite3 ./data/database.db
```

## Development

### Making Changes

#### Frontend Changes

```bash
cd frontend
# Make changes to Angular components
ng build
# Or for development with hot reload
ng serve
```

#### Backend Changes

```bash
cd backend
# Make changes to .NET code
dotnet build
dotnet run
```

#### ML Service Changes

```bash
cd ml-service
# Make changes to Python code
# Restart the service
docker-compose restart ml-service
```

### Debugging

#### Enable Debug Logging

```bash
# Backend
export Logging__LogLevel__Default=Debug

# ML Service
export LOG_LEVEL=DEBUG
```

#### Access Container Shells

```bash
# Frontend
docker-compose exec frontend sh

# Backend
docker-compose exec backend bash

# ML Service
docker-compose exec ml-service bash
```

## Production Deployment

### Docker Compose Production

```bash
# Use production compose file
docker-compose -f docker-compose.prod.yml up -d
```

### Environment Configuration

```bash
# Set production environment variables
export ASPNETCORE_ENVIRONMENT=Production
export API_URL=https://your-api-domain.com
```

### Security Considerations

- Use HTTPS in production
- Set up proper firewall rules
- Use secrets management for sensitive data
- Enable authentication if required

## Support

### Getting Help

1. Check the logs: `docker-compose logs`
2. Verify service health endpoints
3. Review this setup guide
4. Check the main README.md

### Reporting Issues

When reporting issues, please include:

- Operating system and version
- Docker version
- Complete error messages
- Steps to reproduce
- Log output

### Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is created for the IntelliInspect Hackathon.
