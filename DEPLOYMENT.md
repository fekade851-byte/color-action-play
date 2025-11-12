# Deployment Guide

## Quick Deployment

This app is already configured for deployment. Here are the recommended platforms:

### 1. Netlify (Recommended - Free)

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Build the project
npm run build

# Deploy
netlify deploy --prod --dir=dist
```

Or use drag-and-drop deployment:
1. Go to https://app.netlify.com/drop
2. Drag the `dist` folder after building
3. Get instant live URL

### 2. Vercel (Free)

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

### 3. Firebase Hosting (Free)

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Initialize
firebase init hosting

# Deploy
firebase deploy
```

### 4. GitHub Pages (Free)

1. Build the project: `npm run build`
2. Push the `dist` folder to `gh-pages` branch
3. Enable GitHub Pages in repository settings

## Environment Configuration

No environment variables needed! The app works out of the box.

## Post-Deployment Checklist

- [ ] Test on mobile device
- [ ] Test on Smart TV browser
- [ ] Verify PWA installation works
- [ ] Check audio playback
- [ ] Test all settings
- [ ] Verify offline functionality
- [ ] Check video loading/fallback

## Custom Domain Setup

After deploying, you can add a custom domain:

1. Purchase domain from registrar
2. Add domain in hosting platform settings
3. Update DNS records as instructed
4. Wait for SSL certificate generation
5. Test HTTPS connection

## Smart TV Testing

To test on Android Smart TV:
1. Deploy to production URL
2. Open TV browser
3. Navigate to your URL
4. Test with remote control
5. Check fullscreen mode
6. Verify audio works

## Performance Optimization

The app is already optimized with:
- Code splitting
- Lazy loading
- Service worker caching
- Optimized assets
- Responsive images

## Monitoring

Recommended monitoring tools:
- Google Analytics (optional)
- Sentry for error tracking (optional)
- Lighthouse for performance audits

## Updating

To deploy updates:
1. Make changes
2. Test locally: `npm run dev`
3. Build: `npm run build`
4. Deploy using your chosen method
5. Clear cache if needed

## Support

For deployment issues:
- Check hosting platform documentation
- Verify build succeeds locally
- Check browser console for errors
- Test on multiple devices
