# AI Gallery Studio

**An intelligent photo gallery powered by Next.js, MongoDB, and Google's Gemini AI for seamless organization and enhancement.**

## 🌟 Project Overview

AI Gallery Studio is a cutting-edge web application designed to revolutionize how you manage and interact with your personal photo collection. Tired of sifting through countless images to find that one specific shot, or struggling to categorize them manually? This application leverages advanced generative AI to automate these tedious tasks, transforming your gallery into a smart, searchable, and easily manageable archive.

From intelligent metadata generation and defect detection to semantic search and AI-powered editing, AI Gallery Studio puts the power of artificial intelligence at your fingertips, making photo management intuitive and enjoyable.

![AI Gallery Studio Screenshot](https://placehold.co/800x450/201b2c/8b725c?text=AI+Gallery+Studio+UI)
*(placeholder for your application's screenshot)*

## ✨ Key Features

This application isn't just a simple image viewer; it's an intelligent assistant for your photos:

-   **📸 Intelligent Uploads & Analysis:**
    -   **AI-Powered Metadata:** Upon upload, each image is automatically analyzed by Google's Gemini AI. It generates descriptive titles, detailed content descriptions (`metadata`), and relevant keywords (`tags`).
    -   **Defect Detection:** AI proactively identifies and flags potentially problematic images such as blurry shots, low-quality photos, or accidental screenshots (`isDefective`, `defectType`). These are automatically moved to a dedicated "Bin" for review.
    -   **Smart Categorization:** Leveraging AI, the system intelligently suggests and can automatically assign newly uploaded, non-defective images to existing user-defined folders.
-   **🔍 Advanced Search Capabilities:**
    -   **Natural Language Search:** Use conversational queries like "blurry photos of the city at night" to semantically search your entire collection based on AI-generated descriptions and tags.
-   **🎨 AI Image Editing:**
    -   **Generative Edits:** Describe desired changes to an image in plain language (e.g., "make the sky purple") and watch as AI generates a new, edited version.
-   **🗂️ Intuitive Organization:**
    -   **Custom Folders:** Create and manage your own folders to manually organize images.
    -   **Drag-and-Drop:** Easily move images between folders or to the bin using intuitive drag-and-drop gestures.
    -   **Bulk Actions:** Select multiple images to perform bulk operations like moving to the bin, exporting, or sharing.
-   **🔗 Secure Sharing:**
    -   **Ephemeral Galleries:** Generate secure, time-limited shareable links for a selection of your images, perfect for sharing with friends and family without compromising your main gallery.
    -   **Access Control:** Shared galleries include access tracking and automatic expiration.
-   **🔐 Robust Security:**
    -   **User Authentication:** Secure user registration and login are handled by NextAuth.js.
    -   **Database-backed Storage:** Unlike traditional galleries that store images on a public file system, all image data is securely embedded within the MongoDB database, preventing direct URL access to raw image files.

## 🤖 How AI Works Under the Hood (Genkit Flows)

The intelligence of AI Gallery Studio is powered by [Google AI Gemini](https://ai.google.dev/) and orchestrated using [Genkit](https://firebase.google.com/docs/genkit), an open-source framework for building AI-powered applications.

In this project, Genkit defines several "flows," each responsible for a specific AI task:

-   `/src/ai/flows/generate-image-metadata-flow.ts`:
    -   **Purpose:** Takes an image and generates a concise title, a detailed descriptive paragraph, and an array of relevant keywords.
    -   **Contribution:** Populates the `name`, `metadata`, and `tags` fields for each image, enabling rich searching.
-   `/src/ai/flows/detect-defective-images-flow.ts`:
    -   **Purpose:** Analyzes an image for common flaws like blurriness or low quality.
    -   **Contribution:** Sets the `isDefective` flag, allowing for automatic moving to the bin.
-   `/src/ai/flows/categorize-images-flow.ts`:
    -   **Purpose:** Given an image and a list of existing folder names, it predicts the most appropriate folder.
    -   **Contribution:** Facilitates automatic organization of new uploads.
-   `/src/ai/flows/advanced-search-images-flow.ts`:
    -   **Purpose:** An enhanced semantic search that understands complex queries and matches them against all available AI-generated metadata.
    -   **Contribution:** Powers the rich search experience.
-   `/src/ai/flows/edit-image-flow.ts`:
    -   **Purpose:** Takes an image and a textual description and uses generative AI to produce a new, modified image.
    -   **Contribution:** Enables creative, AI-driven image manipulation.

## 🛠️ Tech Stack

-   **Frontend:**
    -   [Next.js](https://nextjs.org/) (App Router)
    -   [TypeScript](https://www.typescriptlang.org/)
    -   [Tailwind CSS](https://tailwindcss.com/) & [shadcn/ui](https://ui.shadcn.com/)
    -   [Sharp](https://sharp.pixelplumbing.com/) for image optimization.
-   **Backend & Database:**
    -   [MongoDB](https://www.mongodb.com/) for all data, including binary image storage.
    -   [NextAuth.js](https://next-auth.js.org/) for secure authentication.
    -   [Bcrypt.js](https://github.com/dcodeIO/bcrypt.js) for password hashing.
-   **AI Integration:**
    -   [Google AI Gemini](https://ai.google.dev/)
    -   [Genkit](https://firebase.google.com/docs/genkit)
-   **Development Tools:**
    -   [Docker](https://www.docker.com/) & [Docker Compose](https://docs.docker.com/compose/)
    -   Custom shell scripts (`docker-run.sh`, `docker-stop.sh`, etc.) for streamlined environment management.

## 🚀 Getting Started

Follow these detailed instructions to get the project running on your local machine.

### Prerequisites

-   **Node.js (v18 or later):** Download from [nodejs.org](https://nodejs.org/).
-   **Git:** For cloning the repository.
-   **Docker Desktop:** Includes Docker Engine and Docker Compose. Download from [docker.com](https://www.docker.com/products/docker-desktop/).

---

### 🐳 Option 1: Running with Docker (Recommended)

This method provides a consistent, isolated environment for the application and its database. The included helper scripts automate the entire process.

**1. Clone the Repository**

```bash
git clone <your-repository-url>
cd studio
```

**2. Configure Environment Variables**

This project uses a `.env` file for configuration. Your scripts simplify its creation.

-   **Create `.env` file:** Copy the provided Docker template:
    ```bash
    cp .env.docker.example .env
    ```
    *Note: The `docker-run.sh` script will do this for you if you forget.*

-   **Add your Google AI API Key:** Open the newly created `.env` file and replace the placeholder for `GEMINI_API_KEY`:
    ```ini
    # .env
    GEMINI_API_KEY=your-google-ai-api-key-here
    ```
    > **Get your API Key:** Visit [Google AI Studio](https://aistudio.google.com/app/apikey) to generate a free API key. Without it, AI features will be disabled.

**3. Run the Application with Helper Scripts**

Make the scripts executable first:
```bash
chmod +x docker-run.sh docker-run-custom.sh docker-stop.sh
```

#### 3.1. Easy Start (Automatic Port Management)

The `docker-run.sh` script is the simplest way to start. It intelligently finds available ports, builds the Docker images, and starts the services.

```bash
./docker-run.sh
```

#### 3.2. Custom Ports (Advanced Control)

Use `docker-run-custom.sh` if you need to specify which ports to use. The script will fail if your chosen ports are already occupied.

-   **Example:** Run the app on port `8080` and MongoDB on `27018`:
    ```bash
    ./docker-run-custom.sh --app-port 8080 --mongo-port 27018
    ```
-   See all options: `./docker-run-custom.sh --help`

**4. Access the Application**

After running either script, open your web browser and navigate to the application URL provided in the terminal output (e.g., `http://localhost:9002`).

**5. Managing Your Docker Environment**

-   **To stop the containers (Preserves Data):** This command stops the containers but leaves your database volume intact.
    ```bash
    ./docker-stop.sh
    ```

-   **To stop and remove ALL data:** ⚠️ **Warning:** This will permanently delete the MongoDB data volume.
    ```bash
    ./docker-stop.sh --remove
    ```

-   **To view container logs:**
    ```bash
    docker compose logs -f
    ```

---

### 💻 Option 2: Running Locally (For Active Development)

This option is for developers who want to work directly on the codebase.

**1. Clone the Repository**

```bash
git clone <your-repository-url>
cd studio
```

**2. Run the Local Setup Script**

This script will check your Node.js version, install dependencies, create a `.env` file, and generate a secure `NEXTAUTH_SECRET`.

```bash
chmod +x setup.sh
./setup.sh
```

**3. Configure Environment Variables**

Open the `.env` file and add your keys:

-   `MONGODB_URI`: Your MongoDB connection string.
-   `GEMINI_API_KEY`: Your Google AI API key.

**4. Set Up MongoDB**

Ensure you have a MongoDB instance running. You can install it locally, use a cloud service like MongoDB Atlas, or run it in a separate Docker container:
```bash
docker run -d -p 27017:27017 --name local-mongo mongo:7.0
```

**5. Test MongoDB Connection**

It's highly recommended to run this utility script to verify your `MONGODB_URI` is correct:
```bash
npm run test-mongodb
```

**6. Run the Development Server**

```bash
npm run dev
```
The application will be running on **http://localhost:9002**.

## ⚙️ Environment Variables Explained

| Variable          | Description                                                                                                                              | Example (Docker)                                                   |
| :---------------- | :--------------------------------------------------------------------------------------------------------------------------------------- | :----------------------------------------------------------------- |
| `MONGODB_URI`     | **Required.** The full connection string for your MongoDB database.                                                                      | `mongodb://admin:password123@mongodb:27017/studio-gallery`       |
| `NEXTAUTH_SECRET` | **Required.** A long, random string used by NextAuth.js to sign JWTs for sessions.                                                        | `your-super-secret-key-generated-by-setup.sh`                      |
| `NEXTAUTH_URL`    | **Required.** The base URL of your application that NextAuth.js uses for callbacks.                                                      | `http://localhost:9002`                                            |
| `GEMINI_API_KEY`  | **Required for AI features.** Your API key for Google AI Studio.                                                                           | `AIzaSy...`                                                        |
| `MAX_FILE_SIZE`   | The maximum allowed size for uploaded image files, in bytes.                                                                             | `10485760` (10 MB)                                                 |
| `APP_PORT`        | (Docker specific) The port on your host machine that maps to the app's internal port.                                                    | `9002`                                                             |
| `MONGO_PORT`      | (Docker specific) The port on your host machine that maps to the MongoDB container's port.                                               | `27017`                                                            |

### Understanding the `.env` File Workflow in Docker

Your project uses a specific and robust method for handling Docker environment variables:

1.  **Template:** The `.env.docker.example` file is a public template committed to Git. It shows what variables are needed.
2.  **Creation:** When you run `./docker-run.sh` or `./docker-run-custom.sh`, the script checks for a `.env` file. If it's missing, it copies `.env.docker.example` to create `.env`.
3.  **Configuration:** You add your secrets (like `GEMINI_API_KEY`) to the `.env` file. This file is listed in `.gitignore` and should never be committed to version control.
4.  **Execution:** `Docker Compose` automatically reads the `.env` file and uses its values to substitute variables (like `${APP_PORT}`) inside the `docker-compose.yml` file. These values are then passed to the Docker containers at build time and runtime.

This workflow ensures that secrets are kept local while providing a clear template for new developers.

## 📂 Project Structure Deep Dive

```
studio/
├── scripts/
│   ├── init-mongo.js         # MongoDB initialization script (runs once on first container start)
│   ├── test-mongodb.mjs      # Utility to test MongoDB connection string
│   └── setup.sh              # Local development setup script
├── src/
│   ├── ai/                   # All AI-related logic
│   │   ├── flows/            # Genkit AI flow definitions (the "brains" of the AI)
│   │   └── genkit.ts         # Genkit configuration and model definition
│   ├── app/
│   │   ├── api/              # Backend API endpoints
│   │   ├── auth/             # Authentication UI pages
│   │   └── share/[shareId]/  # Public page for viewing shared galleries
│   ├── components/
│   │   └── ui/               # shadcn/ui components
│   ├── hooks/
│   └── lib/                  # Core application logic and utilities
│       ├── auth.ts           # NextAuth.js configuration
│       ├── database.ts       # Database service layer for MongoDB operations
│       ├── mongodb.ts        # MongoDB connection setup
│       ├── storage.ts        # Secure image data storage in MongoDB
├── .env.docker.example       # Example environment variables for Docker
├── .env.example              # Example environment variables for local setup
├── docker-compose.yml        # Docker Compose configuration for multi-container setup
├── docker-run-custom.sh      # Script to run Docker with custom ports
├── docker-run.sh             # Script to run Docker with automatic port management
├── docker-stop.sh            # Script to stop Docker services
└── Dockerfile                # Instructions for building the Next.js app image
```

## 📜 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more details.