class DashboardsController < ApplicationController
  before_action :authenticate_user!


  def show
    unrated_movies = current_user.current_unrated_movies
    if unrated_movies.count > 0
      redirect_to new_movie_rating_path
    else
      @potential_matches = current_user.potential_matches.count
      @movies = current_user.wants_to_see_movies
    end
  end

  def potential_matches
    @potential_matches = current_user.potential_matches.count
    render :potential_matches
  end

end
