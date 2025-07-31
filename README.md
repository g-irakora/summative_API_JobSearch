# Job Search Application

**Student:** Irakora Des Gasana  
**Course:** Web Infrastructure  
**Project:** Summative Assignment - External API Integration & Deployment

## Overview

This job search application provides users with a practical tool to find employment opportunities in their desired locations. Built as a web application using HTML, CSS, and JavaScript, it integrates with external APIs from RapidAPI to deliver real-time job listings, helping users discover relevant career opportunities efficiently.

## Features

- **Location-based Job Search**: Search for jobs in specific cities or regions
- **Real-time Data**: Fetches current job listings from external APIs
- **Interactive Interface**: User-friendly web interface for seamless job searching
- **Data Presentation**: Clear and organized display of job information
- **Error Handling**: Graceful handling of API errors and network issues

## Technology Stack

- **Frontend**: HTML, CSS, JavaScript
- **APIs**: RapidAPI job search endpoints
- **Containerization**: Docker
- **Deployment**: Docker Hub + Container orchestration
- **Load Balancing**: HAProxy configuration

## API Integration

This application utilizes job search APIs from RapidAPI to provide comprehensive job listings. The application handles API authentication securely and includes proper error handling for various scenarios including API downtime and invalid responses.

*Credit: Job data provided by RapidAPI services*

## Local Development

### Prerequisites
- Docker installed on your machine
- Internet connection for API calls

### Build Instructions

1. Clone the repository
2. Build the Docker image:
```bash
docker build -t des12/summative-jobsearch-app:v1 .
```

3. Test locally:
```bash
docker run -p 8080:8080 des12/summative-jobsearch-app:v1
```

4. Verify the application:
```bash
curl http://localhost:8080
```

## Docker Hub Deployment

### Image Details
- **Docker Hub Repository**: `des12/summative-jobsearch-app`
- **Image Tags**: `v1`, `latest`
- **Base Port**: 8080

### Publishing to Docker Hub

```bash
# Login to Docker Hub
docker login

# Push the image
docker push des12/summative-jobsearch-app:v1
docker push des12/summative-jobsearch-app:latest
```

## Production Deployment

### Container Deployment on Web Servers

**On Web01 and Web02:**

```bash
# Pull the image
docker pull des12/summative-jobsearch-app:v1

# Run the container
docker run -d --name app --restart unless-stopped \
  -p 8080:8080 des12/summative-jobsearch-app:v1
```

### Load Balancer Configuration

**HAProxy Configuration** (`/etc/haproxy/haproxy.cfg`):

```haproxy
backend webapps
    balance roundrobin
    server web01 172.20.0.11:8080 check
    server web02 172.20.0.12:8080 check
```

**Reload HAProxy:**
```bash
docker exec -it lb-01 sh -c 'haproxy -sf $(pidof haproxy) -f /etc/haproxy/haproxy.cfg'
```

## Testing & Verification

### Load Balancer Testing

Test the load balancing functionality:

```bash
# Test multiple requests to verify round-robin distribution
curl http://localhost
curl http://localhost
curl http://localhost
```

**Expected Behavior**: Requests should alternate between Web01 and Web02 servers.

### Application Testing

1. **Internal Server Access**:
   - `http://web-01:8080` - Direct access to Web01
   - `http://web-02:8080` - Direct access to Web02

2. **Load Balancer Access**:
   - Production URL: https://des12-lb.onrender.com

3. **Functionality Testing**:
   - Enter a location in the search field
   - Verify job listings are displayed
   - Test error handling with invalid locations

## Usage Instructions

1. Access the application through the load balancer URL
2. Enter your desired job search location in the search field
3. Click the search button to retrieve job listings
4. Browse through the results to find relevant opportunities
5. Use the interactive features to filter or sort results as needed

## Security Considerations

- API keys are handled securely and not exposed in the public repository
- Environment variables are used for sensitive configuration
- Error messages do not expose internal system information

## Project Structure

```
├── index.html          # Main application interface
├── styles.css          # Application styling
├── script.js           # JavaScript logic and API integration
├── Dockerfile          # Container configuration
└── README.md           # This documentation
```

## Deployment Architecture

The application follows a containerized microservices architecture:

- **Load Balancer (Lb01)**: HAProxy distributing traffic
- **Web Server 1 (Web01)**: Primary application instance
- **Web Server 2 (Web02)**: Secondary application instance
- **Docker Hub**: Centralized image repository

## Error Handling

The application includes comprehensive error handling for:
- API service unavailability
- Network connectivity issues
- Invalid location queries
- Rate limiting scenarios
- Malformed API responses

## Future Enhancements

- Advanced filtering options (salary range, job type, company size)
- Save favorite job listings
- Job application tracking
- Email notifications for new matching jobs
- Mobile-responsive improvements

---

**Note**: This application was developed as part of the Web Infrastructure course summative assignment, demonstrating practical integration of external APIs, containerization, and load-balanced deployment strategies.
