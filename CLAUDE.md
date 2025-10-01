# CLAUDE.md — AI PRD Builder Web Frontend Engineering Memory

> Engineering memory for AI assistants to enforce **SOLID**, **Clean Architecture**, and proper project structure in the TypeScript/React frontend.

---

## 0) How to use this with Claude

You are the repository's Engineering Memory. Enforce the rules below. When asked for code or reviews:
- Apply SOLID and Clean Architecture strictly
- Preserve the src/ folder structure (domain/application/infrastructure/presentation)
- Refuse "quick hacks" that violate dependency rules; propose compliant alternatives
- Always output: (a) what changed, (b) why it follows the rules, (c) test impact
- If the user asks to break a rule, warn once and suggest a compliant path

---

## 1) SOLID Principles — TypeScript/React Context

### S — Single Responsibility
**Principle:** A module/class/component should have exactly one reason to change.
**Heuristics:** Name explains purpose in ≤ 5 words; component ≤ 200 lines; one primary concern.
**Smells to flag:** "Utils", "Helpers" grab-bags; components mixing business logic + UI; hooks doing too much.
**React-specific:** Avoid massive components; extract hooks for logic; separate presentational from container components.
**Refactor moves:** Extract custom hook; split component; move logic to service/use case.

### O — Open/Closed
**Principle:** Open to extension, closed to modification.
**Heuristics:** New behavior via new components/hooks, not by editing stable code.
**Smells:** Switch/case on type scattered around; editing a core component every time a variant appears.
**React-specific:** Use render props, higher-order components, or composition for variations.
**Refactor:** Strategy pattern, compound components, polymorphic components.

### L — Liskov Substitution
**Principle:** Subtypes must be usable anywhere their base type is expected.
**Heuristics:** Component props should not break when substituting implementations.
**Smells:** Props that are sometimes ignored; conditional logic based on component type.
**React-specific:** Avoid prop drilling; use composition over prop inheritance.
**Refactor:** Use discriminated unions for props; prefer context or composition.

### I — Interface Segregation
**Principle:** Many focused interfaces > one fat interface.
**Heuristics:** Components/hooks receive only props/params they need.
**Smells:** Components accepting 15+ props; hooks with complex option objects.
**React-specific:** Split large prop types; use prop spreading judiciously.
**Refactor:** Extract smaller interfaces; create specialized components/hooks.

### D — Dependency Inversion
**Principle:** High-level policy depends on abstractions, not concretes.
**Heuristics:** Domain/application own interfaces; infrastructure implements them.
**Smells:** Components directly importing fetch/axios; business logic calling APIs directly.
**React-specific:** Define repository interfaces in domain; implement in infrastructure; inject via context/DI.
**Refactor:** Create repository interfaces; inject implementations; use dependency injection.

---

## 2) Clean Architecture — React Project Structure

### Current Architecture Layers

```
src/
├─ domain/                    # Pure business rules (framework-agnostic)
│  ├─ entities/              # Core business objects (TypeScript types/classes)
│  ├─ valueObjects/          # Immutable value types
│  ├─ repositories/          # Repository interfaces (IPRDRepository, etc.)
│  └─ services/              # Domain service interfaces
├─ application/              # Use cases and application logic
│  ├─ useCases/              # Business workflows (e.g., GeneratePRD)
│  ├─ services/              # Application services
│  └─ dtos/                  # Data transfer objects
├─ infrastructure/           # Implementations of domain interfaces
│  ├─ repositories/          # Repository implementations (HTTP clients)
│  ├─ services/              # External service adapters
│  └─ persistence/           # Local storage, IndexedDB, etc.
├─ presentation/             # React UI layer
│  ├─ components/            # React components (presentational + containers)
│  ├─ hooks/                 # Custom React hooks
│  ├─ pages/                 # Page-level components
│  ├─ contexts/              # React contexts for DI
│  └─ utils/                 # UI-specific utilities
└─ main.tsx                  # Application entry point & DI setup
```

### Dependency Rules

**Golden Rule:** Source code dependencies point **inward**. Data flows both ways via **interfaces** and **DTOs**.

1. **Domain** depends on **nothing** (pure TypeScript)
2. **Application** depends only on **Domain**
3. **Infrastructure** depends on **Domain** and **Application** (implements interfaces)
4. **Presentation** depends on **Application** (calls use cases via hooks)
5. **main.tsx** wires everything together (composition root)

### Interfaces & Implementations Naming

- **Interfaces (domain/repositories/):** `IPRDRepository`, `IProviderService`, `IWebSocketClient`
- **Implementations (infrastructure/):** `PRDHttpRepository`, `ProviderHttpService`, `VaporWebSocketClient`

### DTOs & Mappers

- Use plain TypeScript types for DTOs
- Map at boundaries: API↔DTO (infrastructure), DTO↔Entity (application), Component↔ViewModel (presentation)
- Keep domain entities framework-agnostic (no React/Axios types)

### Testing Strategy

- **Unit** (70–80%): Domain logic, use cases, and pure functions (Jest/Vitest)
- **Component** (10–15%): React components with mocked dependencies (React Testing Library)
- **Integration** (10–15%): Repository implementations with API mocks (MSW)
- **E2E** (thin): Critical user workflows (Playwright/Cypress)

### Review Checklist (must pass)

- [ ] Domain contains no React, Axios, or framework-specific imports
- [ ] Use cases depend only on domain interfaces
- [ ] Components delegate business logic to use cases via hooks
- [ ] Repositories are injected via context/DI, not imported directly
- [ ] Tests follow the pyramid; no API calls in unit tests
- [ ] Components are typed with proper TypeScript interfaces

---

## 3) React/TypeScript Conventions

### Component Best Practices

