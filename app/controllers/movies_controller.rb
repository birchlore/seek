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
    @movie = Movie.find(params[:id])
    if current_user.location
      @users = @movie.users_who_want_to_see.where(location: current_user.location).where.not(id: current_user.id)
    else
      @users = @movie.users_who_want_to_see.where.not(id: current_user.id)
    end
  end

  protected

   def movie_params
    params.require(:movie).permit(
      :title, :description, :embed, :id)
   end


end