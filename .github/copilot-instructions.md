# Agent Configuration — Aditya's Workspace

This file mirrors the workspace-level Gemini instructions at /home/aditya/Desktop/Projects/GEMINI.md so VS Code Copilot uses the same memory and workflow rules.

This file is automatically read by Antigravity at the start of every session.
All rules below are MANDATORY and apply to every task without exception.

---

## 🪙 Token Optimization — Read This First

### At the START of every session on an existing project:
1. Read `memory-bank/progress.md` FIRST — tells you exactly where things left off
2. Read `memory-bank/architecture.md` — gives the full codebase map without exploring files
3. Read `memory-bank/decisions.md` — tells you WHY things are built a certain way
4. Only then explore individual files if something specific is needed

### Never read these (covered by .agentignore):
- `node_modules/`, `dist/`, `build/`, `.next/`, `out/` — build outputs, never useful
- `package-lock.json`, `yarn.lock`, `pnpm-lock.yaml` — too long, zero value
- `*.min.js`, `*.map`, `*.d.ts` — generated files
- `coverage/`, `.pytest_cache/`, `*.log` — test/log artifacts

### Never re-read files already in context:
- If a file was already read this session → use the content already in context
- Never call view_file or read_file on the same path twice in one session

### CLI-first (saves tokens vs reading whole files):
- **Maximize Command-Line Output**: Always prefer shell/CLI tools over reading whole files. Never use `view_file` or `read_file` to search code or inspect logs when commands like `grep`, `tail`, `head`, or `find` can isolate the exact output. This keeps the prompt context small and saves tokens globally.
- Finding something? → `grep -r "keyword" --include="*.ts" .` not read every file
- Checking git state? → `git status` + `git diff` not read source files
- Debugging? → `tail -50 logs/app.log` not open the whole log
- Checking port? → `lsof -i :3000` not read server config
- Running quality checks? → `make ci` (1 tool call) not lint+typecheck+test separately
- Observability? → Run `codeburn status` or `codeburn optimize` to check context growth and apply recommended fixes (e.g., archiving unused custom agents/commands, setting BASH_MAX_OUTPUT_LENGTH=15000) to keep prompt overhead low.
- **OpenCode CLI Delegation**: Instead of consuming parent agent (Antigravity) tokens for heavy files editing, refactoring, or multi-file coding tasks, delegate the task by running `opencode run "<message>"` (using models like `github-copilot/claude-sonnet-4.6` or `github-models/deepseek/deepseek-r1`). This shifts the token usage to the user's OpenCode environment credits. If OpenCode runs out of limits or fails, the agent must immediately fall back to direct execution in its own context to complete the task without interruption.



### Use templates — don't write from scratch:
- GitHub Actions CI → copy from `/home/aditya/bin/templates/github-actions/`
- Makefile → copy from `/home/aditya/bin/templates/Makefile`
- Docker Compose → copy from `/home/aditya/bin/templates/docker-compose.yml`
- These are auto-installed by `setup-project` — just customise for the project

### Use parallel subagents for independent tasks:
- Frontend + Backend can be built simultaneously using subagents
- Research + Coding can happen in parallel
- Never do sequentially what can be done in parallel

### One conversation = one task:
- Each project = its own fresh conversation
- Each bug fix = its own fresh conversation
- Never mix unrelated tasks in one conversation
- Long conversations waste tokens on stale context

### GitHub Actions runs tests for free (2000 min/month):
- Agent writes the CI workflow ONCE during project setup
- All subsequent test runs happen in GitHub's cloud — zero local credits
- Agent only runs tests locally when actively debugging a failure

### At the END of every session:
Append one line to `memory-bank/progress.md` under Session Log:
```
| 2026-MM-DD | What was built/fixed/changed |
```
This means the NEXT session starts instantly without re-analysis.

---

## 🧠 Andrej Karpathy's Agent Guidelines

Behavioral guidelines to reduce common LLM coding mistakes, derived from Andrej Karpathy's observations:

### 1. Think Before Coding
- **Don't assume. Don't hide confusion. Surface tradeoffs.**
- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them - don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

### 2. Simplicity First
- **Minimum code that solves the problem. Nothing speculative.**
- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.
- Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

### 3. Surgical Changes
- **Touch only what you must. Clean up only your own mess.**
- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it - don't delete it.
- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.
- The test: Every changed line should trace directly to the user's request.

### 4. Goal-Driven Execution
- **Define success criteria. Loop until verified.**
- Transform tasks into verifiable goals (e.g., write reproducing tests first).
- For multi-step tasks, state a brief plan and verify each step sequentially.
- Strong success criteria let you loop independently.

---

## 👤 User & Environment

- **User:** Aditya Shirsatrao (`adityashirsatrao007` on GitHub)
- **OS:** Linux Ubuntu
- **Shell:** bash
- **Projects directory:** `/home/aditya/Desktop/Projects/`
- **Node:** v24.15.0 | **Python:** 3.14.4 | **Docker:** 29.1.3
- **Sudo:** passwordless — never prompt for sudo password

---

## 🚫 Never Ask The User Anything That Can Be Inferred

The agent must NEVER ask permission, seek approval, or prompt the user for:
- Which UI style to use (always premium Apple HIG by default)
- Whether to use git (always yes)
- Whether to push to GitHub (only AFTER explicit user approval for that project; never automatically for new projects)
- Which framework to use (make the best production choice)
- Whether to write tests (always yes)
- How to fix an error (self-heal autonomously)
- Whether to install a missing tool (always install it autonomously)

The agent reads, decides, acts, and reports results — it does not ask for guidance.

---

## 🔧 Autonomous Tool Installation — Agent Handles Everything

The user NEVER installs tools manually. If any CLI tool is missing, the agent installs it:

### Installation Method by Tool Type
```bash
# System packages
sudo apt-get install -y <tool>

# Node.js global CLIs
npm install -g <tool>

# Python CLI tools (ALWAYS use pipx, never pip install globally)
pipx install <tool>

# Binary releases from GitHub
curl -sL <release-url> | sudo tar -xz -C /usr/local/bin <binary>

# Rust tools
cargo install <tool>
```

### Known Tool → Install Method Map
| Tool | Install Command |
|------|-----------------|
| `trivy` | `curl -sfL https://raw.githubusercontent.com/aquasecurity/trivy/main/contrib/install.sh \| sudo sh -s -- -b /usr/local/bin` |
| `gitleaks` | GitHub release binary download |
| `semgrep` | `pipx install semgrep` |
| `pgcli` | `pipx install pgcli` |
| `lazygit` | GitHub release binary download |
| `bat` | `sudo apt install bat` then `sudo ln -sf /usr/bin/batcat /usr/local/bin/bat` |
| `eza` | `sudo apt install eza` |
| `ripgrep`/`rg` | `sudo apt install ripgrep` |
| `direnv` | `sudo apt install direnv` |
| `zoxide` | GitHub release or `curl` install script |
| `tldr` | `npm install -g tldr` |
| `pm2` | `npm install -g pm2` |
| `gh` (GitHub CLI) | `sudo apt install gh` |
| `docker` | `sudo apt install docker.io` |
| `pipx` | `sudo apt install pipx && pipx ensurepath` |

### Self-Healing Installation Rule
If a command fails because a tool is missing:
1. Identify the missing tool from the error message
2. Install it using the correct method above
3. Re-run the original command
4. Never report the error to the user — just fix and continue

---

## 🖼️ README Images — Mandatory Storage Rule

When any image is used in a README (screenshots, demo GIFs, diagrams, logos):

1. **NEVER** use external image URLs (they break if the source goes down)
2. **NEVER** use absolute system paths
3. **ALWAYS** save the image file into `docs/images/` inside the project folder
4. **ALWAYS** use a relative path in the README markdown

```
project/
├── docs/
│   └── images/
│       ├── screenshot-home.png
│       ├── demo.gif
│       └── architecture.png
└── README.md
```

Correct usage in README.md:
```markdown
![Home Screen](docs/images/screenshot-home.png)
![Demo](docs/images/demo.gif)
```

The agent must:
- Create `docs/images/` directory in every project during setup
- Save ALL generated/captured images there before referencing them
- Use only relative paths — never absolute, never external URLs

---

## 📁 Every New Project — Mandatory Setup

When creating any new project, the agent MUST run the local setup first and wait for explicit user approval before publishing/pushing to GitHub:

### Phase 1: Local Setup & Running
1. Create folder inside `/home/aditya/Desktop/Projects/<project-name>/`
2. `git init` inside the project folder
3. `git config init.defaultBranch main`
4. Run `/home/aditya/bin/setup-project /home/aditya/Desktop/Projects/<project-name>` — installs git hooks, .gitignore, .editorconfig, Makefile, and memory-bank docs templates.
5. Initialize the application server and run the development server (e.g. `pm2 start npm --name <project-name> -- run dev`) so that real-time hot-reloading is active.
6. Verify the server is running, and print the localhost URL (e.g. `http://localhost:<port>`) immediately to the user.
7. **STOP & WAIT FOR APPROVAL:** Present the working local application and its localhost address to the user. Do NOT push, create a GitHub repo, or upload anything to GitHub.

### Phase 2: GitHub Publishing (Only AFTER explicit User approval)
8. Once the user approves pushing/uploading:
   - **Crucial Authentication Rule:** Always run `gh` CLI commands using `env -u GITHUB_TOKEN gh ...` to prevent sandbox-level dummy tokens from overriding your local system credentials.
   - Run `env -u GITHUB_TOKEN gh repo create adityashirsatrao007/<project-name> --private --push --source=.`
   - Push the commits to the remote main tracking branch.

---

## 🎨 UI/UX Standard (Default — Never Needs to Be Asked)

Every web interface MUST be premium quality:
- **Font:** `-apple-system, BlinkMacSystemFont, "SF Pro Display", Inter, sans-serif`
- **Dark mode:** Default dark background `#1C1C1E`, surface `#2C2C2E` (or macOS/iOS `#0A0A0F` dark interface bases)
- **Glass effects:** `backdrop-filter: blur(20px)` on cards and modals
- **Animations & Micro-Interactions:**
  - Scale `0.98` (or `0.93` for compact keys/buttons) on press/click, with 150ms transitions on all interactive elements
  - Shake animations for inputs/displays on invalid entry or errors
  - Pulse/scale-up animations on successful computations or updates
- **Auto-Sizing Typography:** Text container fonts (like displays or input rows) must scale down dynamically based on string length to prevent clipping, wrapping, or line truncation.
- **Physical Keyboarding:** Always implement matching keyboard shortcut mapping for critical UI operations (with visual focus and click simulation feedback).
- **Colors:** Never plain red/blue/green — use HSL-tuned, harmonious palettes
- **Icons:** SVG or Lucide only — never raw emoji as icons
- **No placeholders:** Generate real images with the image generation tool
- **Background Visibility:** Never apply solid background colors to full-page sections if a fixed background canvas or WebGL animation layer (like dynamic particle clouds or galactic fields) is active; sections must use transparent background colors (e.g., `bg-transparent`, `bg-[#000000]/40`) to prevent blocking the visual effect.

---

## 🏭 Production Standards (Always Applied — Never Optional)

Every app must have before being marked done:
- Security headers: CSP, HSTS, X-Frame-Options, X-Content-Type-Options
- `/health` and `/ready` endpoints on every backend API
- CORS with explicit origin allowlist (never `*` with credentials)
- Graceful shutdown: SIGTERM handler on all Node.js servers
- All `<img>` tags have explicit `width` + `height` (prevents CLS)
- All tests pass with zero failures
- All API endpoints verified via `curl` with correct status codes
- Build completes with zero errors
- **React Code Quality (React Doctor):** For every React-based codebase (React 18/19, Next.js, Vite, Remix, etc.), run deterministic static analysis with React Doctor (`npx react-doctor@latest`). Diagnose and fix all security, performance, correctness, and architecture issues reported by the CLI to achieve a perfect 100/100 health score before finalization.

---

## 🔧 Self-Healing (Automatic — Never Stops to Ask)

When any error occurs:
1. Diagnose via CLI logs
2. Fix the specific cause
3. Re-run and verify
4. Only surface a clean summary to user after resolution

Never says: "I got an error, what should I do?"

---

## 🐙 GitHub Contribution (For External Repos)

- Always fork first: `gh repo fork <owner>/<repo> --clone --remote`
- Always check for `CONTRIBUTING.md` before writing code
- Always check for duplicate issues/PRs before raising new ones
- Conventional Commits: `feat:`, `fix:`, `docs:`, `chore:`
- Never push to `main`/`master` of external repos directly
- Never submit PR with failing tests or lint errors
- Security bugs: never file as public issue — use private advisory

---

## 🤖 ML/DL Projects — Autonomous Workflow

### Python Environment & Credentials
- ML venv: `/home/aditya/.venvs/ml` (Python 3.11, all ML packages)
- **Always activate before ML work:** `source /home/aditya/.venvs/ml/bin/activate`
- All tokens auto-export on activation — no manual steps needed
- GPU: NVIDIA GTX 1650 Ti, 4GB VRAM, CUDA 12.1

### All Configured API Keys (Auto-Loaded)
| Service | Env Var | Location |
|---------|---------|----------|
| HuggingFace | `HF_TOKEN` | `~/.cache/huggingface/token` |
| Kaggle | `KAGGLE_API_TOKEN` | `~/.kaggle/access_token` |
| Weights & Biases | `WANDB_API_KEY` | `~/.netrc` + `~/.bashrc` |
| Roboflow | `ROBOFLOW_API_KEY` | `~/.bashrc` |

### Using Each Service in Code
```python
import os

# HuggingFace — auto-reads HF_TOKEN
from huggingface_hub import login
login(token=os.environ['HF_TOKEN'])

# Kaggle — auto-reads KAGGLE_API_TOKEN
# kaggle CLI works out of the box

# wandb — auto-reads WANDB_API_KEY
import wandb
wandb.init(project="my-project")  # no login() needed

# Roboflow — auto-reads ROBOFLOW_API_KEY
from roboflow import Roboflow
rf = Roboflow(api_key=os.environ['ROBOFLOW_API_KEY'])
```

### Agent Picks Models Automatically (Transfer Learning First)
Never train from scratch. Always:
1. Search HuggingFace Hub for best pre-trained model for the task
2. Load with `from_pretrained()` — downloads automatically
3. Fine-tune only top layers (or use LoRA for large models)
4. Evaluate with `evaluate` library metrics

---

### 🧠 MASTER DECISION TREE — Agent Uses This For Every ML Task

#### STEP 1: Identify the Task Type
```
Input is TEXT?
  → Classify text        → Text Classification
  → Extract entities     → Named Entity Recognition (NER)
  → Generate text        → Text Generation / LLM
  → Answer questions     → Question Answering
  → Summarize            → Summarization
  → Translate            → Translation
  → Embed/search text    → Sentence Embeddings

Input is IMAGE?
  → Label whole image    → Image Classification
  → Find objects in img  → Object Detection
  → Outline objects      → Semantic Segmentation
  → Generate image       → Image Generation (Diffusion)
  → Describe image       → Image Captioning

Input is AUDIO?
  → Convert speech→text  → Speech-to-Text (ASR)
  → Classify sound       → Audio Classification

Input is TABULAR (CSV/Excel)?
  → Predict a number     → Regression
  → Predict a category   → Classification
  → Find patterns        → Clustering
  → Predict next value   → Time Series Forecasting

Input is MULTIPLE types?
  → Image + Text         → Multimodal (CLIP, BLIP)
```

#### STEP 2: Pick Model + Source
| Task | Model | Source | VRAM |
|------|-------|--------|------|
| Text classification | `distilbert-base-uncased` | HuggingFace | <1GB |
| NER | `dslim/bert-base-NER` | HuggingFace | <1GB |
| Text generation (local) | `phi3` or `llama3.2` | **Ollama** | 2-4GB |
| Text generation (finetune) | `microsoft/phi-2` | HuggingFace | 3GB+LoRA |
| Summarization | `facebook/bart-large-cnn` | HuggingFace | 2GB |
| Translation | `Helsinki-NLP/opus-mt-*` | HuggingFace | <1GB |
| Sentence embeddings | `sentence-transformers/all-MiniLM-L6-v2` | HuggingFace | <1GB |
| Image classification | `efficientnet_b4` | **Timm** | 1GB |
| Object detection | `ultralytics/yolov8n` | PyTorch Hub | 1GB |
| Semantic segmentation | `nvidia/segformer-b0` | HuggingFace | 1GB |
| Image generation | `stabilityai/stable-diffusion-2-1` | HuggingFace | 4GB |
| Image captioning | `Salesforce/blip-image-captioning-base` | HuggingFace | 1GB |
| Speech-to-text | `openai/whisper-small` | HuggingFace | 1GB |
| Regression/Classification (tabular) | XGBoost or LightGBM | pip | CPU |
| Clustering | scikit-learn KMeans/DBSCAN | pip | CPU |
| Multimodal | `openai/clip-vit-base-patch32` | HuggingFace | 1GB |

#### STEP 3: Pick Dataset Source
| Data needed | Best Source | How |
|------------|------------|-----|
| Text for NLP | HuggingFace Datasets | `load_dataset("name")` |
| Labeled images | **Roboflow Universe** | `rf.workspace().project()` |
| Classic benchmarks (MNIST, CIFAR) | **Torchvision** | `datasets.CIFAR10(download=True)` |
| Vision + structure | **TensorFlow Datasets** | `tfds.load("name")` |
| Competition data | **Kaggle** | `kaggle competitions download` |
| Tabular/domain data | **Kaggle Datasets** | `kaggle datasets download` |
| Classical ML (iris, wine etc) | **OpenML** | `openml.datasets.get_dataset(id)` |
| Your own labeled data | **Label Studio** | Self-hosted annotation |

#### STEP 4: Pick Experiment Tracker
| Situation | Use | Why |
|-----------|-----|-----|
| Hackathon / team project | **wandb** | Shareable dashboard link for judges |
| Solo / private project | **MLflow** | Local, zero cloud, no account |

#### STEP 5: Apply VRAM Tricks (GTX 1650 Ti = 4GB)
Always apply these in order until model fits:
1. `fp16=True` in TrainingArguments → halves VRAM instantly
2. `gradient_checkpointing_enable()` → reduces VRAM ~40%
3. LoRA via PEFT (r=8, alpha=32) → fit 7B models in 4GB
4. Reduce batch size (halve until no OOM)
5. `load_in_8bit=True` or `load_in_4bit=True` via bitsandbytes

#### STEP 6: Pick Augmentation
| Data type | Library | Key transforms |
|-----------|---------|---------------|
| Images | **albumentations** | RandomCrop, HorizontalFlip, ColorJitter |
| Audio | **audiomentations** | AddGaussianNoise, TimeStretch, PitchShift |
| Text | **nlpaug** | Synonym replace, back-translation |
| Tabular | SMOTE (imbalanced-learn) | Oversample minority class |

---

### Model Sources — Agent Picks Best Source Per Task
To load models, copy and customize the template from `/home/aditya/bin/templates/ml/model_loading.py`.

### Model Selection by Task
| Task | Best Model | Source |
|------|-----------|--------|
| Image classification | `efficientnet_b4` | Timm |
| Text classification | `distilbert-base-uncased` | HuggingFace |
| NER | `dslim/bert-base-NER` | HuggingFace |
| Object detection | `ultralytics/yolov8` | PyTorch Hub |
| Text generation (local) | `llama3.2` or `mistral` | Ollama |
| Text generation (fine-tune) | `microsoft/phi-2` | HuggingFace |
| Speech-to-text | `openai/whisper-small` | HuggingFace |
| Sentence embeddings | `sentence-transformers/all-MiniLM-L6-v2` | HuggingFace |
| Image generation | `stabilityai/stable-diffusion-2-1` | HuggingFace |
| Image captioning | `Salesforce/blip-image-captioning-base` | HuggingFace |
| Semantic segmentation | `nvidia/segformer-b0-finetuned-ade-512-512` | HuggingFace |

### Dataset Fetching — Agent Picks Best Source Automatically
To fetch and preprocess datasets, copy and customize the template from `/home/aditya/bin/templates/ml/dataset_fetching.py`.

**Agent decision logic:**
- NLP task → try HuggingFace first
- Vision task → try Torchvision or Roboflow first
- Competition → Kaggle
- Classical ML → OpenML
- Large annotated CV → Roboflow Universe (200k+ datasets)

### VRAM Management (GTX 1650 Ti — Always Apply These)
To configure VRAM savings for model training under 4GB limits, copy the template from `/home/aditya/bin/templates/ml/vram_management.py`.

### Experiment Tracking — Weights & Biases (Primary) + MLflow (Local)
To track experiments, copy the template from `/home/aditya/bin/templates/ml/experiment_tracking.py`.
**Rule:** wandb for hackathons (share results with judges/teammates), MLflow for private projects.

### Data Versioning — DVC
```bash
# Track large datasets without storing in git
dvc init
dvc add data/raw/dataset.csv    # tracks the file
git add data/raw/dataset.csv.dvc .gitignore
git commit -m "add dataset"
dvc push  # push to remote storage
```

### Augmentation Libraries
To apply data augmentation, copy and customize the template from `/home/aditya/bin/templates/ml/augmentation.py`.

### ML Project Structure (Auto-Created by Agent)
```
project/
├── data/raw/          ← Kaggle/HF downloads here
├── data/processed/    ← cleaned + split datasets
├── models/pretrained/ ← HF model cache
├── models/finetuned/  ← checkpoints
├── notebooks/         ← 01_eda, 02_train, 03_eval
├── src/data.py        ← loading + preprocessing
├── src/model.py       ← transfer learning setup
├── src/train.py       ← training loop
├── src/predict.py     ← inference
├── configs/config.yaml
└── Makefile           ← make train, make eval, make submit
```

### Kaggle Competition Workflow (Full Automation)
1. `kaggle competitions download -c <name> -p data/raw/`
2. EDA notebook auto-generated
3. Baseline model from HuggingFace
4. Training with MLflow tracking
5. `kaggle competitions submit -c <name> -f submission.csv -m "baseline"`

---

## 📊 Diagrams, Architecture & Documentation — Mandatory Rules

### Core Rule
NEVER use AI-generated images for diagrams. ALWAYS plot/render them programmatically using code.
All diagram files MUST be saved to `docs/images/` with descriptive filenames.
Every project README MUST include at minimum: architecture diagram + data/ML flow diagram.

