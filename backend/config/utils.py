"""
Utility functions for Django configuration.

Worker: Dev - Helper functions for settings
"""


def add_cors_headers(headers, path, url):
    """
    Add CORS headers to static/media files served by WhiteNoise.
    
    This allows frontend (Vercel) to load images and media from backend (Render)
    without CORS errors.
    
    Args:
        headers: Dictionary of HTTP headers
        path: File system path
        url: URL path
    """
    # Add CORS headers for media files
    if url.startswith('/media/'):
        headers['Access-Control-Allow-Origin'] = '*'
        headers['Access-Control-Allow-Methods'] = 'GET, HEAD, OPTIONS'
        headers['Access-Control-Max-Age'] = '86400'  # 24 hours
    
    return headers
