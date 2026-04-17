# Quick Start Guide for Decap CMS

This guide will help you start managing your blog posts without touching any code!

## What is Decap CMS?

Decap CMS (formerly Netlify CMS) is a user-friendly content management system that gives you a simple interface to create and edit blog posts. No coding required!

## Setup Steps

### 1. Deploy Your Site to Netlify

1. Create a GitHub account if you don't have one
2. Push your website to a GitHub repository
3. Go to [Netlify](https://www.netlify.com/) and sign up
4. Click "New site from Git"
5. Choose GitHub and select your repository
6. Set these build settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `_site`
7. Click "Deploy site"

### 2. Enable Authentication

1. In your Netlify dashboard, go to **Site settings** > **Identity**
2. Click "Enable Identity"
3. Under **Registration preferences**, select "Invite only" (recommended for security)
4. Go to **Services** > **Git Gateway** and click "Enable Git Gateway"
5. Go to the **Identity** tab and click "Invite users"
6. Enter your email address
7. Check your email and accept the invitation

### 3. Access the CMS

1. Go to `https://your-site-name.netlify.app/admin/`
2. Click "Login with Netlify Identity"
3. Use the credentials from your invitation email
4. You're in! 🎉

## Creating a Blog Post

Once you're logged into the CMS:

1. Click **"Blog Posts"** in the left sidebar
2. Click **"New Blog Post"** button
3. Fill in the fields:
   - **Title**: Your blog post title
   - **Publish Date**: When the post should be published
   - **Excerpt**: A short summary (shows on homepage and blog list)
   - **Featured Image**: Upload an image (optional but recommended)
   - **Body**: Write your blog post content using the rich text editor

### Rich Text Editor Features

The editor supports:
- **Bold** and *italic* text
- Headings (H1, H2, H3, etc.)
- Bullet lists and numbered lists
- Links
- Images
- Quotes
- Code blocks

### Publishing

1. When you're ready, click **"Publish"** in the top right
2. Choose "Publish now" or "Publish and create new"
3. Your post will automatically appear on your website!

### Editing Existing Posts

1. Go to **"Blog Posts"** in the CMS
2. Click on the post you want to edit
3. Make your changes
4. Click **"Publish"** to save

### Unpublishing a Post

1. Open the post in the CMS
2. Change the status from "Published" to "Draft"
3. Save the changes

## Tips

- **Always upload images**: Blog posts look better with featured images
- **Write excerpts**: These appear on your homepage and help readers decide what to read
- **Use headings**: Break up your content with H2 and H3 headings for better readability
- **Preview before publishing**: Use the preview button to see how your post will look
- **Save often**: The CMS auto-saves, but it's good to manually save important changes

## Troubleshooting

### Can't log in?
- Make sure you've accepted the invitation email from Netlify
- Clear your browser cache and try again
- Check that Git Gateway is enabled in Netlify settings

### Changes not appearing?
- Wait 1-2 minutes after publishing (Netlify needs time to rebuild your site)
- Check the "Deploys" tab in Netlify to see if the build succeeded
- Hard refresh your browser (Ctrl+F5 on Windows, Cmd+Shift+R on Mac)

### Need help?
Email hausofcomedy@gmail.com

## Local Development (Advanced)

If you want to test the CMS locally:

1. Open `src/admin/config.yml`
2. Uncomment this line: `# local_backend: true`
3. Run `npx decap-server` in one terminal
4. Run `npm start` in another terminal
5. Access the CMS at `http://localhost:8080/admin/`

---

Happy blogging! 🎭✨