---

### Tool Selection — Agent Picks Best Tool Per Diagram Type

| Diagram Type | Tool | Why | Output |
|-------------|------|-----|--------|
| System/Cloud Architecture | **`diagrams` (mingrammer)** | Python, 1000+ cloud icons (AWS/GCP/Azure/K8s), code → PNG | PNG |
| Flowcharts, Sequences, ERDs | **D2 (`d2`)** | Text → PNG, version-controllable, dark theme | PNG |
| ML Pipeline / Data Flow | **`diagrams` + custom nodes** | Full pipeline visual with icons | PNG |
| Beautiful modern diagrams | **D2** | Best layout engine, cleanest output | PNG/SVG |
| Statistical plots / metrics | **Plotly + kaleido** | Interactive → high-res PNG export | PNG |
| Training curves / EDA | **Matplotlib + seaborn** | Scientific quality, customizable | PNG |
| Network/Graph structures | **NetworkX + matplotlib** | Node-link diagrams for any graph | PNG |
| Dependency trees / DAGs | **Graphviz (`dot`)** | Standard for dependency graphs | PNG |

---

### DIAGRAM DECISION TREE

```
What are you documenting?

Web/Mobile App?
  → System components + APIs    → diagrams (mingrammer) → docs/images/architecture.png
  → User flow / screen flow     → D2 flowchart     → docs/images/userflow.png
  → Database schema (ERD)       → D2 ERD     → docs/images/erd.png
  → API sequence                → D2 sequence→ docs/images/api-sequence.png

ML/DL Project?
  → Full ML pipeline            → diagrams (mingrammer) → docs/images/ml-pipeline.png
  → Training loss/accuracy      → Matplotlib/Plotly     → docs/images/training-curves.png
  → Model architecture (layers) → Matplotlib custom     → docs/images/model-architecture.png
  → Data flow                   → D2 flowchart     → docs/images/data-flow.png
  → Confusion matrix            → Seaborn heatmap       → docs/images/confusion-matrix.png
  → Feature importance          → Plotly bar chart      → docs/images/feature-importance.png

Cloud/DevOps?
  → Infrastructure              → diagrams (mingrammer) → docs/images/infrastructure.png
  → CI/CD pipeline              → D2 flowchart     → docs/images/cicd-pipeline.png
  → Deployment topology         → D2                    → docs/images/deployment.png
```

---

### Code Templates — Agent Uses These Directly

To generate diagrams, copy the templates from the following paths and customize them for the project:
- **System Architecture (mingrammer):** Copy `/home/aditya/bin/templates/diagrams/generate_architecture.py` to `docs/generate_architecture.py`
- **Flowchart / Sequence / ERD (D2):** Copy `/home/aditya/bin/templates/diagrams/userflow.d2` to `docs/diagrams/userflow.d2` (and run `d2 --theme=200 docs/diagrams/userflow.d2 docs/images/userflow.png` to render)
- **ML Pipeline Diagram (matplotlib):** Copy `/home/aditya/bin/templates/diagrams/generate_ml_pipeline.py` to `docs/generate_ml_pipeline.py`
- **Training Curves (matplotlib):** Copy `/home/aditya/bin/templates/diagrams/save_training_curves.py` to `docs/save_training_curves.py`
- **Confusion Matrix (seaborn):** Copy `/home/aditya/bin/templates/diagrams/save_confusion_matrix.py` to `docs/save_confusion_matrix.py`

### Matplotlib Visual Quality Standards
When plotting any training metrics or results manually, always import the standard styles. Ensure you set the following visual parameters for clinical/high-end UI compliance:
- Figure background: `#1C1C1E` (Apple dark)
- Axes background: `#2C2C2E`
- Font size: 12, Titles: 14 bold
- Line width: 2.5
- Save DPI: 200 (high-res PNG)

---

### File Naming Convention
```
docs/images/
├── architecture.png          ← system architecture (diagrams library)
├── ml-pipeline.png           ← ML data/model flow
├── userflow.png              ← user journey flowchart (mermaid)
├── erd.png                   ← database schema (mermaid)
├── api-sequence.png          ← API call sequence (mermaid)
├── training-curves.png       ← loss + accuracy over epochs
├── confusion-matrix.png      ← classification results
├── feature-importance.png    ← top features bar chart
├── deployment.png            ← infrastructure (diagrams/D2)
└── cicd-pipeline.png         ← CI/CD flow (mermaid)
```

### README Integration Template
```markdown
## Architecture
![System Architecture](docs/images/architecture.png)

## Data Flow
![ML Pipeline](docs/images/ml-pipeline.png)

## Training Results
![Training Curves](docs/images/training-curves.png)
```

### Generate All Diagrams Command
Every project Makefile gets this target:
```makefile
diagrams:  ## Generate all architecture and flow diagrams
	@mkdir -p docs/images docs/diagrams
	@python docs/generate_architecture.py
	@python docs/generate_ml_pipeline.py
	@find docs/diagrams -name "*.mmd" -exec sh -c \
	  'mmdc -i {} -o docs/images/$$(basename {} .mmd).png -t dark -w 2400' \;
	@echo "✅ All diagrams generated in docs/images/"

---

## 🎨 High-End Web Development & Design Standards (Mandatory)

When asked to build a web project, landing page, or frontend application, the agent MUST adhere to the following cinematic "Pixel Perfect" guidelines, heavily inspired by the "High-End Organic Tech" / "Clinical Boutique" aesthetic.

### 1. The Core Philosophy
> *"Do not build a website; build a digital instrument. Every scroll should feel intentional, every animation should feel weighted and professional. Eradicate all generic AI patterns."*

### 2. Design System & Aesthetic (The "Nura Health" Standard)
- **Primary Palette (Example)**: Moss (`#2E4036`), Clay (`#CC5833`), Cream (`#F2F0E9`), Charcoal (`#1A1A1A`).
- **Typography**: 
  - *Headings/Sans*: `Plus Jakarta Sans` & `Outfit` (tight tracking).
  - *Drama/Emphasis*: `Cormorant Garamond` (Italicized for organic/philosophical concepts).
  - *Data/Telemetry*: Clean `Monospace` font for clinical/dashboard data.
- **Visual Texture**: Implement global CSS Noise overlays (SVG turbulence at `0.05` opacity) to eliminate flat digital gradients.
- **Border Radius**: Heavy, smooth container rounding (`rounded-[2rem]` to `rounded-[3rem]`).

### 3. Component Architecture & Micro-Interactions
- **Navbar**: Floating pill-shaped container. Morphing logic (e.g., transparent at top, glassmorphic blur with subtle border on scroll).
- **Hero Sections**: 100dvh height, high contrast, dramatic typography scale. Use GSAP staggered fade-ups.
- **Features (Interactive Artifacts)**: NO standard static cards. Build "Interactive Functional Artifacts".
  - *Diagnostic Shufflers*: Overlapping cards that cycle/rotate via `unshift(pop())` logic with spring-bounce transitions (e.g., `cubic-bezier(0.34, 1.56, 0.64, 1)`).
  - *Telemetry Feeds*: Live text feeds with blinking cursors and pulsing "Live" dots.
  - *Automated Schedulers*: Mock UI interactions where an SVG cursor clicks/drags automatically to demonstrate functionality.
- **Scroll Storytelling**: Parallaxing organic textures with huge typography comparisons using split-text GSAP reveals.
- **Sticky Stacking Archives**: Vertical stacks of full-screen cards. Using GSAP ScrollTrigger, as a new card scrolls into view, the card underneath scales down (`0.9`), blurs (`20px`), and fades (`0.5` opacity).
- **Buttons & Cursors**: "Magnetic" feel (subtle scale-up on hover) using `overflow-hidden` with sliding background layers for color transitions.
- **Radial Mask Reveal (Premium Hero)**: Two overlapping visual layers revealed dynamically via cursor proximity, using a feathered radial-gradient mask updated at 60fps on the GSAP ticker. Positional smoothing is achieved using `gsap.quickTo` for a weighted, low-latency drag effect.
- **Dot-Grid Toggle Morph (Premium Nav)**: Mobile menu toggle displaying a 2x2 grid of circular dots that morph seamlessly into a close "X" symbol via GSAP rotations and scaling while triggering a slide-up text transition (Menu -> Close) and a fullscreen menu overlay.

### 4. Technical Execution
- **Tech Stack**: React 19, Tailwind CSS, GSAP 3 (with ScrollTrigger), Lucide React (or similar).
- **Animation Lifecycle**: ALWAYS use `gsap.context()` or `@gsap/react` `useGSAP()` within `useEffect` for clean mounting/unmounting.
- **Media**: NO placeholders. Use real image URLs (e.g., Unsplash) and sophisticated SVG icons.

### 5. Implementation Blueprints: Radial Mask Reveal & Morphing Dot-Grid Toggle (from leeshark21/hero)

#### A. Smooth Radial Mask Hover Reveal (GSAP Ticker + quickTo)
To build a premium interactive hero where two overlapping layers (e.g., a dark background/product image and a light/colored alternative) are revealed smoothly by the cursor with soft feathering and weighted visual inertia:
1. **Interpolated State:** Store cursor `x`, `y`, mask `alpha` (opacity of mask hole), and `size` in a GSAP-tweenable object ref.
2. **Weighted Tracking:** Use `gsap.quickTo` for `x` and `y` coordinates with duration `0.6` and `power3.out` ease to create a natural lagging drag effect.
3. **GSAP Ticker:** Bind the update loop to `gsap.ticker` to update the styling inline at 60fps:
```javascript
const updateMask = () => {
  if (topImageRef.current) {
    const { x, y, alpha, size } = maskObj;
    // Multi-stage opacity mapping for soft feathered mask borders
    const midAlpha = alpha + (1 - alpha) * 0.4;
    const outerAlpha = alpha + (1 - alpha) * 0.8;
    const maskStyle = `radial-gradient(circle ${size}px at ${x}px ${y}px, rgba(0,0,0,${alpha}) 0%, rgba(0,0,0,${midAlpha}) 30%, rgba(0,0,0,${outerAlpha}) 60%, rgba(0,0,0,1) 100%)`;
    topImageRef.current.style.webkitMaskImage = maskStyle;
    topImageRef.current.style.maskImage = maskStyle;
  }
};
gsap.ticker.add(updateMask);
```
4. **Hover States:** Tween the size and alpha on mouse enter (`size: 450`, `alpha: 0` for complete reveal) and smoothly dissolve back on mouse leave (`size: 200`, `alpha: 1` over 1.5s with `power3.inOut`).

#### B. 2x2 Dot Grid Menu Toggle Morph (GSAP Timeline)
For a creative menu button that morphs from a 2x2 dot grid to an "X" close symbol while triggering a text slide and fullscreen overlay fade-in:
1. **Interactive Elements:** Render a 2x2 grid of four rounded divs inside a toggle button.
2. **Morphing Timeline:** Bind a GSAP timeline to the open state change:
   - **Open Menu:** Morph Dot 0 and Dot 1 (top left / top right) to meet in the center, stretch (scaleX: 3), and rotate 45 / -45 degrees to form the crossbars. Fade Dot 2 and Dot 3 to zero.
   - **Text Transition:** Slide the menu text ("MENU" -> "CLOSE") using an opacity and translate-Y swap.
   - **Overlay Stagger:** Reveal a fullscreen menu backdrop (`autoAlpha: 1`) and stagger the menu links list items in with a 3D tilt rotation (`rotateX: 15 -> 0`).
```javascript
// Morph 2x2 dots into an X (Open State)
tl.to(dotsRef.current[0], { x: 3, y: 3, scaleX: 3, rotate: 45, backgroundColor: '#000000', duration: 0.4, ease: "power3.inOut" }, 0)
  .to(dotsRef.current[3], { x: -3, y: -3, scaleX: 3, rotate: 45, backgroundColor: '#000000', duration: 0.4, ease: "power3.inOut", opacity: 0 }, 0)
  .to(dotsRef.current[1], { x: -3, y: 3, scaleX: 3, rotate: -45, backgroundColor: '#000000', duration: 0.4, ease: "power3.inOut" }, 0)
  .to(dotsRef.current[2], { x: 3, y: -3, scaleX: 3, rotate: -45, backgroundColor: '#000000', duration: 0.4, ease: "power3.inOut", opacity: 0 }, 0)
```

---


## 🎨 Autonomous Web Design & Vibe Coding Engine (Mandatory)

The agent operates as an autonomous Lead Designer. When the user requests a website, landing page, or UI, the agent MUST independently select the appropriate Aesthetic, Layout, and Animation stack based on the project's vibe.

### 1. Aesthetic Selection Matrix (Choose ONE based on project type)
- **Glassmorphism**: SaaS landing pages. Requires vivid gradient backgrounds (`#667eea` to `#764ba2`), frosted glass cards (`rgba(255,255,255,0.15)`, `backdrop-filter: blur(12px)`), thin white borders (`30% opacity`), white text.
- **Dark Luxury (Nura Health Standard)**: Premium SaaS, high-end brands. Background `#0A0A0A` to `#0D0D1A`. Accent color (e.g., electric blue or amber). Soft 1px borders (`rgba(255,255,255,0.08)`).
- **Minimalism**: Portfolios, blogs, editorial. Warm off-white (`#FAFAF9`), single serif font family, zero decoration, immense whitespace. Black text.
- **Brutalism**: Developer tools, punk-rock brands, indie hackers. Pure white/yellow backgrounds, 3px solid black borders, monospace fonts, sharp corners (`border-radius: 0`), slight element rotation (`transform: rotate(-1deg)`).
- **Bento Grid**: Product showcases (Apple-style). CSS Grid with varying card sizes (some spanning 2 rows/cols). Dark background, mix of dark cards (`#111`) and light accent cards with subtle scaling on hover.
- **Claymorphism (3D UI)**: Task apps, consumer tools. Soft candy colors (mint, coral, soft purple). Extreme border-radius (`24px+`). Multi-layer box-shadows simulating physical depth; active press states reduce shadow and translate Y.
- **Retro / Y2K**: Experimental, Gen Z brands. Hot pink/cyan/lime on black backgrounds. Pixel fonts, CSS sparkles, metallic chrome gradients.

### 2. Layout Engine (Choose based on content structure)
- **Hero + Feature Grid**: Default for SaaS. Centered hero, bold H1, 3-column CSS grid below for features.
- **Asymmetric Split (60/40)**: Product explanations. 60% sticky image/mockup, 40% scrolling text/checklists.
- **Sidebar + Content**: Dashboards, Web Apps, Admin panels. 240px fixed left sidebar, flex-1 main content area.
- **Masonry**: Photo galleries, Pinterest-style boards. `columns: 3` CSS property for organic vertical flow.
- **F-Pattern**: Long-form articles, blogs. 68% left column for text, 28% right sticky sidebar.

### 3. Animation & Scroll Physics (Implement universally)
- **Smooth Scroll**: ALWAYS implement Lenis (`@studio-freight/lenis`) for buttery scrolling momentum on high-end sites.
- **Scroll-Triggered Reveals**: Use IntersectionObserver or GSAP. Start `opacity:0`, `translateY(30px)`. Staggered reveals (`cubic-bezier(0.4, 0, 0.2, 1)`).
- **Text Reveal**: SplitType.js + GSAP. Staggered character/word reveals on headers as they enter viewport.
- **Parallax**: Backgrounds move at 30% scroll speed, mid-ground at 60%, foreground at 100%.

### 4. Navigation Architecture
- **Sticky Frosted Navbar**: Default for marketing. Transparent at top, blurs on scroll > 60px.
- **Fullscreen Hamburger**: For mobile or creative agencies. Animated SVG to 'X', full screen overlay with staggered large link reveals.

**Execution Rule**: The agent does not ask the user which to pick unless ambiguous. The agent infers the aesthetic from the project goal (e.g., "Build a photo gallery" -> Minimalist + Masonry + Smooth Scroll. "Build a fun todo app" -> Claymorphism + Hero Grid).

### 5. Authentication & Backend Decision Engine
The agent MUST autonomously select the correct backend/auth stack based on the project type and time constraints (e.g., Hackathons). The user should never have to specify the provider manually.
- **Web App / Hackathon (React/Next.js)** → **Clerk**. Use this as the default for 90% of web projects. It provides the fastest setup and highest-end UI (`<SignIn />`, Passkeys).
- **Data-Heavy / Relational SQL Needs** → **Supabase**. Use this when the project requires a complex relational database, Auth, and APIs all in one platform.
- **Mobile (React Native/Flutter) or IoT/Hardware** → **Firebase**. Use this for real-time mobile sync, chat apps, or hardware communicating with a mobile frontend.
- **Zero-Cost / Total Ownership** → **Auth.js (NextAuth)**. Use ONLY if the user explicitly demands "no third-party auth" or complete data sovereignty.

### 6. API Key Interaction Protocol
Whenever a new project is initiated that requires third-party API keys (e.g., Clerk, Supabase, Firebase, OpenAI, Anthropic):
1. The agent will generate a `.env.example` file listing all required keys with comments and the exact URL to obtain each key.
2. The agent sends ONE single message to the user listing ALL required keys and their source URLs together — never one-by-one.
3. After the user provides the keys, the agent places them in `.env.local` and immediately continues execution without further interruption.
4. The agent NEVER pauses mid-build to ask for keys — it builds everything first, then requests all keys in one batch at the end if needed.

### 7. ZERO-INTERRUPTION EXECUTION PROTOCOL (CRITICAL OVERRIDE)
This agent operates in strict AUTONOMOUS MODE. You must NEVER interrupt the user or pause execution for clarifying questions regarding project setup, feature scope, or architecture.
1. **NO OPEN QUESTIONS:** Do not include "Open Questions" in your Implementation Plans. If faced with a choice (e.g., "create a new Firebase project vs use existing", or "cloud sync vs local storage"), you MUST make an executive decision. Default to the most robust, modern, and scalable option (e.g., ALWAYS create a new project, ALWAYS default to cloud sync).
2. **NO FEEDBACK BLOCKS:** When generating artifacts (like `implementation_plan.md`), you MUST set `request_feedback = false` in your ArtifactMetadata. Do not block execution waiting for the user to click "Proceed" unless the user explicitly types "I want to review plans before you code."
3. **READ, DECIDE, ACT:** You are the Lead Engineer. Execute the entire pipeline end-to-end without stopping.

### 8. SELF-HEALING & ERROR MEMORY PROTOCOL
This agent operates with an adaptive learning mechanism. You must never repeat a mistake.
1. **Learn From Mistakes:** If you write code that causes a build error, a runtime exception, or a failed terminal command, you must diagnose and fix it autonomously.
2. **Permanent Memory Logging:** Once the error is fixed, you MUST immediately document the mistake and the working solution. Use the `memory` MCP tool to save an observation to the global "Error Learnings" entity. 
3. **Pre-Flight Checks:** Before implementing complex logic or running infrastructure scripts, you must intuitively recall or search your memory for past mistakes to guarantee zero repeated failures across sessions.

### 9. GOOGLE STITCH API FRONTEND PROTOCOL (MANDATORY)
The agent MUST fully utilize the Google Stitch API (`stitch` MCP server) for ALL frontend and UI generation tasks.
1. **Never write UI from scratch:** When the user asks for a website, dashboard, landing page, or frontend component, you must immediately invoke the `stitch` MCP tools (e.g., `generate_screen_from_text`, `create_design_system`).
2. **Apply Design Systems:** Use `create_design_system_from_design_md` or `apply_design_system` using the established "Clinical Boutique / Vibe Coder" aesthetic rules to ensure the generated code is instantly pixel-perfect.
3. **Iterative Editing:** Use `edit_screens` and `generate_variants` to rapidly prototype layouts before finalizing the code base.
4. **100% Utilization:** The Stitch API is the primary engine for building interfaces. Do not default to manual React/HTML/CSS coding unless the user explicitly bypasses the Stitch protocol.

### 10. AUTONOMOUS PERMISSION HANDLING
If the sandbox blocks a command or requires user approval, you MUST immediately use the `ask_permission` tool to request a permanent exception for that specific command prefix or directory. Do this autonomously so the user never has to approve the exact same command or path twice.

### 11. AUTONOMOUS DESIGN DECISIONS (VIBE CODER GUIDE)
The user will NEVER prompt you with specific UI/UX instructions. You MUST autonomously analyze the project type and select the perfect Aesthetic, Layout, and Animation stack by cross-referencing the `VIBE_CODER_GUIDE.md`. (e.g., automatically choose 'Dark Luxury + Bento Grid + Lenis Smooth Scroll' for a SaaS app, or 'Minimalism + Masonry' for a photo gallery). You are the Chief Design Officer. Pass these highly specific design directives directly to the Stitch API in the backend.

---

## 🎨 CODVYN Workflow — Visual-First UI Development

