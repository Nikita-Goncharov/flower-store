# Flowers API
***

**Flowers API** is a RESTful API for managing flower-related data, built with Python using FastAPI and SQLAlchemy.  

## Project Structure

- **main.py**: Entry point of the application.  
- **models.py**: Defines database models using SQLAlchemy.  
- **auth_api.py**: Implements authentication endpoints.  
- **main_api.py**: Contains the main endpoints for handling flower data.  
- **api_pydantic_schemas.py**: Pydantic schemas for data validation.  
- **config.py**: Application settings, including database configuration.  
- **requirements.txt**: Lists required Python libraries.  
- **Dockerfile**: Instructions for building a Docker image.  

## Deployment with Docker

1. **Build the Docker image:**
   ```bash
   docker build -t flowers-api .
   ```

2. **Run the container:**
   ```bash
   docker run -d -p 8000:8000 flowers-api
   ```

After starting the container, the API will be accessible at `http://localhost:8000`.  

## Documentation

API endpoint documentation is available at `http://localhost:8000/docs` after launching the application.