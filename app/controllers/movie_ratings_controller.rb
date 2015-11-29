class MovieRatingsController < ApplicationController
  before_action :authenticate_user!

  respond_to :html, :json

  def new
    unrated_movies = current_user.current_unrated_movies
    redirect_to dashboard_path if unrated_movies.count < 1
    @unrated_movie = unrated_movies.first
    @potential_matches = current_user.potential_matches.count
    flash.now[:info] = "Let us know which of these new movies you want to see. #{unrated_movies.count} remaining."
  end

  def create
    current_user.movie_ratings.create(movie_id: movie_rating_params[:movie_id], 
                              wants_to_see: movie_rating_params[:wants_to_see]
                              )

    unrated_movies = current_user.current_unrated_movies

    if unrated_movies.count > 0
      @unrated_movie = unrated_movies.first
      @potential_matches = current_user.potential_matches.count
      @flash_message = "Let us know which of these movies you want to see. #{unrated_movies.count} remaining."
      render :create
    else
      url = dashboard_url
      render :js => "window.location = '/dashboard'"
    end
  end


  def update
    movie_rating = current_user.movie_ratings.where(:movie_id => movie_rating_params[:movie_id]).first
    movie_rating.update_attributes(:seen => movie_rating_params[:seen])
  end


  protected

  def movie_rating_params
    params.require(:movie_rating).permit(
      :movie_id, :user_id, :wants_to_see, :seen)
  end


end
