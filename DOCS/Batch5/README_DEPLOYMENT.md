
# HITL Collaboration System - Deployment Guide

## Overview

This guide covers the deployment of the HITL Collaboration System (Batch 5) for production environments. The system includes advanced Human-in-the-Loop features with real-time collaboration, multi-stakeholder workflows, and seamless integration with existing RAG and Multi-Agent systems.

## Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Load Balancer │    │   Web Frontend  │    │   API Gateway   │
│    (Nginx)      │────│   (Next.js)     │────│   (FastAPI)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                        │
                       ┌─────────────────┐             │
                       │   WebSocket     │─────────────┘
                       │   (Socket.IO)   │
                       └─────────────────┘
                                │
        ┌───────────────────────┼───────────────────────┐
        │                       │                       │
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   PostgreSQL    │    │     Redis       │    │   ChromaDB      │
│   (Database)    │    │   (Cache/Queue) │    │   (RAG Store)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Prerequisites

### System Requirements

- **CPU**: 4+ cores (8+ recommended for production)
- **RAM**: 8GB minimum (16GB+ recommended)
- **Storage**: 100GB+ SSD storage
- **Network**: Stable internet connection with sufficient bandwidth

### Software Requirements

- Docker 20.10+
- Docker Compose 2.0+
- Git
- SSL certificates (for HTTPS)

### Optional Tools

- Kubernetes (for container orchestration)
- Terraform (for infrastructure as code)
- Ansible (for configuration management)

## Deployment Options

### Option 1: Docker Compose (Recommended for small to medium deployments)

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd Batches/Batch5
   ```

2. **Configure environment variables**:
   ```bash
   cp backend/.env.example backend/.env
   cp frontend/.env.example frontend/.env.local
   ```

3. **Update production settings**:
   ```bash
   # backend/.env
   DEBUG=false
   SECRET_KEY=<generate-strong-secret-key>
   DATABASE_URL=postgresql://user:password@postgres:5432/hitl_db
   ALLOWED_HOSTS=yourdomain.com,api.yourdomain.com
   
   # frontend/.env.local
   NEXT_PUBLIC_API_URL=https://api.yourdomain.com
   NEXT_PUBLIC_WS_URL=wss://api.yourdomain.com
   ```

4. **Deploy with production profile**:
   ```bash
   docker-compose --profile production up -d
   ```

### Option 2: Kubernetes Deployment

1. **Apply Kubernetes manifests**:
   ```bash
   kubectl apply -f k8s/namespace.yaml
   kubectl apply -f k8s/configmap.yaml
   kubectl apply -f k8s/secrets.yaml
   kubectl apply -f k8s/
   ```

2. **Configure ingress**:
   ```bash
   kubectl apply -f k8s/ingress.yaml
   ```

### Option 3: Cloud Provider Deployment

#### AWS ECS/Fargate

1. **Build and push images**:
   ```bash
   # Build images
   docker build -t hitl-backend ./backend
   docker build -t hitl-frontend ./frontend
   
   # Tag and push to ECR
   aws ecr get-login-password --region us-west-2 | docker login --username AWS --password-stdin <account>.dkr.ecr.us-west-2.amazonaws.com
   docker tag hitl-backend:latest <account>.dkr.ecr.us-west-2.amazonaws.com/hitl-backend:latest
   docker push <account>.dkr.ecr.us-west-2.amazonaws.com/hitl-backend:latest
   ```

2. **Deploy using Terraform**:
   ```bash
   cd terraform/aws
   terraform init
   terraform plan
   terraform apply
   ```

#### Google Cloud Run

1. **Deploy services**:
   ```bash
   # Deploy backend
   gcloud run deploy hitl-backend \
     --image gcr.io/PROJECT_ID/hitl-backend \
     --platform managed \
     --region us-central1 \
     --allow-unauthenticated
   
   # Deploy frontend
   gcloud run deploy hitl-frontend \
     --image gcr.io/PROJECT_ID/hitl-frontend \
     --platform managed \
     --region us-central1 \
     --allow-unauthenticated
   ```

## Configuration

### Environment Variables

#### Backend Configuration

```bash
# Core Settings
DEBUG=false
SECRET_KEY=<strong-secret-key>
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Database
DATABASE_URL=postgresql://user:password@host:5432/database
DATABASE_POOL_SIZE=20
DATABASE_MAX_OVERFLOW=30

