from django.urls import path

from .views import (
    AnalysisCreateView,
    AnalysisDetailView,
    AnalysisListView,
    CsrfTokenView,
    DashboardView,
    DocumentBulkMoveView,
    DocumentDetailView,
    DocumentListCreateView,
    DocumentMoveView,
    DocumentSearchView,
    FolderDetailView,
    FolderListCreateView,
    LoginView,
    LogoutView,
    MeView,
    RegisterView,
    SettingsView,
)

urlpatterns = [
    # Auth
    path('auth/csrf/', CsrfTokenView.as_view(), name='auth-csrf'),
    path('auth/login/', LoginView.as_view(), name='auth-login'),
    path('auth/register/', RegisterView.as_view(), name='auth-register'),
    path('auth/logout/', LogoutView.as_view(), name='auth-logout'),
    path('auth/me/', MeView.as_view(), name='auth-me'),

    # Documents
    path('documents/', DocumentListCreateView.as_view(), name='document-list'),
    path('documents/search/', DocumentSearchView.as_view(), name='document-search'),
    path('documents/<int:pk>/', DocumentDetailView.as_view(), name='document-detail'),
    path('documents/<int:pk>/move/', DocumentMoveView.as_view(), name='document-move'),
    path('documents/move/', DocumentBulkMoveView.as_view(), name='documents-move'),

    # Dossiers
    path('folders/', FolderListCreateView.as_view(), name='folder-list'),
    path('folders/<int:pk>/', FolderDetailView.as_view(), name='folder-detail'),

    # Analyses
    path('analyses/', AnalysisCreateView.as_view(), name='analysis-create'),
    path('analyses/list/', AnalysisListView.as_view(), name='analysis-list'),
    path('analyses/<int:pk>/', AnalysisDetailView.as_view(), name='analysis-detail'),

    # Dashboard & paramètres
    path('dashboard/', DashboardView.as_view(), name='dashboard'),
    path('settings/', SettingsView.as_view(), name='settings'),
]