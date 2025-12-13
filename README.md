
# SimpleTalk — Real-Time Chat Infrastructure on AWS

![Build Status](https://img.shields.io/badge/build-passing-brightgreen)
![Infrastructure](https://img.shields.io/badge/Infrastructure-AWS%20EC2-orange)
![CI/CD](https://img.shields.io/badge/CI%2FCD-GitHub%20Actions-blue)
![Uptime](https://img.shields.io/badge/Process%20Manager-PM2-purple)

**SimpleTalk** is a real-time chat application built with Node.js and Socket.io.

This repository focuses on the **production-grade cloud infrastructure** required to deploy, secure, and operate the application reliably on AWS. The project demonstrates the transition from local development to a resilient, automated, and secure production deployment.

🔗 **Live Demo:** [http://13.203.228.51:3000](http://13.203.228.51:3000)  
📂 **Repository:** [Link to your repo]

---

## 🚩 Problem Statement
Running a Node.js application in production introduces challenges that a simple `node server.js` approach cannot handle:

* **Fragility:** Application crashes or terminal closure stops the service.
* **Security Risks:** Exposing port 3000 directly to the internet is unsafe.
* **Manual Deployments:** SSH-based deployments are slow and error-prone.
* **Downtime:** Updates typically interrupt active user connections.

### Solution
A fully automated deployment pipeline backed by:
* AWS EC2
* Nginx reverse proxy
* PM2 process manager
* GitHub Actions (self-hosted runner)

This setup enables secure traffic handling, zero-downtime deployments, and automatic recovery from failures.

---

## 🏗 Architecture Overview
The application is hosted on an Amazon Linux EC2 instance with layered security and automation.

```mermaid
graph TD
    User((User)) -->|HTTP / WebSockets| Internet
    Internet -->|Port 80| SG[AWS Security Group]

    SG --> Nginx[Nginx Reverse Proxy]

    subgraph AWS EC2 Instance
        Nginx --> NodeApp["Node.js App (PM2)"]
        NodeApp --> DB[(MongoDB)]

        GHA[GitHub Actions Runner] -->|Deploy & Reload| NodeApp
    end

    GitHub[GitHub Repository] -->|Push to main| GHA
````

### Key Components

  * **EC2 (Compute):** Hosts the application and CI/CD runner.
  * **Nginx (Gateway):** Routes HTTP traffic and maintains WebSocket persistence.
  * **PM2 (Process Manager):** Ensures application uptime and restarts.
  * **GitHub Actions Runner:** Handles automated deployments directly on EC2.

-----

## 🚀 CI/CD Pipeline (Automated Deployment)

A self-hosted GitHub Actions runner is used instead of SSH-based deployments.

### Deployment Flow

1.  **Trigger:** Code pushed to the `main` branch.
2.  **Pull:** EC2-based runner pulls the latest changes.
3.  **Install:** Dependencies installed via `npm install`.
4.  **Secrets Injection:** Environment variables injected securely.
5.  **Zero-Downtime Reload:** Application reloaded using `pm2 reload`.

*PM2 reloads processes gracefully, ensuring existing WebSocket connections are not abruptly terminated.*

-----

## 🛡 Security Design

Security was implemented as a design-first principle.

### Key Decisions

  * **Nginx Reverse Proxy:**
      * Node.js app is never exposed directly.
      * Handles HTTP and WebSocket traffic securely.
  * **AWS Security Groups:**
      * **Port 80 (HTTP):** Open to the public.
      * **Port 22 (SSH):** Restricted to a single trusted IP.
      * **All other ports:** Blocked by default.
  * **Secrets Management:**
      * No credentials stored in code.
      * All secrets injected via environment variables.

-----

## ⚙️ Failure Handling & Resilience

To ensure high availability:

  * **PM2 Process Management:**
      * Runs the app as a background daemon.
      * Automatically restarts on crashes.
      * Configured to start on system reboot (`pm2 startup`).
  * **Automated Recovery:**
      * CI/CD pipeline resolves dependency mismatches.
      * Infrastructure survives EC2 restarts without manual intervention.

-----

## 💰 Cost Estimate (Approximate)

Designed to stay **Free Tier eligible** for new AWS accounts.

| Service | Type | Estimated Cost |
| :--- | :--- | :--- |
| **Compute** | EC2 (t2.micro / t3.micro) | Free Tier or \~$8.50/month |
| **Storage** | EBS (gp2/gp3, ≤30GB) | Free Tier |
| **Traffic** | Data Transfer Out | \< $1/month |
| **CI/CD** | GitHub Actions Runner | Included (EC2-based) |
| **Total** | | **\~₹0 – ₹800 / month** |

-----

## 🛠 Tech Stack

  * **Cloud:** AWS (EC2, Security Groups)
  * **OS:** Amazon Linux
  * **Web Server:** Nginx
  * **Process Manager:** PM2
  * **CI/CD:** GitHub Actions (Self-Hosted)
  * **Backend:** Node.js, Socket.io
  * **Database:** MongoDB

-----

### 👨‍💻 Author

**Ayush Ranjan** *DevOps / Cloud Engineering Enthusiast* 🔗 [LinkedIn Profile](https://www.linkedin.com/in/ayushranjan2504/)
📂 [GitHub Profile](https://github.com/ayush1331)

```

