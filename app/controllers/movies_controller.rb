class MoviesController < ApplicationController
  before_action :authenticate_user!

  def index
    @movies = Movie.where(status:"current")
    count = @movies.count
    @movie = Movie.find(rand(1..count))
  end

  def create
  end

  def new
  end

  def update
  end

  def edit
  end

  def show
    current_user.analytic.increase_movie_clicks_count
    @movie = Movie.find(params[:id])
    @users = current_user.matches_on_movie(@movie).order("RANDOM()")
  end

  protected

   def movie_params
    params.require(:movie).permit(
      :title, :description, :embed, :id)
   end


end
