# Project Structure Overview

This document provides a quick reference for the organized project structure.

## Root Directory (Clean & Organized)

```
misconduct-comedy/                    # Project root
├── 📁 docs/                         # Documentation files
├── 📁 src/                          # All source code and content
├── 📁 _site/                        # Auto-generated (gitignored)
├── 📁 node_modules/                 # Dependencies (gitignored)
├── 📄 .eleventy.js                  # 11ty configuration
├── 📄 .gitignore                    # Git ignore rules
├── 📄 netlify.toml                  # Deployment configuration
├── 📄 package.json                  # Project dependencies
└── 📄 README.md                     # Main documentation
```

## Source Directory (Where You Work)

```
src/
├── 📁 _includes/                    # Reusable templates
│   ├── base.njk                    # Base page layout
│   └── blog-post.njk              # Blog post template
│
├── 📁 admin/                        # Content Management System
│   ├── config.yml                  # CMS configuration
│   └── index.html                  # CMS interface
│
├── 📁 blog/                         # Blog content
│   ├── blog.json                   # Collection settings
│   ├── index.njk                   # Blog listing page
│   └── *.md                        # Blog posts (add here!)
│
├── 📁 css/                          # Stylesheets
│   ├── index.css                   # Homepage styles
│   └── menu.css                    # Menu page styles
│
├── 📁 photos/                       # All images
│   ├── specific/                   # Event photos
│   └── *.webp                      # Comedian photos
│
├── 🖼️ Logo & Graphics              # Brand assets
│   ├── logo 100px.png
│   ├── Logo Final 1000px.png
│   ├── Misconduct Comedy Logo with Border - 500px.png
│   ├── Misconduct Comedy Logo with Border - 750px.png
│   ├── misconduct logo.svg
│   └── misconduct logo border.svg
│
├── 🔤 Fonts                         # Custom fonts
│   └── Smythe-Regular.ttf
│
├── 📄 index.njk                     # Homepage template
└── 📄 menu.njk                      # Menu page template
```

## Documentation Directory

```
docs/
└── DECAP-CMS-GUIDE.md              # Complete CMS setup guide
```

## What Was Cleaned Up

### Removed Files ✅
- ❌ `index.html` (root) → Now built from `src/index.njk`
- ❌ `menu.html` (root) → Now built from `src/menu.njk`
- ❌ Duplicate images in root → All moved to `src/`
- ❌ Duplicate SVG files in root → All moved to `src/`
- ❌ Duplicate font files in root → All moved to `src/`

### Organized ✅
- ✅ All documentation in `docs/` folder
- ✅ All source files in `src/` folder
- ✅ Clean root directory with only config files
- ✅ Enhanced `.gitignore` for better version control

## Quick Reference

### To Add a Blog Post
1. **Via CMS** (after deployment): Visit `yoursite.com/admin`
2. **Manually**: Add `.md` file to `src/blog/`

### To Change Styles
- Homepage: Edit `src/css/index.css`
- Menu page: Edit `src/css/menu.css`

### To Add Images
- Upload to `src/photos/`
- Reference in code as `/photos/filename.webp`

### To Modify Page Layout
- Edit templates in `src/_includes/`

### To Change Page Content
- Homepage: `src/index.njk`
- Menu: `src/menu.njk`
- Blog posts: `src/blog/*.md`

## Benefits of This Organization

1. **Clear separation** - Source vs. generated files
2. **Easy to find files** - Everything has a logical place
3. **Clean root** - Only configuration files at top level
4. **Better version control** - Proper .gitignore setup
5. **Scalable** - Easy to add new content without clutter
6. **Professional** - Standard project structure

## Need Help?

- Setup CMS: See `docs/DECAP-CMS-GUIDE.md`
- Technical details: See `README.md`
- Questions: Email hausofcomedy@gmail.com
