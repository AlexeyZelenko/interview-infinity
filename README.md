# DevHire Platform

A modern job platform connecting developers with companies, built with Vue 3, TypeScript, and Firebase.

## Features

### For Developers
- 🔍 Search and apply for tech jobs
- 📝 Create and manage multiple resumes
- 💡 Take skill assessment tests
- 📊 Track application status
- 🎯 Set job preferences and alerts

### For Companies
- 📮 Post and manage job listings
- 👥 Search and evaluate candidates
- 📋 Create custom skill tests
- 📈 Track applicant progress
- 💼 Manage hiring pipeline

## Tech Stack

- **Frontend:**
    - Vue 3
    - TypeScript
    - Tailwind CSS
    - Pinia (State Management)
    - Vue Router

- **Backend:**
    - Firebase
    - Cloud Firestore
    - Firebase Authentication
    - Firebase Storage

## Getting Started

1. Clone the repository:
```bash
git clone https://github.com/yourusername/devhire-platform.git
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
   Create a `.env` file in the root directory with your Firebase configuration:
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

4. Start development server:
```bash
npm run dev
```

5. Build for production:
```bash
npm run build
```

## Project Structure

```
src/
├── components/        # Reusable Vue components
├── views/            # Page components
├── stores/           # Pinia state management
├── router/           # Vue Router configuration
├── firebase/         # Firebase configuration
├── types/            # TypeScript type definitions
├── utils/            # Helper functions
└── assets/           # Static assets
```

## Key Features

### Resume Management
- Multiple resume support
- Rich text editing
- PDF export
- ATS optimization

### Job Search
- Advanced filtering
- Saved searches
- Job alerts
- Application tracking

### Skill Assessment
- Multiple test formats
- Automated grading
- Progress tracking
- Certification badges

### Company Dashboard
- Applicant tracking
- Interview scheduling
- Team collaboration
- Analytics dashboard

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, email support@devhire.com or join our Slack channel.