# Redis
REDIS_URL=redis://host:6379/0
REDIS_POOL_SIZE=20

# Security
ALLOWED_HOSTS=yourdomain.com,api.yourdomain.com
CORS_ORIGINS=https://yourdomain.com

# File Storage
MAX_FILE_SIZE=104857600  # 100MB
UPLOAD_DIR=/app/uploads
STORAGE_PROVIDER=s3  # local, s3, gcs

# External Services
OPENAI_API_KEY=<your-openai-key>
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=<email>
SMTP_PASSWORD=<password>

# Monitoring
SENTRY_DSN=<sentry-dsn>
PROMETHEUS_ENABLED=true

# RAG Integration
RAG_ENABLED=true
CHROMA_PERSIST_DIR=/app/chroma_db
EMBEDDING_MODEL=all-MiniLM-L6-v2

# Multi-Agent Integration
CREWAI_ENABLED=true
AGENT_TIMEOUT=300
```

#### Frontend Configuration

```bash
# API Configuration
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
NEXT_PUBLIC_WS_URL=wss://api.yourdomain.com

# Authentication
NEXT_PUBLIC_AUTH_PROVIDER=internal

# Features
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_CHAT=true

# External Services
NEXT_PUBLIC_SENTRY_DSN=<sentry-dsn>
```

### SSL/TLS Configuration

#### Using Let's Encrypt with Nginx

1. **Install Certbot**:
   ```bash
   sudo apt-get install certbot python3-certbot-nginx
   ```

2. **Obtain certificates**:
   ```bash
   sudo certbot --nginx -d yourdomain.com -d api.yourdomain.com
   ```

3. **Configure auto-renewal**:
   ```bash
   sudo crontab -e
   # Add: 0 12 * * * /usr/bin/certbot renew --quiet
   ```

### Database Setup

#### PostgreSQL Configuration

1. **Create database and user**:
   ```sql
   CREATE DATABASE hitl_collaboration;
   CREATE USER hitl_user WITH PASSWORD 'secure_password';
   GRANT ALL PRIVILEGES ON DATABASE hitl_collaboration TO hitl_user;
   ```

2. **Configure connection pooling**:
   ```bash
   # Install PgBouncer
   sudo apt-get install pgbouncer
   
   # Configure /etc/pgbouncer/pgbouncer.ini
   [databases]
   hitl_collaboration = host=localhost port=5432 dbname=hitl_collaboration
   
   [pgbouncer]
   listen_port = 6432
   listen_addr = 127.0.0.1
   auth_type = md5
   auth_file = /etc/pgbouncer/userlist.txt
   pool_mode = transaction
   max_client_conn = 100
   default_pool_size = 20
   ```

#### Redis Configuration

1. **Configure Redis for production**:
   ```bash
   # /etc/redis/redis.conf
   bind 127.0.0.1
   port 6379
   requirepass secure_password
   maxmemory 2gb
   maxmemory-policy allkeys-lru
   save 900 1
   save 300 10
   save 60 10000
   ```

## Monitoring and Logging

### Application Monitoring

1. **Prometheus + Grafana**:
   ```bash
   docker-compose --profile monitoring up -d
   ```

2. **Custom dashboards**:
   - API response times
   - WebSocket connections
   - Database performance
   - User activity metrics

### Log Management

1. **Centralized logging with ELK Stack**:
   ```bash
   docker-compose -f docker-compose.logging.yml up -d
   ```

2. **Log rotation**:
   ```bash
   # /etc/logrotate.d/hitl-app
   /var/log/hitl/*.log {
       daily
       missingok
       rotate 52
       compress
       delaycompress
       notifempty
       create 644 www-data www-data
   }
   ```

### Health Checks

1. **Application health endpoints**:
   - Backend: `GET /health`
   - Frontend: `GET /api/health`
   - Database: Connection pooling status
   - Redis: Memory usage and connections

2. **External monitoring**:
   ```bash
   # Uptime monitoring with curl
   */5 * * * * curl -f https://yourdomain.com/health || echo "Site down"
   ```

## Security

### Network Security

1. **Firewall configuration**:
   ```bash
   # UFW rules
   sudo ufw allow 22/tcp    # SSH
   sudo ufw allow 80/tcp    # HTTP
   sudo ufw allow 443/tcp   # HTTPS
   sudo ufw deny 5432/tcp   # PostgreSQL (internal only)
   sudo ufw deny 6379/tcp   # Redis (internal only)
   sudo ufw enable
   ```

2. **VPC/Network isolation** (Cloud providers):
   - Private subnets for databases
   - Security groups with minimal access
   - NAT gateways for outbound traffic

### Application Security

1. **Rate limiting**:
   ```python
   # Implemented in middleware
   RATE_LIMIT_REQUESTS = 100
   RATE_LIMIT_WINDOW = 60
   ```

2. **Input validation**:
   - Pydantic models for API validation
   - SQL injection prevention with ORM
   - XSS protection with content security policy

3. **Authentication & Authorization**:
   - JWT tokens with short expiration
   - Role-based access control (RBAC)
   - Multi-factor authentication support

### Data Protection

1. **Encryption at rest**:
   - Database encryption
   - File storage encryption
   - Backup encryption

2. **Encryption in transit**:
   - TLS 1.3 for all connections
   - WebSocket secure connections (WSS)
   - Internal service communication encryption

## Backup and Recovery

### Database Backups

1. **Automated backups**:
   ```bash
   #!/bin/bash
   # backup-db.sh
   BACKUP_DIR="/backups/postgresql"
   DATE=$(date +%Y%m%d_%H%M%S)
   
   pg_dump -h localhost -U hitl_user hitl_collaboration | gzip > "$BACKUP_DIR/hitl_db_$DATE.sql.gz"
   
   # Keep only last 30 days
   find $BACKUP_DIR -name "*.sql.gz" -mtime +30 -delete
   ```

2. **Point-in-time recovery**:
   ```bash
   # Enable WAL archiving in postgresql.conf
   wal_level = replica
   archive_mode = on
   archive_command = 'cp %p /backups/postgresql/wal/%f'
   ```

### File Storage Backups

1. **Rsync backups**:
   ```bash
   #!/bin/bash
   # backup-files.sh
   rsync -av --delete /app/uploads/ /backups/uploads/
   rsync -av --delete /app/chroma_db/ /backups/chroma_db/
   ```

2. **Cloud storage sync**:
   ```bash
   # AWS S3 sync
   aws s3 sync /app/uploads/ s3://hitl-backups/uploads/
   aws s3 sync /app/chroma_db/ s3://hitl-backups/chroma_db/
   ```

### Disaster Recovery

1. **Recovery procedures**:
   ```bash
   # Database recovery
   gunzip -c /backups/postgresql/hitl_db_latest.sql.gz | psql -h localhost -U hitl_user hitl_collaboration
   
   # File recovery
   rsync -av /backups/uploads/ /app/uploads/
   rsync -av /backups/chroma_db/ /app/chroma_db/
   ```

2. **Testing recovery**:
   - Monthly recovery tests
   - Documentation of recovery procedures
   - RTO/RPO targets definition

## Performance Optimization

### Database Optimization

1. **Indexing strategy**:
   ```sql
   -- Common indexes
   CREATE INDEX idx_users_email ON users(email);
   CREATE INDEX idx_projects_creator ON projects(creator_id);
   CREATE INDEX idx_comments_project ON comments(project_id);
   CREATE INDEX idx_files_project ON files(project_id);
   ```

2. **Query optimization**:
   - Use EXPLAIN ANALYZE for slow queries
   - Implement query result caching
   - Database connection pooling

### Application Performance

1. **Caching strategy**:
   ```python
   # Redis caching for frequently accessed data
   - User sessions: 30 minutes
   - Project metadata: 5 minutes
   - File previews: 1 hour
   - API responses: 1 minute
   ```

2. **CDN configuration**:
   ```nginx
   # Static asset caching
   location /static/ {
       expires 1y;
       add_header Cache-Control "public, immutable";
   }
   ```

### WebSocket Optimization

1. **Connection management**:
   ```python
   # Limit concurrent connections per user
   MAX_CONNECTIONS_PER_USER = 5
   
   # Connection cleanup
   INACTIVE_CONNECTION_TIMEOUT = 300  # 5 minutes
   ```

2. **Message optimization**:
   - Message batching for high-frequency updates
   - Compression for large messages
   - Rate limiting for message sending

## Scaling

### Horizontal Scaling

1. **Load balancing**:
   ```nginx
   upstream backend {
       server backend1:8000;
       server backend2:8000;
       server backend3:8000;
   }
   
   upstream frontend {
       server frontend1:3000;
       server frontend2:3000;
   }
   ```

2. **Database scaling**:
   - Read replicas for read-heavy workloads
   - Connection pooling with PgBouncer
   - Partitioning for large tables

### Auto-scaling (Kubernetes)

1. **Horizontal Pod Autoscaler**:
   ```yaml
   apiVersion: autoscaling/v2
   kind: HorizontalPodAutoscaler
   metadata:
     name: hitl-backend-hpa
   spec:
     scaleTargetRef:
       apiVersion: apps/v1
       kind: Deployment
       name: hitl-backend
     minReplicas: 2
     maxReplicas: 10
     metrics:
     - type: Resource
       resource:
         name: cpu
         target:
           type: Utilization
           averageUtilization: 70
   ```

## Troubleshooting

### Common Issues

1. **Database connection issues**:
   ```bash
   # Check connection
   psql -h localhost -U hitl_user -d hitl_collaboration
   
   # Check active connections
   SELECT count(*) FROM pg_stat_activity;
   ```

2. **WebSocket connection problems**:
   ```bash
   # Check WebSocket endpoint
   wscat -c ws://localhost:8000/socket.io/?transport=websocket
   
   # Monitor connections
   docker logs hitl_backend | grep websocket
   ```

3. **High memory usage**:
   ```bash
   # Monitor memory usage
   docker stats
   
   # Check Redis memory
   redis-cli info memory
   ```

### Performance Issues

1. **Slow API responses**:
   ```bash
   # Enable query logging
   echo "log_statement = 'all'" >> /etc/postgresql/postgresql.conf
   
   # Monitor slow queries
   SELECT query, mean_time, calls FROM pg_stat_statements ORDER BY mean_time DESC LIMIT 10;
   ```

2. **High CPU usage**:
   ```bash
   # Profile application
   py-spy top --pid $(pgrep -f "uvicorn")
   
   # Check database CPU
   SELECT query, total_time, mean_time FROM pg_stat_statements ORDER BY total_time DESC LIMIT 10;
   ```

## Maintenance

### Regular Maintenance Tasks

1. **Weekly tasks**:
   - Review application logs
   - Check disk space usage
   - Verify backup integrity
   - Update security patches

2. **Monthly tasks**:
   - Database maintenance (VACUUM, ANALYZE)
   - Performance review
   - Security audit
   - Capacity planning review

3. **Quarterly tasks**:
   - Disaster recovery testing
   - Security penetration testing
   - Performance benchmarking
   - Architecture review

### Update Procedures

1. **Application updates**:
   ```bash
   # Blue-green deployment
   docker-compose -f docker-compose.blue.yml up -d
   # Test new version
   # Switch traffic
   docker-compose -f docker-compose.green.yml down
   ```

2. **Database migrations**:
   ```bash
   # Backup before migration
   pg_dump hitl_collaboration > backup_pre_migration.sql
   
   # Run migrations
   cd backend
   alembic upgrade head
   ```

## Support and Documentation

### Monitoring Dashboards

- **Grafana**: http://localhost:3001 (admin/admin)
- **Prometheus**: http://localhost:9090
- **Application logs**: `docker-compose logs -f`

### Documentation

- API Documentation: `/docs` endpoint
- WebSocket Events: `docs/websocket-events.md`
- Database Schema: `docs/database-schema.md`
- Architecture Diagrams: `docs/architecture/`

### Support Contacts

- **Technical Issues**: Create GitHub issue
- **Security Issues**: security@yourdomain.com
- **General Support**: support@yourdomain.com

---

This deployment guide provides comprehensive instructions for deploying the HITL Collaboration System in production environments. Follow the security best practices and monitoring guidelines to ensure a stable and secure deployment.
