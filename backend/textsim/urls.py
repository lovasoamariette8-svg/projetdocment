from django.urls import path

from .views import (
    AnalysisCreateView,
    AnalysisDetailView,
    AnalysisListView,
    DashboardView,
    DocumentDetailView,
    DocumentListCreateView,
    LoginView,
    LogoutView,
    MeView,
    SettingsView,
)

urlpatterns = [
    # Auth
    path('auth/login/', LoginView.as_view(), name='auth-login'),
    path('auth/logout/', LogoutView.as_view(), name='auth-logout'),
    path('auth/me/', MeView.as_view(), name='auth-me'),

    # Documents
    path('documents/', DocumentListCreateView.as_view(), name='document-list'),
    path('documents/<int:pk>/', DocumentDetailView.as_view(), name='document-detail'),

    # Analyses
    path('analyses/', AnalysisCreateView.as_view(), name='analysis-create'),
    path('analyses/list/', AnalysisListView.as_view(), name='analysis-list'),
    path('analyses/<int:pk>/', AnalysisDetailView.as_view(), name='analysis-detail'),

    # Dashboard & paramètres
    path('dashboard/', DashboardView.as_view(), name='dashboard'),
    path('settings/', SettingsView.as_view(), name='settings'),
]