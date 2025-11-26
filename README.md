# Anime Hub

A simple and modern web application for searching and discovering anime using the Anime DB API from RapidAPI.

## Author Information

- Name: Jesse Nkubito
- Email: j.nkubito@alustudent.com
- Repository: https://github.com/JesseN661/anime-hub.git
- Domain: jessenk.tech

## Project Overview

Anime Hub is a vanilla JavaScript web application that allows users to search for anime, filter by genres, sort results, and view detailed information. The application features a clean, professional interface with efficient data caching and error handling.

## Features

- Search anime by title
- Filter by genre
- Sort by ranking or title (ascending/descending)
- Pagination support
- API key management through settings
- Response caching for improved performance
- Responsive design for mobile and desktop
- Error handling with user-friendly messages

## Technologies Used

- HTML5
- CSS3 (Vanilla CSS with CSS Variables)
- JavaScript (ES6+)
- Fetch API for HTTP requests
- LocalStorage for API key management

## API Information

This application uses the Anime DB API from RapidAPI:
- API Documentation: https://rapidapi.com/brian.rofiq/api/anime-db
- Endpoints Used:
  - GET /anime - Retrieve anime with search and filters
  - GET /genre - Get available genres
  - GET /anime/by-ranking/:id - Get anime by ranking
  - GET /anime/:id - Get anime by ID

Credit to the Anime DB API developers for providing this service.

## File Structure

```
anime-hub/
├── index.html          # Main HTML file
├── styles.css          # Application styles
├── main.js            # Main application logic
├── config.js          # Configuration settings
├── .gitignore         # Git ignore file
└── README.md          # This file
```

## Local Installation

1. Clone the repository:
```bash
git clone https://github.com/JesseN661/anime-hub.git
cd anime-hub
```

2. Open the application:
   - Simply open `index.html` in a modern web browser
   - Or use a local development server:
   ```bash
   python3 -m http.server 8000
   # Then navigate to http://localhost:8000
   ```

3. Configure API Key:
   - Click the settings icon in the top right corner
   - Enter your RapidAPI key for the Anime DB API
   - Click "Save API Key"
   - The key is stored locally in your browser

## Getting an API Key

1. Visit https://rapidapi.com
2. Create a free account
3. Subscribe to the Anime DB API (free tier available)
4. Copy your API key from the dashboard
5. Paste it in the application settings

## Deployment Instructions

### Prerequisites

- Three web servers provided:
  - Web01: ubuntu@54.157.224.48
  - Web02: ubuntu@3.89.109.247
  - Load Balancer: ubuntu@44.201.169.199

### Deploying to Web Servers

1. Create a deployment package:
```bash
zip -r anime-hub.zip index.html styles.css main.js config.js
```

2. Deploy to Web01:
```bash
scp anime-hub.zip ubuntu@54.157.224.48:~/
ssh ubuntu@54.157.224.48
unzip anime-hub.zip -d /var/www/html/anime-hub
sudo systemctl restart nginx
```

3. Deploy to Web02:
```bash
scp anime-hub.zip ubuntu@3.89.109.247:~/
ssh ubuntu@3.89.109.247
unzip anime-hub.zip -d /var/www/html/anime-hub
sudo systemctl restart nginx
```

### Configuring the Load Balancer

1. SSH into the load balancer:
```bash
ssh ubuntu@44.201.169.199
```

2. Edit Nginx configuration:
```bash
sudo nano /etc/nginx/sites-available/default
```

3. Add upstream configuration:
```nginx
upstream anime_hub {
    server 54.157.224.48:80;
    server 3.89.109.247:80;
}

server {
    listen 80;
    server_name jessenk.tech www.jessenk.tech;

    location /anime-hub {
        proxy_pass http://anime_hub;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

4. Test and reload Nginx:
```bash
sudo nginx -t
sudo systemctl reload nginx
```

5. Access your application:
   - Via Load Balancer: http://44.201.169.199/anime-hub
   - Via Domain: http://jessenk.tech/anime-hub

## Usage Guide

1. Initial Setup:
   - Open the application
   - Click the settings icon
   - Enter your RapidAPI key
   - Save the key

2. Searching for Anime:
   - Enter a search term in the search box
   - Select optional genre filter
   - Choose sort order
   - Click "Search" or press Enter

3. Viewing Results:
   - Browse through anime cards
   - Click any card to view details
   - Use pagination buttons to see more results

4. Filtering and Sorting:
   - Use genre dropdown to filter by genre
   - Select sort by ranking or title
   - Choose ascending or descending order

## Performance Optimizations

- Response caching: API responses are cached for 5 minutes to reduce API calls
- Lazy loading: Images load as needed
- Efficient DOM manipulation: Minimal reflows and repaints
- LocalStorage: API keys stored locally to avoid repeated configuration

## Error Handling

The application handles various error scenarios:
- Missing API key: Prompts user to configure
- API failures: Displays user-friendly error messages
- Network issues: Graceful degradation with retry options
- Invalid responses: Fallback to placeholder content

## Browser Compatibility

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Challenges and Solutions

1. Challenge: API rate limiting
   - Solution: Implemented response caching to minimize API calls

2. Challenge: Secure API key storage
   - Solution: Used LocalStorage with user-managed keys, never exposed in code

3. Challenge: Responsive design
   - Solution: CSS Grid and Flexbox for fluid layouts

4. Challenge: Error handling
   - Solution: Comprehensive try-catch blocks with user feedback

## Future Enhancements

- Add user authentication for saving favorites
- Implement advanced filters (year, rating, episodes)
- Add anime recommendations based on user preferences
- Include trailer/video preview functionality

## Testing

To test the application:
1. Verify search functionality with various terms
2. Test all filter combinations
3. Check pagination on multiple pages
4. Verify error handling by entering invalid API key
5. Test responsive design on different screen sizes
6. Confirm load balancer distributes traffic to both servers

## Credits

- Anime DB API by brian.rofiq on RapidAPI
- Design inspiration from modern web applications
- Icons: SVG icons created inline

## License

This project is created for educational purposes as part of ALU coursework.

## Support

For issues or questions:
- Email: j.nkubito@alustudent.com
- GitHub Issues: https://github.com/JesseN661/anime-hub/issues

---

Created by Jesse Nkubito for ALU Web Infrastruture Playing with APIs Development Assignment
Last Updated:  November 2025