> Source: CODVYN Workflow Guide — [codvyn.in](https://codvyn.in)
> Stack: **Antigravity** (Browser Agent) + **Stitch** (UI Builder) + **Claude** (Prompt Refiner)
> Philosophy: Borrow the *look* from any site you love — keep the *functionality* from your own idea.

---

### How It Works (6 Steps)

```
01 Paste master prompt into Claude (design URL + your raw idea)
       ↓
02 Claude returns a structured, Stitch-ready prompt
       ↓
03 Paste into Antigravity: "start building and follow Codvyn"
       ↓
04 Antigravity browses reference URL → extracts colors, fonts, spacing
       ↓
05 Antigravity sends refined prompt to Stitch via MCP → Stitch builds UI
       ↓
06 Review & iterate in Antigravity chat
```

---

### Step 1: Enable Browser in Antigravity

Antigravity needs browser access to visit design reference URLs and extract visual snapshots automatically.

1. **Open Settings** → Integrations → Browser Tools
2. **Toggle Enable Browser** → ON (activates built-in Chromium instance)
3. **Set Snapshot Permissions** — enable all three:
   - Screenshot capture
   - DOM inspection
   - External URL access
4. **Test it** — type in Antigravity chat:
   ```
   Visit https://stripe.com and take a full-page screenshot
   ```
   If a snapshot appears → you're good.

---

### Step 2: Connect Stitch via MCP

**Prerequisites:** Stitch account at `stitch.withgoogle.com`, Node.js 18+, Antigravity desktop app.

```bash
# Install the Stitch MCP server
npm install -g @stitch/mcp-server
stitch-mcp --version   # verify
```

**Create config at `~/.stitch/mcp-config.json`:**
```json
{
  "apiKey": "YOUR_STITCH_API_KEY",
  "projectId": "YOUR_PROJECT_ID",
  "port": 3456,
  "allowedOrigins": ["antigravity://app"]
}
```

**Start the server (keep terminal open while working):**
```bash
stitch-mcp start --config ~/.stitch/mcp-config.json
```

**Connect in Antigravity → Settings → MCP Connections → Add New:**
```
Name:     Stitch UI Builder
URL:      http://localhost:3456
Protocol: MCP v1
Auth:     Bearer YOUR_STITCH_API_KEY
```
Click **Test Connection** → green ✓ = ready.

**Verify integration — type in Antigravity chat:**
```
@Stitch create a simple card component with a purple button
```

---

### Step 3: The Master Prompt (Copy → Paste into Claude)

> Fill **two placeholders only** — everything else is handled automatically.

| Placeholder | What to put |
|-------------|-------------|
| `{DESIGN_REFERENCE_LINK}` | URL of any site whose **visual style** you want to borrow (e.g. `linear.app`, `vercel.com`, `stripe.com`). Only the look is taken — not the content. |
| `{RAW_PROMPT}` | Your rough idea for what you're building. Write it however you like — no structure needed. This is the ONLY source for features & functionality. |

```
Design Reference Link: {DESIGN_REFERENCE_LINK}

{
You are a senior UI/UX engineer and prompt architect. Your job is to
transform the inputs given to you into a single, exhaustive,
production-ready prompt for a vibe coding tool (Stitch). Follow these
permanent rules without exception:

1. DESIGN REFERENCE ANALYSIS — Visit the design reference link provided.
   Extract ONLY visual information: color palette (exact hex values if
   possible), typography style (serif/sans-serif, weight, sizing hierarchy),
   spacing and layout patterns, component styles (buttons, cards, navbars,
   etc.), animation/interaction feel, overall aesthetic mood (minimal,
   brutalist, glassmorphic, etc.). Do NOT extract any content, copy, or
   functional ideas from the reference. It is a visual bible only.

2. IDEA SOURCE — The website concept, purpose, features, pages, and
   functionality come EXCLUSIVELY from the raw prompt. Do not let the
   design reference influence what the website does or contains.

3. OUTPUT FORMAT — Produce one single refined prompt in this order:
   a. Project Overview (from raw prompt only)
   b. Visual Language (from design reference only)
   c. Page-by-Page UI Plan (sections, components, layout per page)
   d. Component Specs (buttons, typography scale, color tokens, spacing)
   e. Build Instructions for Stitch (step-by-step, start building now)

4. Be specific, not vague. No placeholders in output. Every color, font
   style, and spacing decision must be explicitly defined.

5. End with: "Now analyze the design reference link visually, then begin
   building the UI in Stitch immediately without asking any clarifying
   questions."
}

Raw Prompt: {RAW_PROMPT}
```

---

### CODVYN Design Reference Examples

| Site to reference | Aesthetic it gives you |
|-------------------|----------------------|
| `linear.app` | Dark, minimal, ultra-clean SaaS |
| `vercel.com` | Bold typography, high contrast, developer-centric |
| `stripe.com` | Premium, trustworthy, dense but readable |
| `apple.com` | Cinematic scroll, organic curves, editorial |
| `leerob.io` | Minimalist personal/portfolio |
| `resend.com` | Developer docs aesthetic — clean grids |

---

### Agent Protocol: When to Invoke CODVYN

When the user says **any** of these:
- "build me a landing page"
- "make a dashboard"
- "design a website like X"
- "create a UI for..."
- "build and follow Codvyn"

→ **ALWAYS use the CODVYN workflow:**
1. Ask for (or infer) a design reference URL
2. Use browser tool to visit and snapshot it
3. Craft a Claude-style master prompt
4. Send to Stitch via MCP
5. Iterate in chat

> **Key rule:** Design reference = *visual bible only*. Features come from the user's raw prompt, never from the reference site.

---

## 🎭 Premium Frontend Library Stack (Mandatory — Every Web Project)

> The agent MUST use this stack for all new web projects. Never build generic AI-looking block websites.

### Core Stack (Always Install)
```bash
bun add next@latest react@19 react-dom@19          # Framework
bun add lenis                                         # Smooth scroll (14k stars)
bun add motion                                        # Animation (370+ examples)
bun add gsap @gsap/react                              # Complex timelines + ScrollTrigger
bun add three @types/three @react-three/fiber @react-three/drei  # 3D (113k stars)
bun add tailwindcss @tailwindcss/vite                 # Styling
bun add zustand                                       # State (for 3D scenes)
npx shadcn@latest init                                # UI primitives
```

### Library Selection Matrix
| Need | Library | Install | Why |
|------|---------|---------|-----|
| Smooth scroll | **Lenis** | `bun add lenis` | 14k stars, buttery physics, GSAP integration |
| Basic animations | **Motion.dev** | `bun add motion` | 370+ examples, React declarative API |
| Complex timelines | **GSAP** | `bun add gsap` | Industry standard, ScrollTrigger, pinning |
| 3D scenes | **Three.js + R3F** | `bun add three @react-three/fiber` | 113k stars, React declarative 3D |
| 3D helpers | **Drei** | `bun add @react-three/drei` | Environment, Float, Text3D, useGLTF |
| Post-processing | **R3F Postprocessing** | `bun add @react-three/postprocessing` | Bloom, DOF, Vignette |
| Text animations | **ReactBits** | `npx shadcn@latest add @react-bits/*` | BlurText, SplitText, Typewriter |
| UI components | **ReactBits** | `npx shadcn@latest add @react-bits/*` | TiltCard, Spotlight, Marquee |
| Backgrounds | **ReactBits** | `npx shadcn@latest add @react-bits/*` | GradientBg, ParticleField, AuroraBg |
| State management | **Zustand** | `bun add zustand` | Lightweight, for 3D scene state |

### Scrolling Patterns (Decision Guide)
| Pattern | When | Implementation |
|---------|------|----------------|
| **Long Scroll** | Storytelling, landing pages | Lenis + Motion `whileInView` |
| **Fixed Scroll** | Docs, dashboards | CSS `sticky` + Lenis |
| **Parallax** | Brand stories, portfolios | Lenis + `useTransform` |
| **Scrollytelling** | Product showcases | Canvas image sequence + scroll-linked frame playback |
| **Infinite Scroll** | Social feeds, galleries | Intersection Observer + API pagination |

### Long Scroll Best Practices (Clay Global 2026)
1. Chunk content visually — distinct sections with headings, background changes
2. Front-load value — most important content + CTA above the fold
3. Provide orientation — sticky nav, progress indicators, back-to-top
4. Lazy load images — Intersection Observer for off-screen content
5. Break text blocks — short paragraphs, images, videos between sections
6. Clear CTAs throughout — guide users on what to do next
7. Mobile-first — buttons/links big enough to tap, text readable
8. Optimize speed — compress files, limit plugins, use WebP/AVIF
9. Monitor with Hotjar — heatmaps show where users scroll/lose interest
10. Respect `prefers-reduced-motion` — always provide fallback

### Anti-Patterns (NEVER Do This)
- ❌ Infinite scroll + parallax on same page (conflict)
- ❌ Auto-loading without "Load More" fallback
- ❌ Fixed elements that obscure content on mobile
- ❌ Heavy parallax on content-heavy pages (kills readability)
- ❌ No loading indicators during content loads
- ❌ Forgetting footer links are unreachable with infinite scroll
- ❌ Generic AI-looking card grids — every component must feel handcrafted
- ❌ Using `cat` on JSON files — use `jless` (see ZERO-TOKEN CLI RULEBOOK)

### Scrollytelling Pipeline (Product Showcases)
1. **Google Whisk** → Generate AI product shots (hero, exploded view, detail)
2. **Google Veo Flow** → Animate between frames (disassembly/reassembly)
3. **EZGif** → Extract video frames at 30 FPS (JPG, ZIP download)
4. **Anti-Gravity / Gemini** → Generate Next.js scrollytelling code
5. **NodeJS** → Local dev server

### Reference Files
- `templates/animations/MOTION_DEV_LIBRARY.md` — 8 core patterns, 14 APIs, presets
- `templates/animations/REACT_BITS_LIBRARY.md` — 110+ components, 4 categories
- `templates/animations/SCROLLYTELLING_TEMPLATE.tsx` — Apple-level product showcase
- `templates/animations/SCROLLYTELLING_TOOLCHAIN.md` — Full pipeline docs
- `templates/animations/SCROLLING_PATTERNS.md` — 4 patterns, decision matrix
- `templates/animations/FRONTEND_LIBRARY_STACK.md` — Complete stack reference

---

## 📄 PDF & Document Extraction Tools (Zero-Token, Always Available)

> The agent MUST NEVER say "I cannot read PDFs" or "this model does not support PDF input". Use these tools to extract content FIRST, then read the extracted text.

### Installed Tools (poppler-utils + pandoc + tesseract)

| Tool | Command | What It Does |
|------|---------|-------------|
| `pdftotext` | `pdftotext input.pdf output.txt` | Extract text from PDF to plain text |
| `pdftoppm` | `pdftoppm -png -r 300 input.pdf output` | Convert PDF pages to PNG images |
| `pdfimages` | `pdfimages -png input.pdf output` | Extract all images from PDF |
| `pdfinfo` | `pdfinfo input.pdf` | Get PDF metadata (pages, size, author) |
| `pdftohtml` | `pdftohtml input.pdf output.html` | Convert PDF to HTML |
| `tesseract` | `tesseract input.png output` | OCR — extract text from images/scans |
| `pandoc` | `pandoc input.pdf -t plain` | Convert PDF to plain text/markdown |

### Self-Healing Protocol for File Reading

When the agent encounters a file it cannot read directly:

1. **PDF files** → Use `pdftotext`:
   ```bash
   pdftotext "file.pdf" /tmp/extracted.txt && cat /tmp/extracted.txt
   ```

2. **Scanned PDFs / images** → Use `tesseract` OCR:
   ```bash
   pdftoppm -png -r 300 "file.pdf" /tmp/page
   tesseract /tmp/page-1.png output.txt
   ```

3. **Extract images from PDF** → Use `pdfimages`:
   ```bash
   pdfimages -png "file.pdf" /tmp/extracted
   ```

4. **Convert PDF to HTML** → Use `pdftohtml`:
   ```bash
   pdftohtml "file.pdf" /tmp/output.html
   ```

5. **Convert PDF to markdown** → Use `pandoc`:
   ```bash
   pandoc "file.pdf" -t markdown -o /tmp/output.md
   ```

6. **Get PDF info first** → Use `pdfinfo`:
   ```bash
   pdfinfo "file.pdf"
   ```

### Rule
> If a PDF is encountered, ALWAYS extract text first using `pdftotext`, read the extracted text, then proceed. NEVER tell the user you cannot read PDFs.

---

## 🛑 Global Error Learnings & Guardrails (Permanent Memory)

1. **Staging Bloat Prevention:** Never stage virtual environments (`venv`, `.venv`), package lockfiles (`package-lock.json`, `yarn.lock`), or build packages (`node_modules`) to Git. Always ensure a comprehensive `.gitignore` is active to prevent push unpacking failures on GitHub.
2. **Port Mismatch Checks:** Always cross-reference frontend config files (like `vite.config.js` proxy settings) with backend startup parameters (Uvicorn port) immediately on setup.
3. **OCR Metadata Noise Removal:** When doing text analysis on scanned official forms/documents, strip properties/particulars sections before regex matching to prevent dates, serial numbers, and monetary figures from showing up as false positive legal statutes.
4. **Devanagari Numeral Conversion:** Always translate Devanagari numerals (e.g. `१२३४`) to standard digits (`1234`) immediately after regional OCR extraction before passing to matchers.
5. **OCR Pipeline Quality Early-Exit:** OCR runs on CPU are slow (~70-90s). Implement a quality-threshold early-exit so that if an initial OCR pass yields valid, confident target matches, subsequent image enhancements are skipped.
6. **UI Click Event Handling:** When custom design frameworks wrap native HTML inputs, explicitly invoke input clicks and stop propagation (`e.stopPropagation()`) to avoid components swallow-blocking upload clicks.

---

## 🖥️ Terminal Environment Standards

### Starship Prompt (Mandatory)
The agent MUST ensure `starship` is installed and configured as the shell prompt. It surfaces git branch, Node version, Python venv, exit codes, and command duration in real-time — zero cognitive overhead.
```bash
# Install
curl -sS https://starship.rs/install.sh | sh
# Enable (add to ~/.bashrc)
eval "$(starship init bash)"
```
- Config lives at `~/.config/starship.toml`
- Agent installs starship autonomously if missing when setting up any dev environment.

### tmux Session Management (Mandatory for Long-Running Tasks)
Every dev server, training run, or background process MUST be launched inside a named tmux session so closing the terminal never kills work.
```bash
# Start a named session
tmux new-session -d -s <project-name>
# Run server inside it
tmux send-keys -t <project-name> "bun run dev" Enter
# Reattach
tmux attach -t <project-name>
```
- Agent ALWAYS wraps `bun run dev`, `uvicorn`, `ollama serve`, and training scripts in tmux sessions.
- Session naming convention: `<project>-dev`, `<project>-api`, `<project>-train`

---

## 📁 Memory Bank — Exact Structure (Mandatory)

Every project gets a `memory-bank/` folder. The agent creates it on first session and updates it on every session end. Structure is non-negotiable:

```
memory-bank/
├── progress.md       ← Session log + current task status
├── architecture.md   ← Full codebase map, stack decisions, folder structure
├── decisions.md      ← WHY things were built a certain way (prevents regressions)
├── api-contracts.md  ← All API endpoints, request/response schemas
└── known-issues.md   ← Bugs found, workarounds applied, tech debt logged
```

### progress.md format:
```markdown
## Current Status: [IN PROGRESS / DONE / BLOCKED]
**Last worked on:** YYYY-MM-DD
**Next action:** <exact next step so next session starts immediately>

## Session Log
| Date | What was done |
|------|---------------|
| 2026-05-26 | Built auth flow, wired Clerk, deployed to Vercel |
```

### architecture.md format:
```markdown
## Stack
- Frontend: Next.js 15 + Tailwind + Framer Motion
- Backend: FastAPI + PostgreSQL (Supabase)
- Auth: Clerk
- Deployment: Vercel (frontend) + Railway (backend)

## Folder Structure
src/
├── app/          ← Next.js pages
├── components/   ← Reusable UI
├── lib/          ← Utilities, API clients
└── hooks/        ← Custom React hooks
```

---

## 📄 Standard Project Specification Templates (PRD, DESIGNDOC, TECHSTACK)

When initiating a new project, setting up a feature, or writing design documents, the agent MUST place these specifications under a `docs/` folder in the project root.

To ensure consistency, copy the templates from the following paths and fill them out based on the discovery prompts:
- **Product Requirement Document (PRD):** Copy `/home/aditya/bin/templates/specs/PRD.md` to `docs/PRD.md`
- **Design Document (DESIGNDOC):** Copy `/home/aditya/bin/templates/specs/DESIGNDOC.md` to `docs/DESIGNDOC.md`
- **Tech Stack Document (TECHSTACK):** Copy `/home/aditya/bin/templates/specs/TECHSTACK.md` to `docs/TECHSTACK.md`

Always trigger the corresponding **AI Discovery Prompt** (ask the user for requirements, visual design choices, and technical constraints) before writing the documents.

---

## 🐙 GitHub Project Standards (Auto-Applied to Every Repo)

When the agent creates or initializes a GitHub repo, it MUST create these files and configure rules automatically:
- **PR Template:** Copy `/home/aditya/bin/templates/git/pull_request_template.md` to `.github/PULL_REQUEST_TEMPLATE.md`
- **Bug Issue Template:** Copy `/home/aditya/bin/templates/git/bug_report.md` to `.github/ISSUE_TEMPLATE/bug_report.md`
- **Feature Issue Template:** Copy `/home/aditya/bin/templates/git/feature_request.md` to `.github/ISSUE_TEMPLATE/feature_request.md`

### Branch Protection Rules (apply via `gh` CLI after repo creation):
```bash
gh api repos/{owner}/{repo}/branches/main/protection \
  --method PUT \
  --field required_status_checks='{"strict":true,"contexts":["ci"]}' \
  --field enforce_admins=false \
  --field required_pull_request_reviews='{"required_approving_review_count":0}' \
  --field restrictions=null
```

---

## ⚡ Makefile Standards (Every Project Gets This)

Every project Makefile MUST include these universal targets at minimum:

```makefile
.PHONY: dev build test lint typecheck ci clean setup

setup:        ## Install all dependencies
	bun install || pip install -r requirements.txt

dev:          ## Start development server
	bun run dev || uvicorn main:app --reload

build:        ## Production build
	bun run build

test:         ## Run all tests
	bun test || pytest -v

lint:         ## Run linter
	bunx eslint . || ruff check .

typecheck:    ## Run type checker
	bunx tsc --noEmit || mypy .

ci:           ## Full CI pipeline (lint + typecheck + test)
	make lint && make typecheck && make test

clean:        ## Remove build artifacts
	rm -rf .next dist build __pycache__ .pytest_cache node_modules

deploy:       ## Deploy to production
	vercel --prod || fly deploy
```

---

## 🪝 Pre-commit Hooks (Auto-installed on Every Project)

The agent MUST install `pre-commit` hooks on every new project via `setup-project`. Hooks run automatically before every `git commit` — zero manual effort.

To initialize, copy the standard config template from `/home/aditya/bin/templates/git/pre-commit-config.yaml` to `.pre-commit-config.yaml` in the project root, then run: `pre-commit install`.

---

## 🗂️ Dotfiles Repo (Disaster Recovery)

All personal configs are version controlled at `github.com/adityashirsatrao007/dotfiles`.
If the machine is ever wiped, the agent restores everything with one command.

### What is backed up:
- `~/.bashrc`, `~/.bash_aliases`
- `~/.config/starship.toml`
- `~/.config/opencode/`
- `~/bin/` (all custom scripts including `sync-agent-rules`, `setup-project`)
- `~/.tmux.conf`
- `/home/aditya/Desktop/Projects/GEMINI.md`

### Agent behaviour:
- When modifying any dotfile or adding a new script to `~/bin/`, the agent MUST commit and push to the dotfiles repo immediately after.
- Command: `cd ~/dotfiles && git add -A && git commit -m "update: <what changed>" && git push`


---

## 🤖 Vibe Coding Tool Stack & Agent Orchestration

### 1. Local Coding Agents & CLI Assistants
These are the zero-token-cost local AI coding agents installed and configured on this machine:
- **`aider`** ([aider-chat/aider](file:///home/aditya/Desktop/Projects/GEMINI.md#L1195)) — Git-first AI pair programmer for terminal. Ideal for fast multi-file edits. Run: `aider --model ollama/qwen2.5-coder:3b`
- **`goose`** ([block/goose](https://github.com/block/goose)) — Open-source on-machine AI agent via MCP. Extensible for custom workflows.
- **`opencode`** — Already configured. AGENTS.md points to GEMINI.md.
- **`RA.Aid`** ([ai-christianson/RA.Aid](https://github.com/ai-christianson/RA.Aid)) — LangGraph-powered CLI agent designed to execute multi-step coding goals.
- **`MyCoder.ai`** ([drivecore/mycoder](https://github.com/drivecore/mycoder)) — Modular CLI agent with native GitHub integration.
- **`Gemini CLI`** ([google-gemini/gemini-cli](https://github.com/google-gemini/gemini-cli)) — Official Google Gemini terminal assistant.
- **`claude-code`** ([anthropics/claude-code](https://github.com/anthropics/claude-code)) — Official high-autonomy terminal agent by Anthropic.

### 2. AI-Driven Task & Multi-Agent Orchestration
When a project is too large for a single agent session, utilize these tools to coordinate:
- **`vibe-kanban`** ([BloopAI/vibe-kanban](https://github.com/BloopAI/vibe-kanban)) — Visual Kanban board to track and orchestrate 10+ parallel coding agents across projects.
- **`Claude Task Master`** ([eyaltoledano/claude-task-master](https://github.com/eyaltoledano/claude-task-master)) — Compatible with popular AI IDEs, breaks down work into subtasks to prevent context bloat.
- **`agent-hub`** ([Dominic789654/agent-hub](https://github.com/Dominic789654/agent-hub)) — Local-first multitask board for routing, sequencing, and observing repo-local coding agents.
- **`Bernstein`** ([chernistry/bernstein](https://github.com/chernistry/bernstein)) — Deterministic orchestrator that spawns parallel coding agents from a single goal, verifies with tests, and auto-commits.
- **`VibeGrid`** ([jcanizalez/vibegrid](https://github.com/jcanizalez/vibegrid)) — Multi-agent terminal manager with task queues and inline diff reviews.
- **`Boomerang Tasks`** — Roo Code feature that auto-decomposes goals into a structured queue of subtasks distributed across specialized agents.

### 3. Repository Auditing, Linting, & Health
AI-generated code needs checks to keep it clean and performant:
- **`AgentLint`** ([0xmariowu/AgentLint](https://github.com/0xmariowu/AgentLint)) — 33 evidence-backed checks for AI-friendly repos (verifies file structure, instruction quality, build setup, session continuity, and security posture).
- **`sober-coding`** ([mansourfaye229-dot/sober-coding](https://github.com/mansourfaye229-dot/sober-coding)) — Language-agnostic vibe code quality analyzer. Performs 27 checks across security (secrets, path traversal), architecture (god files, deep nesting), code duplication, and error handling. Provides sobriety scoring (SOBER, TIPSY, BLACKOUT) and CLI fix suggestions.
- **`toprank`** ([nowork-studio/toprank](https://github.com/nowork-studio/toprank)) — Open-source Claude Code plugin with 9 SEO and Google Ads skills to fetch PageSpeed/Search Console metrics and ship fixes directly.

### 4. Context & Cost Tracking
- **`Budi`** ([siropkin/budi](https://github.com/siropkin/budi)) — Local-first cost analytics for AI coding agents. Tracks token usage and spend across Claude Code and Cursor.
- **`memov`** ([memovai/memov](https://github.com/memovai/memov)) — Git-based, traceable memory layer for Claude Code to track session context.

### 5. Prompt & Documentation Engineering
- **`LynxPrompt`** ([GeiserX/LynxPrompt](https://github.com/GeiserX/LynxPrompt)) — Self-hostable AI config management platform for teams. Manages AGENTS.md, CLAUDE.md, .cursor/rules/, and slash commands.
- **`Prompt Tower`** ([backnotprop/prompt-tower](https://github.com/backnotprop/prompt-tower)) — Sends complex code blocks to LLMs, bundling files together for large-scale refactors.
- **`CodeGuide`** ([codeguide.dev](https://www.codeguide.dev/)) — Builds detailed, AI-readable project documentation before initiating an agent session.

### Agent Execution Rule for Complex Projects
When a project has more than 5 distinct components (e.g., frontend + backend + auth + DB + CI/CD):
1. Create a `tasks/` folder in the project root.
2. Write a `tasks/master-plan.md` breaking the project into numbered atomic tasks.
3. Launch parallel subagents, one per task group.
4. Update `memory-bank/progress.md` after each subagent completes.

---

## 🔍 Code Review & Documentation Protocol (Mandatory)

This protocol governs how the agent audits, reviews, and documents all changes before submitting work or pushing to GitHub.

### 1. Automated Code Quality Audits (Self-Healing Check)
Before declaring any task done, the agent MUST run the following checks and resolve all failures autonomously:
- **Sobriety Audit:** Run `sober check .` (or `sober-coding` command) to analyze code health. The codebase sobriety score must exceed `85`. If any issues are flagged as TIPSY, HUNGOVER, or BLACKOUT, the agent must fix them using `sober fix <ID>`.
- **AI-Friendliness Audit:** Run `agentlint check` (or similar command) to ensure the codebase remains readable, structured, and continuous for other agents.
- **Pre-commit Checks:** Run `pre-commit run --all-files` locally to verify that linters, formatters, and secret scans (`gitleaks`) pass successfully.
- **Unit Testing:** Execute `make test` or `bun test` and ensure all tests pass with zero failures.

### 2. Git & Pull Request Review Protocol
Before pushing branches or raising a Pull Request:
- **Review Diffs:** Run `git diff | delta` to visually inspect all changes. Verify that:
  1. No debugging statements, console logs, or temporary code markers are left.
  2. No credentials or secrets are present in the diff.
  3. No package lockfiles or node_modules are staged.
- **Diff Analysis:** For complex changes, run `reviewcerberus` (or similar Git diff reviewer) to perform a local security, performance, and quality analysis on the branch differences.
- **PR Description:** Write a clear description utilizing the `.github/PULL_REQUEST_TEMPLATE.md` conventions:
  - Reference Conventional Commits in the PR title (`feat:`, `fix:`, `docs:`, `refactor:`).
  - Explicitly document what was tested and provide instructions for manual verification.

### 3. Documentation & Memory Maintenance
- **Walkthrough Artifact:** For any major technical changes, create or update `docs/walkthrough.md` mapping the exact changes made, files modified, and test results.
- **CodeGuide Docs:** If initiating a new module or complex subsystem, run `codeguide` (or similar) to auto-generate AI-readable documentation of the architecture.
- **Memory Bank Sync:** Ensure `memory-bank/activeContext.md` and `memory-bank/progress.md` are updated to reflect the exact state, decisions, and immediate next steps.
- **Dotfiles Check:** If any change was made to the terminal environment or custom scripts in `~/bin/`, immediately push the updates to the dotfiles repository:
  ```bash
  cd ~/dotfiles && git add -A && git commit -m "update: terminal rules" && git push
  ```

---

## ⚡ ZERO-TOKEN CLI OPERATION RULEBOOK (MANDATORY — READ BEFORE EVERY ACTION)

This section defines the EXACT CLI tool to use for every operation. Using the wrong tool wastes tokens. This is non-negotiable.

### 🔍 SEARCHING (Never use `grep` in bash — use `rg`)
```bash
# Find text in files
rg "pattern" .                          # replaces: grep -r "pattern" .
rg "pattern" --type ts .               # search only TypeScript files
rg "pattern" -l .                      # list only filenames, not matches
rg "TODO|FIXME" .                      # multi-pattern search
rg "pattern" -C 3 .                    # show 3 lines of context around match
rg "pattern" --json .                  # machine-readable JSON output

# Find files by name
fdfind "*.env" .                       # replaces: find . -name "*.env"
fdfind "component" --type f .          # files only
fdfind . --type d --max-depth 2        # directories only, 2 levels deep
```

### 📁 LISTING FILES (Never use `ls` — use `eza`)
```bash
eza -la --git                          # replaces: ls -la (with git status)
eza --tree --level 2                   # replaces: find . -maxdepth 2 -type d
eza --tree --level 3 --git-ignore      # tree view ignoring .gitignore files
eza -la --sort=modified                # sort by last modified
```

### 📄 READING FILES (Never use `cat` — use `bat`)
```bash
bat src/index.ts                       # replaces: cat (with syntax highlighting)
bat -n src/index.ts                    # with line numbers
bat --line-range 10:50 file.ts         # replaces: sed -n '10,50p' file.ts
bat -A file.txt                        # show non-printable characters
```

### 🔄 GIT OPERATIONS (Use `lazygit` TUI or `git` + `delta`)
```bash
lazygit                                # full TUI — replaces all git status/diff/log
git diff | delta                       # beautiful diff — replaces reading changed files
git log --oneline -20                  # compact history — replaces reading commits
git status --short                     # compact status
gh pr list                             # list PRs without browser
gh issue list                          # list issues without browser
gh repo view --web                     # open repo in browser
```

### 📊 PROJECT ANALYSIS (Use these FIRST before reading any files)
```bash
onefetch                               # instant repo summary: language, commits, contributors
tokei                                  # count lines of code by language (no file reading needed)
dust -n 10                             # top 10 largest directories (space usage)
duf                                    # disk usage summary across mount points
```

### 🌐 HTTP / API TESTING (Never use curl manually — use `http`)
```bash
http GET https://api.example.com/users          # replaces: curl -X GET ...
http POST api.example.com/login email=a pass=b  # replaces: curl -X POST -d ...
http GET api.example.com 'Authorization: Bearer TOKEN'
http --json POST api.example.com/data key=val  # force JSON content-type
```

### 📦 JSON / YAML PROCESSING (Never read raw files — use `jq`/`yq`)
```bash
jq '.dependencies' package.json        # read specific key — replaces opening file
jq 'keys' package.json                 # list all keys in JSON
jq '.scripts | keys' package.json      # list available npm scripts
yq '.services' docker-compose.yml      # read YAML key — replaces opening file
yq '.env' docker-compose.yml           # extract env vars from compose file
```

### 🔁 TEXT REPLACEMENT (Use `sd` not `sed`)
```bash
sd 'old_text' 'new_text' file.ts       # replaces: sed -i 's/old/new/g' file.ts
sd 'localhost:3000' 'localhost:8000' **/*.ts  # replace across all TS files
```

### 📝 READING MARKDOWN DOCS (Use `glow` not `cat` or `view_file`)
```bash
glow README.md                         # rendered markdown in terminal
glow memory-bank/progress.md           # read memory bank beautifully
glow GEMINI.md | head -100             # first 100 lines of rendered markdown
```

### 🖥️ PROCESS MONITORING (Use `btop` not `top`/`ps`)
```bash
btop                                   # full TUI system monitor
procs                                  # replaces: ps aux | grep <name>
procs node                             # find all node processes instantly
```

### 📡 NETWORK (Use `nmap` for discovery, `http` for requests)
```bash
nmap -sn 192.168.1.0/24               # scan local network for live hosts
nmap -p 3000,8080,5432 localhost       # check if specific ports are open
```

### 🪟 SESSION MANAGEMENT (Always use `tmux` for long tasks)
```bash
tmux new-session -d -s <name>          # create background session
tmux send-keys -t <name> "<cmd>" Enter # run command in background session
tmux list-sessions                     # see all running sessions
tmux attach -t <name>                  # attach to a session
```

### ⚡ PACKAGE MANAGEMENT (Use `bun` not `npm`)
```bash
bun install                            # replaces: npm install (10x faster)
bun run dev                            # replaces: npm run dev
bun add <package>                      # replaces: npm install <package>
bun add -d <package>                   # replaces: npm install --save-dev
bun x <tool>                           # replaces: npx <tool>
```

### 🧠 AGENT TOKEN-SAVING PRIORITY ORDER
When starting work on any codebase, follow this EXACT sequence:
1. `onefetch` — get repo summary (0 file reads)
2. `glow memory-bank/progress.md` — get current status (1 tool call)
3. `eza --tree --level 2 --git-ignore` — understand structure (0 file reads)
4. `tokei` — know what languages/how much code (0 file reads)
5. `rg "TODO\|FIXME\|HACK" .` — find known issues (0 file reads)
6. Only THEN open specific files with `bat` if needed

This 5-step pre-flight reads the ENTIRE codebase context in 5 commands instead of 50+ file reads. Saves up to 90% of session tokens.

### 🎯 AUTO-TRIGGER RULES — Tool Must Fire Automatically on These Conditions

The following tools are installed but under-used. These rules make them **mandatory triggers** so the agent reaches for them reflexively:

| Condition | Tool to Fire | Command |
|-----------|-------------|---------|
| Any JSON file > 50 lines | `jless` | `jless file.json` — interactive browse, don't open in editor |
| Building a jq query interactively | `jnv` | `cat file.json \| jnv` — live jq query builder |
| Starting work on ANY existing project | `onefetch` | `onefetch` — instant repo summary before reading files |
| Starting work on ANY existing project | `eza --tree` | `eza --tree --level 2 --git-ignore` — understand structure |
| Dev server running + editing source | `entr` | `fd -e ts -e tsx \| entr -r npm run build` — auto-rebuild on save |
| Bulk rename/replace across files | `sd` | `sd 'old' 'new' **/*.ts` — never use sed or file-edit for bulk |
| Debugging what processes are running | `procs` | `procs --tree` — process tree with resources |
| System resource overview with GPU | `btm` | `btm` — CPU/RAM/GPU/network in one TUI |
| Exploring an unfamiliar open-source repo | `gitingest` | Change `github.com` → `gitingest.com` in URL — AI-friendly summary |
| Feeding a repo to AI for deep analysis | `gitmcp` | Paste URL into `gitmcp.io` — converts repo to AI-readable format |
| Viewing any GitHub file for copy/paste | `?plain=1` | Append `?plain=1` to GitHub file URL — raw view, no UI clutter |
| Quick-editing a file in browser | `.` key | Press `.` on any GitHub repo page → instant VS Code in browser |
| Downloading repo without git | ZIP trick | Append `/archive/refs/heads/main.zip` to repo URL |

**Rule:** If the agent uses `cat` on a JSON file, it has FAILED. Use `jless`. If the agent starts a project session without `onefetch`, it has FAILED. If the agent manually re-runs a build after editing source files, it should have used `entr`.

---

## 🌐 Complete Website SEO & Ranking Protocol (2026)

This protocol outlines how the agent must register, optimize, and rank websites on search engines, incorporating advanced technical and content-level search requirements.

### 1. Google Search Console & Setup
- **Register Property:** Set up the domain or URL prefix in Google Search Console immediately after deployment.
- **Verification:** Verify ownership autonomously using DNS TXT records or the HTML file upload method.
- **Sitemap Submission:** Ensure a valid `sitemap.xml` is automatically generated at build time (e.g., in Next.js or static exports) and submit it to `/sitemap.xml` in Search Console.
- **Robots.txt:** Ensure a valid `robots.txt` exists pointing to the correct sitemap.

### 2. Technical SEO Essentials (Non-Negotiable)
- **Performance:** Ensure Core Web Vitals are within the "Good" threshold (LCP < 2.5s, FID/INP < 200ms, CLS < 0.1). Use performance checking tools.
- **Mobile First:** Ensure layout is 100% responsive and passes mobile-friendly test criteria.
- **Security:** Ensure HTTPS is enabled with clean redirect rules.
- **Clean Structure:** Use clean, semantic URLs without excessive parameters.

### 3. On-Page & Semantic SEO
- **Heading Hierarchy:** Use exactly one `<h1>` per page. Structure sections sequentially using `<h2>`, `<h3>`, etc.
- **Metadata:** Every page must have a unique, optimized `<title>` (under 60 chars) and meta description (under 160 chars) matching user intent.
- **Semantic HTML:** Leverage HTML5 elements (`<article>`, `<section>`, `<nav>`, `<aside>`) to help search engines parse document structure.
- **Accessibility:** All interactive elements must have clear focus states, Tap targets must be >= 48px, and images must have descriptive `alt` tags.
- **Internal Linking:** Ensure solid internal link architecture to distribute page authority throughout the site.

### 4. Advanced AI SEO Analyzer Prompt
When tasked with optimizing an existing project's SEO, the agent must assume the following persona and execute the tasks below:

> **Role:** You are an advanced SEO analyst, technical SEO engineer, conversion copywriter, semantic search optimizer, and Google ranking specialist.
>
> **Tasks:**
> - Analyze all pages of the codebase.
> - Identify high-ranking SEO keyword opportunities.
> - Generate SEO-optimized headings and content.
> - Improve semantic relevance.
> - Suggest/implement internal links.
> - Add structured data schema markup (`ld+json`).
> - Optimize readability.
> - Detect weak sections and rewrite generic, AI-looking copy.
> - Generate metadata.
> - Suggest blog ideas.
> - Prioritize fixes by ranking impact.
>
> **Output format:**
> - SEO Audit Summary
> - Critical Issues List
> - Keyword Opportunities Table
> - Technical SEO Improvements
> - Content Improvements
> - Final SEO Score (1-100)

### 5. Image & Asset Optimization
- Compress all images (WebP/AVIF format).
- Use descriptive, hyphenated filenames (e.g., `modern-seo-guide.webp`).
- Set explicit `width` and `height` dimensions to prevent Cumulative Layout Shifts (CLS).

### 6. Backlinks & Promotion
- Build natural backlinks through blog posts, guest sharing, Product Hunt launches, local directories, and publishing useful tools/resources.
- Avoid low-quality/spam links. Focus on high-quality citations.

---

## 🏗️ Enterprise Architecture & Scaling Protocols

This protocol defines the structural design patterns and scaling practices that must be adhered to for all enterprise-grade backend developments. Reference runnable code blueprints under `/home/aditya/bin/templates/architecture/`.

### 1. Microservices SAGA Pattern
- **When to Use:** Use when a transaction spans multiple physical microservices and requires distributed transactional consistency (atomic commitment) without blocking distributed locks.
- **Implementation Strategy (Orchestration):** Use a central orchestrator that guides transactions through sequential stages. Each stage has an execute function and a corresponding compensator (rollback) function.
- **Rule:** Every state-altering action must have a compensating action that returns the system to its prior state. If a compensator fails, log a `CRITICAL` alert with human intervention telemetry.
- **Blueprint:** [saga_orchestrator.py](file:///home/aditya/bin/templates/architecture/saga_orchestrator.py)

### 2. CQRS (Command Query Responsibility Segregation)
- **When to Use:** Use when there is a significant read/write asymmetry (e.g., reads outnumber writes by 100:1) or when query models differ heavily from command/write models.
- **Implementation Strategy:**
  - **Write Side (Commands):** Handles database modifications, validation, business rules, and writes to a write-optimized database (e.g., PostgreSQL).
  - **Read Side (Queries):** Reads from a read-optimized cache/database (e.g., Redis, Elasticsearch) with simplified flat data structures (views/DTOs).
  - **Sync:** Sync the read model asynchronously or synchronously after write success.
- **Blueprint:** [cqrs_fastapi.py](file:///home/aditya/bin/templates/architecture/cqrs_fastapi.py)

### 3. Event-Driven Architecture (EDA)
- **When to Use:** For decoupling services, handling long-running asynchronous tasks, and streaming telemetry/event data.
- **Implementation Strategy:**
  - **Event Envelope Pattern:** Always wrap event payloads in a structured envelope containing: `event_id`, `event_type`, `correlation_id` (tracks transactional thread across services), and `timestamp`.
  - **Resiliency & Retries:** Implement subscriber loops with exponential backoff retries.
  - **Dead Letter Queue (DLQ):** After exceeding maximum retries (e.g., 3), route the message to a DLQ topic (`dlq:<topic>`) and trigger a `CRITICAL` alert. Never discard unprocessable events.
- **Blueprint:** [event_driven_broker.py](file:///home/aditya/bin/templates/architecture/event_driven_broker.py)

### 4. Blue-Green Deployments
- **When to Use:** To achieve zero-downtime deployments and instant rollbacks.
- **Implementation Strategy:**
  - Standardize two independent environments: **Blue** (current production active) and **Green** (staging/new version).
  - Deploy and test the new release in the Green environment.
  - Use Nginx or a load balancer to atomic-swap traffic from Blue to Green.
  - Keep the Blue environment running for a cooling period (e.g., 1 hour) for instant fallback if anomalies occur.
- **Blueprint:** [blue_green_deploy.sh](file:///home/aditya/bin/templates/architecture/blue_green_deploy.sh)

### 5. Backend Scaling & Performance Engineering
- **Telemetry & Metrics:** Expose an HTTP `/metrics` endpoint scraping CPU/memory metrics and request latencies using Prometheus client.
- **Production Redis Token Bucket Rate Limiting:** Junior developers block traffic; senior backend engineers regulate flow mathematically. Always implement token bucket or sliding-window rate-limiting middleware globally to protect system capacity before business logic, databases, or CPUs overload:
  - **Bucket Parameters:** Define a maximum **Capacity** (governs allowable burst spikes) and **Refill Rate** (governs sustained traffic throughput).
  - **Identity Extraction:** Extract identity using `userId` (for authenticated routes) instead of `IP` to prevent NAT-user collateral blocks, falling back to `IP` / `API key` for anonymous traffic.
  - **Atomic Shared State:** Store bucket states in Redis using atomic operations (Counters, TTLs, or Lua scripts) to prevent race conditions across horizontally-scaled microservice nodes or Kubernetes clusters.
  - **Rejection Protocol:** If token capacity is exhausted, immediately reject with HTTP 429 and include `Retry-After` headers.
  - **Algorithm Suitability Matrix:**
    | Algorithm | Best For | Weakness |
    | :--- | :--- | :--- |
    | **Token Bucket** | Burst + steady traffic regulation | Requires shared state (Redis) |
    | **Leaky Bucket** | Smoothing traffic outputs | Poor handling of legitimate burst needs |
    | **Fixed Window** | Basic usage quotas | Boundary spikes (2x traffic at resets) |
    | **Sliding Window** | Precise, rolling-window fairness | Higher database/memory complexity |
  - **Sample Node.js + Redis Middleware Blueprint:**
    ```javascript
    const rateLimiter = new RateLimiterRedis({
      storeClient: redisClient,
      keyPrefix: 'rate_limit',
      points: 10, // Capacity
      duration: 1, // Refill window (seconds)
    });
    rateLimiter.consume(req.userId || req.ip, 1)
      .then(() => next())
      .catch(() => res.status(429).send({ error: 'Too Many Requests', retryAfter: 1 }));
    ```
- **Resource Pooling:** Always reuse database connections using connection poolers (e.g., PgBouncer, SQLAlchemy connection pool, or custom poolers). Limit max pool sizes.
- **Caching Protocols:** Always inject client/CDN cache-control headers (`Cache-Control: public, max-age=...`) and run local or distributed memory caches (Redis/Memcached) for high-frequency static reads.
- **Blueprint:** [backend_scaling_fastapi.py](file:///home/aditya/bin/templates/architecture/backend_scaling_fastapi.py)

---

## 📄 Latex Resume & ATS Optimization Protocols

When tasked with generating, modifying, or auditing resumes (especially in LaTeX format), the agent must act as an expert ATS engineer and copywriter by applying these 5 key optimization vectors:

### 1. Skills Gap Analysis
- **Action:** Analyze target Job Descriptions (JD) side-by-side with the current resume.
- **Optimization:** Identify the top 5 key skills/responsibilities missing or weakly represented in the current resume. Match each missing skill to 1–2 quantifiable achievements from the user's past experiences, framing them with strong action verbs.

### 2. Tailored Bullet Points
- **Action:** Rewrite the experience section to align precisely with the target JD.
- **Optimization:** Limit descriptions to 4–6 high-impact bullet points per role. Every bullet point must:
  - Start with a strong, active verb (e.g., *Architected*, *Spearheaded*, *Optimized*).
  - Incorporate target keywords naturally in context.
  - Quantify accomplishments wherever possible (e.g., "reduced latency by 35%", "scaled throughput by 4x").
  - Be written in professional, concise, first-person implied voice.

### 3. Readability & ATS Compatibility
- **Action:** Optimize document structure for machine parsers and human recruiters.
- **Optimization:** Use standard section headings (e.g., *Experience*, *Skills*, *Education*). Avoid tables, columns, text boxes, and charts within LaTeX/PDF that break ATS text flow. Ensure standard, high-readability fonts (e.g., Latin Modern, Computer Modern, Arial, Helvetica). Address employment gaps subtly (e.g., highlighting continuous learning, consulting, or project-based work).

### 4. Relevant Professional Summary
- **Action:** Formulate an engaging, hook-like summary (4-5 sentences).
- **Optimization:** Highlight unique value propositions, naturally weave in 3-4 keywords from the job description, and end with a forward-looking commitment showing value-adds to the prospective company.

### 5. ATS Keyword Integration & Ranking Optimization
- **Action:** Analyze JD keyword density and naturally integrate target terminology.
- **Optimization:** Avoid keyword stuffing. Place key terms naturally within Summary, Experience, and Skills sections. Suggest missing sections, certifications, or specialized industry terminology commonly used in top-tier candidate resumes for the target role.

---

## 🎯 AI Job Hunting System — 5-Step Framework (AI Action Letter)

> Source: *AI Action Letter* by Abhijay Arora Vuyyuru (PM @ YouTube/Google, Harvard MBA)
> Newsletter: [AI Action Letter on Substack](https://substack.com/@abhijayaroravuyyuru)

This is a complete AI-powered job hunting system. When the user asks for help with job applications, interviews, or career strategy, apply these protocols.

---

### 🔑 Core Insight
> Mass applying with a generic resume = 0 interviews. Strategy + AI targeting = results.
> 75% of resumes are rejected by ATS before a human ever sees them.

---

### Step 1: ATS-Proof Resume Rules

**Format (non-negotiable):**
- ✅ Single-column layout (multi-column breaks ATS parsing)
- ✅ No icons, tables, images, or graphics
- ✅ Standard section headers EXACTLY: `Education`, `Experience`, `Skills`, `Projects`
- ✅ Reverse chronological order (most recent first)
- ✅ Export as PDF (always)
- ✅ One page (unless 10+ years of experience)

**Bullet Formula:**
```
[Action Verb] + [What You Did] + [Quantified Result]
```

| ❌ Weak | ✅ Strong |
|---------|---------|
| "Responsible for managing social media accounts" | "Grew Instagram following from 2K to 50K in 6 months by implementing a data-driven content strategy, increasing engagement rate by 340%" |

**Rule:** At least **70% of bullets must include a metric.**

**Strong Action Verbs:** Architected, Spearheaded, Optimized, Automated, Delivered, Scaled, Reduced, Increased, Launched, Mentored, Audited, Integrated

---

### Step 2: LinkedIn Optimization — AI Prompt

Copy this prompt into Claude or ChatGPT with the user's LinkedIn content:

```
Here is the scraped content of a LinkedIn profile:
<profile>
{{PASTE LINKEDIN PROFILE CONTENT HERE}}
</profile>

The user's goal is: {{GOAL}}
(e.g., "attract PM roles at FAANG", "get recruited for senior engineering roles",
"build thought leadership in AI")

Please analyze the profile across these dimensions and give specific
rewrites, not just suggestions:

1. Headline — Is it keyword-rich, role-specific, and value-forward? Rewrite it.
2. About/Summary — Does it tell a compelling story with a clear hook in line 1? Rewrite it.
3. Experience bullets — Are they outcome-driven with numbers? Flag weak ones and rewrite 2–3 examples.
4. Featured section — What should be pinned here given their goal?
5. Skills & Keywords — What's missing for SEO and recruiter/algorithm discoverability?
6. Creator/Posting signals — Any gaps in how they present their content or niche authority?
7. CTA — Does the profile have a clear next step for visitors?

Format output as:
[Section] → [Issue] → [Rewrite or Recommendation]
```

---

### Step 3: Automate Job Discovery

**Problem:** By the time you see a job posting on LinkedIn/Indeed, hundreds have applied. Early applicants get interviews.

**Solution — n8n + Apify pipeline (~$7/month):**
- Scrapes LinkedIn for jobs posted in the **last 24 hours**
- Filters by role, location, industry
- Returns top 5 most recent listings per search
- Delivers results daily — no manual searching

**Hiring Manager Search Patterns (LinkedIn):**

| Pattern | Search String |
|---------|--------------|
| Direct Intent | `"I'm hiring"` OR `"looking for a"` OR `"open role on my team"` |
| Call to Action | `"DM me"` OR `"send me your resume"` OR `"drop your portfolio"` |
| Team Growth | `"growing the team"` OR `"excited to announce"` OR `"just opened a req"` |

> A **direct LinkedIn DM to a hiring manager** is 10x more effective than Easy Apply.

**Reference guides:**
- [AI Agent That Job Hunts While You Sleep](https://substack.com/@abhijayaroravuyyuru) — n8n + Apify setup
- [Use LLMs in Your Job Search](https://substack.com/@abhijayaroravuyyuru) — LinkedIn search patterns

---

### Step 4: Auto-Tailor Resume Per Job (One-Click Workflow)

**Why:** ATS doesn't know "project management" = "program management". Mirror JD language exactly.

**n8n Automation Stack:**
| Tool | Cost | Role |
|------|------|------|
| n8n | ~$7/mo | Workflow orchestration |
| Apify | Free tier | LinkedIn job scraping |
| Google Gemini API | Free tier | Resume rewriting |
| Google Docs | Free | Tailored resume output |
| Gmail | Free | Daily summary emails |

**Workflow:**
1. Job descriptions fetched from Step 3 pipeline
2. AI extracts keywords — skills, tools, qualifications, action verbs
3. Base resume rewritten to match JD language (never invents experience)
4. New Google Doc created per tailored resume
5. Summary email sent with links to all tailored resumes + job postings

> You wake up to an email with tailored resumes ready to submit.

---

### Step 5: LinkedIn Content Strategy

**Why post during job search:**
- Signals to recruiters you're active in your field
- Creates inbound opportunities (hiring managers find you)
- Builds professional brand — when Googled, you have substance

**Cadence:** 3x per week

**Post Formula:**
- Bold/punchy first line (hook)
- Short paragraphs (1-2 sentences max)
- End with a question or CTA

**90 Post Ideas — Organized by Category:**

#### 🔄 Reintroduction (1-10)
1. "I've been lurking on LinkedIn for 3 years. Here's what I've learned just by reading."
2. "I've never posted here before. So let me finally introduce myself properly."
3. "I've consumed content on LinkedIn for years. Time to contribute something."
4. "I kept drafting posts and deleting them. This one's staying up."
5. "I used to think posting on LinkedIn was for people with big titles. I was wrong."
6. "I told myself I'd post 'when the time was right.' Turns out there's no perfect moment."
7. "Most of my career wins happened while I was silent on here. Here's a quick recap."
8. "I'm not a natural poster. But I have things worth saying. Starting today."
9. "If you've wondered who the quiet person in your network is — that's been me. Until now."
10. "I've been at [company] for X years. Here's what I wish I'd shared sooner."

#### 💡 Lessons Learned (11-20)
11. "The one career lesson I had to learn the hard way."
12. "3 things I know now that I wish someone told me on day one of my career."
13. "The best piece of advice I ever got — and why I ignored it for years."
14. "What I learned in my first 90 days at my current job."
15. "A mistake I made early in my career that actually shaped everything."
16. "The thing nobody tells you about [your industry]."
17. "I spent 5 years trying to be the smartest person in the room. Here's what changed."
18. "What I learned from a boss I absolutely hated."
19. "The meeting that changed how I think about my career."
20. "One habit that made me significantly better at my job."

#### 🎯 Hot Takes & Contrarian Views (21-30)
21. "Unpopular opinion: hustle culture is making us worse at our jobs."
22. "Cold emails work better than job boards. Change my mind."
23. "The 'follow your passion' advice is incomplete. Here's the missing part."
24. "Networking events are mostly a waste of time. Here's what isn't."
25. "The soft skills that companies say they want vs. the ones they actually reward."
26. "Being likable at work matters more than being competent. (Let's talk about it.)"
27. "Your resume is not your story. Here's what I think is."
28. "Work-life balance is the wrong framing. Here's a better one."
29. "We over-celebrate busyness. Here's what I think actually matters."
30. "I don't think the 10,000-hour rule applies the way we think it does."

#### 📖 Personal Story Arc (31-40)
31. "I almost quit my career in [field] 3 years ago. Here's what stopped me."
32. "My career didn't go according to plan. Here's the version that actually happened."
33. "I got laid off. Here's what that week looked like — and what came next."
34. "I changed industries at [age]. Everyone thought I was crazy. Here's how it went."
35. "The promotion I didn't get — and why I'm grateful for it now."
36. "From [starting point] to [current role] — the version nobody puts on their resume."
37. "I said yes to something terrifying at work. Here's what happened."
38. "The conversation that completely changed my career trajectory."
39. "How a random connection on LinkedIn led to [a major opportunity]."
40. "I relocated for a job. It didn't work out. Here's what I learned."

#### 📊 Industry Insight & Trends (41-50)
41. "Something I'm seeing shift in [your industry] that nobody's talking about enough."
42. "3 skills that will matter most in [your field] over the next 5 years."
43. "Why [a common industry practice] is overrated."
44. "The part of the AI conversation that I think is missing from most discussions."
45. "What companies in [industry] keep getting wrong about [topic]."
46. "The role that didn't exist 5 years ago that every company now needs."
47. "An outdated belief in [your industry] that's still being taught like it's gospel."
48. "Why I think [emerging trend] is more important than most people realize."
49. "The thing that separates good companies from great ones in [your industry]."
50. "Here's how [your field] has changed in the last 3 years — and what that means."

#### 🤝 People & Management (51-60)
51. "The best manager I ever had did one thing differently."
52. "What I look for when I'm hiring — and it's probably not what you'd expect."
53. "I've interviewed hundreds of people. The candidates who stand out all do this."
54. "The type of teammate that makes every project better."
55. "Something I noticed great leaders do that average leaders don't."
56. "Why I started asking 'what do you need from me?' more than 'how's it going?'"
57. "The feedback conversation that was hard to give — and why I'm glad I did."
58. "How I think about building trust with a new team quickly."
59. "The most underrated quality in a professional: [your answer]."
60. "What managing people taught me about myself."

#### 🛠️ Tools, Systems & Productivity (61-70)
61. "The one tool that made my work dramatically more efficient this year."
62. "How I structure my week to protect time for deep work."
63. "My personal framework for making decisions at work."
64. "I started doing [small habit] 6 months ago. Here's what changed."
65. "The way I take notes has completely changed how I retain information."
66. "How I use AI in my actual workflow — not the hype version, the real one."
67. "The system I use to track my wins throughout the year (for performance reviews)."
68. "What I do in the first 30 minutes of every workday."
69. "The question I ask at the end of every project to get better over time."
70. "Why I started writing a 'failure log' — and what it's taught me."

#### 🌍 Values, Purpose & Identity (71-80)
71. "The moment I realized my job title isn't my identity."
72. "What I believe about work that I think most companies get wrong."
73. "Why I turned down a higher-paying job — and what that decision taught me."
74. "Something I protect no matter how busy work gets."
75. "What 'meaningful work' actually means to me."
76. "Why I stopped optimizing for status and started optimizing for [something else]."
77. "The values I want to still have in 20 years — and how I try to practice them now."
78. "A thing I'm genuinely proud of at work that wasn't a promotion or raise."
79. "The part of your career that has nothing to do with your resume."
80. "What I think about when I'm deciding whether an opportunity is right for me."

#### 🎓 Learning & Growth (81-90)
81. "The book that most changed how I think about work. (And the idea that stuck.)"
82. "What I learned from 30 days of [challenge or experiment]."
83. "I took a course on [topic] expecting one thing and got something completely different."
84. "The mentor who shaped my career — and the one piece of advice they kept repeating."
85. "What I'm actively trying to get better at this year."
86. "The question I asked that unlocked a completely new way of thinking for me."
87. "Something I believed at 22 about work that I've completely unlearned."
88. "The podcast/newsletter/resource that I'd recommend to everyone in [field]."
89. "What I'm learning right now — and why it feels uncomfortable."
90. "The thing I realized I was bad at — and what I did about it."

---

### Quick-Start Checklist (When User Asks for Job Hunt Help)
- [ ] Step 1: Create ATS-friendly resume (single column, PDF, 70%+ quantified bullets)
- [ ] Step 2: Run LinkedIn profile through AI optimization prompt above
- [ ] Step 3: Set up Apify + n8n for daily job scraping (24h postings)
- [ ] Step 4: Configure auto-tailoring workflow (Gemini API + Google Docs)
- [ ] Step 5: Pick 3 post ideas and publish first LinkedIn post this week

### Visa Note for International Candidates
For H-1B alternatives: **EB-1A** and **O-1 visas** are viable paths for STEM candidates. Free 15-min consultation available via Manifest Law.

---

## 🎨 Claude UI Design Skills Playbook & Workflow

When designing premium SaaS interfaces, landing pages, mobile apps, or performing audits, the agent MUST leverage these 9 key design commands/skills and follow the structured workflow to output startup-level, Stripe-quality, and Vercel-style UIs.

### 1. Key Design Commands & Skills

| Command / Prompt | Core Action | Typical Target Prompt Example |
|------------------|-------------|-------------------------------|
| `/awesome-design-md` | **Premium SaaS UI Components** | "Design a premium SaaS dashboard for an AI startup with modern spacing, clean hierarchy, Stripe-level UI, and startup-quality components." |
| `/design-mastery` | **Better UX & Onboarding Audits** | "Audit my SaaS onboarding flow and redesign it for better conversion, accessibility, and user experience." |
| `/mobile-app-ui-design` | **Premium Mobile App UI** | "Design a modern AI productivity app inspired by Airbnb and Spotify with premium onboarding and smooth mobile UX." |
| `/ux-ui-mastery` | **UX Psychology & Conversions** | "Redesign my SaaS checkout flow to improve conversion, trust, and reduce drop-off using cognitive psychology." |
| `/design-system-extractor` | **Extract Tokens from Image/UI** | "Extract the exact design system from this Stripe screenshot and recreate the spacing, typography, and color system." |
| `/UI/UX Pro Max` | **Interactive App UX Audits** | "Audit this SaaS dashboard and show me the top UX mistakes hurting conversions with actionable fixes." |
| `/Vercel Web Design Guidelines` | **High-Converting Landing Pages** | "Create a premium landing page for my AI SaaS with modern Vercel-style UI and high-converting copy." |
| `/Vercel React Best Practices` | **Clean React + Tailwind Code** | "Convert this Figma UI into reusable React + Tailwind components using production-grade code structure." |

### 2. Winning Claude UI Design Workflow

The agent MUST follow this exact sequence to ensure professional, pixel-perfect results on every web/mobile project:

1. **Base UI (`/awesome-design-md`):** Build the foundation and primary pages using premium design tokens and Stripe-level components.
2. **Onboarding & UX (`/design-mastery`):** Audit the onboarding flow, fix accessibility, and clean up layouts.
3. **Design Tokens (`/design-system-extractor`):** Extract and lock down key design elements (color palette, spacing grid, type scale) from reference screenshots.
4. **Mobile Adaptations (`/mobile-app-ui-design`):** Adapt layouts using Airbnb/Spotify-style mobile paradigms where necessary.
5. **Checkout & Conversion (`/ux-ui-mastery`):** Optimize call-to-actions, pricing tables, and checkout screens using cognitive psychology principles.
6. **Final Audit (`/UI/UX Pro Max`):** Scan the UI to catch the top 5 common UX/visual hierarchy mistakes before staging.
7. **Landing Page Copy (`/Vercel Web Design Guidelines`):** Structure high-converting sections, headlines, and sub-copy in a minimal Vercel-style layout.
8. **Code Generation (`/Vercel React Best Practices`):** Convert the polished layouts into clean, modular, production-grade React + Tailwind code.
9. **Ship!**

### 3. Mistakes to Avoid
- 🚫 Going straight to writing code without establishing spacing systems or color tokens first.
- 🚫 Using random, generic colors without a cohesive color system/palette.
- 🚫 Ignoring mobile-first viewports and native gesture/spacing grids.
- 🚫 Allowing inconsistent vertical and horizontal grid spacing across container boundaries.
- 🚫 Skipping accessibility audits (like tap targets, text contrast ratios) before deployment.
- 🚫 Building landing pages without high-converting UX copy.

---

## 🎬 TEXTURA / Claude Code Website Pipeline (Premium Animated Websites)

When tasked with designing and implementing high-converting landing pages or animated websites, the agent must leverage the **TEXTURA / Claude Code Website Pipeline** to build premium animated websites with AI — from finding a design reference to deploying on a host.

### 1. Antigravity vs. Claude Code Layout Paradigm
* **Antigravity Browser Flow:** Takes a screenshot, generates UI components in the browser, allowing visual editing before code export. Avoids vendor lock-in.
* **Claude Code Command Flow:** Takes a screenshot, translates it into clean code, allowing conversational iterations directly in the codebase for Next.js/HTML, providing full control and ownership.

### 2. The 11-Step Step-by-Step Pipeline

#### Step 01: Brief & Copywriting (Phase 1 — Brief & Strategy)
Define the brand, audience, and tone of voice. Generate all page copy with AI (Perplexity or Claude.ai) *before* touching any code or design.
* **Copywriting Prompt:**
  ```
  "You are a senior copywriter. Write hero headline, subheadline, 3 feature descriptions, CTA and footer copy for [BRAND]. Tone: [cinematic / bold / minimal]. Output JSON."
  ```

#### Step 02: Find a Section Reference (Phase 2 — Reference Selection)
Browse Dribbble, Behance, or Awwwards for strong hero sections. Use search tags: `landing page`, `hero`, `product`, `dark UI`.

#### Step 03: Strip the Background — Clean UI Only (Phase 2 — Reference Cleaning)
Use GPT-4o or OpenArt to strip all background graphics, keeping only typography, buttons, and navigation on a solid black background. This serves as a precise layout reference for Claude Code without background noise.
* **Background Stripping Prompt:**
  ```
  "A high-fidelity mockup based on [screenshot]. Only UI elements on solid black background. All background imagery removed. Text and buttons in strict black and white. Stark, minimal, high-contrast monochrome."
  ```

#### Step 04: Recreate the Layout from Screenshot (Phase 3 — Build in Claude Code)
Attach the stripped monochrome screenshot and describe the task to recreate the layout.
* **Layout Recreation Prompt:**
  ```
  "You are a senior web designer and developer. Recreate the referenced layout one-to-one using Next.js 16. Match fonts (use similar creative typefaces), spacing, proportions and element positioning. Use React Spring to animate elements sequentially on load."
  ```
* **Pro Tip:** Attach the cleaned B&W reference and the original screenshot together. Command Claude Code to use the clean version for layout/positioning, and the original version for colors, mood, visual texture, and typographic intent.

#### Step 05: Typography (Phase 4 — Fonts & Color)
Pick trending display fonts on Google Fonts and the Awwwards Free Fonts collection (e.g., Condensed, Black, Extended).

#### Step 06: Color Palettes (Phase 4 — Fonts & Color)
Find trending color combinations on Coolors (Trending Palettes), export as CSS variables, and apply them.
* **Color Prompt:**
  ```
  "Take this palette [HEX list] and apply it to the project. Update all CSS custom properties. Primary CTA button — [COLOR]."
  ```

#### Step 07: 3D Models (Phase 4 — 3D Models)
Search for free 3D models on Sketchfab. Download GLB / GLTF and embed them via Three.js, React Three Fiber, or Spline.

#### Step 08: Image & Video Generation (Phase 5 — Visual Assets)
Generate hero illustrations, 3D characters, or looping background assets. Use OpenArt or Kling 3.0 to produce seamless looping background videos.
* **Asset Prompt:**
  ```
  "3D render, [description], dark cinematic background, soft rim lighting, 4K, transparent bg. Style: Clay / Glossy / Neon."
  ```

#### Step 09: Animations Referenced from Pinterest (Phase 6 — Animations)
Collect reference clips of transitions, hover states, scroll reveals, marquees, or sticky sections on Pinterest. Feed them to Claude Code to implement with GSAP or Framer Motion.
* **Animation Prompt:**
  ```
  "Implement these animation references with GSAP ScrollTrigger. Hero text: staggered reveal on load. Cards: fade + lift on scroll into view. Marquee: infinite horizontal loop, pause on hover. Respect prefers-reduced-motion."
  ```

#### Step 10: Asset Compression & Optimization (Phase 7 — Optimization)
Compress all assets with Squoosh and optimize resources:
* **Optimization Prompt:**
  ```
  "Audit /public: convert all images to WebP, add lazy loading. Video: MP4+WebM under 2MB. Preload hero font. Reserve space for hero image to prevent layout shift (CLS)."
  ```
* **Optimization Rules:**
  - PNG/JPG to WebP (Squoosh at quality 80%)
  - Video loops: MP4 + WebM formats, max 2MB total size
  - Fonts: preload in `<head>`
  - Images: lazy loading + explicit width/height attributes (prevent CLS)
  - Accessibility: add `@media (prefers-reduced-motion)` and maintain minimum AA (4.5:1) text contrast.

#### Step 11: Host & Deploy the Site (Phase 8 — Deploy)
* **Vercel Configuration Prompt:**
  ```
  "Generate vercel.json: cache /public/* immutable 1 year, redirect www → apex domain, 404 → index.html for SPA routing."
  ```
* **Deployment Workflow:**
  1. Next.js: `npm run build` ➔ `vercel deploy` or Vercel Git integration.
  2. Custom Domain: Configure A-record or CNAME in DNS settings (e.g. Hostinger).
  3. HTTPS: Automatically provisioned by host.
  4. Validation: Run Lighthouse and ensure a 90+ Performance score.

---

## 🛡️ Repository Hygiene & Security Guardrails (Zero-Vulnerability Codebase)

The agent MUST enforce strict repository hygiene and security guardrails to ensure no secrets, internal assets, or architectural flaws are exposed. Every code write and commit must be audited against this checklist:

### 1. Repository Hygiene & Git Cleanliness
- **Zero Secrets committed:** NEVER commit `.env`, `.env.local`, or any credentials/keys. Use `.env.example` as a template.
- **Strict `.gitignore` enforcement:** Ensure `node_modules/`, build output (`dist/`, `build/`, `.next/`, `out/`), and system files (`.DS_Store`, Thumbs.db) are ignored.
- **No raw design assets:** Keep Photoshop (`.psd`), Sketch, or Illustrator raw files out of the repository. Store them in cloud storage or `docs/images/` only if flattened (PNG/WebP).
- **No operational leaks:** Keep production deployment files separated from source directories.
- **Pre-flight Commit check:** Always run `git status` or audit staged files using linters to verify that no build artifacts, lockfiles, or config overrides are accidentally staged.

### 2. Authentication & Authorization Security
- **Secure Cookie Configuration:** When setting session cookies/JWT tokens, they MUST carry the following flags:
  - `HttpOnly` (prevents XSS access to tokens).
  - `Secure` (ensures cookies are only sent over HTTPS).
  - `SameSite=Lax` or `SameSite=Strict` (prevents CSRF attacks).
- **Secure Auth Responses:** NEVER return the full user object or fields containing password hashes, internal roles, salt, or database metadata. Explicitly project/serialize safe fields (e.g., username, public ID).
- **Safe Error Handling:** Catch all database and authentication exceptions. Never return raw stack traces, database query logs, or server internal details in error responses. Use clean, user-friendly messages while logging the raw stack trace securely to stdout/files.

### 3. API Security & Infrastructure Protection
- **Input Validation & Rate Limiting:** All endpoints (especially `/login`, `/register`, and transaction endpoints) must enforce input validation (e.g., using Pydantic, Zod, or Joi) and rate limiting (e.g., token bucket pattern) to block automated brute-force attacks and DDoS.
- **Zero Default Credentials:** Never document default admin credentials in README files or scripts. Use dynamic initialization scripts or secure configuration variables.
- **Conceal Architecture details:** Avoid exposing detailed infrastructure files (`nginx.conf`, custom `docker-compose.yml` exposing default ports) publicly. Ensure production setups run in separate private deployment pipelines or carry obfuscated, variable-driven parameters.
- **Automated Scanning Guardrails:** Run static analysis checks (`semgrep`), secret checks (`gitleaks`), and vulnerability scanning (`trivy`) in local Git hooks (`pre-commit`) and cloud CI to enforce early-exit failure on violations.
- **"Clean Commit" Workflow:** Perform a local code review (`git diff | delta`) before pushing. Reject the "Push First, Fix Later" pattern.

---

## 🧠 Long-Term Project Context & Code Maintenance (AI Maintainability Protocol)

To prevent codebases from becoming unmaintainable due to context drift, duplicate logic, and messy state management, the agent MUST strictly enforce long-term memory structures and modular feature development.

### 1. Mandatory Context & Memory Files
Before generating code for any feature, verify or initialize these active memory files in the project root (or inside the `memory-bank/` directory):
* **`PROJECT_CONTEXT.md` / `progress.md`:** Tracks the used tech stack, app flow, API/route registry, auth flow, schema, dependencies, completed features, and active task lists.
* **`ARCHITECTURE.md`:** Maps the layers (frontend, backend, database relationships), reusable services, state management, and AI abstractions to keep files modular and replaceable.
* **`CODING_RULES.md` / `.cursorrules` / `GEMINI.md`:** Declares naming conventions, folder structure, import rules, component patterns, API response formats, TypeScript rules, and styling system parameters.
* **`FEATURE_LOG.md` / `walkthrough.md`:** Logs all added features, removed subsystems, major refactors, dependency updates, and architectural changes.

### 2. Code Generation Directive (Pre-Flight System Prompt)
Before writing or modifying any production code, the agent MUST act in accordance with this strict system directive:
> *"You are a senior software architect working on an existing production-grade project. Follow the current architecture strictly. Maintain modular layered architecture. Keep frontend, backend, APIs, auth, database logic, and AI services separated. Reuse existing components and utilities whenever possible. Avoid duplicate logic. Follow existing naming conventions and coding patterns. Generate scalable, maintainable, production-ready code only. Update PROJECT_CONTEXT.md and ARCHITECTURE.md after major changes."*

### 3. Modular Development & Micro-Commits
- **Break Down Monoliths:** Never implement massive systems in a single run (e.g., *"build full SaaS app with payment, auth, and dashboard"* is strictly forbidden). Instead, build in atomic, isolated layers:
  1. Auth Module
  2. Database Schema & API Layer
  3. UI Layout & Dashboard System
  4. Payment Integration
  5. AI Service Abstraction
  6. Telemetry & Analytics
- **Incremental Commits:** Commit and verify each stable feature layer before moving to the next. This prevents complex, destructive AI refactors from breaking unrelated subsystems.

---

## 🎭 Playwright Autonomous QA & Self-Healing Loop

When tasked with QA, end-to-end testing, or preparing a repository for production deployment, the agent MUST act as an autonomous QA + Fix Engineer and execute the following 6-phase Playwright testing and code-healing loop.

### Phase 0 — Environment & Project Discovery
1. **Detect Stack:** Inspect `package.json` / `pyproject.toml` / `go.mod` to identify framework, package manager (npm/bun/pnpm/yarn), test runners, dev server commands, and default port.
2. **Project Report:** Log a brief stack overview, routes, entry points, and existing tests in `AGENT_NOTES.md`.
3. **Docs Check:** Read README, CONTRIBUTING, and DEV docs before making code changes.

### Phase 1 — Playwright Installation & Configuration
1. **Install Playwright:** Run appropriate package commands to add `@playwright/test` and download browser binaries with dependencies (`playwright install --with-deps`).
2. **Setup Config:** Create `playwright.config.ts` configured for:
   - Chromium, WebKit, and Firefox.
   - `baseURL` pointing to the local dev server.
   - Trace on first retry, screenshots only on failure, video retained on failure.
   - `webServer` block that automatically starts the dev server.
3. **Folders:** Create `tests/e2e`, `tests/visual`, `tests/a11y`, and `test-results/screenshots/`.

### Phase 2 — Static Analysis
- Run the linter and type-checker (`eslint`, `tsc --noEmit`, `ruff`, etc.).
- Build the project (`npm run build` or equivalent) and capture compilation errors.
- Document suspicious files, TODOs, missing env parameters, or structural flaws in `AGENT_NOTES.md`.

### Phase 3 — Generate Test Suite
Generate Playwright tests that cover:
1. **Smoke Tests:** Every public route loads with HTTP 200 and zero console errors.
2. **User Journeys:** Auth flows, CRUD pages, forms, navigation, and payment/checkouts.
3. **Responsive Testing:** Verify viewports: Mobile (375x667), Tablet (768x1024), and Desktop (1440x900).
4. **Visual Regression:** Save full-page screenshots to `test-results/screenshots/<route>__<viewport>.png`.
5. **Accessibility (a11y):** Integrate `@axe-core/playwright` and fail on serious/critical violations.
6. **Network Check:** Assert no 4xx/5xx responses in the network log for happy paths.

### Phase 4 — The Agentic Testing & Fixing Loop
Repeat this loop for up to 8 iterations until exit criteria are met:
- **Run:** Execute `npx playwright test --reporter=list,html`.
- **Collect:** Parse all failures, console logs, a11y violations, and screenshots.
- **Diagnose:** For each failure, open relevant code files, form a hypothesis, and log it in `AGENT_NOTES.md` under *"Iteration N — Findings"*.
- **Fix:** Apply minimal, surgical code fixes to resolve root causes. Never change tests to pass unless the test itself was incorrect.
- **Verify:** Re-run failed tests, followed by the entire suite to verify fixes.
- **Visual Diff:** Compare new screenshots to previous iterations and note regressions.
- **Commit:** Commit fixed code per iteration with convention: `fix(iter-N): <summary>`.

*Exit Criteria (All must hold):*
- `npm run build` succeeds with zero errors/new warnings.
- Linter and type-checker pass clean.
- 100% of Playwright tests pass on chromium, webkit, and firefox.
- Zero console errors on any tested route.
- Zero serious/critical axe violations.

If convergence fails after 8 iterations, stop and produce a remediation report listing remaining failures and recommendations.

### Phase 5 — Production Verification & Report
1. **Production Build:** Run `npm run build` and launch the production server.
2. **Parity Check:** Re-run smoke and critical-journey tests against the production bundle to ensure parity with the dev server.
3. **Final Report:** Generate `AGENT_REPORT.md` including:
   - Initial state summary.
   - Bugs found (grouped by severity) and the fixing commit hashes.
   - Pass counts and test durations.
   - Links to screenshots.
   - Remaining known issues or recommendations.
   - Confirmation that the build is production-ready.

---

## 🔄 Multi-Provider LLM Proxy & Router Patterns (FreeLLMAPI Blueprints)

When building systems that aggregate, load-balance, or failover across multiple LLM API providers (e.g. OpenAI, Anthropic, Gemini, Groq, Cerebras), the agent MUST implement these production-grade resilient proxy patterns.

### 1. Dynamic Priority Routing with Penalty Decay
To handle upstream provider outages or rate-limit hits (HTTP 429/5xx) gracefully, do not hardcode static routing chains. Instead, sort candidate providers dynamically using a base priority combined with a decaying penalty score.

* **Formula:** `effective_priority = base_priority + rate_limit_penalty`
* **On Failure (429/5xx):** Increment the model's penalty: `penalty = Math.min(penalty + PENALTY_AMOUNT, MAX_PENALTY)` (e.g., `+3` per hit, capped at `10`).
* **Time-Based Decay:** Decay the penalty gradually so working providers can recover their original priority ranking over time:
  ```typescript
  const DECAY_INTERVAL_MS = 2 * 60 * 1000; // 2 minutes
  const DECAY_AMOUNT = 1;

  function getDecayedPenalty(modelId: number, lastHitMs: number, currentPenalty: number): number {
    const elapsed = Date.now() - lastHitMs;
    const decaySteps = Math.floor(elapsed / DECAY_INTERVAL_MS);
    if (decaySteps > 0) {
      return Math.max(0, currentPenalty - (decaySteps * DECAY_AMOUNT));
    }
    return currentPenalty;
  }
  ```

### 2. Escalating Cooldown Quarantining
Prevent infinite retry loops that consume all fallback capacity when a key/account has fully exhausted its quota. Implement an escalating cooldown array based on failures within a rolling 24-hour window.

* **Cooldown Progression:** `[2 min, 10 min, 1 hour, 24 hours]`
* **Key-Level Tracking:** Track recent rate-limit timestamps per key:
  ```typescript
  const COOLDOWN_DURATIONS = [
    2 * 60 * 1000,       // 2 minutes
    10 * 60 * 1000,      // 10 minutes
    60 * 60 * 1000,      // 1 hour
    24 * 60 * 60 * 1000, // 24 hours
  ];

  export function getNextCooldownDuration(keyHits: number[]): number {
    const now = Date.now();
    const hitsInLast24h = keyHits.filter(t => t > now - 24 * 60 * 60 * 1000);
    const index = Math.min(hitsInLast24h.length, COOLDOWN_DURATIONS.length - 1);
    return COOLDOWN_DURATIONS[index];
  }
  ```

### 3. Conversation Sticky Sessions
Multi-turn conversations suffer high hallucination rates and prompt formatting errors if routed to different models mid-dialogue. Pin multi-turn requests to the same model for the duration of the conversation.

* **Session Identifier:** Derive the session key from a SHA1 hash of the first user message. Since client applications re-send the full history each turn, the first user message remains stable.
  ```typescript
  import crypto from 'crypto';

  function getSessionKey(messages: ChatMessage[]): string {
    const firstUserMsg = messages.find(m => m.role === 'user');
    if (!firstUserMsg || typeof firstUserMsg.content !== 'string') return '';
    return crypto.createHash('sha1').update(firstUserMsg.content).digest('hex');
  }
  ```
* **Session TTL:** Store the model ID mapped to the session key in-memory with a 30-minute TTL. Auto-route is bypassed in favor of the pinned model for any subsequent messages matching that session hash.

### 4. Resilient Streaming and SSE Error Handling
When proxying Server-Sent Events (SSE), standard HTTP errors cannot be returned if the stream has already started.
* **Pre-stream Errors:** Catch provider startup errors before emitting the first chunk. This allows the proxy to fall back and try other providers/keys transparently before committing to headers.
* **Mid-stream Errors:** If a provider fails mid-response after headers are written, write a structured JSON error payload as an SSE chunk followed by `data: [DONE]\n\n` to prevent hanging sockets:
  ```typescript
  try {
    for await (const chunk of upstreamGenerator) {
      if (!headersSent) {
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('X-Routed-Via', `${platform}/${model}`);
        headersSent = true;
      }
      res.write(`data: ${JSON.stringify(chunk)}\n\n`);
    }
    res.write('data: [DONE]\n\n');
    res.end();
  } catch (err: any) {
    if (headersSent) {
      // Stream started: inject error event cleanly
      const payload = { error: { message: `Stream interrupted: ${err.message}`, type: 'stream_error' } };
      res.write(`data: ${JSON.stringify(payload)}\n\n`);
      res.write('data: [DONE]\n\n');
      res.end();
    } else {
      // Stream hasn't started: let the outer retry/fallback loop handle it
      throw err;
    }
  }
  ```

### 5. Timing-Safe Key Verification
Never use direct `===` operators to validate incoming authorization tokens. Plain comparisons exit early on mismatches, leaking timing data that a network attacker can exploit to reconstruct the API token.
* **Implementation:** Always use constant-time byte array comparisons:
  ```typescript
  import crypto from 'crypto';

  export function timingSafeStringEqual(provided: string, expected: string): boolean {
    const a = Buffer.from(provided);
    const b = Buffer.from(expected);
    const compareA = a.length === b.length ? a : Buffer.alloc(b.length);
    return crypto.timingSafeEqual(compareA, b) && a.length === b.length;
  }
  ```

### 6. AES-256-GCM Envelope Encryption for Stored API Keys
Never store third-party provider API keys in plaintext inside databases (SQLite/Postgres). Encrypt them at-rest using AES-256-GCM and store initialization vectors (IVs) and authentication tags alongside the ciphertexts.
* **Initialization:** Require a 64-character (32-byte) hex `ENCRYPTION_KEY` at startup. Validate length and character bounds immediately.
* **In-Memory Decryption:** Load encrypted keys into memory and decrypt them *only* at the moment of forwarding the request. Keep plaintexts out of databases.

---

## 🤖 Claude Code Engine & Plugin System (Official Extension Blueprints)

When extending or customizing agent behavior within the official **Claude Code** runtime or compatible CLI environments, the agent MUST leverage the following official plugin paradigms and extension patterns.

### 1. Plugin Directory Structure
Every Claude Code plugin must conform to this standard directory structure:
```
plugin-name/
├── .claude-plugin/
│   └── plugin.json          # Plugin metadata (JSON schema)
├── commands/                # Custom slash commands (Markdown syntax)
├── agents/                  # Specialized subagents (YAML/JSON configurations)
├── skills/                  # Core executable skills (Markdown/Markdown code)
├── hooks/                   # Lifecycle event hooks (Shell/Node scripts)
├── .mcp.json                # Custom MCP servers (local or remote)
└── README.md                # Plugin documentation
```

### 2. Custom Markdown Slash Commands
Define custom slash commands directly in Markdown files within `commands/` using YAML frontmatter metadata:
```markdown
---
description: "Start custom task run"
argument-hint: "PROMPT [--max-iterations N] [--completion-promise TEXT]"
allowed-tools: ["Bash(${CLAUDE_PLUGIN_ROOT}/scripts/setup-task.sh:*)"]
hide-from-slash-command-tool: "true"
---

# My Custom Command

Run the task setup script:
```!
"${CLAUDE_PLUGIN_ROOT}/scripts/setup-task.sh" $ARGUMENTS
```
```
* **Command Syntax:** The `description` and `argument-hint` are parsed by the CLI to provide tab-completion and help guides. The `allowed-tools` array limits tool execution permissions during command setup.

### 3. Session Exit Interception & Stop-Hook Blocking (The Ralph Wiggum Pattern)
To implement autonomous self-healing loops or force an agent to iterate repeatedly on a task until a specific condition or verification promise is satisfied, intercept session exits using a `Stop` hook.
* **State Verification:** Maintain a local state file (e.g. `.claude/loop-state.md`) containing the target prompt, iteration index, and a target `completion_promise`.
* **Exit Interception (`stop-hook.sh`):**
  1. The CLI calls the `Stop` hook when the agent attempts to exit the session.
  2. The script parses the session transcript (in JSONL format) and extracts the text of the last assistant message.
  3. If a completion promise is active, check if the assistant output contains a specific verification block (e.g. `<promise>PROMISE_TEXT</promise>`).
  4. If verified, delete the state file and exit `0` (allowing exit).
  5. If not verified, increment the iteration index in the state file and block exit by printing a structured JSON block to stdout:
     ```json
     {
       "decision": "block",
       "reason": "<original_prompt_text>",
       "systemMessage": "🔄 Loop Iteration N | Action: Continue working until condition is met."
     }
     ```
     This forces the runner to block the exit and automatically prompts the agent again with the original request, achieving autonomous iteration.

### 4. Security Guidance Hooks (`PreToolUse` Monitoring)
Implement real-time security warnings or pre-flight blockers using the `PreToolUse` hook.
* **Scan Modified Files:** Before any tool execution (such as editing or executing code), scan the modified code blocks against common security vulnerability patterns (e.g. command injection, XSS, `eval()`, dangerous innerHTML, raw pickle loading, or system execution calls).
* **Warn and Block:** Warn the agent or block execution if dangerous code elements are detected, forcing remediation before commit.

### 5. Bold Frontend Design Philosophy
Avoid generic "AI slop" aesthetics (such as default Inter typography, white backgrounds with generic purple gradients, or identical Bento grid layouts without character). Commit to a BOLD, intentional conceptual direction:
* **Typography:** Avoid overused system fonts (Arial, Inter, Space Grotesk). Pair a distinctive, characterful display font with a refined body font.
* **Layout:** Leverage spatial composition including asymmetry, grid-breaking elements, overlap, and diagonal flow.
* **Atmosphere:** Build depth using creative textures and overlays (gradient meshes, noise textures, layered transparencies, dramatic shadows, custom cursors, and grain overlays) rather than flat solid backgrounds.
* **Motion:** Focus on high-impact CSS-only entry transitions with staggered delays (`animation-delay`) and scroll-driven revelations rather than chaotic micro-interactions.

---

## 🎛️ Antigravity Awesome Skills Catalog & Installation Protocol

This protocol governs how the agent installs, activates, and leverages the curated library of 1,470+ installable agentic capabilities from the **Antigravity Awesome Skills** catalog.

### 1. Installation Targets and Flags
Install the repository dependencies or copy skills to specific AI client directories using `npx antigravity-awesome-skills`:
* **Claude Code:** `npx antigravity-awesome-skills --claude` (installs to `~/.claude/skills/`)
* **Gemini CLI:** `npx antigravity-awesome-skills --gemini` (installs to `~/.gemini/skills/`)
* **Cursor:** `npx antigravity-awesome-skills --cursor` (installs to `~/.cursor/skills/`)
* **Antigravity 2.0:** `npx antigravity-awesome-skills --antigravity` (installs to `~/.agents/skills/`)
* **Codex CLI:** `npx antigravity-awesome-skills --codex` (installs to `~/.codex/skills/`)
* **Kiro CLI:** `npx antigravity-awesome-skills --kiro` (installs to `~/.kiro/skills/`)
* **Custom Path:** `npx antigravity-awesome-skills --path <directory>`
* **Claude Code Plugin Installer:** `/plugin marketplace add sickn33/antigravity-awesome-skills` or `/plugin install antigravity-awesome-skills`

### 2. Context Optimization & Reduced Installs
To prevent agent performance degradation or memory overload due to too many active skills, apply category, tag, or risk filters during installation:
* **Category Filters:** `--category development,backend,security,ai-ml`
* **Risk Exclusions:** `--risk safe,none` (excludes critical, offensive, or unknown skills)
* **Tag Filters/Exclusions:** `--tags debugging,typescript-` (a trailing `-` excludes that tag)
* **Linux/macOS Activation Scripts:** In local cloned environments, run `./scripts/activate-skills.sh` to archive most skills and activate only specific bundles required by the active task.

### 3. Trust & Safety Classifications
Understand and respect the risk designations of installed skills:
* `none`: Pure text-based reasoning guidance with no system execution.
* `safe`: Read-only actions or low-risk operational queries.
* `critical`: State-changing or deployment-impacting actions (e.g. database updates, active builds).
* `offensive`: Authorized-use-only pentesting or red-team capabilities.
* `unknown`: Legacy/unclassified code waiting for audit validation.

### 4. Curated Role-Based Bundles
* **Web Wizard:** Radix UI design systems, Tailwind CSS patterns, minimalist UI layout components.
* **Hacker Pack:** OWASP security checks, threat modeling, pentest checklists.
* **Product Pack:** Feature planning, copywriting briefs, SEO content optimization, business strategy.
* **Essentials:** Clean code validation, systematic debugging, test-driven development (TDD) loops.

---

## 💰 Open-Source Monetization (OSM) Repository Index

When the user asks about "OSM" or "Open-Source Monetization", the agent must present the repository details in the following structured format. This indexes the active repositories set up for open-source bounty/mentorship work, mapping their tech stacks, payout structures, original URLs, and local user forks:

| Original Repository | Tech Stack | Payment Structure / Bounty Payout | User Fork Link (keyring-scoped) |
| :--- | :--- | :--- | :--- |
| [rudderlabs/rudder-server](https://github.com/rudderlabs/rudder-server) | Go, TypeScript | **$2,000 USD** per bounty | [adityashirsatrao007/OSM-rudder-server](https://github.com/adityashirsatrao007/OSM-rudder-server) |
| [Expensify/App](https://github.com/Expensify/App) | JavaScript, Android/iOS | **$250 - $500** per bounty | [adityashirsatrao007/OSM-App](https://github.com/adityashirsatrao007/OSM-App) |
| [AppFlowy-IO/AppFlowy](https://github.com/AppFlowy-IO/AppFlowy) | Flutter, Rust | **$500 / month** (Mentorship) | [adityashirsatrao007/OSM-AppFlowy](https://github.com/adityashirsatrao007/OSM-AppFlowy) |
| [triggerdotdev/trigger.dev](https://github.com/triggerdotdev/trigger.dev) | Next.js, TypeScript | **$50 - $200** per bounty | [adityashirsatrao007/OSM-trigger.dev](https://github.com/adityashirsatrao007/OSM-trigger.dev) |
| [ether/etherpad-lite](https://github.com/ether/etherpad-lite) | JavaScript | **~$80 USD** per bounty | [adityashirsatrao007/OSM-etherpad-lite](https://github.com/adityashirsatrao007/OSM-etherpad-lite) |
| [BusKill/buskill-app](https://github.com/BusKill/buskill-app) | Shell, Python | **~$2,340 USD** per bounty | [adityashirsatrao007/OSM-buskill-app](https://github.com/adityashirsatrao007/OSM-buskill-app) |
| [oliexdev/openScale](https://github.com/oliexdev/openScale) | Java, C++ | **~$30 USD** per bounty | [adityashirsatrao007/OSM-openScale](https://github.com/adityashirsatrao007/OSM-openScale) |
| [chozorho/conquest](https://gitlab.com/chozorho/conquest) | C++ | **$50+ USD** per bounty | *No Fork (Hosted on GitLab only)* |

### 🛠️ Execution Protocol for OSM Tasks
When the user requests to inspect or work on an "OSM" repository:
1. **Locate Target Fork:** Reference the user's fork above and run checking/git operations locally.
2. **Read CONTRIBUTING.md:** Prior to writing code, always locate and read `CONTRIBUTING.md` inside the project to align with contribution rules (coding standard, tests, issue assignment).
3. **Autonomous Setup:** Run system setups (dependencies, environments) autonomously using correct language package managers (`bun install`, `npm install`, `pip install`, `flutter pub get`, etc.).
4. **Conventional Commits:** Commit code changes using conventional structures (`fix(bounty-12): <description>`).






---

## 🔐 Password Security — Hashing, Salting, Bcrypt & Argon2

### Core Concepts

**Password Hashing** is a one-way cryptographic transformation. The same input always produces the same output (deterministic). This is why plain hashes alone are **never enough** for password storage.

**Why unsalted hashes fail:**
- Hash tables: pre-computed databases mapping passwords → hashes (instant lookup)
- Rainbow tables: compressed version (space-time tradeoff via reduction chains)
- Dictionary attacks: pre-computed wordlists + common patterns
- Modern GPUs can compute **billions of hashes/second** — unsalted SHA-256 is trivial to crack

**Salting** adds a cryptographically random value per credential before hashing:
```
hash(password + salt) → stored_hash
```
This forces attackers to compute a new hash table per user — making bulk cracking computationally infeasible.

### Salting Rules (OWASP-Compliant)
- ✅ Generate a **new unique salt per credential** (not per user, not system-wide)
- ✅ Use a **CSPRNG** (Cryptographically Secure Pseudo-Random Number Generator)
- ✅ Salt size: **32-64 bytes** minimum
- ✅ Store: `username | salt (cleartext) | hash` together
- ✅ Re-salt on every password reset
- ❌ Never use system-wide salts (defeats the purpose)
- ❌ Never reveal if two users share a password (correlation attack)

### Algorithm Comparison

| Algorithm | Memory Hard | GPU Resistant | OWASP Rec. | Use Case |
|-----------|-------------|----------------|------------|----------|
| **MD5** | ❌ | ❌ | ❌ NEVER | Legacy only |
| **SHA-256** | ❌ | ❌ | ❌ NEVER | Data integrity, NOT passwords |
| **bcrypt** | ✅ (moderate) | ✅ | ✅ Yes | Most production apps |
| **scrypt** | ✅ (high RAM) | ✅ | ✅ Yes | High-security, CPU+RAM bound |
| **Argon2id** | ✅ (best) | ✅ | ✅ **Top Pick** | Modern systems, winner of PHC 2015 |
| **PBKDF2** | ❌ | Partial | ✅ (FIPS context) | FIPS compliance, old systems |

### Argon2 Deep Dive
**Argon2id** = hybrid of Argon2d (data-dependent, GPU-resistant) + Argon2i (data-independent, side-channel resistant)
- **Parameters:** `time` (iterations), `memory` (RAM in KB), `parallelism` (threads)
- **Winner of Password Hashing Competition (2015)**
- Recommended minimum params (2024): `time=2, memory=65536 (64MB), parallelism=2`

### bcrypt Deep Dive
- **Cost factor** (work factor) is adjustable — scales with hardware
- Embeds salt within the output hash string (`$2b$12$...`)
- Max password length: **72 bytes** (silently truncates longer passwords!)
- Widely supported across all languages: Node.js `bcrypt`, Python `bcrypt`, Go `golang.org/x/crypto/bcrypt`
- Recommended cost: **12+** (adjust so hash takes ~100-300ms on your server)

### Production Code Patterns

**Node.js — bcrypt:**
```js
const bcrypt = require('bcrypt');
const SALT_ROUNDS = 12;

// Storing
const hash = await bcrypt.hash(password, SALT_ROUNDS);

// Verifying
const match = await bcrypt.compare(candidatePassword, storedHash);
```

**Node.js — Argon2:**
```js
const argon2 = require('argon2');

// Storing
const hash = await argon2.hash(password, {
  type: argon2.argon2id,
  memoryCost: 65536,  // 64MB
  timeCost: 2,
  parallelism: 2,
});

// Verifying
const match = await argon2.verify(storedHash, candidatePassword);
```

**Python — bcrypt:**
```python
import bcrypt
hash = bcrypt.hashpw(password.encode(), bcrypt.gensalt(rounds=12))
match = bcrypt.checkpw(candidate.encode(), hash)
```

**Python — Argon2:**
```python
from argon2 import PasswordHasher
ph = PasswordHasher(time_cost=2, memory_cost=65536, parallelism=2)
hash = ph.hash(password)
ph.verify(hash, candidate)  # raises VerifyMismatchError if wrong
```

### Decision Tree: Which to Use
```
New project (2025)?
  → Use Argon2id (best security, PHC winner)

Legacy Node.js/PHP stack?
  → Use bcrypt (excellent support, battle-tested)

FIPS compliance needed (US government, finance)?
  → Use PBKDF2-SHA256 (FIPS 140-2 certified)

High-security + lots of RAM available?
  → Use scrypt (memory-hard, used by Litecoin)
```

### Breach Response Protocol
If a database breach occurs:
1. **Immediately** treat all passwords as compromised (even if salted)
2. Notify users — force password reset
3. Generate new salts during reset
4. Increase bcrypt cost factor / Argon2 memory if possible
5. Enable MFA for all accounts

### Reference Sources
- Auth0: [Adding Salt to Hashing](https://auth0.com/blog/adding-salt-to-hashing-a-better-way-to-store-passwords/)
- Proton: [Password Hashing and Salting](https://proton.me/blog/password-hashing-salting)
- Stytch: [Argon2 vs bcrypt vs scrypt](https://stytch.com/blog/argon2-vs-bcrypt-vs-scrypt/)
- GitHub: [chandanagrawal23/System-Design](https://github.com/chandanagrawal23/System-Design) — PDFs: `PasswordHashing_Notes.pdf`, `BcryptArgon2_Notes.pdf`, `JWT_Notes.pdf`

---

## 📊 AlgoTracker — DSA Practice Platform

**URL:** [algotracker.in](https://www.algotracker.in)
**Creator:** Chandan Agrawal
**Tech Stack:** HTML, CSS, JavaScript (Materialize CSS + Google Fonts Inter)

### What AlgoTracker Is
A free web-based DSA practice tracker with:
- **800+ DSA problems** organized by topic
- **Blind75** curated list (best for 2-week interview prep)
- **LeetCode 150** list (best for 1-2 month prep)
- **SQL** challenges
- **System Design (LLD & HLD)** section
- **C++ solutions** bundled
- Progress tracking (mark problems as solved)
- Google Analytics integration for usage tracking

### Architecture Notes
- Pure HTML/JS frontend — no framework, uses Materialize CSS v1.0.0
- SEO optimized (full meta tags, canonical URLs, OG tags)
- Lightweight — loads fast, no backend required
- All content is client-side JavaScript rendered

### How to Use for Interview Prep
- **2 weeks to interview:** Focus on Blind75 list
- **1-2 months:** Work through LeetCode150
- **Ongoing:** Use the DSA tab to systematically cover all topics
- Track progress by marking problems complete
- Reference bundled C++ solutions to understand optimal patterns

### Reference for Agent
When building similar DSA/coding tools, model structure after AlgoTracker:
- Topic-based organization (Arrays, Trees, DP, Graphs, etc.)
- Visual progress tracking
- Clean, mobile-responsive design
- No auth required for basic tracking (localStorage)


---

## 🗺️ AI Engineering Roadmap 2026 — 5-Month Production Track

> Source: *Realistic AI Engineering Roadmap for 2026*
> Philosophy: **Fundamentals → Retrieval → Agents → Production → Safety** (in this exact order)

---

### ⚠️ Core Warning (Encode This Permanently)
- Do NOT touch LangChain/frameworks until you've built RAG from primitives
- Do NOT skip foundation phase — it's why most people get stuck on agents
- Prototypes ≠ Production. Production = traceability + observability + evals + rollback

---

### Phase 1: Foundation (Month 1–2)

**Goal:** Technical base before touching any orchestration framework.

| Topic | What to Do |
|-------|-----------|
| **Python Mastery** | Async programming, decorators, type hints, clean modular code. Move beyond tutorials. |
| **Git + APIs + SQL** | Non-negotiable. Build FastAPI/Flask apps. Practice SQL with PostgreSQL or DuckDB. |
| **Docker Fundamentals** | Containerize local env. Multi-stage builds to keep AI images small. |
| **LLM Mechanics** | Tokens, context windows, temperature, sampling, embeddings — before any framework. |
| **Raw API Integration** | Call OpenAI/Claude APIs directly with raw `requests`. No frameworks yet. |

**YouTube Channels:**
- `Corey Schafer` — Python fundamentals and practical projects
- `ArjanCodes` — Clean Python engineering, architecture, type-safe coding
- `3Blue1Brown` — Visual intuition for neural networks and math
- `DeepLearning.AI` — Structured beginner-to-intermediate AI education
- `Krish Naik` — Practical AI, ML, Python, deployment

**Courses:**
- Python for Everybody — Python basics and momentum
- DeepLearning.AI: AI for Everyone — AI landscape without deep math
- DeepLearning.AI: ChatGPT Prompt Engineering for Developers

---

### Phase 2: Core Skills & Infrastructure (Month 2–3)

**Goal:** Retrieval, vector storage, context handling, agent primitives — from scratch.

| Topic | What to Do |
|-------|-----------|
| **RAG from Scratch** | Build retrieval-augmented generation pipeline manually — no LangChain |
| **Vector Databases** | Pinecone, ChromaDB, or pgvector. Understand HNSW and IVF indexing concepts |
| **GPU Infrastructure** | Local model runtimes: Ollama or vLLM. NVIDIA container tooling basics |
| **Context Engineering** | Dynamic context windows, relevant memory, retrieval quality — beyond prompt writing |
| **Agent Primitives** | Build a small ReAct loop from scratch — understand reasoning, tool use, execution |

**YouTube Channels:**
- `Matthew Berman` — local models, AI tooling, practical infra
- `James Briggs` — RAG systems, retrieval, embeddings, vector databases
- `AssemblyAI` — LLM internals, embeddings, AI engineering explainers

**Courses:**
- DeepLearning.AI: Building Systems with the ChatGPT API
- Pinecone learning resources — hands-on retrieval
- Hugging Face course (selected sections) — tokenization, embeddings, transformers

---

### Phase 3: Agentic AI & Orchestration (Month 3–4)

**Goal:** Multi-agent systems, tool use, memory, MCP, evaluation — after building single agent from scratch.

| Topic | What to Do |
|-------|-----------|
| **Multi-Agent Systems** | CrewAI, LangGraph — ONLY after building single-agent loop from scratch |
| **Tool Use & Function Calling** | Understand how agents call tools under the hood, not just framework wrappers |
| **MCP (Model Context Protocol)** | Emerging standard for connecting models to tools and context — learn it now |
| **Memory Architectures** | Short-term, long-term, and episodic memory patterns |
| **Agent Evaluation** | Reliability, task completion, hallucination rates, failure case testing |

**YouTube Channels:**
- `AI Jason` — practical agent workflows and applied AI building
- `LangChain official` — orchestration patterns (only after you know primitives)
- `Simon Willison` — high-signal AI, tool-use, product-grade AI thinking

**Courses:**
- DeepLearning.AI short courses on agents and orchestration
- LangGraph tutorials (after single-agent comfort)

---

### Phase 4: Production, MLOps & AIOps (Month 4–5)

**Goal:** Ship and operate. This is where tutorials stop and real engineering starts.

| Topic | Tool / Action |
|-------|--------------|
| **Fine-tuning** | LoRA / QLoRA — parameter-efficient, works on GTX 1650 Ti with 4GB VRAM |
| **LLMOps** | Version prompts, configs, datasets, and evaluations — not just code |
| **Monitoring & Tracing** | Langfuse or Helicone — track traces, latency, quality, cost |
| **Evaluation Frameworks** | RAGAS or golden test sets — measure if system improves over time |
| **Experiment Tracking** | MLflow or Weights & Biases — prompt, run, and model tracking |
| **Data Versioning** | DVC — if datasets or retrieval corpora change often |
| **CI/CD for AI** | GitHub Actions — run tests/evals when prompts, retrieval, or models change |
| **Scalable Serving** | KServe or Seldon Core — Kubernetes-based model serving |
| **Cloud Deployment** | Pick ONE: AWS / GCP / Azure — Docker + basic deployment |
| **Semantic Caching** | GPTCache — cut costs and improve repeated-response speed |
| **AIOps** | AI for log analysis, anomaly detection, auto-remediation |

**YouTube Channels:**
- `MLOps.community` — production ML and LLMOps
- `Hugging Face` — fine-tuning, open models, inference, deployment
- `Unsloth` — fast LoRA and QLoRA experimentation
- `TechWorld with Nana` — DevOps, Docker, Kubernetes, cloud

**Courses:**
- Hugging Face course — transformers, fine-tuning, inference
- Weights & Biases learning content — experiment tracking and observability
- Terraform beginner courses — reproducible cloud infrastructure

---

### Phase 5: Safety, Ethics & Governance (Ongoing — Not a Separate Phase)

**Build this alongside everything else — not at the end.**

| Topic | Action |
|-------|--------|
| **Prompt Injection** | Treat as real production risk — especially with tool-using agents and RAG |
| **Jailbreaking & Output Filtering** | Understand manipulation vectors, add practical safeguards |
| **Data Privacy** | Never send PII/sensitive data to external APIs without strict controls |
| **Guardrails** | NeMo Guardrails or custom filtering pipelines for risky outputs |
| **Compliance** | EU AI Act basics — companies increasingly ask about governance in interviews |
| **Red Teaming** | Regularly test: prompt injection, tool abuse, unsafe outputs, retrieval leaks |

**Resources:**
- `Learn Prompting` — attack patterns, prompt injection, defensive thinking
- `Simon Willison` — safety commentary, model behavior, ecosystem changes
- EU AI Act official summaries

---

### 5-Month Execution Plan (Compressed Reference)

```
Month 1: Python seriously + Git daily + 1 API app + SQL basics + raw LLM calls
Month 2: RAG from scratch + 1 vector DB deep + Ollama local + simple ReAct agent
Month 3: Multi-agent workflow + memory + tool use + MCP basics + start evals
Month 4: Fine-tune small model (LoRA) + Langfuse + experiment tracking + CI/CD for prompts
Month 5: Deploy full AI app + monitoring + semantic caching + safety/red-team + write architecture note
```

---

### Resource Priority Matrix

| Category | Why It Matters | Best Channels |
|----------|----------------|---------------|
| Python Engineering | AI engineers ship code, not notebooks | Corey Schafer, ArjanCodes |
| AI Intuition | Understand failures by understanding internals | 3Blue1Brown, AssemblyAI |
| Structured Learning | Prevent random learning, build sequence | DeepLearning.AI, Hugging Face |
| Hands-on Projects | Makes concepts stick, becomes portfolio proof | Krish Naik, Matthew Berman, James Briggs |
| Agentic Systems | Tool use, memory, orchestration — now central | AI Jason, LangGraph |
| Production AI | What companies actually hire for | MLOps.community, TechWorld with Nana |
| Safety & Governance | Enterprise AI requires this from day one | Learn Prompting, EU AI Act |

### For Absolute Beginners — Start With These 3 Only
1. **3Blue1Brown** — intuition and fundamentals
2. **DeepLearning.AI** — structured guided learning
3. **Krish Naik** — practical implementation and projects

---

### Tools Installed in `/home/aditya/.venvs/ml` for This Roadmap
| Tool | Phase | Purpose |
|------|-------|---------|
| `ollama` (v0.24.0) | Phase 2 | Local LLM runtime — run Llama, Mistral, Phi locally |
| `chromadb` | Phase 2 | Vector database for RAG pipelines |
| `langchain` + `langgraph` | Phase 3 | Orchestration (after primitives) |
| `crewai` | Phase 3 | Multi-agent framework |
| `langfuse` | Phase 4 | LLM tracing, monitoring, cost tracking |
| `ragas` | Phase 4 | RAG evaluation framework |
| `mlflow` | Phase 4 | Experiment tracking |
| `dvc` | Phase 4 | Data versioning |
| `fastapi` + `uvicorn` | Phase 1 | API building |

---

## 🐙 GitHub Power Tricks — Hidden Superpowers

> Source: *Ultimate GitHub Tricks Document*

---

### 1. GitMCP — Give AI a GitHub Brain 🧠

**URL:** [gitmcp.io](https://gitmcp.io)

GitMCP converts any GitHub repo into an AI-readable format — repo structure, file purposes, and code context — so AI tools can reason about it deeply.

**How to use:**
```
1. Go to gitmcp.io
2. Paste any GitHub repo URL (e.g. https://github.com/vercel/next.js)
3. GitMCP converts it to AI-friendly format
4. Then tell Claude/ChatGPT:
   "Explain this repo"
   "Find bug in auth logic"
   "Summarize the project structure"
```

**Best for:** Understanding large open-source repos, interview prep, contribution onboarding.

---

### 2. github.com → github.dev (Browser VS Code) ✨

Just change the URL domain:
```
https://github.com/facebook/react
→
https://github.dev/facebook/react
```
Full VS Code opens in the browser. No download, no setup. Edit files, read code, lightweight.

**Best for:** Quick edits, code reading on shared/college machines.

---

### 3. Press `.` (Dot) on Any Repo 🤯

**The most underrated trick:** Open any GitHub repo → press `.` on keyboard.

→ VS Code Web opens instantly. Same as `github.dev` but a ninja shortcut.

---

### 4. Gitingest — Repo X-Ray Scan 🧠

**URL:** Change URL domain:
```
https://github.com/expressjs/express
→
https://gitingest.com/expressjs/express
```

**Output:**
- Folder breakdown
- File purpose explanation
- Flow/architecture summary
- AI-friendly format for pasting into ChatGPT/Claude

**Best for:** Beginners, open-source contribution prep, interview prep.

---

### 5. Direct ZIP Download (No Git Required)

Append to any repo URL:
```
/archive/refs/heads/main.zip
```

**Example:**
```
https://github.com/tailwindlabs/tailwindcss/archive/refs/heads/main.zip
```
→ Direct ZIP download. No Git required, no cloning.

---

### 6. GitHub Search Dorking (Advanced) 🔥

GitHub has a powerful search engine — use it like a pro:

| Search Query | What it finds |
|-------------|---------------|
| `language:javascript authentication` | JS auth implementations |
| `"api_key" language:python` | Python files with API keys (learning only) |
| `good first issue` | Beginner-friendly open source issues |
| `internship OR hackathon` | Student projects and internship repos |
| `"TODO" language:go` | Unfinished Go code |
| `stars:>1000 language:rust` | Popular Rust projects |

⚠️ Ethical use only.

---

### 7. Repo Insights — Hidden Gold 📊

Any repo → click **Insights** tab:
- Contributor activity graph
- Code frequency over time
- Commit timeline
- Network graph

> If commits are dead → project is dead. Check before contributing.

---

### 8. GitHub Profile README (Portfolio Trick)

1. Create a repo with **exact same name as your GitHub username**
2. Add a `README.md`
3. Include: intro, skills, stats, badges, links

Result: Your GitHub profile becomes a professional portfolio page.

**Aditya's username:** `adityashirsatrao007` → Create repo `adityashirsatrao007/adityashirsatrao007`

---

### 9. GitHub + AI Power Combo Workflow

```
Repo URL
  → GitMCP (AI-readable structure)
  → Gitingest (architecture summary)
  → Claude/ChatGPT (logic analysis)
  → github.dev (modify in browser)
```
3x productivity on any codebase.

---

### 10. Raw Code Clean View

Add `?plain=1` to any GitHub file URL:
```
https://github.com/user/repo/blob/main/index.js?plain=1
```
→ Raw code with no GitHub UI clutter. Perfect for copying or AI pasting.

---

### Quick Reference Cheatsheet

| Trick | How |
|-------|-----|
| Browser VS Code | `github.com` → `github.dev` OR press `.` |
| AI-readable repo | `github.com` → `gitmcp.io` |
| Repo X-ray | `github.com` → `gitingest.com` |
| ZIP download | Append `/archive/refs/heads/main.zip` |
| Clean raw code | Append `?plain=1` to file URL |
| Search by language | `language:python <keyword>` |
| Find beginner issues | `good first issue` |
| Check repo health | Insights tab |
| Profile portfolio | Repo named same as username |



---


# Remix UI Implementation Guidance: Documentation Site

## Design Intent
The Remix documentation user interface must deliver an ultra-fast, visually precise, developer-first reading and code-exploration environment using a monospace-centric design system optimized for high density, readability, and keyboard navigation.

---

## 1. Context and Goals
The Remix documentation site serves developers and technical teams seeking immediate API references, architectural patterns, and code samples. This guide defines a system of semantic tokens and strict component-level constraints to ensure design consistency, reduce bundle bloat, and guarantee keyboard-navigable accessibility across the documentation surface. 

The site utilizes a high-density page structure featuring:
- Primary document reading layout with sidebar and table of contents.
- High component density including numerous links, hierarchical sidebars, code toggles, and unified keyboard-driven search inputs.

---

## 2. Design Tokens and Foundations

### Base Foundations
These base tokens are absolute, immutable values mapped from the Remix brand guidelines. They must not be overridden at the component level.

```json
{
  "font": {
    "family": {
      "primary": "JetBrains Mono",
      "stack": "JetBrains Mono, ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono, Courier New, monospace"
    },
    "size": {
      "xs": "10px",
      "sm": "12px",
      "base": "16px",
      "lg": "56px",
      "xl": "84px"
    },
    "weight": {
      "base": "400",
      "bold": "700"
    },
    "lineHeight": {
      "base": "24px",
      "tight": "1.2"
    }
  },
  "color": {
    "text": {
      "primary": "#dee2e6",
      "secondary": "#ffffff",
      "tertiary": "#57cda4"
    },
    "surface": {
      "base": "#000000",
      "muted": "#1e2226"
    },
    "border": {
      "default": "#c8c8c8"
    }
  },
  "space": {
    "1": "4px",
    "2": "6px",
    "3": "10px",
    "4": "16px",
    "5": "19px",
    "6": "20px",
    "7": "24px",
    "8": "27px"
  },
  "radius": {
    "xs": "24px",
    "sm": "999px"
  },
  "motion": {
    "duration": {
      "instant": "150ms"
    }
  }
}
```

### Semantic Token Mapping
All UI components must refer directly to these semantic mappings. Developers must never reference raw hex codes or absolute pixel dimensions.

| Semantic Token | Value / Mapping | Usage Context |
| :--- | :--- | :--- |
| `color.text.body` | `color.text.primary` (`#dee2e6`) | Default reading text, paragraphs, standard list items. |
| `color.text.heading` | `color.text.secondary` (`#ffffff`) | H1, H2, active nav item text, visual emphasis. |
| `color.text.link` | `color.text.tertiary` (`#57cda4`) | Standard inline links and interactive indicators. |
| `color.text.placeholder` | `#6c757d` | Input placeholder text (contrasts 4.5:1 against black). |
| `color.bg.canvas` | `color.surface.base` (`#000000`) | Global page background color. |
| `color.bg.container` | `color.surface.muted` (`#1e2226`) | Sidebars, code blocks, card overlays. |
| `color.bg.accent` | `color.text.tertiary` (`#57cda4`) | Badge fills, active accents, focus borders. |
| `color.border.ui` | `color.border.default` (`#c8c8c8`) | Default element dividers and input borders. |
| `color.border.focus` | `color.text.tertiary` (`#57cda4`) | Keyboard focus rings. |
| `space.inset.sm` | `space.2` (`6px`) `space.3` (`10px`) | Padding for small components (e.g. badges, list items). |
| `space.inset.md` | `space.4` (`16px`) | Padding for buttons, text inputs, and inline alerts. |
| `space.stack.md` | `space.7` (`24px`) | Vertical spacing between main layout blocks. |
| `radius.component` | `radius.xs` (`24px`) | Button, input, and container rounding. |
| `radius.pill` | `radius.sm` (`999px`) | Focus rings and pill-shaped badge elements. |
| `transition.instant` | `motion.duration.instant` (`150ms`) | Speed of CSS states (hover, focus, active). |

---

## 3. Component-Level Rules

Remix documentation pages maintain a high density of components. Standard density expectations per layout viewport:
- **Links:** 24 per page
- **Navigation blocks:** 3 per page (Global Top Nav, Docs Sidebar Nav, In-page Table of Contents)
- **Buttons:** 2 per page (Code-copy actions, version switchers)
- **Inputs:** 1 per page (Documentation Search)
- **Lists:** 1 per page (Sidebar category hierarchies)

---

### Component 1: Links (Density: 24/page)
Inline or standalone text element linking to external sites or other documentation pages.

#### Component Anatomy & Variants
- **Anatomy:** Text string (primary anchor) + visual pointer indicator on focus.
- **Inline Link Variant:** Embedded in body text, underlined by default.
- **Sidebar Link Variant:** Sourced in nav bars, sans-underline, uses indentation spacing.

#### Spacing & Typography
- Typography must utilize `font.family.stack` with `font.size.base` for inline text, or `font.size.sm` for sidebar links.
- Line height must be `font.lineHeight.base`.
- Inline links must have zero padding; sidebar links must have vertical padding of `space.2` and horizontal padding of `space.3`.

#### State Matrix
- **Default State:** Foreground is `color.text.link`. Underlined if inline.
- **Hover State:** Foreground transitions instantly to `color.text.heading`. Underline thickness increases to 2px.
- **Focus-Visible State:** Background becomes `color.surface.muted`. Outline ring of 2px `color.border.focus` forms around target with offset of `space.1`. Outline must be visible on keyboard navigation.
- **Active State:** Foreground shifts to `color.text.heading`. Translate-y down 1px.
- **Disabled State:** Foreground opacity is reduced to 40%. Pointer-events are disabled.
- **Loading State:** Text remains, background has a pulse animation alternating opacity between 30% and 60% with speed of `400ms`.
- **Error State:** Foreground is red `#fa5252`, text is appended with a warning icon.

#### Interactions & Device Behavior
- **Keyboard:** Must trigger action on `Enter` keypress.
- **Pointer:** Hover state triggered on mouseover. Pointer cursor must display.
- **Touch:** Minimum touch target height must be `44px` (achieved via transparent pseudo-element overlays for inline links, or layout height for sidebar links).
- **Edge Cases:** Text exceeding the containing element width must wrap naturally if inline. Sidebar links must truncate with an ellipsis (`overflow: hidden; text-overflow: ellipsis; white-space: nowrap;`) and should reveal full text via standard HTML `title` on hover.

---

### Component 2: Navigation Blocks (Density: 3/page)
Controls page layout, directory traversing, and in-page sections. The three variants are: Global Top Nav, Docs Sidebar Nav, and In-page Table of Contents (ToC).

#### Component Anatomy & Variants
- **Global Top Nav:** Horizontal strip containing logo, version picker, and high-level sections.
- **Docs Sidebar Nav:** Vertical hierarchical tree representing documents structure.
- **Table of Contents (ToC):** Vertical, sticky layout detailing current page anchors.

#### Spacing & Typography
- **Top Nav:** Height must be exactly `56px`. Padding must be `space.4` horizontally. Font size must be `font.size.md`.
- **Sidebar Nav:** Width must be exactly `280px`. Vertical spacing between links must be `space.2`.
- **ToC:** Font size must be `font.size.xs`. Line height must be `14px`. Padding-left indent must increase by `space.3` per heading tier.

#### State Matrix
- **Default State (Inactive Item):** Text color is `color.text.body`.
- **Hover State:** Text color transitions to `color.text.heading`.
- **Focus-Visible State:** Outline ring of 2px `color.border.focus` around navigation anchor element.
- **Active State (Selected Document):** Text color is `color.text.heading`. Left border indicator of 3px `color.bg.accent` must render (Sidebar Nav variant).
- **Disabled State:** Hidden from view or grayed out (`opacity: 0.3`) and omitted from tab sequence via `tabindex="-1"`.
- **Loading State:** Active section name scales down slightly, and a spinning inline loading wheel replaces active status indicators.
- **Error State:** Not applicable to nav routing.

#### Interactions & Device Behavior
- **Keyboard Navigation:** Tab keys switch between nav containers. Sidebar hierarchical lists must support navigation with Up/Down arrow keys, collapsing or expanding child routes using Left/Right arrow keys respectively.
- **Pointer & Touch:** Sidebar list expansion toggles on clicking folder arrow icons. Target touch areas must measure at least `44px` vertically.
- **Responsive Handling:** Below `1024px` viewport width, the Docs Sidebar Nav must collapse into an off-canvas drawer controlled by a persistent header menu toggle button. The ToC must hide entirely on viewports narrower than `1280px`.

---

### Component 3: Buttons (Density: 2/page)
Trigger actions within page contexts, specifically copying code snippets and switching docs versions.

#### Component Anatomy & Variants
- **Copy Button:** Compact, square icon-only button placed absolute inside code blocks.
- **Dropdown Selector Button:** Pill-shaped selector with label and trailing arrow icon for version switching.

#### Spacing & Typography
- **Copy Button:** Dimensions must be exactly `32px` by `32px`. Internal spacing must be centered. Radius must be `radius.xs`.
- **Dropdown Selector:** Height must be `36px`. Padding must be `space.2` vertically and `space.4` horizontally. Font style must be `font.family.primary`, size `font.size.sm`.

#### State Matrix
- **Default State:** Background is `color.surface.muted`, border is 1px `color.border.ui`, text color is `color.text.body`.
- **Hover State:** Background is `color.surface.base`, border is 1px `color.text.heading`, text color is `color.text.secondary`.
- **Focus-Visible State:** Outer focus ring of 2px `color.border.focus` with an offset spacing of `2px`.
- **Active State:** Background is `#212529`. Dropdown overlay scales to `1.0` if version switcher is activated.
- **Disabled State:** Opacity reduced to 30%. Cursor set to `not-allowed`. Keyboard trigger blocked.
- **Loading State:** Button text is replaced by a centered loading spinner. Icon buttons spin.
- **Error State:** Red border (`#fa5252`) and shake animation (5px translation back and forth) for 150ms.

#### Interactions & Device Behavior
- **Keyboard:** Must execute action on `Space` or `Enter` keydown. Dropdown Selector must open options menu on `Down Arrow` keypress.
- **Pointer/Touch:** Click/tap initiates immediate action. Transitions must execute at `transition.instant`.
- **Empty States / Edge Cases:** Version dropdown selection items must limit display height to a max-content vertical scroll height of 300px, utilizing `overflow-y: auto` with custom monospace scrollbars.

---

### Component 4: Inputs (Density: 1/page)
Command-palette/Search text input located at the top of the viewport for search queries.

#### Component Anatomy & Variants
- **Search Input:** Text field + prepended magnifying glass icon + appended keyboard shortcut badge (`Cmd+K`).

#### Spacing & Typography
- Input field height must be exactly `40px`.
- Horizontal padding must be `space.4`. Prepended icon spacing must use `space.3`.
- Typography must utilize `font.family.primary` with `font.size.md`.
- Border radius must be `radius.xs`.

#### State Matrix
- **Default State:** Background is `color.surface.muted`, border is 1px `color.border.ui`, text is `color.text.body`. Shortcut badge is visible.
- **Hover State:** Border transitions to `color.text.heading`.
- **Focus-Visible (Focused) State:** Border changes to `color.border.focus`, background to `color.surface.base`. Outline ring of 2px `color.border.focus` scales in. Shortcut badge disappears.
- **Active State:** Identical to focused state.
- **Disabled State:** Not applicable to global search.
- **Loading State:** Magnifying glass icon is replaced by a spinning loader.
- **Error State:** Border becomes red (`#fa5252`), text color becomes red, validation text displays below container.

#### Interactions & Device Behavior
- **Keyboard:** Focus is captured globally on pressing `/` or `Cmd+K`. Pressing `Esc` clears input and releases focus. Up and down arrows navigate search results dropdown list.
- **Pointer/Touch:** Focus triggered on click/tap. Clears input with a visible "X" action button on touch screens.
- **Edge Cases (Long Content):** Search text must scroll horizontally if it exceeds container width. Text wrap inside the input field is prohibited.

---

### Component 5: Lists (Density: 1/page)
The directory structures, search results lists, or document category sections.

#### Component Anatomy & Variants
- **Hierarchical List:** Indented nested lines representing categories and pages. Includes collapsible folder groups.

#### Spacing & Typography
- List items must be vertically separated by `space.2`.
- Child items must be indented by `space.4` per hierarchy level.
- Font size must be `font.size.sm`. Line height must be `font.lineHeight.base`.

#### State Matrix
- **Default State:** Item text color is `color.text.body`. Folder toggle is pointing right.
- **Hover State:** Item background becomes `color.surface.muted`, text transitions to `color.text.heading`.
- **Focus-Visible State:** Focal ring of 2px `color.border.focus` overlays the targeted item row.
- **Active State:** Selected category item text is `color.text.heading`. Font weight is set to `font.weight.bold`.
- **Disabled State (Unpublished Docs):** Text color changed to `#495057`. Item selection is blocked.
- **Loading State:** Nested list node displays an empty state block with a skeleton animation pulsing between 20% and 40% opacity.
- **Error State:** Item displays with a red warning badge if category fail to load.

#### Interactions & Device Behavior
- **Keyboard:** Lists must support keyboard traversing. Focus moves sequentially down items. Expand/Collapse folders using Right/Left arrows.
- **Pointer/Touch:** Folders toggle state on clicking or tapping row banners.
- **Empty States:** When a folder is expanded but empty, it must display the message "No articles available" indented by `space.4` in color `#6c757d` with font-style set to italic.

---

## 4. Accessibility Requirements & Testable Criteria

Remix components must adhere to WCAG 2.2 AA target rules. 

### Mandatory Implementation Requirements
1. **Interactive Element Contrast:** All interactive elements (text buttons, inputs, links) must exceed a contrast ratio of `4.5:1` against the solid black (`color.surface.base`) background.
2. **Keyboard Traversal:** The document must maintain a logical tab order starting from Skip Navigation, moving through Main Nav, Sidebar Nav, Search Input, page content links, and ending in footer links.
3. **Focus Isolation:** Modals (e.g. search dialogue overlay) must trap focus inside the dialog box. Tab traversal must wrap within the modal when active. Focus must return to the triggering element on exit.
4. **ARIA Roles:** Expandable folders must utilize `aria-expanded="true|false"` attributes. Search inputs must map to `role="searchbox"`. Nav containers must use `<nav>` tags with distinct `aria-label` descriptors.

### Pass/Fail Acceptance Criteria

```
[PASS] Text elements meet contrast of 4.5:1.
[FAIL] Using #495057 text directly on a #000000 background (contrast ratio: 2.2:1).

[PASS] Interactive elements display a distinct, 2px thick focus-visible outline when navigated via keyboard.
[FAIL] Using styling blocks with outline: none or outline: 0 without custom focus states.

[PASS] Skip to content link is hidden off-screen on initial page load, and displays at top left of viewport on first Tab keypress.
[FAIL] Skip navigation anchors are completely missing, forcing screen readers to read sidebar nav menus on every single page load.

[PASS] Modal overlay traps keyboard focus; user cannot tab into obscured page links underneath search dialogue.
[FAIL] Search overlay allows tab sequence to exit modal boundaries and scroll the underlying layout screen.
```

---

## 5. Content and Tone Standards

### Tone of Voice
Guidance, error reporting, and documentation labels must be:
- **Concise:** Keep actions short. Omit flowery adjectives.
- **Confident:** State facts directly. Do not apologize or sound hesitant.
- **Implementation-focused:** Directly tell the developer what to input, output, or check.

### Code and Copy Guidelines
- Use code-like variables or exact actions.
- Avoid phrases like "Please click here" or "Oops, something went wrong".

### Action Examples

| Context | Prohibited Copy (DO NOT) | Compliant Copy (DO) |
| :--- | :--- | :--- |
| **Search Input** | "Please type here to find a document." | "Search Remix docs..." |
| **Empty Folder List** | "Oops! It looks like we don't have any items in this folder yet." | "No articles available." |
| **Loading Error** | "We are so sorry, but the documentation failed to load." | "Failed to fetch document tree. Retry." |
| **Code Block Action** | "Click here if you want to copy code!" | "Copy" |

---

## 6. Anti-Patterns and Prohibited Implementations

Developers and designers must not implement the following visual or structural patterns:
- **No Raw Colors:** Do not use Tailwind default colors (e.g. `text-blue-500`) or custom hex codes. You must use designated semantic tokens.
- **No Outline Disabling:** Do not set `outline: none` on interactive focus properties unless replacing it with an equivalent or stronger visual focus style matching the brand's primary color palette.
- **No Inline Spacing Exceptions:** Adding `margin-top: 13px` or other arbitrary margins is strictly prohibited. Spacer calculations must resolve to mapped `space.[1-8]` tokens.
- **No Non-Semantic HTML:** Do not map clickable button events to non-interactive elements like `<div>` or `<span>`. Interactive elements must utilize `<button>` or `<a>` tag foundations.

---

## 7. QA Checklist

Before committing code changes to the documentation site build repository, engineers must verify compliance against this list:

- [ ] All interactive elements (links, navigation items, buttons, inputs) meet WCAG 2.2 AA `4.5:1` minimum color contrast requirements.
- [ ] Tab navigation traverses the page layout logically without skipping elements or getting caught in focus loops.
- [ ] No raw colors or absolute margins are referenced in stylesheets; all code mappings utilize semantic design tokens.
- [ ] Components render expected state variations: default, hover, focus-visible, active, disabled, loading, and error.
- [ ] Global search command-palette shortcut (`Cmd+K` / `/`) is wired and successfully traps focus when triggered.
- [ ] All clickable actions use semantic markup tags (`<button>` or `<a>` with valid `href` destinations).
- [ ] Off-canvas menus on responsive mobile viewports are fully keyboard-navigable and collapsible.
- [ ] Copy blocks are clean, direct, and implementation-focused; "please", "oops", and ambiguous labels are excluded.
- [ ] Buttons and links support touch targets of at least `44px` height.

---

## 8. Immersive & 3D Web Design Principles (Noomo Agency Guidance)

Based on industry leading practices for immersive brand activations, WebGL development, and 3D web experience design:

### A. The Immersive UX Mindset
* **Active Participation over Passive Consumption:** Standard websites present information flatly. 3D websites transform the user from a passive reader into an active participant. Interactivity must trigger immediate visual and physical responses (e.g., cursor interactivity, scroll-driven camera movements, 360-degree product rotation).
* **Narrative-Driven Storytelling:** The most successful 3D and AR implementations integrate brand narrative directly into the environment. Do not treat 3D as a decorative gimmick; it must tell a cohesive story.

### B. Implementation Methodologies
When choosing a technology stack for three-dimensional representations, select the appropriate method:

1. **Pre-rendered 3D Video**
   * *Best For:* Controlled cinematic sequences, landing hero sequences with complex lighting or animation that cannot be rendered in real-time.
   * *Disadvantage:* Lacks interactivity; high bandwidth consumption.
2. **Interactive Image Sequences**
   * *Best For:* Lightweight simulated 3D rotations or animations tied to scroll triggers or mouse horizontal drag events.
   * *Disadvantage:* Limited to predefined paths; can break or jitter if image density is too low.
3. **Real-Time WebGL Rendering (Three.js, React Three Fiber, OGL, Spline)**
   * *Best For:* High-fidelity product configurators (e.g., custom glass materials, colorways) and fully interactive 3D spaces.
   * *Disadvantage:* High resource overhead; requires significant development and optimization.

### C. Technical & Layering Rules (MANDATORY)
To prevent common layout and accessibility issues in 3D-integrated interfaces:
* **Background Layering:** WebGL canvases acting as interactive backgrounds must be styled with `position: fixed` or `position: absolute`, `top: 0`, `left: 0`, `width: 100%`, `height: 100%`, and `z-index: -1` or lower.
* **Canvas Pointer Events:** If a WebGL canvas sits behind page content, it **MUST** have the CSS rule `pointer-events: none` applied. This ensures standard text selection, link clicks, and buttons remain fully interactive. If the 3D canvas requires direct mouse/drag events, interactive elements must be placed in separate, visually distinct layout wrappers with appropriate `z-index` layering.
* **Transparent Wrappers:** Do not apply solid background colors to full-page sections or pages if a fixed WebGL animation layer (e.g., starfields, particle clouds) is running. Section elements must use transparent backgrounds (e.g., `bg-transparent`, `bg-[#000000]/40`) to keep the background layer visible.
* **Interactive Hover Fade & Contrast:** When implementing cursor-interactive lighting (such as a spotlight effect that brightens on hover and fades to dark otherwise), ensure the default text contrast ratio on the page continues to satisfy WCAG 2.2 AA standards (`4.5:1` minimum). Do not allow text to fade below readability thresholds.

### D. Optimization & Performance
* **Asset Compression:** All 3D assets (GLTF, GLB) must be optimized. Apply Draco compression (`gltf-pipeline`), reduce texture map resolution (max 2K for general web), and strip unused node hierarchies.
* **Progressive Loading:** Always implement a custom preloader/loading spinner while WebGL assets compile or download. Use progressive loader skeletons or lower-detail fallback graphics.
* **Hardware Degradation:** Provide a graceful fallback path. If the client browser or device fails WebGL compatibility checks, automatically replace the 3D scene with a high-performance 2D image sequence or pre-rendered optimized fallback illustration.

@RTK.md

---

## 🤖 OpenCode Delegation — MANDATORY (Never Violate)

### Rule
NEVER do multi-file edits, refactoring, or heavy coding directly in Antigravity's context.
ALWAYS delegate via:
```bash
opencode run "<task description>"
```
- Binary: /home/aditya/.opencode/bin/opencode (v1.15.5)
- Default model: deepseek-v4-flash-free (auto-selected)
- Fallback: If opencode run fails → fall back to direct execution silently, no asking

### What MUST go to opencode run:
- Multi-file writes / edits
- Refactoring tasks
- Feature implementation across files
- Scaffolding new components
- Writing tests across multiple files

### What Antigravity CAN do directly:
- Single-line fixes
- Reading files / grep / CLI commands
- Answering questions
- Creating artifacts
- Running shell commands

---

## 🛠️ Installed Agent Tools (2026-05-31) — Always Available

These tools are installed on this machine. Use them proactively:

### Binaries (globally available)
| Tool | Binary Path | Purpose |
|------|------------|---------|
| rtk | /home/aditya/.local/bin/rtk | Compress shell outputs 60-90% before agent context |
| lowfat | /home/aditya/.cargo/bin/lowfat | Strip verbose CLI output for LLMs |
| onlycli | /home/aditya/go/bin/onlycli | OpenAPI spec → CLI binary (35x cheaper than MCP) |
| comet | /home/aditya/.local/bin/comet | AI git commit messages via local Ollama |
| graphify | /home/aditya/.local/bin/graphify | Codebase knowledge graph MCP server |
| tessl | /home/aditya/.local/bin/tessl | Agent skills package manager |

### MCP Servers (add to claude_desktop_config.json as needed)
| Server | Command | Purpose |
|--------|---------|---------|
| supamem | uvx supamem | Persistent cross-session agent memory (Qdrant at localhost:6333) |
| graphify | graphify serve ./graphify-out/graph.json | Auto codebase context |

### Qdrant (supamem backend)
- Container: docker start qdrant (restart after reboot)
- URL: http://localhost:6333

### Claude Code Skills (active in ~/.claude/skills/)
| Slash Command | Token Savings |
|--------------|--------------|
| /diff-only | 60-80% output tokens |
| /smart-read | 40-90% input tokens |
| /trim | 55-70% input tokens |
| /checkpoint | Compresses 8k-40k tokens to ~500 |

### Cloned Repos (~/tools/agent-tools/)
agent-tact, agentguard, ai-plugin-gatekeeper, claude-deepseek-bridge, claude-smart-model-router, clawpiggy, lean-code, mcp-graphify-autotrigger, openclaw-litecache, pomelo-context, skill-model-router, smart-library-app, trache

### Claude→DeepSeek Bridge (avoid Claude Pro limits)
```bash
export ANTHROPIC_BASE_URL=https://api.deepseek.com/anthropic
export ANTHROPIC_AUTH_TOKEN=sk-YOUR_DEEPSEEK_KEY
export ANTHROPIC_MODEL=deepseek-v4-pro
claude  # now uses DeepSeek under the hood
```
