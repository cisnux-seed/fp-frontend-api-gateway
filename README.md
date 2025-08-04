# BNI E-Wallet Frontend API Gateway

Aplikasi frontend untuk simulasi transaksi digital BNI E-Wallet yang dibangun dengan Next.js dan TypeScript.

##  Fitur

- **Autentikasi**: Login dan logout dengan JWT token
- **Manajemen Wallet**: Cek saldo, top-up, dan transfer
- **Transaksi**: Simulasi transaksi digital dengan berbagai metode pembayaran
- **UI/UX Modern**: Dibangun dengan Tailwind CSS dan Radix UI components
- **Responsive Design**: Optimal di desktop dan mobile
- **Testing**: Unit testing dengan Jest dan React Testing Library

##  Tech Stack

- **Framework**: Next.js 15.3.3
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI
- **State Management**: React Context
- **Form Handling**: React Hook Form + Zod validation
- **Testing**: Jest + React Testing Library
- **Deployment**: Docker + OpenShift

##  Prerequisites

Pastikan Anda telah menginstal:
- [Node.js](https://nodejs.org/) (versi 20 atau lebih baru)
- npm (sudah termasuk dengan Node.js)

##  Getting Started

### 1. Clone Repository

```bash
git clone <repository-url>
cd fp-frontend-api-gateway
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Setup

Buat file `.env.local` di root project:

```env
API_BASE_URL=https://kong-proxy-one-gate-payment.apps.ocp-one-gate-payment.skynux.fun
```

### 4. Run Development Server

```bash
npm run dev
```

Aplikasi akan berjalan di [http://localhost:3000](http://localhost:3000)

##  Available Scripts

```bash
# Development
npm run dev          # Start development server

# Build & Production
npm run build        # Build production version
npm start           # Start production server

# Code Quality
npm run lint        # Run ESLint
npm run typecheck   # Run TypeScript type checking

# Testing
npm test           # Run tests once
npm run test:watch # Run tests in watch mode
npm run test:coverage # Run tests with coverage
npm run test:ci    # Run tests for CI/CD
```

##  Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   ├── auth/          # Authentication endpoints
│   │   ├── payment/       # Payment endpoints
│   │   └── health/        # Health check
│   ├── login/             # Login page
│   ├── transaction/       # Transaction pages
│   └── layout.tsx         # Root layout
├── components/            # Reusable components
│   ├── ui/               # UI components (Radix UI)
│   ├── icons.tsx         # Icon components
│   └── providers.tsx     # Context providers
├── context/              # React contexts
├── hooks/                # Custom hooks
├── libs/                 # Utilities and constants
└── __tests__/            # Test files
```

##  API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/refresh` - Refresh token

### Payment
- `GET /api/payment/account` - Get account info
- `GET /api/payment/balance` - Get wallet balance
- `POST /api/payment/topup` - Top-up wallet
- `POST /api/payment/wallet` - Wallet operations

### Health
- `GET /api/health` - Health check endpoint

##  Docker Deployment

### Build Docker Image

```bash
docker build -t bni-ewallet-frontend .
```

### Run with Docker Compose

```bash
docker-compose up -d
```

##  OpenShift Deployment

Deploy menggunakan konfigurasi OpenShift yang tersedia:

```bash
# Apply all OpenShift configurations
kubectl apply -f openshift/
```

Konfigurasi meliputi:
- `deployment.yaml` - Application deployment
- `service.yaml` - Service configuration
- `route.yaml` - Route configuration
- `hpa.yaml` - Horizontal Pod Autoscaler

##  Testing

Proyek menggunakan Jest dan React Testing Library untuk testing:

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode (development)
npm run test:watch
```

### Test Coverage

Test coverage meliputi:
-  UI Components
-  Custom Hooks
-  Context Providers
-  Utility Functions

##  Development Guidelines

### Code Style
- Menggunakan ESLint dan TypeScript untuk code quality
- Ikuti konvensi Next.js dan React best practices
- Gunakan TypeScript untuk type safety

### Component Development
- Gunakan functional components dengan hooks
- Implement proper error boundaries
- Follow responsive design principles

### Testing
- Write unit tests untuk semua components dan functions
- Maintain test coverage > 80%
- Test user interactions dan edge cases

##  CI/CD Pipeline

Pipeline Jenkins tersedia dengan konfigurasi di `Jenkinsfile` yang meliputi:
1. Install dependencies
2. Run linting dan type checking
3. Run tests dengan coverage
4. Build application
5. Build dan push Docker image
6. Deploy ke OpenShift

##  Monitoring & Health Check

- Health check endpoint: `/api/health`
- Application logging untuk debugging
- Performance monitoring dengan Next.js built-in analytics

##  Contributing

1. Fork repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push ke branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

##  License

Proyek ini adalah bagian dari program final BNI dan hanya untuk tujuan pembelajaran.

##  Support

Jika mengalami masalah atau memiliki pertanyaan, silakan buat issue di repository ini.