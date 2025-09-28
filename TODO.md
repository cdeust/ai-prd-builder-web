# AI PRD Builder Web - Implementation TODO

## Architecture Status: ✅ SOLID + Clean Architecture Foundation Complete

### ✅ COMPLETED: Domain Layer (Core Business Logic)
- [x] Value Objects (Priority, RequestStatus) - Immutable, validated
- [x] Entities (PRDSection, PRDDocument, PRDRequest) - Pure domain models
- [x] Repository Interfaces (IPRDRepository, IWebSocketClient) - DIP compliance

### ✅ COMPLETED: Application Layer (Use Cases)
- [x] GeneratePRDUseCase - Orchestrates PRD generation
- [x] GetPRDRequestUseCase - Fetches PRD request
- [x] DownloadPRDUseCase - Downloads PRD document
- [x] AnswerClarificationUseCase - Sends clarification answers

### ✅ COMPLETED: Infrastructure Layer (External Adapters)
- [x] ApiClient - HTTP REST client
- [x] PRDApiRepository - Implements IPRDRepository
- [x] WebSocketClient - Implements IWebSocketClient with reconnection

### ✅ COMPLETED: Dependency Injection
- [x] DIContainer - Singleton container with proper injection

### ⏳ REMAINING: Presentation Layer (React UI)

#### 1. Custom Hooks (SRP - One responsibility per hook)
**Location:** `src/presentation/hooks/`

- [ ] **usePRDGeneration.ts** - Hook for PRD generation state
  ```typescript
  // Manages: form state, submission, error handling
  // Returns: { submit, isLoading, error }
  ```

- [ ] **useWebSocket.ts** - Hook for WebSocket connection
  ```typescript
  // Manages: connection, message handling, clarifications
  // Returns: { isConnected, questions, progress, document }
  ```

- [ ] **usePRDRequest.ts** - Hook for fetching PRD request
  ```typescript
  // Manages: fetching request by ID, polling status
  // Returns: { request, loading, error, refresh }
  ```

#### 2. React Components (ONE responsibility per component)
**Location:** `src/presentation/components/`

- [ ] **PRDForm.tsx** - Input form component
  ```typescript
  // Props: { onSubmit: (data) => void }
  // Responsibility: Collect title, description, priority
  ```

- [ ] **ClarificationDialog.tsx** - Clarification questions UI
  ```typescript
  // Props: { questions: string[], onSubmit: (answers) => void }
  // Responsibility: Display questions and collect answers
  ```

- [ ] **PRDDocumentViewer.tsx** - Display generated PRD
  ```typescript
  // Props: { document: PRDDocument, onDownload: () => void }
  // Responsibility: Render sections, show download button
  ```

- [ ] **ProgressIndicator.tsx** - Show generation progress
  ```typescript
  // Props: { progress: number, status: string }
  // Responsibility: Visual progress bar and status
  ```

- [ ] **ErrorDisplay.tsx** - Error UI
  ```typescript
  // Props: { error: string }
  // Responsibility: Display errors consistently
  ```

#### 3. Pages (Compose components)
**Location:** `src/presentation/pages/`

- [ ] **HomePage.tsx** - Main page with form and real-time updates
  ```typescript
  // Composes: PRDForm, ClarificationDialog, ProgressIndicator, PRDDocumentViewer
  // Uses: usePRDGeneration, useWebSocket hooks
  ```

#### 4. Main App Setup
**Location:** `src/`

- [ ] **App.tsx** - Root component
  ```typescript
  import { DIContainer } from './shared/DIContainer';
  import HomePage from './presentation/pages/HomePage';

  export default function App() {
    return <HomePage />;
  }
  ```

- [ ] **main.tsx** - Entry point
  ```typescript
  import React from 'react';
  import ReactDOM from 'react-dom/client';
  import App from './App';

  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
  ```

#### 5. Styling (Optional but Recommended)
- [ ] Install Tailwind CSS or use CSS modules
- [ ] Create consistent design system

#### 6. Environment & Build
- [x] `.env` configured (API_URL, WS_URL)
- [ ] Verify `vite.config.ts` settings
- [ ] Update `tsconfig.json` if needed

---

## How To Complete Implementation

### Step 1: Create Custom Hooks
Start with hooks in this order:
1. `useWebSocket.ts` - Foundation for real-time updates
2. `usePRDGeneration.ts` - Form submission logic
3. `usePRDRequest.ts` - Status polling if needed

### Step 2: Create Components (Bottom-Up)
1. Simple components first (ErrorDisplay, ProgressIndicator)
2. Complex components next (PRDForm, ClarificationDialog, PRDDocumentViewer)
3. Compose into HomePage

### Step 3: Wire Everything Together
1. Create App.tsx
2. Create main.tsx
3. Test WebSocket connection
4. Test full flow: Form → WebSocket → Clarifications → Document → Download

---

## Testing Checklist

- [ ] Form submission creates PRD request
- [ ] WebSocket connects successfully
- [ ] Real-time progress updates display
- [ ] Clarification dialog appears when server requests
- [ ] Clarification answers sent via WebSocket
- [ ] Final document displays correctly
- [ ] Download button works
- [ ] Error handling for failed requests
- [ ] Reconnection on WebSocket disconnect

---

## Key Architecture Principles Applied

✅ **Single Responsibility** - Each file has ONE job
✅ **Open/Closed** - Extend via interfaces, don't modify core
✅ **Liskov Substitution** - Repository interfaces are interchangeable
✅ **Interface Segregation** - Minimal, focused interfaces
✅ **Dependency Inversion** - Depend on abstractions (interfaces)

✅ **Clean Architecture Layers**:
- Domain (innermost) - Pure business logic
- Application - Use cases orchestrate domain
- Infrastructure - External adapters (API, WebSocket)
- Presentation - React UI, depends on all above

---

## Running the Application

```bash
# Install dependencies
npm install

# Start dev server (port 3000)
npm run dev

# Build for production
npm run build
```

Make sure `ai-prd-builder-vapor-server` is running on port 8080!