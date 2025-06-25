<h1 align="center">
	<br>
	<img width="500" src="https://cdn.rawgit.com/matchai/magnetizer-api/3156da235baf08af7edbbd67fe06f3ed5d9c0b1a/media/logo-text.svg" alt="Magnetizer">
	<br>
	<br>
</h1>

> 🧲 Convert direct torrent file links into magnet URIs with a beautiful web interface

## ✨ Features

- **Beautiful Web Interface** - Modern, responsive UI built with Tailwind CSS and DaisyUI
- **Multiple Themes** - Dark, Light, Cyberpunk, and Synthwave themes
- **Instant Conversion** - Convert .torrent URLs to magnet links in seconds
- **Detailed Information** - View torrent metadata including files, trackers, and creation date
- **Copy & Share** - One-click copying of magnet links
- **Direct Client Integration** - Open magnet links directly in your torrent client

## 🚀 Quick Start

### Installation

```bash
# Clone the repository
git clone https://github.com/seager21/magnet-2-torrent.git
cd magnet-2-torrent

# Install dependencies
npm install

# Build CSS styles
npm run build-css

# Start the server
npm start
```

### Development

```bash
# Start development server with auto-restart
npm run dev

# Watch CSS changes during development
npm run watch-css
```

*The application will be running at http://localhost:8080*

## 🎯 How to Use

1. **Find a Torrent URL** - Copy the direct link to a .torrent file
2. **Paste & Convert** - Enter the URL in the web interface and click Convert
3. **Get Your Magnet Link** - Copy the generated magnet URI or open it directly in your torrent client

## 🛠️ API

The application also provides a REST API for programmatic access:

#### `GET` /:url

Returns the magnet URI and metadata for a torrent file.

**Parameters:**
- `url` - The full URL (including protocol) to a torrent file

**Response Headers:**
- `magnetURI` - The complete magnet URI of the torrent file

**Response Body:**
- `torrentData` - Detailed torrent metadata including:
  - `name` - Torrent name
  - `created` - Creation date
  - `comment` - Creator comment
  - `infoHash` - SHA1 hash
  - `announce` - Tracker URLs
  - `files` - File list

## 🎨 Built With

- **Backend**: Node.js, Express.js
- **Frontend**: HTML5, Vanilla JavaScript
- **Styling**: Tailwind CSS v3.3.0, DaisyUI v3.9.4
- **Icons**: Heroicons, Emoji

## 📱 Themes

Choose from multiple beautiful themes:
- 🌙 **Dark** - Clean dark interface
- ☀️ **Light** - Bright and clean
- 🤖 **Cyberpunk** - Futuristic neon vibes
- 🎵 **Synthwave** - Retro 80s aesthetic

## 🔧 Configuration

The application can be configured through environment variables:

- `PORT` - Server port (default: 8080)

## 📄 License

MIT License - see LICENSE file for details

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## ⭐ Show Your Support

Give a ⭐️ if this project helped you!


