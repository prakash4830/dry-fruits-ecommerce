"""
CSRF Exemption Middleware for JWT-authenticated API endpoints.

Worker: Dev - Exempt JWT API endpoints from CSRF validation
Worker: QA - Security review required
"""

from django.utils.deprecation import MiddlewareMixin


class CsrfExemptAPIMiddleware(MiddlewareMixin):
    """
    Exempt API endpoints from CSRF validation when using JWT authentication.
    
    CSRF is designed for cookie-based authentication. Since we use JWT tokens
    (stored in localStorage and sent via Authorization header), CSRF protection
    is not needed and actually causes issues in cross-origin scenarios.
    
    This middleware marks API requests as CSRF exempt before Django's
    CsrfViewMiddleware processes them.
    """
    
    def process_request(self, request):
        # Check if the request path starts with /api/
        if request.path.startswith('/api/'):
            # Check if Authorization header is present (JWT token)
            auth_header = request.META.get('HTTP_AUTHORIZATION', '')
            if auth_header.startswith('Bearer '):
                # Mark request as CSRF exempt
                setattr(request, '_dont_enforce_csrf_checks', True)
        
        return None
