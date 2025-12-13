# Contributing to PostgreSQL Query Plan Optimizer

Thank you for your interest in contributing to the PostgreSQL Query Plan Optimizer! We welcome contributions from the community.

## 🤝 How to Contribute

### Reporting Bugs

If you find a bug, please open an issue with:
- A clear, descriptive title
- Steps to reproduce the issue
- Expected vs. actual behavior
- Your environment (OS, Docker version, PostgreSQL version)
- Screenshots or logs if applicable

### Suggesting Features

We love new ideas! Please open an issue with:
- A clear description of the feature
- The problem it solves
- Any implementation ideas you have

### Pull Requests

1. **Fork the repository** and create your branch from `main`
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Write clear, commented code
   - Follow the existing code style
   - Add tests if applicable

3. **Test your changes**
   - Ensure the application builds and runs with Docker
   - Test all affected functionality
   - Check that existing features still work

4. **Commit your changes**
   - Use clear, descriptive commit messages
   - Reference any related issues

5. **Push to your fork** and submit a pull request
   ```bash
   git push origin feature/your-feature-name
   ```

6. **Wait for review**
   - Address any feedback from maintainers
   - Be patient and respectful

## 📝 Development Guidelines

### Code Style

- **Frontend (React)**: Follow React best practices, use functional components and hooks
- **Backend (Python)**: Follow PEP 8 style guidelines
- **Comments**: Write clear comments for complex logic
- **Naming**: Use descriptive variable and function names

### Commit Messages

- Use present tense ("Add feature" not "Added feature")
- Use imperative mood ("Move cursor to..." not "Moves cursor to...")
- Limit the first line to 72 characters
- Reference issues and pull requests when relevant

### Testing

- Test your changes locally with Docker
- Verify both frontend and backend functionality
- Test with different PostgreSQL query types
- Check AI analysis results for accuracy

## 🏗️ Project Structure

```
postgresql_optimizater/
├── backend/           # FastAPI backend
│   ├── server.py     # Main API server
│   └── Dockerfile    # Backend container
├── frontend/         # React frontend
│   ├── src/         # React components
│   └── Dockerfile   # Frontend container
└── docker-compose.yml
```

## 🔧 Setting Up Development Environment

1. Clone your fork
   ```bash
   git clone https://github.com/YOUR_USERNAME/postgresql_optimizater.git
   cd postgresql_optimizater
   ```

2. Set up environment variables (see README.md)

3. Run with Docker
   ```bash
   docker-compose up --build
   ```

4. Make changes and test locally

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

## 💬 Questions?

Feel free to open an issue for any questions or clarifications!

---

Thank you for contributing! 🎉
