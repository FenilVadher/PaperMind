# PaperMind Deployment Guide 🚀

This guide provides comprehensive instructions for deploying PaperMind in different environments.

## Quick Start (Development)

### Option 1: Automated Setup
```bash
# Run the setup script
python3 setup.py

# Start both servers
./start_papermind.sh
```

### Option 2: Manual Setup
```bash
# Backend setup
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
python3 run_backend.py

# Frontend setup (in new terminal)
cd frontend
npm install
npm start
```

## Production Deployment

### Backend (Flask + Gunicorn)
```bash
# Install production dependencies
pip install gunicorn

# Run with Gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 backend.app:app

# Or with more configuration
gunicorn -w 4 -b 0.0.0.0:5000 --timeout 300 --max-requests 1000 backend.app:app
```

### Frontend (React Build)
```bash
# Build for production
cd frontend
npm run build

# Serve with a static server
npx serve -s build -l 3000

# Or use nginx/apache to serve the build folder
```

## Docker Deployment

### Backend Dockerfile
```dockerfile
FROM python:3.9-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code
COPY backend/ .

# Create uploads directory
RUN mkdir -p uploads

EXPOSE 5000

CMD ["gunicorn", "-w", "4", "-b", "0.0.0.0:5000", "--timeout", "300", "app:app"]
```

### Frontend Dockerfile
```dockerfile
FROM node:16-alpine as build

WORKDIR /app
COPY frontend/package*.json ./
RUN npm ci --only=production

COPY frontend/ .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Docker Compose
```yaml
version: '3.8'

services:
  backend:
    build:
      context: .
      dockerfile: Dockerfile.backend
    ports:
      - "5000:5000"
    volumes:
      - ./uploads:/app/uploads
    environment:
      - FLASK_ENV=production
    
  frontend:
    build:
      context: .
      dockerfile: Dockerfile.frontend
    ports:
      - "3000:80"
    depends_on:
      - backend
    environment:
      - REACT_APP_API_URL=http://localhost:5000
```

## Cloud Deployment

### Heroku
```bash
# Install Heroku CLI and login
heroku login

# Create app
heroku create papermind-app

# Set buildpacks
heroku buildpacks:add heroku/python
heroku buildpacks:add heroku/nodejs

# Deploy
git push heroku main
```

### AWS EC2
```bash
# On EC2 instance
sudo apt update
sudo apt install python3 python3-pip nodejs npm nginx

# Clone and setup
git clone <repo-url>
cd PaperMind
python3 setup.py

# Configure nginx
sudo cp nginx.conf /etc/nginx/sites-available/papermind
sudo ln -s /etc/nginx/sites-available/papermind /etc/nginx/sites-enabled/
sudo systemctl restart nginx
```

### Google Cloud Platform
```bash
# Using App Engine
gcloud app deploy app.yaml

# Using Cloud Run
gcloud run deploy papermind --source .
```

## Environment Configuration

### Production Environment Variables
```env
# Flask Configuration
FLASK_ENV=production
FLASK_DEBUG=False

# Security
SECRET_KEY=your-secret-key-here

# File Upload
MAX_CONTENT_LENGTH=16777216

# AI Models
HUGGINGFACE_CACHE_DIR=/app/models_cache
TORCH_DEVICE=cpu

# Database (if using)
DATABASE_URL=postgresql://user:pass@host:port/db

# Logging
LOG_LEVEL=INFO
```

### Nginx Configuration
```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Frontend
    location / {
        root /var/www/papermind/build;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api/ {
        proxy_pass http://localhost:5000/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Increase timeout for AI processing
        proxy_read_timeout 300s;
        proxy_connect_timeout 300s;
        proxy_send_timeout 300s;
    }

    # File upload size
    client_max_body_size 16M;
}
```

## Performance Optimization

### Backend Optimizations
- Use Gunicorn with multiple workers
- Enable GPU acceleration if available
- Implement model caching
- Use Redis for session storage
- Add database for persistent storage

### Frontend Optimizations
- Enable gzip compression
- Use CDN for static assets
- Implement code splitting
- Add service worker for caching
- Optimize bundle size

## Monitoring and Logging

### Application Monitoring
```python
# Add to Flask app
import logging
from logging.handlers import RotatingFileHandler

if not app.debug:
    file_handler = RotatingFileHandler('logs/papermind.log', maxBytes=10240, backupCount=10)
    file_handler.setFormatter(logging.Formatter(
        '%(asctime)s %(levelname)s: %(message)s [in %(pathname)s:%(lineno)d]'
    ))
    file_handler.setLevel(logging.INFO)
    app.logger.addHandler(file_handler)
```

### Health Checks
```bash
# Backend health check
curl -f http://localhost:5000/ || exit 1

# Frontend health check
curl -f http://localhost:3000/ || exit 1
```

## Security Considerations

### Backend Security
- Use HTTPS in production
- Implement rate limiting
- Validate file uploads
- Sanitize user inputs
- Use environment variables for secrets

### Frontend Security
- Enable Content Security Policy
- Use HTTPS for API calls
- Implement proper error handling
- Sanitize displayed content

## Troubleshooting

### Common Issues
1. **Model loading errors**: Ensure sufficient memory and disk space
2. **CORS issues**: Check CORS configuration in Flask app
3. **File upload failures**: Verify file size limits and permissions
4. **Slow AI processing**: Consider GPU acceleration or model optimization

### Debug Commands
```bash
# Check backend logs
tail -f logs/papermind.log

# Test API endpoints
curl -X GET http://localhost:5000/
curl -X POST -F "file=@test.pdf" http://localhost:5000/upload

# Check frontend build
npm run build && npx serve -s build
```

## Scaling

### Horizontal Scaling
- Use load balancer (nginx, HAProxy)
- Deploy multiple backend instances
- Implement shared storage for uploads
- Use Redis for session management

### Vertical Scaling
- Increase server resources
- Optimize AI model loading
- Use GPU acceleration
- Implement caching strategies

---

For more deployment options and advanced configurations, refer to the main README.md file.
