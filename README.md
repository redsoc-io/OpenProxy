# OpenProxy

This is a [Next.js](https://nextjs.org/) project that provides a proxy server discovery and validation service.

## Features

- Continuously updated proxy server list
- Automatic proxy validation
- Redis-backed storage
- RESTful API for proxy access
- Web interface for proxy management
- PAC file generation

## Architecture

The project consists of two main components:

1. **Web Application (Next.js)**
   - User interface for proxy management
   - API endpoints for proxy access
   - PAC file generation

2. **Updater Service (Go)**
   - Continuous proxy discovery
   - Parallel proxy validation
   - Redis database management
   - Efficient concurrent processing

## Getting Started

1. Clone the repository
2. Install dependencies:
```bash
npm install
```
3. Start Redis:
```bash
docker-compose up -d redis
```
4. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `pages/index.js`. The page auto-updates as you edit the file.

[API routes](https://nextjs.org/docs/api-routes/introduction) can be accessed on [http://localhost:3000/api/hello](http://localhost:3000/api/hello). This endpoint can be edited in `pages/api/hello.js`.

The `pages/api` directory is mapped to `/api/*`. Files in this directory are treated as [API routes](https://nextjs.org/docs/api-routes/introduction) instead of React pages.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deployment

You can deploy the web application on [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme), but for the complete system including the updater service, use Docker:

```bash
docker-compose up -d
```

This will start:
- The Next.js web application
- The Go updater service
- Redis database

## License

This project is MIT licensed.