**❌ Bad:** Business logic in component
```tsx
function PRDPage() {
  const [prd, setPRD] = useState<PRD | null>(null);

  const handleGenerate = async () => {
    // ❌ Business logic here
    const response = await fetch('/api/prd', { method: 'POST', ... });
    const data = await response.json();
    setPRD(data);
  };

  return <button onClick={handleGenerate}>Generate</button>;
}
```

**✅ Good:** Delegate to use case via hook
```tsx
function PRDPage() {
  const { generatePRD, isLoading } = useGeneratePRD();

  const handleGenerate = async (config: PRDConfig) => {
    await generatePRD(config);
  };

  return <PRDForm onSubmit={handleGenerate} isLoading={isLoading} />;
}

// Custom hook delegates to use case
function useGeneratePRD() {
  const repository = useContext(PRDRepositoryContext);
  const generateUseCase = useMemo(() => new GeneratePRDUseCase(repository), [repository]);

  return {
    generatePRD: (config) => generateUseCase.execute(config),
    isLoading: /* state management */
  };
}
```

### Dependency Injection via Context

```tsx
// 1. Define interface in domain
export interface IPRDRepository {
  generate(config: PRDConfig): Promise<PRDDocument>;
  fetchStatus(id: string): Promise<PRDStatus>;
}

// 2. Create context in presentation
const PRDRepositoryContext = createContext<IPRDRepository | null>(null);

// 3. Provide implementation in main.tsx
function App() {
  const repository = useMemo(() => new PRDHttpRepository('/api'), []);

  return (
    <PRDRepositoryContext.Provider value={repository}>
      <HomePage />
    </PRDRepositoryContext.Provider>
  );
}

// 4. Consume in hooks
function usePRDRepository() {
  const repository = useContext(PRDRepositoryContext);
  if (!repository) throw new Error('PRDRepository not provided');
  return repository;
}
```

### Custom Hooks for Use Cases

```tsx
// application/useCases/GeneratePRDUseCase.ts
export class GeneratePRDUseCase {
  constructor(private readonly repository: IPRDRepository) {}

  async execute(config: PRDConfig): Promise<PRDDocument> {
    // Business logic here
    return this.repository.generate(config);
  }
}

// presentation/hooks/useGeneratePRD.ts
export function useGeneratePRD() {
  const repository = usePRDRepository();
  const [state, setState] = useState<UseCaseState>({ status: 'idle' });

  const execute = useCallback(async (config: PRDConfig) => {
    setState({ status: 'loading' });
    try {
      const useCase = new GeneratePRDUseCase(repository);
      const result = await useCase.execute(config);
      setState({ status: 'success', data: result });
    } catch (error) {
      setState({ status: 'error', error });
    }
  }, [repository]);

  return { execute, ...state };
}
```

---

## 4) TypeScript Best Practices

### Strict Type Safety

```tsx
// ✅ Good: Strongly typed with discriminated unions
type RequestState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: Error };

function usePRDState() {
  const [state, setState] = useState<RequestState<PRD>>({ status: 'idle' });

  // Type-safe access
  if (state.status === 'success') {
    console.log(state.data); // ✅ TypeScript knows data exists
  }
}

// ❌ Avoid: Loose types
const [data, setData] = useState<any>(null);
const [loading, setLoading] = useState(false);
const [error, setError] = useState<Error | null>(null);
```

### Interface Segregation

```tsx
// ✅ Good: Focused interfaces
interface PRDFormProps {
  onSubmit: (config: PRDConfig) => void;
  isLoading: boolean;
}

interface ProviderSelectorProps {
  providers: Provider[];
  selected: string;
  onChange: (id: string) => void;
}

// ❌ Avoid: God interfaces
interface PRDPageProps {
  providers: Provider[];
  config: PRDConfig;
  onConfigChange: (config: PRDConfig) => void;
  onSubmit: () => void;
  isLoading: boolean;
  error: Error | null;
  // ... 10+ more props
}
```

---

## 5) Thinking Modes

### Core Thinking Flags

- **--think**: Multi-file analysis with context awareness (4K tokens)
  - Activates deeper analysis across multiple files
  - Considers interdependencies and broader context
  - Ideal for feature implementation and moderate complexity tasks

- **--think-hard**: Deep architectural analysis (10K tokens)
  - Comprehensive system-wide analysis
  - Evaluates architectural patterns and design decisions
  - Explores multiple solution paths with trade-offs
  - Best for complex refactoring and system design

- **--ultrathink**: Critical system redesign (32K tokens)
  - Maximum depth analysis for critical decisions
  - Complete architectural exploration
  - Reserved for major system changes and critical problem-solving

### Auto-Activation Triggers

Automatically activate thinking modes when detecting:
- Multi-file dependencies → --think
- Architectural decisions → --think-hard
- System-wide changes → --ultrathink
- Complex state management → --think-hard
- Security analysis → --ultrathink
- Performance optimization → --think-hard

---

## 6) Quick Prompts

- "Review this component against Clean Architecture; list dependency violations"
- "Refactor this component to delegate to a use case"
- "Extract this API logic to a repository in infrastructure"
- "Create a custom hook for this business logic"
- "Write tests for this use case with mocked repositories"

---

## 7) Opinionated Stances

- **Do not** call APIs directly from components; use repositories
- **Prefer composition** over prop drilling; use context sparingly
- **Keep components focused**; if it needs scrolling, extract smaller pieces
- **No "god" hooks or utility files**; create focused, single-purpose modules
- **Async operations are use cases**; wrap them properly
- **Use TypeScript strictly**; avoid `any`, prefer `unknown` when needed

---

> If any code conflicts with this file, prefer **CLAUDE.md** and open an ADR to explain exceptions.
