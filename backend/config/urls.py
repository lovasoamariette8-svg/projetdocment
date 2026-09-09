import os

from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path, re_path
from django.utils._os import safe_join
from django.views.static import serve as static_serve

from .settings import FRONTEND_DIST


def _serve_frontend(request, path=''):
    """Sert l'application frontend construite (SPA) sur la même origine."""
    docroot = str(FRONTEND_DIST)
    if path:
        try:
            candidate = safe_join(docroot, path)
            if os.path.isfile(candidate):
                return static_serve(request, path, document_root=docroot)
        except ValueError:
            pass
    return static_serve(request, 'index.html', document_root=docroot)


urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('textsim.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    # Tout le reste (routes SPA : /, /login, /dashboard...) renvoie vers index.html
    urlpatterns += [re_path(r'^(?!api/|admin/|media/|static/)(?P<path>.*)$', _serve_frontend)]