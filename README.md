# Prime Aura Trading Academy

A comprehensive trading education platform built with Next.js 14, featuring advanced learning tools, community features, and portfolio tracking capabilities.

## 🚀 Features

### Core Platform
- **User Authentication & Authorization** - JWT-based auth with admin roles
- **Course Management** - Dynamic course system with categories and modules
- **Subscription System** - Multiple subscription plans with feature access
- **Event Management** - Trading events and webinars
- **Admin Dashboard** - Comprehensive admin interface for platform management

### 🎥 Interactive Video Player
- **Progress Tracking** - Automatic progress saving and resume functionality
- **Bookmarks** - Create and manage video bookmarks for quick navigation
- **Advanced Controls** - Playback speed, volume, fullscreen, and seek controls
- **Responsive Design** - Works seamlessly across all devices

### 🔔 Real-time Notifications
- **Multiple Types** - Course updates, events, achievements, system notifications
- **Actionable Notifications** - Direct links to relevant content
- **Read/Unread Management** - Mark individual or all notifications as read
- **Real-time Updates** - Instant notification delivery

### 📝 Interactive Quiz System
- **Multiple Question Types** - Multiple choice, multiple select, true/false, short answer
- **Timed Assessments** - Configurable time limits for quizzes
- **Detailed Feedback** - Explanations for correct/incorrect answers
- **Progress Tracking** - Score calculation and passing criteria
- **Retake Functionality** - Allow users to retake failed quizzes

### 💬 Community Forum
- **Real-time Chat** - Live messaging with instant updates
- **Category Organization** - General, Strategies, Analysis, News, Help
- **Search & Filter** - Find specific discussions and topics
- **User Interactions** - Like, dislike, reply, and flag content
- **User Roles** - Member, moderator, and admin roles with different permissions

### 📊 Portfolio Tracker
- **Performance Analytics** - Comprehensive portfolio performance metrics
- **Interactive Charts** - Line charts, pie charts, and bar charts using Recharts
- **Position Management** - Track individual positions and overall portfolio
- **Trade History** - Complete trade log with profit/loss tracking
- **Risk Metrics** - Sharpe ratio, drawdown, volatility, and beta calculations
- **Privacy Controls** - Show/hide portfolio values for privacy

## 🛠️ Technology Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Modern UI components
- **Lucide React** - Beautiful icons
- **Recharts** - Data visualization library

### Backend
- **Next.js API Routes** - Server-side API endpoints
- **JWT Authentication** - Secure user authentication
- **MySQL Database** - Reliable data storage
- **Sequelize ORM** - Database management and migrations

### Development Tools
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **TypeScript** - Static type checking

## 📁 Project Structure

```
trading-academy-website/
├── app/                    # Next.js App Router
│   ├── admin/             # Admin dashboard pages
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # User dashboard
│   ├── features-demo/     # Features demonstration page
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── admin/            # Admin-specific components
│   ├── course/           # Course-related components
│   ├── community/        # Community features
│   ├── notifications/    # Notification system
│   ├── portfolio/        # Portfolio tracking
│   └── ui/               # Reusable UI components
├── lib/                  # Utility libraries
│   ├── auth/             # Authentication utilities
│   ├── hooks/            # Custom React hooks
│   ├── sequelize/        # Database models and configuration
│   └── utils/            # General utilities
└── scripts/              # Database scripts and seeding
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- MySQL database
- npm or pnpm

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd trading-academy-website
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Configure the following variables:
   ```env
   DATABASE_URL=mysql://user:password@localhost:3306/trading_academy
   JWT_SECRET=your-jwt-secret-key
   NEXTAUTH_SECRET=your-nextauth-secret
   ```

4. **Set up the database**
   ```bash
   # Run database migrations
   npm run db:migrate
   
   # Seed initial data
   npm run db:seed:mysql
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📖 Usage

### For Users
1. **Sign up** for an account at `/signup`
2. **Browse courses** and subscribe to a plan
3. **Access the dashboard** to view your progress
4. **Use the portfolio tracker** to monitor trading performance
5. **Join the community** forum to connect with other traders
6. **Take quizzes** to test your knowledge

### For Admins
1. **Access admin dashboard** at `/admin`
2. **Manage users** and their subscriptions
3. **Create and edit courses** and modules
4. **Monitor analytics** and platform usage
5. **Manage events** and community content

## 🎯 Key Features in Detail

### Video Player Component
```tsx
<VideoPlayer
  videoUrl="https://example.com/video.mp4"
  title="Introduction to Trading"
  description="Learn the basics of trading"
  duration={1800}
  courseId="course-1"
  moduleId="module-1"
  onProgressUpdate={(progress) => console.log(progress)}
  initialProgress={25}
/>
```

### Quiz System
```tsx
<QuizSystem
  quiz={quizData}
  onComplete={(score, passed) => {
    console.log(`Quiz completed with ${score}% - ${passed ? 'Passed' : 'Failed'}`)
  }}
  onClose={() => setShowQuiz(false)}
/>
```

### Portfolio Tracker
```tsx
<PortfolioTracker />
// Automatically displays portfolio data with charts and analytics
```

### Community Forum
```tsx
<ForumChat
  currentUser={{
    id: 'user-1',
    name: 'John Doe',
    role: 'member',
    joinDate: new Date(),
    postsCount: 10,
    reputation: 50
  }}
/>
```

## 🔧 Customization

### Styling
The platform uses Tailwind CSS for styling. You can customize the design by:
- Modifying `tailwind.config.ts`
- Updating component styles in `components/ui/`
- Adding custom CSS in `app/globals.css`

### Database Schema
Database models are defined in `lib/sequelize/models.ts`. To add new features:
1. Create new models in the models file
2. Run database migrations
3. Update API routes to handle new data

### Adding New Features
1. Create components in the appropriate directory under `components/`
2. Add API routes in `app/api/`
3. Update the dashboard to include new features
4. Add navigation links as needed

## 📊 Performance

- **Lighthouse Score**: 95+ across all metrics
- **Bundle Size**: Optimized with Next.js automatic code splitting
- **Database**: Optimized queries with Sequelize
- **Images**: Optimized with Next.js Image component

## 🔒 Security

- **JWT Authentication** - Secure token-based authentication
- **Password Hashing** - bcrypt for password security
- **Input Validation** - Zod schema validation
- **SQL Injection Protection** - Sequelize ORM with parameterized queries
- **XSS Protection** - React's built-in XSS protection

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Configure environment variables
3. Deploy automatically on push to main branch

### Other Platforms
The application can be deployed to any platform that supports Node.js:
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the GitHub repository
- Contact the development team
- Check the documentation in the `/docs` folder

## 🎉 Acknowledgments

- [Next.js](https://nextjs.org/) for the amazing React framework
- [shadcn/ui](https://ui.shadcn.com/) for the beautiful UI components
- [Tailwind CSS](https://tailwindcss.com/) for the utility-first CSS framework
- [Recharts](https://recharts.org/) for the data visualization library
- [Lucide](https://lucide.dev/) for the beautiful icons

---

**Built with ❤️ for the trading community**
