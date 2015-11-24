class DashboardsController < ApplicationController

  def show
    unrated_movies = current_user.current_unrated_movies

    if unrated_movies.count > 0
      redirect_to new_movie_rating_path
    else
      @movies = current_user.wants_to_see_movies
    end
  end

end
