🛡️ CyberShield Academy
CyberShield Academy is a comprehensive Security Awareness & Phishing Simulation platform. It gamifies cybersecurity training by providing a simulated desktop environment where users encounter real-world attack vectors, from deceptive emails to sophisticated multi-step social engineering schemes.

🚀 Tech Stack
Backend: Spring Boot 3.2, Java 21, Spring Security (JWT + Redis)

API Gateway: Spring Cloud Gateway

Frontend: HTML5, CSS3, JavaScript (Vanilla), Chart.js

Database: PostgreSQL 15, Redis 7

DevOps: Docker, Docker Compose

📋 System Requirements
Docker Desktop (Recommended for full stack)

JDK 21

Node.js (v18+)

Git

⚙️ Installation & Setup
Follow these steps in order to launch the entire ecosystem.

1. Clone the Repository
Bash
git clone <your-repo-url>
cd CyberShield-Academy
2. Launch with Docker Compose (Full Stack)
The easiest way to run the project is using Docker Compose, which orchestrates the Database, Redis, Gateway, Backend, and Frontend.

Bash
# Build and start all containers
docker-compose up --build -d

# Check status to ensure all services are healthy
docker-compose ps
🖥️ Frontend: Available at http://localhost:3000

🛰️ API Gateway: Running at http://localhost:8000

📚 Swagger UI: Accessible at http://localhost:8080/swagger-ui.html

3. Running Services Locally (For Development)
If you prefer running components individually for debugging:

A. Start Infrastructure (DB & Redis)
Bash
docker-compose up -d db redis
B. Run Backend
Bash
cd cybershield
# For Windows
./gradlew.bat bootRun
# For macOS/Linux
./gradlew bootRun
C. Run API Gateway
Bash
cd gateway
./gradlew bootRun
🛡️ Training Scenario & Risk Assessment
The system evaluates users based on their interaction with simulated threats.

1. Attack Vectors
Spear Phishing: Highly targeted emails using spoofed identities.

Social Engineering: Multi-step traps involving Zalo/Instant Messaging mồi (lures).

In-app Browser Simulation: Fake landing pages (Google, Microsoft, Banking) to test URL scrutiny.

Quishing: Malicious QR codes leading to credential theft pages.

2. User Risk Profile (URP) Indicators
After each session, the AI provides feedback based on:

Detection Speed: How quickly a threat was identified vs. acted upon.

Data Leakage: Whether sensitive info (Passwords/OTP) was submitted to fake sites.

URL Vigilance: Ability to spot "Typosquatting" or malicious domains.

📈 Database Management (Admin Access)
You can manage scenarios and view user logs directly via PostgreSQL.

Host: localhost

Port: 5432

Username: admin

Password: password123

Database: cybershield