# Contributing to WebChat

Thanks for your interest in contributing to WebChat! This document provides guidelines and instructions for contributing.

## 🎯 How to Contribute

### 1. **Report Bugs**
- Check if the bug already exists in [Issues](https://github.com/chahinsellami/chatapp/issues)
- If not, create a new issue with:
  - Clear description of the bug
  - Steps to reproduce
  - Expected vs actual behavior
  - Your environment (OS, Node version, etc.)

### 2. **Suggest Features**
- Check if the feature is already in the [Roadmap](#roadmap)
- Create an issue with:
  - Feature description
  - Use case and benefits
  - Proposed implementation approach
  - Mockups/examples if applicable

### 3. **Submit Code Changes**

#### Setup Development Environment
```bash
# Clone the repository
git clone https://github.com/chahinsellami/chatapp.git
cd chatapp

# Install dependencies
npm install

# Start development server
npm run dev
```

#### Create a Feature Branch
```bash
# Create and switch to new branch
git checkout -b feature/your-feature-name

# Or for bug fixes:
git checkout -b bugfix/bug-description
```

#### Commit Guidelines
- Use clear, descriptive commit messages
- Reference issues when applicable
- Follow conventional commits:
  - `feat:` for new features
  - `fix:` for bug fixes
  - `docs:` for documentation
  - `style:` for code style changes
  - `refactor:` for code refactoring
  - `test:` for test additions

Example:
```bash
git commit -m "feat: add message search functionality

- Add search input to chat header
- Implement database query for message search
- Highlight search results in chat

Closes #42"
```

#### Push and Create Pull Request
```bash
# Push your branch
git push origin feature/your-feature-name

# Create Pull Request on GitHub
# Provide description of changes and reference any related issues
```

## 📋 Development Checklist

Before submitting a PR, ensure:

- [ ] Code follows project style (TypeScript, clear naming)
- [ ] All functions have JSDoc comments
- [ ] Changes include meaningful test cases
- [ ] No console errors or warnings
- [ ] Updated README if needed
- [ ] Tested in development environment
- [ ] Commits are clean and descriptive

## 🎨 Code Style

### TypeScript
- Use explicit type annotations
- Avoid `any` type when possible
- Use interfaces for object types

```typescript
// Good
interface User {
  id: string;
  name: string;
  email: string;
}

function getUser(id: string): User | null {
  // Implementation
}

// Avoid
function getUser(id: any): any {
  // Implementation
}
```

### React Components
- Use functional components with hooks
- Keep components focused and reusable
- Add JSDoc comments

```typescript
interface ChatProps {
  userId: string;
  onMessageSend?: (message: string) => void;
}

/**
 * Chat component for multi-user messaging
 * @param props - Component props
 * @returns Chat interface with message display and input
 */
export function Chat({ userId, onMessageSend }: ChatProps) {
  // Implementation
}
```

### Database
- Use prepared statements for queries
- Add comments explaining SQL logic
- Keep database utilities modular

```typescript
/**
 * Get all messages for a specific conversation
 * Retrieves messages between two users ordered by creation date
 */
export function getConversationMessages(userId1: string, userId2: string) {
  const database = getDatabase();
  const stmt = database.prepare(`
    SELECT * FROM messages 
    WHERE (senderId = ? AND receiverId = ?) 
       OR (senderId = ? AND receiverId = ?)
    ORDER BY createdAt ASC
  `);
  return stmt.all(userId1, userId2, userId2, userId1);
}
```

## 🧪 Testing

### Manual Testing
1. Test in development environment
2. Check browser console for errors
3. Verify database operations
4. Test with different browsers

### Test Coverage
- Test happy paths
- Test edge cases
- Test error handling

## 📚 Documentation

Update documentation for:
- New features
- API changes
- Database schema changes
- Configuration additions

Update files:
- `README.md` - User-facing documentation
- `DATABASE_SETUP.md` - Database documentation
- Code comments - Implementation details

## 🔒 Security Considerations

- Never commit sensitive information (API keys, passwords)
- Validate all user inputs
- Use parameterized queries (already implemented)
- Sanitize database outputs
- Follow OWASP guidelines

## 🎯 Roadmap

Prioritized features for contribution:

### Phase 2 (Real-time Features)
- [ ] WebSocket implementation for real-time messages
- [ ] Real-time typing indicators
- [ ] User online/offline status updates
- [ ] Message notifications

### Phase 3 (Authentication & Security)
- [ ] User authentication (login/signup)
- [ ] Password hashing with bcrypt
- [ ] Session management
- [ ] Rate limiting on API endpoints

### Phase 4 (Advanced Features)
- [ ] Message search with full-text search
- [ ] Multiple chat channels
- [ ] User profiles & settings
- [ ] Message reactions/emojis

### Phase 5 (User Experience)
- [ ] Dark mode toggle
- [ ] Settings page
- [ ] Message persistence improvements
- [ ] Performance optimizations

## 💬 Questions or Need Help?

- Check existing issues and discussions
- Review code comments in relevant files
- Look at similar implementations
- Open a discussion issue

## 📝 License

By contributing, you agree that your contributions will be licensed under the MIT License.

## 🙏 Thank You!

Your contributions help make WebChat better for everyone. We appreciate your time and effort!

---

Happy coding! 🚀
