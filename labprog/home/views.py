from django.http import HttpResponse
from django.contrib.auth.decorators import login_required

@login_required(login_url="/login/")
def home(request):
    return HttpResponse("Welcome to the home page!")