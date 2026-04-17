# Misconduct Comedy Website

This website is built with 11ty (Eleventy) static site generator and Decap CMS for easy content management.

## Getting Started

### Prerequisites
- Node.js and npm installed

### Installation

1. Install dependencies:
```bash
npm install
```

### Development

Start the development server:
```bash
npm start
```

This will start a local server at `http://localhost:8080` and watch for file changes.

### Building for Production

Build the site:
```bash
npm run build
```

The built site will be in the `_site` directory.

## Documentation

- **[CMS Setup Guide](docs/DECAP-CMS-GUIDE.md)** - Complete guide for setting up and using Decap CMS
- **[README](README.md)** - Project overview and technical documentation

## Managing Blog Posts

### Using Decap CMS (Recommended for Non-Technical Users)

1. **Local Development**: 
   - After deploying to Netlify/GitHub, you can access the CMS at `/admin/` on your live site
   - For local development, you can enable local backend by uncommenting `local_backend: true` in `src/admin/config.yml`

2. **Create/Edit Blog Posts**:
   - Navigate to `yoursite.com/admin`
   - Log in with your GitHub credentials (after setting up Git Gateway on Netlify)
   - Click "Blog Posts" 
   - Click "New Blog Post"
   - Fill in the title, date, excerpt, upload an image, and write your content
   - Save and publish!

### Manual Blog Post Creation

You can also create blog posts manually by adding markdown files to `src/blog/`:

Create a file like `src/blog/2026-04-20-my-new-post.md` with this format:

```markdown
---
layout: blog-post.njk
title: "Your Post Title"
date: 2026-04-20
excerpt: "A brief description of your post"
featuredImage: "/photos/blog/image.jpg"
---

Your blog post content goes here in markdown format.

## You can use headings

And all the standard markdown features.
```

## Deployment

### Deploying to Netlify

1. Push your code to a GitHub repository
2. Sign up for [Netlify](https://www.netlify.com/)
3. Click "New site from Git"
4. Connect your GitHub repository
5. Set build settings:
   - Build command: `npm run build`
   - Publish directory: `_site`
6. Click "Deploy site"

### Setting Up Decap CMS Authentication

1. In Netlify dashboard, go to Site settings > Identity
2. Click "Enable Identity"
3. Under Registration preferences, select "Invite only" (recommended)
4. Under Services > Git Gateway, click "Enable Git Gateway"
5. Invite yourself as a user from Identity tab
6. Now you can access the CMS at `yoursite.com/admin`

## Project Structure

```
misconduct-comedy/
├── docs/                  # Documentation
│   └── DECAP-CMS-GUIDE.md # CMS setup guide
├── src/                   # Source files (edit these)
│   ├── _includes/         # Layout templates
│   │   ├── base.njk      # Base layout for all pages
│   │   └── blog-post.njk # Blog post layout
│   ├── _data/            # Global data files
│   ├── admin/            # Decap CMS configuration
│   │   ├── config.yml    # CMS configuration
│   │   └── index.html    # CMS admin interface
│   ├── blog/             # Blog posts (markdown files)
│   │   ├── blog.json     # Blog collection config
│   │   └── *.md         # Individual blog posts
│   ├── css/              # Stylesheets
│   │   ├── index.css    # Homepage styles
│   │   └── menu.css     # Menu page styles
│   ├── photos/           # Images and photos
│   │   ├── specific/    # Specific event photos
│   │   └── *.webp       # Comedian headshots
│   ├── *.png, *.svg     # Logos and graphics
│   ├── *.ttf            # Custom fonts
│   ├── index.njk        # Homepage template
│   └── menu.njk         # Menu page template
├── _site/                # Generated site (auto-generated, don't edit)
├── .eleventy.js         # 11ty configuration
├── .gitignore          # Git ignore rules
├── netlify.toml        # Netlify deployment config
├── package.json        # Node.js dependencies
└── README.md          # This file
```

## Key Directories

- **Edit content in:** `src/`
- **Blog posts:** `src/blog/`
- **Styles:** `src/css/`  
- **Images:** `src/photos/`
- **Layouts:** `src/_includes/`
- **Documentation:** `docs/`

## Customization

- Edit page templates in `src/`
- Modify layouts in `src/_includes/`
- Update styles in `src/css/`
- Configure CMS in `src/admin/config.yml`
- Adjust 11ty settings in `.eleventy.js`

## Support

For questions about the site, email hausofcomedy@gmail.com
