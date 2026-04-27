# Quick Start Guide for Decap CMS

This guide will help you start managing your blog posts without touching any code!

## What is Decap CMS?

Decap CMS (formerly Netlify CMS) is a user-friendly content management system that gives you a simple interface to create and edit blog posts. No coding required!

## Two Ways to Use the CMS

### Option 1: Local Development (Recommended to Start)

Work with the CMS on your local computer - no deployment needed!

**Advantages:**
- ✅ Start immediately
- ✅ No GitHub/Netlify setup required yet
- ✅ Test everything locally first
- ✅ See changes instantly

### Option 2: Production (After Deployment)

Use the CMS on your live website after deploying to Netlify.

---

## Getting Started Locally (Decap Bridge)

### 1. Install Dependencies

Open a terminal in your project folder and run:

```bash
npm install
```

This installs Decap Server and other required tools.

### 2. Start the Development Environment

Start both the website and CMS with one command:

```bash
npm run dev
```

Or run them separately in two terminals:

**Terminal 1 - CMS Backend:**
```bash
npm run cms
```

**Terminal 2 - Website:**
```bash
npm start
```

### 3. Access the CMS

1. Open your browser to **http://localhost:8080/admin/**
2. You'll see the Decap CMS login screen
3. Enter any email (it doesn't matter for local use)
4. Click "Login"
5. You're in! 🎉

### 4. Create Your First Blog Post

1. Click **"Blog Posts"** in the left sidebar
2. Click **"New Blog Post"** button
3. Fill in the fields:
   - **Title**: Your blog post title
   - **Publish Date**: When the post should be published
   - **Excerpt**: A short summary
   - **Featured Image**: Upload an image (optional)
   - **Body**: Write your content
4. Click **"Save"** (top right)
5. Click **"Publish"** → "Publish now"
6. Refresh your homepage to see your new post!

---

## Deploying to Production

---

## Deploying to Production

Once you're happy with your local setup, deploy to make it live!

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

1. When you're ready, click **"Save"** in the top right (saves as draft)
2. Then click **"Publish"** → "Publish now"
3. Your post will automatically appear on your website!
   - **Locally**: Refresh http://localhost:8080 to see it
   - **Production**: Changes push to GitHub and trigger a rebuild

### Editing Existing Posts

1. Go to **"Blog Posts"** in the CMS
2. Click on the post you want to edit
3. Make your changes
4. Click **"Publish"** to save

### Unpublishing a Post
lick "Set status" → Change to "Draft"
3. Click "Save"

## How It Works

### Local Development (Decap Bridge)

When you run `npm run dev`:
- **Decap Server** runs on port 8081 (you don't see this)
- **11ty dev server** runs on port 8080 (your website)
- **CMS admin** is accessible at localhost:8080/admin/
- Changes are made directly to your local files
- No authentication needed!

### Production (After Deployment)

When deployed to Netlify:
- CMS uses Git Gateway for authentication
- Changes are committed to your GitHub repository
- Netlify automatically rebuilds your site
- Secure access via Netlify Identity (optional)

## Commands Reference

| Command | What It Does |
|---------|-------------|
| `npm install` | Install all dependencies |
| `npm start` | Start 11ty dev server only |
| `npm run cms` | Start Decap backend only |
| `npm run dev` | Start both CMS and website (recommended) |
| `npm run build` | Build site for production | the CMS
2. Change the status from "Published" to "Draft"
3. Save the changes

## Tips

- **Always upload images**: Blog posts look better with featured images
- **Write excerpts**: These appear on your homepage and help readers decide what to read
- **Use headings**: Break up your content with H2 and H3 headings for better readability
- **Preview before publishing**: Use the preview button to see how your post will look
- **Save often**: The CMS auto-saves, but it's good to manually save important changes

## Troubleshooting

### CMS won't load locally?
- Make sure you ran `npm install` first
- Check that `npm run cms` is running (if running separately)
- Try accessing http://localhost:8080/admin/ directly
- Clear your browser cache and try again

### Can't see my changes?
- **Locally**: Just refresh your browser (Ctrl+R or F5)
- **Production**: Wait 1-2 minutes for Netlify to rebuild
- Check that you clicked "Publish" not just "Save"

### Port already in use?
- Close other instances of `npm start` or `npm run dev`
- Restart your terminal
- Or kill the process using that port

### Changes not committing to GitHub?
- Make sure you've published (not just saved) in the CMS
- Check your Git credentials are set up
- Verify the repository URL in `.git/config`

### Need help?
Email hausofcomedy@gmail.com

---

## Production Setup (Netlify Identity - Optional)

If you want secure authentication for your production CMS, you can enable Netlify Identity:

1. In Netlify dashboard, go to **Site settings** > **Identity**
2. Click "Enable Identity"
3. Under **Registration**, select "Invite only"
4. Go to **Services** > **Git Gateway** and enable it
5. Invite users via the **Identity** tab
6. They can then log in at `yoursite.com/admin`

**Note:** With Decap Bridge enabled, the CMS works great locally without this setup!

---

Happy blogging! 🎭✨
